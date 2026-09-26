import { actions } from "./actions.js";

export async function runCli(action, params) {
  const handler = actions[action];
  if (!handler) {
    throw new Error(`Unknown action '${action}'`);
  }
  await handler(params);
}
