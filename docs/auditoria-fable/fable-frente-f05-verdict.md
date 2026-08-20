# Veredicto Fable — auditoría de cierre del frente F0.5

Auditor: Fable (independiente). Fecha: 2026-08-20. Repo:
`/Users/daniel/Developer/Rottay/ui-design-system` @ HEAD `be304e3f0` (árbol
limpio, verificado al inicio y sin ediciones mías). Insumos:
`/tmp/f05-frente-audit-brief.md` (borrador declarado), roadmap §13 completo
(líneas 342-696), y el ÁRBOL — todo lo afirmado abajo lo medí yo, incluida una
corrida propia de `gates:ci` y tres corridas de la suite con Node 22.

## Veredicto global: **APROBADO — EL FRENTE F0.5 PUEDE CERRARSE**

0 hallazgos bloqueantes. Las seis verificaciones pedidas salen afirmativas
contra el árbol, con evidencia de primera mano. Quedan 6 hallazgos menores y
2 informativos, ninguno de los cuales compromete lo sellado; la mayoría son
material natural de F1/Paso C y dos son sobreafirmaciones puntuales de la
prosa del §13 que conviene corregir para que el registro no prometa más de lo
que el árbol cumple.

---

## Lo verificado, punto por punto (los 6 del pedido)

### 1. `scripts/` cumple §1.2/§2.9 — SÍ, verificado contra disco

- Raíz de `scripts/`: exactamente las 15 familias de §2.9 + los 2 archivos
  toolchain (`vitest.scripts.config.ts`, `tests-typecheck-ambient.d.ts`).
  `find -maxdepth 1 -type f` = solo esos 2. Cero producción suelta.
- Nivel familia: cero archivos sueltos salvo 2 `README.md` (`codemods/`,
  `quality-evidence/` — ambos árboles fuera de alcance por regla).
- Cero capabilities sin `index.mjs`/`index.test.mjs` (barrido completo).
- `lib/` con sus 10 subfamilias exactas de §2.9 (incl. las nuevas
  `verticals/` y `source/` de A13, ya escritas en la ley).
- Sidecars: 19 archivos no llevan el basename del dueño — son EXACTAMENTE los
  19 `R3-foreign-file` del baseline del gate (tests-ley con nombre histórico +
  artefactos nombrados de G2), cotejados uno a uno. Live set == baseline,
  además probado por el propio test del gate («live findings match the
  baseline exactly, entry by entry»).
- Enmiendas de ley aterrizadas: §1.2 ahora dice `<capability>/index.test.mjs`
  (A16), basename completo de baselines con Paso C documentado (A17), y la
  cláusula de declaraciones ambiente que ampara el `.d.ts` (A11); §2.9 tiene
  la excepción toolchain escrita en el árbol y las 2 subfamilias nuevas.

### 2. `scripts-tree-gate` (Paso D) — dientes REALES pero con dos límites

Lo bueno, verificado en fuente (`structure/scripts-tree-gate/index.mjs`):
- Decrease-only BIDIRECCIONAL: un finding nuevo falla (`NEW …`) y una entrada
  de baseline sin finding vivo también falla (`STALE …`) — evaluate():149-164.
- No existe `--write` (absorber = adjudicar, index.mjs:39-41); toda entrada
  exige `reason` no vacía (se valida en runtime :173-178 y en test :31-39).
- Baseline: 25 entradas (6 R5 + 19 R3), todas con razón sustantiva y con
  destino (Paso C/F1). Cotejadas contra el árbol: exactas.
- Cableado BLOQUEANTE doble en el manifiesto: `scripts-tree` y
  `scripts-tree-drill` (ci-gates.manifest/index.mjs:39-40); ambos verdes en
  MI corrida.
- Spec §1.11 ↔ implementación: coinciden (roster declarado, cero sueltos,
  basename del dueño, segmentos genéricos prohibidos, «materialized in F0.5
  Paso D»).

