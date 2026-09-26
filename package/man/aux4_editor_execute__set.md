#### Description

Replaces the execute line at the given 0-based index. Fails if the index is out of range or the
command has no execute lines.

#### Usage

```bash
aux4 aux4 editor execute set [--file <path>] [--profile <name>] --command <name> --index <n> --line <line> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--command   Name of the command whose execute line is being updated
--index     Index of the execute line to replace (0-based)
--line      New execute line
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor execute set --command hello --index 0 --line 'log:Hi, ${name}!'
```

```text
Execute line at index 0 updated on command 'hello' in profile 'main'
```
