# Release notes

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
