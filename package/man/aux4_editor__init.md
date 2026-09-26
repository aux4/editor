#### Description

Creates a new `.aux4` file with an empty `main` profile. Fails if the target file already exists.
The new file is validated with `aux4/lint` before being written, unless `--noLint true` is passed.

`--scope`, `--name`, `--version` and `--description` are only written to the file when explicitly
passed, or (for `version`) implied:

- A bare `aux4 aux4 editor init` with no flags produces the minimal file
  `{"profiles":[{"name":"main","commands":[]}]}` — no `scope`/`name`/`version` is invented, since
  adding a `version` would make `scope`/`name` required by `aux4/lint`'s metadata rules and break
  a plain local `.aux4` that isn't a package.
- If `--scope` and/or `--name` is passed (this is a package) and `--version` is not, `version`
  defaults to `0.1.0`, since `aux4/lint` requires `version` once a package identity is present.

#### Usage

```bash
aux4 aux4 editor init [--file <path>] [--scope <scope>] [--name <name>] [--version <version>] [--description <text>] [--noLint <true|false>]
```

--file          Path to the .aux4 file to create (default: `.aux4`)
--scope         Package scope (e.g. `aux4`). Omit for a plain local `.aux4` file
--name          Package name. Omit for a plain local `.aux4` file
--version       Package version (default: `0.1.0` if `--scope`/`--name` is passed; omitted otherwise)
--description   Package description
--noLint        Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor init --scope aux4 --name greet --version 0.1.0 --description "Say hello"
```

```text
Created '.aux4'
```

A bare local file (no package metadata):

```bash
aux4 aux4 editor init
```

```text
Created '.aux4'
```
