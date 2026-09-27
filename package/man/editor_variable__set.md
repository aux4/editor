#### Description

Updates one or more properties of an existing variable. Only the properties explicitly passed are
changed — everything else is left as-is. `--options`, when passed, replaces the whole option list.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 editor variable set [--file <path>] [--profile <name>] --command <name> --name <name> [--text <text>] [--default <value>] [--arg <true|false>] [--multiple <true|false>] [--env <ENV_VAR>] [--options <value>]... [--hide <true|false>] [--encrypt <true|false>] [--noLint <true|false>]
```

--file       Path to the .aux4 file (default: `.aux4`)
--profile    Profile the command belongs to (default: `main`)
--command    Name of the command the variable belongs to (required)
--name       Name of the variable to update (required)
--text       Description shown in help and prompts
--default    Default value for the variable. Pass `--default ''` to persist an explicit empty
             default; omitting the flag leaves the existing default (if any) unchanged
--arg        Accept as a positional argument
--multiple   Accept multiple values
--env        Environment variable to read the value from
--options    Option value for a select list (repeatable; replaces the whole list)
--hide       Hide the input, for passwords
--encrypt    Encrypt the value
--noLint     Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 editor variable set --command hello --name name --default Universe
```

```text
Variable 'name' updated on command 'hello' in profile 'main'
```
