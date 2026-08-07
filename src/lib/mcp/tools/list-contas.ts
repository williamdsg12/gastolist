import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { currentMes, fail, ok } from "../shared";

export default defineTool({
  name: "list_contas",
  title: "Listar contas",
  description: "List the signed-in user's bills (contas) for a month, with paid/pending status.",
  inputSchema: {
    mes: z.string().optional().describe("Month name in Portuguese. Defaults to the current month."),
    apenas_pendentes: z.boolean().optional().describe("Return only unpaid bills."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ mes, apenas_pendentes }, ctx) => {
    if (!ctx.isAuthenticated()) return fail("Not authenticated");
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("contas")
      .select("id, conta, valor, vencimento, pago, data_pagamento, responsavel, mes")
      .eq("mes", mes ?? currentMes())
      .order("vencimento", { ascending: true });
    if (apenas_pendentes) query = query.eq("pago", false);
    const { data, error } = await query;
    if (error) return fail(error.message);
    const total = (data ?? []).reduce((s, c) => s + Number(c.valor ?? 0), 0);
    const pendente = (data ?? []).filter((c) => !c.pago).reduce((s, c) => s + Number(c.valor ?? 0), 0);
    return ok({ mes: mes ?? currentMes(), count: data?.length ?? 0, total, total_pendente: pendente, contas: data ?? [] });
  },
});
