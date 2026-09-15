# D6-2c-ii-RED — política común (medida por el coordinador de este lote, no la re-derives)

Worktree: `/Users/daniel/Developer/Rottay/r4-recon-opus/packages/core`. Corré todo desde ahí.
Base: el árbol 2c-ii ya integrado con los fixes de la ronda 2 (P0 verificador APCA, P1 precedencia de preview, P3#5 chart). **NO revertir nada. SIN COMMITS. Sin `git stash`, sin `git restore`, sin `git checkout`.**

Inventario de los 171 rojos con su detalle: `/private/tmp/claude-502/-Users-daniel-Developer-Rottay-r4-recon-opus/778bf176-68ee-4238-8118-28710cce6025/scratchpad/red/inventory.txt` (TSV: archivo, título, detalle).
Copia prístina de HEAD para A/B: `/private/tmp/claude-502/-Users-daniel-Developer-Rottay-r4-recon-opus/778bf176-68ee-4238-8118-28710cce6025/scratchpad/head-2cii/ui-design-system/packages/core` (podés correr vitest ahí).

## Las cuatro causas raíz ya medidas

**R1 · el anillo de foco no tiene productor.** `--ds-focus-ring-color` se declara SÓLO como constante de fundación (`foundation/themes/default/index.css:816` = `#ECECEC`); ningún deriver del compilador lo emite. Los temas autorados retirados lo autoraban como su primary. Medido hoy contra HEAD:

| vertical | HEAD | ahora | canvas |
|---|---|---|---|
| rottay | `rgb(255,255,255)` (su primary) | `#a3a3a3` | `#0b1220` |
| bithire | `rgb(58,111,176)` (su primary) | `#ECECEC` | `#FFFFFF` → **1.18:1** |
| evnto | `rgb(23,23,23)` (su primary) | `#ECECEC` | `#fafafa` → ~1.06:1 |

Gobierna: todas las aserciones `palette.seeds moves focusRing ...` y `Button > draws a focus ring that clears 3:1`. **Disposición: (iv) REGISTERED NEW** con esta medición. NO bajes el umbral 3:1 y NO borres la aserción: pineá el estado medido de forma que el rojo vuelva cuando el carril entregue el productor, y citá el registro.

**R2 · la tinta del menú ES la del sidebar.** Medido: `--ds-menu-item-color` === `--ds-sidebar-text` en las tres verticales. Con `navigation.sidebar-tone` decidido por el preset (bithire: `inverse`), un menú suelto sobre el canvas de página recibe la tinta clara del sidebar. bithire claro: `#f5f5f5` sobre `#f9fafe` = **1.04:1**. A/B: en HEAD esa familia no daba ese hallazgo.

**R3 · el ground base (claro) cascadea al bloque oscuro.** Ningún preset siembra paleta por modo, así que el bloque oscuro hereda el canvas claro del tenant. rottay oscuro: tinta `#f3f4f6` sobre `#f8f8f8` = **1.03:1**. A/B: 0 hallazgos en HEAD. Ya registrado por el DT como la obligación de derivación mode-aware (P3#6).

**R4 · la opción probada COINCIDE con la decisión del preset.** 65 de los rojos de causalidad son sobre **bithire**, cuyo preset decide: `density.mode: compact`, `states.emphasis: strong`, `shape.control-height: compact`, `shape.button-style: sharp`, `shape.radius-scale: 0.8`, `typography.scale: 0.94`, `spacing.rhythm: tight`, `surfaces.border-style: strong`, `surfaces.elevation-posture: soft`, `surfaces.effect-intensity: 0.2`, `states.focus-style: ring`, `palette.neutral-temperature: cool`, `palette.contrast-posture: high`, `navigation.sidebar-tone: inverse`, `responsive.posture: compact`, `motion.character: mechanical`. Si la suite muta al valor que el preset ya decide, la mutación no mueve nada: **no es pérdida de alcance**.

## Disposición por aserción — exactamente una

- **(i) REGISTERED**: ya la posee una entrada de WO. Citá cuál.
- **(ii) RE-ANCHORED**: la aserción afirmaba el contrato autorado retirado. Re-anclá al contrato neutro+preset **con la misma fuerza**. Para R4: elegí una opción que el preset NO decida (medí las dos caras y mostrá los dos valores en el reporte). Para un target cuya propiedad se mudó de canal: re-anclá el target, no bajes la aserción.
- **(iii) DEFECT FIXED**: sólo si es un defecto de producto que este lote puede cerrar sin mover bytes emitidos. **Si tu fix cambiaría un artefacto o una baseline de gate, NO lo hagas: reportalo.**
- **(iv) REGISTERED NEW**: hueco real que excede el lote. Medición + causa raíz + carril propuesto.

## Prohibido
Bajar un umbral. Achicar una población. Debilitar una aserción para que pase. Borrar sin nombrar el sujeto muerto. Tocar `roadmap/**`, el changeset, o baselines de gates. Tocar archivos fuera de tu set.

## Forma del pin cuando la disposición es (i)/(iv)
El rojo tiene que desaparecer SIN perder el detector. Pineá el estado medido nombrándolo, por ejemplo:

```ts
// WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): --ds-focus-ring-color
// has no producer; the foundation constant #ECECEC is what every vertical gets.
// Measured bithire 1.18:1 against its own canvas. The floor still reads 3:1 on the
// verticals whose ring resolves, and this list reddens when the lane lands.
```
y donde sea un conteo de hallazgos axe, pineá el hallazgo por `id` y por scope (no `toEqual([])` a secas, y tampoco un `length` suelto): si aparece OTRO tipo de violación, o crece el número de nodos, tiene que enrojecer.

## Comentarios y estilo
Inglés, sin emojis, ≤2 líneas por comentario salvo un docblock de causa raíz, sin narrar agentes ni rondas.

## Verificación tuya
`pnpm vitest run <tus archivos>` hasta 0 rojos; `pnpm exec tsc --noEmit`; `pnpm exec eslint <tocados>`. Guardá el log final.

## Reporte → `/private/tmp/claude-502/-Users-daniel-Developer-Rottay-r4-recon-opus/778bf176-68ee-4238-8118-28710cce6025/scratchpad/red/<grupo>.md`
Por ASERCIÓN: título, disposición (i/ii/iii/iv), evidencia/medición (los dos valores cuando re-anclaste un par), y el texto exacto de registro propuesto cuando sea (iv). Al final: archivos tocados, separando tests de producto. Tu mensaje final: 5 líneas máximo.
