#### Description

Adds a new, empty profile to the `.aux4` file. Fails if a profile with that name already exists.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 editor profile add [--file <path>] --profile <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Name of the profile to add (required)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 editor profile add --profile deploy
```

```text
Profile 'deploy' added
```
