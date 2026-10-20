---
"@rottay/design-system": patch
---

`PresenceBar`, `PresenceTypingIndicator`, `LiveCursor` and `VoiceInputButton`
gain owner class doors on their Modern caller parts (ARC-12 M-P3, Wave C lot
LC6). 9 elements that their skins reach by a caller `data-part` now carry a
class beside that part, named `<owner block>__<part>` (for example
`ds-presence-bar__avatar`, `ds-presence-typing-indicator__typing-dot`,
`ds-presence-live-cursor__cursor-badge`, `ds-voice-input-button__root`). The
three presence roots share the planner's hook `ds-presence-live-cursor__root`;
every selector that reaches them stays compound with its own block
(`.ds-presence-bar`, `.ds-presence-typing-indicator`, `.ds-presence-live-cursor`).
In the `presence` and `voice-input-button` skins 32 selectors that reach these
elements by `[data-part]` now also reach them by class, as a second selector
next to the part one, at the same specificity. The `[data-part]` side stays.
The voice listening, transcribing, error, blocked and active state rules are
unchanged. Rendered markup changes only by the new class tokens, and every rule
matches the same elements at the same specificity as before. The four vertical
CSS bundles carry the same selectors. This prepares the Modern `Box` to stamp
its own part (a later strip).
