import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { currentMes, fail, ok, today } from "../shared";

export default defineTool({
  name: "add_entrada",
  title: "Registrar entrada",
  description: "Record a new income entry (entrada) for the signed-in user.",
  inputSchema: {
    descricao: z.string().describe("Description of the income."),
    valor: z.number().describe("Amount in BRL."),
    categoria: z.string().describe('Category, e.g. "Salário", "Freelance", "Investimentos", "Outros".'),
    responsavel: z.string().describe('Person responsible, e.g. "William" or "Andressa".'),
    data: z.string().optional().describe("Date as YYYY-MM-DD. Defaults to today."),
    mes: z.string().optional().describe("Month name in Portuguese. Defaults to the current month."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return fail("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("entradas")
      .insert({
        user_id: ctx.getUserId(),
        descricao: input.descricao,
        valor: input.valor,
        categoria: input.categoria,
        responsavel: input.responsavel,
        data: input.data ?? today(),
        mes: input.mes ?? currentMes(),
      })
      .select()
      .single();
    if (error) return fail(error.message);
    return ok({ entrada: data });
  },
});
