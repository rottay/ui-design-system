# Effect research provenance

This directory archives the exact license bytes inspected for EFX-01. The
source ledger pins repository, revision, license hash and adoption boundary.
It authorizes no copied implementation: every entry keeps `sourceCopied` at
`false`, and React Bits remains restricted research only.

These archived files are repository/CI audit evidence for `reference-only`
research; they are not promised as paths inside the published package because
no upstream source or asset is redistributed. The sole source-authorizing
record is the first-party `rottay-ui-design-system` revision used to certify
`particle-field`; its archived MIT license is hash-pinned exactly like the
research records. Public records use
`licensePathAtRevision` for the path at the exact upstream Git revision. The
audit cross-checks those records against this ledger and refuses a future
`certified` definition unless it is the exact first-party ParticleField source
admitted by the audit.

The Motion Primitives `LICENCE.md` snapshot intentionally ends with the
upstream `app/page.tsx` line. It is part of the file at the pinned revision and
must not be cleaned up locally; the exact-byte hash is the audit evidence.
