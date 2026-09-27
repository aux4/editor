#### Description

Removes the execute line at the given 0-based index from a command. Fails if the index is out of
range or the command has no execute lines.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 editor execute remove [--file <path>] [--profile <name>] --command <name> --index <n> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--command   Name of the command to remove the execute line from (required)
--index     Index of the execute line to remove (0-based, required)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 editor execute remove --command hello --index 1
```

```text
Execute line at index 1 removed from command 'hello' in profile 'main'
```
