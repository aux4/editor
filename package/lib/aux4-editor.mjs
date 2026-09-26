import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import os from 'os';

class LintError extends Error {
  constructor(issues) {
    super("Lint validation failed");
    this.issues = issues;
  }
}

function loadAux4(filePath) {
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

function saveAux4(filePath, data, { noLint = false } = {}) {
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
function writeFileAtomic(filePath, content) {
  const dir = path.dirname(path.resolve(filePath));
  const tmpFile = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(tmpFile, content, "utf-8");
  fs.renameSync(tmpFile, filePath);
}

function runLint(tmpDir) {
  let output;

  try {
    output = execFileSync(
      "aux4",
      ["lint", "run", "--dir", tmpDir, "--format", "json", "--strict", "false", "--resolve", "false"],
      { encoding: "utf-8" }
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

function formatIssues(issues) {
  return issues
    .map(issue => `${(issue.severity || "error").toUpperCase()}  [${issue.rule}] ${issue.message}`)
    .join("\n");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceSegment(token, oldName, newName) {
  if (token === oldName) return newName;
  if (token.startsWith(`${oldName}.`)) return newName + token.slice(oldName.length);
  return token;
}

// Rewrites references to `oldName` in a single execute line to `newName`.
// Matches ${oldName}, ${oldName.field}, $oldName (bare, not followed by a word
// char), and the identifier inside value()/values()/param()/params()/object()
// calls. Does NOT match identifiers that merely contain oldName as a substring
// (e.g. renaming "name" never touches "$nameX" or "${firstName}").
function renameIdentifierInLine(line, oldName, newName) {
  const esc = escapeRegex(oldName);
  let result = line;

  result = result.replace(new RegExp(`\\$\\{${esc}(?=[}.])`, "g"), `\${${newName}`);
  result = result.replace(new RegExp(`\\$${esc}(?![\\w.])`, "g"), `$${newName}`);

  result = result.replace(/\b(value|values|param|params|object)\(([^)]*)\)/g, (match, fn, args) => {
    const rewritten = args
      .split(",")
      .map(part => {
        const trimmed = part.trim();
        const leadWs = part.slice(0, part.length - part.trimStart().length);
        const trailWs = part.slice(part.trimEnd().length);

        if (trimmed.includes(":")) {
          const [a, b] = trimmed.split(":");
          return `${leadWs}${replaceSegment(a, oldName, newName)}:${replaceSegment(b, oldName, newName)}${trailWs}`;
        }

        return `${leadWs}${replaceSegment(trimmed, oldName, newName)}${trailWs}`;
      })
      .join(",");
    return `${fn}(${rewritten})`;
  });

  return result;
}

function getProfiles(aux4) {
  if (!aux4.profiles) aux4.profiles = [];
  return aux4.profiles;
}

function findProfile(aux4, name) {
  return getProfiles(aux4).find(p => p.name === name);
}

function requireProfile(aux4, name) {
  const profile = findProfile(aux4, name);
  if (!profile) throw new Error(`Profile '${name}' not found`);
  return profile;
}

function addProfile(aux4, name) {
  if (findProfile(aux4, name)) throw new Error(`Profile '${name}' already exists`);
  const profile = { name, commands: [] };
  getProfiles(aux4).push(profile);
  return profile;
}

function removeProfile(aux4, name) {
  const profiles = getProfiles(aux4);
  const index = profiles.findIndex(p => p.name === name);
  if (index === -1) throw new Error(`Profile '${name}' not found`);
  profiles.splice(index, 1);
}

function renameProfile(aux4, name, newName) {
  requireProfile(aux4, name);
  if (findProfile(aux4, newName)) throw new Error(`Profile '${newName}' already exists`);

  const profiles = getProfiles(aux4);
  const affected = profiles.filter(p => p.name === name || p.name.startsWith(`${name}:`));
  const renameMap = new Map();
  for (const p of affected) {
    const suffix = p.name.slice(name.length);
    renameMap.set(p.name, `${newName}${suffix}`);
  }

  for (const p of affected) {
    p.name = renameMap.get(p.name);
  }

  for (const p of profiles) {
    for (const command of p.commands || []) {
      if (!command.execute) continue;
      command.execute = command.execute.map(line => {
        const match = /^profile:(.+)$/.exec(line.trim());
        if (!match) return line;
        const target = match[1];
        return renameMap.has(target) ? line.replace(target, renameMap.get(target)) : line;
      });
    }
  }
}

function findCommand(profile, name) {
  return (profile.commands || []).find(c => c.name === name);
}

function requireCommand(profile, name) {
  const command = findCommand(profile, name);
  if (!command) throw new Error(`Command '${name}' not found in profile '${profile.name}'`);
  return command;
}

function addCommand(profile, name, { execute, help } = {}) {
  if (!profile.commands) profile.commands = [];
  if (findCommand(profile, name)) throw new Error(`Command '${name}' already exists in profile '${profile.name}'`);
  const command = {
    name,
    execute: execute && execute.length ? execute : ["true"],
    help: { text: help || "" }
  };
  profile.commands.push(command);
  return command;
}

function removeCommand(profile, name) {
  const commands = profile.commands || [];
  const index = commands.findIndex(c => c.name === name);
  if (index === -1) throw new Error(`Command '${name}' not found in profile '${profile.name}'`);
  commands.splice(index, 1);
}

function renameCommand(profile, name, newName) {
  const command = requireCommand(profile, name);
  if (findCommand(profile, newName)) throw new Error(`Command '${newName}' already exists in profile '${profile.name}'`);
  command.name = newName;
}

function setCommand(command, { execute, help }) {
  if (execute !== undefined && execute.length > 0) command.execute = execute;
  if (help !== undefined && help !== "") {
    if (!command.help) command.help = {};
    command.help.text = help;
  }
}

function findVariable(command, name) {
  const variables = command.help && command.help.variables;
  return variables && variables.find(v => v.name === name);
}

function requireVariable(command, name) {
  const variable = findVariable(command, name);
  if (!variable) throw new Error(`Variable '${name}' not found in command '${command.name}'`);
  return variable;
}

function addVariable(command, name, props = {}) {
  if (!command.help) command.help = { text: "" };
  if (!command.help.variables) command.help.variables = [];
  if (findVariable(command, name)) throw new Error(`Variable '${name}' already exists in command '${command.name}'`);
  const variable = { name, ...props };
  command.help.variables.push(variable);
  return variable;
}

function removeVariable(command, name) {
  const variables = command.help && command.help.variables;
  if (!variables) throw new Error(`Variable '${name}' not found in command '${command.name}'`);
  const index = variables.findIndex(v => v.name === name);
  if (index === -1) throw new Error(`Variable '${name}' not found in command '${command.name}'`);
  variables.splice(index, 1);
}

function renameVariable(command, name, newName) {
  const variable = requireVariable(command, name);
  if (findVariable(command, newName)) throw new Error(`Variable '${newName}' already exists in command '${command.name}'`);
  variable.name = newName;

  if (command.execute) {
    command.execute = command.execute.map(line => renameIdentifierInLine(line, name, newName));
  }
}

function setVariable(command, name, props = {}) {
  const variable = requireVariable(command, name);
  Object.assign(variable, props);
  for (const key of Object.keys(props)) {
    if (props[key] === undefined) delete variable[key];
  }
  return variable;
}

function addExecuteLine(command, line, index) {
  if (!command.execute) command.execute = [];
  if (index === undefined || index === null || index === "") {
    command.execute.push(line);
  } else {
    const i = Number(index);
    if (Number.isNaN(i) || i < 0 || i > command.execute.length) {
      throw new Error(`Execute index ${index} out of range for command '${command.name}' (0-${command.execute.length})`);
    }
    command.execute.splice(i, 0, line);
  }
}

function removeExecuteLine(command, index) {
  if (!command.execute || command.execute.length === 0) throw new Error(`Command '${command.name}' has no execute lines`);
  const i = Number(index);
  if (Number.isNaN(i) || i < 0 || i >= command.execute.length) {
    throw new Error(`Execute index ${index} out of range for command '${command.name}' (0-${command.execute.length - 1})`);
  }
  command.execute.splice(i, 1);
}

function setExecuteLine(command, index, line) {
  if (!command.execute || command.execute.length === 0) throw new Error(`Command '${command.name}' has no execute lines`);
  const i = Number(index);
  if (Number.isNaN(i) || i < 0 || i >= command.execute.length) {
    throw new Error(`Execute index ${index} out of range for command '${command.name}' (0-${command.execute.length - 1})`);
  }
  command.execute[i] = line;
}

// Top-level package metadata fields (aux4/lint's VALID_METADATA_FIELDS, plus
// non-standard-but-real fields like 'private', 'repository' and 'cloud'
// that appear across published packages).
const SCALAR_METADATA_FIELDS = [
  "scope", "name", "version", "description", "license", "git", "website",
  "repository", "private", "type", "cloud"
];

function setMetadataField(aux4, field, value) {
  if (!SCALAR_METADATA_FIELDS.includes(field)) {
    throw new Error(`Unsupported metadata field '${field}'. Supported fields: ${SCALAR_METADATA_FIELDS.join(", ")}`);
  }
  aux4[field] = value;
}

function removeMetadataField(aux4, field) {
  if (!(field in aux4)) throw new Error(`Metadata field '${field}' is not set`);
  delete aux4[field];
}

function addTag(aux4, tag) {
  if (!aux4.tags) aux4.tags = [];
  if (aux4.tags.includes(tag)) throw new Error(`Tag '${tag}' already exists`);
  aux4.tags.push(tag);
}

function removeTag(aux4, tag) {
  if (!aux4.tags || !aux4.tags.includes(tag)) throw new Error(`Tag '${tag}' not found`);
  aux4.tags = aux4.tags.filter(t => t !== tag);
}

function dependencyKey(dep) {
  return dep.split("@")[0];
}

function addDependency(aux4, dependency) {
  if (!aux4.dependencies) aux4.dependencies = [];
  const key = dependencyKey(dependency);
  if (aux4.dependencies.some(d => dependencyKey(d) === key)) {
    throw new Error(`Dependency '${key}' already exists`);
  }
  aux4.dependencies.push(dependency);
}

function removeDependency(aux4, dependency) {
  const key = dependencyKey(dependency);
  if (!aux4.dependencies || !aux4.dependencies.some(d => dependencyKey(d) === key)) {
    throw new Error(`Dependency '${key}' not found`);
  }
  aux4.dependencies = aux4.dependencies.filter(d => dependencyKey(d) !== key);
}

function addSystemGroup(aux4, entries, index) {
  if (!aux4.system) aux4.system = [];
  if (index === undefined || index === null || index === "") {
    aux4.system.push(entries);
  } else {
    const i = Number(index);
    if (Number.isNaN(i) || i < 0 || i > aux4.system.length) {
      throw new Error(`System group index ${index} out of range (0-${aux4.system.length})`);
    }
    aux4.system.splice(i, 0, entries);
  }
}

function removeSystemGroup(aux4, index) {
  if (!aux4.system || aux4.system.length === 0) throw new Error("No 'system' groups defined");
  const i = Number(index);
  if (Number.isNaN(i) || i < 0 || i >= aux4.system.length) {
    throw new Error(`System group index ${index} out of range (0-${aux4.system.length - 1})`);
  }
  aux4.system.splice(i, 1);
}

// tri-state boolean: "" (unset/unchanged) -> undefined, "true" -> true, "false" -> false
function triBool(value) {
  if (value === undefined || value === null || value === "") return undefined;
  return value === true || value === "true";
}

function triString(value) {
  if (value === undefined || value === null || value === "") return undefined;
  return value;
}

function triArray(value) {
  if (value === undefined || value === null) return undefined;
  const arr = Array.isArray(value) ? value : [value];
  const filtered = arr.filter(v => v !== undefined && v !== null && v !== "");
  return filtered.length ? filtered : undefined;
}

function toLines(value) {
  if (value === undefined || value === null) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.filter(v => v !== undefined && v !== null && v !== "");
}

function noLintFlag(params) {
  return params.noLint === true || params.noLint === "true";
}

// Values that must never be accepted as a "real" required value. aux4 core
// stringifies an unresolved variable with no default (e.g. a mistyped flag
// name in a non-interactive shell) as the literal text "undefined", so a
// naive `!== undefined` check lets garbage straight through to disk.
const RESERVED_VALUES = new Set(["undefined", "null"]);

function isBlank(value) {
  return value === undefined || value === null || value === "" || RESERVED_VALUES.has(value);
}

// Validates a required flag before any mutation happens. Throws (and leaves
// the file untouched) when the flag is missing, empty, or the literal string
// "undefined"/"null" that aux4 core can produce for an unresolved variable.
function requireParam(value, flagName) {
  if (isBlank(value)) {
    throw new Error(`--${flagName} is required`);
  }
  return value;
}

// Same as requireParam, but for a repeatable/array flag: requires at least
// one non-blank entry.
function requireEntries(value, flagName) {
  const lines = toLines(value).filter(v => !isBlank(v));
  if (lines.length === 0) {
    throw new Error(`--${flagName} is required`);
  }
  return lines;
}

function withFile(params) {
  return params.file && params.file !== "" ? params.file : ".aux4";
}

// Fallback map from aux4/license 'name' to the proper SPDX identifier, used
// only if 'aux4 aux4 license info --json true' doesn't return a 'spdxId'
// field (it does today, but this keeps licenseSet from writing a lowercase,
// non-SPDX value if that ever changes).
const SPDX_ID_FALLBACK = {
  "0bsd": "0BSD",
  "apache-2.0": "Apache-2.0",
  "mit": "MIT",
  "mit-0": "MIT-0",
  "isc": "ISC",
  "bsd-2-clause": "BSD-2-Clause",
  "bsd-3-clause": "BSD-3-Clause",
  "gpl-2.0": "GPL-2.0-only",
  "gpl-3.0": "GPL-3.0-only",
  "lgpl-2.1": "LGPL-2.1-only",
  "lgpl-3.0": "LGPL-3.0-only",
  "agpl-3.0": "AGPL-3.0-only",
  "mpl-2.0": "MPL-2.0",
  "unlicense": "Unlicense"
};

function resolveSpdxId(name) {
  const output = execFileSync("aux4", ["aux4", "license", "info", "--name", name, "--json", "true"], {
    encoding: "utf-8"
  });
  const info = JSON.parse(output);
  return info.spdxId || SPDX_ID_FALLBACK[name] || name;
}

// Restores the LICENSE file to its pre-licenseSet state: puts back the
// original content if one existed, or removes the file if licenseSet
// created it. Used to keep licenseSet atomic across the two files it
// touches (LICENSE + .aux4) when the later lint-gated save fails.
function restoreLicenseFile(licensePath, hadLicense, previousContent) {
  if (hadLicense) {
    fs.writeFileSync(licensePath, previousContent, "utf-8");
  } else if (fs.existsSync(licensePath)) {
    fs.unlinkSync(licensePath);
  }
}

function save(filePath, aux4, params) {
  try {
    saveAux4(filePath, aux4, { noLint: noLintFlag(params) });
  } catch (e) {
    if (e instanceof LintError) {
      console.error(`aux4/lint rejected the change to '${filePath}':`);
      console.error(formatIssues(e.issues));
      throw new Error(`Lint validation failed with ${e.issues.length} error(s). File left untouched.`);
    }
    throw e;
  }
}

function buildVariableProps(params) {
  const props = {};
  const text = triString(params.text);
  if (text !== undefined) props.text = text;

  const def = triString(params.default);
  if (def !== undefined) props.default = def;

  const arg = triBool(params.arg);
  if (arg !== undefined) props.arg = arg;

  const multiple = triBool(params.multiple);
  if (multiple !== undefined) props.multiple = multiple;

  const env = triString(params.env);
  if (env !== undefined) props.env = env;

  const options = triArray(params.options);
  if (options !== undefined) props.options = options;

  const hide = triBool(params.hide);
  if (hide !== undefined) props.hide = hide;

  const encrypt = triBool(params.encrypt);
  if (encrypt !== undefined) props.encrypt = encrypt;

  return props;
}

const actions = {
  init(params) {
    const filePath = withFile(params);
    if (fs.existsSync(filePath)) {
      throw new Error(`File '${filePath}' already exists`);
    }

    const scope = triString(params.scope);
    const name = triString(params.name);
    const version = triString(params.version);

    const aux4 = {};
    if (scope !== undefined) aux4.scope = scope;
    if (name !== undefined) aux4.name = name;
    // aux4/lint requires 'version' once 'scope' or 'name' is present (a package),
    // but a plain local .aux4 file (neither scope nor name) must not get one invented
    // — that would in turn make 'scope'/'name' required, breaking a non-package file.
    if (version !== undefined) {
      aux4.version = version;
    } else if (scope !== undefined || name !== undefined) {
      aux4.version = "0.1.0";
    }
    if (triString(params.description) !== undefined) aux4.description = params.description;
    aux4.profiles = [
      {
        name: "main",
        commands: []
      }
    ];

    save(filePath, aux4, params);
    console.log(`Created '${filePath}'`);
  },

  show(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);

    if (triString(params.command) !== undefined) {
      const profileName = triString(params.profile) || "main";
      const profile = requireProfile(aux4, profileName);
      const command = requireCommand(profile, params.command);
      console.log(JSON.stringify(command, null, 2));
      return;
    }

    if (triString(params.profile) !== undefined) {
      const profile = requireProfile(aux4, params.profile);
      console.log(JSON.stringify(profile, null, 2));
      return;
    }

    console.log(JSON.stringify(aux4, null, 2));
  },

  profileAdd(params) {
    requireParam(params.profile, "profile");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    addProfile(aux4, params.profile);
    save(filePath, aux4, params);
    console.log(`Profile '${params.profile}' added`);
  },

  profileRemove(params) {
    requireParam(params.profile, "profile");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeProfile(aux4, params.profile);
    save(filePath, aux4, params);
    console.log(`Profile '${params.profile}' removed`);
  },

  profileRename(params) {
    requireParam(params.profile, "profile");
    requireParam(params.to, "to");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    renameProfile(aux4, params.profile, params.to);
    save(filePath, aux4, params);
    console.log(`Profile '${params.profile}' renamed to '${params.to}'`);
  },

  commandAdd(params) {
    requireParam(params.name, "name");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    addCommand(profile, params.name, {
      execute: toLines(params.execute),
      help: triString(params.helpText)
    });
    save(filePath, aux4, params);
    console.log(`Command '${params.name}' added to profile '${profileName}'`);
  },

  commandRemove(params) {
    requireParam(params.name, "name");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    removeCommand(profile, params.name);
    save(filePath, aux4, params);
    console.log(`Command '${params.name}' removed from profile '${profileName}'`);
  },

  commandSet(params) {
    requireParam(params.name, "name");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    const command = requireCommand(profile, params.name);
    setCommand(command, {
      execute: toLines(params.execute),
      help: triString(params.helpText)
    });
    save(filePath, aux4, params);
    console.log(`Command '${params.name}' updated in profile '${profileName}'`);
  },

  commandRename(params) {
    requireParam(params.name, "name");
    requireParam(params.to, "to");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    renameCommand(profile, params.name, params.to);
    save(filePath, aux4, params);
    console.log(`Command '${params.name}' renamed to '${params.to}' in profile '${profileName}'`);
  },

  variableAdd(params) {
    requireParam(params.command, "command");
    requireParam(params.name, "name");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    const command = requireCommand(profile, params.command);
    const props = buildVariableProps(params);
    addVariable(command, params.name, props);
    save(filePath, aux4, params);
    console.log(`Variable '${params.name}' added to command '${params.command}' in profile '${profileName}'`);
  },

  variableRemove(params) {
    requireParam(params.command, "command");
    requireParam(params.name, "name");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    const command = requireCommand(profile, params.command);
    removeVariable(command, params.name);
    save(filePath, aux4, params);
    console.log(`Variable '${params.name}' removed from command '${params.command}' in profile '${profileName}'`);
  },

  variableSet(params) {
    requireParam(params.command, "command");
    requireParam(params.name, "name");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    const command = requireCommand(profile, params.command);
    requireVariable(command, params.name);
    const props = buildVariableProps(params);
    setVariable(command, params.name, props);
    save(filePath, aux4, params);
    console.log(`Variable '${params.name}' updated on command '${params.command}' in profile '${profileName}'`);
  },

  variableRename(params) {
    requireParam(params.command, "command");
    requireParam(params.name, "name");
    requireParam(params.to, "to");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    const command = requireCommand(profile, params.command);
    renameVariable(command, params.name, params.to);
    save(filePath, aux4, params);
    console.log(`Variable '${params.name}' renamed to '${params.to}' on command '${params.command}' in profile '${profileName}'`);
  },

  executeAdd(params) {
    requireParam(params.command, "command");
    requireParam(params.line, "line");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    const command = requireCommand(profile, params.command);
    addExecuteLine(command, params.line, triString(params.index));
    save(filePath, aux4, params);
    console.log(`Execute line added to command '${params.command}' in profile '${profileName}'`);
  },

  executeRemove(params) {
    requireParam(params.command, "command");
    requireParam(params.index, "index");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    const command = requireCommand(profile, params.command);
    removeExecuteLine(command, params.index);
    save(filePath, aux4, params);
    console.log(`Execute line at index ${params.index} removed from command '${params.command}' in profile '${profileName}'`);
  },

  executeSet(params) {
    requireParam(params.command, "command");
    requireParam(params.index, "index");
    requireParam(params.line, "line");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    const command = requireCommand(profile, params.command);
    setExecuteLine(command, params.index, params.line);
    save(filePath, aux4, params);
    console.log(`Execute line at index ${params.index} updated on command '${params.command}' in profile '${profileName}'`);
  },

  packageSet(params) {
    requireParam(params.field, "field");
    requireParam(params.value, "value");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const value = triString(params.json) === "true" || params.json === true
      ? JSON.parse(params.value)
      : params.value;
    setMetadataField(aux4, params.field, value);
    save(filePath, aux4, params);
    console.log(`Package field '${params.field}' set`);
  },

  packageRemove(params) {
    requireParam(params.field, "field");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeMetadataField(aux4, params.field);
    save(filePath, aux4, params);
    console.log(`Package field '${params.field}' removed`);
  },

  tagAdd(params) {
    requireParam(params.tag, "tag");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    addTag(aux4, params.tag);
    save(filePath, aux4, params);
    console.log(`Tag '${params.tag}' added`);
  },

  tagRemove(params) {
    requireParam(params.tag, "tag");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeTag(aux4, params.tag);
    save(filePath, aux4, params);
    console.log(`Tag '${params.tag}' removed`);
  },

  dependencyAdd(params) {
    requireParam(params.dependency, "dependency");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    addDependency(aux4, params.dependency);
    save(filePath, aux4, params);
    console.log(`Dependency '${params.dependency}' added`);
  },

  dependencyRemove(params) {
    requireParam(params.dependency, "dependency");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeDependency(aux4, params.dependency);
    save(filePath, aux4, params);
    console.log(`Dependency '${params.dependency}' removed`);
  },

  systemAdd(params) {
    const entries = requireEntries(params.entries, "entries");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    addSystemGroup(aux4, entries, triString(params.index));
    save(filePath, aux4, params);
    console.log("System dependency group added");
  },

  systemRemove(params) {
    requireParam(params.index, "index");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeSystemGroup(aux4, params.index);
    save(filePath, aux4, params);
    console.log(`System dependency group at index ${params.index} removed`);
  },

  cloudSet(params) {
    requireParam(params.value, "value");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    setMetadataField(aux4, "type", "cloud");
    setMetadataField(aux4, "cloud", JSON.parse(params.value));
    save(filePath, aux4, params);
    console.log("Cloud configuration set");
  },

  cloudRemove(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeMetadataField(aux4, "cloud");
    if (aux4.type === "cloud") removeMetadataField(aux4, "type");
    save(filePath, aux4, params);
    console.log("Cloud configuration removed");
  },

  licenseSet(params) {
    requireParam(params.name, "name");
    requireParam(params.owner, "owner");
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);

    const project = triString(aux4.name);
    if (project === undefined) {
      throw new Error(`'${filePath}' has no 'name' field; cannot determine --project for the license`);
    }

    const dir = path.dirname(path.resolve(filePath));
    const year = triString(params.year) || String(new Date().getFullYear());
    const licensePath = path.join(dir, "LICENSE");
    const hadLicense = fs.existsSync(licensePath);
    const previousContent = hadLicense ? fs.readFileSync(licensePath, "utf-8") : null;

    execFileSync(
      "aux4",
      ["aux4", "license", "use", "--name", params.name, "--project", project, "--owner", params.owner, "--year", year],
      { cwd: dir, encoding: "utf-8" }
    );

    let spdxId;
    try {
      spdxId = resolveSpdxId(params.name);
    } catch (e) {
      restoreLicenseFile(licensePath, hadLicense, previousContent);
      throw new Error(`Failed to resolve the SPDX identifier for license '${params.name}': ${e.message}`);
    }

    try {
      setMetadataField(aux4, "license", spdxId);
      save(filePath, aux4, params);
    } catch (e) {
      restoreLicenseFile(licensePath, hadLicense, previousContent);
      throw e;
    }

    console.log(`License '${spdxId}' set. LICENSE written to '${licensePath}'`);
  },

  licenseList(params) {
    const args = ["aux4", "license", "list"];
    const name = triString(params.name);
    if (name !== undefined) args.push("--name", name);
    const output = execFileSync("aux4", args, { encoding: "utf-8" });
    process.stdout.write(output);
  },

  build(params) {
    const filePath = withFile(params);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File '${filePath}' not found`);
    }
    const dir = path.dirname(path.resolve(filePath));
    const out = triString(params.out) || ".";

    const issues = runLint(dir);
    const errors = issues.filter(issue => issue.severity === "error");
    if (errors.length > 0) {
      console.error(`aux4/lint rejected '${dir}':`);
      console.error(formatIssues(errors));
      throw new Error(`Lint validation failed with ${errors.length} error(s). Build aborted.`);
    }

    const outDir = path.resolve(dir, out);
    if (outDir === dir) {
      // Guard against the recursive-zip trap: if the output directory is the
      // package directory itself, an old zip left over from a previous build
      // would get swept into the new archive, growing it on every build.
      for (const entry of fs.readdirSync(dir)) {
        if (entry.endsWith(".zip")) {
          fs.unlinkSync(path.join(dir, entry));
        }
      }
    }

    const output = execFileSync("aux4", ["aux4", "pkger", "build", ".", "--out", out], { cwd: dir, encoding: "utf-8" });
    process.stdout.write(output);
  }
};

async function runCli(action, params) {
  const handler = actions[action];
  if (!handler) {
    throw new Error(`Unknown action '${action}'`);
  }
  await handler(params);
}

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
