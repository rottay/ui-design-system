# Census — consumers of the modern typography tone rules

Producer: `tone-sites.mjs` (scans `.tsx` with comments blanked, keeps
Typography-family tags whose `color` value can be a tone). Output:
`tone-sites.json`. Generated 2026-09-21 at `959e4b59c`.

The three rules bind to `.rottay-typography--modern[data-color='success'
|'warning'|'error']`, so only Typography-rendered nodes are in reach.
`color="success"` on `Checkbox`, `Toggle`, `Radio`, `Tag` or `RadioGroup` is a
DIFFERENT channel painted by that component's own skin (`--ds-radio-*-bg`,
`--ds-toggle-*-bg`, …) and is untouched by this lot — those matches are why a
naive grep reports ~18 sites across 13 files.

**43 production call sites in 30 files**: 6 in the DS, 35 in app-bithire, 2 in
app-platform, 0 in app-evnto, 0 in the showroom. 5 further rows are tests and
stories.

## Per-site classification (DS)

| # | Site | Tone | Role | Classification |
|---|------|------|------|----------------|
| 1 | `surfaces/…/forms/guided-draft-form:242` | success/warning/error via `statusTone[status]` | draft-status chip LABEL, beside a separate `draft-status-dot` | text-on-ground — ink correct; the dot keeps the fill from the family skin |
| 2 | `surfaces/…/forms/guided-draft-form:862` | error/warning via `issue.severity` | validation issue FIELD NAME inside a sentence | text-on-ground — ink correct |
| 3 | `surfaces/…/admin/import-export:285` | error | `error-title` heading run in an outlined Card | text-on-ground — ink correct |
| 4 | `surfaces/…/admin/import-export:351` | success | `success-message` run beside `StatusSuccessIcon` | text-on-ground — ink correct; the icon is a separate node keeping the fill |
| 5 | `surfaces/…/experience/notification:220` | error | destructive button LABEL inside a ghost Button | text-on-ground — ink correct |
| 6 | `patterns/…/brand-studio/…/visual-excellence:94` | warning/success | preview metric VALUE on a panel | text-on-ground — ink correct |

**Zero decorative/fill-intended sites.** No DS call site uses the typography
tone rule to paint a glyph, a dot, a track or a ground: every one of the six is
a text run. Nothing had to be rerouted, and no site needed reporting as a
fill-intended consumer.

## Apps (out of write set, reported)

All 37 app sites are the same two shapes — a field/form error message under an
input, or a success/warning status line — i.e. text-on-ground, so the ink is
the correct role for every one. The tinted-well cases
(`rt-portal-error`, `rt-sprint-fast-create-alert`,
`rt-audit-center-diff-pill__text`) are exactly what the `-ink` authority was
minted for. app-evnto has none.
