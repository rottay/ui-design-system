# F4A-15 / K5 — adjudicación consolidada v2 (Opus, READ-ONLY)

Adjudicador: Claude Opus, arquitectura read-only. DT: Codex. Auditor: Fable 5.
**K4 cercado esperando a Kimi — no lo toco.** **Kimi sigue 403**: por eso esta
v2 **consolida sin resolver** ninguna decisión de diseño abierta.

**Read-only estricto**: cero escrituras en el repo, cero build/generadores/tests
mutantes, cero git de mutación, cero commit. Write-set único: este memo y su
`.ready`.

```
HEAD esperado  9d5582dfdf1d02f1d7e8fd468720b1d829e50454   → COINCIDE
worktree       git status --porcelain → 0 entradas         → LIMPIO
```

Insumos, verificados byte-exactos en esta ronda:

| insumo | SHA-256 | verdict |
|---|---|---|
| `f4a-15-k5-opus-adjudication.md` (v1) | `ab3002b27a4f4e3de022f2488f35f6a744f64a1ca2c79302800c07276ff160c4` | — |
| `f4a-15-k5-fable-challenge.md` | `65a4604cb8f5bcc617c8f01f368dd0b2b88c3a47c3465388c6d27259c425c32b` | **ACCEPT_WITH_CORRECTIONS** |
| `f4a-15-k5-sonnet-inventory.md` (base de ambos) | `5ea2c0eaef80e802730ae44f139d736565b1f2d51286d8d1adf6b7bd0c2bf2a2` | — |

**C-F1…C-F4 se incorporan como autoridad del paquete.** La arquitectura de v1
(tercera vía, tres tranches, K5c aparte, consulta de diseño sin inventar
consenso) sobrevive entera; lo que se mueve son **fronteras**, y una de ellas
—K5a— se mueve lo suficiente como para dejar de ser lo que v1 decía que era.

---

## 1. Lo MEDIDO — cerrado, no se re-litiga

Reproducido por tres rondas independientes (Sonnet, yo, Fable), con la
maquinaria real del programa importada en caliente:

| hecho | valor | estado |
|---|---|---|
| hojas autoradas sin tag | **40 = bithire 36 · evnto 4 · rottay 0** | **MEASURED** — 0 falsos positivos fuera de `CHROME.table` |
| ya `DERIVED` correctas | **5** (bithire `cellColor`, `reorderBg`, `filterFocusShadow`, `rowFocusShadow`, `rowHoverShadow`) | **MEASURED** |
| **clase A** — emisión idéntica raíz↔hoja | **4** (bithire `resizeBgHover`, `headerBg`, `headerColor`; evnto `headerColor`) | **MEASURED** |
| **clase B/C** — no probable mecánicamente | **6** (B: `border`, difiere en capitalización; C: `headerBgHover`, `resizeBg`, `actionBorder`, `headerBorder`, `headerShadow`, literales dentro de `color-mix()`) | **MEASURED** |
| **CONTROL_INPUT** | **1** (`cellFontSize`; precedente real en el gemelo dark, `bithire/index.ts:1641`, `dial: typography.scale`) | **MEASURED** |
| seeds propios de evnto | **3** (`headerBg`, `headerFontSize`, `headerFontWeight`) | **MEASURED** |
| `PRO_EXPERT` en table | **0**, los 3 temas | **MEASURED** |
| silencios en plano base (léxico) | **19 rottay · 1 bithire · 33 evnto** sobre unión léxica de 37 slots | **MEASURED — ver §4** |

`5 + 4 + 6 + 1 + 21 + 3 = 40` ✓ (las 21 se parten en §2, sin cambiar el total).

### Precisión propia sobre C-F1 que conviene dejar escrita

Las coincidencias de `bg`/`rowBg`/`actionBg` con las cuatro raíces tier son de
**color**, no uniformemente de **byte**: medido, las hojas son `#ffffff`,
`#ffffff` y `#FFFFFF`, y las emisiones son `--ds-surface-control` `#FFFFFF`,
`--ds-surface-card` `#FFFFFF`, `--ds-sidebar-bg` `#ffffff`,
`--ds-surface-overlay` `#ffffff`. Es la **misma distinción de clase B** que
introduje en v1 (hex CSS es case-insensitive: mismo píxel, distinto byte).
**Consecuencia operativa**: el governor de relación-escrita debe decir
*"coincide en color con la emisión de X"*, no *"es byte-idéntico a X"*, salvo
donde lo sea. La sustancia del hallazgo de Fable no cambia; su formulación sí.

