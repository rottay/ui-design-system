# F4A-close — Challenge Fable 5 al memo Opus (auditor independiente READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**HEAD apertura:** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · `git status --porcelain` vacío · staged 0
**HEAD cierre:** re-verificado idéntico antes de emitir este memo (mismo HEAD, porcelain vacío, staged 0).
**Insumos (SHA-256 verificados por mí, coinciden byte-exactos con el encargo):**
- `/private/tmp/f4a-close-sonnet-inventory.md` = `d52f36ac4a086bc3f196255573c0d4203032b194bd09685c32a7d569998abd87`
- `/private/tmp/f4a-close-opus-adjudication.md` = `9ab5229577259f5bc2df76f31522346f42a9dabb2a74c4ac0be438b8a6d15b2a`
- flag `/private/tmp/f4a-close-opus-adjudication.ready` presente y coherente (verdict READY_FOR_FABLE_CHALLENGE, mismo SHA).

**Cadena de precedencia re-hasheada por mí:** K4 v3 `06ecaa76…22ff1`, Fable K4 `22c39c…5918`, K5 v2 `c29bf3…3ae15`, Fable K5 v2 `d2554c…3fe20` — los cuatro coinciden byte-exactos con lo que el memo Opus declara. Íntegra.

**Rol y leyes cumplidas:** cero writes al repo; cero tests mutantes/build/generadores/browser; cero git mutante; cero commits; cero prompts a otros panes; cero atribución a Kimi. Ejecuté sólo lectura, `shasum`, `grep`/`sed`, análisis en Python/Node sobre artefactos ya generados, y **un** `import()` de `gates-manifest/index.mjs` (módulo de datos congelado, sin efectos — para contar entradas exactas). Verifiqué por ausencia (§0 de Opus): en `/private/tmp` sólo existen PROMPTS a Kimi; ningún `*kimi*preaudit*` memo/flag. **Kimi no respondió.**

---

## VERDICT: ACCEPT_WITH_CORRECTIONS

El memo Opus queda **aceptado como autoridad de preparación de F4A-close**, con las correcciones mínimas C-1…C-7 de abajo, que son vinculantes para el brief que el DT emita. Dos límites explícitos que el encargo exige y ratifico:

1. **Ningún verdict —incluido éste— autoriza implementación.** Preparación adjudicada ≠ luz verde de escritura.
2. **Mi ACCEPT no reemplaza a Kimi.** El owner exige consenso Kimi antes de avanzar; Kimi está 403 sin memo+flag (verificado por ausencia). K4/K5 siguen bloqueados en (a) respuesta Kimi o (b) excepción explícita del owner. Nada de este memo debilita ese bloqueo.

---

## A. Denominador — RATIFICADO con UNA omisión compartida (C-6)

Re-verifiqué las 13 obligaciones de Opus contra el árbol, cita por cita:

- **Las 10 confirmadas: exactas.** `ROADMAP:1725-1729` leído verbatim nombra los 4 del núcleo (ratchet-a-cero + gate de paridad real + gates:ci final + auditoría Fable); `:958-959` statsGrid ("adjudicación pendiente en F4A-close"); `:922-924` CHARTS/accent+THEME.\*; `:1622-1623` las 53 sin-control; `:1174-1177` cra-12; `prompt-codex-continue:169-170` digest; K4 v3 §2.8/§11 iconSize ("Queda como residuo abierto, adjudicación de F4A-close" — verbatim).
- **Reclasificación de 5/12/13: RATIFICADA.** (5) el checkpoint es espejo, no obligación — y está roto, ver F. (12) K4 v3 §11 verbatim: "se registra el drift, no se reescribe — corregir la cobertura de A+B exige re-medir los 3275" → DEFER_F4B con cerca escrita, correcto. (13) K4 v3 invariante 7 verbatim: "La clase F4B no se resuelve acá… Se conserva el texto donde exista" → puntero, no deuda, correcto.
- **N-A: RATIFICADA como MUST.** Un gate blocking cuyo verdict depende del timing no puede certificar la obligación #3. Lógica sana.
- **N-B (cerca) y N-C: RATIFICADAS como obligaciones** (el scheduling de N-C se corrige en C-2).
- **Barrido propio de TODAS las menciones "F4A-close" en el roadmap** (12 líneas: 923, 931, 959, 1035, 1061, 1113, 1175, 1329, 1538, 1543, 1623, 1725): 11 están cubiertas por el conjunto de Opus. **Una NO** → C-6.

