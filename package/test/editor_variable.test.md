# aux4 editor variable

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
          "execute": [
            "echo \"Hello, ${name}!\"",
            "log:$nameX unaffected",
            "log:${firstName} unaffected",
            "aux4 something value(name) values(name, other) param(name)"
          ],
          "help": {
            "text": "Say hello",
            "variables": [
              { "name": "name", "text": "Name to greet", "default": "World" },
              { "name": "other", "text": "Other", "default": "" },
              { "name": "language", "text": "Language", "default": "en", "options": ["en", "es"] }
            ]
          }
        }
      ]
    }
  ]
}
```

## add

### should add a new variable

```execute
aux4 editor variable add --file test-editor.aux4 --profile main --command hello --name greeting --text "Greeting"
```

```expect
Variable 'greeting' added to command 'hello' in profile 'main'
```

### should fail without writing the file when --name is missing

```execute
aux4 editor variable add --file test-editor.aux4 --profile main --command hello --text "Greeting"; aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```error:partial
--name is required
```

```expect:json
{
  "name": "hello",
  "execute": [
    "echo \"Hello, ${name}!\"",
    "log:$nameX unaffected",
    "log:${firstName} unaffected",
    "aux4 something value(name) values(name, other) param(name)"
  ],
  "help": {
    "text": "Say hello",
    "variables": [
      {
        "name": "name",
        "text": "Name to greet",
        "default": "World"
      },
      {
        "name": "other",
        "text": "Other",
        "default": ""
      },
      {
        "name": "language",
        "text": "Language",
        "default": "en",
        "options": [
          "en",
          "es"
        ]
      }
    ]
  }
}
```

### should fail when the variable already exists

```execute
aux4 editor variable add --file test-editor.aux4 --profile main --command hello --name name
```

```error:partial
Variable 'name' already exists in command 'hello'
```

### should persist an explicit empty string default

```execute
aux4 editor variable add --file test-editor.aux4 --profile main --command hello --name greeting --default '' >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "echo \"Hello, ${name}!\"",
    "log:$nameX unaffected",
    "log:${firstName} unaffected",
    "aux4 something value(name) values(name, other) param(name)"
  ],
  "help": {
    "text": "Say hello",
    "variables": [
      {
        "name": "name",
        "text": "Name to greet",
        "default": "World"
      },
      {
        "name": "other",
        "text": "Other",
        "default": ""
      },
      {
        "name": "language",
        "text": "Language",
        "default": "en",
        "options": [
          "en",
          "es"
        ]
      },
      {
        "name": "greeting",
        "default": ""
      }
    ]
  }
}
```

### should not add a default property when --default is omitted

```execute
aux4 editor variable add --file test-editor.aux4 --profile main --command hello --name greeting --text "Greeting" >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "echo \"Hello, ${name}!\"",
    "log:$nameX unaffected",
    "log:${firstName} unaffected",
    "aux4 something value(name) values(name, other) param(name)"
  ],
  "help": {
    "text": "Say hello",
    "variables": [
      {
        "name": "name",
        "text": "Name to greet",
        "default": "World"
      },
      {
        "name": "other",
        "text": "Other",
        "default": ""
      },
      {
        "name": "language",
        "text": "Language",
        "default": "en",
        "options": [
          "en",
          "es"
        ]
      },
      {
        "name": "greeting",
        "text": "Greeting"
      }
    ]
  }
}
```

## set

### should update only the properties explicitly passed and leave the rest untouched

```execute
aux4 editor variable set --file test-editor.aux4 --profile main --command hello --name language --default es >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "echo \"Hello, ${name}!\"",
    "log:$nameX unaffected",
    "log:${firstName} unaffected",
    "aux4 something value(name) values(name, other) param(name)"
  ],
  "help": {
    "text": "Say hello",
    "variables": [
      {
        "name": "name",
        "text": "Name to greet",
        "default": "World"
      },
      {
        "name": "other",
        "text": "Other",
        "default": ""
      },
      {
        "name": "language",
        "text": "Language",
        "default": "es",
        "options": [
          "en",
          "es"
        ]
      }
    ]
  }
}
```

### should persist an explicit empty string default on an existing variable

```execute
aux4 editor variable set --file test-editor.aux4 --profile main --command hello --name name --default '' >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "echo \"Hello, ${name}!\"",
    "log:$nameX unaffected",
    "log:${firstName} unaffected",
    "aux4 something value(name) values(name, other) param(name)"
  ],
  "help": {
    "text": "Say hello",
    "variables": [
      {
        "name": "name",
        "text": "Name to greet",
        "default": ""
      },
      {
        "name": "other",
        "text": "Other",
        "default": ""
      },
      {
        "name": "language",
        "text": "Language",
        "default": "en",
        "options": [
          "en",
          "es"
        ]
      }
    ]
  }
}
```

### should leave an existing default unchanged when --default is omitted

```execute
aux4 editor variable set --file test-editor.aux4 --profile main --command hello --name name --text "Updated text" >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "echo \"Hello, ${name}!\"",
    "log:$nameX unaffected",
    "log:${firstName} unaffected",
    "aux4 something value(name) values(name, other) param(name)"
  ],
  "help": {
    "text": "Say hello",
    "variables": [
      {
        "name": "name",
        "text": "Updated text",
        "default": "World"
      },
      {
        "name": "other",
        "text": "Other",
        "default": ""
      },
      {
        "name": "language",
        "text": "Language",
        "default": "en",
        "options": [
          "en",
          "es"
        ]
      }
    ]
  }
}
```

## rename

### should rewrite $name, ${name} and value()/values()/param() references

```execute
aux4 editor variable rename --file test-editor.aux4 --profile main --command hello --name name --to personName >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "echo \"Hello, ${personName}!\"",
    "log:$nameX unaffected",
    "log:${firstName} unaffected",
    "aux4 something value(personName) values(personName, other) param(personName)"
  ],
  "help": {
    "text": "Say hello",
    "variables": [
      {
        "name": "personName",
        "text": "Name to greet",
        "default": "World"
      },
      {
        "name": "other",
        "text": "Other",
        "default": ""
      },
      {
        "name": "language",
        "text": "Language",
        "default": "en",
        "options": [
          "en",
          "es"
        ]
      }
    ]
  }
}
```

### should fail when the new name is already taken

```execute
aux4 editor variable rename --file test-editor.aux4 --profile main --command hello --name other --to language
```

```error:partial
Variable 'language' already exists in command 'hello'
```

## remove

### should remove a variable

```execute
aux4 editor variable remove --file test-editor.aux4 --profile main --command hello --name language
```

```expect
Variable 'language' removed from command 'hello' in profile 'main'
```

### should fail when the variable does not exist

```execute
aux4 editor variable remove --file test-editor.aux4 --profile main --command hello --name missing
```

```error:partial
Variable 'missing' not found in command 'hello'
```
