#### Description

Adds an entry to the package's `dependencies` array (e.g. `aux4/config` or
`aux4/config@^1.0.0`). Fails if a dependency on the same `scope/name` (ignoring the version) is
already present.

#### Usage

```bash
aux4 aux4 editor dependency add [--file <path>] --dependency <scope/name[@version]> [--noLint <true|false>]
```

--file         Path to the .aux4 file (default: `.aux4`)
--dependency   Dependency to add
--noLint       Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor dependency add --dependency aux4/config
```

```text
Dependency 'aux4/config' added
```
