# aux4 editor license

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

```afterEach
rm -f LICENSE
```

### should set the license field to the SPDX identifier

```execute
aux4 editor license set --file test-editor.aux4 --name apache-2.0 --owner "Jane Doe" --year 2024 >/dev/null && grep license test-editor.aux4
```

```expect:partial
"license": "Apache-2.0"
```

### should write a LICENSE file next to the .aux4 file

```execute
aux4 editor license set --file test-editor.aux4 --name mit --owner "Jane Doe" --year 2024 >/dev/null && grep -m1 "MIT License" LICENSE
```

```expect:partial
MIT License
```

### should fail without writing when --owner is missing

```execute
rm -f LICENSE; aux4 editor license set --file test-editor.aux4 --name mit
```

```error:partial
--owner is required
```

```execute
ls LICENSE
```

```error:partial
No such file or directory
```

### should fail without writing when --name is missing

```execute
aux4 editor license set --file test-editor.aux4 --owner "Jane Doe"
```

```error:partial
--name is required
```

### should leave both files untouched when the .aux4 has no name field

```file:test-editor-noname.aux4
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
rm -f LICENSE; aux4 editor license set --file test-editor-noname.aux4 --name mit --owner "Jane Doe"
```

```error:partial
cannot determine --project
```

```execute
ls LICENSE
```

```error:partial
No such file or directory
```

### should clean up the LICENSE it created when the .aux4 write fails lint

```file:test-editor-badversion.aux4
{
  "scope": "aux4",
  "name": "greet",
  "version": "not-a-version",
  "profiles": [
    {
      "name": "main",
      "commands": []
    }
  ]
}
```

```execute
rm -f LICENSE; aux4 editor license set --file test-editor-badversion.aux4 --name mit --owner "Jane Doe"
```

```error:partial
Lint validation failed
```

```execute
ls LICENSE
```

```error:partial
No such file or directory
```

```execute
grep -c license test-editor-badversion.aux4 || true
```

```expect
0
```

## list

### should list the available licenses

```execute
aux4 editor license list --name apache-2.0
```

```expect:partial
apache-2.0
```
