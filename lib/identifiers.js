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
export function renameIdentifierInLine(line, oldName, newName) {
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
