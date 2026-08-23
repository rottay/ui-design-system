# K4 / F4A-14a (reparación contractual del plano de raíces) — Postaudit Fable 5 del SOURCE_READY (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Estado verificado (apertura y cierre):** HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (inmóvil) · staged 0 · porcelain = **11** paths: los 8 preexistentes (hardening/libro mayor) + **exactamente los 3 de K4** — set-difference 8→11 exacto, ningún cuarto path. Roadmap `34aa05a46638b664…` byte-idéntico al cierre. `git diff --check` limpio. Este postaudit es independiente del challenge K5, ya sellado con su propio verdict (`886d3528…c26b`, ACCEPT_WITH_BINDING_CORRECTIONS); no se mezclan.

**Autoridades (SHA-256 recomputados, las 7 byte-exactas):** brief v3 `06ecaa76…22ff1`; mi ACCEPT v3 `22c39c6d…5918`; addendum/frescura `f3f6e995…53d44`; postaudit T-1b `df8f92c8…1ac9`; R-1 `09d8a180…c0c23`; reporte `20d74855…7088`; listo `5d367bb6…005b`.

**Write-set (verificado por mí):** prehashes = blobs de HEAD recomputados (`35a6912f…`, `7c8f562b…`, `1808731f…`); posthashes vivos exactos (`5a8379d1…`, `4c80ab9c…`, `670dc6ec…`). **Los 3 patches durables == los 3 diffs vivos, byte a byte.**

**Leyes cumplidas:** cero writes al repo, cero tests mutantes, cero build/generated/browser, cero git mutante; sólo lectura, `shasum`, `git diff/show` de contraste, análisis Node read-only y los dos gates del catálogo (validadores read-only). Kimi fuera y no fue gate. Write-set de la sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT

El diff completo de los tres paths es exactamente el mandato del brief v3 + addendum que esta cadena ratificó, con cada número re-derivado por mí desde los archivos vivos — no desde el reporte. La caza de contradicciones semánticas no encontró ninguna. **K4 queda cerrado; K5 queda liberado** (su ruling ya tiene mi challenge con correcciones vinculantes).

---

## 1. Catálogo — auditado entero, no por reporte

