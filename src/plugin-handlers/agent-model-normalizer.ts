/**
 * Normalizes agent model fields from objects to strings.
 *
 * Claude Code plugin agents arrive with model already parsed as
 * { providerID, modelID } objects. OpenCode's agent.ts calls
 * parseModel(value.model) which expects a string. If an object
 * is passed, model.split("/") crashes with "model.split is not a function".
 *
 * This function converts any object model fields back to "provider/model"
 * string format so OpenCode can safely re-parse them.
 */
export function normalizeAgentModelFields(agents: Record<string, unknown>): void {
  for (const agent of Object.values(agents)) {
    if (!agent || typeof agent !== "object") continue
    const record = agent as Record<string, unknown>
    const model = record.model
    if (model && typeof model === "object" && !Array.isArray(model)) {
      const { providerID, modelID } = model as { providerID?: string; modelID?: string }
      if (providerID && modelID) {
        record.model = `${providerID}/${modelID}`
      }
    }
  }
}
