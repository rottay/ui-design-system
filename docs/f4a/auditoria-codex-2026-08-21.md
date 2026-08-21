# Auditoría Codex ad hoc — 2026-08-21 (~6:42 AM, 6m 19s)

> **Procedencia:** auditoría ad hoc pedida por el dueño a Codex sobre HEAD
> `3af69a654` (post-F4A-6). Codex está FUERA del loop operativo (decisión 13);
> este informe entra como INSUMO. Verificado claim por claim por el DT (Kimi
> K3) — veredicto y correcciones en `docs/ROADMAP-EJECUCION-2026-08-19.md`
> §13 (asiento de la auditoría, commit `f91df8bc0`). Texto verbatim abajo.

---

Sí. Veredicto: la dirección general es correcta, pero hubo una desviación
semántica importante. No aprobaría continuar cerrando F4A sin corregirla.

## Lo que hicieron bien

- F4A-5 y F4A-6 siguen la arquitectura buscada: decisiones arriba, hojas
  derivadas mediante variables.
- --ds-color-text-page se convirtió en una raíz gobernada y 35 hojas dejaron
  de repetir valores.
- Preservaron cero delta visual y dejaron intactas coincidencias que no
  implicaban causalidad.
- Corrigieron la carrera destructiva de una prueba usando un árbol temporal.
- No reapareció brand-themes/foundation, no tocaron Classic/Rustic y no
  declararon que los themes ya sean premium.
- En el HEAD comprometido 3af69a654, los checks focales de constitución,
  mirror, variant, fanout, roots y theme-channel estaban verdes.

## Desviación bloqueante

La clasificación de "33 familias limpias" es incorrecta.

El roadmap afirma que hay 33 familias gobernadas por un único control y
autoriza etiquetar toda la familia con ese control (roadmap línea 1173, mapa
línea 23).

Recalculé el JSON crudo:

- Aparecen 33 solamente si se ignoran los canales con control: null.
- Las 33 tienen canales sin atribuir.
- Con criterio estricto —cero canales desconocidos, un único control y
  domicilio comprobado— el resultado es 0 familias limpias, no 33.
- Después se agregaron 32 tags amplios de familia basados en esa clasificación.

Ejemplos:

- rottay CHROME.modal: 15 canales; sólo 1 atribuido, 14 desconocidos.
- rottay CHROME.tabs: 38; sólo 1 atribuido.
- bithire CHROME.badge: 58; sólo 1 atribuido.
- evnto OVERLAY.palette: 118; sólo 3 atribuidos.

Eso no demuestra que los tags sean necesariamente falsos, pero sí que no
están probados. El gate actual valida sintaxis y cobertura, no que la
raíz/control declarado gobierne realmente todas las hojas.

## Otras desviaciones

1. La autoridad de estado está desactualizada.
   program.json (línea 8) declara roadmap/registry.json como autoridad, pero
   ese registry todavía dice 252 familias, Codex auditor/committer y
   Classic/Rustic read-only (registry línea 3491). El checkpoint continúa
   hablando de spacing.rhythm y roles antiguos (checkpoint línea 3).
   program-check está verde porque no comprueba esa coherencia temporal.
2. El roster quedó stale después de F4A-6.
   Sigue diciendo que --ds-color-text-page "aún no existe" y se materializará
   en F4A-6 (roster línea 1687), aunque ya aterrizó.
3. Los placeholders pueden hacer bajar divergentSlots sin materializar el
   mismo keypath real.
   El harness cuenta placeholders como posición (variant-parity línea 437),
   mientras la salida contractual exige paridad estructural real y cero
   shadowing (roadmap línea 270). Hace falta un gate final adicional sobre
   keypaths evaluados reales.

## Estado real

F4A no está cerrado:

- 1.694 slots divergentes.
- 2.712 hojas autoradas sin tag.
- 5.100 celdas del manifest siguen UNKNOWN.
- 0 familias aceptadas y 0 SIGHTED_ACCEPTED (manifest línea 34).

Durante esta auditoría empezó el lote K1 y el worktree pasó de limpio a 12
archivos modificados. Mecánicamente coincide con el próximo lote anunciado
—descongelar --ds-color-primary—, pero sigue en ejecución y todavía no tiene
auditoría ni cierre.

## Mi recomendación

Dejar que K1 llegue a SOURCE_READY, pero no aceptarlo ni integrarlo hasta:

1. Corregir la clasificación 33→0 comprobadas.
2. Retirar o estrechar los 32 tags amplios no demostrados.
3. Incorporar el mapa canal→raíz semántica→domicilio.
4. Actualizar roster, registry y checkpoint.
5. Añadir el gate de paridad real, separado de placeholders.

No revertiría F4A-5/F4A-6: el código productivo va en buena dirección. La
desviación está principalmente en la evidencia y en atribuciones demasiado
optimistas, pero debe corregirse antes de que contamine los siguientes lotes.

---

## Disposición del DT (2026-08-21)

| claim | veredicto | disposición |
|---|---|---|
| 33→0 estricto | **CONFIRMADO** (recomputado: 0 pasan; las 33 con nulos) | F4A-3c (A1/A2 del diseño) |
| tags amplios no probados | **CONFIRMADO** (27 tags mapeados, ratios 1/37…5/5) | F4A-3c A1: se estrechan |
| registry/checkpoint stale | **CONFIRMADO** | corregido en `f91df8bc0` |
| roster stale K3 | **CONFIRMADO** (menor: doc de plan) | corregido en `f91df8bc0` |
| placeholders sin keypath real | **CONFIRMADO** como brecha de diseño | gate de paridad real → F4A-close |
| estado 1694/2712/5100/0 | foto exacta, no desviación | los mueve el frente |
| K1 en vuelo sin auditoría | exacto; mecánica coincide con la cola | K1 cierra con batería completa |
| no revertir F4A-5/6 | de acuerdo | — |

Discrepancia menor con la letra del informe: K1 no se frena — su contenido no
depende de la clasificación cuestionada (32 recables con cero-delta probado +
REDERIVED firmado); integrarlo no importa la desviación. La corrección
(F4A-3c) va inmediatamente después, antes de F4A-7…15.
