#### Description

Prints the `.aux4` file, a single profile, or a single command as formatted JSON. Passing
`--command` requires `--profile` (defaults to `main` if omitted).

#### Usage

```bash
aux4 editor show [--file <path>] [--profile <name>] [--command <name>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile name to show
--command   Command name to show (requires --profile)

#### Example

```bash
aux4 editor show --profile main --command hello
```

```json
{
  "name": "hello",
  "execute": ["log:Hello, ${name}!"],
  "help": {
    "text": "Say hello",
    "variables": [{ "name": "name", "default": "World" }]
  }
}
```
