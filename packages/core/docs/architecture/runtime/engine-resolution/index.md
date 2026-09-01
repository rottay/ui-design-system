# Engine resolution mechanics

This is an operational annex to the repository's
[architecture authority](../../../../../../docs/ARCHITECTURE.md). The authority
defines ownership and dependency direction; this page explains how a component
is selected at runtime.

## Physical engines and custom packs

The package has three physical engines: `classic`, `modern`, and `rustic`.
`custom` is a pack-scoped registry identity, not a fourth implementation tree.
When a custom pack does not register a component, resolution continues through
the configured physical fallback (`classic` by default).

An engine-backed owner exposes its facade at `index.tsx` and may add only the
branches it needs:

```text
Button/
  index.tsx
  contracts/index.ts
  runtime/<capability>/index.ts
  engines/
    classic/index.tsx
    modern/index.tsx
    rustic/index.tsx
  compound/<part>/index.tsx
  tests/*.test.tsx
```

The local direction is `contracts -> runtime -> engines -> compound`. Missing
implementations are handled by registry fallback; fake forwarding engine files
do not model an implementation.

## Selection flow

`DesignSystemProvider` resolves a physical engine from the explicit
`forceEngine`, the code-owned vertical, a bundled first-party tenant pin, or
the `classic` fallback, in that order. The resulting `EngineProvider` context
is read by `createEngineComponent()`.

The factory then:

1. applies a per-component engine override when present;
2. resolves the active pack when the selected identity is `custom`;
3. delegates a missing pack registration to the configured physical engine;
4. lazy-loads the selected implementation; and
5. renders it through the package suspense and engine-error boundary.

A DB-managed tenant cannot select a product engine. Tenant customization may
change bounded appearance, but the code-owned vertical remains responsible for
rendering identity.

## Pack isolation

Registrations are keyed by component pack. Two tenants may therefore register
different implementations for the same component without sharing registry
state. Global configuration controls fallback behavior; component
registrations remain pack-scoped.
