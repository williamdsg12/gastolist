import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { fail, ok } from "../shared";

export default defineTool({
  name: "delete_gasto",
  title: "Excluir gasto",
  description: "Permanently delete an expense (gasto) belonging to the signed-in user.",
  inputSchema: {
    id: z.string().describe("ID of the expense to delete."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return fail("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("gastos")
      .delete()
      .eq("id", id)
      .eq("user_id", ctx.getUserId())
      .select()
      .maybeSingle();

    if (error) return fail(error.message);
    if (!data) return fail("Gasto not found for this user.");
    return ok({ deleted: true, gasto: data });
  },
});
