#### Description

Removes the package's `cloud` configuration object. Also removes the top-level `type` field when
it is set to `"cloud"`.

#### Usage

```bash
aux4 editor cloud remove [--file <path>] [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 editor cloud remove
```

```text
Cloud configuration removed
```
