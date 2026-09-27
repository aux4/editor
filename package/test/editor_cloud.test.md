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

### should reject the change when it would leave the file failing lint validation

`cloud set` runs the same full-file lint gate as every other write. Here the
target file already carries an invalid 'version' (caught by aux4/lint's
core 'metadata-version' rule), so the write must be rejected and the file
left untouched — regardless of whether the given cloud value itself is
recognized by the installed aux4/lint version.

```file:test-editor-invalid.aux4
{
  "scope": "aux4",
  "name": "greet",
  "version": "not-a-semver",
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

```execute
aux4 editor cloud set --file test-editor-invalid.aux4 --value '{"deployment":"any"}'; aux4 editor show --file test-editor-invalid.aux4
```

```error:partial
ERROR  [metadata-version]
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "not-a-semver",
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
