#### Description

Removes an entry from the package's `dependencies` array, matching by `scope/name` and ignoring
any version suffix. Fails if no matching dependency is found.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 aux4 editor dependency remove [--file <path>] --dependency <scope/name> [--noLint <true|false>]
```

--file         Path to the .aux4 file (default: `.aux4`)
--dependency   Dependency to remove (required)
--noLint       Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor dependency remove --dependency aux4/config
```

```text
Dependency 'aux4/config' removed
```
