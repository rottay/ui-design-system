# Capacidades canónicas de los motores congelados (disposición D-A, 2026-10-07)

Estado: vigente desde el lote de disposición de WO-RET-06 (2026-10-08). Autoridad
final: la disposición fechada D-A del paquete del owner de 2026-10-07
(`roadmap/retire.md`, enmienda de WO-RET-06), ruta (b) de la aceptación de R32 Q4.

## Qué decide D-A

Los motores congelados Classic y Rustic **conservan** los comportamientos de la
tabla de abajo mientras se publiquen. Para cada fila:

- el marcador `@deprecated` se quitó de la declaración pública que lo llevaba;
- la fila de clase `compat-frozen-sole-implementer` se borró del ledger
  `packages/core/contracts/package/deprecations/index.json`, junto con su entrada
  de aviso (`notice`) en el mapa de codemods `release-3-0` y sus recibos;
- la capacidad queda documentada aquí como **canónica para los motores que la
  implementan**.

Lo que D-A **no** decide:

- Ningún comportamiento congelado pasa a ser productivo. Modern sigue siendo el
  único motor productivo, y Classic y Rustic siguen congelados
  (`engine-freeze-gate`): este lote no editó ningún archivo bajo `engines/classic/`
  ni `engines/rustic/`.
- No se agrega ninguna mejora: lo que Modern hace hoy con cada nombre es lo que ya
  hacía, y la columna "Modern hoy" lo mide sin cambiarlo.
- No se declara ninguna equivalencia. La última columna es la grafía lógica o el
  reemplazo que la fila borrada documentaba; que exista no prueba que reproduzca
  el comportamiento congelado, y ninguna paridad renderizada se midió.
- El contador publicado de propiedad de los motores congelados
  (`frozen-transferred`) no se toca: se mantiene publicado y solo puede bajar.

## Las 24 capacidades

"Motores que la implementan" es la evidencia `frozen-implementer` que el gate
`deprecations` verificaba en vivo en cada corrida: el motor congelado lee el
nombre de la fila y no lee la grafía de la última columna. Esa verificación dio
verde en las 24 filas a `fabb9f0a6`.

"Modern hoy" cita el sitio de Modern que decide la lectura, leído en `47a0aac05`:
**lee** (usa el nombre tal cual), **reescribe** (lo normaliza a la grafía lógica),
**lee y pinta la propiedad física**, **descarta** (desestructura sin usar: no-op
silencioso) o **no lo lee**.

| Capacidad | Declaración | Motores que la implementan | Modern hoy | Grafía lógica / reemplazo documentado |
| --- | --- | --- | --- | --- |
| `BadgeBaseProps.closable` | `display/badge/contracts/index.ts` | Classic, Rustic | lee `removable ?? closable` (`display/badge/engines/modern/index.tsx:198`) | `removable` con `removeLabel` localizado |
| `CalendarProps.dateCellRender` | `display/calendar/contracts/index.ts` | Rustic | lee, solo si faltan `fullCellRender` y `cellRender` (`display/calendar/engines/modern/index.tsx:323-329`, `:556`); Classic lo descarta | `cellRender` |
| `CalendarProps.monthCellRender` | `display/calendar/contracts/index.ts` | Rustic | lee, solo si faltan `fullCellRender` y `cellRender` (`:323-329`, `:593`); Classic lo descarta | `cellRender` |
| `CardProps.backgroundColor` | `display/card/contracts/index.ts` | Rustic | **descarta: no-op silencioso** (`display/card/engines/modern/index.tsx:108`, `backgroundColor: _backgroundColor`); Classic también | chrome de card del tema, o `--ds-card-bg` acotado; sin equivalencia medida (ver nota 1) |
| `TablePaginationConfig.size` | `display/table/contracts/index.ts` | Classic (vía Ant) | **no lo lee**; Rustic tampoco | ninguno: el tamaño de paginación de Ant no tiene contraparte en el DS (ver nota 2) |
| `TooltipPlacement.'left'` | `display/tooltip/contracts/index.ts` | Classic, Rustic | reescribe a `'inline-start'` (`display/tooltip/engines/modern/index.tsx:379-381`) | `'inline-start'` |
| `TooltipPlacement.'left-start'` | `display/tooltip/contracts/index.ts` | Classic, Rustic | reescribe a `'inline-start-start'` (`:379-381`) | `'inline-start-start'` |
| `TooltipPlacement.'left-end'` | `display/tooltip/contracts/index.ts` | Classic, Rustic | reescribe a `'inline-start-end'` (`:379-381`) | `'inline-start-end'` |
| `TooltipPlacement.'right'` | `display/tooltip/contracts/index.ts` | Classic, Rustic | reescribe a `'inline-end'` (`:379-381`) | `'inline-end'` |
| `TooltipPlacement.'right-start'` | `display/tooltip/contracts/index.ts` | Classic, Rustic | reescribe a `'inline-end-start'` (`:379-381`) | `'inline-end-start'` |
| `TooltipPlacement.'right-end'` | `display/tooltip/contracts/index.ts` | Classic, Rustic | reescribe a `'inline-end-end'` (`:379-381`) | `'inline-end-end'` |
| `ModalProps.closeOnOverlayClick` | `feedback/modal/contracts/index.ts` | Classic | lee `closeOnBackdropClick ?? closeOnOverlayClick` (`feedback/modal/engines/modern/index.tsx:147`); Rustic igual (`:266`) | `closeOnBackdropClick` |
| `SliderProps.tooltip.placement.'left'` | `inputs/slider/contracts/index.ts` | Classic | reescribe a `'inline-start'` en slider vertical (`inputs/slider/engines/modern/index.tsx:296`); en horizontal cae en `'top'` (`:300`); Rustic no muestra tooltip | `'inline-start'` |
| `SliderProps.tooltip.placement.'right'` | `inputs/slider/contracts/index.ts` | Classic | reescribe a `'inline-end'` en slider vertical (`:297`); en horizontal cae en `'top'` (`:300`); Rustic no muestra tooltip | `'inline-end'` |
| `BoxProps.paddingRight` | `layout/box/contracts/index.ts` | Classic, Rustic | lee y pinta `padding-right` físico (`layout/box/engines/modern/index.tsx:81-83`) | `paddingInlineEnd` (`:104-107`) |
| `BoxProps.pr` | `layout/box/contracts/index.ts` | Classic, Rustic | lee y pinta `padding-right` físico (`:81-83`) | `pe` (`:104-107`) |
| `BoxProps.paddingLeft` | `layout/box/contracts/index.ts` | Classic, Rustic | lee y pinta `padding-left` físico (`:87-89`) | `paddingInlineStart` (`:99-102`) |
| `BoxProps.pl` | `layout/box/contracts/index.ts` | Classic, Rustic | lee y pinta `padding-left` físico (`:87-89`) | `ps` (`:99-102`) |
| `BoxProps.marginRight` | `layout/box/contracts/index.ts` | Classic, Rustic | lee y pinta `margin-right` físico (`:133-135`) | `marginInlineEnd` (`:156-159`) |
| `BoxProps.mr` | `layout/box/contracts/index.ts` | Classic, Rustic | lee y pinta `margin-right` físico (`:133-135`) | `me` (`:156-159`) |
| `BoxProps.marginLeft` | `layout/box/contracts/index.ts` | Classic, Rustic | lee y pinta `margin-left` físico (`:139-141`) | `marginInlineStart` (`:151-154`) |
| `BoxProps.ml` | `layout/box/contracts/index.ts` | Classic, Rustic | lee y pinta `margin-left` físico (`:139-141`) | `ms` (`:151-154`) |
| `HoverCardSide.'left'` | `overlay/hover-card/contracts/index.ts` | Classic | reescribe a `'inline-start'` (`overlay/hover-card/contracts/index.ts:91-103`, usado en `overlay/hover-card/engines/modern/index.tsx:189`) | `'inline-start'` |
| `HoverCardSide.'right'` | `overlay/hover-card/contracts/index.ts` | Classic | reescribe a `'inline-end'` (`:91-103`, usado en `engines/modern/index.tsx:189`) | `'inline-end'` |

