# PRE_F4B — Inventario mecánico del gate cascade (Sonnet, READ-ONLY)

Rol: Sonnet Max, mapper mecánico PRE_F4B. Estrictamente lectura: ningún
comando de este informe escribió en el repo, hizo build/browser, ni tocó
git (stage/commit/push/stash/checkout/restore/reset). Todos los conteos
salen de ejecutar los mismos módulos que usa el gate (`classifyCascadeWiring`,
`collectSkinFiles`) más un walker de grafo adicional escrito en
`/private/tmp/claude-502/.../scratchpad/` (fuera del repo) que reutiliza
esa misma lógica de parseo, nunca una segunda regex inventada.

Working tree: rama `main`, HEAD `9d5582dfd`. El árbol tiene cambios locales
sin commitear (ver `git status` al inicio de sesión); este informe mide el
árbol **tal como está ahora mismo**, con esos cambios incluidos, porque eso
es lo real que Opus/Fable van a heredar.

---

## 0. Qué es cada artefacto (para no confundirlos)

Hay DOS nociones de "root" en el repo hoy, con vocabularios distintos y
**cero acoplamiento mecánico entre sí**:

1. **`manifest/cascade/root-catalog.json`** (64 entradas `roots[]`, 60
   canales físicos únicos tras deduplicar — `--ds-color-border` aparece en 4
   rootIds y `--ds-color-text-primary` en 2). Se construyó evaluando con
   esbuild los objetos `BrandTheme` de los tres temas (rottay/bithire/evnto)
   y clasificando 3693 "canales de pintura" por de dónde derivan. Es un
   **inventario de lectura**, no un artefacto generado: su propio campo
   `provenance.writeFence` dice literalmente *"no lo valida program-check.mjs
   ..., no lo genera generator.mjs y no participa de ningún gate"*.
   - **Esa frase está desactualizada** (hallazgo, ver §4): sí existen dos
     gates blocking que leen y validan este archivo hoy
     (`root-catalog-freshness`, `root-exposure` + su drill), añadidos
     después de que se escribiera el writeFence.
2. **`cascade-wiring-ratchet`** (`scripts/engine/cascade-wiring-ratchet/index.mjs`).
   Camina los 391 archivos `skin/*.css` reales (los que pinta el motor
   `modern` + `rustic` + los agnósticos de `presentation/components/skin/`),
   y para cada `var(--ds-X, fallback)` que encuentra, extrae por TEXTO
   cualquier `--ds-*` que aparezca dentro del fallback. Cualquier nombre que
   aparezca alguna vez dentro de un fallback ajeno se llama "root/rampa" y
   queda **excluido del denominador** (regla a del propio script). **Este
   script no importa, no lee, ni referencia `root-catalog.json` en ningún
   punto** — se verificó por lectura completa de `index.mjs` (211 líneas) y
   grep del identificador `root-catalog` dentro del archivo: cero apariciones.

Consecuencia medida en §2: la palabra "root" del ratchet es puramente
**posicional por nombre** (cualquier `--ds-X` que alguien mencione dentro de
un fallback ajeno), no una noción arquitectónica. El catálogo de 64 raíces
canónicas y las 768 "roots/rampas" que el ratchet excluye hoy son conjuntos
mayormente disjuntos.

---

## 1. Conteos actuales (medidos ahora, en vivo)

Ejecutados con `node scripts/engine/cascade-wiring-ratchet/index.mjs` y
`node --test scripts/engine/cascade-wiring-ratchet/index.test.mjs` desde
`packages/core/` — ambos en **verde**, exit 0, 10/10 tests pasan, y
coinciden exactamente con `cascade-wiring-ratchet.baseline.json` (que
también está modificado sin commitear en el árbol actual, pero coincide con
lo medido):

