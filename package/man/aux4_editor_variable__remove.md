#### Description

Removes a variable from a command. Fails if the variable does not exist. Does not rewrite any
execute lines that reference the removed variable — remove or update those references yourself
first if needed.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 aux4 editor variable remove [--file <path>] [--profile <name>] --command <name> --name <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--command   Name of the command to remove the variable from (required)
--name      Name of the variable to remove (required)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor variable remove --command hello --name name
```

```text
Variable 'name' removed from command 'hello' in profile 'main'
```
