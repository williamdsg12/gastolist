import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { currentMes, fail, ok } from "../shared";

export default defineTool({
  name: "list_gastos",
  title: "Listar gastos",
  description: "List the signed-in user's expenses (gastos) for a month, optionally filtered by person or category.",
  inputSchema: {
    mes: z.string().optional().describe('Month name in Portuguese, e.g. "Agosto". Defaults to the current month.'),
    responsavel: z.string().optional().describe('Person responsible, e.g. "William" or "Andressa".'),
    categoria: z.string().optional().describe("Expense category filter."),
    limit: z.number().optional().describe("Maximum rows to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ mes, responsavel, categoria, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return fail("Not authenticated");
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("gastos")
      .select("id, data, descricao, valor, categoria, responsavel, pago, mes")
      .eq("mes", mes ?? currentMes())
      .order("data", { ascending: false })
      .limit(Math.min(limit ?? 50, 200));
    if (responsavel) query = query.eq("responsavel", responsavel);
    if (categoria) query = query.eq("categoria", categoria);
    const { data, error } = await query;
    if (error) return fail(error.message);
    const total = (data ?? []).reduce((s, g) => s + Number(g.valor ?? 0), 0);
    return ok({ mes: mes ?? currentMes(), count: data?.length ?? 0, total, gastos: data ?? [] });
  },
});
