# WO-SKIN-06 addendum — LoadingOverlay orphan recovery

## Why this addendum exists

`structures/feedback/loading-overlay/index.tsx` is a live, publicly exported structure used by the
Platform payments and refunds screens. It appears in the fleet census with five inline paint sites,
but no revised WO-SKIN-06 checkpoint claimed it. Its injected keyframe string adds two more paint-family
`transform` declarations that the historical inline counter cannot see.

This was Stage-1 extraction work, not a residual; the certification below records its closure.

## Accepted pre-migration contract

- Five inline paint sites: root `background`, `backdropFilter`, `borderRadius`, message `color`, dot
  `color`.
- Two embedded-CSS paint declarations: `transform: scale(1)` and `transform: scale(1.08)` in
  `lo-pulse`.
- Layout, opacity, animation timing/delay and `visible=false` behavior are not paint migration scope.
- The consumer owns the optional logo node; the structure owns only its wrapper animation.

The inert pre-step adds the stable scope `ds-loading-overlay` and parts `root`, `logo`, `message` and
`dot` without moving declarations. Its unit contract covers modern and rustic engines, including the
hidden branch and exact current paint mechanisms. The dedicated production probe captures the real
component under Rottay dark and Bithire light, in both engines.

## Migration law

The migration may add one engine-agnostic unlayered skin and must:

1. Move the five static inline paints to scoped skin rules.
2. Move both complete keyframes to the skin and namespace them as
   `ds-loading-overlay-pulse` / `ds-loading-overlay-dots`.
3. Update only the animation-name references; timing, easing, delays, opacity frames and infinite
   iteration remain byte-equivalent.
4. Delete the per-mount `<style>` block.
5. Leave layout and behavioral inline values untouched.
6. Keep all four pre-migration screenshots byte-identical without snapshot updates.

The final gate is inline `5 -> 0`, embedded CSS `2 -> 0`, unit/anatomy green, both skin entrypoints
wired, production builds green and two independent no-update visual passes.

## Certified result — 2026-07-14

The orphan is recovered without changing its public API, layout, timing, copy or consumer-owned
logo slot:

- `loading-overlay/index.tsx` now has `0` of the `5` original inline paint declarations and no
  runtime `<style>` producer.
- Both complete keyframes live in the unlayered, engine-agnostic
  `components/skin/loading-overlay.css`; only their globally-safe names changed to
  `ds-loading-overlay-pulse` and `ds-loading-overlay-dots`.
- The component contributes `0` embedded-CSS paint declarations (`2 -> 0`) and both canonical CSS
  entrypoints import the new skin.
- The focused contract is green (`5/5`), including modern/rustic anatomy and the hidden branch.
- Core and showroom production builds are green.
- The four committed Rottay-dark/Bithire-light × modern/rustic screenshots passed two independent
  `4/4` Playwright runs without snapshot updates. Computed background, blur, radius, text/dot color
  and both animation names are also asserted in the browser.

No new residual or exemption was introduced. The global fleet and embedded-CSS baselines are
regenerated only after this recovery so the gate records the post-migration tree rather than
grandfathering the removed channels.
