# Semantic tone-ink channels — evidence

Packet: the modern typography `success` / `warning` / `error` tone rules read
`var(--ds-color-{tone}-ink, var(--ds-color-{tone}))`. Base `959e4b59c`.

## Contents

- `census/` — `tone-sites.mjs` + `tone-sites.json` + `README.md`: every
  consumer the three rules can reach, with per-site classification.
- `probe/_probe-ink-channels.test.tsx` — the measurement, six vertical/mode
  scopes through the productive door into real Chromium. `before.json` at
  `959e4b59c`, `after.json` with the rule change, `delta.txt` the diff
  (producer: `diff.mjs`).
- `probe/_probe-ink-capture.test.tsx` — sighted captures,
  `CAPTURE_LABEL=before|after`, into `captures/{before,after}/`.

Run:

```
PROBE_OUT="$PWD/evidence/semantic-ink-channels/probe/after.json" \
  npx vitest run --config evidence/semantic-ink-channels/probe/vitest.probe.config.ts _probe-ink-channels
CAPTURE_LABEL=after \
  npx vitest run --config evidence/semantic-ink-channels/probe/vitest.probe.config.ts _probe-ink-capture
```

## Result

60 cells (10 production call sites x 6 scopes): **25 fail -> pass, 0 pass ->
fail**. Both pinned nodes clear the floor — evnto light 2.82 -> 5.62, bithire
dark 3.00 -> 6.26 — and their `GuidedDraftForm` AXE_DEBT entries are drained
(suite 7/7 green).

Residual, unrepaired and reported: the `error` tone in bithire dark rises but
still fails (2.40-2.89 -> 3.33-4.01) because `--ds-color-error` is mode-blind
in bithire — one light-mode literal in both modes — so its ink derives from a
red never graded for a dark ground. Seed question in the bithire preset.

The three draft-status chips carry BOTH roles at once, which is the point of
the split: `draft-status-dot` keeps the saturated fill from the family skin
while `draft-status-label` takes the ink, so the colour cue stays vivid beside
legible copy.
