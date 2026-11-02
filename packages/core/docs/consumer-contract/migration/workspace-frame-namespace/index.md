# Guide — the workspace frame namespace split

Cross-app guide. Release declaration: the changeset of the lot that ships it.
The contract explanation is in the docs-engineering compilers page, section
"Workspace chrome: one tenant field, one reader-owned name per consumer".

## What changed

`:where(.ds-workspace-frame)` used to paint straight from WorkspaceShell's names.
Now it owns `--ds-workspace-frame-{bg,border,shadow}`, declared on the frame
itself, and paints from those. The rests are unchanged:

| Reader | Before | After |
| --- | --- | --- |
| frame `border` | `var(--ds-workspace-shell-border, var(--ds-color-border))` | `var(--ds-workspace-frame-border)` |
| frame `background` | `var(--ds-workspace-shell-bg)` | `var(--ds-workspace-frame-bg)` |
| frame `box-shadow` | `var(--ds-workspace-shell-shadow, var(--ds-card-shadow))` | `var(--ds-workspace-frame-shadow)` |
| frame element | declares nothing | declares each name as `var(<shell name>, <its rest>)`, the rests being `transparent`, `var(--ds-color-border)` and `var(--ds-card-shadow)` |
| `--list` / `--form` element ground | declares `--ds-workspace-shell-bg` | declares `--ds-workspace-frame-bg` (same gradients) |
| frame `::before` wash | `var(--ds-workspace-shell-overlay)` | unchanged |

The tenant contract does not change. `chrome.shell.{bg,border,shadow,overlay}`
keeps its field names, schema admission and iso shape, and it still compiles to
the same four shell names and to nothing else. The shell names are the tenant
door: WorkspaceShell reads them, and the frame forwards them into its own names,
so a tenant override reaches both exactly as before. The compiler writes no
frame name.

## Who is affected

The ground declaration is what moved on `--list` and `--form`, so the effect is
bounded to those two frames and what sits inside them:

- A read of `--ds-workspace-shell-bg` on a `--list` / `--form` frame, or nested
  inside one, including the DS's own WorkspaceShell seamless ground. It used to
  see the element gradient. It now sees the tenant's value when the tenant
  states `chrome.shell.bg`, and otherwise nothing, so it takes its own fallback.
- A base or `--detail` frame nested inside `--list` / `--form`. It used to
  inherit the gradient. With `chrome.shell.bg` stated it now paints the tenant's
  value, and with no statement it paints its own transparent rest over the
  ancestor.
- A declaration of `--ds-workspace-shell-bg` on a `--list` / `--form` frame. The
  frame paints the `--ds-workspace-frame-bg` its variant declares, so that
  declaration no longer reaches the frame's ground.

No other read moves. Reads of `--ds-workspace-shell-border` and
`--ds-workspace-shell-shadow` are not affected, and neither is a read of
`--ds-workspace-shell-bg` on a base or `--detail` frame outside those two
variants: the DS did not declare those names there before and does not now.

In the DS alone, a top-level frame of any variant keeps its ground, border and
elevation, with and without a tenant statement, including inside a scope that
redeclares `--ds-color-border` or `--ds-card-shadow`. This comes from a
differential cascade model of the stylesheets, not from a browser. The
app-bithire repaint below comes from that app's own reads. No DS component
renders the class, and a static reading of app-bithire finds no screen that
reaches either nested case today. That is a source reading, not a runtime proof.

`--ds-workspace-shell-bg`, `--ds-workspace-shell-border` and
`--ds-workspace-shell-shadow` are compiler tenant channels, not public hooks, so
no application may assign them in any case. `--ds-workspace-shell-overlay` is
outside that rule. It is a declared public hook whose slot is a declared
workspace frame variant, so an application may assign it there, and this release
does not change it.

Census at UI HEAD `9711ac018`, read-only, over each app's tracked files:

