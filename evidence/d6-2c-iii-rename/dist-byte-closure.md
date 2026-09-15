# Closure of the one unexplained dist byte (coordinator, 2026-09-15)

Pre-image build of 9049d79b0 in a /tmp archive clone (exit 0), diffed against the post-rename dist:

4,5c4,5
< import { recordUse as Q, rankByFrecency as L } from "../../foundation/frecency/index.js";
< import { useLayoutPreference as $ } from "../../../../../../infrastructure/runtime/application/state/layout-preference/index.js";
---
> import { useLayoutPreference as Q } from "../../../../../../infrastructure/runtime/application/state/layout-preference/index.js";
> import { recordUse as $, rankByFrecency as L } from "../../foundation/frecency/index.js";
26c26
<   const { preference: A, setPreference: _ } = $({
---
>   const { preference: A, setPreference: _ } = Q({
42c42
<       const s = b.current(), r = Q(k.current, e, s);
---
>       const s = b.current(), r = $(k.current, e, s);

Verdict: minifier alias swap (Q <-> $) across two import statements; identical byte size (4449), identical module specifiers, identical public export (useCommandPaletteItems), identical string literals. Build mechanics, explained — not rebaselined. With this, 18/18 changed dist files are explained against the closed map.
