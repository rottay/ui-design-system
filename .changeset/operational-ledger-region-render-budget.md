---
"@rottay/design-system": patch
---

The Modern OperationalLedger no longer re-renders for a purely visual state of its scroll region.

`[data-part='table-region']` took its interaction state from a hook called in
the ledger itself, so every pointer enter, press, release and leave over the
region re-rendered every row to restamp an attribute no rule paints. The region
is now its own component and receives the table as `children`; it tracks only
`focusVisible`, the one state the skin reads.

Measured (React Profiler, 12 entries): five pointer cycles over the region cost
20 full ledger commits before and 0 after; a keyboard focus in and out costs 2
commits of the region element alone and 0 ledger renders.

The region's `data-state` is now `focus-visible` on a keyboard focus and absent
otherwise. It no longer carries `hovered`, `pressed` or `focused`; no shipped
rule selects them on this part. Role, tab stop, label, keyboard scrolling and
the tenant focus signature are unchanged. No visual change.

Internal: `useInteractionState` accepts an optional `tracks` list. Omitted, the
hook behaves exactly as before. The hook is not exported from any package
entrypoint.
