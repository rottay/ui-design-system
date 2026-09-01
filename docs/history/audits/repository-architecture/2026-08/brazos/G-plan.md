# G — Dirección del plan, secuencia, honestidad de métricas y riesgo de proceso — 12 ópticas

**Alcance de medición.** Repo `/Users/daniel/Developer/Rottay/ui-design-system`.
HEAD al empezar: `c2e7dcfc5` (2026-08-28). HEAD al terminar: `dcc44a609` — el DT
commiteó 2 lotes más durante esta auditoría; toda cifra lleva su commit. Ventana
de programa: `2026-08-04..HEAD` = **670 commits** (`git log --since=2026-08-04
--format=%h | wc -l`), autor único `davila23` (`git shortlog -sn --since=2026-08-04 HEAD`).

## Puntaje por óptica

| # | Óptica | 0-5 | Evidencia (1 línea) |
|---|---|---|---|
| 57 | Secuencia de fases | **2** | 18,7% de commits tocan pintura; 0,2% de líneas agregadas son skin CSS; F4C (la fase que hace premium y distinto) no arrancó |
| 58 | Métrica 62%/43% | **1** | Sin fórmula; "comercial" no está definido en ningún archivo; el programa SÍ tiene 7 KPIs con fórmula en `customization-model/index.json` y no los usa |
| 59 | Costo de las 5.100 celdas | **1** | Ritmo observado = **0 celdas adjudicadas en 24 días**; F4B declaró 94/5100 y las 94 siguen `UNKNOWN` |
| 60 | F3 "un dígito" | **3** | La cifra es honesta para el pool que midió; la deuda de pintura inline real en producción modern es 28 líneas / 15 archivos, no 755 ni un dígito |
| 61 | F4B "cierre honesto" | **2** | 10/20 `SOURCE_BOUND` con `nextAction` a F4C/F5: es diferimiento con nombre nuevo, honestamente rotulado |
| 62 | Deuda diferida F2 | **2** | ≥12 ítems corridos de fase; channel-liveness 49 hallazgos probados **no drenables** por el conjunto seguro |
| 63 | Peso del instrumento | **1** | 124.620 líneas de `scripts/` vs 89.080 de skin modern + brand-themes; 38/105 gates son drills (gates que vigilan gates); 84,4% de las líneas agregadas son receipts + scripts |
| 64 | Riesgo operativo | **0** | **672 commits sin push**; `origin/main` quedó en 2026-08-03; CI (incl. red visual y a11y) **no corrió ni una vez** en 25 días; 100 de 116 documentos de auditoría citados en el ledger **ya no existen** |
| 65 | Alcance F8 sólo BitHire | **1** | El brazo DB se ejercita únicamente por fixture `l-db-row` vía showroom; `app-platform` — la app que administra tenants desde DB y ya tiene `tenant-theme-console` — está en HOLD |
| 66 | Decisiones del owner | **3** | Coherentes salvo la 14 (tensión con el objetivo DB); hay una decisión pendiente (`palette.status-seeds`/P0) que **bloquea el frente vivo** |
| 67 | Riesgo de regresión visual | **1** | Todo lote es cero-delta **por ley**; 6 PNG sighted de UNA familia con fecha 11-ago; los 462 PNG de la red visual sin tocar desde 2026-07-14 y su job nunca corrió; `SIGHTED_ACCEPTED` = 0 |
| 68 | Veredicto de dirección | **2** | Divergencia real entre los 3 artefactos: **34,7% → 34,5%** en 670 commits. El plan no mueve el eje del owner |

---

## Hallazgos (ordenados por severidad)

### H-G-1 · BLOQUEANTE · 672 commits sin push, 25 días, y el CI nunca corrió

- **Qué:** todo el programa Modern Rescue vive en una sola máquina, sin réplica.
  Y como el CI dispara en `push`/`pull_request`, **ningún job de CI se ejecutó
  desde 2026-08-03**: eso incluye `visual` (regresión de pixels, whitelabel y la
  única suite responsive), `a11y`, `core` y `showroom` (los builds).
- **Evidencia:**
  - `git rev-list --count @{u}..HEAD` → **672**
  - `git log -1 --format='%h %ad' --date=short origin/main` → `a97ddd736 2026-08-03`
  - `.github/workflows/ci.yml:3-7` → `on: push: [main, develop] / pull_request`
  - `ci.yml:387` job `visual`; `ci.yml:435` "Run visual regression, whitelabel, and responsive suites"
  - El propio roadmap lo admite: `docs/history/programs/architecture-refactor/2026-08/execution/index.md:7751-7753`
    — «el job `visual` no se ejercitó durante F2.4 — corre en el próximo push de
    CI, y su primera corrida real con peso es la de F4A». **F4A cerró el
    2026-08-22 y sigue sin haber push**: la reescritura de los tres themes nunca
    pasó por la red visual.
  - Último commit que toca `packages/showroom/e2e`: `aa35ce39e 2026-07-14`.
    Baselines de `flagships.spec.ts` con `mtime` 2026-07-09.
