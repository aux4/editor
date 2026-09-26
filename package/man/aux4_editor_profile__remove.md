#### Description

Removes a profile from the `.aux4` file. Fails if the profile does not exist. If any command still
references the removed profile via `profile:<name>`, `aux4/lint`'s reference-integrity rule rejects
the change and the file is left untouched.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 aux4 editor profile remove [--file <path>] --profile <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Name of the profile to remove (required)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor profile remove --profile deploy
```

```text
Profile 'deploy' removed
```
