import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(
        JSON.stringify({ error: "Imagem não fornecida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit payload size (~10MB base64)
    if (imageBase64.length > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Imagem muito grande (máx. 10MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em leitura de notas fiscais brasileiras (NFC-e, DANFE, cupom fiscal).
Analise a imagem e extraia com máxima precisão:

- nome_emitente: nome do estabelecimento/loja
- cnpj: CNPJ do emitente (formato XX.XXX.XXX/XXXX-XX)
- data_emissao: data da compra no formato YYYY-MM-DD
- numero: número da nota fiscal (se visível)
- produtos: array de objetos com:
  - nome_produto: nome do produto exatamente como aparece
  - quantidade: quantidade numérica
  - valor_unitario: valor unitário numérico (sem R$)
  - valor_total: valor total do item numérico (sem R$)
  - unidade: unidade de medida (kg, g, un, lt, ml, pct, cx, dz)
  - status: "confirmado" se dados claros, "verificar" se houver dúvida na leitura

REGRAS:
- Extraia TODOS os produtos listados
- Valores devem ser números decimais (ex: 12.50, não 12,50)
- Se não conseguir ler um campo claramente, marque status como "verificar"
- Não invente dados - se não conseguir ler, deixe o campo vazio ou marque como verificar
- Para quantidades fracionárias (ex: 0,500 kg), converta para número decimal

Responda APENAS em JSON válido, sem markdown, no formato:
{
  "nome_emitente": "...",
  "cnpj": "...",
  "data_emissao": "YYYY-MM-DD",
  "numero": "...",
  "produtos": [
    {
      "nome_produto": "...",
      "quantidade": 0,
      "valor_unitario": 0.00,
      "valor_total": 0.00,
      "unidade": "un",
      "status": "confirmado"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analise esta nota fiscal brasileira e extraia todos os dados solicitados com precisão." },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos na sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "Erro ao processar nota fiscal" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsedData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response");
      return new Response(
        JSON.stringify({ error: "Não foi possível extrair dados da nota fiscal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("parse-invoice error:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar requisição" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
