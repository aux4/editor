#### Description

Renames a command within a profile. Fails if the command does not exist, or a command with the
new name already exists in the same profile.

#### Usage

```bash
aux4 aux4 editor command rename [--file <path>] [--profile <name>] --name <name> --newName <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--name      Current name of the command
--newName   New name for the command
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor command rename --name hello --newName greet
```

```text
Command 'hello' renamed to 'greet' in profile 'main'
```
