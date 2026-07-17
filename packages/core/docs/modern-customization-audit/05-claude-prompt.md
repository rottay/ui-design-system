# Claude Prompt - Modern Customization Track

Use this as the starting prompt for implementation.

```text
Continue the Modern customization track in ui-design-system.

Read these docs first:
- packages/core/docs/modern-customization-audit/README.md
- packages/core/docs/modern-customization-audit/00-runtime-pipeline.md
- packages/core/docs/modern-customization-audit/01-modern-display-layout.md
- packages/core/docs/modern-customization-audit/02-modern-inputs.md
- packages/core/docs/modern-customization-audit/03-modern-navigation-feedback-overlay.md
- packages/core/docs/modern-customization-audit/04-wave-plan.md

Goal:
Make the Modern engine genuinely maximum-customizable from contract -> runtime -> foundation/tokens/css -> rendered primitive.

Important truths from the audit:
1. The implemented premium source today is brandTheme, not appearance.general / appearance.advanced.
2. Modern foundation primitives still hardcode spacing/radius/shadow in ways that block tenant customization.
3. modern/theme.css contains bridge selectors that several Modern primitives never emit.
4. Inputs are the healthiest category, but many still ignore adjacent token maps or use native/default-heavy rendering for key internals.
5. Navigation / feedback / overlay primitives still have several default-heavy or contract-bypassing paths.

Execution rules:
- Work Modern-only unless a shared helper must change.
- Prefer real runtime integration over more contract surface.
- If a token map or prop contract exists adjacent to a primitive, either make Modern honor it or explicitly narrow/remove the contract.
- Do not leave dead bridge selectors in modern/theme.css.
- Add regression tests that prove token overrides change actual rendered output.
- Preserve public API where possible; if behavior must narrow, document it in the same wave.

Implementation order:
1. Wave M1 - Foundation Tokenization
2. Wave M2 - Bridge Reconnect
3. Wave M3 - Scalar Contract Parity
4. Wave M4 - Input Internals Hardening
5. Wave M5 - Navigation / Feedback / Overlay Parity
6. Wave M6 - Runtime Model Completion
7. Wave M7 - Regression Harness

STOP format after each wave:
- Changed files
- Exact DS customization gained
- Exact bypasses removed
- Tests added/updated
- Remaining risks / deferrals

Approval bar:
- A declared token/prop/theme field should either affect rendered Modern output or be explicitly classified as not implemented.
- No more "token exists but nobody reads it" within the touched scope.
```
