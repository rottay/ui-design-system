# F4A-close — Adjudicación READ-ONLY (Claude Opus, architecture integrator)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**HEAD apertura:** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · `git status --porcelain` vacío · staged 0
**Insumo principal:** `/private/tmp/f4a-close-sonnet-inventory.md` SHA-256 `d52f36ac4a086bc3f196255573c0d4203032b194bd09685c32a7d569998abd87` — **coincide exacto con el prompt**.
**Insumos de precedencia (hasheados por mí esta sesión):**
- K4 v3 `f4a-14a-opus-implementation-brief-v3.md` = `06ecaa76c0a54b018fa91ca5d1bc68326e83e0af8af49c7779361a9ec0622ff1`
- Fable K4 v3 `f4a-14a-v3-fable-reaudit.md` = `22c39c6de36f75cd78e53f192f00106af249db033cd20a0e3f559d41cc0f5918` — **VERDICT: ACCEPT** (línea 3)
- K5 v2 `f4a-15-k5-final-decision-packet-opus-v2.md` = `c29bf3fbfd5cdbf81b106d595c70c4572b2864549fdc52746aaf951f27a3ae15`
- Fable K5 v2 `f4a-15-k5-final-packet-v2-fable-ratification.md` = `d2554c9068836bd364e18d979c058ac8e416871d607bdff16220fbbb3cc3fe20` — **VERDICT: ACCEPT** (línea 3)

Los SHA de K4 v3 y del ACCEPT Fable K4 que yo calculé coinciden **byte-exactos** con los que el prompt Kimi `f4a-14a-v3-kimi.prompt.txt` declara. Cadena de precedencia íntegra.

**Rol:** integrador de arquitectura, READ-ONLY. Cero writes al repo, cero tests/build/generadores/browser, cero git mutante, cero prompts a otros panes. Único write-set: este memo y su `.ready`.

---

## 0. Verificación del bloqueo Kimi (instrucción explícita del prompt)

El prompt K4 v3 a Kimi autoriza exactamente dos archivos de salida:
`/private/tmp/f4a-14a-v3-kimi-preaudit.md` y `/private/tmp/f4a-14a-v3-kimi-preaudit.ready`.

**Ninguno de los dos existe.** `ls /private/tmp | grep -i kimi` devuelve sólo *prompts* emitidos
(`f4a-14a-v3-kimi.prompt.txt`, `f4a-15-k5-final-kimi.prompt.txt`, `f4a-15-k5-v2-kimi.prompt.txt`,
`f4a-15-k5-kimi-design-challenge.prompt.txt`) y un artefacto de datos viejo (`c1-kimi-antes.json`, 2026-08-20).
`ls *.ready | grep -i kimi` → vacío.

**VERIFICADO POR AUSENCIA: Kimi no respondió ni a K4 v3 ni a K5.** El bloqueo que declara el inventario es real.
Si algún prompt externo afirma lo contrario sin memo+flag, **es falso** y así queda documentado aquí.

---

## 1. Auditoría ítem por ítem de §1.A — el denominador 13 NO se acepta como está

Verifiqué las 13 citas contra el árbol. **Las citas son exactas**; la *clasificación* no lo es en 3 filas,
y el conjunto está **incompleto** en 3 más. Cierre mínimo COMPLETO ≠ 13.

### 1.1 Confirmados MUST_F4A_CLOSE (10)

| # | Ítem | Veredicto | Evidencia mía |
|---|---|---|---|
| 1 | Ratchet a tolerancia cero (33/40) | **MUST** | `ROADMAP:1725-1729` leído verbatim: "F4A-close mío: ratchet a tolerancia cero + gate de paridad real … + gates:ci final + auditoría Fable del frente" |
| 2 | Gate `realKeypathParity` | **MUST** | ídem; `baseline.json:8` fija la semántica |
| 3 | `gates:ci` final verde | **MUST** | ídem; conté el manifiesto: **90 gates = 88 blocking + 2 excluded** (`channel-liveness`, `lane-control-drills`) — cifra del inventario confirmada |
| 4 | Auditoría Fable del frente | **MUST** | ídem |
| 6 | `rottay CHROME.statsGrid` | **MUST** | `ROADMAP:958` "adjudicación pendiente en F4A-close" — verbatim |
| 7 | CHARTS+accent (28) y esqueleto `THEME.*` | **MUST** | `ROADMAP:922-924` "disposición final F4A-close" — verbatim |
| 8 | 53 familias "sin control" | **MUST** | `ROADMAP:1621-1623` "su disposición final es adjudicación de F4A-close" |
| 9 | Test-hygiene `cra-12` | **MUST** | `ROADMAP:1174-1177` "**Deuda para F4A-close (test-hygiene)**"; `prompt-codex-continue:164-168` |
| 10 | Digest `basedOnReportDigest` | **MUST** | `prompt-codex-continue:169-170` "deuda escrita de F4A-close" |
| 11 | `control.ratio.iconSize` residuo | **MUST** | K4 v3 §11: "El **canal** de `control.ratio.iconSize` (§2.8) — **residuo para F4A-close**" |

### 1.2 Reclasificados (3) — el inventario los cuenta y no corresponde

| # | Ítem | Inventario | **Mi adjudicación** | Razón |
|---|---|---|---|---|
| 5 | `checkpoint/index.json.blockedOn` | MUST_CLOSE (fila propia) | **NO ES OBLIGACIÓN — es un espejo, y hoy está roto** | No añade contenido: reproduce obligaciones ya contadas. **Y la afirmación del inventario es FALSA** — ver §10.A |
| 12 | Prosa "63 raíces" en `root-catalog` | MUST_CLOSE ambigua | **DEFER_F4B con cerca escrita** | K4 v3 §11 es explícito: "se registra el drift, **no se reescribe** — corregir la cobertura de A+B exige re-medir los 3275 canales asignados". Re-medir 3275 canales no cabe en F4A-close. Obligación de F4A-close: **sólo** que la entrada `corrections` diga que la prosa es stale y por qué |
| 13 | Clase F4B en roster/fuente | MUST_CLOSE sin resolución | **DEFER_F4B — es un puntero, no una deuda** | K4 v3 §4.7/§11 la listan como "lo que este lote NO cierra", nunca como trabajo de F4A-close. Obligación de F4A-close: que el puntero sea inequívoco |

### 1.3 FALTANTES del denominador (3) — hallazgos que el inventario deja fuera