- **Impacto:** la afirmación de §5 «la red visual (462 PNG, job `visual` de CI)
  cubre el recableo» es **falsa en el período auditado**. Los 103 gates blocking
  que sí corren localmente son gates de contrato y de texto: ninguno mira un
  pixel. Y una pérdida de disco borra 25 días de trabajo de 4 agentes.
- **Optimización:** (a) pedirle al owner una excepción acotada al "nunca push"
  para una rama `modern-rescue/wip` (no `main`) — el riesgo que la ley "nunca
  push" evita es romper apps consumidoras, y una rama no publicada no rompe a
  nadie; (b) mientras tanto, correr la suite visual **localmente** al cierre de
  cada cohorte (`playwright.visual.config.ts` corre contra `next start`), y
  meterla en la batería de lote junto a `gates:ci`; (c) `git bundle create` diario
  a un disco externo como piso mínimo si (a) se rechaza.

### H-G-2 · BLOQUEANTE · La divergencia entre verticales NO se movió en 670 commits

- **Qué:** el objetivo del owner es que dos tenants parezcan proyectos distintos.
  Medí ese eje sobre los tres artefactos generados, con el mismo instrumento, en
  dos fechas.
- **Evidencia** (script `reaud-G-diverge*.py`; extrae `--ds-*: valor` de
  `packages/core/styles/{bithire,rottay,evnto}.css`, compara el conjunto de
  valores por nombre presente en los tres):

  | | 2026-08-03 (`a97ddd736`, origin/main) | 2026-08-28 (HEAD) |
  |---|---|---|
  | nombres en los 3 artefactos | 3.571 | 3.598 |
  | con al menos un valor distinto | 1.238 = **34,7%** | 1.240 = **34,5%** |
  | eje CROMA | 930/1.722 = 54,0% | 923/1.723 = **53,6%** |
  | eje TIPO | 42/363 = 11,6% | 42/365 = **11,5%** |
  | eje GEOM | 136/795 = 17,1% | 139/803 = **17,3%** |
  | bytes del artefacto bithire | 4.830.450 | 5.385.897 (**+11,5%**) |

- **Impacto:** en 25 días los artefactos **crecieron 11,5%** y la diferencia
  visual entre verticales quedó plana dentro del ruido. BitHire y Evnto siguen
  siendo **88,5% tipográficamente idénticos** y **82,7% geométricamente
  idénticos**. Esto no es un defecto del trabajo hecho — es la consecuencia
  lógica de que **cada lote sea cero-delta por ley** hasta F4C, y F4C no arrancó.
- **Caveat honesto:** es comparación léxica de declaraciones, no de propiedades
  computadas; una cadena `var()` puede divergir río abajo. Pero como indicador
  direccional con instrumento idéntico en dos fechas, la conclusión (plano) se
  sostiene.
- **Optimización:** adoptar esta medición (o su versión computada) como **el**
  KPI de cabecera del programa, publicado en §13 en cada asiento junto al 62%.
  Si un frente no la mueve, el asiento debe decirlo explícitamente.

### H-G-3 · ALTO · El 62%/~43% no tiene fórmula, y el programa ya tiene KPIs que sí la tienen

- **Qué:** la métrica de cabecera es una estimación de juicio; el "~43% comercial"
  no está definido en ningún archivo del repo.
- **Evidencia:**
  - `grep -n 'comercial' docs/history/programs/architecture-refactor/2026-08/execution/index.md` → 6 apariciones,
    todas como `~43% comercial` sin denominador ni definición.
  - `ROADMAP:1400` la califica de «estimación prudente». `ROADMAP:315-316`: la
    cifra bajó de `63–65%` a `62%` no por trabajo sino porque *«la enmienda de
    paridad profunda agregó scope»*.
  - Desde el 2026-08-27 el asiento repite literalmente **«Métrica sin mover:
    62% / ~43%»** en ≥15 lotes consecutivos (`ROADMAP:4604, 4644, 4676, 4703,
    4733, 4759, 4811, 4858, 4902, 4939, 4975, 5001, 5034, 5061, 5098, 5141, 5170`).
    Una métrica que no se mueve con 20 lotes de trabajo real no está midiendo
    trabajo: está midiendo la impresión del DT sobre el alcance total.
  - **Contraste:** `scripts/quality-evidence/programs/modern-rescue/customization-model/index.json`
    define 7 KPIs **con fórmula** (`kpis.coverage.formula = observedExpectedFamilyPartPropertyTriples /
    declaredExpectedTriples`, `pathParity`, `depth`, `resilience`, `leverage`,
    `canonClosure`, `unknownTargetedImpact`) y **ninguno se reporta**.
  - Y `quality-rubric/index.json` contiene el criterio exacto del owner:
    `tenantDivergenceAxes` (12 ejes) + `tenantDivergenceMinimumByProfile`
    (`surface-canary: 6`, `structure: 5`, `pattern-chart: 4`…). **Nadie lo mide.**
- **Impacto:** el owner no puede saber si el programa avanza. Un número que sólo
  baja cuando crece el alcance y nunca sube cuando se ejecuta es un número que
  puede quedarse en 62% para siempre.