Los dos límites (hallazgos H1 y H2 abajo): R5 solo caza repetición por
PREFIJO a nivel familia, y los drills inyectan findings sintéticos en el
array en vez de plantar archivos reales.

### 3. Cadena de sellos digest-pineados — FRESCA y coherente, medida por mí

- Computé yo el sha256 del report en HEAD:
  `bc4ccd65d2da2146bf0ebaf94d665bd22a671629d5caeb5b70eacc0c6508e026` — coincide
  byte-exacto con `basedOnReportDigest` en `customization-reconciliation.json`
  Y en `KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json`.
- Cada eslabón tiene gate BLOQUEANTE que RECOMPUTA (no confía en el pin):
  fuentes→report (`customization-surface-freshness`), report→reconciliation
  (`tokens-catalog`, index.mjs:1183-1186, con drill `recon-digest`),
  report→KIMI (`kimi-preservation`, index.mjs:69,166), controls
  (`controls-catalog`, drift de digest con drill de stale), y `gat-07` último.
  Los cinco PASS en mi corrida de gates:ci.
- Constantes transitorias del lote E re-apuntadas en H: gat-07:58-59,
  literal-ownership:37, relocate:51 apuntan las tres al baseline nuevo en
  `engine/engine-token-audit/` — el baseline de 6 lectores quedó coherente.
- Eslabones que PUEDEN pudrirse: enumerados en H4/H5; los ya declarados
  (trío de manifest/generated → F2, evidencia browser cra-15 → F1, receipts
  test-artifacts → F7) están además VISIBLES: los tests del trío stale están
  rojos en la suite y contados dentro de las 24 adjudicadas — no es
  podredumbre silenciosa.

### 4. `gates:ci` — CORRIDO POR MÍ: 80 blocking VERDES

Node v22.17.0, HEAD, worker en pausa:
`ci-gates OK — 80 blocking gate(s) passed`, exit 0, con los 2 excluded
visibles con razón y dueño (`channel-liveness` y `lane-control-drills`, ambos
F2 cascade front). El delta 78→80 del brief son los 2 gates nuevos del Paso D.
Detalle cosmético: ambos excluded imprimen `since=unrecorded`.

### 5. Manifest graduado (`packages/core/manifest/`) — refleja el censo final

- 255 archivos en `families/` y 255 familias en `index.json` (20 controles ×
  255 = las 5100 celdas del canon); `generatedBy` apunta al path nuevo
  (`packages/core/manifest/generator.mjs`); 0 referencias al path viejo dentro
  de `index.json`.
- Residuo del path viejo en código: **0 fuera de `phase-a/`** (grep repo-wide
  sobre .mjs/.ts/.tsx/.json/.yml). Los referenciantes re-apuntados incluyen
  los que yo mismo destapé en la auditoría del mapeo: resolution-probe ×3 y
  lane-control (import :49, `CI_MANIFEST_PATH` :88, synthetic-rows :66-67,:99)
  — todos al path anidado nuevo, verificados hoy.
- `program-check`: exit 0 = CONSTITUTION_READY, y corre como gate bloqueante
  (`modern-rescue-program-contract`) — verde en mi corrida, igual que
  `modern-rescue-customization-manifest-freshness`.
- `family-inventory.json` NO migró (correcto: quedó en el programa; el lector
  de showroom `monochrome-roster.unit.test.mjs:256` sigue resolviendo).

### 6. Adjudicaciones del frente — las cuatro son defendibles

- **phase-a no reescrito**: defendible y verificado — cero consumidores vivos
  de `phase-a` fuera de sí mismo (grep sobre `scripts/`, `manifest/`, `src/`,
  `package.json`); es un ledger sellado; reescribir 1082 citas churnaría
  sellos sin cambiar conducta.
- **3 artefactos stale a F2**: defendible — no están cableados a CI (rot
  declarado) pero sus tests SÍ corren en la suite (`manifest/**` entró al
  glob) y están rojos Y contados en las 24: visibles, no silenciosos. La regen
  pertenece al dueño del cascade (F2).
