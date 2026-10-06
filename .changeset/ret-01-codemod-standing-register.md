---
"@rottay/design-system": patch
---

WO-RET-01 (AM-1, R5′): the codemod kit's `--check` reads a standing register of
the reports it may let stand. No public surface moves: nothing under `scripts/`
is published, and no entrypoint, subpath, export or signature changes.

All under `packages/core/scripts/maintain/codemods/`:

- A `member-changed` report carries `proof` as data: `import` when the entry
  states no member proof; `spelled`, `escapes` or `carrier` for what the
  spelling proof found. A failed arity proof, or a site the kit does not follow,
  carries none. The message text is unchanged.
- `standing-reports/index.json` holds rows `{ id, file, count, class, proof,
  why }` by literal path (no glob, no directory), relative to the repository
  root, and a `ceiling` header equal to the sum of the counts. There are three
  closed classes: `retirement-assertion` (a core test file, reason
  `string-literal` or `unmapped-unpublished-subpath`, no `proof`);
  `member-report` (a showroom file, a report-only `member-changed` entry,
  `proof` `spelled` or `import`); and `member-carrier` (the same, `proof`
  `carrier`). `escapes` is admitted by no class, and neither is a rewrite.
- `--check` is red on any rewrite, any report no row names, a live count above
  or below its row (including zero), a live `proof` that differs from the pin,
  and a row whose class does not admit its id, path, reason or proof. It prints
  `standing: <n> report(s) in <m> row(s), ceiling <c>`. A row the run does not
  cover (its file is outside the operands, or its id is outside `--class` /
  `--only`) is counted and not judged.
- `--no-standing` restores the raw view: exit 1 while any finding remains, and
  it prints `standing: not read (--no-standing)`. `--standing <path>` reads
  another register, with paths relative to the cwd, and prints it on the
  `standing:` line. Both need `--check`.
- The CLI test pins the adoption roster: 18 (id, file) keys with count, class
  and proof, 25 reports, 17 files, and a sub-ceiling of 3 `member-carrier` rows.
  A register row outside the roster, above its adoption count or re-classed is
  red, so the register moves down by editing the register alone.
