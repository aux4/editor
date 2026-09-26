import fs from "fs";
import { loadAux4, saveAux4, LintError, formatIssues } from "./aux4File.js";
import {
  findProfile,
  requireProfile,
  addProfile,
  removeProfile,
  renameProfile,
  requireCommand,
  addCommand,
  removeCommand,
  renameCommand,
  setCommand,
  requireVariable,
  addVariable,
  removeVariable,
  renameVariable,
  setVariable,
  addExecuteLine,
  removeExecuteLine,
  setExecuteLine,
  setMetadataField,
  removeMetadataField,
  addTag,
  removeTag,
  addDependency,
  removeDependency,
  addSystemGroup,
  removeSystemGroup
} from "./model.js";

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

export const actions = {
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
  }
};
