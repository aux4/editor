# aux4 aux4 editor command

```file:test-editor.aux4
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
          "execute": ["log:Hello, ${name}!"],
          "help": {
            "text": "Say hello",
            "variables": [{ "name": "name", "default": "World" }]
          }
        },
        { "name": "bye", "execute": ["log:one", "log:two"], "help": { "text": "Say bye" } }
      ]
    }
  ]
}
```

## add

### should add a new command

```execute
aux4 aux4 editor command add --file test-editor.aux4 --profile main --name farewell --execute 'log:Bye!' --helpText "Say bye"
```

```expect
Command 'farewell' added to profile 'main'
```

### should fail when the command already exists

```execute
aux4 aux4 editor command add --file test-editor.aux4 --profile main --name hello --execute 'log:hi'
```

```error:partial
Command 'hello' already exists in profile 'main'
```

## set

### should replace execute lines and help text

```execute
aux4 aux4 editor command set --file test-editor.aux4 --profile main --name bye --execute 'log:Farewell!' --helpText "Say farewell" >/dev/null && aux4 aux4 editor show --file test-editor.aux4 --profile main --command bye
```

```expect:json
{
  "name": "bye",
  "execute": [
    "log:Farewell!"
  ],
  "help": {
    "text": "Say farewell"
  }
}
```

## rename

### should rename a command

```execute
aux4 aux4 editor command rename --file test-editor.aux4 --profile main --name bye --newName farewell2
```

```expect
Command 'bye' renamed to 'farewell2' in profile 'main'
```

### should fail when the new name is already taken

```execute
aux4 aux4 editor command rename --file test-editor.aux4 --profile main --name bye --newName hello
```

```error:partial
Command 'hello' already exists in profile 'main'
```

## remove

### should remove a command

```execute
aux4 aux4 editor command remove --file test-editor.aux4 --profile main --name bye
```

```expect
Command 'bye' removed from profile 'main'
```

### should fail when the command does not exist

```execute
aux4 aux4 editor command remove --file test-editor.aux4 --profile main --name missing
```

```error:partial
Command 'missing' not found in profile 'main'
```