- **Paso C a F1**: defendible, con la salvedad H1 — «el baseline del gate ya
  lo exige» solo es cierto para las 6 repeticiones por prefijo a nivel
  familia; el resto del alcance de A1 (infijos + subfamilias de lib) no está
  trinqueteado por nada mecánico.
- **cra-12 diferido con análisis**: defendible — el análisis es técnicamente
  correcto (el gate digiere el árbol entero por diseño; una copia parcial
  ahoga la señal; el fix honesto toca artefactos sellados). Observación: en
  mis DOS corridas completas la suite dio 24 fallas con conjunto idéntico —
  la «víctima intermitente» se manifestó las dos veces; hoy se comporta como
  estable. No cambia la adjudicación; cambia la etiqueta.

**Suite (medida por mí, 3 corridas):** 1631 tests / 1606 pass / **24 fail** /
1 skip; y el conjunto de las 24 es **IDÉNTICO línea a línea** al adjudicado
(`diff` vacío contra el baseline del coordinador). Nada nuevo rojo, nada
arreglado en silencio. Piernas 2 y 3: effect-registry-audit raíz 9/9, vitest
4/4.

**Excepciones — exactamente las adjudicadas, medidas por git:**
- `quality-evidence/` en todo el rango del Paso B (7346f6028..HEAD),
  excluyendo la mudanza del manifest: SOLO 5 archivos —
  `v2/inventory-correspondence.mjs` (2 líneas = C8, lote I), la edición
  autorizada del lote G (import del censo, declarada en el commit), los 3
  contratos de G2 (`program.json`, `rounds.json`, `agent-orchestration.json`,
  autorización expresa en el commit) y `program-check.*`/`program.json` de la
  graduación. Cero ediciones no atribuibles.
- Corpus hasheado `src/foundation/tokens/css/**` (fuera de
  `facade/artifacts/`): **cero diff** en el rango.
- `lint-folder-index`: sus 2 sitios a mano (index.mjs:30,195) resuelven a la
  profundidad nueva correcta (`../../../src`); ver H6 por la anotación.
- Hermanos (lote J): los 3 `package.json` (bithire:46, evnto:16, platform:58)
  ya apuntan a `structure/audit-vertical-compliance/index.mjs` — editados sin
  commitear, como se adjudicó.

---

## Hallazgos

### H1 — MENOR: el trinquete de Paso C cubre 6 casos; el resto del alcance de A1 no lo vigila nada

R5 del `scripts-tree-gate` solo detecta `child.startsWith(family + '-'|'.')`
a nivel familia (index.mjs:112-114) y no se aplica dentro de las subfamilias
de `lib/` (:115-132 no llama al chequeo). Escapan hoy, vivos y sin baseline:
`lib/build/build-input-hash`, `lib/engine/engine-corpus`,
`lib/engine/engine-token-governance` (prefijo de subfamilia — el patrón
exacto del ejemplo de §1.2:81-83), y los infijos del inventario A1
(`ci/run-ci-gates`, `packaging/cra-17-packaging-license-gate`,
`verticals/build-vertical-css`, `verticals/vertical-css-staleness.gate`).
**Corrección:** extender R5 al nivel subfamilia y decidir política de infijo
(o adjudicar en baseline), o publicar la worklist de Paso C como lista
cerrada en el roadmap para que el alcance no viva solo en la memoria del
mapeo.

### H2 — MENOR: los drills del gate prueban el REPORTE, no la DETECCIÓN

Los 6 drills inyectan findings sintéticos en el array después de la colección
(index.mjs:139-144); ninguno planta un archivo real. La detección en disco
solo está probada indirectamente para R3/R5 (los 25 positivos vivos del
baseline). **R1, R2, R4 y R6 tienen cero positivos vivos y cero pruebas de
plantado real**: un bug en la colección (un filtro de readdir mal puesto) las
dejaría ciegas sin que nada se entere. El estándar del propio frente es más
alto (lote 0 plantó huérfanos reales; platform-identity-zero probó «dos
planos»). **Corrección:** drill de sandbox — copiar un esqueleto sintético a
tmpdir, plantar una violación real por regla, correr `collectFindings` contra
ese root (la función ya acepta `scriptsRoot` como parámetro: el test puede
hacerlo sin tocar el gate).