| Métrica | Valor | Fuente |
|---|---|---|
| Archivos skin en el corpus | 391 | `collectSkinFiles()` (modern/skin 123, rustic/skin 111, presentation/components/skin 157) |
| Sitios `var(--ds-*...)` totales | 24 913 | conteo directo sobre el corpus |
| Nombres `--ds-*` únicos leídos (`read`) | 5 142 | = todos los nodos del grafo |
| "roots/rampas" excluidos del denominador (`fallbackTargets`) | **768** | `classifyCascadeWiring().roots` |
| Denominador (lo que el gate mide) | 4 374 | `read − fallbackTargets` |
| Cableado (`wired`, alcanza algún fallback con `--ds-*` dentro) | 2 203 | |
| Deuda (`debt`, lo que el gate rachetea) | **2 171** | igual al baseline pinneado |
| Aristas del grafo nombre→nombre (edges) | 3 997 | de un walker adicional, mismo parser balanceado |
| Nombres con al menos una arista saliente | 2 605 | |
| Raíces canónicas en el catálogo (`root-catalog.json`) | 64 filas / **60 canales únicos** | |

El baseline (`cascade-wiring-ratchet.baseline.json`, también sin commitear)
pinnea `denominator: 4374`, `wired: 2203`, `debt: 2171`, `rootsExcluded: 768`
— **coincide byte a byte con lo medido en vivo**. El árbol no tiene drift
respecto a su propio baseline.

Gates consumidores confirmados (ambos blocking, ambos verdes contra el árbol
actual):
- `cascade-wiring-ratchet-drill` → `node --test scripts/engine/cascade-wiring-ratchet/index.test.mjs`
- `cascade-wiring-ratchet` → `node scripts/engine/cascade-wiring-ratchet/index.mjs`

---

## 2. Cuántos "roots" del ratchet NO pertenecen al catálogo canónico

Esta es la pregunta central del encargo. Intersección/diferencia de
`fallbackTargets` (768, calculado por el ratchet) contra los 60 canales
únicos de `root-catalog.json`:

| Conjunto | Cuenta | Lectura |
|---|---|---|
| `fallbackTargets` que SÍ son un canal canónico del catálogo | **38** | de 60 posibles |
| `fallbackTargets` que NO están en el catálogo (raíz posicional, no arquitectónica) | **730** (95,1 % de 768) | ejemplos abajo |
| Canales canónicos del catálogo que nunca aparecen como target de ningún fallback | **22** | de 60 |
| Canales canónicos del catálogo que no aparecen NI COMO LECTURA ni como target en todo el corpus skin (0 menciones) | **15** | de 60 — ver lista |
| Canales canónicos presentes en el corpus pero solo como lectura simple, nunca como destino de fallback ajeno | **7** | `--ds-color-info-ink`, `--ds-color-accent`, `--ds-motion-intensity`, `--ds-overlay-scrim`, `--ds-gradient-primary`, `--ds-button-md-radius`, `--ds-motion-spring` |

Es decir: de los 768 nombres que el ratchet trata hoy como "raíz y por eso
fuera del denominador", **solo 38 (5 %) son una raíz arquitectónica real**
según el propio inventario del repo. El otro 95 % (730 nombres) queda fuera
del denominador — y por tanto invisible para el ratchet — únicamente porque
*algún otro canal, en algún archivo, decidió usarlo como su fallback*. Este
es exactamente el "canal real tratado como raíz posicional" que ya deja
adjudicado el test `cerca PRE_F4B (C-3)` de `index.test.mjs` con su testigo
único `--ds-input-md-icon-size` — ese único ejemplo es la punta de un
conjunto de 730, no un caso aislado.

**Los 15 canales canónicos ausentes de todo el corpus skin (0 apariciones):**
```
--ds-state-hover-shift          --ds-state-active-shift
--ds-material-raised-foreground --ds-color-text-page
--ds-surface-accent             --ds-color-border-accent
--ds-control-padding-ratio-label --ds-state-selected-shift
--ds-experience-profile         --ds-control-gap-ratio
--ds-letter-spacing-body        --ds-state-pressed-shift
--ds-alpha-8                    --ds-state-checked-shift
--ds-state-expanded-shift
```
Nota de lectura: varios de estos son `por-crear`/`solo-artefacto` por
diseño según el propio catálogo (p.ej. los 6 `state.delta.*` son deltas de
interacción sin cabeza propia todavía), así que su ausencia del corpus
**no es sorpresa** — es consistente con lo que `root-catalog.json` ya
declara sobre ellos. Se listan aquí como hecho medido, no como defecto.