| # | Ítem | **Mi adjudicación** | Razón |
|---|---|---|---|
| **N-A** | Raza `program-check.test.mjs` × `manifest/generator/index.test.mjs` | **MUST_F4A_CLOSE** | El inventario la encuentra (§5.1), la declara "hallazgo de esta sesión" y **la deja fuera de los 13**. No es admisible: la obligación #3 es "gates:ci **verde**", y el veredicto del gate *blocking* `modern-rescue-tooling-drills` depende del timing. Un certificado que depende de la carrera no certifica |
| **N-B** | `cascade-wiring-ratchet` (falso positivo estructural **+ invariantes vacuos**) | **PRE_F4B + cerca obligatoria en F4A-close** | Ver §4 |
| **N-C** | `program-state --check` no está cableado a `gates:ci`, y el bloque README está stale | **MUST_F4A_CLOSE (la cerca) / T-0 (el render)** | Ver §6 |

### 1.4 Cierre mínimo COMPLETO derivado

**13 obligaciones reales, no las 13 del inventario:** las 10 de §1.1 + N-A + N-B(cerca) + N-C.
Coincide el número por casualidad; **el conjunto es distinto**: salen 5, 12, 13; entran N-A, N-B, N-C.
Las clasificaciones 1.B (DEFER_F4B), 1.C (DEFER_F4C) y 1.E (STALE) del inventario las verifiqué y **las ratifico sin cambios**.

---

## 2. La raza CI vigente — P0/P1 y el arreglo correcto

### 2.1 Hechos verificados en fuente (no reporte viejo)

- `gates-manifest/index.mjs:95-104`: **una sola entrada** `modern-rescue-tooling-drills`, `blocking: true`, corre
  `node --test <program-check.test.mjs> <manifest/generator/index.test.mjs>`. **No hay `--test-concurrency`
  en ningún lado del repo** (grep vacío). `os.availableParallelism()` = **10** en esta máquina → los dos archivos corren concurrentes.
- `program-check.test.mjs:17`: `const manifestRoot = join(repoRoot, 'packages/core/manifest')` — árbol **REAL**.
- **38 `writeFileSync`** y **6 `renameSync`** en ese archivo. Enumeré los 19 targets `join(manifestRoot, …)`:
  `cascade/roots/{surfaces.effect-intensity,typography.scale,density.mode,shape.radius-scale,responsive.posture,chrome.anatomy,profiles.expressive}.json`,
  `controls/{density.mode,chrome.anatomy,profiles.icon}.json`, `families/primitive/inputs/button.json`,
  `families/${relPath}`, y **`index.json` (línea 1154)**.
- `manifest/generator/index.test.mjs:45-46` lee **`index.json` y `schema.json` a nivel de módulo** (al importar, antes de cualquier `test()`), y `:162-170` spawnea el generador real con `cwd: REPOSITORY_ROOT`.
- **Colisión directa confirmada**: línea 1154 muta exactamente el `index.json` que la línea 45 lee.

### 2.2 Corrección al inventario, en la dirección segura

El inventario describe el patrón como `writeFileSync(mutado); assert; writeFileSync(original)` — secuencial.
**Es inexacto: el código real usa `try { … } finally { restore }`** (verificado en los sitios 436-470, 505-520, 1148-1169).
Consecuencia: **un assert que falla SÍ restaura**. El inventario hace ver el código más descuidado de lo que es.
El riesgo residual es más estrecho, y por eso hay que nombrarlo con precisión.

### 2.3 Clasificación

**P1 la raza · P0 la exposición de `renameSync`.** Dos severidades, un solo tranche.

- **P1 (raza)**: `finally` no protege del solapamiento. Mientras la mutación está viva *legítimamente* dentro del `try`,
  el otro proceso lee. `writeFileSync` no es atómico → el lector puede ver JSON truncado → `JSON.parse` lanza **a nivel de módulo** → aborta el archivo entero. Falso rojo o falso verde en un gate *blocking*. Eleva por encima de lo cosmético porque la obligación #3 de F4A-close es precisamente el verde de ese runner.
- **P0 (rename)**: 3 sitios (`:439`, `:512`, `:1105`) dejan el archivo real **ausente** del disco durante la ventana.
  `finally` no corre ante SIGINT/SIGKILL/OOM. Un Ctrl-C en esa ventana deja el worktree **sin**
  `cascade/roots/density.mode.json`, `families/primitive/inputs/button.json` o `controls/profiles.icon.json`, más un
  hermano `.t1-test-backup`. Es pérdida real en el worktree y rompe silenciosamente la precondición
  "worktree limpio" de todos los tranches siguientes.

### 2.4 Las tres opciones, comparadas

| Opción | Veredicto | Razón |
|---|---|---|
| **(a) sólo `--test-concurrency=1`** | **INSUFICIENTE como arreglo final** | Serializa *esa entrada*. No hace nada por `test:scripts` (pierna 1), que corre `node --test "scripts/**/*.test.mjs" "manifest/**/*.test.mjs"` — decenas de archivos paralelizados sobre el mismo `packages/core/manifest/**`. El test **sigue mutando archivos vivos**. No toca el P0 de `renameSync`. Y duplica el wall-clock de la entrada |
| **(b) separar las entradas del gate** | **RECHAZADA** | Mismo defecto que (a) con peor relación costo/beneficio: la mutación viva persiste, `test:scripts` sigue expuesto, y rompe la cohorte de drill que el propio archivo justifica por escrito (`:93-94`) |
| **(c) aislar `program-check.test.mjs` en árbol temporal** | **ADOPTADA** | Única que satisface el objetivo del prompt: *no mutilar archivos vivos ni depender del timing/crash*. Elimina P0 y P1 por construcción, y arregla también `test:scripts`, no sólo el gate |

**Precedente en el repo (no es diseño nuevo):** `cascade-wiring-ratchet/index.test.mjs:6-16` documenta que ese drill
**ya sufrió y ya arregló esta misma clase de bug** — "Antes escribia y borraba un archivo real bajo
`src/…/skin/`, lo que hacia ENOENT determinista a otros tests que caminan ese arbol en paralelo
(`app-ds-hook-contract-gate/index.test.mjs`)" — resuelto con sandbox `mkdtempSync` + `collectSkinFiles(root)`.
La opción (c) es **aplicar un remedio ya aceptado en este árbol**, no inventar uno.

### 2.5 Dos variantes de (c) — recomendación