### H3 — MENOR: el claim «raíz del paquete sin artefactos sueltos» está sobreafirmado

`packages/core/KIMI-VISUAL-WORKLIST.json` sigue suelto en la raíz: tracked,
**0 referencias en package.json**, lector único
`scripts/tokens/kimi-worklist-gate/` — exactamente la clase que G2 movió
(dato de gate en raíz de paquete), sin adjudicación escrita en §13 ni en el
commit de G2 (verifiqué el stat de `d0a1e8453`: movió 3 y este no está).
Además `test-results.json` (salida de vitest) está trackeado en la raíz —
wart preexistente. **Corrección:** relocación estilo G2 en F1 (el gate ya usa
paths relativos arreglables) o razón escrita (p.ej. si las terminales Kimi lo
leen por path estable); y gitignore para `test-results.json`.

### H4 — MENOR: punteros vivos con el path plano viejo (instrucciones, no prosa)

Ninguno rompe ejecución, pero son instrucciones que un agente seguiría a un
404, y la regla del lote B («puntero vivo en fuente publicada = instrucción de
ejecución → se actualiza») les aplica:
- `packages/core/manifest/controls/spacing.rhythm.json:122,127` — campos
  `evidence` citan `packages/core/scripts/spacing-rhythm-contract-gate.mjs`
  (hoy `scripts/tokens/spacing-rhythm-contract-gate/index.mjs`). Está en el
  árbol GRADUADO, no en phase-a.
- `roadmap/registry.json` (~10 campos `measure`, líneas 16-79) — «node
  scripts/engine-token-audit.mjs (…)» plano.
- `quality-evidence/programs/modern-rescue/probe/leg2-chromium.mjs:14` — cita
  el cra-15 plano (jurisdicción intocable; anotar para su próximo lote
  autorizado).

### H5 — MENOR: la única pata de la cadena sin fail-closed es la cross-repo

`tokens-catalog/index.mjs:1280` y `:1348` hacen `if (!existsSync(dir))
continue;` sobre los directorios de vistas en `../docs-engineering`: en una
máquina/CI sin el repo hermano en el estado correcto, esa parte de la
verificación pasa VACÍA. La cadena de digests interna al repo está sana
(guías individuales sí fallan cerrado, :1266), pero las 341 vistas pueden
divergir sin grito en entornos sin hermano. Preexistente, no creado por
F0.5; anotarlo como deuda con dueño (la misma familia de F7/receipts).

### H6 — MENOR: la excepción de `lint-folder-index` no está anotada en el archivo

Los 2 sitios a mano (index.mjs:29-30,195) no llevan ningún comentario que
declare la invariante de portabilidad single-file (el self-test lo copia solo
a un tmpdir pelado). La excepción vive solo en §13 y el brief del lote C: un
barrido futuro «migrar todo al helper repo-root» la arreglaría de buena fe y
rompería el self-test. Dos líneas de comentario la blindan.

### H7 — INFO: dos claims del brief ya están mejor que lo escrito

(a) La deuda «styles/platform.css — commit de cierre» ya está CERRADA en HEAD
(`dd3496343`): el archivo no existe, el roster styles/ es
`{index,modern,rottay,bithire,evnto}` y el alias en el `dependency-honesty`
de raíz ya no aparece (grep vacío). (b) El brief pide verificar «78 blocking
+ 2 excluded»; el estado real y mi corrida dan 80 + 2 (los 2 del Paso D). El
brief se declaraba borrador; que el cierre archive los números finales.

### H8 — INFO: el doble hueco de `manifest/` es consistente y está declarado

