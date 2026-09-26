#### Description

Renames a profile and cascades the rename to every place that depends on the old name:

- Any nested profile named `<old>:<suffix>` is renamed to `<new>:<suffix>` (e.g. renaming
  `email` to `emails` also renames `email:list` to `emails:list`).
- Every execute line anywhere in the file that reads `profile:<old>` (or `profile:<old>:<suffix>`
  for a nested profile) is rewritten to point at the new name.

Fails if the profile does not exist, or if a profile with the new name already exists.

#### Usage

```bash
aux4 aux4 editor profile rename [--file <path>] --profile <name> --newName <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Current name of the profile
--newName   New name for the profile
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor profile rename --profile email --newName emails
```

```text
Profile 'email' renamed to 'emails'
```
