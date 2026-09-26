#### Description

Removes an alternatives group from the package's `system` array by its 0-based index.

#### Usage

```bash
aux4 aux4 editor system remove [--file <path>] --index <n> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--index     Index of the group to remove (0-based)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor system remove --index 0
```

```text
System dependency group at index 0 removed
```