- **app-bithire** (installs `@rottay/design-system` 2.19.37). It renders the
  class (`src/ui/surfaces/index.tsx:224`) and repaints it in unlayered CSS.
  - `src/styles/surfaces.css:23-28` and `:34-40` — `--list` / `--form` define
    `--rt-workspace-family-bg: var(--ds-workspace-shell-bg, var(--ds-card-bg, var(--ds-surface-card)))`.
    Today that resolves to the DS element gradient, because the DS declares
    `--ds-workspace-shell-bg` on the `--list` / `--form` element, and that
    declaration masks whatever the element would otherwise inherit. After the
    split the DS declares `--ds-workspace-frame-bg` there instead. Without
    migration the read sees the inherited `--ds-workspace-shell-bg`, so both
    variants **repaint**, in two ways:
    - **No tenant statement.** Nothing is inherited, so the read falls back to
      `--ds-card-bg`.
    - **The tenant states `chrome.shell.bg`.** The compiler still emits
      `--ds-workspace-shell-bg` at the tenant root, so `--list` / `--form`
      inherit the tenant's ground and paint it instead of the DS gradient.
      Before the split the element declaration kept those two variants on the
      gradient even when the tenant stated a ground.
  - `src/styles/surfaces.css:15-18` — base frame
    `var(--rt-workspace-family-bg, var(--ds-workspace-shell-bg, var(--ds-surface-canvas)))`.
    **Not affected, and it must not move.** The DS declares nothing for the
    shell name on a base frame, so this read keeps its tenant value and its
    canvas fallback. `--ds-workspace-frame-bg` always has a value on a frame, so
    reading it here would turn that canvas fallback into `transparent`.
  - `src/styles/surfaces.css:30-32` — `--detail` assigns
    `--ds-workspace-shell-overlay: none`. This is the sanctioned use of the
    public hook. **Not affected, and it stays.**
  - `src/features/home/surface/screens/chat/wiring/styles/index.css:22` reads
    `--ds-workspace-shell-bg` outside any frame. It sees the tenant value, which
    the compiler still emits, so it is **not affected**.
  - Border and shadow are already `--rt-workspace-frame-*` with their own
    fallbacks, so they are **not affected**.
  - `tests/architecture/_shared/shared-card-artifact-cascade.arch.test.ts:58`
    asserts `/var\(\s*--ds-workspace-shell-bg/` inside both the `--list` and the
    `--form` rule, under the title "keeps the compiled tenant shell background
    authoritative in every family". **Affected:** a plain read of
    `--ds-workspace-frame-bg` fails it in both rules. `:55` (the base read) and
    `:59` (no shell declaration in those rules) stay true.
- **app-evnto** — zero references to the workspace names.
- **app-platform** — zero references to the workspace names, but its theme
  operations depend on the package contract pair described next.

## Compiler identity

This release moves `TENANT_THEME_COMPILER_VERSION` from `tenant-theme-compiler@4`
to `tenant-theme-compiler@5`. The version is part of an artifact's identity and
is inside its digest, so:

- Every artifact digest, every digest-derived ETag and every
  `{ tenantId, rowVersion, compilerVersion }` cache key changes, for every
  tenant, whether or not its document states `chrome.shell`.
- Against the last commit on `tenant-theme-compiler@4`, `variables`, mode deltas
  and the CSS body stay byte-identical for the same document, with one exception:
  a document that authors `chrome.table.cellPadding`. For every other document,
  only the version, the digest and the banner line differ.
- An artifact written by `tenant-theme-compiler@4` is refused before use at
  every admission door: `verifyTenantThemeArtifactV1`,
  `emitTenantThemeArtifactForSsr`, `resolveVisualAuthority`, `mountTenantTheme`
  and the studio preview doors. The refusal reads:

  ```text
  compilerVersion is not tenant-theme-compiler@5: recompile this tenant's stored document with the current compiler and republish the artifact
  ```

A host that compiles from the stored row on a cache miss recompiles on its own,
because the new key misses. It has nothing to republish, so the refusal text is
no reason for its operator to move a row version. A host that persists artifacts
must recompile and republish each one through its sanctioned publish path before
serving it. The stored document itself is not edited. The host owns this
rollout, and the DS reads and writes no tenant data.

