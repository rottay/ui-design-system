# Leyes rescatadas de las fuentes de tema (F4A-3b)

**Por qué existe este documento.** F4A-3b aplicó el canon de comentarios
(esquema §2: en fuente quedan solo el kit — banners, la ley del OVERLAY, los
docblocks de familia con tags — y nada de prosa narrativa). Los 45 docblocks
narrativos salieron de las 3 fuentes. **28 cargaban ley real con dientes**:
van acá, verbatim, en vez de morir con la edición. La referencia `tema:línea`
es la posición ANTES de F4A-3b (las fuentes cambiaron de forma; el valor no
cambió — el lote fue byte-idéntico en el artefacto compilado).

Autoridad posterior: si una ley de acá cambia, cambia en su lote de
reescritura (F4A-5…15) con su packet declaration. Este documento es memoria,
no mecanismo.

---

## 1. Leyes de diseño (rottay)

**`rottay:1521` — la ley del control ramp.**
> The control ramp. Rottay is a console: a screen is a table of rows with inline controls, so the DS baseline (40px md, 56px xl) spends a third of the viewport on air. One seed — `--ds-input-md-height` — sets the row, and every other size is an offset from it, so a tenant that moves the seed moves the whole ladder including Button.
>
> The sizes are px and not `calc(… * var(--ds-density-*))`: the consumers already apply density themselves (`input.css`, `date-picker.css`, `tree-select.css`, `button.css` all wrap these tokens in `* var(--ds-density-effective-scale)`), so a factor here would apply twice. Height is the seed; padding and gap derive from it optically.

**`rottay:1602` — botón y campo comparten fila.**
> Button rides the same row height as the field, so a control strip lines up without per-screen correction. Buttons take more horizontal room than fields (0.42 of the height against 0.35) because a label needs shoulders where a value does not.

**`rottay:1730` — el anillo de foco NO se restatea en `modes.light`.**
> The focus ring's own colour channel. Authored once here and NOT restated in `modes.light`: it forwards to `--ds-color-primary`, which each mode already re-grounds, so a second authority would only be a chance to disagree with the seed.

**`rottay:2089` — una sola escalera de padding.**
> One padding ladder. The DS ships two that disagree — `--ds-card-{size}-padding` (12/16/24/32) and `--ds-card-padding-{size}` (16/20/28/40) — and a card gets whichever its skin happens to read. `paddingSm..Xl` writes both names from one field, so Rottay has a single answer, and each step sits on the spacing ramp so the density dial reaches it.

**`rottay:1361` — el badge cuadrado.**
> A status badge on a control plane is a label on a record, not a button. The pill shape the DS and both sibling verticals use belongs to consumer surfaces; Rottay squares it off onto the same radius ramp its inputs and cards ride, which is what `technical-sharp` means in practice.

**`rottay:1777` — el read-only es un hecho, no un hueco.**
> A read-only field in a control plane is a fact, not an empty slot: it carries an id you are about to copy. The DS baseline dashes the border and blocks the caret, which reads as "disabled". Rottay keeps the solid border and the text cursor.

**`rottay:2074`, `rottay:2079`, `rottay:2085`, `rottay:2103` — cuatro leyes cortas de tabla y card.**
> The header is a fixed rail on the control ladder rather than `auto`, so a table lines up with the toolbar controls above it.
>
> 0.08em is eyebrow tracking for a two-word label. A data header is read in columns, not as prose; three quarters of the eyebrow keeps the channel and closes the letters up.
>
> No sheen. The baseline gradient is transparent-to-transparent anyway.
>
> A console card title names a panel; it is a label, not a headline.

**`rottay:1249` y `evnto:392` — las familias tipográficas tienen que existir.**
> Every family named here is physically shipped as a font pack (see FONT_PACK_MANIFEST). This previously named 'Inter', 'JetBrains Mono' and 'Geist Mono' — none of which the package ships. Naming an unpackaged family is not a typography decision, it is a bet on the visitor's machine, and it silently resolved to whatever the OS fallback was.

(evnto: *"…'Fira Code' — none of which the package ships, so the 'contemporary strong typography' this vertical claims resolved to the visitor's OS default in practice."*)

**`rottay:1048` — las rampas a mano.**
> Hand-tuned ramp steps. Rottay does not want the even OKLCH derivation for these roles: the steps are set against its own dark canvas.

**`rottay:1304` — la escalera de elevación como campo de contrato.**
> The authored elevation ladder, drained from the artifact extension. `shadows.sm..xl` above forward to these levels, so the ladder has to be a contract field rather than a hand-written root block or the forward resolves against the DS floor instead of Rottay's own dark ramp.

