# Release notes

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
  `aux4 aux4 editor init` now produces `{"profiles":[{"name":"main","commands":[]}]}` and passes
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
