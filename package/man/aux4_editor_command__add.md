#### Description

Adds a new command to a profile (`main` by default). Fails if a command with that name already
exists in the profile. `--execute` is repeatable; if omitted, the command is created with a single
placeholder `true` execute line.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 aux4 editor command add [--file <path>] [--profile <name>] --name <name> [--execute <line>]... [--helpText <text>] [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile to add the command to (default: `main`)
--name      Name of the command to add (required)
--execute   Execute line to add (repeatable, in order)
--helpText  Help text for the command
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor command add --name hello --execute 'log:Hello, ${name}!' --helpText "Say hello"
```

```text
Command 'hello' added to profile 'main'
```
