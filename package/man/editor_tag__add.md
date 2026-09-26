#### Description

Adds a tag to the package's `tags` array. Fails if the tag is already present.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 editor tag add [--file <path>] --tag <value> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--tag       Tag to add (required)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 editor tag add --tag cli
```

```text
Tag 'cli' added
```
