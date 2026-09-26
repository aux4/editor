# aux4 aux4 editor package

```file:test-editor.aux4
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "description": "Say hello",
  "private": true,
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

### should set a scalar metadata field

```execute
aux4 aux4 editor package set --file test-editor.aux4 --field version --value 0.2.0
```

```expect
Package field 'version' set
```

### should set a boolean field via --json true

```execute
aux4 aux4 editor package set --file test-editor.aux4 --field private --value false --json true
```

```expect
Package field 'private' set
```

### should reject an unsupported field

```execute
aux4 aux4 editor package set --file test-editor.aux4 --field bogus --value nope
```

```error:partial
Unsupported metadata field 'bogus'
```

### should fail without writing the file when --value is missing

```execute
aux4 aux4 editor package set --file test-editor.aux4 --field version; aux4 aux4 editor show --file test-editor.aux4
```

```error:partial
--value is required
```

```expect:json
{
  "scope": "aux4",
  "name": "greet",
  "version": "0.1.0",
  "description": "Say hello",
  "private": true,
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

## lint rejection

### should reject an invalid version and leave the file untouched

```execute
aux4 aux4 editor package set --file test-editor.aux4 --field version --value not-a-version
```

```error:partial
ERROR  [metadata-version] Invalid 'version' value 'not-a-version'
```

```execute
aux4 aux4 editor show --file test-editor.aux4
```

```expect:partial
"version": "0.1.0",
```

### should write the invalid version when --noLint true is passed

```execute
aux4 aux4 editor package set --file test-editor.aux4 --field version --value not-a-version --noLint true >/dev/null && aux4 aux4 editor show --file test-editor.aux4
```

```expect:partial
"version": "not-a-version",
```

## remove

### should remove a metadata field

```execute
aux4 aux4 editor package remove --file test-editor.aux4 --field private
```

```expect
Package field 'private' removed
```

### should fail when the field is not set

```execute
aux4 aux4 editor package remove --file test-editor.aux4 --field website
```

```error:partial
Metadata field 'website' is not set
```
