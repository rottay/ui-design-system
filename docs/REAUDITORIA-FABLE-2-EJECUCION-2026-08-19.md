# Re-auditoría Fable 2 — ejecución — 2026-08-19

Segunda ronda. La primera ([`REAUDITORIA-FABLE-2026-08-19.md`](REAUDITORIA-FABLE-2026-08-19.md))
auditó el diagnóstico; esta audita **la ejecución antes de que ocurra**: el
[`ROADMAP-EJECUCION-2026-08-19.md`](ROADMAP-EJECUCION-2026-08-19.md) contra el
árbol real, con la ley de [`ARCHITECTURE.md`](ARCHITECTURE.md) y la evidencia de
zona de [`DEPURACION-SCRIPTS-Y-DATOS-2026-08-19.md`](DEPURACION-SCRIPTS-Y-DATOS-2026-08-19.md)
y [`CONFORMIDAD-SRC-2026-08-19.md`](CONFORMIDAD-SRC-2026-08-19.md).

---

## 0. Método, alcance y límites

**Qué se auditó.** El disco de hoy en HEAD `763417966`, worktree limpio antes y
después de la auditoría (`git status --porcelain` → vacío en ambos extremos).
Ninguna cifra del plan se dio por válida: todas fueron re-medidas con comandos
propios (`grep`, `find`, `git grep`, `git ls-files`, `node -e` de solo lectura,
parsers propios en `/tmp`).

**Organización.** Cinco asientos de verificación en paralelo, uno por frente de
ataque (F0.5, F0, F1–F4, F5–F6, regla de release/F8), más re-verificación
central de los hallazgos de mayor peso (la dependencia Callout→Alert, los pins
de versión de las tres apps, el symlink de evnto, el artefacto de gat-07, el
estado de `.changeset/`).

**Rol.** Read-only. No se modificó, movió ni borró ningún archivo; el único
creado es este. Excepción única y declarada: se ejecutó
`node scripts/gat-07-exact-proof.mjs --check-artifact` bajo Node 22 — modo que
no escribe (`writeAtomic` solo corre bajo `--write`; worktree verificado limpio
después) — porque el veredicto exigía evidencia empírica, no inferida.

**Apps externas.** Los tres repos hermanos se leyeron en su estado local de hoy:
`app-platform` (pin `2.19.35`), `app-bithire` (pin `2.19.37`), `app-evnto`
(pin `2.19.29`, pero ver §6.1 — consume la fuente local por symlink).

---

## 1. Veredicto ejecutivo

El plan es ejecutable en su columna vertebral y la mayoría de sus cifras se
reproducen. Pero la ejecución tal como está escrita choca con **cuatro hechos
del terreno que ningún documento del plan registra** y arrastra **un error de
hecho, dos borrados que no son de riesgo cero y un ancla de ratchet inestable
por construcción**:

| # | Hallazgo | Gravedad |
|---|---|---|
| 1 | **`gat-07-exact-proof` está ROJO en HEAD hoy** (verificado ejecutando su `--check-artifact`): el artefacto sellado 2026-07-18 lista 123 archivos de maquinaria; el walk actual encuentra 626, más 5 fantasmas. El criterio de F0 «`gates:ci` verde» parte de un piso rojo, y **cada borrado de F0 vuelve a mover el artefacto** — el resello es una tarea propia sin dueño en el plan | Bloqueante |
| 2 | **El registry va por delante de main: existe 2.19.37 publicado** desde el commit colgante `a037d3a3c` (fuera de toda rama), y app-bithire ya lo clava e instala. La premisa del plan («sigue publicado en 2.19.35») es incompleta; un changeset patch/minor desde 2.19.36 colisiona | Bloqueante |
| 3 | **app-evnto consume la fuente local viva** por symlink manual en `node_modules` (ignora su pin 2.19.29). El punto de coordinación de §1 —el publish— no lo protege: cualquier retiro de F5/F6 en fuente rompe evnto sin publish de por medio. No figura en ningún documento | Bloqueante |
| 4 | **La migración de los 53 archivos `/commercial` de app-platform no tiene dueño en ningún roadmap.** F8 la condiciona a «cuando la capacidad esté reclasificada», pero la reclasificación **ya ocurrió** (2026-08-12) con destino incompleto: `ProductWindow` se fue al showroom (inalcanzable para apps) y ~14 tokens `--ds-commercial-*` fueron renombrados — fallo **silencioso** de CSS que un codemod de especificador no cubre | Bloqueante |
| 5 | Dos de los «borrados de riesgo cero» de F0 no lo son: `channel-wiring-zero-delta-gate.mjs` es **exigido por ley de programa** (lane-control lo declara verificación obligatoria de todo WO de modern-rescue) y `cra-17-integral-gate.mjs` es el **instrumento de aceptación nombrado de WO-CRA-17**, que sigue en `todo` | Bloqueante |
| 6 | El ancla de ratchet de F2 (**1.958**) es **inestable por construcción**: el conteo anidado mete 297 nombres que son destino de fallback (las propias raíces) en el bucket de deuda, así que recablear *bien* puede no bajar —o subir— el contador; además subcuenta ~97 mixtos que tampoco alcanzan raíz | Bloqueante para el ratchet |
| 7 | **Dependencia inversa F2 ← F4**: 22 raíces tienen asignaciones asimétricas entre temas (9 con un tema en cero, p.ej. `tier.overlay.bg` con evnto 0). Recablear la skin hacia esas raíces antes de armonizar los espejos cambia pintura por tema | Alta |
| 8 | El helper `repo-root` de F0.5 Fase 0 es **irresoluble como está especificado**: la raíz del repo y `packages/core` comparten `name: "@rottay/design-system"`, los consumidores necesitan dos semánticas distintas, 11 de los 146 archivos no pueden importarlo sin cruce de paquetes, y los **536 imports relativos entre scripts** —el grueso del coste de Fase 1— quedan fuera de su alcance | Alta |
| 9 | Error de hecho del roadmap (verificado dos veces): «`Alert/contracts` ya importa de Callout» es **falso** — son 2 docstrings (`contracts/index.ts:100,109`); el pre-paso «deshacer la dependencia» no existe | Media (inofensivo, pero es la clase de error que la ronda 1 ya había corregido) |
| 10 | Las apps consumen **3 de los 4 chrome retirados** (TableToolbar en 3 archivos de producción de app-platform; FieldFiltersPanel y SavedViewsMenu en el workbench que sirve tenants/users/permissions; ColumnSettings re-exportado en bithire y evnto) y F8 no lista codemod para ninguno | Alta |
| 11 | F6 subdeclara su coste: retirar 75 subpaths exige **re-anclar `pack-inventory.baseline.json` completo** (~6.381 paths de dist, no la línea `:13770`) y pasa por 4 gates no nombrados; y extirpar platform rompe a su **consumidor real no contado**: `app-platform/src/app/globals.css:14` importa `dist/platform.css` | Alta |

Contadores del plan corregidos por medición: `Space` son **36** archivos, no
34; GAT-07 sella **123** paths de scripts, no 128; los referenciantes del
manifest son **38** hoy (20 externos + 18 internos), no 44 = 21+23 (el plan
mezcló dos censos distintos); la raíz objetivo de §2.1 son **16** entradas, no
14; los headers de procedencia de iconos son **293** (el «~290» es correcto).

---

## 2. F0.5 — Reorganización física (lo más riesgoso)

