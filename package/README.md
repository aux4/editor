# aux4/editor

Create and modify `.aux4` configuration files from the command line — profiles, commands,
variables, execute lines, and package metadata — without hand-editing JSON. Every change is
validated with [`aux4/lint`](https://hub.aux4.io) before it is written, so a mutation that would
break the file is rejected instead of silently corrupting it.

## Installation

```bash
aux4 aux4 pkger install aux4/editor
```

## Quick Start

```bash
aux4 editor init --scope aux4 --name greet --description "Say hello"
aux4 editor command add --name hello --execute 'log:Hello, ${name}!' --helpText "Say hello"
aux4 editor variable add --command hello --name name --text "Name to greet" --default World
aux4 editor show
```

`init` only writes the metadata fields you actually pass. A bare `aux4 editor init` with no
flags creates the minimal `{"profiles":[{"name":"main","commands":[]}]}` — it never invents a
`scope`, `name` or `version`, since those would make `scope`/`name` required by `aux4/lint` and
break a plain local `.aux4` file that isn't meant to be a package. If you pass `--scope` and/or
`--name` without `--version`, `version` defaults to `0.1.0`, since `aux4/lint` requires a version
once a package identity is present.

```bash
aux4 editor init
```

When `--scope` and/or `--name` is passed, `init` also scaffolds a minimal `README.md` next to the
`.aux4` file if one doesn't already exist — `aux4 aux4 pkger build` requires a `README.md`, so
`init` followed by `editor build` works without an extra manual step. The title is
`<scope>/<name>` (or whichever of the two is present), and `--description`, if given, becomes the
opening paragraph. An existing `README.md` is never overwritten.

```bash
aux4 editor init --scope aux4 --name greet --description "Say hello"
```

```text
Created '.aux4'
Created '/path/to/README.md'
```

## The lint gate

Every mutating subcommand:

1. validates that every required flag was actually provided — non-empty, and not the literal
   string `undefined`/`null` (which is what a mistyped or missing flag with no default can arrive
   as). If a required flag is missing, the command prints `--<flag> is required`, exits non-zero,
   and **the file is never touched**,
2. loads the target `.aux4` file (`--file .aux4` by default),
3. applies the change in memory,
4. writes the candidate result to a temporary directory as `.aux4`,
5. runs `aux4 lint run` against that temporary copy,
6. if any issue has severity `error`, prints the errors, exits non-zero, and **leaves the real
   file untouched**,
7. otherwise, overwrites the real file with the new content, preserving key order and 2-space
   JSON formatting.

Pass `--noLint true` to skip lint validation (not recommended — nothing then stops you from
writing a broken file). The required-flag check above always runs, even with `--noLint true`.

```bash
aux4 editor package set --field version --value not-a-version
```

```text
aux4/lint rejected the change to '.aux4':
ERROR  [metadata-version] Invalid 'version' value 'not-a-version' — must follow semantic versioning (e.g., '1.0.0')
Lint validation failed with 1 error(s). File left untouched.
```

## Command reference

| Command | Purpose |
|---|---|
| `editor init` | Create a new `.aux4` file with an empty `main` profile |
| `editor show` | Print the file, a profile, or a command as JSON |
| `editor profile add\|remove\|rename` | Manage profiles |
| `editor command add\|remove\|set\|rename` | Manage commands |
| `editor variable add\|remove\|set\|rename` | Manage command variables |
| `editor execute add\|remove\|set` | Manage a command's execute lines |
| `editor package set\|remove` | Manage top-level package metadata fields |
| `editor tag add\|remove` | Manage the `tags` array |
| `editor dependency add\|remove` | Manage the `dependencies` array |
| `editor system add\|remove` | Manage `system` alternatives groups |
| `editor cloud set\|remove` | Manage the `cloud` deployment configuration |
| `editor license set\|list` | Apply a license (writes `LICENSE` and the `.aux4` `license` field) or list available licenses |
| `editor build` | Lint the package and build it into a distributable zip |

## Profiles, commands, execute lines

```bash
aux4 editor profile add --profile deploy
aux4 editor command add --profile deploy --name run --execute 'log:deploying' --helpText "Deploy"
aux4 editor execute add --profile deploy --command run --line 'log:done'
aux4 editor execute set --profile deploy --command run --index 0 --line 'log:starting deploy'
aux4 editor command remove --profile deploy --name run
aux4 editor profile remove --profile deploy
```

`profile rename` cascades: it also renames every nested profile named `<old>:<suffix>` and
rewrites every `profile:<old>` reference anywhere in the file to point at the new name.

```bash
aux4 editor profile rename --profile email --to emails
# email:list -> emails:list, and every "profile:email" / "profile:email:list" line is rewritten
```

`command rename` renames a command within its profile:

```bash
aux4 editor command rename --profile main --name hello --to greet
```

`profile rename`, `command rename` and `variable rename` all take the new name as `--to`.

## Variables

```bash
aux4 editor variable add --command hello --name name \
  --text "Name to greet" --default World --arg true
aux4 editor variable set --command hello --name name --default Universe
aux4 editor variable remove --command hello --name name
```

Every field of the variable schema is supported: `text`, `default`, `arg`, `multiple`, `env`,
`options` (repeatable), `hide`, `encrypt`.

`variable rename` renames the variable **and** rewrites every reference to it inside that
command's own execute lines — `$old`, `${old}` (and `${old.field}`), and the identifier inside
`value(old)`, `values(a, old)`, `param(old)`, `params(a, old)` and `object(old)` calls. Only
whole-identifier matches are rewritten, so renaming `name` never touches `$nameX` or
`${firstName}`:

```bash
aux4 editor variable rename --command hello --name name --to personName
```

## Package metadata

`package set`/`package remove` manage any top-level scalar field: `scope`, `name`, `version`,
`description`, `license`, `git`, `website`, `repository`, `private`, `type`. Pass `--json true`
for non-string values such as booleans:

```bash
aux4 editor package set --field version --value 0.2.0
aux4 editor package set --field private --value true --json true
aux4 editor package remove --field website
```

`tag`, `dependency` and `system` manage the corresponding arrays:

```bash
aux4 editor tag add --tag cli
aux4 editor dependency add --dependency aux4/config
aux4 editor system add --entries "test:node --version" --entries "brew:node" --entries "linux:nodejs"
```

`dependency remove` matches by `scope/name`, ignoring any version suffix. `system remove` and
`execute remove`/`set` address entries by their 0-based index.

`cloud set`/`cloud remove` manage the `cloud` deployment configuration used by aux4.cloud. `cloud
set` also sets the required top-level `type: "cloud"` field for you:

```bash
aux4 editor cloud set --value '{"deployment":"any"}'
aux4 editor cloud remove
```

## Showing the file

```bash
aux4 editor show                                 # whole file
aux4 editor show --profile main                  # one profile
aux4 editor show --profile main --command hello  # one command
```

## License

`editor license set` uses [`aux4/license`](https://hub.aux4.io) to generate a `LICENSE` file next
to the target `.aux4` file, and sets the `.aux4` file's `license` field to the license's proper
SPDX identifier (e.g. `apache-2.0` becomes `Apache-2.0`):

```bash
aux4 editor license set --name apache-2.0 --owner "Jane Doe"
```

```text
License 'Apache-2.0' set. LICENSE written to '/path/to/LICENSE'
```

- `--name` is the license identifier used by `aux4/license` (run `aux4 editor license list` to see
  the available names).
- `--owner` is the copyright holder written into `LICENSE`.
- `--project` is not a flag — it is taken from the `.aux4` file's `name` field. The `.aux4` file
  must already have a `name` set (e.g. via `editor init --name` or `editor package set --field
  name`) before running `license set`.
- `--year` defaults to the current year.

Like every mutating command, the `.aux4` change goes through the same lint gate described above.
If lint rejects the change, the `.aux4` file is left untouched and the `LICENSE` file is restored
to whatever state it was in before the command ran (removed if `license set` created it, restored
to its previous content otherwise) — `license set` never leaves the two files out of sync.

`editor license list` is a passthrough to `aux4 aux4 license list`, useful for finding the right
`--name` value:

```bash
aux4 editor license list
aux4 editor license list --name apache-2.0
```

## Building the package

`editor build` lints the package directory derived from `--file` (default `.aux4`) and, if lint
passes, builds it into a distributable zip with `aux4 aux4 pkger build`:

```bash
aux4 editor build
aux4 editor build --out dist
```

- `--file` defaults to `.aux4`; the package directory is `dirname(--file)`.
- `--out` defaults to `.` (matching `aux4 aux4 pkger build`'s own default), i.e. the package
  directory itself.
- `aux4 aux4 pkger build` requires a `README.md` in the package directory. `build` checks for it
  before linting and aborts with a single clear error — `README.md is required to build a
  package` — instead of forwarding pkger's own error twice. `aux4 editor init --scope <scope>
  --name <name>` scaffolds one automatically, so this normally only matters if it was removed
  afterwards.
- If any lint issue has severity `error`, the build aborts with a non-zero exit code and no zip is
  produced.
- When the output directory is the package directory itself (the default), any pre-existing
  `*.zip` files there are removed before building, so a stale zip from a previous build can never
  get swept into the new archive and balloon its size on every run.
