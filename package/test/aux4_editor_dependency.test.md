# aux4 aux4 editor dependency

```file:test-editor.aux4
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "dependencies": ["aux4/config"],
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

### should add a dependency

```execute
aux4 aux4 editor dependency add --file test-editor.aux4 --dependency aux4/lint
```

```expect
Dependency 'aux4/lint' added
```

### should fail when a dependency on the same package already exists

```execute
aux4 aux4 editor dependency add --file test-editor.aux4 --dependency aux4/config@^2.0.0
```

```error:partial
Dependency 'aux4/config' already exists
```

### should fail without writing the file when --dependency is missing

```execute
aux4 aux4 editor dependency add --file test-editor.aux4; aux4 aux4 editor show --file test-editor.aux4
```

```error:partial
--dependency is required
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "dependencies": [
    "aux4/config"
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

### should remove a dependency, matching by scope/name

```execute
aux4 aux4 editor dependency remove --file test-editor.aux4 --dependency aux4/config
```

```expect
Dependency 'aux4/config' removed
```

### should fail when the dependency does not exist

```execute
aux4 aux4 editor dependency remove --file test-editor.aux4 --dependency aux4/missing
```

```error:partial
Dependency 'aux4/missing' not found
```
