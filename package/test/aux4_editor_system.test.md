# aux4 aux4 editor system

```file:test-editor.aux4
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "system": [["test:node --version", "brew:node", "linux:nodejs"]],
  "profiles": [
    {
      "name": "main",
      "commands": [
        { "name": "hello", "execute": ["log:hi"], "help": { "text": "Say hello" } }
      ]
    }
  ]
}
```

## add

### should add a system alternatives group and show it

```execute
aux4 aux4 editor system add --file test-editor.aux4 --entries "test:jq --version" --entries "brew:jq" >/dev/null && aux4 aux4 editor show --file test-editor.aux4
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "system": [
    [
      "test:node --version",
      "brew:node",
      "linux:nodejs"
    ],
    [
      "test:jq --version",
      "brew:jq"
    ]
  ],
  "profiles": [
    {
      "name": "main",
      "commands": [
        {
          "name": "hello",
          "execute": [
            "log:hi"
          ],
          "help": {
            "text": "Say hello"
          }
        }
      ]
    }
  ]
}
```

### should fail without writing the file when --entries is missing

```execute
aux4 aux4 editor system add --file test-editor.aux4; aux4 aux4 editor show --file test-editor.aux4
```

```error:partial
--entries is required
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "system": [
    [
      "test:node --version",
      "brew:node",
      "linux:nodejs"
    ]
  ],
  "profiles": [
    {
      "name": "main",
      "commands": [
        {
          "name": "hello",
          "execute": [
            "log:hi"
          ],
          "help": {
            "text": "Say hello"
          }
        }
      ]
    }
  ]
}
```

## remove

### should remove a system group by index

```execute
aux4 aux4 editor system remove --file test-editor.aux4 --index 0
```

```expect
System dependency group at index 0 removed
```

### should fail on an out-of-range index

```execute
aux4 aux4 editor system remove --file test-editor.aux4 --index 5
```

```error:partial
System group index 5 out of range
```
