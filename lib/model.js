import { renameIdentifierInLine } from "./identifiers.js";

export function getProfiles(aux4) {
  if (!aux4.profiles) aux4.profiles = [];
  return aux4.profiles;
}

export function findProfile(aux4, name) {
  return getProfiles(aux4).find(p => p.name === name);
}

export function requireProfile(aux4, name) {
  const profile = findProfile(aux4, name);
  if (!profile) throw new Error(`Profile '${name}' not found`);
  return profile;
}

export function addProfile(aux4, name) {
  if (findProfile(aux4, name)) throw new Error(`Profile '${name}' already exists`);
  const profile = { name, commands: [] };
  getProfiles(aux4).push(profile);
  return profile;
}

export function removeProfile(aux4, name) {
  const profiles = getProfiles(aux4);
  const index = profiles.findIndex(p => p.name === name);
  if (index === -1) throw new Error(`Profile '${name}' not found`);
  profiles.splice(index, 1);
}

export function renameProfile(aux4, name, newName) {
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

export function findCommand(profile, name) {
  return (profile.commands || []).find(c => c.name === name);
}

export function requireCommand(profile, name) {
  const command = findCommand(profile, name);
  if (!command) throw new Error(`Command '${name}' not found in profile '${profile.name}'`);
  return command;
}

export function addCommand(profile, name, { execute, help } = {}) {
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

export function removeCommand(profile, name) {
  const commands = profile.commands || [];
  const index = commands.findIndex(c => c.name === name);
  if (index === -1) throw new Error(`Command '${name}' not found in profile '${profile.name}'`);
  commands.splice(index, 1);
}

export function renameCommand(profile, name, newName) {
  const command = requireCommand(profile, name);
  if (findCommand(profile, newName)) throw new Error(`Command '${newName}' already exists in profile '${profile.name}'`);
  command.name = newName;
}

export function setCommand(command, { execute, help }) {
  if (execute !== undefined && execute.length > 0) command.execute = execute;
  if (help !== undefined && help !== "") {
    if (!command.help) command.help = {};
    command.help.text = help;
  }
}

export function findVariable(command, name) {
  const variables = command.help && command.help.variables;
  return variables && variables.find(v => v.name === name);
}

export function requireVariable(command, name) {
  const variable = findVariable(command, name);
  if (!variable) throw new Error(`Variable '${name}' not found in command '${command.name}'`);
  return variable;
}

export function addVariable(command, name, props = {}) {
  if (!command.help) command.help = { text: "" };
  if (!command.help.variables) command.help.variables = [];
  if (findVariable(command, name)) throw new Error(`Variable '${name}' already exists in command '${command.name}'`);
  const variable = { name, ...props };
  command.help.variables.push(variable);
  return variable;
}

export function removeVariable(command, name) {
  const variables = command.help && command.help.variables;
  if (!variables) throw new Error(`Variable '${name}' not found in command '${command.name}'`);
  const index = variables.findIndex(v => v.name === name);
  if (index === -1) throw new Error(`Variable '${name}' not found in command '${command.name}'`);
  variables.splice(index, 1);
}

export function renameVariable(command, name, newName) {
  const variable = requireVariable(command, name);
  if (findVariable(command, newName)) throw new Error(`Variable '${newName}' already exists in command '${command.name}'`);
  variable.name = newName;

  if (command.execute) {
    command.execute = command.execute.map(line => renameIdentifierInLine(line, name, newName));
  }
}

export function setVariable(command, name, props = {}) {
  const variable = requireVariable(command, name);
  Object.assign(variable, props);
  for (const key of Object.keys(props)) {
    if (props[key] === undefined) delete variable[key];
  }
  return variable;
}

export function addExecuteLine(command, line, index) {
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

export function removeExecuteLine(command, index) {
  if (!command.execute || command.execute.length === 0) throw new Error(`Command '${command.name}' has no execute lines`);
  const i = Number(index);
  if (Number.isNaN(i) || i < 0 || i >= command.execute.length) {
    throw new Error(`Execute index ${index} out of range for command '${command.name}' (0-${command.execute.length - 1})`);
  }
  command.execute.splice(i, 1);
}

export function setExecuteLine(command, index, line) {
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

export function setMetadataField(aux4, field, value) {
  if (!SCALAR_METADATA_FIELDS.includes(field)) {
    throw new Error(`Unsupported metadata field '${field}'. Supported fields: ${SCALAR_METADATA_FIELDS.join(", ")}`);
  }
  aux4[field] = value;
}

export function removeMetadataField(aux4, field) {
  if (!(field in aux4)) throw new Error(`Metadata field '${field}' is not set`);
  delete aux4[field];
}

export function addTag(aux4, tag) {
  if (!aux4.tags) aux4.tags = [];
  if (aux4.tags.includes(tag)) throw new Error(`Tag '${tag}' already exists`);
  aux4.tags.push(tag);
}

export function removeTag(aux4, tag) {
  if (!aux4.tags || !aux4.tags.includes(tag)) throw new Error(`Tag '${tag}' not found`);
  aux4.tags = aux4.tags.filter(t => t !== tag);
}

function dependencyKey(dep) {
  return dep.split("@")[0];
}

export function addDependency(aux4, dependency) {
  if (!aux4.dependencies) aux4.dependencies = [];
  const key = dependencyKey(dependency);
  if (aux4.dependencies.some(d => dependencyKey(d) === key)) {
    throw new Error(`Dependency '${key}' already exists`);
  }
  aux4.dependencies.push(dependency);
}

export function removeDependency(aux4, dependency) {
  const key = dependencyKey(dependency);
  if (!aux4.dependencies || !aux4.dependencies.some(d => dependencyKey(d) === key)) {
    throw new Error(`Dependency '${key}' not found`);
  }
  aux4.dependencies = aux4.dependencies.filter(d => dependencyKey(d) !== key);
}

export function addSystemGroup(aux4, entries, index) {
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

export function removeSystemGroup(aux4, index) {
  if (!aux4.system || aux4.system.length === 0) throw new Error("No 'system' groups defined");
  const i = Number(index);
  if (Number.isNaN(i) || i < 0 || i >= aux4.system.length) {
    throw new Error(`System group index ${index} out of range (0-${aux4.system.length - 1})`);
  }
  aux4.system.splice(i, 1);
}