**C-6 (omisión compartida por AMBOS memos):** `ROADMAP:1537-1538` — "tercera aparición de la clase *evnto compone desde preset canónico* → **anotada para F4A-close**". El tratamiento por-mecanismo existe (2 entradas de metadato `via: EVNTO_CANONICAL_MOTION` con guarda bifurcada y drillada, `:1653-1655`; hojas aportadas por `EVNTO_CANONICAL_SURFACES` vía spread, `:1078`), pero **ningún documento cierra la disposición de la CLASE**. Debe entrar al denominador como ítem de disposición-de-clase (misma familia que statsGrid/CHARTS/53) **o** el DT debe declarar subsunción con cita exacta. Hasta esa adjudicación, el cierre mínimo es **14, no 13** — o 13 con la subsunción escrita.

## B. Test-hygiene / raza CI — RATIFICADO; (c1) viable pero con lista de copia INCOMPLETA (C-4, C-5)

Verifiqué todo en fuente propia: `gates-manifest/index.mjs:95-104` una sola entrada blocking con los DOS archivos bajo un `node --test`; **cero** `--test-concurrency` en el repo; `os.availableParallelism()` = 10 en esta máquina; el runner (`runner/index.mjs`) es **secuencial con `spawnSync` y fail-fast** — la concurrencia peligrosa vive DENTRO de la entrada (y en pierna 1, `package.json:664`, globs concurrentes sobre `manifest/**`). `program-check.test.mjs`: **38 `writeFileSync`**, **3 pares `renameSync`** (`:439/443`, `:512/517`, `:1105/1113`), `manifestRoot` = árbol real (`:17`), **try/finally real** (leí los sitios — la corrección E de Opus al inventario es exacta), colisión directa `index.json` (test F6 lo muta in-place; `generator/index.test.mjs:45` lo lee a nivel de módulo). **P1 raza + P0 rename: RATIFICADO.** Rechazo de (a)-solo y (b): RATIFICADO. El precedente del sandbox está confirmado verbatim en `cascade-wiring-ratchet/index.test.mjs:1-16` (antes plantaba real → ENOENT determinista a walkers paralelos; se resolvió con `mkdtempSync` + `collectSkinFiles(root)`).

**C-4 — la lista de copia de (c1) es materialmente incompleta.** Seguí el grafo de imports y el read-set de `validateModernRescueContracts` (que el test invoca directamente, no por spawn):

1. `manifest/generator/index.mjs:14` importa `scripts/tokens/customization-surface-census/index.mjs` → **ese subárbol falta** en la lista (import de la copia lanzaría module-not-found).
2. `validateModernRescueContracts:1815` llama `collectTextualFailures()` → lee **`AGENTS.md` y `CLAUDE.md`** en la raíz del workspace (`FILES`, `program-check.mjs:35-37`) → faltan en el sandbox.
3. El bucle `existsSync` (`:966-975`) valida **dos páginas de `packages/showroom/`** (`referenceLab.page`/`substrate`) → faltan.
4. `resolveSourceBinding(site, {repositoryRoot})` (`manifest/rules/index.mjs:124,142`) resuelve **cada `site` de emission/derivation contra la raíz**: medí **28 sites distintos** en cascade/families/controls, ~25 archivos reales bajo `packages/core/src/**` (+1 graphics) → faltan.

