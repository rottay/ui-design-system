---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-BUTTON-BUSY). Three deprecated members retire from the public `ButtonProps`: `loading`, `loadingText` and `asChild`. `Button.Icon` follows the family: its own `loading` prop, which carried no marker, is renamed `pending`. `pending` and `pendingLabel` are the only busy API of `Button`. The census covers `packages/core/src`, `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform (2026-10-03, TypeScript AST plus the codemod kit in dry-run).

`ButtonProps.loading` -- removed; `pending` is the busy prop. Both always meant the same posture (`disabled`, `aria-disabled`, `aria-busy`, a spinner, no click), and they render the same on Classic and Rustic, byte for byte. On Modern the swap is visible in the DOM in three ways, measured by rendering the old prop at the previous commit and the new one after it:

- the stamped attribute is `data-pending="true"` where it was `data-loading="true"`. The engine no longer stamps `data-loading` from a prop; a caller's own `data-loading` attribute still passes through untouched (Popconfirm and ConfirmDialog rely on that for their confirm actions);
- the state class is `ds-button--pending` where it was `ds-button--loading`;
- an icon-only busy button (no label) now takes the reserved frame every labelled busy button already had: the icon stays in flow, hidden, inside `[data-part="content-frame"]` and the spinner is laid over it, where before the icon was marked `data-state="hidden"` beside the spinner. Role, accessible name, `disabled`, `aria-busy` and the spinner are the same. A labelled busy button is otherwise identical, with or without an icon, a busy label, `disabled` or `href`.

The Modern button skin already selects both stamps in every busy rule (the hover guard, the pulse guard and the busy cursor), so the paint does not change. A consumer stylesheet or test that selects `[data-loading]` or `.ds-button--loading` on a `Button` must select `[data-pending]` or `.ds-button--pending`; the census found none in the showroom or the three apps.

`ButtonProps.loadingText` -- removed; `pendingLabel` is the busy label. Every engine resolved `pendingLabel ?? loadingText`, and `pendingLabel` accepts every value `loadingText` did (`ReactNode` over `string`), so the same label renders on the three engines.

`ButtonProps.asChild` -- removed with no replacement, because it never did anything: no engine cloned a child. Modern consumed and discarded it; Classic and Rustic never named it, so it travelled to the host element with the rest props. A button that stated it rendered a `<button>` around its child, and renders the same without it. A link button is `href`; an interactive element inside a button is invalid HTML before and after and is the application's to fix.

`Button.Icon` -- `loading` is renamed `pending` (`ButtonIconProps.pending`). It always composed the Modern button, so the three Modern deltas above apply to it on every engine, the reserved frame included.

The Classic and Rustic engines are frozen and still read `loading` and `loadingText` from the props they receive. Those two members stay on a family-internal engine props type that is not published; the family entry publishes the narrowed contract as `ButtonProps`. Typed callers cannot state them. A caller that passes them untyped (a spread, a cast) is still honoured by Classic and Rustic and is no longer read by Modern, where the unknown attribute reaches the host element and the button is not busy. `BUTTON_DEFAULTS.loading` keeps its key (the default those two engines read).

What an application must change. All of it fails at compile time on upgrade, except a spread:

- Run `pnpm -C packages/core codemods --write <app>/src`. It renames `loading` to `pending` and `loadingText` to `pendingLabel` on every element it resolves to the design-system `Button`, and deletes `asChild`. Measured: app-bithire 154 `loading` sites, 1 `loadingText` site (`src/core/auth/components/session-security/passkey-prompt/index.tsx`) and 8 `asChild` sites in 5 files (`features/home/surface/screens/recruiter`, `features/interviews/surface/screens/workflows/live-scoring`, `features/recruiters/surface/screens/record/listing`, `features/settings/surface/screens/ai/test-lab/phone` and `.../speech-to-text`); app-evnto 43 `loading` sites; app-platform 93 `loading` sites.
- Read the reported sites; the codemod does not edit them. A spread on a `Button` compiles either way, so it is the one case the compiler does not catch: if the spread object carries `loading`, rename the key to `pending`. Sites: app-bithire `src/ui/details/surface-shell/panel-actions/action-button/index.tsx` (6); app-platform `src/features/identity/users/surface/components/surface-shell/index.tsx` (2) and `src/features/security/dashboard/surface/screens/dashboard/view/sections/builder/index.tsx` (2). The other reports (app-bithire 19, app-evnto 4, app-platform 16) are `loading` passed to an application component of its own; that prop is the application's and needs no change unless the component forwards it to `Button` under the old name, which the compiler then reports.
- An element that already states `pending` next to `loading`, or `pendingLabel` next to `loadingText`, is reported: keep `pending` / `pendingLabel` and delete the other. The census found none.
- The codemod does not reach member tags. A `<Button.Icon loading>` is renamed to `pending` by hand; the three apps state none, the showroom stated one.

Inside the design system 30 sites move to `pending`: 27 in structures, surfaces and the assistant pattern, plus the step-wizard Modern engine (2) and the Popconfirm Modern engine (1), which compose the Modern button directly. The showroom moves 4.

No minor was published between the deprecations and 3.0.

```contract-diff
signature .#ButtonProps — members `loading?: boolean`, `loadingText?: string` and `asChild?: boolean` removed; `loading` -> `pending` and `loadingText` -> `pendingLabel` render the same on Classic and Rustic, and on Modern change the stamp (`data-pending` for `data-loading`), the state class (`ds-button--pending` for `ds-button--loading`) and give an icon-only busy button the reserved frame; `asChild` was read by no engine and is deleted; consumers: app-bithire 154 + 1 + 8, app-evnto 43, app-platform 93, rewritten by the codemod; `Button.Icon` renames its own `loading` to `pending` (RET-01-BUTTON-BUSY)
```