- **Optimización — métrica reproducible propuesta, 4 cifras, todas ancladas:**

  | Cifra | Fórmula | Fuente | Hoy |
  |---|---|---|---|
  | Certificación | `1 - rollups.controlFamilyDispositions.UNKNOWN / 5100` | `manifest/index.json` | **0,0%** |
  | Familias revisadas | `rollups.familyReviews.accepted / 255` | ídem | **0,0%** |
  | Divergencia de tenant | `familias que alcanzan tenantDivergenceMinimumByProfile / 255` | `quality-rubric/index.json` + captura | **0/255** |
  | Evidencia vista | `SIGHTED_ACCEPTED / 255` | manifest | **0/255** |

  El 62% puede quedarse como "juicio del DT sobre esfuerzo de ingeniería", pero
  **rotulado como juicio** y nunca al lado de las 4 anteriores sin ellas.

### H-G-4 · ALTO · F9 no tiene fecha: el ritmo observado de su criterio de cierre es cero

- **Qué:** F9 exige `UNKNOWN = 0` sobre 255 × 20 = 5.100 celdas, con adjudicación
  por celda (`APPLICABLE` / `INVARIANT_WITH_REASON` / `NOT_APPLICABLE_WITH_REASON`),
  y las aplicables con delta computada + negativos + restore (`ROADMAP:512-539`).
- **Evidencia:**
  - `manifest/index.json` `rollups`: `controlFamilyDispositions.UNKNOWN = 5100`,
    `APPLICABLE = 0`; `familyReviews.unreviewed = 255`, `accepted = 0`;
    `familyMaximumClaims.SIGHTED_ACCEPTED = 0`.
  - **Lo que F4B sí produjo, medido:** `generatedControlFamilyView` suma
    **94 celdas declaradas** (`declaredFamilies`) sobre 5.100, y
    `applicableFamilyIds` está vacío en los **20/20** controles. Es decir: 4 días
    de flota completa (DT + Opus + Sonnet + Fable) → 94 filas declaradas, 0
    adjudicadas. Y la propia ley del manifest dice: *«a declared row is not
    progress»*.
  - Duración F4B: primer control `2026-08-23` (`F4B-5 density.mode`), cierre de
    fase `2026-08-26` (`afcfb5718`) = **4 días**, 134 receipts.
- **Proyección honesta:** no hay tasa de adjudicación de celdas para extrapolar —
  es 0. Los dos anclajes posibles:
  - *pesimista, celda por celda:* 94 celdas declaradas / 4 días = 23,5/día →
    **217 días de flota continua sólo para DECLARAR**, más la adjudicación.
  - *optimista, lote por familia:* si una familia se cierra contra los 20
    controles como una unidad F4B-grade (5 unidades/día observadas en F4B) →
    255/5 = **51 días de flota continua**, y eso asumiendo que las sondas se
    reutilizan sin re-diseño por familia.
  Con F4C, F5, F6, F7 y F8 delante, la fecha realista de "Modern Rescue completo"
  cae en **Q1–Q2 2027**, no en 2026.
- **Optimización — cambiar el método, no el esfuerzo:** adjudicar por **grupo de
  receta/anatomía**, no por familia. El andamiaje existe pero está vacío: el
  manifest tiene sólo **3 grupos** (`manifest/index.json:groups` →
  `collection-card-anatomy` + 2). Un particionado por grupo sobre los
  denominadores declarados (`program/index.json:denominators`: 105 primitives,
  57 patterns, 18 charts, 39 structures, 36 surfaces) permite una adjudicación
  de grupo con prueba por representante + prueba de pertenencia mecánica. Las 18
  familias de charts × 20 controles = 360 celdas se cierran plausiblemente con
  1–2 adjudicaciones de grupo. Sin ese cambio, F9 no es realizable.

### H-G-5 · ALTO · El peso del instrumento superó al del producto, y un tercio de los gates vigila gates

- **Qué:** la gobernanza se autoalimenta.
- **Evidencia** (`wc -l`, `find`, y el parseo de `scripts/ci/gates-manifest/index.mjs`):

  | Instrumento | líneas | Producto | líneas |
  |---|---|---|---|
  | `packages/core/scripts/**/*.{mjs,js,ts}` | **124.620** | skin CSS modern | 52.327 |
  | · de las cuales tests de scripts | 43.883 | brand-themes (ts+json) | 36.753 |
  | `docs/*.md` del repo | 18.434 | **subtotal producto modern** | **89.080** |
  | `roadmap/` + `roadmap-commercial/` | 22.777 | todos los CSS de `src` | 129.760 |
  | `manifest/` (357 JSON) | **101 MB** | | |
  | `test-artifacts/` | **98 MB** | | |

  Ratio instrumento/producto-modern = **1,40 : 1**.

  Churn por bucket, `2026-08-04..HEAD` (`git log --numstat` agregado):

  | bucket | +líneas | %del total |
  |---|---|---|
  | quality-evidence / receipts | 2.531.749 | **46,2%** |
  | scripts/ (gates + instrumento) | 2.094.944 | **38,2%** |
  | manifests / baselines | 430.232 | 7,8% |
  | src TS/TSX | 117.373 | 2,1% |
  | docs/ | 113.547 | 2,1% |
  | BRAND-THEMES | 32.235 | 0,6% |
  | **SKIN CSS (pintura)** | **12.113** | **0,2%** |

  Gates: `scripts/ci/gates-manifest/index.mjs` declara **105 ids**, **103
  `blocking: true`**. De ellos **38 terminan en `-drill`** (un gate cuyo sujeto
  es otro gate) = 36,2%; 9 son `*-freshness`/`*-staleness` de artefactos del
  propio instrumento; 12 vigilan la maquinaria del programa. **≈51% de la
  superficie blocking no mira al producto.**

