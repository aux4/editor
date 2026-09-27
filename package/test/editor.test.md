# aux4 editor init / show

## init

```afterAll
rm -f test-editor.aux4 test-editor-bare.aux4 test-editor2.aux4 README.md
```

### should create a new .aux4 file with an empty main profile

```execute
aux4 editor init --file test-editor.aux4 --scope aux4 --name greet --description "Say hello"
```

```expect:partial
Created 'test-editor.aux4'
```

### should scaffold a README.md next to the .aux4 file for a package, with a title and the given description

```execute
cat README.md
```

```expect
# aux4/greet

Say hello
```

### should fail when the file already exists

```execute
aux4 editor init --file test-editor.aux4 --scope aux4 --name greet
```

```error:partial
File 'test-editor.aux4' already exists
```

### should never overwrite an existing README.md on a later init

```execute
echo "# my own docs" > README.md && aux4 editor init --file test-editor2.aux4 --scope aux4 --name greet2 >/dev/null; cat README.md
```

```expect
# my own docs
```

```execute
rm -f test-editor2.aux4
```

### a bare init with no flags writes only profiles, no invented version, and passes lint, and does not scaffold a README.md

```execute
rm -f README.md && aux4 editor init --file test-editor-bare.aux4 >/dev/null && aux4 editor show --file test-editor-bare.aux4
```

```expect:json
{
  "profiles": [
    {
      "name": "main",
      "commands": []
    }
  ]
}
```

```execute
ls README.md
```

```error:partial
No such file or directory
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
aux4 editor show --file test-editor.aux4 --profile main --command hello
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
aux4 editor show --file test-editor.aux4 --profile nope
```

```error:partial
Profile 'nope' not found
```
