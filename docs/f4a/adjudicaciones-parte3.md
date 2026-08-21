# F4A-1 (parte 3) — Adjudicaciones del DT sobre el roster borrador

Fecha: 2026-08-20. Sobre `/tmp/f4a-1-roster-draft.md` (worker Opus) y sus 4
observaciones. Todas correctas; así se resuelven.

## 1. El universo del roster queda a NIVEL RAÍZ — y eso es por diseño

`baseline` y `pro-expert` en cero NO es un hueco: esos dos domicilios viven a
nivel HOJA/FAMILIA (los tags de fuente de los lotes de reescritura), no a
nivel raíz. El roster (raíces) no los produce porque las raíces no son su
plano:

- `baseline` (invariante vertical con razón) se aplica a hojas/canales
  concretos — K5 (`--ds-table-bg`/`--ds-table-row-bg` de bithire) se etiqueta
  en F4A-15 con `@domicile baseline` + la razón escrita, en fuente, no en el
  roster.
- `pro-expert` se ANCLA a la capability: una hoja dentro de una capability
  Pro/Expert activa del tema (el roster CAPABILITIES medido: motion activo ×3,
  recipes activo rottay+bithire, expressive activo bithire) lleva
  `@domicile pro-expert` + governor = la capability. Medible, anclado, sin
  invención.

El harness de F4A-2 lee los DOS niveles (roster de raíces + tags de hojas).
El resumen del roster mostrará baseline/pro-expert = 0 a nivel raíz con esta
nota escrita, para que nadie vuelva a leerlo como descuido.

## 2. El roster SÍ varía por tema: entra `posture` medido

Regla nueva: cada entrada (raíz × tema) lleva **`posture`**: `authored` |
`unassigned`, medido del walk de F4A-0 (¿el tema toma posición autorada sobre
la raíz o no?). Una entrada con `posture: unassigned` tiene domicilio
`unassigned` + la razón de la ley de placeholder — aunque otro tema la tenga
como seed/derived. Las reglas de nudo overridean por tema SOLO donde el nudo
lo dice escrito (K2-evnto se corrige al canon en F4A-5; K4 lleva posture
unassigned en el tema en cero). Con eso el roster deja de ser idéntico por
tema — como tiene que ser.

## 3. El par border se adjudica FUERA del eje de tiers (raíz autora #2)

Las 4 tier.*.border BLOCKED: ninguna "porta el seed" — la colisión a 4 bandas
es la prueba de que el par es su propia entidad. Se AUTORA la raíz
**`color.border`** (par: `--ds-color-border` = seed; `--ds-color-border-primary`
= derived de ella), segunda y última raíz autora de F4A (la otra es K3
`--ds-color-text-secondary`). Las 4 tier.*.border quedan `derived` con
governor = la raíz `color.border` + su lógica de nivel. K2 se ejecuta en
F4A-5 sobre la raíz autora (evnto invierte su atadura al canon; pintura
computada idéntica; R35 REDERIVED). Raíces del catálogo: 63 + 2 = **65**.

## 4. MISSING-CITATION: las 2 quedan `derived` con ancla explícita

- `tier.overlay.fg`: governor = "la tinta del nivel inmediato anterior en la
  cadena de tiers (page → base → raised → overlay; la cabeza de tinta es
  K3 `--ds-color-text-page` cuando aterrice F4A-6 — revisado: la primera
  versión citaba `--ds-color-text-secondary`, que ya existía con otro valor)".
  El mecanismo citado ES la relación de raíz; la cita queda explícita.
- `state.delta.disabled`: governor = "el reposo de su control padre (una
  parada: opacidad + desaturación sobre él)". `derived`.

## 5. `tier.overlay.border` recupera su K4

Con el par fuera del eje, `tier.overlay.border` queda `derived` (governor:
color.border) y **recupera su nota K4** (tema en cero) vía posture. K4 queda
sobre las 16 completas.

## 6. Redraft = F4A-1c (worker)

Re-emitir el roster con: posture por tema, el par color.border autora, las 2
citaciones, baseline/pro-expert con la nota de nivel, conteos nuevos por tema
(ya NO idénticos). Falsable: total = 65×3 = 195 + 1 K3 = **196 entradas**.
