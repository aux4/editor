# aux4 editor cloud

```file:test-editor.aux4
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
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

## set

### should set the cloud configuration and the type field

```execute
aux4 editor cloud set --file test-editor.aux4 --value '{"deployment":"any"}' >/dev/null && aux4 editor show --file test-editor.aux4
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
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
  ],
  "type": "cloud",
  "cloud": {
    "deployment": "any"
  }
}
```

### should fail without writing the file when --value is missing

```execute
aux4 editor cloud set --file test-editor.aux4; aux4 editor show --file test-editor.aux4
```

```error:partial
--value is required
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
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

### should reject an invalid cloud deployment value

```execute
aux4 editor cloud set --file test-editor.aux4 --value '{"deployment":"nope"}'
```

```error:partial
ERROR  [metadata-cloud]
```

## remove

```file:test-editor.aux4
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "type": "cloud",
  "cloud": { "deployment": "any" },
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

### should remove the cloud configuration and the type field

```execute
aux4 editor cloud remove --file test-editor.aux4 >/dev/null && aux4 editor show --file test-editor.aux4
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
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
