# Admisión retrocompatible de documentos de tema almacenados (disposición D-C, 2026-10-07)

Estado: vigente desde el lote D-C de WO-RET-06 (2026-10-12). Autoridad final: la
disposición fechada D-C del paquete del owner de 2026-10-07 (`roadmap/retire.md`,
enmienda de WO-RET-06). Este lote no cierra WO-RET-06.

## Qué decide D-C

La admisión y la lectura retrocompatibles de los documentos de tema ya
almacenados **se conservan**. Para `BrandSurfaces.materials` y `BrandMotion`:

- se quitó el marcador `@deprecated`; la línea del campo `materials` y la
  interfaz `BrandMotion` no cambian, y tampoco tipos, esquema, lowering ni runtime;
- su fila salió del ledger `packages/core/contracts/package/deprecations/index.json`,
  con su aviso (`notice`) 4.0 en el mapa de codemods `release-3-0`. Ya no tienen
  fecha de retiro.

## Alcance

| Puerta | Qué se sigue admitiendo | Dónde se lee |
| --- | --- | --- |
| `BrandSurfaces.materials` | la grafía de esquema v1 de `surfaceRoles` (`SemanticSurfaceRoleMap`) | el lowering la lee cuando `surfaceRoles` está ausente: `src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/materials/index.ts` y `.../derivation/surfaces/index.ts` |
| `BrandMotion` | sus doce campos abiertos (`entrance`, `entranceDuration`, `hoverLift`, `hoverScale`, `useSpring`, `springTension`, `springFriction`, `pulseSpeed`, `skeletonStyle`, `staggerDelay`, `staggerMax`, `countUpEnabled`) junto a los cuatro gobernados (`intensity`, `durationScale`, `ambient`, `character`) | el esquema del documento de tema los admite (`src/foundation/contracts/composition/tenants/themes/iso/schema/index.ts`) y el lowering de personalidad los lee (`src/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality/index.ts`) |

`BrandMotion` sigue tipando `FlatTheme.motion`. Ninguno de los archivos de la
columna derecha cambió en este lote.

## Qué no dice D-C

- **La interfaz no se estrecha.** Ni `BrandMotion` ni `BrandSurfaces.materials`
  pierden campos ni literales.
- **No se midió ninguna base de datos.** Que los documentos almacenados de los
  tenants lleven o no estos campos no está medido. El retiro del editor de Brand
  Studio (WO-RET-06 W-4) no prueba nada sobre los datos almacenados.
- **La autoría nueva no se abre.** Lo que un tema nuevo puede autorar lo gobiernan
  el catálogo y los permisos, no esta admisión: los temas nuevos autoran
  `surfaceRoles`, y el movimiento se expresa con el `MotionProfile` del vertical
  y el `TenantMotionDial` acotado.

## Qué puede cambiarlo

Estrechar la interfaz o migrar los datos exige un censo o una migración
autorizados **fuera del DS** (paso 4(ii) de WO-RET-06, a cargo de owner/ops). El
DS no lo ejecuta ni lo da por hecho.
