import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { fail, ok } from "../shared";

export default defineTool({
  name: "update_entrada",
  title: "Editar entrada",
  description:
    "Update an existing income entry (entrada) belonging to the signed-in user. Only the provided fields are changed.",
  inputSchema: {
    id: z.string().describe("ID of the income entry to update."),
    descricao: z.string().optional().describe("New description."),
    valor: z.number().optional().describe("New amount in BRL."),
    categoria: z.string().optional().describe("New category."),
    responsavel: z.string().optional().describe('New person responsible, e.g. "William" or "Andressa".'),
    data: z.string().optional().describe("New date as YYYY-MM-DD."),
    mes: z.string().optional().describe("New month name in Portuguese."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, ...fields }, ctx) => {
    if (!ctx.isAuthenticated()) return fail("Not authenticated");
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(patch).length === 0) return fail("Nothing to update: provide at least one field.");

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("entradas")
      .update(patch)
      .eq("id", id)
      .eq("user_id", ctx.getUserId())
      .select()
      .maybeSingle();

    if (error) return fail(error.message);
    if (!data) return fail("Entrada not found for this user.");
    return ok({ entrada: data });
  },
});
