import { auth, defineMcp } from "@lovable.dev/mcp-js";
import addEntradaTool from "./tools/add-entrada";
import addGastoTool from "./tools/add-gasto";
import deleteEntradaTool from "./tools/delete-entrada";
import deleteGastoTool from "./tools/delete-gasto";
import listContasTool from "./tools/list-contas";
import listEntradasTool from "./tools/list-entradas";
import listGastosTool from "./tools/list-gastos";
import resumoMensalTool from "./tools/resumo-mensal";
import updateEntradaTool from "./tools/update-entrada";
import updateGastoTool from "./tools/update-gasto";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "family-finances",
  title: "Family Finances",
  version: "0.1.0",
  instructions:
    "Tools for the Family Finances app (Portuguese/BRL). Read and record the signed-in user's income (entradas), expenses (gastos) and bills (contas), and get a monthly summary. Months are Portuguese names such as 'Agosto'.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    resumoMensalTool,
    listGastosTool,
    addGastoTool,
    listEntradasTool,
    addEntradaTool,
    listContasTool,
  ],
});
