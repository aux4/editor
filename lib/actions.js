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

    const aux4 = {};
    if (triString(params.scope) !== undefined) aux4.scope = params.scope;
    if (triString(params.name) !== undefined) aux4.name = params.name;
    aux4.version = triString(params.version) || "0.1.0";
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
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    addProfile(aux4, params.profile);
    save(filePath, aux4, params);
    console.log(`Profile '${params.profile}' added`);
  },

  profileRemove(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeProfile(aux4, params.profile);
    save(filePath, aux4, params);
    console.log(`Profile '${params.profile}' removed`);
  },

  profileRename(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    renameProfile(aux4, params.profile, params.newName);
    save(filePath, aux4, params);
    console.log(`Profile '${params.profile}' renamed to '${params.newName}'`);
  },

  commandAdd(params) {
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
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    removeCommand(profile, params.name);
    save(filePath, aux4, params);
    console.log(`Command '${params.name}' removed from profile '${profileName}'`);
  },

  commandSet(params) {
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
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    const profileName = triString(params.profile) || "main";
    const profile = requireProfile(aux4, profileName);
    renameCommand(profile, params.name, params.newName);
    save(filePath, aux4, params);
    console.log(`Command '${params.name}' renamed to '${params.newName}' in profile '${profileName}'`);
  },

  variableAdd(params) {
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
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeMetadataField(aux4, params.field);
    save(filePath, aux4, params);
    console.log(`Package field '${params.field}' removed`);
  },

  tagAdd(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    addTag(aux4, params.tag);
    save(filePath, aux4, params);
    console.log(`Tag '${params.tag}' added`);
  },

  tagRemove(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeTag(aux4, params.tag);
    save(filePath, aux4, params);
    console.log(`Tag '${params.tag}' removed`);
  },

  dependencyAdd(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    addDependency(aux4, params.dependency);
    save(filePath, aux4, params);
    console.log(`Dependency '${params.dependency}' added`);
  },

  dependencyRemove(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeDependency(aux4, params.dependency);
    save(filePath, aux4, params);
    console.log(`Dependency '${params.dependency}' removed`);
  },

  systemAdd(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    addSystemGroup(aux4, toLines(params.entries), triString(params.index));
    save(filePath, aux4, params);
    console.log("System dependency group added");
  },

  systemRemove(params) {
    const filePath = withFile(params);
    const aux4 = loadAux4(filePath);
    removeSystemGroup(aux4, params.index);
    save(filePath, aux4, params);
    console.log(`System dependency group at index ${params.index} removed`);
  },

  cloudSet(params) {
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
