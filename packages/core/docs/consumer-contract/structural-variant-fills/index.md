# Rellenos estructurales canónicos de `variant` (disposición D-B, 2026-10-07)

Estado: vigente desde el lote D-B de WO-RET-06 (2026-10-08). Autoridad final: la
disposición fechada D-B del paquete del owner de 2026-10-07 (`roadmap/retire.md`,
enmienda de WO-RET-06). Este lote no cierra WO-RET-06.

## Qué decide D-B

`variant` sigue siendo la expresión canónica de los rellenos estructurales
`secondary` y `gradient` **donde la evidencia los demuestra**. Para `BadgeVariant`,
`BadgeBaseProps.variant` (y `BadgeProps.variant`), `TagVariant`, `TagProps.variant`,
`AvatarVariant` y `AvatarProps.variant`:

- se quitó el marcador `@deprecated`; tipos, alias (`= Variant`), motores y
  runtime no cambian;
- su fila salió del ledger `packages/core/contracts/package/deprecations/index.json`,
  con sus recibos y su aviso (`notice`) 4.0 en el mapa de codemods `release-3-0`.

## Dos ejes

| Eje | Prop | Qué expresa |
| --- | --- | --- |
| Semántico | `tone` (`Tone`) | qué comunica el color: neutral, primary, success, warning, error, info |
| Estructural | `variant` | un relleno sin equivalente semántico: `secondary` y, en Avatar, `gradient` |

Precedencia sin cambios: cuando llegan ambas props, `tone` gana.

## Alcance medido

| Componente | Relleno | Evidencia |
| --- | --- | --- |
| Badge | `secondary` | skin Modern `skin/badge/index.css` (`[data-variant='secondary']`); fixture `prop-renamed/badge-variant-secondary`; `Badge.variant-tone-parity.test.tsx`: ningún `tone` renderiza lo que renderiza `variant="secondary"`, en los tres motores |
| Tag | `secondary` | skin Modern `skin/tag/index.css` (`[data-variant='secondary']`, con y sin `outlined`); fixture `prop-renamed/tag-variant-secondary`; `Tag.variant-tone-parity.test.tsx`, misma aserción |
| Avatar | `secondary`, `gradient` | skin Modern `skin/avatar/index.css` (`[data-variant='secondary']`, `[data-variant='gradient']`); `TONE_TO_VARIANT` no produce ninguno de los dos. Sin fixture de paridad: no se declara una |

Los dos fixtures de paridad y sus tests se conservan intactos: son la prueba de
que el reemplazo por `tone` falla, y por eso `variant` sigue siendo necesario.

Fuera del alcance: el tipo de Badge y Tag sigue aceptando `gradient`, pero ningún
skin Modern de Badge ni Tag lo pinta y ningún test lo mide. No se declara como
relleno demostrado.

## La unión compartida `Variant` (resolución del owner #3, 2026-10-08)

- **Owner canónico:** `packages/core/src/foundation/contracts/kernel/common/index.ts`
  (`export type Variant`), publicado en el subpath raíz `.`. Sus importadores de
  producción son exactamente los contratos de Badge, Tag y Avatar.
- **Condición de soporte:** `Variant` está soportado como el contrato de variante
  compartido de Badge, Tag y Avatar mientras `BadgeVariant`, `TagVariant` o
  `AvatarVariant` se construyan sobre él: compatibilidad pública necesaria, no
  transitoria. Sus siete literales y su significado no cambian; `Tone` sigue siendo
  el eje recomendado para el color semántico (guía, no deprecación).
- **Disposición:** se quitó su marcador `@deprecated` (la línea del tipo no cambia),
  su fila salió del ledger de deprecaciones con su aviso de codemod, y ya no tiene
  fecha de retiro. Los fixtures de paridad y sus tests no cambian.
- **Qué puede cambiarlo:** solo una decisión fechada del owner que apruebe un cambio
  de compatibilidad pública de `Variant` o de sus tres alias, con su propio debrief
  (consumidores medidos, migración y prueba de preservación de capacidad) y revisión
  independiente.
- **Límites:** sin cambio de valores ni de comportamiento, sin migración de apps,
  sin retiro de la dependencia. Esta resolución no cierra WO-RET-06.