- **Exactamente 3 roots cambiados** (índices 7/15/22: `tier.raised.fg`, `tier.overlay.fg`, `tier.overlay.bg`); **61 byte-idénticos a HEAD** (comparación entrada-a-entrada mía, 0 excepciones) — cubre de una vez los invariantes 5 (raíces sin consumidor no inventadas) y 6 (raíces no tocadas).
- **Renombres de canal exactos** a `--ds-material-{raised,overlay}-foreground` / `--ds-material-overlay-background`.
- **Preservación bithire base+dark** en `raised.fg` y `overlay.fg` (P0-1): `modes.bithire = ["base","dark"]` en ambos, medido en el JSON vivo; sólo rottay 2→0.
- **Único delta de channelStatus**: `overlay.fg` existe→`solo-artefacto` — y no es prosa: el **freshness gate lo valida contra src/** y lo corrí yo (`64 roots … 47 existe, 10 por-crear, 7 solo-artefacto`, EXIT 0); `raised.fg`/`overlay.bg` conservan `existe` gate-verificado (sus canales nuevos sí tienen productor autorado en src/).
- **`overlay.bg` ×1 con semántica head-channel DECLARADA**, no tácita: la derivation registra la instrucción del DT 2026-08-21, nombra la lectura alternativa ×2, marca `--ds-surface-overlay` como segundo canal informativo ("no un segundo root ni una entrada de collapses") y la advertencia circular "no materializar". La evidencia citada la verifiqué en el artefacto: `bithire/index.css:716` (head channel, sólo base), `:965` (base `#ffffff`), `:1664` (dark emite sólo el secundario) — **exacta**. Y el destino `{1, bithire:["base"]}` está explícito en el addendum pinneado (línea 94): la instrucción no es huérfana.
- **`exposureNote` de overlay.fg apendeada** (autoridad original conservada) con el pin del Tour test — que verifiqué en disco: `Tour.overlay-material.test.ts:55-64` contiene verbatim el comentario del incidente ("painted black on black") y `expect(decl).not.toContain('--ds-material-overlay-foreground')`. El "No materializar nunca" está anclado a una aserción real de AUSENCIA.
- **Aritmética re-derivada por mí sumando las 64 assignments vivas: `261 = 95 + 96 + 70`** ✓. `corrections.items` 4→7 con las tres narrativas apendeadas: drift F4A-6 (263+5=268 = 101+97+70), delta K4 (−6/−1/0 = −7, con desglose por raíz) y el vintage "63 raíces" **registrado sin reescribir** (la ley "se registra el drift, no se reescribe" del v3, DEFER_F4B ratificado). `denominator`, `classes`, `roots`, `channelStatus` (método), `notMeasured` y `reconciliation` intactos.
- **Exposure clavado**: gate corrido por mí — `26 tenant-dial, 28 internal-head, 10 gap; no knobless root gained one`, EXIT 0.
- `effect.intensity` y `control.ratio.iconSize`: **roots byte-idénticos a HEAD** — el 0.58 de bithire y el channel de iconSize intocados por diseño.

## 2. Roster JSON — contabilidad programática exacta

**198 entries en ambos lados; exactamente 16 cambiadas, TODAS dentro de las 8 raíces objetivo; 0 cambiadas fuera; 174 fuera byte-idénticas** (verificación entrada-a-entrada mía, cero excepciones). Las 16: 3+3 en los dos fg (bithire→`seed` "autorado directo, base y dark"; rottay/evnto→`unassigned` con el texto "Gobernaría:" preservado y los valores fabricados reemplazados por "(no declarado)"), 1 en overlay.bg/bithire (`dial: token-overrides` → `dial: (raiz autora — dial en F4B)` — **invariante 7: la clase F4B pasa de 9 a 10 punteros sin resolverse**, mecanismo declarado en el addendum:151-152), 2 padding (rottay derived-calc con la ley 0.42/0.35/0.20; bithire seed por familia), 2 gap (0.18×6; literales), 1 lineHeight (bithire derived→seed, 20px literal — corrección del governor mentiroso), 2 iconSize, 2 effect.intensity (declinación; **bithire byte-idéntico con su 0.58**).

## 3. Roster MD — espejo del JSON con tablas re-calculadas y verificadas

Los 8 roots del MD reflejan el JSON incluidos los headers de canal/status (`--ds-material-*`, `solo-artefacto`). **Las dos tablas-resumen las re-calculé desde el JSON vivo y coinciden celda por celda**: domicilios rottay 24/12/30 · bithire 37/10/19 · evnto 24/7/35 (85/29/84 = 198) y posturas autoradas 36/47/29 — además verifiqué el delta contra HEAD entrada por entrada (seed 85→85 con redistribución −3/+4/−1; derived 33→29; unassigned 80→84). La línea 185 (texto-licencia) quedó reemplazada por la nota obligatoria completa: emisión medida `1 / 0.58 / 1`, declinación explícita con anclas de fuente (`rottay:3767-3769`, `evnto:2076-2078`), materialización probada cero-delta y **declinada por el DT el 2026-08-21**, y la prohibición de escribir `base=1` sobre bithire (regresión medida, 1 diff) — verbatim al mandato.

## 4. iconSize — parcial y declarado como parcial

`roots[41]` **byte-idéntico a HEAD** (channel `--ds-icon-md-size` intacto, cerca del brief §2.8 respetada); sólo postura de roster reparada, con la nota **"REPARACION PARCIAL, el channel queda como residuo abierto para F4A-close"** verbatim en las DOS entries afectadas, en el MD y en el reporte §7. **No se vende como cerrado.** Consistente con el ítem 11 del denominador F4A-close.

## 5. Invariantes duros y perímetro

- **Cero themes/artefactos/source tocados — probado más fuerte que el reporte**: el porcelain de 11 líneas no contiene ningún path bajo `brand-themes/`, `facade/artifacts/`, `styles/` ni `src/` ⇒ byte-identidad contra HEAD, no sólo contra el inicio de sesión.
- Los 8 dirty preexistentes conservan los hashes que yo mismo medí en los postaudits previos (verificados en el reporte §8, consistentes con mi serie).
- **V-1 cumplida y verificada**: los 3 archivos de `/private/tmp/f4a14a-backup/` hashean **exactamente a los prehashes** — backup por `cp` del worktree; ningún `git show` como fuente.
- Contradicciones buscadas y no encontradas: catálogo↔roster de effect.intensity coherentes (`{rottay:0, bithire:1(base), evnto:0}` vs declinación); catálogo↔MD coherentes; radios/collapses intactos; `entries.length` 198 estable.

## 6. Evidencia del reporte — contraste

Re-corrí de primera mano lo read-only: ambos gates del catálogo (valores exactos), parse del JSON, conteos 198/16/174, suma 261, tablas MD. `mirror-parity` 44/44 y `variant-parity` 34/34 quedan sobre el reporte (correr suites no es mi carril en este encargo), consistentes con que bajo `packages/core/manifest/` el único path dirty es el catálogo. `pnpm test:scripts` y `gates:ci` correctamente NO corridos por el writer (R-1 ya re-anclado `1719/12/1`; carril del v3 §6).

## 7. Observación no bloqueante

- **O-1** En las filas reparadas del MD el governor va completo, mientras las filas históricas conservan el truncado ~110 chars (p. ej. iconSize/evnto "--ds-icon-size-sta"). Inconsistencia de presentación, sin pérdida (el JSON es la autoridad); unificar cuando el roster se re-emita por herramienta.

---

## Cierre

- HEAD inmóvil · staged 0 · porcelain 11 exacto · roadmap `34aa05a4…` intacto · cero residuos.
- Cero writes al repo; cero pedido de commit; Kimi fuera de la cadena.

# VERDICT FINAL: ACCEPT

K4/F4A-14a queda postauditado y **cerrado**: las 8 reparaciones (3 catálogo + 5 sólo-roster) son exactamente las ratificadas, con la preservación bithire probada, la semántica ×1 declarada y evidenciada en el artefacto, la aritmética 261=95+96+70 re-derivada, 47/10/7 y 26/28/10 gate-verificados por mí, la parcialidad de iconSize declarada, y el perímetro intacto al byte. **K5 queda liberado** hacia el ruling del DT con las correcciones vinculantes de mi challenge. El commit del lote es decisión del DT; este memo no lo ejecuta ni lo solicita.
