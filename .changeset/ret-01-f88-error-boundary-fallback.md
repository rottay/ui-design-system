---
"@rottay/design-system": minor
---

The default fallback of `EngineErrorBoundary` is painted by design tokens only,
speaks the catalog, and resolves nothing through the engine loader that just
failed.

DECLARED VISIBLE CHANGE of the default fallback (the one rendered when no
`fallbackRender` is passed, which is what every `createEngineComponent` router
mounts):

| | before | after |
| --- | --- | --- |
| title | `Engine Error:` followed by `Failed to load component.`, English in every locale | `errors.generic` from the catalog ("An unexpected error occurred", "Ocurrió un error inesperado", …); the English literal when no `I18nProvider` is mounted |
| retry label | `Retry`, English in every locale | `components.surfaces.states.retry` ("Try again", "Reintentar", …); the English literal when no provider is mounted |
| error detail | `error.message` at `12px`, `opacity: 0.7` | `error.message` at `--ds-font-size-xs`, full opacity |
| semantics | no role | `role="alert"` on the container; the retry stays a native `<button type="button">` |
| spacing | `16px`, `8px`, `12px`, `6px 16px` | `--ds-spacing-4`, `--ds-spacing-2`, `--ds-spacing-3`, `--ds-spacing-2 --ds-spacing-4` |
| border | `1px solid var(--ds-color-error-border)` | `--ds-border-width-thin` (then `--ds-border-width-1`), `solid`, `--ds-color-error-border` (then `--ds-color-error`) |
| ink | `var(--ds-color-error-700)` | `--ds-color-error-700`, then `--ds-color-error` |
| retry type | `13px` | `--ds-font-size-sm`, family and weight inherited |

No pixel, opacity or colour literal remains in the fallback, and no fallback of
a custom property is a literal: where a token is not defined (no theme mounted)
the declaration drops and the element keeps the user-agent rendering, so the
alert and its retry button stay readable and operable with no provider at all.
The fallback imports no component and no engine-resolved primitive; it is plain
elements, a documented exception to the no-raw-HTML rule, because a primitive
resolved through an engine could fail again inside the fallback. No catalog key
was added: both keys already exist in `en`, `es`, `fr`, `pt` and `ar`. A tenant
`customTranslations` override of either key is honoured.

Unchanged: `fallbackRender` still replaces the default fallback, `onError` and
the `ENGINE_COMPONENT_LOAD_FAILED` report still fire, retry still resets the
boundary, and `EngineErrorBoundaryProps` is the same type.

`VoiceInputButton`: with no `lang` prop, the recognition language follows the
mounted `I18nProvider` locale as a regional tag, derived with
`new Intl.Locale(locale).maximize()` (`language-region`): `en` -> `en-US`,
`es` -> `es-ES`, `fr` -> `fr-FR`, `pt` -> `pt-BR`, `ar` -> `ar-EG`. An explicit
`lang` wins. With no provider the default is `en-US`, as before. Where
`Intl.Locale` is unavailable the bare provider locale is passed. `lang` stays
`string | undefined`.

Consumer note: no behaviour change under an English provider or with no
provider (`en-US` before and after). Under a `es`, `fr`, `pt` or `ar` provider a
`VoiceInputButton` rendered without `lang` used to ask the browser for `en-US`
and now asks for the regional tag listed above. Pass `lang` to pin another
region (for example `es-AR`).

Nothing is removed or renamed, so there is no codemod entry. The declarations
below changed spelling in the published surface:

```contract-diff
signature .#VoiceInputButton — the `lang` parameter default `'en-US'` is removed from the destructuring; the default is now resolved in the body from the provider locale, `'en-US'` with no provider; props type unchanged
signature .#VoiceInputButtonProps — JSDoc of the `lang` member rewritten to state the new default; the member stays `lang?: string`
signature .#EngineErrorBoundary — inferred return of `render()` now spells `JSX.Element` in the union because the default fallback is an element of a function component; props and behaviour contract unchanged
signature .#SurfaceErrorBoundary — inferred-return spelling only, file untouched
signature .#DSErrorBoundary — inferred-return spelling only, file untouched
```

Not covered here: the Rustic colour-picker default `#1677ff`
(`components/primitives/inputs/color-picker/engines/rustic/index.tsx:65`) is on
a frozen engine and is unchanged.
