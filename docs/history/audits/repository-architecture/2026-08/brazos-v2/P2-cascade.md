# P2 — Reconciliación de los clasificadores de cascada y namespace `--_ds-*`

HEAD verificado: **al inicio `dcc44a6093de0ba4f9dcbdb733ae467008cffb21`; al final `f166570d92433fe1437133975732003c1fd29a32`** — otro agente commiteó durante mi corrida (`ecdc01a61` MICROFIX schemaVersion + `f166570d9` asiento §13). `git diff --name-only dcc44a6..HEAD` toca 3 archivos: `docs/history/programs/architecture-refactor/2026-08/execution/index.md` y los dos de `public-entrypoint-boundary-gate/`. Filtrado por las superficies que medí (`tokens/css|scripts/engine/cascade|scripts/tokens|manifest/|brand-themes|styles/`) = **0 archivos**. Re-corrí el ratchet en el HEAD nuevo: idéntico. **Todas las cifras valen para los dos SHA.**

git status inicial: 2 modificados ajenos en `public-entrypoint-boundary-gate/` + `?? docs/reauditoria-cloud/`. git status final: sólo `?? docs/reauditoria-cloud/` (los 2 ajenos entraron en el commit ajeno). **Cero escritura mía sobre el repo.** Todos los artefactos de trabajo en scratchpad.

---

## Reproducción (hecho base, comando → salida)

### 1. `cascade-wiring-ratchet` (read-only confirmado leyendo la fuente: sólo `readFileSync`, `main()` imprime y sale)

```
$ node scripts/engine/cascade-wiring-ratchet/index.mjs
cascade-wiring-ratchet OK -- 2169 names still unwired of 4373 (2204 reach a root;
769 roots/ramps excluded from the denominator; 391 skin files)      EXIT=0
```

Corpus (`collectSkinFiles()`, `scripts/lib/engine/skin-files/index.mjs`): camina `src/foundation/tokens/css/runtime/engines/**` + `src/foundation/tokens/css/presentation/components/skin/**` y se queda con `.css` cuya ruta contiene `/skin/`.

| bucket | archivos |
|---|---|
| `engines/modern/skin` | 123 |
| `engines/rustic/skin` | 111 |
| `presentation/components/skin` | 157 |
| `engines/classic` | **0** (tiene 1 css, sin carpeta `skin/`) |

**El corpus excluye por construcción todo archivo donde se declaran raíces**: `foundation/themes/*`, `presentation/components/*.css` (los no-skin), `facade/artifacts/*`, `foundation/base`, `foundation/responsive`. El gate no puede ver una declaración aunque quisiera.

### 2. Desglose 840/1329 (importando `classifyCascadeWiring` + `varCalls`, sin tocar el gate)

```
debt total 2169 | sin fallback en NINGUNA ocurrencia 840 | con fallback en alguna 1329
```
Reproduce exacto a Cloud, incluido el top-10 por fan-out.

### 3. `root-membership --check` (contrato CLI: `--check` es el defecto, `buildMembership()` es pura)

```
$ node scripts/tokens/root-membership/index.mjs --check
root-membership: OK — 1610 canales, 881 con raiz, digest 2c525e4f43c1     EXIT=0
stats.byVia: {unattributed:729, governed-owner-table:495, declared-fallback:344, head-exact:42}
```
Universo declarado en su propia `law`: *"un CANAL `--ds-*` emitido por al menos un slot autorado de los tres brand themes"*. **1610/881/729 reproduce exacto.**

### 4. `channel-liveness-gate` (modo reporte humano, sin `--write`)

```
universe=440 declaredOverride=290 declaredReference=392 emitted=117
LIVE_MODERN_PAINTED 394 + LIVE_FROZEN_ENGINE_PAINTED 1 + LIVE_EXTERNAL_CONSUMER_PAINTED 12 = 407 LIVE
READ_NO_PRODUCTIVE_TERMINAL 3 + READ_UNPROVEN 1 + AUTHORABLE_UNPROVEN_EFFECT 25 + UNREAD_EMITTED_NO_KNOWN_ROUTE 4 = 33 no-LIVE
channel-liveness-gate FAIL -- 48 finding(s)
```
**440/407/33/48 reproduce exacto.** `analysisLimitations: []`.

### 5. Checkpoint stale (tarea 6)

