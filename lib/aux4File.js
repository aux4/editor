import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";

export class LintError extends Error {
  constructor(issues) {
    super("Lint validation failed");
    this.issues = issues;
  }
}

export function loadAux4(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File '${filePath}' not found`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`File '${filePath}' is not valid JSON: ${e.message}`);
  }
}

export function saveAux4(filePath, data, { noLint = false } = {}) {
  const json = JSON.stringify(data, null, 2) + "\n";

  if (noLint) {
    writeFileAtomic(filePath, json);
    return;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aux4-editor-"));

  try {
    fs.writeFileSync(path.join(tmpDir, ".aux4"), json, "utf-8");

    const issues = runLint(tmpDir);
    const errors = issues.filter(issue => issue.severity === "error");

    if (errors.length > 0) {
      throw new LintError(errors);
    }

    writeFileAtomic(filePath, json);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// Writes the final, real file atomically: the content is written to a temp
// file in the SAME directory as the target (so the rename is on the same
// filesystem and therefore atomic), then swapped into place with a rename.
// This means a crash or kill mid-write can never leave the real file
// truncated or half-written — it's either the old content or the new one.
export function writeFileAtomic(filePath, content) {
  const dir = path.dirname(path.resolve(filePath));
  const tmpFile = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(tmpFile, content, "utf-8");
  fs.renameSync(tmpFile, filePath);
}

export function runLint(tmpDir) {
  let output;

  try {
    output = execFileSync(
      "aux4",
      ["lint", "run", "--dir", tmpDir, "--format", "json", "--strict", "false", "--resolve", "false"],
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );
  } catch (err) {
    output = err.stdout;
    if (!output) {
      throw new Error(`Failed to run aux4/lint: ${err.message}`);
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (e) {
    throw new Error(`Failed to parse aux4/lint output: ${e.message}\n${output}`);
  }

  const results = Array.isArray(parsed) ? parsed : parsed.results || [];
  const issues = [];
  for (const result of results) {
    for (const issue of result.issues || []) {
      issues.push(issue);
    }
  }
  return issues;
}

export function formatIssues(issues) {
  return issues
    .map(issue => `${(issue.severity || "error").toUpperCase()}  [${issue.rule}] ${issue.message}`)
    .join("\n");
}