`wiring-coverage` quedó recursivo con guarda anti-vacío real (index.mjs:73-93
y :119 «A vacuous pass is not a pass») — pero camina solo `scripts/`
(:82), y el `scripts-tree-gate` tampoco cubre `packages/core/manifest/`
(SCRIPTS_ROOT fijo). Los 9 `.mjs` planos de ese árbol quedan sin ley de
estructura Y sin censo de wiring, tal como el §13 lo anota para F1/Paso C.
Sin sorpresa; lo consigno para que F1 los cierre juntos.

---

## Respuestas a las 4 preguntas del brief

1. **¿Violaciones de §1.2/§2.9 que los gates no vean?** Sí, tres clases,
   todas menores: las repeticiones de nombre fuera del alcance prefijo-familia
   de R5 (H1, con 3 casos vivos en lib), el árbol `manifest/` sin ley (H8,
   declarado), y `KIMI-VISUAL-WORKLIST.json` en la raíz del paquete (H3 —
   §1.2:88-89 lo quiere dentro de la carpeta del gate). La spec §1.11
   coincide con lo implementado.
2. **¿Duplicados semánticos entre familias?** No encontré ninguno. Los pares
   de mismo nombre (`cra-11-adaptive-contract-census` en evidence+lib,
   `surface-capability-census` en generators+lib, contador/censo de
   runtime-svg en lib+engine) son el split sancionado «lib es el metro, el
   script es el CLI» — un dueño por métrica, consumidores verificados.
   `wiring-coverage` vs `workflow-script-wiring` son direcciones
   complementarias (todo script cableado / toda cita existe), no duplicado.
3. **¿Eslabón que pueda quedar stale sin grito?** Dentro del repo, no: cada
   eslabón de la cadena recomputa en gate bloqueante y lo verifiqué corriendo
   los gates y el sha256 a mano. Fuera del repo, dos: las vistas de
   docs-engineering (H5, `continue` silencioso) y los punteros de evidencia
   con path viejo (H4, se pudren como documentación aunque no como código).
   Los declarados (trío F2, cra-15 F1, receipts F7) están o visibles en rojo
   o registrados con dueño.
4. **¿El manifest graduado refleja el censo final?** Sí: 255/255 familias,
   index.json regenerado con generatedBy nuevo, 0 residuos de path viejo en
   código fuera de phase-a, freshness y program-contract bloqueantes y verdes
   en mi corrida, CONSTITUTION_READY por ejecución. Única mancha: los campos
   `evidence` de `controls/spacing.rhythm.json` (H4).

## Lo que NO revisé (boundary)

- No corrí `pnpm build` completo, E2E de showroom, ni el `test:unit` de src
  (fuera del alcance del frente; gates:ci incluye sus propios drills).
- El residuo por basename lo verifiqué por MUESTREO dirigido (10 paths viejos
  + un barrido de patrón `scripts/<x>.mjs` repo-wide con exclusiones
  declaradas), no los 225 nombres uno a uno.
- No audité `docs/MAPA-DEL-REPO.md` ni la totalidad de las citas F9 en docs;
  tampoco `codemods/` ni el interior de `quality-evidence/` más allá de sus
  ediciones (medidas por git) y sus imports salientes.
- De los repos hermanos solo verifiqué la línea `lint:vertical` de los 3
  `package.json`; sus árboles no.
- No verifiqué la deuda declarada del `dependency-honesty` de raíz (unresolved
  edge en `recipes/profiles/index.ts:76`) ni la evidencia browser de cra-15 —
  ambas ya registradas con dueño en §13.
- Las corridas de suite fueron 3 (una completa con resumen, dos de captura);
  no medí flakiness más allá de la reproducibilidad 24/24 en dos corridas
  completas independientes.

## Condición de cierre

Ninguna bloqueante. Recomiendo que el commit de cierre del frente (o F1
temprano) recoja: H3 (adjudicar o mover KIMI-VISUAL-WORKLIST), H4 (los 2
campos de spacing.rhythm.json, que están en el árbol graduado y son 2
strings), y H6 (el comentario de 2 líneas). H1/H2 son el primer lote natural
de F1 junto con Paso C. Con eso, lo que el §13 declara y lo que el árbol
cumple quedan idénticos.