Las rutas de la segunda columna y de las citas son relativas a
`packages/core/src/components/primitives/`; una cita que empieza por `:` repite
el archivo de la fila anterior de la misma capacidad.

Notas:

1. `CardProps.backgroundColor`: solo Rustic lo pinta, como término de estilo en
   línea antes de `style`. En Modern es un **no-op silencioso**: pasarlo no cambia
   nada. No se midió paridad renderizada entre la prop de Rustic y un
   `--ds-card-bg` acotado. Sigue en pie la advertencia que llevaba el marcador
   retirado: es una vía de escape de compatibilidad y **no debe usarse para
   tematizar a nivel de producto**; eso es trabajo del chrome de card del tema.
2. `TablePaginationConfig.size`: Classic entrega el objeto `pagination` entero a la
   tabla de Ant, que es la única que lee el miembro. Ni Modern ni Rustic lo leen:
   dimensionan el paginador a partir de la propia tabla. Es un miembro distinto de
   la prop `size` de `Table`. No se midieron llamadores.
3. `BoxProps` físico: en Modern la prop física pinta la propiedad CSS física y la
   lógica pinta la lógica, cada una por su lado; bajo RTL no son intercambiables.

## Consumidores vivos y recibos históricos

En la medición de la fila borrada, re-verificada por la revisión independiente del
lote (2026-10-08), app-bithire pasa `TooltipPlacement` físico al `Tooltip` del DS
en 4 sitios, todos sobre Modern, donde se reescribe a la grafía lógica:

- `placement="left"`: `src/ui/forms/create/page-shell/components/index.tsx:295`,
  y `src/ui/tables/collection/preview/index.tsx:447`, a través de su envoltorio
  `MaybeTooltip`;
- `placement="right"`: `src/vertical/surface/shell/role-switcher/index.tsx:271` y
  `:304`.

Este lote no editó ninguna app. Los 4 recibos de consumidor de esas filas salieron
del índice de recibos vigente; su registro histórico sigue versionado y sin tocar
en `packages/core/contracts/package/deprecations/receipts/audits/{2026-10-03,2026-10-03-b,2026-10-04-c}/`
y en `evidence/ret-01-closure/R3.{json,txt}`.

## Lo que queda pendiente

`Callout` (`display/callout/index.tsx`) **está dentro del alcance aprobado**: la
enmienda AM-1 v3 de WO-RET-06 (2026-10-06) lo agrega como fila 25 del grupo
congelado, en los pasos y en la lista cerrada de alcance, y D-A dispone "el grupo
congelado, 25 filas". No queda pendiente ninguna decisión de alcance del owner.

Se difiere a un lote complementario propio porque su entrada de aviso en el mapa
de codemods tiene compañeros fuera de las 17 rutas de este lote: es el ejemplo del
kit y figura en el registro de reportes permanentes ratificado el 2026-10-06. Hasta
ese lote, su marcador, su fila, su recibo y su entrada de aviso siguen como
estaban.