### 2.1 El coste declarado

**«~600-700 referencias ejecutables; 145 archivos resuelven rutas relativas»
— PARCIAL.** El 145 es exacto a ±1: **146 archivos** con `import.meta.url` +
`..` (203 líneas de resolución; desglose: 120 en core-scripts planos, 11 en el
programa, 7 en scripts de raíz, 4 en showroom, 4 en lib). Pero la suma de
clases ejecutables da **~970**, no 600-700, porque el plan no cuenta:

| Clase no contada | Medición |
|---|---|
| Imports relativos ENTRE scripts | **536 en 145 archivos** (330 `./` + 186 `../` solo en core; 225 a hermanos del mismo directorio plano, 66 a `./lib/`) |
| Literales de ruta a scripts dentro de scripts (spawn/manifiestos) | 121 |
| `package.json#scripts` | 104 refs |
| `ci.yml` | 6 líneas — incluida la regex de changed-files de `ci.yml:55`, que nombra `scripts/dependency-honesty.mjs` y `scripts/effect-registry-audit.mjs` por ruta plana: tras agrupar el `scripts/` de raíz **no falla, deja de disparar los jobs en silencio**. Ningún gate la vigila |
| JSON trackeados con rutas de script | 1.343 refs en 60 JSON (mayoría evidencia sellada intocable o regenerable) |
| Headers de procedencia de iconos | 293 |

### 2.2 La Fase 0 (helper `repo-root`) tiene dos defectos de diseño verificados

**PARCIAL.** No existe nada equivalente hoy (`find . -path '*lib/repo-root*'` →
vacío; los `repoRoot` actuales son variables locales hand-rolled). Pero tal
como está especificado:

1. **El predicado findUp es ambiguo**: el `package.json` de la raíz del repo y
   el de `packages/core` tienen **ambos** `name: "@rottay/design-system"`
   (verificado leyendo los dos). Un findUp por ese name devuelve raíces
   distintas según desde dónde se llame — y los consumidores necesitan **las
   dos semánticas** (`run-ci-gates.mjs:25` quiere package root;
   `engine-token-audit.mjs:1610-1611` quiere repo root para
   `test-artifacts/gates`). Hacen falta dos funciones con predicado no ambiguo
   (p.ej. `pnpm-workspace.yaml` para repo root).
2. **El helper es inaccesible para 11 de los 146 archivos** (7 de `scripts/`
   raíz + 4 del showroom) sin imports relativos cruzados entre paquetes —
   exactamente la fragilidad que se quiere eliminar. ARCHITECTURE §2.9 lo ubica
   bajo `packages/core/scripts/lib/`; el árbol §2.1 del `scripts/` de raíz no
   lo incluye. Riesgo real de terminar con dos helpers.

Y el claim «destraba todo» es falso en su alcance: el helper cubre las 146
resoluciones de raíz, pero **no cubre los 536 imports relativos entre
scripts**, que se rompen igual al repartir hermanos planos en carpetas de
familia. El grueso del coste de Fase 1 está fuera del alcance de Fase 0.

### 2.3 Fases 1 y 2

- **Precondición «commitear el trabajo en vuelo» — YA SATISFECHA.**
  `git status --porcelain` → 0 líneas; el trabajo se commiteó en `3f1eaad94`
  (34 archivos, 20 bajo `manifest/` — el plan decía 39-40).
- **«Fase 1 no rompe los drills de lane-control» — CONFIRMADO.** Las
  aserciones son por basename o glob recursivo:
  `drills/intersection/index.mjs:164-170` (basename `endsWith('-gate.mjs')`) y
  `drills/work-order/index.mjs:351-354` sobreviven Fase 1;
  `public/work-order/index.mjs:60,305` (`REQUIRED_VERIFICATION =
  'channel-wiring-zero-delta-gate.mjs'`, validado con `.includes()`) sobrevive
  Fase 1 y **se rompe en Fase 2**, como el plan prevé («arreglar los drills»).
- **GAT-07: «128 paths» — PARCIAL.** El seal
  (`test-artifacts/gates/gat-07/semantic-evidence.json`) tiene 3.456 paths
  sellados con SHA-256, de los cuales **123** son `packages/core/scripts/*`
  (pudo ser 128 en la fecha de medición). Sí exige corpus docs-engineering
  (`gat-07-exact-proof.mjs:50` + `ci.yml:157-159` checkoutea
  `rottay/docs-engineering`). **Dato que cambia el orden:** el inputManifest
  sella también `ci.yml`, los dos `package.json` y 3.269 rutas de src —
  **cualquier movida de Fase 1 ya invalida el sello**. El re-sellado es
  por-lote, no exclusivo de Fase 2 como el plan lo agenda.
- **Headers de iconos: «~290» — CONFIRMADO (293).** 293 archivos generados
  citan `// Generated by scripts/generate-semantic-icons.mjs. Do not edit.`
  Regenerarlos toca 293 archivos de src → fuerza otro re-sello de GAT-07.

### 2.4 La graduación del manifest

- **«44 archivos referenciantes (21 externos, 23 internos)» — PARCIAL: hoy son
  38, y el plan mezcló dos censos.** `git grep -l "modern-rescue/manifest"` →
  **38** = 15 internos (bajo `manifest/`) + 3 internos-programa + **20
  externos**. Los «23 internos» solo cierran sumando referencias por join
  relativo sin el literal (`program-check.mjs` tiene **9** usos de
  `join(PROGRAM_DIR,'manifest/…')` invisibles al grep). El «27 fuera del
  programa» de DEPURACION §5 es otro censo (referencias a `programs/
  modern-rescue`, el programa entero). Ninguna de las tres cifras es la de las
  otras dos; el lote debe partir del censo literal + los joins de
  program-check, no de 44.
- **Cirugía de `..` (generator 7→3, fanout/checklist/parity 5→1) —
  CONFIRMADO**, con un coste extra: los cuatro viven dentro de `manifest/` y se
  mueven con él, pero `generator.mjs:14-15` importa además
  `../../../../customization-surface-census.mjs` (script plano que Fase 1 muda)
  y `../../../v2/contracts.mjs` — dos imports que **acoplan la graduación con
  la Fase 1**: cualquier orden funciona, pero el lote que corra segundo debe
  repuntear lo del primero, y hoy ninguno lo declara.
