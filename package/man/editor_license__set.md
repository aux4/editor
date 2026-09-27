#### Description

Applies a license to the package. Runs `aux4 aux4 license use --name <name> --project <project>
--owner <owner> --year <year>` in the directory of the target `.aux4` file, which writes a
`LICENSE` file next to it, then sets that `.aux4` file's `license` field to the license's proper
SPDX identifier (e.g. `apache-2.0` becomes `Apache-2.0`, `mit` becomes `MIT`) — read from `aux4
aux4 license info --name <name> --json true`.

- `--project` is not a flag on this command — it is taken from the target `.aux4` file's `name`
  field. The file must already have `name` set (via `editor init --name` or `editor package set
  --field name`) before running `license set`.
- `--year` defaults to the current calendar year when omitted.
- `--name` must match a license known to `aux4/license` (see `aux4 editor license list`).
- Fails fast with a clear error (and leaves the file untouched) if `--name` or `--owner` is
  missing, empty, or the literal string `undefined`/`null`.
- The `.aux4` write goes through the same lint gate as every other mutating subcommand: the
  candidate file is validated with `aux4/lint` before the real file is overwritten. If lint
  rejects the change, the `.aux4` file is left untouched **and** the `LICENSE` file is restored to
  its state before this command ran — removed if this command created it, restored to its
  previous content if a `LICENSE` file already existed. The two files never end up out of sync.

#### Usage

```bash
aux4 editor license set --name <license-id> --owner <owner> [--file <path>] [--year <yyyy>] [--noLint <true|false>]
```

--name      License identifier known to `aux4/license`, e.g. `apache-2.0`, `mit` (required)
--owner     Copyright owner written into `LICENSE` (required)
--file      Path to the .aux4 file; `LICENSE` is written next to it (default: `.aux4`)
--year      License year (default: the current year)
--noLint    Skip aux4/lint validation before writing the `.aux4` change (default: `false`)

#### Example

```bash
aux4 editor license set --name apache-2.0 --owner "Jane Doe"
```

```text
License 'Apache-2.0' set. LICENSE written to '/path/to/LICENSE'
```
