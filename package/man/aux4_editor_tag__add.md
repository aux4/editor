#### Description

Adds a tag to the package's `tags` array. Fails if the tag is already present.

#### Usage

```bash
aux4 aux4 editor tag add [--file <path>] --tag <value> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--tag       Tag to add
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor tag add --tag cli
```

```text
Tag 'cli' added
```
