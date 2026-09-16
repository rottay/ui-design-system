---
"@rottay/design-system": major
---

WO-FAM-07 STOP-2 (freeze exception, DT-adjudicated). The divider family's
shared contract stops carrying two frozen engines' paint.

`DEFAULT_COLORS` held the last-resort line colour of all three engines. Two of
those three entries were Classic's and Rustic's, read by nothing but the engine
that declared them, and their presence in the family contract was the one
blocking `visualLiterals` finding standing between the divider cut and its
roster row. Each moves into the engine file that owns it, byte-identical:

- `DEFAULT_COLORS.classic` -> `CLASSIC_DIVIDER_COLOR` in `engines/classic`
- `DEFAULT_COLORS.rustic` -> `RUSTIC_DIVIDER_COLOR` in `engines/rustic`

Nothing about either engine's rendering changes. The relocation was proven by
rendering both engines with no `color` prop before and after: the markup,
including the inline `border-top` / `--ds-divider-line` string, is byte-identical.
The two frozen paths carry a written, content-pinned exception in the
engine-freeze baseline naming exactly this move.

`DEFAULT_COLORS` keeps only `modern`, so the published
`DIVIDER_DEFAULT_COLORS` object loses two keys. A consumer reading
`DIVIDER_DEFAULT_COLORS.classic` or `.rustic` was reading a frozen engine's
private default through the family contract; it now imports the constant from
the engine, or stops depending on a value no productive engine consumes.

```contract-diff
export .#DIVIDER_DEFAULT_COLORS — changed; the `classic` and `rustic` keys are removed, `modern` is unchanged
```