- **«Regeneración de index.json + generated/* + checkpoint» — PARCIAL.**
  `manifest/index.json` y `manifest/generated/` (3 JSON, 22 MB) existen y sí
  contienen rutas viejas (root-checklists.json 19 ocurrencias) — la
  regeneración es obligatoria, como dice el plan. Pero además **4 JSON
  autorados de `families/`** (flex, grid, space, stack) llevan la ruta vieja en
  celdas autoradas — edición a mano, no regeneración. Y
  **`checkpoint.intent.json` no tiene productor** (lo lee `program-check.mjs`;
  ningún script lo genera) y vive en la raíz del programa, fuera de
  `manifest/` — «regenerar el checkpoint» no es ejecutable tal como está
  escrito.
- **«git grep "modern-rescue/manifest" → 0» — INALCANZABLE como está
  escrito.** Quedan 3 advisory sellados bajo `test-artifacts/…/advisory/` y 5
  docs de auditoría históricos en `docs/` que la regla del monorepo prohíbe
  reescribir. El criterio necesita scope (`:!docs :!**/test-artifacts/**`) — y
  aun así es **insuficiente**, porque las 9 referencias de `program-check.mjs`
  son joins invisibles al grep literal.
- **«Los 4 tests que quedan fuera del glob `scripts/**`» — CONFIRMADO
  exacto**: fanout-facts, generator, mirror-parity, root-checklist
  (`.test.mjs` bajo `manifest/`). `generator.test.mjs` está además cableado por
  ruta explícita en `ci-gates.manifest.mjs:69` y `run-ci-gates.test.mjs:209` —
  dos repunteos más.
- **cascade-*: CONFIRMADO** — viven en la raíz del programa (se quedan; hay que
  repuntear su escritura), ninguno tiene `--check`, y `cascade-backlog.mjs`
  está roto tal como dice DEPURACION §5 (`readFileSync` de
  `/private/tmp/_backlog_real.txt` inexistente, sin guard).
- **Discrepancia de alcance no adjudicada:** DEPURACION §5 gradúa la
  «constitución» completa (incluye `program-check.mjs`,
  `customization-model.json`, `family-inventory.json`, que viven **fuera** de
  `manifest/`); el roadmap solo mueve `manifest/`. Con el roadmap,
  program-check queda en el programa apuntando a `packages/core/manifest/` —
  legal, pero es una decisión distinta de la anotada y nadie la escribió.

### 2.5 Raíces y showroom

- **«Repo root queda en 14 entradas» — REFUTADO: son 16.** El árbol §2.1 de
  ARCHITECTURE lista 7 directorios + 9 archivos = 16. Hoy hay 25 trackeadas de
  primer nivel; quitando lo que el plan retira quedan 16. Ningún conteo natural
  da 14 (y `.npmignore` — que F0 conserva — ni siquiera figura en el árbol
  §2.1: inconsistencia adicional).
- **`.claude/settings.local.json` — CONFIRMADO y agravado.** Está trackeado y
  contiene un GitHub PAT real (`ghp_`, 40 chars, línea 91, entrada
  `Bash(export GITHUB_TOKEN=…)`). Como ya está en la **historia** de git,
  destrackear no basta: **la rotación es obligatoria incondicional**, no un
  «antes» opcional.
- **JSON publicados a `contracts/` — cierto pero con coste cross-repo no
  anotado**: `packages/core/contracts/` no existe (a crear); los 4 JSON están
  en `files[]` **y en `exports`** (`./hooks-manifest`,
  `./public-entrypoints-manifest`) — la movida remapea exports/files y cambia
  los bytes de `consumer/ds-supplier-honesty.mjs`, que se distribuye a las apps
  **byte-exact**. Además 8 scripts/gates los leen por ruta actual.
- **Huérfanos sin lote:** `CANARY-MANIFEST.json` y
  `LITERAL-OWNERSHIP-MATRIX.json` (0 referencias) están adjudicados en
  DEPURACION §6 pero no aparecen en F0/F0.5 ni en el árbol destino §2.2.
- **Showroom — la advertencia de Vercel puede estar invertida.**
  `vercel-ignore-build.sh` existe pero **nada en el repo lo referencia**, y
  `packages/showroom/vercel.json:3` define `ignoreCommand` inline — que tiene
  precedencia sobre el setting del dashboard. Si vercel.json manda, el `.sh` es
  letra muerta y la precaución del plan protege un artefacto inerte. Verificar
  en el dashboard antes de presupuestar ese cuidado.

### 2.6 Orden de fases — respuesta directa

El orden helper → movidas → rename → graduación **no tiene ninguna dependencia
al revés**, con tres correcciones: (1) la graduación y la Fase 1 están
**acopladas** por los 2 imports del generator (§2.4); (2) el re-sello de GAT-07
es **por-lote** desde la Fase 1, no un paso de Fase 2; (3) los baselines
decrease-only **no** se disparan con movidas de scripts (verificado:
`core-structure-audit` mide solo `packages/core/src`; los paint counters miden
engines de src) — la red para scripts es fail-loud (`workflow-script-wiring`,
blocking) más `gates:ci`.

---

## 3. F0 — Borrados «de riesgo cero»

### 3.1 Los dos gates sin invocador — PARCIAL: sin invocador es cierto; riesgo cero es FALSO para ambos

- **0 invocadores automáticos — CONFIRMADO** (grep sobre package.json,
  manifiesto y ci.yml → exit 1). Sus tests son los únicos importadores y
  **corren hoy en CI** (glob recursivo `scripts/**/*.test.mjs`) → gate y test
  caen en el mismo lote, como el plan ya recoge.
- **`channel-wiring-zero-delta-gate.mjs` tiene un consumidor por nombre en
  código de producción**: `src/tooling/lane-control/public/work-order/
  index.mjs:60` exporta `REQUIRED_VERIFICATION =
  'channel-wiring-zero-delta-gate.mjs'` y en `:305-308` **rechaza todo work
  order de modern-rescue que no lo invoque** («§2 makes … mandatory for every
  lane»). También lo citan el drill (`:116`), `wo-example.json:51` y
  `lane-control/README.md:93`. Borrarlo sin enmendar la ley §2 + esos 4
  archivos deja la maquinaria de WOs exigiendo un script inexistente.
- **`cra-17-integral-gate.mjs` es el instrumento de aceptación nombrado de
  WO-CRA-17**, que sigue en `todo` (`roadmap/craft.md:509-524`: «the final
  gate»; también `icon-supplier-decision-2026-07-17.md:93`). Y su path está
  inventariado con sha256 en la evidencia trackeada de gat-07. Borrarlo exige
  enmienda escrita del owner al contrato del WO, no es riesgo cero.
- **La «cobertura permanente» citada existe pero es de otra ley.**
  `tenant-channel-consumer-gate` y `theme-channel-parity-gate` están blocking
  exactamente en `ci-gates.manifest.mjs:248-250` (cita del plan exacta), pero
  miden liveness y el grafo declarado→emitido→leído — **no** la identidad
  byte-a-byte contra baseline pre-oleada que mide zero-delta. Lo correcto del
  plan es que esa propiedad es transitoria por construcción; lo impreciso es
  llamar «cobertura» a gates que miden otra cosa. Los dos sub-gates de cra-17
  sí corren en prepack (CONFIRMADO: `cra17:licenses` y `cra17:declarations`,
  core `package.json:638-639`), y el pin Phosphor 2.1.10 lo exigen otros dos
  vivos.

### 3.2 El resto de los borrados

| Ítem | Veredicto | Evidencia |
|---|---|---|
| 17 codemods de febrero (raíz `scripts/`) | **CONFIRMADO** | 16 `.mjs` + `helper-gaps-report.json`; fechas git 2026-02-08/17; 0 referencias ejecutables (solo docs de auditoría); su target `src/composition/` ya no existe |
| 13 iconos legacy | **CONFIRMADO, con 2 correcciones** | 15 carpetas; `icons/index.ts:31-34` reexporta solo Alert/Loader; los 13 son estructuralmente inalcanzables (el único import del path legacy es el propio barrel — recortarlo en el mismo commit). Correcciones: el «consumidor» Tag/rustic es **docstring JSDoc** (`:26,:56`), no import; los consumidores reales de `AlertIcon` son app-platform `readiness.tsx:5` y el **showroom** (`probe/ds-reference/sections/r2-behavior/index.tsx:98`); **`LoaderIcon` tiene 0 consumidores y podría caer ya**, no esperar a F8 |
| Monolito `probe/cascade-probe.mjs` + test | **CONFIRMADO** | 0 importadores; su test solo importa el monolito + builtins; los otros 5 módulos de `probe/` están vivos (los importa el probe raíz `:75-84` y su test `:26`) |
| Alias duplicados (borrar 14, quedan 3) | **CONFIRMADO con 3 matices** | 17 duplicados byte-idénticos reproducidos mecánicamente; los 3 invocadores propios confirmados (`verify:core`, `prebuild`, `ci.yml:187`); los 14 sin invocador ejecutable en repo + apps + monorepo. Matices: `tokens:catalog:check` citado en **3 docs activos de docs-engineering**; `gate:styles-css` en `quality-rubric/README.md:94`; `quality-evidence:v2:drills` registrado como entregable en el recibo R0 trackeado — actualizar docs en la misma sesión (regla CLAUDE.md) y anotar el R0 en el changeset |
| `.claude/agents/` (2) | **CONFIRMADO** | Trackeados; solo los citan docs de auditoría y ARCHITECTURE `:1059` (como retiro) |
| `audit-presets.mjs` + `audit-report.json` | **CONFIRMADO** | 0 ejecutables los referencian; su target ya no existe |
| Carpetas vacías «23+12» | **PARCIAL** | 23 bajo src exacto; el 35 repo-wide solo cierra **sin excluir** `coverage*/` (con exclusión estándar son 31; 4 de los 12 son `.tmp` dentro de coverage). Y una de las 8 restantes tiene **propósito declarado en contrato vivo**: `modern-rescue/KIMI-ANNOTATIONS/inbox` es el root del inbox del creative advisor (`tenant-art-direction.json:363`) — no barrer a ciegas o documentar su recreación |

### 3.3 Los ítems no-borrado de F0, estado hoy

Changeset: **pendiente** (0 en `.changeset/`). Comentario obsoleto del
manifiesto (`:42-55`): **sigue**. Byte NUL en
`daisy-class-consumer-counter.mjs`: **sigue (offset 19071) y es FUNCIONAL** —
es el separador de clave compuesta dentro de un template literal
(`${fromFile}<NUL>${specifier}`); el fix es convertirlo al escape `\0`, nunca
eliminarlo (eliminar cambiaría las claves del grafo). `seal-round` sin alias:
**confirmado**. `.npmignore`: existe, 11 líneas de patrones, **sin comentario
propio** — el comentario a corregir vive en `pack-inventory-gate.mjs:4,61`.
`gates:ci`: 68 entradas, las 68 blocking, fail-fast.

### 3.4 El hallazgo mayor de F0: el piso ya está rojo

`node scripts/gat-07-exact-proof.mjs --check-artifact` (Node 22, modo
no-escritor) → **EXIT 1**: «authoritative artifact is stale/missing». Causa
medida: el artefacto sellado 2026-07-18 lista 123 archivos de maquinaria; el
walk actual encuentra **626** trackeados (worktree limpio — CI vería lo mismo)
más **5 fantasmas** que ya no existen (`build-commercial-css.mjs`, 3 tests
`ck-e-*`, un allowlist). Es determinístico. Consecuencias:

1. El criterio de F0 «`gates:ci` verde» **parte de un piso rojo** —
   `gat-07-exact-proof` es blocking en el manifiesto y corre además como
   `gat07:check` en `ci.yml:187`. F0 necesita un resello (`gat07:write` +
   commit) como tarea propia, que hoy no tiene.
2. El inventario cubre también `audit-input` = todo `src/**` (3.117 entradas):
   **cada borrado de F0** bajo scripts o src (los 2 gates + tests, el monolito
   + test, los 13 iconos) **vuelve a mover el artefacto** — el resello se
   secuencia después de los borrados o se repite. Quitar los 14 alias también
   lo mueve (package.json entra por `gate-wiring`).

---

## 4. F1–F4 — La cascada

### 4.1 F1

- **Los 2 enums vacíos — CONFIRMADO exacto**, con un hallazgo que cambia el
  carácter del trabajo: **el vocabulario de esos 2 enums YA EXISTE** en
  `manifest/cascade/roots/*.json` campo `variants` (`chrome.anatomy` 14
  variantes, `profiles.expressive` 34), validado con diente por program-check
  §6c (gate blocking). En total 17 de 20 controles tienen variantes nombradas a
  nivel cascade/roots. **F1 es un lift de esa autoridad a `controls/`, no
  autoría nueva** — el plan no lo dice, y el riesgo es reinventar vocabulario
  divergente del ya validado.
- **`targetBinding → internalChannels` — CONFIRMADO en cifras (1.462/5.100; 0
  lectores de targetBinding), REFUTADO como «migración».** Partición exacta de
  las 5.100 celdas: ambos 0 / solo-internalChannels 1.462 / solo-targetBinding
  con contenido **444** / **ninguno 3.194**. El material fuente para migrar
  existe en 444 celdas; llegar a 5.100 es **autoría nueva del 62,6 %**. Y
  «borrar el campo» toca 4.267 celdas, no 1.462.
- **Exposición 26/27/10 — CONFIRMADO exacto**, y peor que lo que el plan
  registra: **nada lee `root-catalog.json` en absoluto** — ni siquiera un gate
  de frescura (todo lo demás del manifiesto sí tiene `--check`). Antes de que
  un gate lea `exposure`, nada garantiza que el catálogo de 63 siga al repo.
- **«program-check exige enum no vacío + celda gobernada» — PARCIAL: casi todo
  es trabajo nuevo.** Hoy no hay validación de `enumValues` en ningún lado; la
  «celda gobernada» existe a medias en `rules.mjs:633` (required at
  IMPLEMENTED+), aplicada vía generator, no vía program-check.

### 4.2 F2

- **12 raíces por-crear (46/12/5) — CONFIRMADO exacto**, con un matiz: las 12
  tienen `channel: null` — no tienen ni nombre; «materializar» incluye
  bautizarlas. Materializarlas es **inerte para la pintura** (nadie puede leer
  un nombre que no existe; verificado que los candidatos citados tienen 0
  lectores en la skin, y la única variable ya leída —`--ds-wash-band`— ya está
  declarada).
- **La baseline de 1.958 — PARCIAL: se reproduce a ±3, pero como ancla de
  ratchet es defectuosa por tres vías.** Re-medición independiente con parser
  propio (paréntesis balanceados, multilínea): 3.651–3.656 nombres, partición
  705 solo-pelado / 1.443 solo-encadenado / 1.253 solo-literal / ~250 mixto;
  1.958 = 705 + 1.253 con los mixtos **excluidos**. Defectos:
  1. La frase «1.958 nombres nunca alcanzan una raíz» es inexacta: **97
     mixtos** sin ninguna ocurrencia encadenada tampoco alcanzan raíz y quedan
     fuera (la cifra fiel sería ~2.055); los ~153 mixtos restantes no tienen
     tratamiento definido.
  2. **El grave:** el conteo anidado mete los nombres de las propias raíces
     (leídas como fallback) en el bucket de deuda — de los 2.054 nombres sin
     cadena, **297 son a la vez destino de fallback de otros** (22 son canales
     literales del root-catalog: `--ds-color-primary`, `--ds-elevation-1`…).
     Recablear `var(--ds-x, LITERAL)` → `var(--ds-x, var(--ds-raíz))` resta 1
     pero puede **sumar 1** si la raíz entra como ocurrencia pelada nueva.
     Haciendo el trabajo bien, el contador puede no bajar o subir. El ancla es
     inestable salvo que se excluyan raíces/rampas del denominador o se cuente
     solo top-level — el plan no fija ninguna de las dos.
  3. «Encadenado» no adjudica fallbacks funcionales:
     `var(--ds-x, color-mix(… var(--ds-raíz) …))` cuenta como literal con la
     definición «empieza con `var(`»; la definición «contiene `var(--ds`»
     mueve ~230-250 nombres de bucket. ARCHITECTURE §1.6 no decide este caso.
- **El contador del ratchet NO existe hoy** — es obra nueva. Ningún script
  clasifica pelado/literal/encadenado por nombre (`skins.unwired` cuenta
  @imports; `scale.fallbackParityViolations` es ciega a fallbacks con
  paréntesis). Ancla natural: clave nueva en `engine-token-audit.baseline.json`
  (mecanismo decrease-only ya establecido, con `engine-audit:relocate-paths`
  para movidas).
- **fanout-facts / mirror-parity — CONFIRMADO en los cuatro incisos** (no
  están en el manifiesto; sus tests sí corren por el glob; ambos escriben sin
  `--check` y con `--check` solo miden frescura). Flag seguro para enchufar:
  `--check` en ambos.
- **¿F2 rompe visual e2e sin red? La red EXISTE y corre en CI** — job `visual`
  en `ci.yml:387+` (Playwright contra build de producción, 462 PNG trackeados,
  condicionado a cambios en `packages/core/` que F2 toca). Pero hay un
  **conflicto de doctrina no registrado**: `channel-wiring-zero-delta-gate.mjs`
  —el drill específico de recableado— exige que el fallback sea **la expresión
  original (el literal)**, byte-idéntico contra baseline pre-oleada; F2 exige
  lo contrario (fallback = `var(raíz)`, «el literal NO cuenta como cableado»).
  F0 borra ese gate, lo cual **resuelve el conflicto de facto**, pero ningún
  documento adjudica el choque de leyes por escrito.

### 4.3 F3

- **226 ocurrencias / 41 engines — CONFIRMADO exacto.** Desglose medido: **17
  dinámicas** (resolvers de eje) en 5 archivos (Button 6, Select 4, Input 3,
  Badge 2, Avatar 2) y **209 estáticas** migrables. La separación es
  **mecánicamente estable** — con la regex correcta: la interpolación va en
  medio del nombre (`var(--ds-button-${v}-padding-y)`), así que `var\(--ds-\$\{`
  da 0; sirve `var\(--ds-[a-z0-9-]*\$\{`. El ratchet puede anclarse solo en (a).
- **Pin de chart-series — CONFIRMADO con precisión y una dependencia mal
  ubicada.** El pin es doble y vive en
  `chart-series-reserved-name-gate.test.mjs`: `allowlistedHits === 2` +
  allowlist congelada en 3 rutas (brand-theme, appearance, oklch/chart-series).
  «Volver a 1» = cuando `appearance/` se absorba en el lowering único — **eso
  es trabajo de F5, no de F3** donde el plan lo coloca.

### 4.4 F4

- **263 asignaciones — CONFIRMADO** (`Σ assignments.total` = 263).
  **19,3 % — CONFIRMADO exacto** (1.237 / 1.282 / 430 canales; unión 1.908,
  intersección 369 → 19,34 %). **3.275 colapsables — CONFIRMADO.**
- **Pero el esquema de «asignación de variante» no existe**: el catálogo
  registra conteos por tema y modos (base/light/dark), **sin valores ni nombres
  de variante**; y para 37 de 63 raíces (27 internal-head + 10 gap) ningún
  control aporta variantes. F4 tiene que diseñar el esquema, no solo ejecutarlo.
- **Gates que el lote de F4 debe satisfacer (el plan no los enumera):**
  `vertical-css-source-staleness` (GAT-02, blocking — es de frescura, compatible
  con regenerar y commitear juntos); `first-party-artifacts-source-staleness`;
  los **cuatro** checks blocking de `customization-surface-census`
  (`ci-gates.manifest.mjs:206-209`, miden `facade/artifacts/*/index.css` —
  `dead-writers` puede disparar si el colapso deja escritores muertos);
  **`theme-channel-parity --check`** — decrease-only sobre
  declared-but-unemitted: un colapso que haga que un campo declarado deje de
  emitir directo lo pone rojo — **este es el ratchet real que un colapso masivo
  puede disparar**; y la regeneración de `generated/mirror-parity.json` +
  `fanout-facts.json` en el mismo lote si F2 los enchufó con `--check`. Los
  paint counters de engine-token-audit **no** se disparan (sus walks excluyen
  `facade/artifacts/`). Los 462 PNG ven cualquier colapso no valor-idéntico.

### 4.5 El orden vocabulario → raíces → skins → temas — PARCIAL

F3←F2 se sostiene; F4 depende menos de F1 de lo temido (las variantes ya
existen en cascade/roots para 17/20 controles). Pero hay **una dependencia
inversa real F2 ← F4**: **22 raíces «existe» tienen asignaciones asimétricas
entre temas y 9 tienen un tema en cero** (ejemplo del catálogo:
`tier.overlay.bg` → `--ds-surface-overlay`, rottay 2 / bithire 2 / **evnto
0**; también `tier.overlay.{fg,border}`, `tier.raised.fg`,
`control.ratio.*`). Si F2 recablea un fallback literal hacia una de esas
raíces, el tema en cero pasa a resolver el valor base de `default.css` en vez
del literal afinado — **cambio visual en ese tema antes de que F4 armonice los
espejos**. Para esas 22 raíces el orden es: asignar el valor del tema (trabajo
F4) **antes** de recablear los lectores, o recablear cero-delta — que el
ratchet de F2 no acepta como cableado. El plan no secuencia raíz por raíz.

---

## 5. F5–F6 — Retiros de componentes y subpaths

### 5.1 Los 4 pares de chrome — el «riesgo interno bajo» se sostiene; el lado apps NO

Dentro del DS, los 4 retirados tienen 0 consumidores de producción
(re-verificado import por import). Fuera:

| Retirado | Apps (imports reales) | Showroom (imports reales) |
|---|---|---|
| `table-toolbar` (TableToolbar) | **app-platform 3 archivos de producción con JSX** (`services/notifications/…/inbox/index.tsx:14,223`, `services/payments/…/list/index.tsx:13,130`, `…/refunds/list/index.tsx:13,256`) | ~6 archivos (registry, navigation, fixtures, snippet map, probe r4, torture workspace-chrome) |
| `saved-views-menu` (SavedViewsMenu) | **app-platform `ui/tables/entity-table-workspace/index.tsx:30,567`** — y ese workbench lo consumen tenant-list, users, permissions, consent-workspace-config, auth-layout: el corazón admin | registry, navigation, fixtures, probe r4, torture |
| `field-filters-panel` (FieldFiltersPanel) | app-platform `entity-table-workspace/index.tsx:23,978` (misma cadena) | ídem + sección torture DEDICADA + spec e2e con **8 PNG** |
| `column-settings` (patterns) | re-exports muertos pero compilables: `app-bithire/src/ui/tables/index.ts:134`, `app-evnto/src/ui/tables/column-settings/` + barril — **rompen typecheck** al retirar; codemod de 1 línea por app que ningún frente lista | registry, navigation, fixtures, probe r2 |

Dos agravantes: (1) **`SavedViewsMenu` → `PatternSavedViewsBar` es cambio de
anatomía** (dropdown → barra), no rename — la misma clase de riesgo que
`Typography.Link → TextLink`, que §0.1.4 sí trata en dos fases; (2) F8 no lista
codemod para ninguno de los tres con JSX real.

### 5.2 record-workbench → DetailSurface — CONFIRMADO sin gap de capacidades

Los 3 consumidores son las pantallas de compliance de app-platform
(`aml-alert-workbench`, `kyc-case-workbench`, `dsar-workbench`). Leídas las
tres: usan tabs con badge, status, sidebar, breadcrumbs, tab controlado — todo
cubierto por el contrato de DetailSurface (`DetailSurfaceTab.badge`, chrome,
behavior); **no usan** related-records ni history. El delta real es de forma
(props directos → funciones `(item) =>`, `metadata` → `sidebar()`), o sea la
«migración de modelo» que el plan ya presupuesta — **CONFIRMADO**. El
`adapter: EntityAdapter` obligatorio está en
`pages/data/detail/index.tsx:59` (el plan citaba el archivo de contratos:
imprecisión menor). El import directo de rol de icono (`index.tsx:32`) —
confirmado. Lo no contado: el lado showroom/e2e de record-workbench (registry,
navigation, `surfaces-preview-workspace.tsx`, caso r6, spec long-tail con 4
PNG, skin propio, fila de familia del manifest).

### 5.3 appearance/ — el orden cubre a los consumidores TS; no cubre los anclajes

Los 2 consumidores de producción confirmados (`composition/tenant-theme/
index.ts:69` importa `withExpressiveFieldDefaults`;
`branding-preview-sandbox/index.tsx:52,87` importa `appearanceToVariables`) y
no hay más (grep exhaustivo de path + los 6 símbolos exportados). Pero
«carpeta fuera» sin re-anclar deja rojos o midiendo vacío a **5 anclajes de
scripts/tooling** (`audit-integration.mjs:84-86` — cableado como
`lint:integration`, extrae texto de ese archivo por indexOf;
`chart-series-reserved-name-gate.mjs:83` lo lee como «the emitter»;
`lib/ds-hook-manifest.mjs:809`; `v2/drills.test.mjs:1199`;
`lane-control/runtime/tenant-reach/index.mjs:33,366-367` — enumera 89
plantillas desde sus funciones) **más 5 tests cross-unit** (divergence-matrix,
locale-orthogonality, density-authority ×1, tenant-theme ×2).

### 5.4 Las convergencias

| Convergencia | Veredicto | Evidencia |
|---|---|---|
| `mono-stat` → contador canónico | **CONFIRMADO ejecutable** | `useSmoothCounter` (`motion/react/runtime/smooth-counter/index.ts:40`) y `CountUp` existen; mono-stat sigue con rAF a mano (`index.tsx:54-79`) |
| `terminal-block` → sustrato Typewriter | **PARCIAL** | Typewriter exporta **solo el componente** — no hay hook/kernel consumible. La convergencia exige **extraer el sustrato primero**; el plan no lo dice |
| `grid-view`/`gallery-view` item-identity | **CONFIRMADO** | Dos copias de 29 líneas; el diff es solo nombres |
| `command-center` borra interfaces+mappers | **CONFIRMADO con matiz** | Los mappers existen (`:124,:139`). Pero `StatItem`/`ActivityItem` son **API exportada y props de 3 pantallas de app-platform** (governance-overview, privacy-hub, feature-flags/overview) — borrarlas cambia el shape aguas arriba: otro codemod que F8 no lista |
| `PatternEmptyState` → `Empty` | **CONFIRMADO como pendiente** | Hoy anatomías independientes (classic importa el Empty de antd, no el primitive) |
| `calendar-view`/`timeline` componen | **CONFIRMADO como pendiente** | Cero imports hoy; el roadmap ya lo declara ley objetivo — honesto |
| **`Callout → Alert`: «deshacer primero la dependencia de contrato»** | **REFUTADO — error de hecho del roadmap** | `grep -rn "Callout" …/Alert/` → exactamente 2 hits, **ambos docstrings** (`contracts/index.ts:100,109`); los imports reales de Alert/contracts son foundation/contracts, kernel/common y react. No hay dependencia que deshacer; la absorción es limpia — tal como la ronda 1 ya había determinado (§7.2). El roadmap re-introdujo el falso positivo que la ronda 1 desactivó |

### 5.5 El paso showroom — la maquinaria existe; el checklist del plan es incompleto

Registry (7 archivos) y navigation tienen fila/entrada para **todos** los
retirados consultados — CONFIRMADO. Pero:

- El roster test genérico **solo existe para primitives**
  (`primitive-category-roster.unit.test.mjs`: 6 categorías × 9 mapas +
  anti-drift + registry↔navigation). Para patterns/structures/surfaces solo
  hay rosters específicos (compositions, monochrome, r6-probe, torture-scenes).
  **Un retiro de structure/pattern no tiene red genérica registry↔nav.**
- Capturas: ~9 PNG a borrar (8 de field-filters + 1 de saved-views-menu-panel)
  y ~8 a regenerar (4 de workspace-chrome-batch, 4 de surfaces-long-tail) más
  sus specs — el plan dice «capturas» sin dimensionarlo.
- **Lo que el checklist no lista**: fixtures compartidos con imports
  compilables (`structure-preview-fixtures.tsx`, `pattern-preview-fixtures.tsx`,
  `surfaces-preview-workspace.tsx`), secciones probe ds-reference (r2/r4/r6),
  secciones torture + su registry test, arrays de prosa en ~10 páginas,
  `vertical-category-appendix.tsx:43`. A favor: la búsqueda Cmd+K se deriva de
  navigation (no es paso aparte) y no existe sitemap.
- **Lo que ningún frente lista del lado core**: cada retirado tiene **skin CSS
  propio** (5 archivos) y **fila de familia en el manifest de modern-rescue**
  (`manifest/families/...json`) — la ley del CLAUDE.md exige retiro atómico en
  inventario/manifests/proyecciones/gates/evidencia; F5 no menciona ese paso.
  Más `StructuresTier.stories.tsx` y el contract test
  `WorkspaceChromeBatch.contract.test.tsx`.

### 5.6 F6 — subpaths y platform

- **77 subpaths — CONFIRMADO exacto** (121 claves de exports; 77 granulares;
  el manifest público tiene 77 entries; `entrypoints/public` tiene 77 index).
  **Los 2 importadores showroom — CONFIRMADO y más fuerte**: ambos desde un
  único archivo (`showroom-tenant/index.tsx`). Cero granulares en apps,
  re-confirmado.
- **Gates de frontera que F6 no nombra:** `pack-inventory.baseline.json`
  inventaría **~6.381 paths de dist** incluido el árbol por-componente de cada
  subpath — retirar 75 exige **re-anclar el baseline completo**, no la línea
  `:13770`; `core-structure-audit.mjs:380` lee el manifest público (la
  identidad decrease-only se mueve al borrar 75 carpetas de
  `entrypoints/public`); `v2/inventory-correspondence.mjs:197` deriva
  declaredSubpaths de exports; `cra-14-public-barrel-gate.mjs:23` (impactado
  por la lista explícita del barril); `analyze-bundle.mjs:1087`. Sin impacto
  (verificado): hook-contract, cra-17, supplier-contract, canary fixtures. El
  propio `public-entrypoints.manifest.json` es artefacto a reescribir
  explícitamente. Nota: existe `scripts/migrate-public-entrypoints.mjs` —
  codemod de subpaths ya escrito cuya dirección es la inversa (hacia los
  granulares) y que DEPURACION §1.7 retira; su maquinaria puede servir de base,
  pero no está en el plan de F6.
- **«Extirpar platform completo» — la lista del plan es corta.** Referencias
  trackeadas hoy que F6 no nombra: `src/foundation/tokens/
  residual-adjudication.json:52,76` (dato vivo en src);
  `docs/reference/tokens/README.md:14,86` (doc vivo que instruye el @import);
  `docs/premium-styling-track/` (7 líneas que declaran `./styles/platform`
  como export estable); `styles/index.css:4` (recomienda styles/platform);
  `gat-07/semantic-evidence.json` (re-anclable). Y el **consumidor real no
  contado: app-platform** — `src/app/globals.css:14` importa
  `@rottay/design-system/dist/platform.css` y `next.config.ts:54,57,59` lo
  aliasa (hasta `./styles/rottay` apunta hoy a dist/platform.css). Extirpar
  sin migrar app-platform a `styles/rottay` (byte-idéntico) rompe la app; ni
  F6 ni la lista de codemods de F8 incluyen ese paso.
- Barril raíz: 15 `export *` + nombrados en `src/index.ts` (333 líneas); el
  gate que lo vigila es `cra14:check` (no existe `scripts/packaging/`).

---

## 6. La regla de release (§1) y F8 — ¿queda ventana de rotura?

**Respuesta directa: la coordinación major 3.0 + codemods cierra bien el canal
registry (pins exactos + registry privado + publish manual + gates de prepack)
y deja abiertas cinco ventanas, tres de ellas SIN publish de por medio.**

### 6.1 Estado de versión — la premisa del plan está desactualizada en dos hechos

- `packages/core` = 2.19.36; `.changeset/` = 0 changesets; los bumps 2.19.35 y
  2.19.36 viajaron **fuera** del flujo changesets (commits manuales; el
  CHANGELOG termina en 2.19.34). El job `changeset` de CI solo valida PRs — los
  pushes directos lo esquivan, como ya pasó dos veces. La premisa de §1
  («2.19.36 acumula los retiros bajo changeset major») **no está materializada
  hoy**: F0 es quien la crearía.
- **El registry va por delante de main: 2.19.37 existe publicado** (con
  `./commercial`, 45 claves) desde el commit `a037d3a3c`, que **no es ancestro
  de HEAD ni está en ninguna rama** (`git merge-base --is-ancestor` → no;
  `git for-each-ref --contains` → vacío). app-bithire lo clava e instala
  (verificado en su package.json y node_modules). Consecuencias: la premisa
  «sigue publicado en 2.19.35» es incompleta; un changeset patch/minor desde
  2.19.36 colisiona con 2.19.37 o publica la rotura como 2.20.0. El plan no
  sabe que 2.19.37 existe.
- **app-evnto no consume el registry**: su
  `node_modules/@rottay/design-system` es un **symlink manual** (3-ago) a
  `ui-design-system/packages/core` (verificado con `ls -la`) — consume la
  fuente local viva (121 claves, sin commercial), ignorando su pin 2.19.29. Un
  `pnpm install` revertiría el symlink en silencio a 2.19.29.

### 6.2 Los números de F8, re-medidos

| Afirmación | Veredicto | Medición |
|---|---|---|
| `Space`→`Stack` (34) | **REFUTADO: son 36** | platform 35 + evnto 1 (`identity/auth/…/passkey-prompt`); la ronda 1 ya había medido 36 y el roadmap transcribió 34 |
| `ConfirmDialog` (17) | CONFIRMADO | 17, todos platform |
| `Toggle` (8) | CONFIRMADO | 8, todos bithire |
| `Link` (3, bithire) | CONFIRMADO | 3 exactos; platform/evnto/showroom 0 — universo completo |
| Iconos vendor (241: platform 230, evnto 11, bithire 0) | CONFIRMADO exacto | bithire 0 real: sus 2 hits son strings en tests de arquitectura que PROHÍBEN suppliers |
| `/commercial` (53) | CONFIRMADO | 53 bajo `app-platform/src` (+3 side-effect de commercial.css) |
| `AlertIcon`/`LoaderIcon` (2 sitios) | **PARCIAL** | Los 2 sitios de AlertIcon son platform `readiness.tsx:5,209` y el **showroom probe r2** (`:98,1472`); el Tag rustic es docstring. **LoaderIcon: 0 consumidores** — puede caer antes de F8 |
| FloatButton (1 archivo) | **PARCIAL** | Cierto, pero el codemod no es «un BackTop»: el layout usa **5 formas** (Group ×2, sueltos ×3, BackTop `:401`) |

### 6.3 Las premisas de §1, verificadas

- **`codemods/` no existe donde §1 lo exige** (raíz del repo). Existe
  `packages/core/scripts/codemods/` con `sizetype-to-size` y
  `variant-tone-split` — **ninguno cubre** Space/ConfirmDialog/Toggle/Link/
  iconos/commercial: los codemods de F8 son trabajo 100 % nuevo.
- **`TextLink` no existe hoy** (grep en src → vacío): la fase 1 del renombre
  debe crearlo primero. La estrategia de dos fases **sí** evita el swap
  silencioso. Riesgo residual: hay dos Links en el DS (Typography y
  navigation) — el codemod debe fijar cuál resuelve hoy el `Link` del barril.
- **El changeset major de F0 subdeclara**: el diff de claves de exports
  2.19.35→hoy es exactamente −`./commercial`, −`./commercial.css`,
  −`./styles/platform` (+81 agregadas) — honesto a nivel claves, pero la
  declaración de rotura debe incluir además (i) el retiro de los **tokens
  `--ds-commercial-*`** (renombrados a `--ds-color-*`; ~14 nombres con 53
  lectores y fallo silencioso), (ii) la desaparición de `dist/platform.css`
  (que `globals.css` de app-platform importa vía el wildcard `./dist/*.css`),
  (iii) que **`ProductWindow` no tiene sucesor en el paquete** (se fue al
  showroom, que no se publica).
- **El destino de los 53 `/commercial` está incompleto y sin dueño**: 10 de
  los 11 componentes del kit ya viven reclasificados y salen por el barril
  raíz; la constancia del bloqueo vive solo dentro de
  `residual-adjudication.json` («a documented external adoption blocker»).
  Ningún lote de ningún roadmap (ni `roadmap/`, ni `roadmap-commercial/`, ni
  el de app-platform) migra los 53 archivos; el «retiro del alias webpack»
  exige además re-anclar `dependency-honesty.mjs` (que hoy **exige** ese
  alias) y `local-ds-boundary.test.mjs` de platform.
- **Ratchet vendor de F8**: es trabajo nuevo y **no es ejecutable en el CI del
  DS** (los repos hermanos no están checked out; ci.yml corre solo
  `dependency-honesty static`/`pack`). Ejecutable localmente extendiendo el
  modo apps de dependency-honesty (que ya resuelve `../app-*`) y en el CI de
  cada app copiando el gate (patrón que `ds-supplier-honesty` ya establece).
  El roadmap no dice dónde vive; debería.

### 6.4 Ventanas de rotura residuales

| # | Ventana | Disparador | ¿El plan la cierra? |
|---|---|---|---|
| 1 | **evnto symlinkeado a la fuente local** | Cualquier retiro en fuente (F5/F6) rompe evnto al instante, sin publish | **NO** — §1 asume que el punto de coordinación es el publish; para evnto es falso hoy. El symlink no figura en ningún documento |
| 2 | **app-platform USE_LOCAL_DS + rebuild de dist** | Cualquier `pnpm build` del DS (vite `emptyOutDir`) mata `dist/commercial.*` sin regenerarlos (el productor `build-commercial-css.mjs` ya fue borrado del source) → los 53 archivos pierden el módulo y ~14 tokens quedan indefinidos (fallo CSS silencioso); con F6 muere también `dist/platform.css` (globals.css). Hoy el modo local está APAGADO (`.env.local` sin la línea), lo que contiene la ventana | **PARCIAL** — F8 la condiciona a una reclasificación que ya ocurrió con destino incompleto; nadie es dueño de la migración de los 53 |
| 3 | **Publish accidental de 2.19.36 como patch** | `changeset publish` manual no necesita changesets; prepack (distfresh) exige rebuild — y el rebuild produce exactamente el dist sin commercial | **SÍ en lo esencial** (F0 crea el changeset major; los pins exactos contienen el blast radius) — pero hoy 0 changesets y el candado de CI solo cubre PRs |
| 4 | **Colisión de versión con 2.19.37** | El registry va por delante de main (commit colgante) | **NO** — el plan no registra que 2.19.37 existe |
| 5 | **`pnpm install` en evnto revierte el symlink** a 2.19.29 | No rompe hoy (evnto usa solo raíz + `/icons` + `/server`, todo presente en 2.19.29) pero cambia visual/comportamiento en silencio | NO — regularizar: pin honesto o link declarado |

---

## 7. Hallazgos que ningún documento del plan registra

1. **gat-07-exact-proof rojo en HEAD** (§3.4) — el piso de F0 no es verde.
2. **2.19.37 publicado desde un commit colgante** y consumido por bithire
   (§6.1).
3. **El symlink de evnto** a la fuente local (§6.1).
4. **El conflicto de doctrina** entre el recableado de F2 y
   `channel-wiring-zero-delta-gate` — resuelto de facto por el borrado de F0,
   sin adjudicación escrita (§4.2).
5. **La dependencia inversa F2 ← F4** en las 22 raíces con asignaciones
   asimétricas, 9 con un tema en cero (§4.5).
6. **El vocabulario de los enums «vacíos» ya existe** en cascade/roots
   (chrome.anatomy 14, profiles.expressive 34) con validación blocking — F1 es
   un lift, no autoría (§4.1).
7. **root-catalog.json no tiene ningún lector**, ni siquiera de frescura
   (§4.1).
8. **La regex de changed-files de `ci.yml:55`** deja de disparar jobs en
   silencio si se agrupa el `scripts/` de raíz (§2.1).
9. **checkpoint.intent.json no tiene productor** y vive fuera de `manifest/`
   (§2.4).
10. **El PAT de `.claude/settings.local.json` ya está en la historia de git**
    — la rotación es obligatoria incondicional (§2.5).
11. **KIMI-ANNOTATIONS/inbox** es la única carpeta vacía con propósito
    declarado en contrato vivo (§3.2).
12. **El byte NUL es funcional** — separador de clave compuesta; convertir al
    escape `\0`, nunca eliminar (§3.3).
13. **LoaderIcon tiene 0 consumidores** — no necesita esperar a F8 (§6.2).
14. **`StatItem`/`ActivityItem` de command-center son props de 3 pantallas de
    app-platform** — la convergencia necesita su propio codemod (§5.4).
15. **Typewriter no expone sustrato** — la convergencia de terminal-block
    exige extraerlo primero (§5.4).
16. **`vercel-ignore-build.sh` es posiblemente inerte** — `vercel.json` define
    `ignoreCommand` inline con precedencia sobre el dashboard (§2.5).

---

## 8. Recuento

**F0.5:** 6 CONFIRMADO / 5 PARCIAL / 1 REFUTADO («14 entradas» → 16). El orden
de fases no tiene dependencias al revés, pero la graduación y la Fase 1 están
acopladas por 2 imports del generator, el re-sello de GAT-07 es por-lote desde
Fase 1, el helper de Fase 0 tiene dos defectos de diseño y no cubre los 536
imports inter-scripts, y el criterio `git grep → 0` es inalcanzable sin scope.

**F0:** de los 8 lotes de borrado, **6 son riesgo cero real** (codemods,
iconos con 2 correcciones, monolito, alias con 3 matices documentales,
`.claude/agents`, audit-presets) y **2 no lo son** (los dos gates: ley de
programa lane-control y contrato de WO-CRA-17). El criterio de cierre parte de
un piso rojo (gat-07) que el plan no ve.

**F1–F4:** las cifras del plan se reproducen (2 enums; 1.462/5.100; 26/27/10;
46/12/5; 226/41; 263; 3.275; 19,34 %; 462 PNG). Los defectos son de
naturaleza: F1 es lift + 62,6 % autoría nueva, no migración; el ancla 1.958 es
inestable por construcción y el contador no existe; F4 debe diseñar el esquema
de asignación (37/63 raíces sin variantes disponibles) y satisfacer 6 familias
de gates que el plan no enumera; y 22 raíces exigen invertir localmente el
orden F2→F4.

**F5–F6:** el único REFUTADO duro es el pre-paso Callout→Alert (error de hecho
re-introducido tras haber sido corregido en la ronda 1). El resto es
subdeclaración sistemática del mismo tipo que la ronda 1 ya señaló: apps que
consumen 3 de los 4 chrome retirados sin codemod en F8, el paso showroom sin
red genérica para structures/patterns, skins + filas de manifest fuera de todo
lote, appearance/ con 5 anclajes de tooling + 5 tests, pack-inventory a
re-anclar completo, y la extirpación de platform sin su consumidor real
(app-platform globals.css).

**Regla de release:** PARCIAL — cierra el canal registry; deja 5 ventanas
residuales, 3 sin publish de por medio (evnto-symlink, platform-local-dist,
colisión 2.19.37). Los números de F8 corregidos: Space 36, FloatButton 5 usos,
AlertIcon showroom+platform, LoaderIcon 0.

**Lo que el plan acierta y conviene no perder:** ninguna de las cuatro
verificaciones estructurales grandes lo tumbó — el orden de F0.5 es correcto en
su esqueleto, la red visual de F2 existe y corre en CI, la materialización de
las 12 raíces es inerte, y el delta record-workbench→DetailSurface está bien
presupuestado («migración de modelo», sin gap de capacidades). Los errores son
otra vez de presupuesto, de denominador y de terreno no relevado (registry,
symlinks, gates rojos) — no de dirección.

---

*Método: cinco asientos de verificación en paralelo (F0.5, F0, F1–F4, F5–F6,
release/F8) + re-verificación central de los hallazgos bloqueantes. Todas las
cifras de este informe fueron medidas hoy sobre HEAD `763417966` y los tres
repos de app en su estado local. Único script del repo ejecutado:
`gat-07-exact-proof.mjs --check-artifact` (modo no-escritor, declarado en §0).*