**`rottay:1466` — dos deletreos vivos del mismo canal.**
> `list` carries both channel spellings the DS ships (`--ds-list-bg` and `--ds-list-background-color`) because both have live readers; one field per channel, no aliasing in the compiler.

**`rottay:1298` — `2xl` no es identificador; el campo es `xxl`, el canal conserva `2xl`.**

## 2. Geometría sin piso DS (rottay ×2)

**`rottay:668` y `rottay:1427`** — la misma ley, en el overlay y en el cuerpo:
> The nine geometry channels the dark body authors have no root-level DS floor to restate — their only other declarations sit on descendant selectors inside the shell and skin stylesheets. A light root that inherited the dark body's geometry would be a new value, not the pre-drain one, so the mode resets them instead.

## 3. Reparación de fugas (evnto — la más sustantiva del corpus)

**`evnto:329-365`, 37 líneas.**
> The six border channels this vertical used to leave silent, and so inherited from `themes/default.css` — the DS's own tenant-less DARK fallback set. This is a LEAK REPAIR, not a derivation: measured before this block existed, `--ds-color-border-subtle` and `-tertiary` painted #161619 hairlines on the WHITE light ground, and all four status borders painted DS hues rather than the seeds above. **Repairing it moves pixels on purpose; it is not a value-preserving edit.**
>
> The vertical's own #171717-on-#FFFFFF ink/surface pair is deliberate and is NOT the fault here — `deriveBorderSubtle` cannot even run on it (its `isHexColor` gate rejects the translucent light border), and composited first it lands ≈#F2F2F2. The seed was simply missing.
>
> Authored as formulas over this vertical's own channels, never as literals: a baked hex would freeze today's rendering as if it were a design choice and would leave the channels unreachable from the palette. Each string is mode-blind, so `compileModeBlocks` emits it once in the unconditional block and it re-resolves against whichever seed each mode declares.
>
> A 2/3 wash IS the DS's `BORDER_SUBTLE_GROUND_STEP` derivation — one third of the way from the border back to the ground — expressed without naming the ground, so it stays correct on cards and sunken regions rather than only on the page canvas, and it survives this vertical's translucent light border. The seed is `-primary` rather than `--ds-color-border` because the latter is itself unauthored here and still resolves to the DS dark fallback in dark mode.
>
> `-tertiary` repeats the formula rather than aliasing `-subtle`: the two are one value in `themes/default.css` and in the former default theme, so the equality this vertical already paints is preserved, but as two independent channels a tenant can still move apart.
>
> The status washes keep the 20% strength these channels already paint; only the hue moves, from the DS defaults onto the seeds above.

**`evnto:366` — el séptimo canal de la misma fuga.**
> The seventh channel of the same leak: unauthored here, so dark resolved `themes/default.css`'s `#1C1C20` — a cool grey on this vertical's warm `#131210` ground. Mode-blind on purpose: the light extension declares `--ds-color-border` at a higher specificity and keeps winning there, so this reaches only the mode that had no author.

**`evnto:432` — el hover que se iba a negro.**
> The shared baseline, plus the two semantic surface roles whose HOVER ground this vertical never authored. Measured: both resolved `#18181C`, so a card or control on the white canvas turned near-black under the cursor. `glass` stays `none` from the baseline — that is this vertical's deliberate choice, not a gap.

## 4. DARK PIN — la doctrina de modo (evnto ×3)

**`evnto:247`:**
> DARK PIN (EVNTO TERMINAL-2), same doctrine as the BitHire theme. `light` is this theme's default mode, so the focus ring's light authority lives in the BODY and compiles UNCONDITIONALLY. This pin holds dark exactly where it resolves today (`default.css` dark: `var(--ds-color-primary-400)`); it is not a dark design decision. **It is load-bearing on `[data-ds-root]` embeddings**, where the compiled tenant block lands on the container element and an unconditional body value would otherwise reach dark.

**`evnto:615`:**
> EVNTO TERMINAL-2. The extension re-declared the focus ring because the `:root` fallback is the tenant-less dark-default literal, not `var(--ds-color-primary)`. The typed owner is this field. `light` is this theme's declared `appearance.defaultMode`, so the light value is the BODY authority; `modes.dark` pins dark's current paint.

**`evnto:197` y `evnto:208`:**
> The dark hover was authored only in the artifact extension, so the compiled root emitted the LIGHT hover unconditionally and the extension's dark-gated row won it back at paint time. Owning the value here makes the dark overlay the single authority for the mode it governs; the extension row is retired in the same change.
> *(y: "Same law as `buttonPrimary.bgHover` directly above.")*