```
checkpoint/index.json:4  → "channel-liveness (49 findings)"
README.md:248             → "channel-liveness (49 findings)"
corrida en vivo           → 48
```
**Stale por uno. CONFIRMADO.**

---

## Qué es "root" para el ratchet — demostrado desde el código

`classifyCascadeWiring()` (`index.mjs:88-125`), una sola pasada:

- `read` = todo nombre que es **primer argumento** de un `var(` en el corpus.
- `fallbackTargets` = todo `--ds-*` que aparece **en cualquier lugar del texto de un fallback**. El script los llama "roots/ramps".
- `reachesRoot` = el nombre tiene ≥1 sitio de lectura cuyo fallback contiene ≥1 `var(--ds-…)`.
- `denominator = read \ fallbackTargets` · `debt = denominator \ reachesRoot`.

No hay lista de raíces canónicas, no se lee `:root`, **no se lee ninguna declaración**, y no hay transitividad (es un chequeo de un solo paso). **Codex tiene razón, y es literal: "root" = cualquier target de fallback.**

Dos controles de falsación (archivos sintéticos en scratchpad, `classifyCascadeWiring(files)` acepta el corpus por parámetro; nada escrito en el repo):

```
CONTROL A  .a { color: var(--ds-foo, var(--ds-totally-invented-never-declared-anywhere)); }
  fallbackTargets("raices") = --ds-totally-invented-never-declared-anywhere
  denominator = --ds-foo      debt = (vacio)
→ apuntar a un nombre que NO EXISTE en ningún lado del repo deja el canal "cableado"
  y promueve al nombre inventado a "raíz" (sale del denominador).

CONTROL B  :root { --ds-bar: red; }   .b { color: var(--ds-bar); }
  denominator = --ds-bar      debt = --ds-bar
→ un canal DECLARADO en :root en el MISMO archivo, leído sin fallback, es DEUDA.
```

Corroboración empírica sobre el árbol real: **69 de los 769 nombres que el ratchet excluye como "roots/ramps" no tienen productor en ningún plano** (ni declaración CSS en `src`, ni en el bundle, ni en el artefacto de tenant, ni productor TSX). Son "raíces" sólo porque alguien las escribió dentro de un fallback.

El propio `cascade-wiring-ratchet.baseline.json` ya documenta el defecto (`rootsExcludedNote`: `--ds-input-md-icon-size` es un canal real con declaración base y emisión de tema que el ratchet trata como raíz posicional; reconstrucción "diferida a PRE_F4B").

---

## Reconciliación sobre el mismo universo

Los tres instrumentos **no comparten universo y casi no se solapan**.

| instrumento | unidad | N |
|---|---|---|
| cascade-wiring-ratchet | nombre leído como 1er arg de `var(` en 391 archivos de skin | 5142 read → 4373 denominador → 2169 deuda |
| root-membership | canal `--ds-*` emitido por ≥1 slot autorado de los 3 brand themes | 1610 → 881 con raíz / 729 sin atribuir |
| channel-liveness | `TENANT_THEME_OVERRIDE` ∪ `REFERENCE` ∪ nombres concretos del compilador | 440 → 407 LIVE / 33 no-LIVE |

**(a) 2169 vs 1610**

```
debt ∩ root-membership(1610) = 323   (14.9%)
debt \ root-membership       = 1846  (85.1%) → canales de componente que NINGÚN compilador de tenant emite
debt ∩ withRoot(881)         = 170   ← CONTRADICCIÓN DIRECTA entre los dos instrumentos
debt ∩ withoutRoot(729)      = 153
root-membership 1610: 1279 se leen en skins · 331 nunca · 412 caen en el bucket "roots" del ratchet · 867 en el denominador
```

Los **170** que el ratchet llama "sin camino a raíz" y root-membership sí atribuye: 165 por `governed-owner-table`, 2 por `declared-fallback` y **3 por `head-exact`** — o sea, el canal *es* la cabeza declarada de una raíz del catálogo y el ratchet lo cuenta como huérfano:

```
head-exact | --ds-color-accent      -> ramp.seed.accent
head-exact | --ds-gradient-primary  -> gradient.recipe
head-exact | --ds-motion-intensity  -> motion.intensity
```

**(b) 729 sin atribución vs 2169**

```
729 ∩ debt = 153 (21.0%) · ∩ roots excluidas = 189 · ∩ wired = 188 · nunca leídos en skins = 199
```

**(c) 33 no-LIVE vs ambos**