Verificado igual: rottay `bg`/`rowBg` `#0C0C0E` **es** byte-idéntico a la
emisión de `--ds-color-bg-primary` (`tier.base.bg`).

---

## 2. C-F1 — la manta "21 baseline" queda RETIRADA

`baseline` como etiqueta única sobre 21 hojas está **falsado por medición**. Se
parte en tres regímenes. Uso los `~` de Fable **tal cual**: no invento
precisión donde la evidencia es graduada.

| grupo | n | hojas | régimen |
|---|---|---|---|
| **coincidencia con raíz del catálogo** | **3** | `bg`, `rowBg`, `actionBg` | **relación-escrita obligatoria**, nombrando las **4 raíces tier** (`tier.control.bg`, `tier.raised.bg`, `tier.page.bg`, `tier.overlay.bg`) **y H4** |
| **relación graduada / coincidencia accidental** | **~12** | `rowBgHover`, `filterRowBg`, `rowBgExpanded`, `rowBgSelected`, `rowBorder`, `pageButtonHoverShadow`, `headerTextTransform`, `headerBlockSize`, `headerFontWeight`, `radius`, `cellPaddingComfortable`, `sheen` | governor que **declare** si la coincidencia es relación o accidente — el criterio para decidirlo es **OPEN_KIMI** |
| **candidatas a `baseline` con razón falsable** | **~6** | `rowBgStriped`, `cellPaddingCompact`, `cellPaddingSpacious`, `headerFontSize`, `headerLetterSpacing`, `loadingOverlayBg` | `baseline` **sólo con razón escrita**; **dos** (`headerFontSize`, `headerFontWeight`) deben citar la **convergencia con rottay** o el rótulo miente |

Dos detalles medidos que la razón escrita no puede omitir:

- **`bg`/`rowBg` son el propio eje H4**, y ahí la coincidencia es **base sí,
  dark no** (`--ds-table-bg` dark `#0f1520` vs `--ds-surface-control` dark
  `var(--ds-color-bg-primary)`). Ésa es la sustancia medible del *"no es
  cero-delta"* de F4A-0: la unificación movería el dark. La razón escrita de
  esas dos hojas **debe decirlo**.
- **`--ds-surface-card` es el fallback literal del skin** para `--ds-table-bg`
  (`data-table.css:288`). Etiquetar `bg` como divergencia independiente mientras
  el skin ya cae a esa misma raíz sería contradecir el consumidor.