Todo esto **falla cerrado y visible** (module-not-found lanza; los reads de contrato degradan a entradas de error con nombre — matiz a la frase de Opus "un archivo no copiado lanza al leerse": `readText` falla BLANDO, `:153-159`, el rojo llega por error-entry, no por excepción). Por tanto **(c1) sigue siendo viable sin tocar `program-check.mjs`** — la conclusión de Opus SOBREVIVE — pero el brief debe **derivar la clausura mecánicamente** (correr en sandbox y seguir los rojos hasta verde) y **pinear la lista resultante**, no partir de la lista del memo. La propia válvula de Opus ("medirlo y reportarlo") queda así ejercida por adelantado: lo medí, y el resultado es "viable, lista más larga".

**C-5 — tres precisiones a las cuatro negativas:**
- **Negativa 2 (invariancia por hash antes/después): la justificación está sobreafirmada.** Con el código de HOY una corrida que PASA restaura en `finally` → hashes idénticos → la negativa NO habría cazado el defecto actual (que es ventana concurrente + residuo de crash, no estado final). La aserción se conserva; la frase "es la aserción que habría cazado el defecto actual" se retira del brief.
- **Negativa 3 (residuo): debe cubrir AMBOS nombres de backup** — verifiqué `.t1-test-backup` (×2) **y** `.f1-drill-backup` (×1, `:1104`); el memo nombra sólo el primero.
- **Negativa 4 (SIGKILL): distinguir los dos usos.** Como drill del código NUEVO pasa determinista por construcción (la mutación vive en el sandbox). Como refutación del código de HOY es **probabilística** (el kill debe caer dentro de una ventana) — no venderla como rojo determinista pre-fix.

`manifest/generator/index.test.mjs` sin cambio: RATIFICADO (deja de estar expuesto cuando nadie muta el árbol vivo).

## C. cra-12 — RATIFICADO como sub-paquete separado; la "copia completa" es MÁS BARATA de lo que el memo implica

Verificado en fuente: el test planta `src/foundation/tokens/css/__cra12-reanchor-drill.css` en el árbol real (`reanchor.test.mjs:50` y su justificación citada verbatim); el gate acepta `--workspace-root` (`index.mjs:645`) y resuelve `resolve(workspaceRoot, spec.name)` (`:383`); el **digest es path-relativo-al-repo + contenido** (`groupDigest(records, {includePath:true})`, `:557,609-610`; los paths son `posix(relative(repoRoot, absolute))`) — **una copia con contenidos idénticos conserva todos los digests**. Rechazo de la serialización: RATIFICADO (lectores del árbol CSS crecen; alcance no acotable).

**Precisión que ABARATA el diseño:** el corpus escaneado para `ui-design-system` es exactamente `spec.sourceRoots = ['packages/core/src', 'packages/showroom/src']` (+ 2 `package.json` manifests), con `SKIP_DIRECTORIES` para `.git/dist/node_modules/coverage`. Medido: **46 MB / 4264 archivos de extensión escaneable**. La "copia de árbol COMPLETO" que exige la sensibilidad a digest es la copia **completa de los DOS sourceRoots**, no del repo entero. Una copia por módulo de test, reutilizada por los drills: costo acotado (segundos). El registry se sigue leyendo del directorio real del gate (read-only) — correcto. La salida obligatoria T-1b (baseline pair-aware re-anclada declarando a cuál de export-missing/export-unshipped colapsó): RATIFICADA — el par-como-slot-por-timing está confirmado en `prompt-codex-continue:106-111` verbatim. Nota adicional verificada: el drill cra-12 corre TAMBIÉN como gate blocking propio en gates:ci (`cra12-motion-governance-drill`, gates-manifest:374), pero el runner secuencial impide que su planta rase con otros gates — la raza vive sólo en pierna 1, exactamente como dice `ROADMAP:1177`.

## D. cascade-wiring-ratchet — TODO CONFIRMADO; intenté refutarlo y no pude (C-7 nota menor)