```
33 ∩ debt = 0 · ∩ denominador = 0 · ∩ read = 0 · ∩ fallbackTargets = 0
33 ∩ root-membership = 22 (21 de ellos sin atribución)
440 ∩ read(ratchet) = 239 · 440 ∩ debt = 57
```
**Cero solape.** Los 33 no-LIVE ni siquiera se leen en el corpus de skins. Son dos problemas disjuntos.

**(d) Los 840 "sin fallback" — planos de producción**

Método: postcss `walkDecls` sobre los **473 `.css` de `src`** (declaración real, no regex sobre texto crudo) + declaraciones en los bundles `styles/*.css` + los 3 artefactos compilados `facade/artifacts/{rottay,bithire,evnto}/index.css` (`GENERATED — do not edit`, salida de `compileBrandTheme`) + forma de productor en TS/TSX de producción de los 4 repos (`'--ds-x':` / `setProperty('--ds-x',` / `vars['--ds-x']` / `['--ds-x' as any]:`, 10.364 archivos, tests separados).

| | 840 sin fallback | 1329 con fallback | 2169 total |
|---|---|---|---|
| declarado en `src/**/*.css` | **706 (84.0%)** | 254 (19.1%) | 960 (44.3%) |
| …de esos, en selector `:root`-ish | 583 | — | 749 |
| declarado en bundle `styles/*.css` | 706 | 227 | 933 |
| emitido en artefacto de tenant | 234 | 122 | 356 |
| sin decl. CSS pero con productor TSX | 70 | 144 | 214 |
| **sin productor en NINGÚN plano** | **64 (7.6%)** | **960 (72.2%)** | 1024 (47.2%) |
| …de esos, tocan modern | **0** | 760 | 760 |

Por engine, los 64 sin productor de los 840: **`{rustic: 64}`**. Cero en modern.

Sub-corte del subconjunto que importa (los 494 de los 840 que sí se leen en el engine modern):

```
declarados: 333 presentation/components (base global) · 126 artefacto de tenant compilado
            80 el propio modern/skin · 66 foundation/themes (raíz global) · 12 foundation/base · …
sin decl. CSS pero con productor TSX inline: 13
sin decl. CSS y sin productor:               0
declarados EXCLUSIVAMENTE en scope rustic:   0   (no hay desajuste de scope)
```

**Muestra de 20 al azar de los 840** (`shuf -n 20 --random-source=<(yes 42)`), clasificada a mano: 16 declarados en `src` CSS **y** presentes en el bundle; 2 con productor TSX inline real (`--ds-header-icon-tone-bg` en `structures/headers/{form,edit}/index.tsx:232,307`; `--ds-skeleton-shape-radius` en `Skeleton/engines/{modern,rustic}/index.tsx:180,200`); **2 huérfanos genuinos, los dos sólo-rustic** (`--ds-treeselect-border`, `--ds-cascader-bg`). 18/20 tienen productor real.

**Control positivo del parser de declaración**: `--ds-envtoggle-accent` (el control del propio Cloud) → está en `debt` ✓, está en los 840 ✓, **no** en declared-css ✓, **no** en bundle ✓, sí en TS ✓. El parser detecta la ausencia cuando la ausencia existe.

**El top-10 por fan-out de Cloud, verificado uno por uno** (los 5 marcados `fallback=no`):

| nombre | declaración | en `styles/rottay.css` |
|---|---|---|
| `--ds-elevation-surface-3` (36×) | `foundation/themes/default.css:831` — `color-mix` de `--ds-color-bg-elevated` × `--ds-elevation-lift-strength` | sí |
| `--ds-color-primary-600` (23×) | los 3 artefactos de tenant + fixtures | sí (3×) |
| `--ds-state-press-scale` (23×) | `foundation/themes/default.css:876` | sí |
| `--ds-stepper-current-item-size` (19×) | **4 declaraciones en el mismo archivo que lo lee** (`modern/skin/stepper.css:67,74,81,233`), y la declaración misma encadena `var(--ds-stepper-item-size-md, 32px)` | sí (4×) |
| `--ds-steps-current-item-size` (19×) | `modern/skin/steps.css:59,65,202`, idem | sí (3×) |

Los 5 son canales cableados y pintados. Ninguno es huérfano.

---

## Re-clasificación honesta de la deuda de modern

De los 2169, **1499 tocan modern**; 670 (30.9%) no aparecen nunca en modern (302 sólo-rustic, 365 sólo-presentation, 3 presentation+rustic).

