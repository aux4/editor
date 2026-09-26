#### Description

Lints the package directory derived from `--file` (`dirname(--file)`) and, if lint passes, builds
it into a distributable zip by running `aux4 aux4 pkger build --out <out>` in that directory.

- If any lint issue has severity `error`, the errors are printed, the command exits non-zero, and
  no build is attempted.
- `--out` defaults to `.`, matching `aux4 aux4 pkger build`'s own default — i.e. the zip is written
  into the package directory itself.
- When the resolved output directory is the package directory itself (the default, or any `--out`
  that resolves to the same path), any pre-existing `*.zip` files in it are removed **before**
  building. This guards against the recursive-zip trap: `aux4 aux4 pkger build` zips the whole
  package directory, so a stale zip left over from a previous build would otherwise get swept into
  the new archive and grow it on every run.

#### Usage

```bash
aux4 editor build [--file <path>] [--out <dir>]
```

--file    Path to the .aux4 file; the package directory is `dirname(--file)` (default: `.aux4`)
--out     Output directory for the built zip (default: `.`)

#### Example

```bash
aux4 editor build --out dist
```

```text
aux4/my-package:0.1.0 built at dist/my-package-0.1.0.zip
```