- **Raíz posicional: CONFIRMADO.** Leí las 210 líneas. `fallbackTargets` acumula cualquier `--ds-*` en posición de fallback (`:87,:102`); `reachesRoot` se marca a un salto sin validar destino (`:106`); `root-catalog` no se referencia nunca.
- **Instancia `--ds-input-md-icon-size`: CONFIRMADA en las dos direcciones, líneas exactas.** No es channel de ninguna de las 64 raíces (set-membership contra el catálogo, hecho por mí); autorado por bithire `index.css:588` (`15px`) y rottay `:580` (`var(--ds-icon-sm-size)`); es DESTINO de fallback en `modern/skin/input.css:133,136,156,159` (+2 más) y `textarea.css:211,212` → entra a `fallbackTargets`, sale del denominador, y acredita `reachesRoot` a `--ds-input-affix-size`/`--ds-input-action-size` (ninguno raíz). Y es exactamente `roots[41] = control.ratio.iconSize`, el ítem 11 de F4A-close.
- **Los cuatro invariantes de forma: TAUTOLÓGICOS, probado por álgebra de conjuntos.** `debt ⊆ denominator = read∖fallbackTargets` (invariantes 1 y 3), `debt = denominator∖reachesRoot` (invariante 2), `|debt| ≤ |denominator|` (4). Ninguna salida de `classifyCascadeWiring` puede dispararlos; los drills SHAPE (`index.test.mjs:126-152`) alimentan objetos literales imposibles. **Una precisión a favor del árbol:** el gate no es TOTALMENTE ciego a un clasificador roto — el pin numérico exacto de `debt` Y `denominator` contra baseline enrojece también hacia abajo, así que una rotura grosera (corpus perdido, regex muerta) sí se detecta por el baseline; lo decorativo son los invariantes, y la frase del docstring ("si el clasificador se rompe, el gate lo dice") sigue siendo falsa en su mecanismo declarado. La refutación de Opus queda en pie con ese matiz.
- **Magnitud:** baseline verificado (`denominator 4374 · wired 2203 · debt 2171 · rootsExcluded 768 · skinFiles 391`); ≥704 de 768 no-canónicas es aritmética de cota superior válida.
- **Cerca segura: VERIFICADA.** `collectFindings` sólo lee `baseline.debt` y `baseline.denominator`; `rootsExcluded` no lo lee nadie en el árbol (grep exhaustivo) — renombrar/anotar no mueve ningún veredicto.
- **PRE_F4B + cerca en F4A-close: RATIFICADO.** Reconstruir el gate sobre un catálogo que K4 aún edita es el error de orden; la cerca (etiqueta + work order PRE_F4B) es costo-cero y obligatoria porque el campo se lee como censo de raíces y contradice el canon 64.
- **C-7 (nota al modelo de grafo, para el work order PRE_F4B, no para la cerca):** "terminal ⟺ `T ∈ roots[].channel`" debe declarar postura para las raíces `channelStatus` `por-crear` (10) y `solo-artefacto` (6): un fallback a un channel que ningún CSS declara todavía ¿es cableado-por-intención o deuda? El modelo de Opus no lo dice. Además, el modelo SCC confirmado: un ciclo a↔b hoy se excluye mutuamente del denominador (invisible) — verificado por construcción.

## E. realKeypathParity — domicilio RATIFICADO; semántica del memo REFUTADA en su letra (C-1); 1918/1823 SIN RESPALDO