```
MODERN debt = 1499
  A. sin productor Y sin fallback  → unset real, cero pintura ......    0
  B. sin productor, con literal    → el hardcode es el único valor ..  760
  C. con productor (CSS/tenant/TSX)→ falso positivo del ratchet .....  739
```

Corpus completo: clase A = 64 (todas rustic), clase B = 960, clase C = 1145.

---

## Adjudicación por afirmación

| Afirmación | Quién | Cifra reproducida | Interpretación | Veredicto | Quién tenía razón |
|---|---|---|---|---|---|
| `cascade-wiring-ratchet` = 2169/4373 sin camino a raíz, 391 skin files | Cloud | **2169/4373/391 exacto** | el número es correcto y el gate corre limpio | **CONFIRMADA (el hecho)** | Cloud, Codex y Kimi coinciden |
| 840 sin fallback / 1329 con fallback | Cloud | **840/1329 exacto** | reproduce importando `classifyCascadeWiring` | **CONFIRMADA (el hecho)** | Cloud |
| "de los 840, si el nombre nunca se declara, cae a `unset`, falla silenciosa, cero pintura" | Cloud | 706/840 (84%) SÍ declarados; **64 sin productor, todos rustic; 0 en modern** | el antecedente es falso para el 92,4 % | **REFUTADA** | Codex (en espíritu); nadie midió esto |
| "la mitad de la pintura de componente es inalcanzable para un dial" / "no hay ningún punto donde un tenant pueda intervenir" | Cloud | 356 de los 2169 son **emitidos por el compilador de tenant** (rottay 296, bithire 214, evnto 83); 170 tienen raíz canónica atribuida por root-membership | falso por construcción | **REFUTADA** | Codex |
| Los 1329 con literal "no dejan el navegador en blanco" → clase leve | Cloud | 960/1329 (72,2 %) **sin productor alguno**, 760 en modern | es la clase GRAVE, no la leve — la severidad está invertida | **REFUTADA (inversión)** | ninguno de los tres |
| RC-03 BLOQUEANTE, "drenar 2169 por fan-out" | Cloud | — | cola inválida: 739 de la parte modern son falsos positivos, 670 no son modern | **REFUTADA en su formulación** | Codex |
| "el ratchet llama raíz a cualquier target de fallback" | Codex | demostrado en fuente (`fallbackTargets`) + control A + 69/769 excluidas sin productor | exacto y literal | **CONFIRMADA** | Codex |
| "clasifica fallbacks, no productores ni alcance a raíz canónica" | Codex | control B: canal en `:root` del mismo archivo = deuda | exacto; el corpus ni siquiera incluye los archivos de raíz | **CONFIRMADA** | Codex |
| `root-membership` = 1610 / 881 / 729 | Codex | **exacto** (`--check` EXIT=0, digest ok) | universo = canal emitido por ≥1 slot autorado de los 3 brand themes | **CONFIRMADA** | Codex |
| `channel-liveness` = 407/440 LIVE, 33 no-LIVE, 48 findings | Codex | **exacto** | universo = override ∪ reference ∪ emitido-concreto | **CONFIRMADA** | Codex |
| "el checkpoint dice 49 → stale por uno" | Codex | 48 en vivo vs 49 en `checkpoint/index.json:4` y `README.md:248` | exacto | **CONFIRMADA** | Codex |
| "no convertir 2169 en cola" | Codex | — | correcto; la cola honesta es 760 (modern) / 960 (corpus) | **CONFIRMADA** | Codex |
| "reconciliar sobre el mismo universo antes de cualquier cola" | Kimi | hecho: solape 323/2169, 153/729, **0/33** | correcto y necesario; los universos son casi disjuntos | **CONFIRMADA** | Kimi |
| `--_ds-*`: 196/380 consumidos sin declaración → `unset` | Cloud | **196 reproduce SÓLO con regex sobre texto SIN stripear comentarios** | 2 de esas "declaraciones" están dentro de comentarios | **CONFIRMADA CON CORRECCIÓN → 198** | Codex |
| `--_ds-*`: 198 sin declaración, 194 con fallback en toda lectura, 4 con productor TSX | Codex | **198 / 194 / 4, exacto** | los 4: `--_ds-dropdown-arrow-anchor-offset`, `--_ds-grid-column-gap`, `--_ds-grid-row-gap`, `--_ds-toast-undo-ring-circumference` — los 4 con productor TSX real | **CONFIRMADA** | Codex |
| "no existe el bug runtime masivo de `--_ds-*`" | Codex | exposición runtime = **0** | queda un defecto de gobierno, no de pintura | **CONFIRMADA** | Codex |