**Ejemplos concretos de "positional pseudo-root" (fallbackTarget que NO es
canónico)**, tomados de la lista de 730 — nombres de componente ordinarios
que otro canal usa como su propio fallback y que por eso el ratchet los
excluye del denominador:
```
--ds-color-bg-muted        --ds-color-neutral-100     --ds-surface-panel
--ds-color-text-secondary  --ds-motion-fast            --ds-radius-lg
--ds-material-card-background --ds-color-text-inverse  --ds-edge-standard-width
```
(lista completa de 730 disponible en el journal de esta sesión bajo
`scratchpad/fallback-targets.txt` menos las 38 canónicas; no se pega entera
aquí por tamaño, pero es reproducible con el comando de §5).

---

## 3. Reachability transitiva real a raíces canónicas, ciclos, missing, terminales

Se construyó (fuera del repo, en scratchpad) un grafo dirigido nombre→nombre:
arista `A → B` si algún sitio `var(--ds-A, ...)` en el corpus tiene `--ds-B`
dentro de su fallback (mismo parser de paréntesis balanceados que usa el
ratchet — un solo parser, no una segunda verdad). Sobre los 5 142 nodos se
calculó, siguiendo aristas hasta cierre transitivo, si cada nombre alcanza
alguno de los 60 canales canónicos, con detección de ciclos.

| Clase (status final del nodo) | Cuenta | Qué significa |
|---|---|---|
| `canonical-root` | 45 | el nombre ES un canal canónico (de los 60, solo 45 aparecen como nodo en el grafo — ver §2, los otros 15 no aparecen nunca) |
| `reaches-canonical-root` | 1 563 | alcanza una raíz canónica siguiendo 1+ saltos de fallback |
| `terminal-literal-fallback` | 1 259 | su fallback resuelve a un valor literal (no un `--ds-*`) y el canal SÍ tiene declaración propia en `src/` — token base legítimo, no deuda arquitectónica aunque el ratchet lo cuente como deuda si nadie más apunta a él |
| `terminal-literal-fallback-undeclared` | 1 056 | fallback literal, y el nombre **no tiene ninguna declaración `--ds-nombre:` en todo `src/`** (ni CSS ni TS de temas) — el fallback literal es la única fuente real de valor en producción |
| `terminal-bare-declared` | 1 083 | se lee siempre como `var(--ds-x)` sin fallback en ningún sitio, y sí está declarado en algún lado — cumple la ley al pie de la letra: "sin fallback = sin camino a raíz" |
| `missing-undeclared-leaf` | 68 | se lee siempre sin fallback Y no tiene declaración en ningún `src/` — lectura de una variable que nadie produce en la base DS (solo podría resolver vía artefacto compilado de tenant, si acaso) |
| `cycle` | 68 | el nombre solo alcanza raíz a través de un ciclo A→B→A (o más largo) que nunca toca un canal canónico — ver ejemplos abajo |

Suma de verificación: 45+1563+1259+1056+1083+68+68 = 5 142 = total de nodos.
No hubo ningún nodo clasificado como "missing-undeclared-sink" (nombre que
solo aparece como destino de fallback ajeno, nunca leído directamente, y sin
declaración) — esa categoría existe en el clasificador pero midió 0.

**Ejemplos de `cycle` (fallback mutuo, nunca toca una raíz canónica):**
- `--ds-glass-backdrop-filter` ↔ `--ds-modal-overlay-backdrop`
- `--ds-color-text-inverse` ↔ `--ds-tooltip-color` (con `--ds-color-text-on-primary`
  y `--ds-avatar-primary-ink` colgando de ese mismo ciclo)
- `--ds-motion-calm` ↔ `--ds-motion-reveal`

Nota metodológica: esto NO significa que la cascada real (evaluada por el
navegador) esté rota — en runtime cada propiedad tiene su propio valor
declarado y el fallback solo se usa si la propiedad está indefinida. Es un
hallazgo de **estructura del grafo de nombres**: estos pares nunca resuelven
a una cabeza canónica siguiendo el fallback declarado, solo se apuntan entre
sí. Si algún día ambos quedan sin declaración, no hay red de seguridad hacia
una raíz.

**Ejemplos de `missing-undeclared-leaf` (leído, sin fallback, sin productor
en `src/`):**
```
--ds-color-bg-base       --ds-overlay-modal-radius   --ds-tour-mask-color
--ds-cascader-radius     --ds-cascader-bg            --ds-cascader-border
--ds-cascader-border-error  --ds-cascader-border-warning
```