- **Estado:** confirmado NO existe como código; exactamente **4 menciones**, todas prosa (baseline `reading.divergentSlots`, `prompt-codex-continue:51`, `prompt-kimi-continue:324`, `ROADMAP:931`) — la corrección D de Opus al inventario es exacta.
- **Domicilio bajo `variant-parity/` como segunda aserción del MISMO productor: RATIFICADO.** El walker ya computa por tema `authored/placeholder/absent`, `orphanPlaceholders` y el universo (`universe = authored ∪ orphanPlaceholders`, `index.mjs:443-446`); la ley "dos walkers son dos verdades" está escrita en el árbol. **No crea segunda autoridad: CONFIRMADO** — una emisión, un baseline, una entrada de gate.
- **C-1 — la fórmula literal del memo es inalcanzable y no puede ser la semántica de A4.** §5.3 define `realDivergentSlots = evaluatedUnion − evaluatedIntersection → objetivo 0`. Medido contra el artefacto: evaluatedUnion (unión de autoradas) = **2559**, evaluatedIntersection = **342** → hoy daría **2217**, y llegar a 0 exigiría eliminar toda autoría exclusiva (rottay 1007 / bithire 795 / evnto 3), que es diseño legítimo del programa — los placeholders existen precisamente para dar posición sin autoría. **El 0 que A4 debe certificar no puede ser "los tres conjuntos evaluados coinciden".** La única spec con autoridad en el árbol es la frase-requisito del asiento §13 (`ROADMAP:1327-1330`: paridad "sobre keypaths evaluados reales, separado de placeholders, cero shadowing"); el mandato de F4A-3c incluía "spec del gate" (`:1331-1335`) y su asiento de cierre (`:1180-1210`) no la entrega en nivel de diseño. **Corrección exigida:** el brief del DT debe definir unidad y conjunto-objetivo de modo que 0 sea alcanzable y falsable — por ejemplo, certificar que ningún slot cubierto por placeholder esconde divergencia evaluada real y que toda exclusividad evaluada está adjudicada con tag, en vez de exigir igualdad de conjuntos — y probar la alcanzabilidad con los números del árbol ANTES de escribir el gate. Las partes del §5 de Opus que SÍ ratifico: placeholders contados y reportados siempre (`placeholdersExcluded: N`), ortogonalidad explícita con `untaggedAuthoredLeaves`, disciplina de unidad (evaluada ≠ léxica, "no se fusionan"), write-set §5.6 (cinco archivos, ninguna carpeta nueva), y los drills §5.7 con el negativo obligatorio en ambas direcciones.
- **Los denominadores 1918/1823 del encargo NO existen en ninguna autoridad.** Los busqué en el roadmap, los dos handoffs, `docs/f4a/`, ambos memos y todos los artefactos generados; y medí todas las unidades candidatas: hoja-léxica **2559/342**, posición **2526/33**, canal-artefacto (mirror-parity y mi conteo propio, coinciden) **1762/432**, hoja-evaluada **3726/3690**, gates **90**. Ninguna produce 1918 ni 1823 ni por unión/intersección ni por diferencia. El memo Opus tampoco los enuncia. **Adjudicación: son o un cálculo del DT no compartido o una premisa falsa; no pueden pinnearse en ningún baseline sin derivación nombrada y reproducible.** Es exactamente la clase de premisa que la parada 19/19 de F4A-13 enseñó a medir antes de creer.

## F. Autoridad/status — TODO CONFIRMADO contra el árbol

