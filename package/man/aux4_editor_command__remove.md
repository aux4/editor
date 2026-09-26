#### Description

Removes a command from a profile. Fails if the command does not exist.

#### Usage

```bash
aux4 aux4 editor command remove [--file <path>] [--profile <name>] --name <name> [--noLint <true|false>]
```

--file      Path to the .aux4 file (default: `.aux4`)
--profile   Profile the command belongs to (default: `main`)
--name      Name of the command to remove
--noLint    Skip aux4/lint validation before writing (default: `false`)

#### Example

```bash
aux4 aux4 editor command remove --name hello
```

```text
Command 'hello' removed from profile 'main'
```
