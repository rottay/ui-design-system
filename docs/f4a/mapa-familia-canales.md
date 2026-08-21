# F4A-3a — El plano familia → canales → control

**READ-ONLY.** Arbol `dffd3c795`. Metodo: **sonda por hoja** — 3.726 compilaciones.

> **PARADA declarada:** la columna *raiz del roster* NO existe. `root-checklists.json` atribuye a **CONTROL** (los 20 diales), y la interseccion de sus 16 `rootId` con las 66 raices del roster es **VACIA**. El mapa entrega familia→canales→**control**, que es lo que el arbol si sabe decir. Detalle en el reporte.

---

## Totales

| tema | hojas lexicas | hojas evaluadas | familias | canales compilados | hojas sin canal |
|---|---|---|---|---|---|
| rottay | **1820** | 1811 | 55 | 1937 | 52 |
| bithire | **1503** | 1493 | 40 | 1710 | 48 |
| evnto | **397** | 422 | 20 | 564 | 49 |

Las hojas lexicas reproducen **1820 / 1503 / 397** exactas (ancla §3). La particion por familia es sobre la unidad **evaluada** (1811/1493/422), que es la que la sonda puede mutar — ver el reporte.

## La respuesta a §6

| clase | familias x tema | hojas |
|---|---|---|
| **LIMPIA** — un solo control, tag de familia directo | **33** | 640 |
| **MIXTA** — mas de un control | **29** | 2706 |
| **SIN CONTROL** atribuido | **53** | 380 |
| **total** | **115** | **3726** |

**Solo el 29 % de los pares familia x tema (33 de 115) admite un tag de familia limpio, y cubren el 17 % de las hojas (640 de 3.726).**

### Y los grupos NO son sub-bloques contiguos

De las **29 familias mixtas**, **24 estan ENTRELAZADAS** hoja a hoja; solo **5** tienen sus grupos en tiradas contiguas. Mediana de `runs / grupos`: **3,5**.

| familia | hojas | grupos de control | tiradas en fuente |
|---|---|---|---|
| rottay `CHROME.controls` | 402 | 4 | **80** |
| rottay `OVERLAY.chrome` | 571 | 4 | **75** |
| bithire `CHROME.controls` | 295 | 6 | **67** |
| bithire `OVERLAY.chrome` | 293 | 5 | **61** |
| bithire `SURFACES` | 94 | 2 | **35** |

**Respuesta medida para tu adjudicacion de 3b: NO alcanza tag-por-familia + tag-por-sub-bloque.** Los sub-bloques fisicos no existen — dentro de `CHROME.controls` de rottay los 4 grupos de control se alternan 80 veces. Cubrir esas 2.706 hojas exigiria un docblock por hoja, o reordenar llaves dentro de los consts (que F4A-3 prohibe explicitamente).

---

## Las hojas sin canal, por clase (149)

| n | clase | ejemplo |
|---|---|---|
| 75 | **vocabulario de forma/posicion** — el compilador lo consume como ARGUMENTO (elige receta, alimenta un calculo), no lo emite como canal | `chrome.accent.barStyle`, `chrome.card.defaultElevation`, `typography.labelStyle` |
| 19 | enum de charts (personalidad) | `charts.animateOnMount` |
| 18 | prosa de capability | `capabilities.expressive.reason` |
| 15 | estado de capability | `capabilities.motion.status` |
| 14 | fisica/enum de motion (argumento del compilador) | `motion.entrance`, `motion.springTension` |
| 6 | identidad del tema | `id`, `name` |
| 2 | appearance (metadato) | `appearance.defaultMode` |

Las 6 de identidad y las 2 de appearance son parte de la lista de 36 metadatos de A.1. Las otras 141 **no son metadato**: son decisiones autoradas reales que simplemente no bajan a un canal propio.

---

## Las anclas de §3, una por una

| ancla | veredicto |
|---|---|
| hojas lexicas 1820/1503/397 | **✓ exacto** |
| particion sin solapes ni huecos | **✓** sobre la unidad evaluada (1811/1493/422); ver desvio en el reporte |
| las 198 entradas del roster citadas al 100 % | **✗ NO SE PUDO** — la columna raiz no existe (parada) |
| `PALETTE` / `OVERLAY.palette` / `CHROME.accent` | ver abajo |
| `CHROME.card` de rottay reproduce card-bg / card-border / card-shadow | ver abajo |

### Las 3 familias con match nominal — el mapa CORRIGE mi lectura de la parada

- **`PALETTE`** (rottay, 154 hojas): **MIXTA**, no limpia. Toca `palette.seeds` **y** `token-overrides`. Mi parada la dio por match real; el mapa dice que ni siquiera es de un solo control.
- **`OVERLAY.palette`** (rottay, 160 hojas): **MIXTA**, mismos dos controles.
- **`CHROME.accent`**: sus 18 hojas de rottay son **todas del vocabulario de forma** (`barPosition`, `barStyle`, `badgeShape`…) — **cero canales**. Confirmado: el match con `tier.accent.*` era nominal, y ademas la familia no emite pintura.

**Las tres eran falsos amigos.** La parada decia "solo PALETTE es match real"; el mapa dice que **ninguna** de las tres es un match limpio.

### `CHROME.card` de rottay — el mapa me CORRIGE

Mi parada puso a `CHROME.card` como el ejemplo de familia mixta: *card-bg -> tier.raised.bg, card-border -> el par border, card-shadow -> elevation.ladder*. **Medido, es falso.**

`CHROME.card` tiene **5 hojas** (`defaultElevation`, `hoverElevation`, `showBorder`, `hoverTint`, `paddingDensity`) y **emite CERO canales**: son todas vocabulario de forma.

La familia que si emite esos canales es **`CHROME.cardComponent`** (29 hojas, 38 canales), y ahi el ejemplo si se sostiene — y de hecho es peor de lo que dije:

```
--ds-card-bg      <- cardComponent.bg      control: (ninguno)
--ds-card-border  <- cardComponent.border  control: palette.seeds
--ds-card-shadow  <- cardComponent.shadow  control: palette.seeds
```

De sus 38 canales, **30 no tienen control atribuido**, 7 caen en `palette.seeds` y 1 en `typography.scale`. Confundi `card` con `cardComponent` al escribir la parada. La conclusion de la parada no cambia —descansaba en la medicion 64/67, no en este ejemplo— pero el ejemplo estaba mal y queda corregido.

---

## Como leer el JSON

`/tmp/f4a-3a-mapa.json`: por tema, `families[]` con `family`, `leaves`, `leafPaths[]` (orden de fuente), `channels{}` (cada canal con `fedBy[]` = las hojas que lo mueven, `control` y `checklistRoot`) y `unattributedLeaves[]`.