- **Cinco gates cuya eliminación no cambiaría un pixel ni la seguridad del tenant:**
  1. **`gat-07-exact-proof`** (`scripts/evidence/gat-07-exact-proof/index.mjs --check-artifact`).
     Sello documental sobre la lista de archivos de maquinaria. Costo medido:
     **29 commits de re-sello** desde 2026-08-04 (`git log --format=%s | grep -ci 'gat-07\|gat07'`).
     No renderiza nada ni cerca a ningún tenant.
  2. **`modern-rescue-checkpoint-state`.** Lo corrí read-only: reporta
     *«written against HEAD 66012af28; HEAD is now dcc44a609 — 52 commit(s)
     since»* y devuelve **`✓ no violations`, exit 0**. Es decir: valida la FORMA
     del bloque estampado, no la VERDAD del estado. De hecho
     `checkpoint/index.json` describe el frente craft y lleva 49 commits de
     atraso respecto del PIVOTE a normalización profunda (`git log -3 --
     checkpoint/index.json` → último `d5c085a23`, anterior al pivote `6f00cbada`).
     Un gate verde sobre un artefacto factualmente stale.
  3. **`scripts-tree` + `scripts-tree-drill`.** Higiene `folder/index` sobre el
     árbol de scripts. Legítimo como lint; no es materia de CI blocking.
  4. **`wiring-coverage`** + **`workflow-script-wiring`.** Verifican que todo
     script esté cableado a un canal. Meta-gobernanza pura.
  5. **`kimi-worklist` (+ drill)** y **`root-checklists-freshness`.** Worklist
     interna de un actor que ya no ocupa el asiento, y frescura de un checklist
     derivado que ningún consumidor de producto lee.

  (Aclaración de honestidad: **no** propongo tocar `import-binding-integrity` —
  el comentario del manifest documenta que atrapó 22 imports rotos que
  renderizaban elementos inválidos. Ese sí protege pixels.)

- **Optimización:** mover los 38 drills y los 9 freshness a un job **no-blocking
  nocturno**; dejar blocking sólo lo que protege render, frontera pública o
  aislamiento de tenant. Presupuesto propuesto: **≤35 gates blocking**.

### H-G-6 · ALTO · 100 de los 116 documentos de auditoría citados por el ledger ya no existen

- **Qué:** el roadmap — declarado «la única escribanía durable del programa»
  (`ROADMAP:682-687`) — cita preaudits, postaudits y adjudicaciones por ruta y
  por SHA, pero esas rutas viven en `/private/tmp`, que es efímero.
- **Evidencia:** `grep -rho '/private/tmp/[A-Za-z0-9._/-]*' docs/*.md | sort -u`
  → **116 rutas únicas**; verificando existencia una por una → **100 no existen
  hoy**. El propio prompt de sucesión lo admite:
  `docs/history/prompts/architecture-refactor/2026-08/design-lead-succession/index.md:27-29` — «Los memos citados abajo
  viven ahí y son EFÍMEROS».
- **Impacto:** la cadena de evidencia del ACCEPT de Fable y del veredicto de
  Codex para casi todos los hitos ya no es auditable. Peor: la brecha C4 de
  escribanía (`ROADMAP:1923-1939`) describe exactamente este fallo consumado —
  15 commits `8d2985638..6cfdcc1a9` con cuerpo vacío, dos archivos de
  `packages/core/src/` fuera del write-set declarado, y *«no se hallaron memos de
  postaudit en /tmp»*.
- **Optimización:** al cerrar cada lote, copiar el memo del auditor a
  `packages/core/docs/history/programs/modern-rescue/advisories/2026-08/<lote>.md`
  y citar **esa** ruta en el asiento. Costo marginal: un `cp` por lote.

### H-G-7 · ALTO · Todo lote es cero-delta por ley: el producto no puede mejorar hasta F4C, que no arrancó

- **Qué:** la estrategia de riesgo visual es sólida (cero-delta computado contra
  los tres artefactos, contrafactuales, restore) pero **es una estrategia de
  no-regresión, no de mejora**. Por definición un lote cero-delta no cambia un
  pixel.