- **`radius` ya lleva una relación declarada en el propio archivo** ("Tables/
  panels ride the lg radius step"). Un `baseline` a secas la contradice.

**`headerFontWeight` aparece en dos filas** (graduada por sus 14 coincidencias;
convergente con rottay por su valor `600`). No lo fuerzo a una sola: **es
exactamente el tipo de hoja cuyo régimen depende del criterio graduado, que es
OPEN_KIMI.**

---

## 3. C-F2 — K5a se reduce a lo que es realmente mecánico

v1 decía que K5a era "mecánico, sin decisión de diseño" e incluía las 18 de
rottay. **Falso, y Fable lo midió**: rottay `bg`/`rowBg` coinciden byte-exacto
con `tier.base.bg`, y `cellFontSize`, `rowBorder`, `cellColor`, `border`,
`headerBg`, `rowBgStriped`, `rowBgSelected`, `headerFontWeight` tienen
coincidencias densas. Etiquetarlas `seed` a secas sería **la misma clase de
shadowing** que §4 de v1 exige escribir para las 10 de bithire/evnto.

**K5a mecánico queda en 6 hojas**: las **5 ya-derivadas** (tag `derived` con su
raíz citada) + **`cellFontSize`** (`dial: typography.scale`, con el precedente
dark medido).

**Las 18 de rottay pasan a `OPEN_KIMI`**, con una salida condicional:

> **Si Kimi aprueba la regla general** —*"toda hoja cuyo valor coincida con la
> emisión de una raíz del catálogo lleva la relación medida en su governor"*—
> entonces las 18 vuelven a ser **mecánicas** y pueden entrar a K5a.
> **Sin esa regla aprobada, no entran.**

**No atribuyo ninguna posición a Kimi sobre esa regla.** Queda planteada como la
condición que desbloquea, no como una preferencia.

**Y una consecuencia que v1 no vio y Fable sí**: la tercera vía sólo es
cumplimiento genuino —y no maquillaje— **si el régimen de relación-escrita se
aplica a TODAS las coincidencias medidas**: las 10 originales + las 3 de C-F1 +
las ~12 graduadas + las de rottay. Aplicarlo selectivamente deja lo no cubierto
como shadowing sin justificar, que es justo lo que la ley prohíbe.

---

## 4. C-F3 — el 53 es medida LÉXICA

**19 rottay · 1 bithire · 33 evnto** sobre una unión léxica de 37 slots es
**exacto como medida léxica**, y así se cita. Pero la unión mezcla **dos
esquemas de nombres** para el mismo eje: rottay autora `cellPadding`, bithire
autora `cellPaddingCompact/Comfortable/Spacious`. Consecuencias medidas:

- el "1 de bithire" es un **pseudo-silencio**: bithire cubre el eje bajo otro
  nombre;
- los 33 de evnto cuentan **4 slots léxicos para un solo eje semántico** de
  padding;
- el titular "53 = 1,3× las 40" está **inflado**.

**Lo que NO hago**: fijar una cifra semántica. Fable escribe **~46-49** y dice
explícitamente que es aproximada; **no la convierto en exacta ni la uso como
cantidad de placeholders**.

**Adjudicación**: **K5c construye y adjudica primero la unión SEMÁNTICA** —
contando el eje padding **una vez**— y recién después siembra placeholders.
Sembrar sobre la unión léxica declararía ausencias sobre slots que el tema **sí
cubre bajo otro nombre**, que es una afirmación falsa en una autoridad.

**Lo que se sostiene sin cambios**: la sustancia de C-2 de v1. **Rottay, el
tenant que el inventario presenta como limpio, tiene ~16 silencios semánticos**
— sigue siendo el hallazgo, aunque el número baje de 19.

---

## 5. C-F4 — dos destinos, dos problemas, sin mezclar

| problema | hojas | destino | fuente de la ley |
|---|---|---|---|
| **unificación H4** (¿la tabla adopta la identidad "superficie de control"?) | el par `bg`/`rowBg` | **F4C (craft)** | `docs/f4a/esquema-asignacion.md:101-105` |
| **recableo causal de coincidencias** (¿el valor que hoy coincide *debe* moverse junto mañana?) | las 10 + las de C-F1/C-F2 | **F4B / F2-asimétrico** | adjudicación v1 §4 |

Son decisiones **distintas sobre hojas distintas**. La prosa corregida
post-K4 debe citarlas por separado; fusionarlas haría que una decisión de craft
arrastre un recableo de identidad, o al revés.

**H4 se preserva sin cambios**, y el argumento de v1 contra generalizarla se
mantiene reforzado en las dos direcciones que Fable señala: **ni** H4 licencia
hardcodes en otros ejes, **ni** "preservar H4" exime de escribir que `bg`/`rowBg`
coinciden **hoy en base** con el propio eje que H4 niega — y divergen en dark.

---

## 6. Matriz compacta

| estado | contenido | n |
|---|---|---|
| **`MEASURED`** | 40 = 36/4/0 · 5 derived · 4 clase A · 6 clase B/C · 1 control-input · 3 seeds evnto · 0 pro-expert · silencios léxicos 19/1/33 · H4 base-coincide/dark-diverge · coincidencia de las 3 con 4 raíces tier · rottay `bg`/`rowBg` ↔ `tier.base.bg` | — |
| **`MECHANICAL_READY`** | 5 ya-derivadas (tag `derived` + raíz citada) · `cellFontSize` (`dial: typography.scale`) | **6** |
| **`OPEN_KIMI`** | seed vs baseline base/dark · regla general de root-coincidence governor · criterio graduado para canales no-raíz · las 18 de rottay · unión semántica y sentido de los gaps · la razón falsable de **cada** `baseline` | **6 ítems** |
| **`DEFER_F4B_F2`** | recableo causal de las coincidencias (10 + C-F1 + C-F2), con sus clases A/B/C registradas | — |
| **`DEFER_F4C`** | unificación H4 del par `bg`/`rowBg` | — |
| **`K5C_SEMANTIC_MAP_FIRST`** | los silencios: mapa semántico y adjudicación **antes** de cualquier placeholder | — |

### Stop conditions

1. `build()` no reproduce **40** con las mismas rutas → PARAR (el árbol se movió).
2. Aparece una hoja sin tag fuera de `CHROME.table` / `OVERLAY.chrome.table` → PARAR.
3. Un tag exige cambiar un **valor** para ser verdadero → PARAR (K5 no materializa).
4. **K5b se despacha con cualquier ítem `OPEN_KIMI` sin adjudicar por escrito** → PARAR.
5. Un `baseline` sin **razón falsable escrita** → PARAR. Y si la hoja tiene
   coincidencia medida, la razón **debe nombrarla** (C-F1).
6. El régimen de relación-escrita se aplica **selectivamente** → PARAR: lo no
   cubierto vuelve a ser shadowing sin justificar (C-F2).
7. **K5c siembra un placeholder antes de que exista la unión semántica** → PARAR (C-F3).
8. Se usa **53 como cantidad de placeholders**, o **~46-49 como cifra exacta** → PARAR.
9. Se recablea cualquier coincidencia dentro de F4A → PARAR (destino F4B/F2).
10. Se unifica el par H4 fuera de F4C → PARAR.
11. Las 18 de rottay entran a K5a **sin** la regla general aprobada → PARAR (C-F2).
12. Se toca cualquier cosa de K4 → PARAR (cercado).

---

## 7. `OPEN_KIMI` — los seis, sin posición atribuida

Kimi está 403. Estos quedan **abiertos y nombrados**; **no atribuyo posición a
nadie sobre ninguno**, ni infiero consenso de los precedentes del programa.

1. **`seed` vs `baseline` en base/dark.** Bithire dark ya usa `seed` (12 tags)
   para la misma clase de dato que la prosa vigente llamaría `baseline` en base.
   Elegir define qué significa `baseline` **en todo el programa**, no sólo en
   table. Las dos salidas coherentes están planteadas en v1 §5.1; **ninguna
   adjudicada**.
2. **Regla general de root-coincidence governor.** *"¿Toda hoja cuyo valor
   coincida con la emisión de una raíz del catálogo lleva la relación medida en
   su governor?"* Su aprobación **desbloquea las 18 de rottay** como mecánicas;
   su rechazo las manda a K5b. **Abierta.**
3. **Criterio graduado para canales no-raíz.** Las ~12 coinciden con canales
   vivos que **no** son raíces del catálogo, con peso semántico variable (desde
   `rowBgSelected` ↔ `--ds-select-option-bg-selected`, mismo rol, hasta
   coincidencias débiles). **¿Dónde está el umbral entre "relación" y "accidente"?**
   Sin criterio, cada hoja se decide a ojo. **Abierta.**
4. **Las 18 de rottay** (consecuencia de 2, pero decidible aparte).
5. **Unión semántica y sentido de los gaps.** Dos preguntas acopladas: cómo se
   cuenta el eje padding, y qué **significa** un silencio — ¿la tabla de evnto
   es **deliberadamente mínima** o **incompleta**? Un placeholder afirma lo
   primero. **Abierta.**
6. **La razón falsable de cada `baseline`.** El vocabulario la exige y hoy **no
   existe para ninguna** de las ~6 candidatas. Dos deben citar la convergencia
   con rottay. **Abierta, hoja por hoja.**

---

## 8. Tranches replanteados

### K5a — mínimo seguro · **6 hojas** · sin decisión de diseño

- **Contenido**: las 5 ya-derivadas + `cellFontSize`.
- **Read-set**: `bithire/index.ts`, `manifest/variant-parity/index.mjs`,
  `manifest/mirror-parity/index.mjs`, `dist/…/brand-theme/index.js`.
- **Write-set candidato**: `bithire/index.ts` — **1 path**.
- **Contador esperado**: `untaggedAuthoredLeaves` **40 → 34**.
- **Pruebas**: byte-identidad ida y vuelta (3 builds reales, hash conjunto de
  `facade/artifacts/` + `styles/` idéntico); `failures: 0`; **negativo
  obligatorio** (mutar una hoja etiquetada y ver que el contador o el hash se
  mueve — si no muerde, el tag no prueba nada); restore con
  `git show HEAD:<path> > <path>`, **nunca** `git checkout`.
- **Condición de ampliación**: si Kimi aprueba la regla general (`OPEN_KIMI` 2),
  las 18 de rottay entran acá y el write-set suma `rottay/index.ts`. **Su
  re-tag no mueve el contador** —esas hojas ya están cubiertas por el tag de
  familia— así que la prueba de que sirvió es el **retiro del tag de familia
  vencido** de `rottay/index.ts:7259`, no el ratchet.

### K5b — el resto de las 40 · **sólo tras Kimi**

- **Contenido**: las 3 del régimen de raíz + las ~12 graduadas + las ~6
  candidatas a `baseline` + las 10 con relación escrita + los 3 seeds de evnto.
- **Bloqueado** por `OPEN_KIMI` 1, 3 y 6.
- **Write-set candidato**: `bithire/index.ts`, `evnto/index.ts`, y la entrada
  "Baja #14" en `variant-parity.baseline.json` **después** de regenerar y
  verificar.
- **Contador esperado**: → **0**.

### K5c — los silencios · **sólo tras mapa semántico + Kimi**

- **Paso 1**: construir la **unión semántica** (padding una vez) — es
  **medición**, y puede hacerse read-only.
- **Paso 2**: adjudicar el **sentido** de los gaps (`OPEN_KIMI` 5).
- **Paso 3**: recién entonces, placeholders.
- **Mueve `divergentSlots`, no `untaggedAuthoredLeaves`** — no se mezcla con
  K5a/K5b bajo ninguna circunstancia (stop 7).

**Fronteras duras**: K5b no se despacha antes que sus `OPEN_KIMI` estén
resueltos **por escrito**; K5c no se mezcla con los otros dos; ninguno toca K4.

---

## 9. Riesgos vigentes

| # | sev | riesgo |
|---|---|---|
| 1 | **ALTO** | Etiquetar en manta sigue siendo el defecto más probable: `baseline` es **falso** para 15 (5 derived + 10 coincidentes), **falsado por medición** para las 3 del régimen de raíz, y **sin razón escrita** para las ~6 candidatas. |
| 2 | **ALTO** | Aplicar la relación-escrita **sólo a las 10 originales** convierte la tercera vía en maquillaje: lo no cubierto (C-F1, C-F2) vuelve a ser shadowing sin justificar. |
| 3 | **ALTO** | Declarar F4A cerrado con los silencios vivos sería clausura falsa — y **rottay**, presentado como limpio, es el segundo mayor deudor. |
| 4 | **MEDIO** | La promesa de `rottay:7259` vence con F4A-15. Si K5 no la cierra ni la reescribe, queda prometiendo una prueba que ya no puede llegar. |
| 5 | **MEDIO** | Sembrar placeholders sobre la unión **léxica** afirmaría ausencias falsas donde el tema cubre el eje bajo otro nombre. |
| 6 | **MEDIO** | Con Kimi 403, la presión de despachar K5b "porque está medido" es real. Está medido **el hecho**; no está adjudicado **el domicilio**. |
| 7 | **BAJO** | `CHROME.table` sigue sin fila en `mapa-familia-canales` ni `strictClass`: darle una es ampliación explícita de alcance. |
| 8 | **BAJO** | Mis mediciones usan `dist/`; la frescura se verificó indirectamente (los contadores vivos reproducen el sello de F4A-13). Un lote de escritura debe reconstruir antes de probar. |

---

## 10. Roadmap / checkpoint — sostenido: **después de K4**

Las tres razones de v1 se mantienen y Fable las ancló: el estado de K4 vive en
esos mismos archivos y está cercado; los ítems `OPEN_KIMI` no están adjudicados;
y el precedente del propio frente es corregir **después** de medir.

C-F1 y C-F3 le dan a esa corrección única cifras más finas: **40 = 36/4/0**;
silencios **léxicos 19/1/33** con lectura semántica pendiente; **5** derivadas;
**10 + 3 + ~12** con coincidencia medida; **~6** candidatas a `baseline` sin
razón escrita; y los **dos destinos separados** (F4C para H4, F4B/F2 para el
recableo).

---

## 11. Confirmación de fences

- **Repo intacto**: HEAD `9d5582dfd…`, `git status --porcelain` vacío, antes y
  después.
- Cero escrituras en el repo, cero build, cero generadores, cero tests mutantes,
  cero git de mutación, cero commit.
- **K4 no tocado** — citado sólo como precedente de adjudicación, sin alterar su
  estado.
- Memos de Sonnet y Fable **no editados**; ambos verificados por SHA.
- **Ninguna posición atribuida a Kimi**; los 6 ítems `OPEN_KIMI` quedan abiertos.
- **Ninguna decisión de diseño resuelta en esta v2.**
- Write-set de esta ronda: este memo y su `.ready`.

---

`READY_FOR_KIMI_CHALLENGE`
