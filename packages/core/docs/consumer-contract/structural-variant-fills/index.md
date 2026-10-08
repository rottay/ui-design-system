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

## Lo que D-B no decide

El `Variant` genérico del kernel sigue deprecado, con su fila en el ledger y su
condición "leaves last" de la enmienda AM-1 v3: los seis alias canónicos siguen
construidos sobre esa unión compartida. Su disposición terminal (y qué la recibe
cuando su blocker se resuelva) queda abierta, pendiente del owner.