- **Evidencia:**
  - 46 menciones de `cero-delta` en el roadmap; los lotes del frente vivo cierran
    literalmente con «cero bytes de artefacto movidos» (`ROADMAP:4762` PALETA P1)
    y «cero delta resuelto» (`ROADMAP:5106` cohorte 2A).
  - **Corpus sighted completo del programa: 6 PNG**
    (`artifacts/quality/programs/modern-rescue/visual-regressions/journeys/oauth-transition/2026-08-11/`), con `mtime`
    **2026-08-11**, de **una sola familia** (`oauth-transition`), y su propio
    README declara los límites: *«One variant family of four… One provider
    (`google`) and one phase (`redirect`). Resting state only; no hover, focus or
    press.»*
  - `SIGHTED_ACCEPTED = 0` en el manifest y **10 apariciones** en el roadmap,
    todas de la forma «`SIGHTED_ACCEPTED` **no se reclama**».
  - El fence del aprobador sighted está stale: `v2/receipts.mjs:7` sigue con
    `SIGHTED_APPROVER = 'Codex (DT)'` (`ROADMAP:2916`), y Codex dejó el asiento
    el 2026-08-23.
  - **`playwright` aparece 0 veces** en las 8.098 líneas del roadmap.
- **Impacto:** el programa tiene una red de no-regresión excelente y **ninguna
  red de mejora**. No hay un solo lote de los 670 commits que pueda mostrarle al
  owner una pantalla mejor que la del 3 de agosto.
- **Optimización:** exigir por lote una de dos pruebas, no una sola: (a) *no
  regresión* (cero-delta, ya está) **y** (b) *intención*, que puede ser
  `DELTA_NULO_DECLARADO` ("este lote no debe cambiar nada") o
  `DELTA_ESPERADO` con captura A/B. Un frente donde 20 lotes seguidos declaran
  `DELTA_NULO` es un frente que hay que reordenar, y hoy nada lo señala.

### H-G-8 · MEDIO · F4B: 10 de 20 controles cerraron como diferimiento con nombre nuevo

- **Qué:** el cierre está rotulado honestamente ("en su forma honesta"), pero
  `SOURCE_BOUND` significa *el compilador está verificado en aislamiento y nada
  pintado se probó movido*. La escalera del propio programa certifica
  consecuencia pintada (`ROADMAP:3911-3914`).
- **Evidencia** — los 10, con lo que falta (`ROADMAP:1395` es la fila viva):

  | # | Control | Falta para subir |
  |---|---|---|
  | 1 | `shape.button-style` | `chromeToVariables` esparce el canal DESPUÉS del branch de buttonStyle → el brazo estático no discrimina; 2 defectos `OPEN_DT` + pregunta de producto abierta (`ROADMAP:3905-3920`) |
  | 2 | `typography.pairing` | ratificación de `propertyGroup` + calibración de celda |
  | 3 | `navigation.sidebar-tone` | ídem; el ancho real (6 canales) se corrigió en el cierre |
  | 4 | `motion.dial` | ídem |
  | 5 | `typography.families` | ídem; arrastra el STOP del caso compuesto (E-2) |
  | 6 | `recipe-profile` | ídem |
  | 7 | `profiles.expressive` | ídem |
  | 8 | `profiles.icon` | ídem |
  | 9 | `token-overrides` | **techo estructural declarado**: clase CSS-terminal + puerta estática sellada ⇒ sin camino a `pass:true` bajo el instrumento actual; candidato F5 `F5_INSTRUMENT_SEALED_DOOR_SINGLE_ARM_VERDICT` con 2 condiciones (decisión 16) |
  | 10 | `chrome.anatomy` | ratificación + calibración |

  Más `chrome.families`, `UNKNOWN` a propósito, con
  `nextAction: SURFACE_REVIEW_DEFERRED_TO_F5` sobre **~250 celdas**
  (`ROADMAP:5996-5997`).
- **Impacto:** la mitad de los diales que el owner va a tocar **no tienen prueba
  de que cambien un pixel**. Y ninguno de los 20 tiene aceptación sighted.
- **Optimización:** antes de F4C, correr un solo lote "10 en uno": para cada
  `SOURCE_BOUND`, una captura A/B en el reference lab con el dial en sus dos
  extremos, en los 3 verticales. Es la prueba más barata que existe (la sonda ya
  produce los escenarios) y convierte 10 diferimientos en 10 hechos.

### H-G-9 · MEDIO · La deuda que se corre de fase en fase (tabla)

| Deuda | Origen | Destino | Estado |
|---|---|---|---|
| `channel-liveness`, 49 hallazgos | F2 | vuelve a blocking «cuando existan sus enumeradores» | **Probado no drenable** por el conjunto seguro: los 12 recables drenaron **CERO** hallazgos (`ROADMAP:7745-7750`) |
| `lane-control-drills` 10/13 | F2 | ídem | excluido de blocking |
| 2 gates excluidos con owner | F4B/C5 | «cuando sus enumeradores existan» | abierto |
| Propagación mode-aware (decisión 18) | F2 asimétrico | **F5** | abierto |
| Validador APCA cascade-aware | F4B/D-1 | **F5** | abierto |
| `token-overrides` single-arm verdict | F4B-17B | **F5** (candidato, 2 condiciones) | abierto |
| Revisión de superficie `chrome.families` (~250 celdas) | F4B | **F5** | abierto |
| Deuda `chart-series` | F3 | **F5** (`ROADMAP:339`) | abierto |
| Lectura sighted A/B del glass BitHire | F2A Lote F″ | **F4C** (decisión owner 2026-08-26) | evidencia producida, lectura pendiente |
| Valor `--ds-input-md-line-height` bithire | F2A / decisión 19(iii) | **decisión del owner** | pendiente «sin apuro» |
| Gobierno de las 5 raíces `ramp.seed.*` (P0) | normalización P0 | **decisión del owner** (`palette.status-seeds`) | **bloquea el frente vivo** |
| `ProductWindow`, ~14 tokens `--ds-commercial-*`, `/commercial` (53 archivos) | F0 §0.4 | **F8** | abierto, y F8 sólo cubre BitHire |
| Symlink de evnto a fuente local | F0 §1 | F5/F8 | declarado, no regularizado |

