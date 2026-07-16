# Iconography fleet census — 2026-07-16

This census separates the temporary supplier-shaped compatibility catalog from
the governed semantic product language. It is planning evidence for
DS-IMP-090 through DS-IMP-093; it does not complete or advance those source
items by itself.

## Measured state

The design-system package currently exposes two different layers:

- 328 legacy `FooIcon` compatibility aliases backed by 327 distinct Lucide
  glyphs. These are supplier-shaped names and are not the target product API.
- 50 governed semantic `IconName` values in corpus v3. Six BitHire files use 31
  of them. Platform and Evnto have not adopted the semantic facade yet.

Static fleet demand, counting real source imports and the Evnto icon barrel:

| Consumer | Runtime supplier demand | Unique supplier glyph names | Main containment seam |
| --- | ---: | ---: | --- |
| BitHire | 37 specifiers in 3 files | 32 | legacy public landing |
| Platform | 989 specifiers in 195 files | 224 | 95 files mix Lucide and DS icons |
| Evnto | 768 specifiers through 113 barrel consumers | 183 | wildcard `src/ui/icons` re-export |
| Fleet union | — | 312 | 17 concepts occur in every app |

BitHire also has 95 files coupled to the `LucideIcon` type. The design system
itself has 332 Lucide names in source. No product app directly imports
Phosphor, Hugeicons, Heroicons, Tabler or `react-icons`; suppliers remain an
adapter concern.

High-frequency glyph names cannot be promoted mechanically. For example,
`Users` represents candidates, staff, attendees, members or teams depending on
the vertical. The migration source therefore records candidate meanings and
requires review rather than treating glyph names as product semantics.

## Governed target

The intended semantic catalog is **345–430 stable product roles**, not 50 and
not a bulk rename of all 328 aliases:

- 120–140 common foundation roles;
- 90–110 shared capability roles;
- 45–60 irreducible roles for each of BitHire, Platform and Evnto.

Initial namespaces are `action`, `navigation`, `status`, `entity`,
`communication`, `auth`, `security`, `data`, `time`, `location`, `device`,
`media`, `commerce`, `ai`, `bithire`, `platform` and `evnto`. Size, weight,
tone, state and RTL mirroring remain presentation metadata; they do not create
additional semantic IDs.

Marks and larger artwork stay separate:

- `BrandMark` for external/product marks, with pinned provenance;
- `CloudServiceMark` for provider topology;
- `FeaturePictogram` for 32–96px explanatory artwork;
- original vertical signature glyphs governed by DS-IMP-093.

## Generated architecture

A monolithic runtime registry containing 400 static supplier imports would
retain too much code whenever `<Icon name={dynamicName} />` is used. The final
registry is therefore generated from three governed inputs:

1. `corpus/`: supplier-free ID, meaning, family, owner, scope, directionality,
   maturity and corpus version;
2. `adapters/<supplier-version>/`: semantic ID to exact local SSR entrypoint,
   glyph symbol, certified fallback and provenance;
3. `migrations/lucide/`: legacy glyph to one or more candidate semantics,
   confidence and mandatory-review policy.

Code generation emits:

- `IconName` unions and corpus metadata;
- static SSR modules per role;
- bounded resolvers and entrypoints for `core`, `bithire`, `platform` and
  `evnto` packs;
- exhaustive adapter/provenance checks;
- atlas/showroom documentation;
- ESLint allowlists, migration reports and codemod metadata;
- a one-icon and per-pack bundle sentinel.

Dynamic names must declare their allowed pack. Apps cannot select suppliers,
and the browser never downloads an entire vendor catalog merely because one
semantic icon is rendered.

## Migration order

1. Harden supplier containment for import, export-all, subpath, `require` and
   dynamic-import forms; install the blocking rule in all three apps.
2. Replace the Evnto wildcard barrel and the BitHire `LucideIcon` type bridge
   with explicit compatibility contracts.
3. Grow the common semantic foundation to roughly 120 reviewed roles, starting
   with cross-app actions, navigation, states, entities, time and data.
4. Migrate Platform's 95 mixed files, beginning with services, security and
   compliance.
5. Migrate Evnto by events, commerce, venue and staff packs.
6. Migrate BitHire by scoring, settings, applications, interviews and offers.
7. Remove compatibility aliases only after import/export telemetry reaches
   zero; add vertical recipes and signature glyphs under their own authority.

The immediate 50-role corpus remains a bounded architecture canary. It is not
the completion threshold for the iconography program.