### The one byte exception: `chrome.table.cellPadding`

A document that authors this field (`advanced.chrome.table.cellPadding` in v1,
`overrides.chrome.table.cellPadding` in v2 and v3) also emits
`--ds-density-cell-padding` with the authored value, beside the
`--ds-table-cell-padding` it already emitted. That is one more entry in
`variables` and one more line in the CSS body, so the artifact differs by more
than the version, the digest and the banner line. Its mode deltas do not move,
because no stored document can state chrome per mode. A studio draft can: a mode
overlay that authors the field gains the name in that mode's block.

A standalone table renders as before. In Modern, a tenant or preview scope nested
inside a density container now keeps the authored value, where the container's
preset used to win. This reading comes from the skin's cascade, not from a browser.

Every other document stays byte-identical because the version string and this one
write are the only code changes between the two commits that reach the output.

This compares two compiles of one document. It does not compare a recompile with
an artifact already stored, which can differ by more. Output also moved under
`tenant-theme-compiler@4` with no version move: for example, the dark-ground
elevation correction moved the elevation rows of documents that state
`surfaces.elevation` as `flat` or `elevated`. Release 2.19.37, which the apps
install, carries `tenant-theme-compiler@4`, and its output differs from that
last commit by more than elevation. Release 2.19.36 carries
`tenant-theme-compiler@3`. A host recompiles either way, and a stored artifact is
not a byte baseline for that recompile.

### `@rottay/tenancy` is a third owner of this identity

Beside the DS, which owns the constant, and each host, which owns its artifacts,
`@rottay/tenancy` exports its own `TENANT_THEME_COMPILER_VERSION` literal
(`platform/packages/platform/tenancy/domain/contracts/tenant-theme/index.ts:1452`).
app-platform compares the two, with the document and config schema digests, in
`assertTenantThemePackageParity`
(`src/server/features/organization/tenants/whitelabel-drafts/index.ts:142-168`).
`resolveVerticalEnvelope` calls it first, so a mismatch fails closed in
`getTenantThemeEditorContract`, `compileTenantThemePreview`, `saveDraft`,
`publishDraft` and `rollbackToVersion`, with its own error, not the refusal above:

```text
TenantTheme package contract mismatch: compiler version. Align @rottay/design-system and @rottay/tenancy before editing themes.
```

The message names every value that differs, so a pair that also differs on a
digest lists it as well.

Recompiling cannot clear this. The check compares three pairs of package
constants and reads no artifact. app-platform therefore adopts this release only
together with a `@rottay/tenancy` release that matches the DS on all three:
`tenant-theme-compiler@5`, the document schema digest and the config schema
digest. Moving the literal alone does not clear it. The release owner and the
Tenancy owner decide and ship that pair. The DS does not edit Tenancy.

The state at this census is already mismatched in source on all three values.
Tenancy 7.0.1 carries `tenant-theme-compiler@3`, document digest
`sha256-85586096e40f...` and config digest `sha256-722c1a75193e...`. Before this
release the DS carries `tenant-theme-compiler@4`, document digest
`sha256-8443ec5f73c7...` and config digest `sha256-67588d783a37...`, and this
release moves neither digest. Tenancy computes its digests over its own copy of
the schema (`tests/unit/domain/contracts/tenant-theme-config.test.ts:62-63`), so
matching them needs a schema resync, not a literal edit. The installed pair was
not measured: app-platform pins `@rottay/tenancy` 6.0.2 with
`@rottay/design-system` 2.19.37, and it has no `node_modules` at this census.

## Migration (app owner, in the lot that adopts the release)

### app-bithire

The app-bithire owner chooses one of two alternatives for the two `--list` /
`--form` reads in `src/styles/surfaces.css` (`:25`, `:37`). Both paint the same
once the release is adopted. Both leave the base frame read, the `--detail`
overlay assignment and the chat wiring read alone. The DS does not choose and
does not edit the app.