**Ejemplos de `terminal-literal-fallback-undeclared` (fallback literal, cero
productor):**
```
--ds-activity-log-padding   --ds-affix-runtime-z-index   --ds-z-affix
--ds-z-index-affix          --ds-affix-affixed-radius    --ds-affix-affixed-backdrop
--ds-alert-dialog-motion-offset  --ds-alert-dialog-motion-scale
```

**Terminales "externos/invariantes" (fallback literal, con declaración
propia — leyes de forma, no deuda de arquitectura):**
```
--ds-radius-lg   --ds-spacing-5   --ds-motion-fast   --ds-motion-ease-out
--ds-color-neutral-100   --ds-color-neutral-50
```

---

## 4. Hallazgo de higiene documental (no arquitectónico, no adjudicado)

- `root-catalog.json.provenance.writeFence` afirma que el archivo "no
  participa de ningún gate". Medido falso hoy: `root-catalog-freshness`,
  `root-exposure-drill` y `root-exposure` son blocking en
  `scripts/ci/gates-manifest/index.mjs` (líneas 489–508) y ambos corren en
  verde contra el árbol actual:
  - `root-catalog-freshness-gate: OK — 64 roots agree with src/ (47 existe, 10 por-crear, 7 solo-artefacto)`
  - `root-exposure-gate OK -- 26 tenant-dial, 28 internal-head, 10 gap`
- `method.roots` y `reconciliation.statement` siguen diciendo "63 raíces"
  aunque el array tiene 64 entradas desde F4A-6 (`tier.page.ink`). El propio
  bloque `corrections` del archivo ya documenta este drift con sus propias
  palabras — no es un hallazgo nuevo, se repite aquí solo para que quede
  junto al resto de números de esta medición.
- `manifest/generator/index.mjs` solo hashea `root-catalog.json` (SHA de
  provenance), no lo valida semánticamente.
- Ninguno de los tres gates que sí leen `root-catalog.json`
  (`root-catalog-freshness`, `root-exposure`, `f0-honesty-gates` que testea
  al primero) compara nada contra `cascade-wiring-ratchet`. Los dos mundos
  del §0 siguen sin cruzarse mecánicamente en ningún gate hoy.

No se adjudica qué hacer con esto — solo se deja medido para que F4B no
diseñe asumiendo un writeFence que ya no es cierto.

---

## 5. Footprint de archivos y comandos read-only seguros

Archivos inspeccionados (todos leídos, ninguno escrito):
```
packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs
packages/core/scripts/engine/cascade-wiring-ratchet/index.test.mjs
packages/core/scripts/engine/cascade-wiring-ratchet/cascade-wiring-ratchet.baseline.json
packages/core/scripts/lib/engine/skin-files/index.mjs
packages/core/manifest/cascade/root-catalog.json
packages/core/manifest/cascade/roots/*.json            (20 archivos)
packages/core/scripts/ci/gates-manifest/index.mjs
packages/core/scripts/tokens/root-catalog-freshness-gate/index.mjs
packages/core/scripts/tokens/root-exposure-gate/index.mjs
packages/core/scripts/ci/f0-honesty-gates/index.test.mjs
packages/core/manifest/generator/index.mjs             (solo grep puntual)
```

Comandos usados (todos de solo lectura o ejecución de scripts que solo leen
`src/`/`manifest/` y escriben nada más que stdout — verificado leyendo cada
script antes de ejecutarlo):
```bash
git status --short <paths>                # lectura de estado, no toca árbol
git diff --stat -- <paths>                 # lectura
git diff -- <paths>                        # lectura
git log -1 --oneline -- <paths>            # lectura
git rev-parse HEAD                         # lectura

node packages/core/scripts/engine/cascade-wiring-ratchet/index.mjs
node --test packages/core/scripts/engine/cascade-wiring-ratchet/index.test.mjs
node packages/core/scripts/tokens/root-catalog-freshness-gate/index.mjs
node packages/core/scripts/tokens/root-exposure-gate/index.mjs

jq '...' packages/core/manifest/cascade/root-catalog.json   # lectura estructurada
grep -rl "cascade-wiring-ratchet" packages/core ...          # lectura
grep -rhoE -- "--ds-[a-zA-Z0-9_-]+\s*:" .../src --include='*.css'  # lectura, vía execSync/BSD grep real

# grafo de reachability: script node standalone en /private/tmp/.../scratchpad/,
# importa SOLO collectSkinFiles() y classifyCascadeWiring() del repo (lectura),
# escribe su resultado únicamente bajo scratchpad/, nunca bajo el repo.
```

