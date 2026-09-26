#### Description

Adds an execute line to a command. Appends to the end by default; pass `--index` to insert at a
specific 0-based position.

#### Usage

```bash
aux4 aux4 editor execute add [--file <path>] [--profile <name>] --command <name> --line <line> [--index <n>] [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--command   Name of the command to add the execute line to
--line      Execute line to add
--index     Position to insert the line at (0-based); appends when omitted
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor execute add --command hello --line 'log:done'
```

```text
Execute line added to command 'hello' in profile 'main'
```
