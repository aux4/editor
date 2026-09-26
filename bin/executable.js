import { runCli } from "../lib/cli.js";

const args = process.argv.slice(2);
const action = args[0];

let params = {};
if (args[1] !== undefined) {
  try {
    params = JSON.parse(args[1]);
  } catch (e) {
    console.error(`Invalid parameters: ${e.message}`);
    process.exit(1);
  }
}

runCli(action, params)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
