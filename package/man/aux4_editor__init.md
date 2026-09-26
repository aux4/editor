#### Description

Creates a new `.aux4` file with an empty `main` profile. Fails if the target file already exists.
The new file is validated with `aux4/lint` before being written, unless `--noLint true` is passed.

#### Usage

```bash
aux4 aux4 editor init [--file <path>] [--scope <scope>] [--name <name>] [--version <version>] [--description <text>] [--noLint <true|false>]
```

--file          Path to the .aux4 file to create (default: `.aux4`)
--scope         Package scope (e.g. `aux4`)
--name          Package name
--version       Package version (default: `0.1.0`)
--description   Package description
--noLint        Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor init --scope aux4 --name greet --version 0.1.0 --description "Say hello"
```

```text
Created '.aux4'
```
