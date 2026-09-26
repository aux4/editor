#### Description

Removes a command from a profile. Fails if the command does not exist.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 aux4 editor command remove [--file <path>] [--profile <name>] --name <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--name      Name of the command to remove (required)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor command remove --name hello
```

```text
Command 'hello' removed from profile 'main'
```
