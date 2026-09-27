# aux4 editor tag

```file:test-editor.aux4
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "tags": ["existing"],
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

### should add a new tag

```execute
aux4 editor tag add --file test-editor.aux4 --tag cli
```

```expect
Tag 'cli' added
```

### should fail when the tag already exists

```execute
aux4 editor tag add --file test-editor.aux4 --tag existing
```

```error:partial
Tag 'existing' already exists
```

### should fail without writing the file when --tag is missing

```execute
aux4 editor tag add --file test-editor.aux4; aux4 editor show --file test-editor.aux4
```

```error:partial
--tag is required
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "tags": [
    "existing"
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

### should remove a tag

```execute
aux4 editor tag remove --file test-editor.aux4 --tag existing
```

```expect
Tag 'existing' removed
```

### should fail when the tag does not exist

```execute
aux4 editor tag remove --file test-editor.aux4 --tag missing
```

```error:partial
Tag 'missing' not found
```
