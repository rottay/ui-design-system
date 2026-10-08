# Capacidades canónicas de los motores congelados (disposición D-A, 2026-10-07)

Estado: vigente desde el lote de disposición de WO-RET-06 (2026-10-08). Autoridad
final: la disposición fechada D-A del paquete del owner de 2026-10-07
(`roadmap/retire.md`, enmienda de WO-RET-06), ruta (b) de la aceptación de R32 Q4.

## Qué decide D-A

Los motores congelados Classic y Rustic **conservan** los comportamientos de la
tabla de abajo mientras se publiquen. Para cada fila:

- el marcador `@deprecated` se quitó de la declaración pública que lo llevaba;
- la fila de clase `compat-frozen-sole-implementer` se borró del ledger
  `packages/core/contracts/package/deprecations/index.json`, junto con su aviso
  (`notice`) en el mapa de codemods `release-3-0` y sus recibos (para `Callout`
  se borró solo el aviso y su entrada sigue; ver abajo);
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

## Las 25 capacidades

"Motores que la implementan" es la evidencia `frozen-implementer` que el gate
`deprecations` verificaba en vivo en cada corrida: el motor congelado lee el
nombre de la fila y no lee la grafía de la última columna. Esa verificación dio
verde en las 24 primeras filas a `fabb9f0a6`. Para `Callout` la evidencia era que
cada motor congelado pinta la bandeja de acción (`{action && (`) sin importar
`Alert`; se releyó en `c3e6758bf` (`display/callout/engines/classic/index.tsx:114`,
`display/callout/engines/rustic/index.tsx:113`).

"Modern hoy" cita el sitio de Modern que decide la lectura, leído en `47a0aac05`:
**lee** (usa el nombre tal cual), **reescribe** (lo normaliza a la grafía lógica),
**lee y pinta la propiedad física**, **descarta** (desestructura sin usar: no-op
silencioso) o **no lo lee**. La fila de `Callout`, un componente y no una prop,
dice qué adaptador lo pinta en Modern; se leyó en `c3e6758bf`.

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
| `Callout` | `display/callout/index.tsx` | Classic, Rustic | no tiene motor Modern propio: `loadModernCallout` (`feedback/alert/index.tsx:26`) carga `feedback/alert/presentation/callout/index.tsx`, que pinta `AlertSurface` con `emphasis="subtle"` (`:49-63`); no lee `variant` (ver nota 4) | `<Alert tone message description action emphasis="subtle" announce="tone" />` en Modern; ninguno en Classic y Rustic |

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
4. `Callout`: el adaptador Modern mapea `tone` con `TONE_TO_VARIANT` (`info` si
   falta, `:46`), pasa `title`, el cuerpo como descripción, `icon`, `action`,
   `closable`, `onClose`, `className` y `style`, y anuncia `alert` en `warning` y
   `danger` y `status` en el resto (`:60`). Lo medido en Modern es el test
   `feedback/alert/tests/Alert.callout-parity.test.tsx`: marcado igual entre esa
   presentación y el `Alert` de Modern en 64 combinaciones de tono, título,
   cierre, acción e icono, y una diferencia fijada: un cambio de título reabre un
   `Alert` descartado donde el `Callout` sigue cerrado. Este lote no lo volvió a
   correr, y nada se midió en Classic ni Rustic, cuyos `Alert` no leen `action`,
   `emphasis` ni `announce`.

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

## `Callout`, la fila 25 (lote complementario, 2026-10-08)

`Callout` (`display/callout/index.tsx`) estaba dentro del alcance aprobado: la
enmienda AM-1 v3 de WO-RET-06 (2026-10-06) lo agrega como fila 25 del grupo
congelado, en los pasos y en la lista cerrada de alcance, y D-A dispone "el grupo
congelado, 25 filas". Se dispuso en su propio lote complementario, sin nueva
decisión de alcance del owner:

- su marcador `@deprecated` se quitó; el componente, `CalloutProps` y sus motores
  no cambian;
- su fila salió del ledger y su recibo de consumidor de app-evnto salió del índice
  de recibos vigente; el registro histórico de ese recibo sigue sin tocar en
  `packages/core/contracts/package/deprecations/receipts/audits/2026-10-04-c/`;
- la entrada `member-changed/.#Callout` del mapa `release-3-0` **sigue**: es
  anterior al ledger (`.changeset/ret-01-alert-type-callout-variant.md`) y tiene
  su propio sentido en 3.0, el aviso sobre el `Alert` de Modern y el reporte por
  archivo que lo importa. Solo perdió su `notice` de retiro en 4.0, y su `change`
  y su `guidance` ya no hablan de deprecación ni de retiro;
- el ejemplo del kit, el fixture `member-changed/callout`, las 4 filas del
  registro de reportes permanentes y su techo (25) siguen; solo cambió el `why`
  de esas 4 filas;
- la migración de `variant` a `tone` en app-evnto la sigue reportando aparte
  `prop-renamed/.#CalloutProps.variant`. Este lote no editó ninguna app.
