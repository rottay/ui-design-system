# F4A K5 consolidado — adenda correctiva DT v2

**Base:** ruling DT `/private/tmp/f4a-k5-full-dt-ruling.md` SHA `69eef73e7d3a21875599d3f5c580b155af266061c3bbb462237f9a5a80759af4` + brief Opus `/private/tmp/f4a-k5-full-consolidated-opus-brief.md` SHA `7580e63289d7ef2ad3f01e69737ee790e32335d0d6ef8f9809ae2e51a675ace8`.  
**Challenge vinculante:** `/private/tmp/f4a-k5-full-fable-preaudit.md` SHA `84e8e29dff50093475649cd6bf3dfc297f44c91f64a6c8cb7eb5a33e6d052c36`, verdict `REJECT` con C-1..C-6 exactas.  
**Efecto:** esta adenda reemplaza únicamente los textos y el reparto enumerados abajo. Todo el write-set, orden, productores, negativas, stops, contadores 40→0 / 33→33 / 4099→4155 y exclusiones del brief permanecen vinculantes.

## 1. Reparto corregido

El lote sigue teniendo 57 docblocks, pero el reparto correcto es **7 `derived` + 50 `seed`**:

- Rottay: 2 `derived` + 15 `seed`.
- BitHire: 5 `derived` + 31 `seed`.
- Evnto: 0 `derived` + 4 `seed`.

`rottay CHROME.table.cellFontSize` pasa de `derived` a `seed`, con governor exacto:

`coincide con la emision rottay de --ds-text-body-size (facade/artifacts/rottay/index.css:997, 0.875rem): relacion declarada (K-4 packet v2)`

## 2. Seis governors Rottay sustituidos

| keypath | governor vinculante |
|---|---|
| `CHROME.table.border` | `coincide en color con la familia de rol borde del tema (#2A2A2F, 72 claves: border ×20, headerBorder ×4, borderColor ×4, footerBorder ×3, dividerColor ×2, cardBorder ×2, …): relacion por rol declarada; NO coincide con PALETTE.borderColor (rottay:3466, #28282C); la unica coincidencia en PALETTE es interactiveBgActiveColor (:3512), rol distinto: accidente declarado` |
| `CHROME.table.cellColor` | `coincide en color con PALETTE.textColor (rottay:3533, #ECECEC), mismo rol de tinta de texto: relacion declarada; la tinta se comparte en 64 claves del archivo, dominadas por roles de texto (color ×11, titleColor ×6, labelColor ×4, …); linkColor (:3484) porta la misma tinta` |
| `CHROME.table.headerBg` | `coincide en color con la familia de rol fondo secundario del tema (#131316, 22 claves: bg ×13, headerBg ×3, …): relacion por rol declarada; sin coincidencia en PALETTE (backgroundSecondaryColor #0F0F12, backgroundTertiaryColor #141417 difieren); converge internamente con CHROME.table.rowBgStriped` |
| `CHROME.table.rowBgStriped` | `coincide en color con la familia de rol fondo secundario del tema (#131316, 22 claves: bg ×13, headerBg ×3, …): relacion por rol declarada; sin coincidencia en PALETTE (backgroundSecondaryColor #0F0F12, backgroundTertiaryColor #141417 difieren); converge internamente con CHROME.table.headerBg` |
| `CHROME.table.rowBgHover` | `superposicion alfa propia del eje; 3 ocurrencias en el archivo: esta hoja, iconBg (:7686) y un ingrediente de gradiente (:7742), ambas de rol distinto: accidente declarado; sin coincidencia de mismo rol` |
| `CHROME.table.rowBgSelected` | `6 ocurrencias en el archivo; las otras 5 (headerBorder :4426, bgHover de botones :5669/:5710, closeBgHover :7566, borderColor :7977) son de rol distinto (hover/borde vs seleccionado): accidente declarado; NO coincide con --ds-select-option-bg-selected de rottay (#2A2A2F, artefacto, evidencia de valor) — a diferencia del mismo eje en bithire` |

## 3. Correcciones puntuales restantes

- BitHire `CHROME.table.radius`: sustituir la cláusula de divergencia por `pero el valor DIVERGE del peldano: --ds-radius-lg efectivo de bithire = 14px (base calc(14px/1.25) × escala 1.25, artefacto bithire :812-:814; DS default 12px, default.css:774) frente a 10px autorado`.
- Rottay `CHROME.table.headerFontSize`: governor del brief más `; converge con el valor autorado por bithire para el mismo eje (0.6875rem)`.
- Baseline `producedBy`: `Baja #14: K5 consolidado (57 tags por hoja en CHROME.table: bithire 36 + evnto 4 —los 40 del contador— y rottay 17 con retiro del family tag stale, cobertura que cambia de dueño con contador quieto; headerColor rottay conservaba su tag) — untaggedAuthoredLeaves 40 -> 0; divergentSlots quieto en 33; tagRegistry 4099 -> 4155, verificado por el DT contra el artefacto regenerado.`
- Baseline `reading.untaggedAuthoredLeaves`: `0 tras K5: -40 (bithire 36 + evnto 4, todas CHROME.table, por hoja); las 17+1 de rottay pasaron de cobertura por family tag a tags por hoja sin tocar el denominador. Anterior: 40 tras F4A-13. Unidad LEXICA.` No tocar `divergentSlots` ni `porQueNoCoinciden`.
- GAT-07 fuera del lote: reemplazar la explicación imprecisa por `sus tests de pierna 1 no verifican la frescura del artefacto sellado (los usos de 'stale' son el detector de claims documentales), probado además empíricamente: la corrida con tema editado no lo enrojeció`.

## 4. Autorización condicionada

Fable debe ratificar que esta adenda incorpora C-1..C-6 sin abrir alcance. Sólo ese `ACCEPT` libera a Sonnet. Sonnet implementará el brief base **más esta adenda**, donde esta adenda gana ante cualquier contradicción.

# VERDICT: READY_FOR_FABLE_RATIFICATION