Además, un frente entero **que no estaba en el plan** se insertó el 2026-08-27:
**normalización profunda de themes** (`ROADMAP:5356` PIVOTE, directiva del
owner). No tiene número de fase, se ubica como puerta pre-F4C, y consumió los
últimos ~120 commits (cohortes 0, 1, 2A, 2B, PALETA P1, LOTE 3, DRILL-77,
LEDGER-GATE, PURITY, HYGIENE, GATE-HYGIENE).

### H-G-10 · MEDIO · F3 midió una cosa distinta de la deuda; el número es honesto pero el título no

- **Qué:** «superficie genuina de UN dígito, drenada» es cierto para el pool que
  el regex definió; no es cierto para la pintura inline del repo.
- **Evidencia** (todos con `rg`, universo `packages/core/src`):
  - Censo crudo: `rg -l 'style=\{' src/ui -g '*.tsx'` → **755** archivos,
    5.219 ocurrencias, 513 con `style={{`.
  - El regex de F3 (`ROADMAP:325-334`) es `var\(--ds-[a-z0-9-]*\$\{`: mide
    **construcción de referencias**, no pintura. Verificado: `rg -o
    'var\(--ds-[a-z0-9-]*\$\{' src -g '*.ts*'` → **111** ocurrencias (el asiento
    dice 97 de producción). Un `style={{ color: 'var(--ds-x)' }}` **no cae en ese
    regex** — y es exactamente lo que la ley de literales quiere gobernar.
  - Deuda real de literales inline: `rg -n 'style=\{\{[^}]*(#[0-9a-fA-F]{3,8}|[0-9]+px|rgba?\()'`
    → 951 líneas totales; **255** excluyendo stories/tests; **28 líneas en 15
    archivos** excluyendo además `engines/rustic` y `engines/classic`
    (read-only por ley del programa). De esas 28, 5 son ejemplos en JSDoc y ~10
    son `var(--x, 16px)` legítimos ⇒ la deuda dura de modern es **~13 sitios**:
    `charts/runtime/chart-engine/.../renderers/{treemap,calendar-heat-map,bullet,radar}/index.tsx`
    (`fontSize: '10px' | '11px' | '12px'`, 7 sitios),
    `primitives/feedback/Progress/compound/Line/index.tsx:286`
    (`fontSize:'14px', minWidth:'40px'`),
    `primitives/display/Statistic/compound/Countdown/index.tsx:262-278`
    (skeleton 16/32/64/120px + márgenes 4px),
    `primitives/navigation/examples/index.tsx:430` (`border: '1px solid #ddd'` —
    **el único color duro que queda**).
  - Control positivo: la búsqueda encuentra `#ddd` y `13px`, luego no está rota.
- **Adjudicación:** F3 **está drenada respecto de su propia definición** (traslado
  de pintura ya gobernada). No está drenada la deuda de literales inline, y el
  cluster de `fontSize` de los chart renderers **no tiene dueño de fase**: F3 lo
  excluyó del pool y `chart-series` se movió a F5.
- **Optimización:** un mini-lote de ~13 sitios (½ día) cierra la clase entera y
  permite decir "cero literales de pintura inline en modern" — una afirmación que
  hoy no se puede hacer y que vale más que el título "un dígito".

### H-G-11 · MEDIO · El objetivo "tenant desde DB" no tiene app que lo consuma dentro del programa

- **Qué:** decisión 14 acota F8 a **sólo BitHire**; `app-platform` y `app-evnto`
  quedan en HOLD. Pero BitHire es el vertical **estático**, y `app-platform` es —
  por ley del monorepo — la única app autorizada a ser DB-driven para branding.
- **Evidencia:**
  - `ROADMAP:596-600` decisión 14.
  - El brazo DB se ejercita sólo por fixture: `packages/showroom/scripts/assert-first-paint-authority.mjs`
    usa `'/probe/whitelabel-torture?fixture=lmiami&engine=modern&tenantSource=canonical-db'`
    y la fila viene de
    `src/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/l-db-row/index.ts`.
    Es una fila de fixture en el repo, no una base.
  - La app que lo consumiría existe y está en HOLD:
    `app-platform/src/features/organization/tenants/screens/tenant-theme-console/index.tsx`,
    `.../actions/whitelabel/index.ts`, `.../actions/whitelabel-drafts/index.ts`,
    `app-platform/src/core/lib/tenancy/branding-bounds/index.ts`.
  - Ventana abierta de §0.4/§9: `app-platform/globals.css:14` importa
    `dist/platform.css`, que **ya no existe en el paquete**.
