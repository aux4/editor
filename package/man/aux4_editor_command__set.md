#### Description

Replaces a command's execute lines and/or help text. `--execute` replaces the entire execute array
only when at least one `--execute` value is provided; omit it to leave the current execute lines
untouched. The same applies to `--helpText`.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 aux4 editor command set [--file <path>] [--profile <name>] --name <name> [--execute <line>]... [--helpText <text>] [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--name      Name of the command to update (required)
--execute   Replace the execute array with these lines (repeatable)
--helpText  Replace the help text
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor command set --name hello --execute 'log:Hi, ${name}!'
```

```text
Command 'hello' updated in profile 'main'
```
