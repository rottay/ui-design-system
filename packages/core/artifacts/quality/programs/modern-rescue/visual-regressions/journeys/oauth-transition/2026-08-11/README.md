# Sighted capture — `oauth-transition`

**Family.** `ui/surfaces/presentation/pages/experience/oauth-transition`, the surface whose
156 undeclared reads went to zero. Before the repair it shipped 2248 lines and painted no colour
at all, so there is no "before" to regress against — these exist to answer whether the ambience is
worth having, and whether the three verticals read as three products.

**Cells.** Six: `{bithire, evnto, platform} × {light, dark}`, variant `signal-line-{light,dark}` —
a matched pair, so vertical-to-vertical and light-to-dark are both comparable. DOM captured from a
real render of `OAuthTransitionScreen`, never hand-written.

**Bundles.** `mode: fresh`, sha256/12: bithire `4c7ce61291ec` · evnto `86ba230d12b3` ·
platform `6c6806eab030`. Chromium 149.0.7827.55, 1280×800, `deviceScaleFactor: 1`,
animations and transitions pinned off.

**Limits, declared.** (1) One variant family of four — `quiet-beam`, `watchtower-sweep` and
`halo-orbit` are uncaptured. (2) One provider (`google`) and one phase (`redirect`). (3) Resting
state only; no hover, focus or press.

---

**Every cell verifies its own scope, and that is not a formality.** A first run of this capture
came out untenanted — `rootAttributesToHtml` takes the attributes object from `rootAttributes(scope)`
and was handed the scope, yielding an empty string. All six rendered identically at the DS default
`--ds-color-primary: #171717`, which would have "proved" the three verticals look the same: the exact
opposite of the truth, with six images behind it. **A miswired harness does not produce noise, it
produces uniformity** — indistinguishable from the finding one fears. The run that produced these
files asserts the resolved root attribute and primary per cell:

```
bithire/light  bithire | light   #3A6FB0      bithire/dark  bithire | dark  #1e84e6
evnto/light    evnto   | light   #171717      evnto/dark    evnto   | dark  #E8E8E0
platform/light rottay  | light   #0A0A0C      platform/dark rottay  | dark  #FFFFFF
```

**Read.** The glow reads as design in all three. bithire is navy with a blue glow carried into the
status dot and progress; evnto light is editorial paper, its 8% near-black glow barely a colour and
the better for it; platform is near-black with a white glow. **The three darks are NOT identical** —
the canvas literal is shared but the composite is not, because the three radial glows derive from
`--ds-color-primary`. True of the channel, false of the screen.