### El 196 vs 198, cerrado byte a byte

```
regex CRUDO (con comentarios):        declared=184 consumed=378 union=380 cnd=196  ← Cloud, exacto
regex con comentarios STRIPEADOS:     declared=182 consumed=377 union=380 cnd=198
postcss walkDecls (declaración real): declared=182 consumed=377 union=380 cnd=198  ← correcto
```
Las 2 "declaraciones" que sólo viven en comentarios:
- `--_ds-saved-views-active-rule` → `runtime/engines/modern/skin/saved-views.css`
- `--_ds-textarea-resize-grip-ink` → `runtime/engines/modern/skin/textarea.css`

El propio encabezado de método de `C-cascade.md` dice *"comentarios `/* */` siempre stripeados antes de censar código"*. En este censo no se aplicó. **198 es la cifra correcta.**

El productor del 4.º nombre, que exige la forma de clave computada:
`src/ui/primitives/feedback/Toast/compound/UndoToast/index.tsx:232` → `['--_ds-toast-undo-ring-circumference' as any]: \`${RING_CIRCUMFERENCE}px\`` , consumido en `presentation/components/skin/toast-compounds.css:68`.

---

## Causalidad y severidad

`gate rojo → defecto de runtime` no se sostiene aquí en ninguna de las dos afirmaciones bloqueantes.

- **Cascada.** Cadena completa productor → canal → consumidor, para el subconjunto que Cloud declara roto (los 494 de los 840 que se leen en modern): 481 tienen declaración CSS (333 en base global `presentation/components`, 126 en el artefacto de tenant compilado, 80 en el propio skin modern, 66 en la raíz global `foundation/themes`), 13 tienen productor TSX inline, **0 no tienen nada**, y **0 dependen de un scope rustic**. La severidad real de "cero pintura" en modern es **cero canales**.
- **Deuda real.** La que queda es de otra clase: **760 canales de modern con literal de último recurso y ningún productor detrás** — el literal *es* el valor, no hay dial. Es exactamente la óptica 25 de Cloud ("el hardcode que gana si falla el tenant"), y es un hallazgo legítimo — pero es la clase que Cloud calificó de leve, y son 760, no 2169.
- **`--_ds-*`.** 194/198 tienen fallback en **toda** lectura (el navegador nunca ve `unset`); los 4 restantes tienen productor TSX de producción. Exposición runtime = 0. Lo que queda es que no existe gate que exija productor para el namespace privado — gobierno, no pintura.
- **Instrumento que manda.** Para "¿a qué raíz pertenece este canal?" manda `root-membership` (universo nombrado, 3 vías fail-closed, digest, `--check` verde). Para "¿este canal pinta?" manda `channel-liveness` (grafo PostCSS canal → prop privada → propiedad terminal, con consumidor externo real). `cascade-wiring-ratchet` no mide ninguna de las dos: mide **forma de fallback**, y sólo eso.

---

## Fix correcto (tipo, sin implementar)

1. **Reconstruir el clasificador de raíz** — es el bloqueo PRE_F4B que el propio baseline documenta. Las raíces salen de `manifest/cascade/root-catalog.json`, no del texto de un fallback; y el gate debe leer **declaraciones** sobre todo `src/**/*.css` + los 3 artefactos de tenant, no sólo lecturas en `/skin/`. Los dos controles de este informe (A y B) sirven como drills anti-coincidencia del clasificador nuevo.
2. **Re-anclar el ratchet sobre la clase B** (sin productor, con literal): 960 corpus / 760 modern. Ese sí es un trinquete que baja cuando alguien cablea bien.
3. **Gate de contradicción cruzada**: falla si un nombre es deuda del ratchet *y* tiene raíz atribuida por root-membership. Hoy dispararía con **170** filas, 3 de ellas `head-exact`. Es la prueba falsable de que el clasificador viejo miente.
4. **Separar el alcance por engine** en cualquier cola: 670 de los 2169 no son modern.
5. **`--_ds-*`**: gate de productor/consumidor para el namespace privado (198 filas), con la regla real — "consumido sin declaración CSS **y** sin productor TSX **y** sin fallback en alguna lectura" (hoy: **0**), y el resto como deuda de gobierno declarada.
6. **Corregir el checkpoint** 49 → 48 (`checkpoint/index.json:4`, `README.md:248`).