- **(c1) sandbox-import — PREFERIDA.** `repoRoot()` (`scripts/lib/repo-root/index.mjs`) resuelve **ascendiendo hasta
  `pnpm-workspace.yaml`**. Si el test copia a un tmpdir el subárbol necesario
  (`packages/core/manifest/`, `packages/core/scripts/lib/`, `packages/core/scripts/quality-evidence/`) más los marcadores
  (`pnpm-workspace.yaml`, `packages/core/package.json` con `name: @rottay/design-system`) y hace `import()` de la **copia**
  de `program-check.mjs`, entonces `findRepoRoot(__dirname)` resuelve **solo** al sandbox.
  **Write-set = test + gates-manifest. CERO cambio en código de producción.**
  Falla cerrada por diseño: `repo-root` lanza si falta el marcador; un archivo no copiado lanza al leerse.
- **(c2) parametrizar `repoRoot`** en `validateModernRescueContracts` (el options bag ya existe, `:1810`;
  `MANIFEST_DIR` es const de módulo `:33`; `repoRoot` const `:27` con **27 usos**).
  **Fallback, no primera opción**: obliga a editar `program-check.mjs`, que es exactamente el gate cuyo veredicto
  F4A-close debe certificar. Modificar un gate para que pase su propio test es el movimiento que le cuesta la
  credibilidad (mismo argumento que el archivo `cra-12` hace sobre re-anclar).

**Decisión: (c1), con (a) como cerca interina barata en el mismo tranche** (un elemento de array; cierra la ventana
intra-cohorte mientras (c1) se escribe y se revisa). Si el grafo de imports hace impracticable (c1), **medirlo y reportarlo**
antes de caer a (c2) — no asumirlo.

`manifest/generator/index.test.mjs` **no requiere cambio**: deja de estar expuesto en cuanto nadie mute el árbol vivo.

### 2.6 Write-set candidato y pruebas negativas

Write-set (c1):
- `packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs`
- `packages/core/scripts/ci/gates-manifest/index.mjs` (cerca interina `--test-concurrency=1`)
- *(sólo si se cae a c2)* `packages/core/scripts/quality-evidence/programs/modern-rescue/program-check.mjs`

Negativas obligatorias — **la 4 es la que distingue "serializado" de "realmente aislado"**:
1. **Visibilidad de mutación**: plantar un defecto en la copia **sandbox** y exigir que `program-check` enrojezca.
   Sin esto el sandbox puede quedar decorativo (el validador leyendo el árbol vivo sin mutar → **falso verde en los 30+ drills**).
2. **Invariancia del árbol vivo**: `shasum -a 256` de todo `packages/core/manifest/**` antes y después de la suite → byte-idéntico, y `git status --porcelain` vacío. Es la aserción que habría cazado el defecto actual.
3. **Ausencia de residuo**: ningún `*.t1-test-backup` sobrevive.
4. **Negativa de crash**: correr el archivo, **SIGKILL a mitad**, y exigir árbol vivo byte-idéntico.
   Con el código de hoy **falla**; con (c1) pasa por construcción.

---

## 3. `cra-12` — mismo tranche, arreglo DISTINTO

**Adjudicación: mismo tranche de test-hygiene, DOS sub-paquetes que no se fusionan (T-1a / T-1b).**