- `program.statusAuthority`: **pin literal** confirmado (`program-check.mjs:934-935`, string-compare; excluido deliberadamente del bucle `existsSync` de `:966-975`). La cita del prompt de arranque de la ruta bajo `modern-rescue/roadmap/` es falsa (no existe, sin historial) y el "resuelve correctamente" del inventario era sobreafirmación — ambas correcciones de Opus exactas.
- `checkpoint.intent.json.blockedOn`: **falso en los dos sentidos que Opus declara** — leí el archivo entero: omite `gates:ci` final (repite ítems 1, 2, 4 del roadmap `:1725-1729`, no "los 3 primeros") y abre con "No external blocker." mientras K4 espera a Kimi (bloqueo verificado por ausencia de memo+flag).
- Bloque README stampado: **el drift operativo severo, CONFIRMADO verbatim** — `head=68f258690 written=2026-08-13`, wave "Roadmap reconciliation and first control calibration" (superado), blockedOn ajeno al intent vigente, `advisory-audit` model **`fable-and-kimi-read-only`** (asiento retirado; el intent dice `fable`), lane authority `codex` vs intent `codex-dt`, "Active packet: spacing.rhythm". Y es a la vez `humanEntry` y `workOrderAuthority`.
- `program-state --check`: existe y falla exactamente ante "the intent file changed and the checkpoint was not re-rendered" (`program-state/index.mjs:23-27`); **no está cableado a gates:ci** — la única entrada lane-control es `lane-control-drills`, `blocking:false` + excluded (gates-manifest:447-456). Conteo exacto por import del manifiesto: **90 = 88 blocking + 2 excluded** (`channel-liveness`, `lane-control-drills`) — la cifra de ambos memos confirmada.
- Write-set T-0 auditado: la edición de `blockedOn` no rompe ningún pin de `program-check` (sólo exige schemaVersion/currentWave/lane-authority/refusal-R7 — verificado `:956-963`). El orden interno de T-0 (intent → `--write` → cablear `--check`) es correcto. **Dos consecuencias que el memo no declara y el brief debe declarar:** (i) cablear `--check` mueve el conteo canónico a **89 blocking** — toda evidencia posterior que cite "88 blocking + 2 excluded" cambia de texto en el mismo tranche; (ii) ver C-2 sobre CUÁNDO puede correr T-0.

## G. Secuencia — dos correcciones de dureza (C-2, C-3); el resto RATIFICADO

- **C-2 — T-0 antes de K4 colisiona con una adjudicación vigente que el memo no cita.** K5 packet v2 §0.1(ii) —sostenida por mi propio challenge K5 (`f4a-15-k5-fable-challenge.md:54`)— fijó: "la corrección única de roadmap/checkpoint fue adjudicada a ejecutarse **DESPUÉS** de K4", con razones que anclan ("el estado K4 vive en esos mismos archivos y está cercado; precedente corregir-después-de-medir"). Los pasos 1-2 de T-0 (editar `checkpoint.intent.json`, re-render del bloque README) caen DENTRO de ese objeto cercado. El memo presenta T-0 como "NO debe esperar" sin nombrar la adjudicación que contradice — a diferencia de §8.1, donde sí declara su desviación. **Corrección:** T-0 pre-K4 exige re-apertura EXPLÍCITA de esa adjudicación por el DT/owner, nombrándola y fundándola en los hechos nuevos (el "No external blocker." se volvió falso con el 403 de Kimi; el punto ciego de §6.3 contamina todo "gates:ci verde" que K4/K5 citen como evidencia — argumento real, pero que debe ganar contra la adjudicación escrita, no ignorarla). El paso 3 (cablear `--check`) no está dentro del objeto cercado, pero sin el re-render previo pondría CI en rojo — van juntos o no van. Si el owner no re-abre, T-0 entero se ejecuta como primera pieza de la corrección post-K4 ya adjudicada, y la evidencia de K4/K5 lleva nota del punto ciego.
- **C-3 — T-1b antes de K4 no es "desviación recomendable": es reorden de una cola declarada no-reordenable.** `prompt-codex-continue:56` dice "**cola vinculante, no se reordena**" y nombra "la deuda de test-hygiene cra-12" DENTRO del paquete F4A-close. Adelantarla exige excepción explícita del owner — no basta la recomendación DT. Opus casi lo dice ("la recomiendo; no la asumo"); el brief debe decirlo sin ambigüedad. T-1a (N-A) es hallazgo nuevo sin posición asignada en la cola — el DT puede clasificarlo como higiene de CI fuera del contenido F4A — pero toca la cohorte de drills cuya baseline "1717/13 por nombre" es la vara de aceptación de K4/K5: adelantarlo también cambia condiciones de evidencia a mitad de frente y merece la misma puerta del owner. El argumento de Opus §8.1 (evidencia K4 no reproducible con un slot decidido por carrera) es verdadero y verificado — es exactamente lo que el owner debe pesar al decidir; no lo decide este memo.
- Resto de la secuencia (T-2 K4 con Kimi bloqueante; T-3 K5 per packet; T-4 deudas con mecanismo adjudicado por DT y sólo docblocks; T-5 gate+ratchet tras `untaggedAuthoredLeaves`=0; T-6 cerca; T-7 CI+Fable): **RATIFICADA**, incluida la precedencia dura K4→K5 sobre sus tres bases verdaderas (K5 v2 §0 leído) y el stop de T-5 ("si el 0 llega sin drill que enrojezca").

