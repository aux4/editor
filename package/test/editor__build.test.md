# aux4 editor build

```file:test-build/.aux4
{
  "scope": "aux4",
  "name": "buildtest",
  "version": "0.1.0",
  "description": "A package used to test aux4 editor build",
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

```file:test-build/LICENSE
MIT License
```

```file:test-build/README.md
# buildtest
```

```afterAll
rm -rf test-build test-build-out
```

## success

```afterEach
rm -f test-build/*.zip
```

### should lint and build a distributable zip into the package directory by default

```execute
aux4 editor build --file test-build/.aux4 >/dev/null; ls test-build/*.zip | head -1
```

```expect:partial
test-build/aux4_buildtest_0.1.0.zip
```

### should build into a separate --out directory

```execute
mkdir -p test-build-out && aux4 editor build --file test-build/.aux4 --out ../test-build-out >/dev/null; ls test-build-out/*.zip | head -1
```

```expect:partial
test-build-out/aux4_buildtest_0.1.0.zip
```

### should not accumulate stale zips when building twice into the package directory

```execute
aux4 editor build --file test-build/.aux4 >/dev/null && aux4 editor build --file test-build/.aux4 >/dev/null; ls test-build/*.zip | wc -l | tr -d ' '
```

```expect
1
```

## lint failure

```file:test-build-bad/.aux4
{
  "scope": "aux4",
  "name": "buildtest",
  "version": "not-a-version",
  "profiles": [
    {
      "name": "main",
      "commands": []
    }
  ]
}
```

```afterAll
rm -rf test-build-bad
```

### should abort without building when lint rejects the package

```execute
aux4 editor build --file test-build-bad/.aux4
```

```error:partial
Lint validation failed
```

```execute
ls test-build-bad/*.zip
```

```error:partial
No such file or directory
```
