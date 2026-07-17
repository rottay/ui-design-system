/**
 * `@rottay/design-system/commercial` — the shared commercial kit.
 *
 * A domain-agnostic, monochrome-only vocabulary for Rottay's commercial surfaces (Overview,
 * Docs, Showroom). Built once here; consumed by all three surfaces so the Monochrome Signature
 * is never re-hand-rolled per surface.
 *
 * Spec: docs-engineering/engineering/design-system/commercial-surfaces/README.md (section 8).
 * Consumers also import the ramp CSS once: `import "@rottay/design-system/commercial.css"`.
 *
 * This is a distinct subpath entry — it is intentionally NOT part of the root `.` barrel.
 */

export * from '../../ui/patterns/commercial';
