import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { currentMes, fail, ok } from "../shared";

export default defineTool({
  name: "list_entradas",
  title: "Listar entradas",
  description: "List the signed-in user's income entries (entradas) for a month with pagination (limite/limit, offset, pagina).",
  inputSchema: {
    mes: z.string().optional().describe('Month name in Portuguese, e.g. "Agosto". Defaults to the current month.'),
    responsavel: z.string().optional().describe("Person responsible filter."),
    limit: z.number().optional().describe("Maximum rows to return (default 10, max 200)."),
    limite: z.number().optional().describe("Maximum rows to return (default 10, max 200). Alias for limit."),
    offset: z.number().optional().describe("Number of rows to skip for pagination (default 0)."),
    pagina: z.number().optional().describe("Page number (1-based). Overrides offset if specified: offset = (pagina - 1) * limit."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ mes, responsavel, limit, limite, offset, pagina }, ctx) => {
    if (!ctx.isAuthenticated()) return fail("Not authenticated");
    const supabase = supabaseForUser(ctx);
    
    const pageSize = Math.min(limite ?? limit ?? 10, 200);
    const pageNum = pagina && pagina > 0 ? pagina : undefined;
    const pageOffset = pageNum ? (pageNum - 1) * pageSize : Math.max(offset ?? 0, 0);
    const currentPage = pageNum ?? Math.floor(pageOffset / pageSize) + 1;

    let query = supabase
      .from("entradas")
      .select("id, data, descricao, valor, categoria, responsavel, mes", { count: "exact" })
      .eq("mes", mes ?? currentMes())
      .order("data", { ascending: false })
      .range(pageOffset, pageOffset + pageSize - 1);

    if (responsavel) query = query.eq("responsavel", responsavel);

    const { data, count, error } = await query;
    if (error) return fail(error.message);

    const totalRecords = count ?? data?.length ?? 0;
    const totalPaginas = Math.ceil(totalRecords / pageSize) || 1;
    const totalValor = (data ?? []).reduce((s, e) => s + Number(e.valor ?? 0), 0);

    return ok({
      mes: mes ?? currentMes(),
      count: data?.length ?? 0,
      total_records: totalRecords,
      pagina: currentPage,
      total_paginas: totalPaginas,
      limite: pageSize,
      offset: pageOffset,
      total: totalValor,
      entradas: data ?? [],
    });
  },
});

