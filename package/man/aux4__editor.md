#### Description

The `editor` command group creates and modifies `.aux4` configuration files programmatically —
profiles, commands, variables, execute lines, and package metadata (scope, name, version,
dependencies, tags, system requirements, cloud configuration). It is the scripted counterpart to
hand-editing a `.aux4` file: every subcommand loads the target file, applies one change, validates
the result with `aux4/lint` against a temporary copy, and only then overwrites the real file.

- If validation reports any `error`-severity issue, the errors are printed, the command exits
  non-zero, and the original file is left untouched.
- Pass `--noLint true` on any mutating subcommand to skip validation (not recommended).
- All subcommands operate on `--file .aux4` in the current directory by default.

#### Usage

```bash
aux4 aux4 editor <init|show|profile|command|variable|execute|package|tag|dependency|system|cloud> ...
```

#### Example

```bash
aux4 aux4 editor init --scope aux4 --name greet --description "Say hello"
aux4 aux4 editor command add --name hello --execute 'log:Hello, ${name}!' --help "Say hello"
aux4 aux4 editor variable add --command hello --name name --default World
aux4 aux4 editor show
```
