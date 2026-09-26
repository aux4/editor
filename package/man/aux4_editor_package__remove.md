#### Description

Removes a top-level package metadata field entirely. Fails if the field is not currently set.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 aux4 editor package remove [--file <path>] --field <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--field     Metadata field to remove (required)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor package remove --field website
```

```text
Package field 'website' removed
```
