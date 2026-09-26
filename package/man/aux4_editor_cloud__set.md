#### Description

Sets the package's cloud deployment configuration. Accepts the `cloud` object as a JSON string and
also sets the required top-level `type: "cloud"` field alongside it (`aux4/lint` rejects a
`cloud` object without `type: "cloud"`). See the aux4.cloud platform documentation for the full
`cloud` schema (`deployment`, `stateful`, `machine`, `replaces`, etc.).

#### Usage

```bash
aux4 aux4 editor cloud set [--file <path>] --value <json> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--value     Cloud configuration as a JSON object
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor cloud set --value '{"deployment":"any"}'
```

```text
Cloud configuration set
```
