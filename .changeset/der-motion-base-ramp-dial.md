---
"@rottay/design-system": patch
---

The base motion duration ramp becomes a dial product, so the choice of spelling
stops deciding whether a tenant can move a duration.

`--ds-motion-fast`, `--ds-motion-normal` and `--ds-motion-slow` were bare
aliases of the `instant`/`calm`/`deliberate` cadence while the intent names
(`feedback`, `reveal`, `disclosure`, `resize`, `rearrange`, `attention`) were
`calc(<rung> * var(--ds-motion-duration-scale))`. Two spellings of the same rung
therefore behaved differently: a skin binding `--ds-motion-feedback` answered
`motion.dial`, one binding `--ds-motion-fast` painted a duration no tenant could
reach. All three producers of the vocabulary now state the ramp the same way the
intents are stated:

```
--ds-motion-fast:   calc(var(--ds-motion-instant)    * var(--ds-motion-duration-scale, 1))
--ds-motion-normal: calc(var(--ds-motion-calm)       * var(--ds-motion-duration-scale, 1))
--ds-motion-slow:   calc(var(--ds-motion-deliberate) * var(--ds-motion-duration-scale, 1))
```

The producers are the tenant deriver (`lowering/runtime/derivation/motion`
`DURATION_ALIASES`), the foundation sheet
(`foundation/tokens/css/foundation/animations/transitions`) and the modern
engine's at-rest block (`runtime/engines/modern/compiled`). The cadence stays
the dial's INPUT and is unchanged, so the dial is applied exactly once.

**DECLARED visual change, same class as the motion lot 1b.** Measured per name
in Chromium through the productive door, on all three verticals in both modes:
rottay and evnto compile `durationScale: 1` and every one of the thirteen
vocabulary names is byte-identical to its reading at the parent commit. bithire
compiles `0.8`, and exactly the three ramp names move — nothing else does:

```
                bithire before   bithire after
--ds-motion-fast     0.12s           0.096s
--ds-motion-normal   0.2s            0.16s
--ds-motion-slow     0.32s           0.256s
```

Each is now byte-equal to its intent twin (`feedback`/`reveal`/`rearrange`),
which is the point: one rung, one duration, whichever name a skin binds.

Two corrections ride here because they are the same statement:

- The foundation sheet derived the intents from the RAMP
  (`calc(var(--ds-motion-fast) * …)`) while the deriver derived them from the
  CADENCE. Making the ramp a product would have applied the dial twice in every
  context that ships without a compiled artifact, so the sheet now states the
  intents on the cadence, byte-identical to the deriver.
- `--ds-motion-glacial` is deliberately NOT made a product. It is the ambient
  rung, and its loops already carry `var(--ds-motion-duration-scale)` at the
  call site (the empty-state precedent, 16 reads measured); a product here would
  double-apply. It is asserted dial-independent beside the cadence.