- **Impacto:** al terminar F8-BitHire el programa podrá demostrar el tenant
  estático punta a punta y el tenant DB **sólo en el showroom**. La mitad del
  objetivo del owner ("uno desde archivo de vertical, otro desde DB") queda sin
  demostración fuera del laboratorio.
- **Optimización:** agregar a F8 un **lote mínimo de app-platform** (no la
  migración `/commercial` entera): arreglar el import de `globals.css` a
  `styles/rottay` y hacer que `tenant-theme-console` cargue un `TenantThemeDocument`
  real de la DB local, con una captura A/B de dos tenants. Es la única prueba
  end-to-end del brazo DB, y cuesta mucho menos que el resto de F8.

### H-G-12 · MEDIO · Responsive y mobile están en el objetivo del owner y prácticamente ausentes del plan

- **Qué:** el objetivo dice «responsive, sin espacios en blanco, premium, mobile
  si es viable».
- **Evidencia:**
  - **`mobile` aparece 1 (una) vez** en las 8.098 líneas del roadmap
    (`ROADMAP:2460`, y de paso: describe una señal `isMobile` de viewport dentro
    de `DashboardSurface`, no un frente de trabajo).
  - `responsive` aparece 24 veces, y dos de ellas son la confesión:
    `ROADMAP:1537` — *«**Responsive sin medir**: la sonda clava un viewport
    (1280x800, dpr 1)»* — repetida en `:1663` y `:1830`.
  - La única suite con breakpoints reales son los baselines
    `bithire-badge-{360,768,1280}-chromium-darwin.png` de
    `packages/showroom/e2e/visual/__screenshots__/`, con `mtime` **2026-07-09** y
    último commit **2026-07-14** — antes de que empezara la ventana auditada, y
    su job nunca corrió (H-G-1).
  - `responsive.posture` **sí** cerró COMPUTED_VERIFIED, pero como control con
    terminal DATA (`ROADMAP:2407`): prueba que el dato baja, no que la pantalla
    se acomode.
- **Impacto:** si el owner abre el producto en un teléfono, no hay evidencia
  en el programa de qué va a ver.
- **Optimización:** añadir a la batería de cierre de cohorte una corrida de la
  suite visual en 360/768/1280 sobre 6-8 pantallas insignia. Reutiliza
  infraestructura existente; costo ~1 día de setup.

---

## Lo que está bien (breve, con evidencia)

- **La honestidad del ledger es real y poco común.** El programa se rehúsa a
  contar lo que no probó: `skeletonsCountAsProgress: false` en el manifest;
  `refused: ["SOURCE_TOUCHED as progress", …]` en `checkpoint/index.json`;
  `SIGHTED_ACCEPTED` no se reclama en 10 lugares distintos; F4B se rotula
  «en su forma honesta» y nombra los 10 `SOURCE_BOUND` uno por uno. Un programa
  que puede decir «0/5100» después de 670 commits no se está mintiendo.
- **Las mediciones se corrigen a sí mismas.** La reclasificación de F3
  (209/17 → 97 ocurrencias → un dígito), la refutación de la clase
  `DB_ARM_SCOPE_SHADOWING`, el «apagado total era ARTEFACTO DE MEDICIÓN» de
  `typography.pairing` (`ROADMAP:4198`), la re-medición F2A con instrumento
  canónico: cinco casos donde una cifra fue destruida por evidencia propia.
- **DT ≠ auditor está vivo** (decisión 13) y produjo REJECTs reales que cambiaron
  código: F4B-9, F4B-10, F4B-12, el piloto F3 con DEFECTS-2.
- **El criterio de aceptación del owner ya está escrito y es medible.**
  `quality-rubric/index.json:tenantDivergenceAxes` (12 ejes) +
  `tenantDivergenceMinimumByProfile`. No hace falta inventarlo — hace falta usarlo.
- **La ley de cero-delta computado contra los 3 artefactos** es más fuerte que un
  screenshot para lo que pretende probar, y está bien implementada
  (`--against` endurecido en `0c74b9412`).

---

## Óptica 68 — Veredicto

**Dirección: PARCIAL, con la mitad correcta invertida en el orden equivocado.**

La arquitectura elegida es correcta (un compilador, dos transportes, ~20 controles
públicos, artefacto generado, tenant-last). La disciplina de evidencia es
superior a la de cualquier programa que haya auditado en este monorepo. Pero la
**secuencia** convirtió un programa de producto en un programa de gobernanza: en
25 días, el 84,4% de las líneas agregadas fue instrumento y receipts, el 0,2% fue
skin CSS, y el único eje que el owner nombró —que dos tenants parezcan proyectos
distintos— se movió de 34,7% a 34,5%.

**Probabilidad de llegar a "dos tenants parecen proyectos distintos + premium +
responsive" con el plan tal cual: baja (~20-25%) dentro de 2026.** No por
capacidad de ejecución, sino por tres razones estructurales: (1) toda la mejora
visible está concentrada en F4C, que está detrás de F3 + una puerta de
normalización que se insertó después del plan y ya consumió 120 commits; (2) F9
no tiene fecha porque su ritmo observado es cero y su método es por celda; (3) el
riesgo de proceso de H-G-1 puede borrar el programa entero en cualquier momento.