## H. Restore — RATIFICADO ÍNTEGRO

Los cuatro defectos de `git show HEAD:path > path` son reales y verificables: restaura a HEAD y no al pre-tranche (clase exacta del incidente 2026-02-05), no distingue creado de modificado (un path nuevo no tiene blob: la redirección deja 0 bytes), `>` trunca antes de que git corra, y no toca el residuo `renameSync` (con la ampliación de C-5: DOS patrones de backup). El protocolo sustituto (backup por contenido con pre-hash registrado en memo, registro por-path de existencia previa, restore = copia + igualdad de hash + porcelain limpio del write-set, diff del porcelain ENTERO pre/post para preservar suciedad ajena, `git show` sólo como contraste de lectura, jamás checkout/restore/reset/stash) es estrictamente más seguro que el del inventario y consistente con la ley del repo. Sin correcciones.

## I. Claims A-J del memo — LOS DIEZ VERIFICADOS, cero sobreafirmación encontrada

| Claim | Mi verificación |
|---|---|
| A (blockedOn ≠ "3 primeros") | Archivo leído entero: repite 1,2,4; omite gates:ci. **Exacto** |
| B (intent no está "al día") | "No external blocker." + lista incompleta. **Exacto** |
| C (statusAuthority no "resuelve") | `:934` string literal; excluido de `:966-975`. **Exacto** |
| D (4 menciones, no 1) | grep propio: 4, tres en docs. **Exacto** |
| E (try/finally, no secuencial) | Sitios leídos. **Exacto** — y en la dirección segura |
| F (iconSize: corregir, no completar) | `roots[41].channel = "--ds-icon-md-size"` presente; emisiones reales por `--ds-input-md-icon-size` (bithire:588 `15px`, rottay:580) y piso `icon.css:21`. **Exacto** |
| G (el severo es README, no progressLog) | Ambos leídos; progressLog es append-only sin lector de gate; README es humanEntry+workOrderAuthority con asiento Kimi retirado como auditor activo. **Ratificado** |
| H (raza fuera del denominador = omisión) | Lógica sana; N-A entra. **Ratificado** |
| I (34/46/132/98 indirectos, marcados) | Disciplina correcta; yo tampoco los re-medí (instrumentación prohibida). Siguen **indirectos doblemente cruzados** |
| J (1683 vs 1717; 7 vs 9; 35 vs 26) | Verificados los tres pares en línea exacta (`:1732` vs 14 apariciones de 1717/13; `:99` vs `:169`; `:1624` vs `:924`). **Exactos** |

También verifiqué el censo §9.1 de Opus contra los artefactos: universe 2559 · intersection 342 · positionIntersection 2526 · tagRegistry 4099 · 33/40 · failures 0 · orphanPlaceholders 0 · leaves 1756/1504/395 · exclusive 1007/795/3 · paint 1744/1493/384 · tagged 1744/1457/380 → untagged 0/36/4=40 · metadataExclusion 36/3690 · 64 raíces · 48/10/6 · 101+97+70=268 · 90=88+2. **Todas exactas.** El rechazo del "13/13 = 100% preparación" del inventario: **RATIFICADO** (mecanismo NO ADJUDICADO en 7 filas del propio §7 del inventario; preparación honesta ~8/13 diseñada — ahora con C-1 pendiente de re-diseño, el gate vuelve a "medido, no diseñado": **~7/13 diseñada, 13(+1 C-6)/14 medida, 0 implementada**).

