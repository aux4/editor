# aux4 aux4 editor init / show

## init

```afterAll
rm -f test-editor.aux4
```

### should create a new .aux4 file with an empty main profile

```execute
aux4 aux4 editor init --file test-editor.aux4 --scope aux4 --name greet --description "Say hello"
```

```expect
Created 'test-editor.aux4'
```

### should fail when the file already exists

```execute
aux4 aux4 editor init --file test-editor.aux4 --scope aux4 --name greet
```

```error:partial
File 'test-editor.aux4' already exists
```

## show

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
        }
      ]
    }
  ]
}
```

### should print a single command as JSON

```execute
aux4 aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "log:Hello, ${name}!"
  ],
  "help": {
    "text": "Say hello",
    "variables": [
      {
        "name": "name",
        "default": "World"
      }
    ]
  }
}
```

### should fail when the profile does not exist

```execute
aux4 aux4 editor show --file test-editor.aux4 --profile nope
```

```error:partial
Profile 'nope' not found
```