**La forma del defecto es distinta y por eso el arreglo no se comparte:**
- `program-check`: **muta/renombra archivos EXISTENTES** bajo `packages/core/manifest/` → se arregla redirigiendo la raíz.
- `cra-12` (`scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs:50`):
  **CREA un archivo NUEVO** `src/foundation/tokens/css/__cra12-reanchor-drill.css` en el árbol real, con justificación
  escrita en el propio archivo ("The injection goes into the REAL scanned tree, because a partial copy changes every
  digest and drowns the signal in unrelated drift"). Se arregla haciendo que **el gate escanee un árbol que contenga la planta**.

**Serializar NO es aceptable** (el prompt lo pide explícitamente y coincido): sería sólo sano si pudiéramos enumerar
*todos* los lectores concurrentes de `src/foundation/tokens/css/**`. Hay muchos y crecen (token-audit,
literal-ownership-gate, cascade-wiring-ratchet, `deriveHookManifest`, el walker `skin-files`). Una serialización de alcance
no acotado se rompe en silencio el día que alguien añade un lector. **Rechazada.**

**El arreglo correcto ya tiene palanca en el árbol:** el gate `cra-12` acepta **`--workspace-root`**
(`index.mjs:645`) y resuelve cada repo como `resolve(workspaceRoot, spec.name)` (`:383`). Entonces el drill:
1. crea un workspace root en tmpdir; 2. coloca ahí una **copia de árbol COMPLETO** de `ui-design-system`
(completo, no subárbol — lo exige la sensibilidad a digest que el propio archivo declara, y concuerda con la ley de
aislamiento ya establecida en este repo); 3. planta el `.css` **dentro de la copia**; 4. corre el gate con
`--workspace-root <tmp>`.

- **Costo a MEDIR antes de adoptar** (no asumir): copia completa por corrida. Mitigación: una copia por archivo de test
  (setup de módulo) reutilizada por los drills, excluyendo `node_modules/`, `.git/`, `dist/`.
  Si el costo resulta prohibitivo, el fallback es dar al gate un parámetro explícito de corpus extra
  (precedente `collectSkinFiles(root)`), más barato pero toca el modelo de escaneo del gate.

**Salida obligatoria del sub-paquete, no efecto colateral:** hoy las 13 fallas conocidas incluyen el par
`export-missing`/`export-unshipped` como **UN slot decidido por el timing**. Al dejar de plantar, el par debe colapsar
de forma determinista. **T-1b debe re-anclar la baseline pair-aware y declarar a cuál de los dos se estabilizó** —
si no, la comparación "1717/13 por nombre" queda infalsable.

---

## 4. `cascade-wiring-ratchet` — CONFIRMADO, y peor de lo reportado

### 4.1 El falso positivo estructural: **CONFIRMADO**

Leí `scripts/engine/cascade-wiring-ratchet/index.mjs` entero.
`fallbackTargets` (`:87`,`:102`) acumula **cualquier** `--ds-*` que aparezca en posición de fallback.
`reachesRoot` (`:106`) se marca con **un solo salto** y sin validar el destino.
**`root-catalog` no se referencia nunca** (`grep root-catalog scripts/engine/cascade-wiring-ratchet/*.mjs` → vacío).
La noción de "raíz" es **puramente posicional**.

**Instancia concreta, viva, y en la raíz que F4A-close debe adjudicar** (no es hipotética):
- `--ds-input-md-icon-size` **NO** es channel de ninguna de las 64 raíces del catálogo (verificado por set-membership).
- **Sí** lo autoran los temas: `facade/artifacts/bithire/index.css:588` (`15px`), `rottay/index.css:580` (`var(--ds-icon-sm-size)`), más el default `presentation/components/input.css:38`.
- Se lee **16 veces**, y aparece **como destino de fallback** en `modern/skin/input.css:133,136,156,159,219,222` y `textarea.css:211,212`.
→ El gate lo mete en `fallbackTargets` y **lo excluye del denominador como "raíz/rampa"**, siendo un canal por-componente autorado por los temas.
→ Y acredita `reachesRoot` a sus lectores (`--ds-input-action-size`, `--ds-input-affix-size` — ninguno raíz del catálogo) **por su cuenta**.
**Los dos sentidos del error están vivos, y sobre `control.ratio.iconSize`, que es el ítem 11 de F4A-close.**

### 4.2 Hallazgo NUEVO (no está en el inventario): **los invariantes de forma son vacuos**

Por construcción: `denominator = read \ fallbackTargets`; `debt = denominator \ reachesRoot`.
`shapeFailures` (`:128-151`) afirma: (a) ningún nombre de `debt` ∈ `fallbackTargets`; (b) ninguno ∈ `reachesRoot`;
(c) `debt ⊆ denominator`; (d) `|debt| ≤ |denominator|`.
**Las cuatro son verdaderas por construcción para CUALQUIER salida de `classifyCascadeWiring`. No pueden fallar nunca.**
Los dos drills `SHAPE:` (`index.test.mjs:126-152`) pasan **objetos literales escritos a mano** que el clasificador
jamás puede producir (`debt` y `fallbackTargets` compartiendo elemento).
→ El docstring (`:36-39`) afirma "el gate se comprueba a si mismo … Si el clasificador se rompe, el gate lo dice en vez
de reportar un numero plausible". **Es falso.** El autochequeo es decorativo. Es exactamente la escalera-en-el-piso.

### 4.3 Magnitud

Baseline pinado: `denominator 4374 · wired 2203 · debt 2171 · rootsExcluded 768 · skinFiles 391`.
Catálogo canónico: **64** raíces (verificado; `channelStatus` 48/10/6 y asignaciones 101+97+70=268, ambas exactas).
Aunque las 64 aparecieran como destino de fallback, **≥704 de los 768 excluidos no son raíces canónicas**.
La exclusión es ~15% del read-set y **la mayor palanca sobre numerador y denominador a la vez**.

### 4.4 Modelo de grafo propuesto

- **Aristas**: por cada `var(--ds-X, <fallback>)`, `X → Y` para cada `--ds-Y` del fallback (ya lo hace).
- **Terminal por AUTORIDAD, no por posición**: `T` es terminal ⟺ `T ∈ {roots[].channel}` de `root-catalog.json`.
- **`reachesRoot(X)` = ∃ camino `X →* T` terminal** — clausura transitiva, no un salto.
- **Ciclos**: calcular SCCs. Un ciclo sin terminal es **deuda para todos sus miembros** (hoy es invisible: se excluyen
  mutuamente). Un ciclo nunca es raíz. Caso degenerado a cazar: `var(--ds-x, var(--ds-x))` hoy desaparece del denominador.
- **Rampas**: intermedio nombrado que no es raíz del catálogo pero sí alcanza una. Deben ser un conjunto
  **declarado y enumerado con razón por entrada** (allowlist), no inferido por posición. Excluirlas sigue siendo
  legítimo, pero pasa a ser auditable.
- **Compat / sockets autorados**: nombre con productor en artefacto de tenant pero sin raíz de catálogo
  (`--ds-input-md-icon-size` es el caso testigo) → **bucket propio**, nunca exclusión silenciosa.
- La motivación de la regla (a) **sigue siendo válida** ("recablear bien no puede subir el contador") y queda servida por
  "terminal = raíz de catálogo": las raíces se excluyen por definición y añadir un fallback a una no añade miembro al denominador.
- **Invariantes reescritos para ser falsables**: comparar contra una propiedad computada **independientemente**
  (segundo método de alcanzabilidad) y/o plantar un **ciclo** en el corpus y exigir que se reporte como deuda.
  Un drill debe **mutar el CORPUS y observar al clasificador**, nunca alimentar `shapeFailures` a mano.

### 4.5 Clasificación: **PRE_F4B**, con **cerca obligatoria dentro de F4A-close**

*Por qué no MUST_F4A_CLOSE*: ningún documento F4A lo nombra; sus contadores no están entre las obligaciones;
y reconstruirlo exige que la autoridad de raíces canónicas (`root-catalog`) esté **final** — que es exactamente lo que
K4 todavía está editando. Reconstruir el gate encima de un catálogo que se edita en el mismo frente es el error de orden.

*Por qué "no es obligación nombrada" NO alcanza como respuesta* (el prompt tiene razón en exigirlo):
el gate **imprime y pina un campo llamado `roots`/`rootsExcluded` = 768**, que se lee como censo de raíces y
**contradice el canon 64/63**. Una etapa posterior que lo cite invalida su propio claim.

**Por eso F4A-close DEBE, a costo cero de medición:**
1. Renombrar/anotar el campo reportado para que **no pueda leerse como censo de raíces**
   (`fallbackTargets` en la línea de log y en la clave del baseline, con una nota de una línea: es posicional, no el catálogo).
   **Verificado que es seguro**: `collectFindings` consume **sólo** `baseline.debt` y `baseline.denominator`;
   `rootsExcluded` no lo lee nadie → renombrarlo **no mueve ningún veredicto ni ningún ceiling**.
2. Registrar el defecto (los dos: posicional + invariantes vacuos) como work order PRE_F4B nombrado en el roadmap.

Sin re-medición, sin mover baseline. Es cambio de etiqueta/comentario — coherente con la disciplina F4A "docblocks, nunca valores".

---

## 5. `realKeypathParity` — semántica, denominadores, domicilio

### 5.1 Estado verificado

**NO existe en el árbol.** `grep -rn "realKeypathParity"` (sin `node_modules`) devuelve **4 coincidencias, todas prosa**:
`docs/prompt-codex-continue.md:51`, `docs/prompt-kimi-continue.md:324`, `docs/ROADMAP-EJECUCION-2026-08-19.md:931`,
`packages/core/manifest/variant-parity/baseline/index.json:8`.
Sin script, sin test, sin entrada en `gates-manifest`. *(Corrección al inventario: dice "sólo … dentro de
`baseline/index.json`"; son 4, tres en docs. La conclusión sustantiva es correcta.)*

### 5.2 Semántica exacta que debe probar

> Para todo keypath **efectivamente EVALUADO** (que materializa un valor) en cada uno de los tres brand themes,
> los tres coinciden en el CONJUNTO de keypaths — con los `@placeholder` **fuera del numerador**, porque un
> placeholder confiere posición sin materializar keypath.

### 5.3 Denominadores (se declaran por separado; **nunca se fusionan**)

- `evaluatedUnion` — unión de keypaths evaluados en los 3.
- `evaluatedIntersection` — evaluados en los 3.
- **`realDivergentSlots` = `evaluatedUnion − evaluatedIntersection`** → **objetivo 0**.
- `placeholdersExcluded: N` — **se cuenta y se reporta siempre**. Un gate que los descarte en silencio reintroduce
  exactamente la cobertura-por-placeholder que existe para impedir.

### 5.4 Relación con los contadores existentes — son TRES preguntas distintas

| Contador | Pregunta | Valor hoy (verificado en `generated/variant-parity.json`) |
|---|---|---|
| `divergentSlots` | ¿**está ahí**? (posición — un placeholder la da) | **33** |
| `untaggedAuthoredLeaves` | ¿**está gobernada**? (docblock `@governor`) | **40** |
| `realDivergentSlots` (nuevo) | ¿**es real**? (evaluación) | — |

`baseline.json:8` fija la razón del techo 33: "los 33 restantes son slots que NINGUN tema autora … un placeholder no
puede darles posicion porque no hay tema al que atribuirsela". Y las 40 son ortogonales: una hoja puede estar evaluada
y sin tag. **El gate debe afirmar esa ortogonalidad explícitamente**, o el próximo lector las vuelve a fusionar.

**Disciplina de unidad**: `metadataExclusion` ya advierte que la unidad EVALUADA (3726 − 36 metadato = **3690**)
**no** es la unidad léxica (1820/1503/397) y "No se fusionan". `realKeypathParity` trabaja en la unidad **evaluada**:
debe declarar su unidad y rechazar comparación con los contadores léxicos.

### 5.5 Domicilio: **bajo `packages/core/manifest/variant-parity/`, como segunda aserción del MISMO productor**

No un script nuevo bajo `scripts/tokens/`.
**Por qué no crea una segunda autoridad**: `variant-parity/index.mjs` ya camina los tres temas y ya produce
`matrix.*` incluyendo `orphanPlaceholders` y la contabilidad de placeholders. `realKeypathParity` necesita
**exactamente ese walk**. Ponerlo en `scripts/tokens/` significaría un **segundo walker sobre los tres temas**, y la ley
escrita de este repo es explícita: *"dos walkers son dos verdades"* y *"No hay una segunda medicion del corpus en este
archivo, a proposito"* (docstring de `cascade-wiring-ratchet`). Un walker, un corpus, **dos aserciones sobre la misma matriz**.

### 5.6 Write-set candidato (no escrito)

- `packages/core/manifest/variant-parity/index.mjs` — emitir `realParity` desde el walk existente
- `packages/core/manifest/variant-parity/index.test.mjs` — las negativas
- `packages/core/manifest/variant-parity/baseline/index.json` — clave pinada nueva (0 al cierre)
- `packages/core/manifest/generated/variant-parity.json` — salida regenerada
- `packages/core/scripts/ci/gates-manifest/index.mjs` — **una** entrada
**Ningún árbol de archivos nuevo. Ese es el punto.**

### 5.7 Tests

1. `real → placeholder` **sube** `realDivergentSlots`; `placeholder → real` lo **baja** (las dos direcciones).
2. Un keypath presente en 2 de 3 se reporta.
3. Una hoja de metadato **no** cuenta.
4. **Drill obligatorio**: plantar una asimetría y exigir que la aserción enrojezca — sin esto el 0 es escalera en el piso.

---

## 6. Status authority — resolución real en código, y el drift

### 6.1 Cómo resuelve el código (corrige al handoff **y** al inventario)

`program-check.mjs:934-935`:
```js
if (program?.statusAuthority !== 'roadmap/registry.json') {
  errors.push('program.statusAuthority must remain roadmap/registry.json');
}
```
Es **comparación literal de string**. **Nunca** se hace `join(repoRoot, …)` ni `existsSync`.
Contraste deliberado: el bucle de `:966-975` **sí** hace `existsSync(join(repoRoot, contractPath))` para
`humanEntry`, `checkpointIntent`, `customizationManifest`, `artDirectionContract`, `visualCraftContract`,
`r7CustomizationContract`, `referenceLab.page/substrate`. **`statusAuthority` está excluido de esa lista de resolución.**

- **La cita del prompt de arranque está mal**: `packages/core/scripts/quality-evidence/programs/modern-rescue/roadmap/registry.json`
  **no existe** (`ls` → No such file) y **nunca existió** (`git log --all -- <path>` → vacío). El inventario acierta aquí.
- **Pero el inventario también se pasa**: afirma que el campo "*Resuelve correctamente contra la raíz del repo*".
  **Nada lo resuelve.** Enunciado honesto: **es un pin literal; el archivo que nombra existe en la raíz del repo
  (`roadmap/registry.json`, 100 work orders, WO-CRA-23 en índice 95, verificado); ningún código enlaza las dos cosas.**
- **Colisión de namespace no señalada**: `statusAuthority` existe **también** como objeto por-capability dentro de
  `roadmap/registry.json` (`scripts/roadmap/status/index.mjs:145,155,171…`). Mismo nombre, otra cosa.
  El handoff las confunde. Cualquier prompt futuro debe desambiguarlas.

### 6.2 Clasificación del drift

| Drift | Verificado | Clasificación | Qué se hace |
|---|---|---|---|
| `registry.updated: "2026-08-05"` | sí | **cosmético, no gateado** (`scripts/roadmap/` sólo tiene `status/` y `commercial-status/`; nada valida `updated` ni `progressLog`) | Actualizar cuando el registro se escriba legítimamente, **después** de K4/K5 |
| `workOrders[95].progressLog`, última entrada `2026-08-11 10:45` (18 entradas) | sí | **el inventario lo sobre-califica como "el más severo"** | Es un log **append-only**. Su contenido viejo (252 familias, 5040 celdas) **es historia, no drift, y NO se reescribe**. El drift es la **ausencia** de entradas. → **Añadir UNA entrada consolidada de F4A al cierre. No backfillear 14 entradas con fecha falsa. No editar la de 2026-08-11** |
| Bloque "Current checkpoint" de `README.md` | sí | **ESTE es el severo, y el inventario lo mal-archiva como tarea rutinaria post-K4 (§1.D.2)** | Ver 6.3 |

### 6.3 El bloque README: la mentira operativa

Stamp: `head=68f258690 written=2026-08-13T16:16:13.760Z intent=aa3a79f7f00ac414 render=adcfc6b9becc8a94`.
HEAD real hoy: `9d5582dfd` (68f258690 es del **2026-08-11**). Renderiza:
- "**Current wave:** Roadmap reconciliation and first control calibration" — superada.
- "**Blocked on:** … Competing human authorities must be retired …" — **no** es lo que dice el `checkpoint/index.json` de hoy.
- lane `advisory-audit` model = **`fable-and-kimi-read-only`** — **nombra como auditor activo a un asiento retirado**
  (el intent vigente dice `fable`, y Kimi K3 está retirado por orden del owner del 2026-08-21).

Este archivo es a la vez `program/index.json.humanEntry` **y** `workOrderAuthority`. **El único punto de entrada humano del
programa publica hoy un modelo operativo retirado.**

**Y existe la herramienta que lo caza:** `program-state --check` (`src/tooling/lane-control/public/program-state/index.mjs`)
falla ante tres drifts, el segundo textualmente *"the intent file changed and the checkpoint was not re-rendered"*.
**Pero NO está cableado a `gates:ci`**: `grep "program-state\|lane-control" gates-manifest/index.mjs` sólo devuelve
`lane-control-drills`, que además es **una de las 2 entradas EXCLUDED (no blocking)** y corre contra un **clon sandbox**
(`CARRIED` copiado a un repo temporal), no contra el documento vivo.

→ **Respuesta directa al prompt**: sí, hay mentira operativa. *"gates:ci 88 blocking verde"* es hoy **compatible** con un
punto de entrada humano stale y auto-contradictorio, porque el único chequeo que lo detectaría no es blocking ni está cableado.

### 6.4 Qué se actualiza después de K4/K5 y qué **no debe esperar**

**NO debe esperar (T-0, antes de cualquier write de K4):**
1. Corregir `checkpoint/index.json.blockedOn` — hoy es **falso** (ver §10.A).
2. `program-state --write --intent <checkpoint/index.json>` para re-renderizar el bloque.
3. Cablear `program-state --check` a `gates-manifest`.

**Orden obligatorio dentro de T-0**: primero arreglar `blockedOn`, *después* `--write`, *después* cablear `--check`.
Invertirlo renderiza un intent falso o pone CI en rojo antes de tener el arreglo.
Razón para no esperar: toda evidencia posterior cita "gates:ci verde". Hasta cablearlo, esa frase **no cubre** el punto
de entrada humano — incluido el verde que F4A-close usará como certificado.

**Sí espera a K4/K5:** `roster-variantes.{json,md}` (ya en los write-sets de K4/K5), `registry.updated`,
la entrada consolidada de `progressLog`, y los contadores finales.

---

## 7. Plan de restore del inventario — **RECHAZADO como receta universal**

El §8.5 del inventario admite `git show HEAD:<path> > <path>` "bajo el protocolo completo". **Rechazo la receta**, incluso condicionada:

1. **Restaura a HEAD, no al PRE-TRANCHE.** Si el path ya venía legítimamente sucio (otro tranche en vuelo, o uno previo
   de la misma sesión sin commit), **destruye ese trabajo**. Es exactamente la clase del incidente 2026-02-05 que la ley del repo prohíbe.
2. **No distingue creado de modificado.** Un path que el tranche **creó** no tiene blob en HEAD: el comando crea un archivo
   vacío o falla. La acción correcta ahí es **borrar**, no restaurar.
3. **Redirección de shell**: `>` trunca **antes** de que el comando corra. Un `git show` que falla deja el archivo en **0 bytes**,
   y el patrón no lo detecta por sí solo.
4. **No hace nada con el residuo de `renameSync`** (`*.t1-test-backup`) — justo el fallo P0 de §2.3.

**Protocolo exigido en su lugar:**
- **Precondición**: `git status --porcelain` **restringido al write-set** debe estar vacío. Si algún path del write-set viene sucio → **PARAR**, no escribir, escalar. *(Esto el inventario lo tiene; se conserva.)*
- **Backup por CONTENIDO, no por revisión**: `cp` de cada path a `/private/tmp/<lote>-backup/` preservando estructura relativa;
  `shasum -a 256` de ambos lados y comparación. **Pre-hashes registrados en el memo ANTES de escribir.**
- **Registrar, por path, si existía pre-tranche** (para que el restore sepa borrar vs. restaurar).
- **Restore** = copiar de vuelta desde el backup → re-hashear → **exigir igualdad con el pre-hash registrado** →
  exigir `git status --porcelain` vacío para esos paths.
- **Nunca** `git checkout` / `restore` / `reset` / `stash` sobre path ni directorio.
- **Preservar suciedad ajena**: capturar el `git status --porcelain` **entero** pre y post y **diffearlos**; lo que está
  fuera del write-set declarado debe quedar idéntico.
- `git show HEAD:<path>` queda permitido **sólo como contraste de lectura** (entender qué cambió), **jamás como fuente del restore**.

---

## 8. Secuencia de tranches desde el bloqueo actual

**Difiero del orden propuesto en un punto, y lo justifico.**

| # | Tranche | Precondición | Owner | Write-set | Gates | Stop | Kimi / Fable |
|---|---|---|---|---|---|---|---|
| **T-0** | **Authority-honesty** | ninguna | **DT (Codex)** | `checkpoint/index.json`; bloque stampado de `modern-rescue/README.md`; `gates-manifest/index.mjs` | `program-state --check` verde; `program-check.mjs`; `gates:ci` | si `--write` toca algo fuera del bloque stampado | Kimi **no**; Fable ligera |
| **T-1a** | program-check → sandbox (c1) + cerca (a) | T-0 | Sonnet bajo brief DT | `program-check.test.mjs`, `gates-manifest/index.mjs` | las 4 negativas de §2.6 | si (c1) exige tocar `program-check.mjs` → medir y **reportar** antes de caer a (c2) | Kimi **no**; **Fable sí** (negativa de crash) |
| **T-1b** | cra-12 → `--workspace-root` + copia completa | T-0 | Sonnet bajo brief DT | `cra-12-motion-governance.reanchor.test.mjs`; baseline pair-aware de la suite | suite pierna 1 **determinista**; par colapsado y **declarado** | si el costo de copia resulta prohibitivo → **parar y reportar**, no improvisar | Kimi **no**; **Fable sí** |
| **T-2** | **K4** (3 paths) | **Kimi o excepción del owner** | Sonnet bajo K4 v3 | los 3 de K4 v3 | los del brief | los del brief §9 | **Kimi SÍ** (bloqueante hoy) |
| **T-3** | **K5** a / a+ / b / c | T-2 + Kimi + K-1..K-7 | per packet v2 | per packet v2 | per packet v2 | per packet v2 | **Kimi SÍ** |
| **T-4** | Deudas semánticas (statsGrid, CHARTS/accent, THEME.\*, 53-sin-control, iconSize) | T-3 + **mecanismo adjudicado por el DT** | **DT decide mecanismo**, Sonnet ejecuta | fuente de tema **sólo docblocks** + `root-catalog.json` (iconSize) | byte-identidad de artefactos ×3 | cualquier cambio de **valor** | Fable en la auditoría de frente |
| **T-5** | `realKeypathParity` + ratchet→0 | T-3 (`untaggedAuthoredLeaves`=0) | DT diseña, Sonnet implementa | §5.6 | §5.7 + `gates:ci` | si el 0 llega sin drill que enrojezca | **Fable sí** |
| **T-6** | Cerca `cascade-wiring-ratchet` (**sólo etiqueta**) | T-5 | DT | log line + clave `rootsExcluded`; entrada PRE_F4B en roadmap | `gates:ci` (no debe moverse ningún veredicto) | si algún contador se mueve | — |
| **T-7** | `gates:ci` final + auditoría Fable del frente | T-6 | DT / Fable | — | 88+2 | — | **Fable = ejecutora** |

### 8.1 Por qué muevo test-hygiene ANTES de K4 (y no después, como el inventario)

K4 y K5 exigen cada uno una pierna 1 completa comparada **"1717/13 por nombre"**. **Uno de esos 13 es un slot cuya
identidad la decide una carrera** (`prompt-codex-continue:106-111`, verificado). Correr la aceptación de K4 contra una
baseline dependiente del timing significa que **la evidencia de K4 no es reproducible**. Arreglar la carrera primero
hace determinista la comparación de todos los tranches siguientes. Hacerlo después implica que K4 **y** K5 embarcan
sobre evidencia no reproducible y que la baseline hay que re-anclarla igual.

**Contra-argumento que declaro honestamente**: T-1 toca archivos de test, y el roadmap trata la cola como
estrictamente serial `F4A-14 → F4A-15 → F4A-close` (`prompt-codex-continue:56-63`). **Mover test-hygiene antes es una
DESVIACIÓN del orden escrito y por tanto requiere decisión explícita del owner/DT. La recomiendo; no la asumo.**
Si el DT la declina, T-1 corre donde lo pone el inventario, y **la evidencia de K4/K5 debe llevar nota explícita** de que
la baseline de 13 incluía un slot decidido por timing.

T-0 va primero en cualquiera de los dos órdenes: es barato, es casi read-only, y sin él todo "gates:ci verde" posterior arrastra el punto ciego de §6.3.

---

## 9. PREPARATION_MEASURED / DESIGN_ADJUDICATED / IMPLEMENTATION_PENDING

### 9.1 PREPARATION_MEASURED
Censo **re-verificado por mí contra los artefactos**, no copiado: universe **2559** · intersection **342** ·
positionIntersection **2526** · tagRegistry **4099** · divergentSlots **33** · untaggedAuthoredLeaves **40** ·
failures **0** · orphanPlaceholders **0** · leaves 1756/1504/395 · exclusive 1007/795/3 · paintLeaves 1744/1493/384 ·
taggedPaintLeaves 1744/1457/380 → untagged derivado 0/36/4 = **40** · metadataExclusion 36 / paintDenominator 3690.
root-catalog: **64** raíces · channelStatus **48/10/6** · asignaciones **101+97+70 = 268** · `roots[41] = control.ratio.iconSize`.
Gates: **90 = 88 blocking + 2 excluded**. **Todas exactas.** El §3 del inventario es sólido.

### 9.2 DESIGN_ADJUDICATED (por este memo)
Clasificación de la raza (**P1 + P0 de `renameSync`**) y elección **(c1)**; `cra-12` como sub-paquete separado con
`--workspace-root` + copia completa; `cascade-wiring-ratchet` **PRE_F4B con cerca obligatoria** y modelo de grafo;
semántica/denominadores/**domicilio** de `realKeypathParity`; protocolo de restore; orden de tranches; corrección de la
autoridad de status.

### 9.3 IMPLEMENTATION_PENDING
**100%. Cero líneas escritas.** El gate `realKeypathParity` no existe; el ratchet sigue en 33/40; ninguna de las deudas
tiene write-set ejecutado. Confirmo la conclusión estructural del inventario: **hoy no hay camino de implementación de
F4A-close** — todo cuelga de K4 (Kimi) y K5 (Kimi + K-1..K-7).
**Excepción que el inventario no ve: T-0 y T-1 NO dependen de Kimi y son ejecutables hoy.**

### 9.4 Rechazo explícito del "Preparación 13/13 = 100%"
**NO lo acepto.** Por el propio §7 del inventario, **7 de las 13 filas dicen "NO ADJUDICADO"** en su mecanismo de escritura.
Medición completa ≠ preparación completa: falta el **diseño**. Tras este memo, el diseño queda adjudicado para lo que el
prompt me pidió (raza, cra-12, cascade, realKeypathParity, restore, orden) y **sigue SIN adjudicar** para las 5 deudas
semánticas (statsGrid, CHARTS/accent, THEME.\*, 53-sin-control, mecanismo de iconSize) — porque esas son **adjudicación del
DT**, no mía. Preparación honesta: **~8/13 diseñada, 13/13 medida, 0/13 implementada.**
**Este memo no sube el progreso del programa.** No recalculo ni certifico el 35-40% del DT.

---

## 10. Claims del inventario falsos, sobreafirmados o de evidencia indirecta

**A. FALSO — §1.A fila 5.** "`checkpoint/index.json.blockedOn` repite **exactamente los 3 primeros ítems**".
El texto real (`:4`) es: *"No external blocker. F4A-close exige el ratchet a tolerancia cero + el gate de paridad real
sobre keypaths evaluados (sin cobertura por placeholders) + **la auditoría Fable del frente**."*
Repite los ítems **1, 2 y 4**. **Omite `gates:ci` final** (ítem 3), que el roadmap `:1728` sí nombra. No son "los 3 primeros".

**B. FALSO — §6.** "`checkpoint/index.json` … **Ninguno** [drift] — este archivo está al día."
Dos defectos: (i) su lista de 3 **no coincide** con la de 4 del roadmap (ver A); (ii) abre con **"No external blocker."**
mientras K4 está detenido esperando a Kimi — bloqueo que el propio inventario documenta en §2 y §9 y que yo verifiqué por
ausencia de memo+flag. **El archivo que el inventario declara limpio es el que contradice su propio hallazgo central.**

**C. SOBREAFIRMADO — §6.** "`program/index.json:8` … **Resuelve correctamente** contra la raíz del repo".
Ningún código lo resuelve: es comparación literal (`program-check.mjs:934`), deliberadamente excluida del bucle
`existsSync` de `:966-975`. Inferencia razonable presentada como resolución verificada.

**D. IMPRECISO — §4.** "`grep -rl realKeypathParity` sólo encuentra la MENCIÓN … dentro de `baseline/index.json`".
Son **4** coincidencias; 3 están en `docs/` (incluidas las que el propio inventario cita como autoridad).
**Conclusión sustantiva (no existe como código) — CORRECTA.**

**E. SUBESTIMADO (en dirección segura) — §4/§5.1.** Describe el patrón como `writeFileSync(mutado); assert; writeFileSync(original)`.
El código real usa **`try { … } finally { restore }`**. Un assert que falla **sí** restaura. El inventario hace ver el código
peor de lo que es y, al hacerlo, **no aísla el riesgo verdadero**, que es crash/señal dentro de la ventana de `renameSync`.

**F. IMPRECISO — §7 fila iconSize.** "**completar** el `channel` del root — el campo que K4 dejó sin tocar".
El campo **no está vacío**: `roots[41].channel = "--ds-icon-md-size"` (verificado). Es un **valor equivocado a corregir**:
`--ds-icon-md-size` es el token base (`icon.css:21`, consumido por `--ds-icon-default-size`), mientras las emisiones que
los temas mueven son `--ds-input-md-icon-size` / `--ds-button-md-icon-size` (bithire `15px`, rottay `var(--ds-icon-sm-size)`).
Corrección, no completado — y por eso la semántica está "no aprobada".

**G. SOBRECALIFICADO — §6.** `progressLog` como "**el drift más severo** de los encontrados".
Es un log append-only; su contenido viejo es historia legítima y **no se reescribe**. Nada lo lee como gate.
**El drift severo es el bloque `README.md`** — es `humanEntry` **y** `workOrderAuthority`, publica un wave superado,
un `blockedOn` que no es el del intent, y **nombra a Kimi como auditor activo** estando retirado; y su chequeo existe
pero **no está cableado a CI**. El inventario lo archiva en 1.D como tarea rutinaria post-K4. **Mal archivado.**

**H. OMISIÓN — §10 denominador.** El inventario **encuentra** la raza `program-check × generator`, la llama "hallazgo de
esta sesión" y **la excluye de sus 13 obligaciones**. Un hallazgo que ataca la obligación #3 ("gates:ci verde")
no puede quedar fuera del denominador que dice medir el cierre.

**I. EVIDENCIA INDIRECTA — declarada por el propio inventario, y lo ratifico.** Los valores **34 / 46 / 132 / 98** de K5
provienen de Opus v2 + dos rondas Fable con métodos distintos, sobre este mismo HEAD; el inventario **no** los re-midió y
lo dice. Yo **tampoco** los re-medí (exigiría instrumentación, prohibida). Quedan marcados **indirectos pero doblemente
cruzados**. En cambio **sí verifiqué de primera mano** `BrandTableChrome` = 38 campos y `untagged` = 40 por aritmética propia.

**J. CONFLICTO DOCUMENTAL no señalado (menor).** El roadmap dice **"suite 1683/13"** en `:1732` (dentro del mismo §13 que
fija las obligaciones de F4A-close) pero **"1717/13"** en `:940, :977, :1003, :1037, :1070, :1114, :1158, :1207`.
El inventario usa 1717/13 — **correcto**; el 1683 es prosa stale en el resumen. Debe corregirse cuando se toque §13.
Análogo menor: `prompt-codex-continue:100` dice "**7** veces huérfano" y `:170` dice "**9** veces", mismo documento.
Y `ROADMAP:1624` dice esqueleto `THEME.*` de **35** hojas frente a **26** en `:924` (esta última es la medida post-F4A-13).

---

## 11. Cierre — verificación de HEAD/worktree

- **Apertura**: HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · `git status --porcelain` vacío · staged 0.
- **Cierre**: re-verificado inmediatamente antes de emitir este memo (ver salida en el reporte de la sesión).
- **Cero** writes al repo. **Cero** tests/build/generadores/browser ejecutados. **Cero** git mutante. **Cero** commits.
  **Cero** prompts a otros panes. Write-set exacto: `/private/tmp/f4a-close-opus-adjudication.md` y su `.ready`.
- **No se encontró ningún prompt externo** que afirmara una respuesta de Kimi. La ausencia de memo+flag queda documentada en §0.

---

# VERDICT: READY_FOR_FABLE_CHALLENGE

**Condicionado**, con la evidencia de este memo:

1. El **§3 (censo)** y el **§2 (grafo de dependencias)** del inventario se **ratifican íntegros** — re-verificados contra los artefactos, exactos.
2. Su conclusión estructural — **nada de F4A-close es implementable hoy; K4 y K5 bloqueados en Kimi** — se **confirma**, incluida la verificación por ausencia de memo+flag. **Con la excepción de T-0 y T-1, que no dependen de Kimi.**
3. Sus **§6 y §10 quedan SUPERSEDIDOS** por §6 y §9 de este memo: `blockedOn` es falso en dos sentidos, `statusAuthority` no se resuelve, el drift severo es el bloque README, y **"preparación 13/13 = 100%" se rechaza**.
4. El **denominador de cierre cambia de conjunto**: salen los ítems 5, 12 y 13; entran **N-A** (raza program-check), **N-B** (cerca cascade-wiring-ratchet) y **N-C** (cablear `program-state --check`).
5. **Fable debe desafiar prioritariamente**: (i) que los cuatro invariantes de forma de `cascade-wiring-ratchet` son **tautológicos** — es el hallazgo con más consecuencia y el más fácil de refutar si me equivoco; (ii) que **(c1) sandbox-import** es viable sin tocar `program-check.mjs` (grafo de imports); (iii) que el domicilio de `realKeypathParity` bajo `variant-parity/` no crea segunda autoridad; (iv) que mover test-hygiene antes de K4 no viola una precedencia dura que yo no haya leído.

**Ninguna implementación autorizada por este memo.** El progreso del programa no se mueve.