**Advertencia de entorno, no del repo:** el `grep` interactivo de esta shell
está envuelto (función bash) para invocar `ugrep`, cuyo flag `--include`
tiene semántica distinta y emitió warnings cuando se probó a mano
(`ugrep: warning: --include=*.css: No such file or directory`). Los conteos
de este informe **no** usan ese `grep` de la shell interactiva: usan
`execSync` de Node, que resuelve al `grep` real de `/usr/bin/grep` (BSD
grep 2.6.0-FreeBSD) dentro del subshell de Node, confirmado explícitamente
(`grep (BSD grep, GNU compatible) 2.6.0-FreeBSD`). Si alguien reproduce estos
números tecleando `grep --include=...` directamente en una shell interactiva
de este repo, puede obtener resultados distintos por este motivo — usar
`find ... -name '*.css' | xargs grep` o invocar desde un script Node/execSync
para reproducir exactamente estas cifras.

---

## 6. Tests que mutan source / riesgo de carrera

- **Ya resuelto, con evidencia histórica**: el commit `003b8f7ba` ("drill de
  cascade-ratchet planta en tmpdir") corrigió exactamente este riesgo. Antes,
  el drill escribía y borraba un archivo real bajo
  `src/foundation/tokens/css/presentation/components/skin/`, lo que producía
  ENOENT determinista en `app-ds-hook-contract-gate/index.test.mjs` corriendo
  en paralelo (carrera de lectura/escritura sobre el mismo árbol).
- **Estado actual verificado por lectura de código** (no solo por el mensaje
  del commit): `index.test.mjs` §`withPlantedCss()` crea un
  `mkdtempSync(join(tmpdir(), 'cascade-ratchet-drill-'))`, escribe el CSS
  sintético únicamente ahí, llama `collectSkinFiles(sandbox)` con la raíz
  sandbox explícita, concatena con el corpus real (`collectSkinFiles()` real,
  sin argumento) y borra el tmpdir en un bloque `finally`. **Cero escritura
  bajo `src/` en las 10 pruebas del archivo.**
- `collectSkinFiles(root)` acepta un `root` opcional precisamente para
  soportar este patrón sandbox (comentario propio del archivo lo confirma).
- `f0-honesty-gates/index.test.mjs` usa el mismo patrón (`runOnSyntheticTree`,
  nombre lo indica) para probar `root-catalog-freshness-gate` — tampoco toca
  `src/` real, se verificó por lectura de las dos pruebas relevantes.
- No se encontró ningún test activo en el perímetro de este gate (ratchet +
  root-catalog + sus dos gates freshness/exposure) que escriba en el árbol
  real hoy. El único riesgo de carrera conocido en esta zona ya está cerrado
  y su cierre está documentado en el propio código (no es una promesa de
  commit message sin verificar — se leyó el mecanismo).

---

## Verdict

**INVENTORY_READY**

SHA de referencia:
- HEAD: `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`
- `root-catalog.json` (working tree, incluye cambios sin commitear): sha256
  `6a0e68de3789a5c7b5751582cd485d42b8d71861bc014b7be4a585c04a963e9a`
- `cascade-wiring-ratchet.baseline.json` (working tree): sha256
  `add8f6edc56fdcef6c3e16bd39d2190d96505bb19c1a2ad7b99e77d4bb970665`
- `cascade-wiring-ratchet/index.mjs` (working tree, sin cambios locales):
  sha256 `bf07d4343e0adc85ddd77290ee8a36be7811ff8333da0e475b3ce13e9c1cb99d`

No se adjudicó arquitectura ni se reancló ningún número. Todo lo anterior es
medido en vivo contra el árbol actual (con sus cambios locales incluidos) el
2026-08-22, reproducible con los comandos de §5.
