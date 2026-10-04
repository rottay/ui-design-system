---
"@rottay/design-system": patch
---

WO-RET-01: the codemod kit stops reporting an import as if it were a use, for
the two `member-changed` entries whose change it can prove absent on syntax
alone. No public surface moves: nothing under `scripts/` is published, and no
entrypoint, subpath, export or signature changes.

All under `packages/core/scripts/maintain/codemods/`:

- A `member-changed` entry may state `memberProof: "spelling"`. It is lawful
  only for members that are removed, renamed or retyped, never for one the type
  newly requires. For such an entry a file is reported when it spells one of the
  members as an identifier, a property name or a string literal, whatever the
  spelling is bound to, and is not reported when it spells none. Comments and JSX
  text are not read. A re-export, and a binding that leaves the file through a
  type alias, an `extends` or a local export, stay reported. So does a file that
  spells none of the members in exactly three cases: an assertion or `satisfies`
  whose type names the entry export (directly, aliased, namespaced, as an
  `import()` type, or inside a wrapper such as `Partial<…>`, an array or a
  union) over a value the file does not write; an object-literal spread
  (`{ ...value }`) of a value the file does not write; and a direct
  `Object.assign(…)` call with an argument the file does not write. None of the
  three runs the excess-property check and the provider refuses no legacy key.
  The report says
  where each spelling is and what it is; an object written under an `as`
  assertion is named as such, because the assertion hides the excess property
  from the typecheck and the kit is then the only reader of it.
  `member-changed/.#TenantConfig` states it for `brandTheme`, `tokenOverrides`,
  `personality`, `appearance` and `engine`.
- A `member-changed` entry may state `maxArguments`. A design-system-resolved
  direct call that passes at most that many arguments and spreads none is not
  reported; a longer call, a spread argument, and the function passed, aliased,
  exported or named in a type are. `member-changed/.#baselineFor` states 2.
- The loader refuses either field on another class, `memberProof` without
  members, both on one entry, and a malformed value. The map test pins which
  entries state a proof and checks each against the published declaration:
  `TenantConfig` declares none of the five members and `baselineFor` takes two
  parameters.
- Every other `member-changed` entry is reported at each resolved use exactly as
  before.

Not followed, and said in the `TenantConfig` entry's `impossible`: everything
else that carries a removed member without spelling it. That includes a member
name computed or spelled only in another file, an assertion whose type reaches
the export without naming it (an indexed access such as `P['config']`), a JSX
spread attribute, and the annotation relay: `const config: TenantConfig = legacy`,
`return legacy` from a function typed to return the export, and `mount(legacy)`
into a typed parameter. The annotation relay is accepted as a file-local limit
by coordinator ruling and pinned as silence by the `annotation-relay` fixture.