**`evnto:235` — el literal que NO se deriva a propósito.**
> EVNTO TERMINAL-2. The extension authored this byte under the senior, contract-less name `--ds-input-placeholder`; the typed owner is this field, which lowers to `--ds-input-color-placeholder`. The literal is kept because it is what the extension authored, not derived — it happens to equal `modes.dark.palette.textMutedColor` today, and **a re-brand that moves the palette must decide this channel deliberately rather than drift with it.**

## 5. Procedencia de tranches (las citas que F2 usó)

**`rottay:1842` — ROTTAY-T2 MASS**, con la explicación de las ausencias:
> Twelve control families drained from the artifact extension into the typed Theme. Dark is the authored default, so every body row below is the exact literal the extension painted in the dark block; `modes.light` restates only what diverges. Channels whose paint the cascade already resolves identically (36 rows from `default.css` plus 5 component `:root` floors) carry no field at all; that is why `inputNumber.controlBg` and `rate`'s active/hover rows are absent. `rate` rides in this tranche because its channels are authored inside the same control block of the artifact, even though the family inventory files it under feedback.

**`rottay:426` — las tres clases de fila del overlay claro** (T2):
> Three kinds of row live here: a light value that genuinely diverges from dark, a light restatement that stops a migrated dark value from bleeding into light (those light channels resolve to the DS floor and are therefore not migrated), and a light-only value whose dark twin already matches the floor.

**`rottay:1201` — T1**, el drenaje del root block:
> Drained from the artifact extension's hand-written root block (T1). Rottay's default mode is dark, so these are the dark values and they apply in BOTH modes; `modes.light` restates only the ones that move. Every value here is the byte the extension already shipped.

**`rottay:1228` — el namespace de alias.**
> The unprefixed alias namespace (`--ds-text-*`, `--ds-border-color*`). Same drain, same rule: one field reaches exactly one channel, so the value that shipped moves into the contract without changing.

**`rottay:1792` y `evnto:633` — MASS C3-BITHIRE-ALL, `controls.select`.**
> Field and dropdown chrome. MASS C3-BITHIRE-ALL introduced `controls.select` as a closed semantic family, so all three first-party themes author the same keyset. […] Restating an identical `var()` chain at higher specificity computes identically, so nothing repaints.

**`rottay:2002` / `evnto:660` — `surface`, y por qué se autora aunque no diverja.**
> Authoring the keyset makes the family a real cross-vertical capability instead of a BitHire-only appendage.

**`rottay:370` — la divergencia clara de `controls.select`** (8 de 15 canales).

**`rottay:1011` — la escalera clara restatada** porque el cuerpo oscuro ahora autora `elevations`; `level0` es `none` en los dos y por eso no se restata.

## 6. K0.6 — el perfil de receta gobernado (rottay + bithire)

**`rottay:1032`:**
> Governed recipe profile (K0.6, 2026-07-23): selected from sighted same-tree evidence (`/probe/k0-profiles`, captures under test-artifacts/rottay-design-platform/K0-K1/captures). technical-sharp matches this theme's declared graphite/mono/border-first posture; editorial-round was sighted and rejected (illegible active pill tab on the dark canvas). Explicit component props still win over profile defaults.

**`bithire:722`:**
> […] Review note for Codex: the profile sets the DEFAULT button recipe to outline (unspecified variants render outlined instead of filled); explicit `variant` props are sovereign over profile defaults. editorial-round was sighted and rejected (contradicts the declared dense, border-first posture).

## 7. El catálogo de capabilities — por qué existe (los 3)

**`rottay:2433`:**
> The three first-party themes previously disagreed on which of these keys existed at all — rottay had `recipes` but no `expressive`, bithire had both, evnto had neither — and **nothing distinguished "this vertical ships no expressive selection" from "nobody got round to authoring one"**. These entries say which it is.

**`bithire:2110`:** *"…without it, 'bithire has expressive and the others do not' reads as a capability gap in the siblings rather than as three separate decisions."*

**`evnto:721`:** *"Evnto authored NONE of these keys before; absence read as 'nothing selected' and as 'nobody looked' simultaneously."*

> **Las tres dicen la misma ley desde tres ángulos: la ausencia silenciosa es
> ambigua.** Es, textualmente, la ley de placeholder que F4A-4 materializa.

---

*Insumo: reporte de F4A-3b (worker Opus, 2026-08-20) §4 — verbatim extraído
por el worker antes del borrado; selección y re-domicilio: DT (Kimi K3).*
