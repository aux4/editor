#### Description

Removes the execute line at the given 0-based index from a command. Fails if the index is out of
range or the command has no execute lines.

#### Usage

```bash
aux4 aux4 editor execute remove [--file <path>] [--profile <name>] --command <name> --index <n> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--command   Name of the command to remove the execute line from
--index     Index of the execute line to remove (0-based)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor execute remove --command hello --index 1
```

```text
Execute line at index 1 removed from command 'hello' in profile 'main'
```
