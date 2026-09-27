#### Description

Adds a new alternatives group to the package's `system` array. Each group is an ordered list of
strings — conventionally a `test:` check followed by one or more install options (e.g.
`brew:node`, `apt:nodejs`). `--entries` is repeatable and ordered. Appends to the end by default;
pass `--index` to insert at a specific 0-based position.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 editor system add [--file <path>] --entries <value>... [--index <n>] [--noLint <true|false>]
```

--file       Path to the .aux4 file (default: `.aux4`)
--entries    Entry to add to the group (repeatable, ordered, at least one required)
--index      Position to insert the group at (0-based); appends when omitted
--noLint     Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 editor system add --entries "test:node --version" --entries "brew:node" --entries "linux:nodejs"
```

```text
System dependency group added
```
