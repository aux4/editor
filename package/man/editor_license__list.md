#### Description

A passthrough to `aux4 aux4 license list`. Lists the licenses available for `editor license set
--name <name>`, or shows a single one when `--name` is passed.

#### Usage

```bash
aux4 editor license list [--name <license-id>]
```

--name    Show details for a single license instead of the full list (optional)

#### Example

```bash
aux4 editor license list --name apache-2.0
```

```text
apache-2.0
  Apache License 2.0
  A permissive license whose main conditions require preservation of copyright and license notices...
```
