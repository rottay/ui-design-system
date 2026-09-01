# docs/f4a — insumos duraderos del frente F4A (canon estructural de los 3 themes)

Documentos de diseño y medición del frente F4A, copiados desde `/tmp` al repo
para que sobrevivan un reinicio y puedan auditarse. **La verdad resumida y
viva es `docs/history/programs/architecture-refactor/2026-08/execution/index.md` §13**; estos archivos son el
detalle detrás de cada asentamiento.

- `adjudicaciones-definicionales.md` — F4A-1 parte 1 (DT): las 5 definiciones
  que F4A-0 probó no-medibles (metadato = 36 enumeradas; denominador de
  pintura 3.690; asignación = posición autorada en fuente; 2 var() fantasma;
  asimétricas = 16; tier.page.fg = 42).
- `esquema-asignacion.md` — F4A-1 parte 2 (DT): la asignación vive en fuente
  como tags JSDoc `@domicile`/`@governor` de vocabulario cerrado; artefacto
  byte-idéntico; los 6 nudos K1–K5 + por-crear (K3 quedó re-adjudicado —
  ver §13 "K3-REVISADO" y la fila text-page del roster).
- `adjudicaciones-parte3.md` — F4A-1 parte 3 (DT): posture medido por tema,
  par border como raíz autora fuera del eje de tiers, citaciones ancladas.
- `roster-variantes.json` / `roster-variantes.md` — F4A-1c (worker Opus,
  verificado por el DT): el roster del esquema, 66 raíces × 3 temas = 198
  entradas, schemaVersion 3, BLOCKED 0. Entrada de trabajo de F4A-2…F4A-15.
- `mapa-familia-canales.json` / `mapa-familia-canales.md` — F4A-3a (worker
  Opus, read-only, verificado por el DT): el plano familia → canales →
  **control**, medido por sonda por hoja (3.726 compilaciones). 115 pares
  familia × tema: 33 limpias (640 hojas) / 29 mixtas entrelazadas (2.706) /
  53 sin control (380). Hallazgo: el plano canal → raíz-de-cascada NO existe
  en ningún artefacto (root-checklists atribuye a CONTROL; intersección con
  las 66 raíces del roster vacía). Insumo de F4A-3b.
- `leyes-fuentes-themes.md` — F4A-3b (verbatim del worker, re-domicilio del
  DT): las 28 leyes reales que cargaban los 45 docblocks narrativos borrados
  de las 3 fuentes por el canon de comentarios. Las referencias `tema:línea`
  son pre-edición. Es memoria, no mecanismo: si una ley cambia, cambia en su
  lote de reescritura (F4A-5…15).

Origen: `/tmp/f4a-1-*.md`, `/tmp/f4a-1c-roster-draft.*` (2026-08-20).

## medicion-f4a0/

Datos crudos de la medición F4A-0 (worker Opus, read-only, 2026-08-20):
`baseline.md` (el reporte), `walk.mjs` (el walker usado), censos por tema
(exclusive-*.txt), chrome-matrix.md, asignaciones-delta.json,
internal-head-sin-gobierno.json, literal-vs-derivado.json, tier-page-fg-43.txt.
Son el insumo medido de las adjudicaciones de F4A-1 y de las reescritas
F4A-5…15. Copiados desde `/tmp/f4a-0*` (2026-08-20).
