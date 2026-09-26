#### Description

Adds a new variable to a command's `help.variables` list. Fails if a variable with that name
already exists on the command. Only the properties explicitly passed are set — booleans
(`arg`, `multiple`, `hide`, `encrypt`) are set only when `--<flag> true`, and `--options` is
repeatable.

Fails fast with a clear error (and leaves the file untouched) if a required flag is missing, empty, or the literal string `undefined`/`null`.

#### Usage

```bash
aux4 editor variable add [--file <path>] [--profile <name>] --command <name> --name <name> [--text <text>] [--default <value>] [--arg <true|false>] [--multiple <true|false>] [--env <ENV_VAR>] [--options <value>]... [--hide <true|false>] [--encrypt <true|false>] [--noLint <true|false>]
```

--file       Path to the .aux4 file (default: `.aux4`)
--profile    Profile the command belongs to (default: `main`)
--command    Name of the command to add the variable to (required)
--name       Name of the variable to add (required)
--text       Description shown in help and prompts
--default    Default value for the variable
--arg        Accept as a positional argument
--multiple   Accept multiple values
--env        Environment variable to read the value from
--options    Option value for a select list (repeatable)
--hide       Hide the input, for passwords
--encrypt    Encrypt the value (requires `aux4/encrypter` dependency)
--noLint     Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 editor variable add --command hello --name name --text "Name to greet" --default World
```

```text
Variable 'name' added to command 'hello' in profile 'main'
```
