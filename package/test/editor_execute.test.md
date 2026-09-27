# aux4 editor execute

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
          "execute": ["log:one", "log:two"],
          "help": { "text": "Say hello" }
        }
      ]
    }
  ]
}
```

## add

### should append an execute line by default

```execute
aux4 editor execute add --file test-editor.aux4 --profile main --command hello --line 'log:three'
```

```expect
Execute line added to command 'hello' in profile 'main'
```

### should fail without writing the file when --line is missing

```execute
aux4 editor execute add --file test-editor.aux4 --profile main --command hello; aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```error:partial
--line is required
```

```expect:json
{
  "name": "hello",
  "execute": [
    "log:one",
    "log:two"
  ],
  "help": {
    "text": "Say hello"
  }
}
```

### should insert an execute line at a given index

```execute
aux4 editor execute add --file test-editor.aux4 --profile main --command hello --line 'log:zero' --index 0 >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "log:zero",
    "log:one",
    "log:two"
  ],
  "help": {
    "text": "Say hello"
  }
}
```

## set

### should replace the execute line at the given index

```execute
aux4 editor execute set --file test-editor.aux4 --profile main --command hello --index 0 --line 'log:first'
```

```expect
Execute line at index 0 updated on command 'hello' in profile 'main'
```

### should fail on an out-of-range index

```execute
aux4 editor execute set --file test-editor.aux4 --profile main --command hello --index 99 --line 'log:nope'
```

```error:partial
Execute index 99 out of range for command 'hello'
```

## remove

### should remove the execute line at the given index

```execute
aux4 editor execute remove --file test-editor.aux4 --profile main --command hello --index 1 >/dev/null && aux4 editor show --file test-editor.aux4 --profile main --command hello
```

```expect:json
{
  "name": "hello",
  "execute": [
    "log:one"
  ],
  "help": {
    "text": "Say hello"
  }
}
```

### should fail on an out-of-range index

```execute
aux4 editor execute remove --file test-editor.aux4 --profile main --command hello --index 5
```

```error:partial
Execute index 5 out of range for command 'hello' (0-1)
```
