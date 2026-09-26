# aux4 editor profile

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
          "name": "greeter",
          "execute": ["profile:greeter"],
          "help": { "text": "Go to the greeter profile" }
        }
      ]
    },
    {
      "name": "greeter",
      "commands": [
        {
          "name": "hi",
          "execute": ["log:hi"],
          "help": { "text": "Say hi" }
        }
      ]
    }
  ]
}
```

## add

### should add a new profile

```execute
aux4 editor profile add --file test-editor.aux4 --profile deploy
```

```expect
Profile 'deploy' added
```

### should fail when the profile already exists

```execute
aux4 editor profile add --file test-editor.aux4 --profile main
```

```error:partial
Profile 'main' already exists
```

### should fail without writing the file when --profile is missing

```execute
aux4 editor profile add --file test-editor.aux4; aux4 editor show --file test-editor.aux4
```

```error:partial
--profile is required
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
          "name": "greeter",
          "execute": [
            "profile:greeter"
          ],
          "help": {
            "text": "Go to the greeter profile"
          }
        }
      ]
    },
    {
      "name": "greeter",
      "commands": [
        {
          "name": "hi",
          "execute": [
            "log:hi"
          ],
          "help": {
            "text": "Say hi"
          }
        }
      ]
    }
  ]
}
```

## remove while still referenced

### should refuse to remove a profile that main still references

```execute
aux4 editor profile remove --file test-editor.aux4 --profile greeter
```

```error:partial
Command 'greeter' in profile 'main' references non-existent profile
```

## rename

### should rename a profile and cascade the profile: reference

```execute
aux4 editor profile rename --file test-editor.aux4 --profile greeter --to greetings >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command greeter
```

```expect:json
{
  "name": "greeter",
  "execute": [
    "profile:greetings"
  ],
  "help": {
    "text": "Go to the greeter profile"
  }
}
```

### should fail without writing the file when --to is missing

```execute
aux4 editor profile rename --file test-editor.aux4 --profile greeter; aux4 editor show --file test-editor.aux4 --profile main --command greeter
```

```error:partial
--to is required
```

```expect:json
{
  "name": "greeter",
  "execute": [
    "profile:greeter"
  ],
  "help": {
    "text": "Go to the greeter profile"
  }
}
```

### should fail without writing the file when --profile is the literal 'undefined'

```execute
aux4 editor profile rename --file test-editor.aux4 --profile undefined --to somethingElse; aux4 editor show --file test-editor.aux4 --profile main --command greeter
```

```error:partial
--profile is required
```

```expect:json
{
  "name": "greeter",
  "execute": [
    "profile:greeter"
  ],
  "help": {
    "text": "Go to the greeter profile"
  }
}
```

## remove after clearing the reference

### should remove the now-unreferenced profile

```execute
aux4 editor command remove --file test-editor.aux4 --profile main --name greeter >/dev/null && aux4 editor profile remove --file test-editor.aux4 --profile greeter
```

```expect
Profile 'greeter' removed
```