---

## Correcciones mínimas exactas (vinculantes para el brief del DT)

- **C-1** `realKeypathParity`: retirar la fórmula `evaluatedUnion − evaluatedIntersection → 0` (inalcanzable: 2559−342=2217 con exclusividad legítima); el brief define unidad y conjunto-objetivo alcanzable/falsable y lo prueba con números del árbol. Prohibido pinnear 1918/1823 (sin origen en ninguna autoridad ni unidad medible) sin derivación nombrada.
- **C-2** T-0: su contenido queda ratificado; su ejecución pre-K4 exige re-abrir por escrito la adjudicación "corrección única de roadmap/checkpoint DESPUÉS de K4" (K5 v2 §0.1(ii), Fable-sostenida). Declarar además que cablear `--check` mueve el canon a 89 blocking y arrastra todos los textos "88+2".
- **C-3** T-1b pre-K4 = reorden de la "cola vinculante, no se reordena" (`prompt-codex-continue:56`): sólo con excepción explícita del owner. T-1a: misma puerta por tocar la vara de evidencia 1717/13 a mitad de frente.
- **C-4** (c1): completar la clausura de copia — `scripts/tokens/customization-surface-census/**`, `AGENTS.md`+`CLAUDE.md`, las 2 páginas showroom del contrato, y los ~25 site-files de `src/**` que `resolveSourceBinding` exige — derivada mecánicamente en sandbox y pineada en el brief. Corregir "lanza al leerse" → los reads de contrato fallan blando con error nombrado.
- **C-5** Negativas: retirar "habría cazado el defecto actual" de la negativa 2; negativa 3 cubre `.t1-test-backup` y `.f1-drill-backup`; negativa 4 se declara determinista sólo sobre el código nuevo.
- **C-6** Denominador: sumar la clase "evnto compone desde preset canónico" (`ROADMAP:1537-1538`) como ítem de disposición-de-clase de F4A-close, o subsumirla con cita del DT.
- **C-7** Work order PRE_F4B del cascade-wiring: declarar postura de terminal para raíces `por-crear`/`solo-artefacto`, y precisar que el pin numérico del baseline (no los invariantes) es hoy la única detección de rotura grosera.

## Write-sets y gates (condicionados — informativos, no autorizan nada)

Ratifico los write-sets del memo Opus con estas mutaciones: T-1a suma la clausura C-4 al plan de sandbox (sin tocar `program-check.mjs`); T-5 conserva §5.6 (5 archivos, cero árbol nuevo) pero con la semántica re-diseñada por C-1; T-0 condicionado por C-2; T-4 sólo docblocks + `root-catalog.json` para iconSize, byte-identidad ×3, como está. Los gates por tranche del memo quedan como están, más: la negativa de sandbox-no-decorativo (plantar defecto en la copia → rojo) es obligatoria en T-1a, y el drill de asimetría plantada en ambas direcciones es obligatorio en T-5.

## Cierre

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` re-verificado al cierre · porcelain vacío · staged 0.
- Cero writes al repo. Write-set exacto de esta sesión: este memo y su `.ready`.
- Kimi: sin respuesta (verificado por ausencia); nada aquí se le atribuye ni lo sustituye.

# VERDICT FINAL: ACCEPT_WITH_CORRECTIONS

El memo Opus es autoridad de preparación de F4A-close **con C-1…C-7 incorporadas**. El denominador operativo queda: las 10 confirmadas + N-A + N-B(cerca) + N-C **+ C-6 (o su subsunción citada)**. Ninguna implementación queda autorizada; K4/K5 siguen bloqueados en Kimi u excepción del owner; este ACCEPT no reemplaza a Kimi.
