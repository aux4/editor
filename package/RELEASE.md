# Release notes

## Release flow

Pushing to the `dev` branch publishes to the dev hub; pushing to `main` publishes to the prod hub
(hub.aux4.io). Both are handled by `.github/workflows/publish.yml` via `aux4/action@v1`.

## Latest

### Fixed: `variable add`/`variable set --default ''` silently dropped an explicit empty default

- `--default ''` (or `--default=`) on `editor variable add`/`editor variable set` now persists a
  literal `"default": ""` on the variable, instead of writing no `default` property at all. aux4
  core resolves an omitted `--default` flag to the variable's own default before this package ever
  sees it, so a plain empty-string default on the `default` flag itself made "not passed" and
  "passed as `''`" indistinguishable — that variable's default is now an internal sentinel that a
  user can never type through the CLI, so the two cases are told apart correctly. Omitting
  `--default` still behaves exactly as before: `add` leaves the new variable without a `default`
  property, and `set` leaves an existing default untouched.

### `init` scaffolds a README.md for a package; `build` fails fast and cleanly when one is missing

- `editor init --scope <scope>` and/or `--name <name>` now scaffolds a minimal `README.md` next to
  the `.aux4` file if one doesn't already exist — `aux4 aux4 pkger build` requires a `README.md`
  to build a package, so `init` followed by `editor build` now works without an extra manual step.
  The title is `<scope>/<name>` (or whichever is present); `--description`, if passed, becomes the
  opening paragraph. An existing `README.md` is never overwritten.
- `editor build` now checks for `README.md` before linting and aborts with a single clear error —
  `README.md is required to build a package` — instead of forwarding `aux4 aux4 pkger build`'s own
  error, which used to print twice (once as the child process's own stderr, once again inside the
  wrapping error message).
- Fixed the doubled error output in general: every external `aux4` command this package shells out
  to (`aux4 lint run`, `aux4 aux4 pkger build`, `aux4 license use`/`info`/`list`) now has its
  stderr captured instead of also being forwarded live to this process's stderr, so a failing
  child command's message is printed exactly once.

## 0.2.0

### Breaking: command root moved from `aux4 aux4 editor` to `aux4 editor`

- The package's entry point moved from the `aux4` tools namespace to the top level: it's now
  `aux4 editor ...` instead of `aux4 aux4 editor ...`. The internal profile that used to be named
  `aux4:editor` (and its nested `aux4:editor:*` groups) is now `editor` (and `editor:*`). Anything
  scripting the old `aux4 aux4 editor` invocation must be updated to `aux4 editor`.
- Added `editor license set --name <license-id> --owner <owner> [--year <yyyy>] [--file .aux4]`,
  which uses `aux4/license` (new dependency) to write a `LICENSE` file next to the target `.aux4`
  file and sets that file's `license` field to the license's SPDX identifier (e.g. `apache-2.0` →
  `Apache-2.0`). `--project` is taken from the `.aux4` file's `name` field, not a flag. On a lint
  failure the `LICENSE` file is restored to its pre-command state (removed if this command created
  it, restored to its previous content otherwise) and the `.aux4` file is left untouched.
- Added `editor license list`, a passthrough to `aux4 aux4 license list`.
- Added `editor build [--file .aux4] [--out <dir>]`, which lints the package directory and, if
  lint passes, builds it into a distributable zip via `aux4 aux4 pkger build`. When the output
  directory is the package directory itself (the default), stale `*.zip` files are removed first
  to guard against the recursive-zip trap.
- The final write of every mutating command is now atomic: the new content is written to a
  temporary file in the same directory as the target and then renamed into place, so a crash or
  kill mid-write can never leave the real `.aux4` file truncated or half-written.

## 0.1.2

### Required-flag validation, unified rename flag, and a bare `init`

- Every mutating command now validates its required flags before touching the file. A missing,
  empty, or literal `undefined`/`null` value (which is what aux4 core can pass through for an
  unresolved variable with no default, e.g. a mistyped flag name) prints `--<flag> is required`,
  exits non-zero, and leaves the file untouched. Previously a mistyped flag on `profile rename`
  could silently write the string `"undefined"` as the new profile name.
- `profile rename` and `command rename` now take the new name as `--to`, matching `variable
  rename`. The old `--newName` flag is removed (this package had not shipped to production yet).
- `editor init` only writes `scope`/`name`/`description` when they are explicitly passed, and
  writes `version` only when passed or implied by `--scope`/`--name` (defaults to `0.1.0`, since
  `aux4/lint` requires a version once a package identity is present). A bare
  `aux4 editor init` now produces `{"profiles":[{"name":"main","commands":[]}]}` and passes
  `aux4/lint` — previously it always wrote `"version": "0.1.0"`, which trips `aux4/lint`'s
  metadata rule that makes `scope`/`name` required once `version` is present, so a plain local
  (non-package) `.aux4` could not be created.
- Added a GitHub Actions publish workflow (`aux4/publish-package-action@v1`), matching the other
  aux4 JS packages, so this package has a path to hub.aux4.io.

## Features

- Initial release. Create and modify `.aux4` configuration files from the command line:
  - `editor init` / `editor show`
  - `editor profile add|remove|rename` (rename cascades to nested profiles and every
    `profile:<name>` reference)
  - `editor command add|remove|set|rename`
  - `editor variable add|remove|set|rename` (rename rewrites `$old`, `${old}` and the identifier
    inside `value()`/`values()`/`param()`/`params()`/`object()` calls in the command's execute
    lines, matching whole identifiers only)
  - `editor execute add|remove|set`
  - `editor package set|remove` for top-level metadata fields (`scope`, `name`, `version`,
    `description`, `license`, `git`, `website`, `repository`, `private`, `type`)
  - `editor tag add|remove`, `editor dependency add|remove`, `editor system add|remove`
  - `editor cloud set|remove`
- Every mutating command validates the candidate file with `aux4/lint` against a temporary copy
  before writing. A lint error prints the issues, exits non-zero, and leaves the original file
  untouched. `--noLint true` skips validation.
- Key order and 2-space JSON formatting are preserved on every write.
