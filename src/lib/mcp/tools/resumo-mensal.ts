import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { currentMes, fail, ok } from "../shared";

export default defineTool({
  name: "resumo_mensal",
  title: "Resumo mensal",
  description: "Monthly financial summary for the signed-in user: total income, total expenses, balance, bills paid and pending, and expenses by category.",
  inputSchema: {
    mes: z.string().optional().describe('Month name in Portuguese, e.g. "Agosto". Defaults to the current month.'),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ mes }, ctx) => {
    if (!ctx.isAuthenticated()) return fail("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const target = mes ?? currentMes();

    const [entradas, gastos, contas] = await Promise.all([
      supabase.from("entradas").select("valor, responsavel").eq("mes", target),
      supabase.from("gastos").select("valor, categoria, responsavel").eq("mes", target),
      supabase.from("contas").select("valor, pago").eq("mes", target),
    ]);

    const err = entradas.error || gastos.error || contas.error;
    if (err) return fail(err.message);

    const totalEntradas = (entradas.data ?? []).reduce((s, e) => s + Number(e.valor ?? 0), 0);
    const totalGastos = (gastos.data ?? []).reduce((s, g) => s + Number(g.valor ?? 0), 0);

    const porCategoria: Record<string, number> = {};
    for (const g of gastos.data ?? []) {
      porCategoria[g.categoria] = (porCategoria[g.categoria] ?? 0) + Number(g.valor ?? 0);
    }

    const pagas = (contas.data ?? []).filter((c) => c.pago);
    const pendentes = (contas.data ?? []).filter((c) => !c.pago);

    return ok({
      mes: target,
      moeda: "BRL",
      total_entradas: totalEntradas,
      total_gastos: totalGastos,
      saldo: totalEntradas - totalGastos,
      gastos_por_categoria: porCategoria,
      contas_pagas: pagas.length,
      contas_pendentes: pendentes.length,
      valor_contas_pendentes: pendentes.reduce((s, c) => s + Number(c.valor ?? 0), 0),
    });
  },
});
