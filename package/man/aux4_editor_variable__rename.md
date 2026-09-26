#### Description

Renames a variable and rewrites every reference to it inside that command's own execute lines:
`$old`, `${old}` (and `${old.field}` for dot-notation), and the identifier inside
`value(old)`, `values(a, old)`, `param(old)`, `params(a, old)` and `object(old)` /
`object(path:old)` calls. Only whole-identifier matches are rewritten — renaming `name` never
touches `$nameX` or `${firstName}`. Fails if the variable does not exist, or a variable with the
new name already exists on the same command.

#### Usage

```bash
aux4 aux4 editor variable rename [--file <path>] [--profile <name>] --command <name> --name <name> --to <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--command   Name of the command the variable belongs to
--name      Current name of the variable
--to        New name for the variable
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor variable rename --command hello --name name --to personName
```

```text
Variable 'name' renamed to 'personName' on command 'hello' in profile 'main'
```
