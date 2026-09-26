#### Description

Sets a single top-level package metadata field. Supported fields: `scope`, `name`, `version`,
`description`, `license`, `git`, `website`, `repository`, `private`, `type` and `cloud`. Pass
`--json true` when the value is not a plain string (booleans, e.g. `private`, or objects, e.g.
`cloud`) — prefer the dedicated `cloud set` command for the cloud configuration object. Every
value is still subject to `aux4/lint`, so an invalid version, malformed git URL, etc. is rejected.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 aux4 editor package set [--file <path>] --field <name> --value <value> [--json <true|false>] [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--field     Metadata field to set (required)
--value     Value to set (required)
--json      Parse 'value' as JSON before setting it (default: `false`)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor package set --field version --value 0.2.0
aux4 aux4 editor package set --field private --value true --json true
```

```text
Package field 'version' set
```