### Los 7 movimientos que propondría

1. **Push a una rama de trabajo, ya.** No a `main` — una rama
   `modern-rescue/wip`. La ley "nunca push" protege a las apps consumidoras, y
   una rama no publicada no las toca. Desbloquea de golpe: la red visual de 462
   PNG, la suite a11y, los builds, y la réplica de 25 días de trabajo.
   *Justificación:* es el único movimiento cuyo costo es minutos y cuyo riesgo
   evitado es total.

2. **Adelantar un "vertical slice" de F4C sobre 8 familias insignia, antes de
   terminar la normalización.** Elegir 8 (Button, Input, Card, Table, Sidebar,
   PageHeader, Modal, DashboardSurface) y llevarlas hasta
   `tenantDivergenceMinimumByProfile` en los 3 verticales, con captura A/B
   360/768/1280 light/dark. *Justificación:* prueba el método de art direction
   sobre la cascada que ya existe, produce la primera evidencia visible en 25
   días, y descubre los defectos de F4C ahora y no dentro de 3 meses. Rompe la
   cola vinculante — hay que pedirle al owner la excepción escrita, con el
   argumento de que ninguna de las 8 requiere inventar un eje nuevo.

3. **Cambiar el método de F9 de celda a GRUPO.** Hoy hay 3 grupos en el manifest
   para 255 familias. Definir ~25-30 grupos de receta/anatomía, adjudicar por
   grupo con prueba por representante + prueba mecánica de pertenencia, y dejar
   la adjudicación por celda sólo para los outliers. *Justificación:* 5.100
   adjudicaciones manuales no tienen fecha; ~600 sí.

4. **Reemplazar el 62%/~43% por las 4 cifras de H-G-3, publicadas en cada
   asiento.** Y agregar la divergencia medida de H-G-2 como quinta.
   *Justificación:* una métrica que no se movió en 20 lotes consecutivos no le
   sirve al owner para decidir nada; el programa ya tiene fórmulas escritas que
   no usa.

5. **Recortar la superficie blocking de 103 a ≤35.** Los 38 drills y los 9
   freshness pasan a un job nocturno no-blocking; los 5 de H-G-5 se retiran con
   enmienda escrita. *Justificación:* 29 commits de re-sello de `gat-07` y un
   gate que da verde sobre un intent con 52 commits de atraso son costo puro.
   Cada gate blocking se paga en cada lote, para siempre.

6. **Un lote "los 10 en uno": captura A/B de los 10 controles `SOURCE_BOUND`.**
   Dial en sus dos extremos, 3 verticales, la sonda ya produce los escenarios.
   *Justificación:* es lo más barato del programa y convierte la mitad de los
   diales del owner de "verificado en aislamiento" a "probado que pinta".

7. **Meter un lote mínimo de app-platform en F8** (import de `globals.css` +
   `tenant-theme-console` contra la DB local, con dos tenants capturados).
   *Justificación:* sin él, el brazo DB del objetivo del owner nunca sale del
   showroom, y hoy `app-platform/globals.css:14` importa un archivo que ya no
   existe.

**Lo que recortaría:** la re-adjudicación exhaustiva de `channel-liveness`
(49 hallazgos probados no drenables por el conjunto seguro — o se enumeran o se
retiran, pero no se arrastran 3 fases más), y el eje de re-sellos documentales
(`gat-07`) hasta el cierre del programa.

**Lo que automatizaría:** la copia del memo del auditor a `test-artifacts` en el
cierre de lote (H-G-6, un `cp`), y la corrida de la suite visual responsive por
cohorte (H-G-12).

---

## Preguntas que no pude cerrar (y qué haría falta)

1. **¿La divergencia léxica de H-G-2 subestima la divergencia real?** Mi medición
   compara valores declarados, no propiedades computadas. Haría falta correr la
   sonda de resolución sobre los 3 artefactos en Chromium y comparar
   `getComputedStyle` sobre un set de pantallas — es exactamente lo que la
   reference lab puede hacer y no hace hoy.
2. **¿Cuál es el ritmo real de adjudicación de una celda?** No existe ni un caso.
   Haría falta un piloto de UNA familia × 20 controles cronometrado, para
   convertir la proyección de H-G-4 (51-217 días) en un número.
3. **¿Cuánto costó cada relevo de asiento?** Conté 4 sucesiones en 10 días
   (2026-08-20 Codex→Kimi, 08-21 Kimi→Codex, 08-23 Codex→Kimi, 08-27
   Kimi terminal 1→terminal 2, `ROADMAP:1952-1955` + `checkpoint/index.json`
   lane `authority`). El costo directo visible: el write-set de 13 archivos de
   autoridad del relevo del 23, más la brecha C4 (15 commits sin asiento y sin
   memos). No pude medir el costo indirecto (re-lectura de contexto) porque no
   hay registro de tiempo por asiento.
4. **¿El `gates:ci` local es equivalente al de CI?** El job `local_gates`
   (`ci.yml:457`) sugiere que sí para los gates, pero `core`, `showroom`,
   `visual` y `a11y` son jobs separados que no se corren localmente por lote. No
   pude confirmar si el DT corre builds completos por cohorte.