1. **Plain read, retargeted assertion.** Change each read from
   `--ds-workspace-shell-bg` to `--ds-workspace-frame-bg`, keeping its fallback
   chain, and in the same edit retarget the assertion at
   `tests/architecture/_shared/shared-card-artifact-cascade.arch.test.ts:58` to
   `/var\(\s*--ds-workspace-frame-bg/`. This must land with the release adoption.
   On the previous release the frame name is undeclared, so the read would fall
   back to `--ds-card-bg`.
2. **Chained read, assertion kept.** Change each read to the chain below, where
   the last argument is the read's existing fallback. The assertion at `:58`
   stays as it is and stays green.

   ```css
   var(--ds-workspace-frame-bg, var(--ds-workspace-shell-bg, var(--ds-card-bg, var(--ds-surface-card))))
   ```

   This also tolerates version skew. On the previous release the frame name is
   undeclared and the read still reaches the element gradient through the shell
   name. Once the release is adopted the frame name always has a value on these
   frames, so the inner arms are reachable only on the previous release.

Either way, the test's title says the compiled tenant shell background is
authoritative in every family. On `--list` / `--form` it was not the painted
result before this release and is not after it, because the element ground masks
the tenant value. The owner decides whether that title stays.

### app-platform

Adopt the release only with the paired `@rottay/tenancy` described above.

### Hosts

Recompile every persisted artifact as described above.

## Verification

- With no tenant statement, the base, `--list`, `--form` and `--detail` frame
  computed `background`, `border-color` and `box-shadow` are identical before and
  after adoption on each first-party vertical.
- With a tenant stating `chrome.shell.{bg,border,shadow}`, the artifact declares
  each shell name with the stated value and no frame name. The frame and
  WorkspaceShell paint it as before.
- With a tenant stating `chrome.shell.bg`, the `--list` and `--form` frames
  keep the DS element gradient after the edit, exactly as before the split.
  Negative control: before the edit, the same tenant repaints both variants to
  its own ground.
- With no tenant statement, the app-bithire base frame keeps its
  `--ds-surface-canvas` ground. Negative control: pointing that read at
  `--ds-workspace-frame-bg` turns it transparent.
- In app-bithire, `rg -n "workspace-frame-bg" src/styles/surfaces.css` returns
  the two `--list` / `--form` reads after the edit, under either alternative.
  `rg -n "workspace-shell-bg" src/styles/surfaces.css` returns only the base
  frame read under the plain read, and the base frame read plus one chained arm
  in each of the two rules under the chained read.
- `shared-card-artifact-cascade.arch.test.ts` passes: under the plain read only
  after `:58` is retargeted, under the chained read unchanged. `:55` and `:59`
  are unchanged under both.
- Presenting an artifact stored before the release is refused with the message
  above, and recompiling its stored document clears the refusal.
- A document that authors `chrome.table.cellPadding` recompiles with both
  `--ds-table-cell-padding` and `--ds-density-cell-padding` at the authored value.
  Negative control: the same document without that field emits neither name, and
  its `variables`, mode deltas and CSS body match the last commit on
  `tenant-theme-compiler@4`.
- In app-platform, with a pair that matches on all three values installed, the
  five theme operations above pass `assertTenantThemePackageParity`. Negative
  controls: with the DS on `tenant-theme-compiler@5` and Tenancy on any other
  literal, or with both on `tenant-theme-compiler@5` and either schema digest
  different, they throw the package contract mismatch, and recompiling does not
  clear it.

## Rollback

Revert the app edit, and the test edit if that alternative was chosen, together
with the release adoption. app-platform reverts the paired `@rottay/tenancy` with
it. The stored documents were never edited. The compile is replayable byte for
byte, so recompiling them with the previous release restores the previous
artifacts, and a document that authors `chrome.table.cellPadding` loses the added
name with them. If the host keeps the prior artifacts (preimages) by digest, it can
remount them instead, once it runs the previous release again: the current
compiler refuses them.