### Fixes que NO deben ejecutarse

- Abrir una cola de "drenar 2169". 739 de la porción modern son falsos positivos del instrumento y 670 no son modern.
- Tratar los 840 como bug de runtime, ni "declarar" los 706 que ya están declarados.
- "Revisar primero" `--ds-elevation-surface-3` o `--ds-color-primary-600` por huérfanos: el primero está declarado en la raíz global derivando de dos canales, el segundo es un dial emitido en los tres artefactos de tenant.
- Cualquier remediación de `--_ds-*` justificada como arreglo de `unset`.
- Subir el baseline del ratchet (decrease-only) o dar el gate por sano: hoy pasa verde midiendo forma de fallback.

---

## Hallazgos nuevos que ninguno de los tres vio

1. **La regla (a) hace "cableado" infalsificable.** Escribir *cualquier* `--ds-nombre` dentro de un fallback lo convierte en "raíz" y lo saca del denominador. Control A lo prueba con un nombre inventado; empíricamente, **69 de las 769 "raíces" no tienen productor en ningún plano**. El ratchet se puede llevar a deuda 0 sin tocar una sola declaración.
2. **El corpus excluye por construcción los archivos de raíz.** Sólo entran rutas con `/skin/`. `foundation/themes/*`, `presentation/components/*.css`, `facade/artifacts/*` quedan fuera: el gate estructuralmente no puede ver la raíz que busca.
3. **Inflación de alcance del 30,9 %**: 670 de los 2169 nunca aparecen en modern (302 rustic-only, 365 presentation-only, 3 presentation+rustic). Cloud sí dice "corpus completo, no sólo modern" en H-C-1, pero después lo interpreta como "la mitad de la superficie de pintura de componente" en un programa cuyo objeto es modern.
4. **Severidad invertida.** El corte 840/1329 de Cloud ordena las dos clases al revés: la clase "sin fallback" es 92,4 % benigna y la clase "con literal" es 72,2 % sin productor.
5. **Contradicción cruzada medible de 170 nombres** entre dos instrumentos vivos del mismo programa, 3 de ellos `head-exact`. Nadie la había calculado; es la forma más barata de gate falsable.
6. **`channel-liveness.emitted = 117` es un sub-conteo severo**: 36 de sus 48 findings son `unresolved emission pattern` sobre asignaciones interpoladas del compilador (`vars[\`${prefix}-background\`]`, `vars[\`--ds-color-${role}-${step}\`]`, `vars[\`--ds-text-${name}-size\`]`, …) — que son justamente las rutas de emisión masiva. El gate es honesto al declararlo, pero su universo de 440 **no es** "la superficie de canales de tenant" y no debe leerse así.
7. `--ds-color-primary-600`, el candidato "a revisar primero" de Cloud, está declarado en los tres artefactos de tenant y en las fixtures: es un dial de tenant, exactamente lo contrario de un huérfano.
8. El artefacto R1 `artifacts/quality/programs/modern-rescue/checkpoints/reference-grammar/button-action-cluster/2026-08-05/channel-liveness.json` **no existe todavía** (el gate lo dice como nota no bloqueante). Los 48/49 que circulan en docs no tienen artefacto de respaldo escrito.

---

## Lo que no pude cerrar

- **"Declarado ⇒ resuelve" no lo probé por computed style.** Verifiqué que 0 de los 494 nombres modern-relevantes se declaran exclusivamente en scope rustic y que todos caen en `:root`-ish o en base de componente, pero no corrí sonda de DOM/computed. Para cerrar la clase C con evidencia de pintura hace falta una sonda como la de `channel-liveness` extendida a estos nombres.
- **No expandí los 36 patrones de emisión interpolados** del compilador de brand-theme; hasta hacerlo, no se puede afirmar cuántos canales emite realmente el tenant (117 es piso, 1760 en artefacto compilado es el techo observado, 1610 es lo que ve `slot-inventory`).
- **No adjudiqué si los 64 huérfanos rustic importan.** Rustic puede estar congelado; la pregunta es de dueño de programa, no de medición.
- **No corrí `channel-liveness --check`** (exige el artefacto R1, que no existe: fallaría por ausencia, no por estado). El modo reporte da el mismo cómputo.
