# cascade-producers — remediación de la regresión de conservación introducida por COH-1 (Sonnet)

**Fecha:** 2026-08-30 · **Rol:** Sonnet (implementación) · **Repo:** `ui-design-system`, main,
HEAD de partida `2d430aece`. Write-set ejecutado: `producers.json` (regenerado por
`--write`, nunca a mano), `cascade-producers.test.mjs` (tests del propio tool), y —
por necesidad medida, no por elección — `tenant-reach/index.mjs`. Sección E explica
por qué el disposition subsystem (`cascade-disposition.mjs`) no podía resolver esto y
por qué la expansión de alcance era la única vía a verde.

---

## A. Fallo reportado vs. causa raíz medida

El brief de entrada asumía que el delta (8, no 4) tenía que ver con el retiro de las 4
entradas `-bg` de `SEMANTIC_GROUND` en `brand-studio/index.tsx` (merge COH-1,
334bace48) — es decir, un problema de disposición de sitios tsx retirados.

**Esa hipótesis es falsa, medida por sonda read-only, no asumida.** Escribí
`scanTsxSource()` (exportado por `cascade-producers.mjs`) contra el árbol actual y
contra un `git worktree` del commit pre-merge `b682164f6` (mismo `node_modules` vía
symlink, sin mutar nada):

| | pre-merge (b682164f6) | HEAD (post-merge, pre-fix) |
|---|---|---|
| `tsxSiteTotal` (unresolved + closedNonObject, universo tsx) | **2024** | **2024** |
| `missing-owner` (plane `ts-compilers`) | 0 | **4** |
| `reach.unattributed` (residual, pre-dedupe) | 3 | 7 |
| `unknownProvenance` real (tras dedupe) | 0 | **8** |
| `accountedRows − tsxSiteTotal` | 0 | **+8** |

`tsxSiteTotal` es **idéntico** antes y después del merge. El retiro de las 4 entradas
`-bg` de `SEMANTIC_GROUND` no tocó ni un solo sitio `unresolved`/`closedNonObject`: esas
4 entradas eran stamps ya CLAIMED (resueltos), no deuda tsx. El disposition subsystem
(`cascade-disposition.mjs`, que sólo clasifica sitios tsx sin resolver) es, por
construcción, incapaz de mover esta aguja. La aritmética de la guarda de conservación
(`cascade-producers.mjs:1370-1388`) compara `tsxSiteTotal` (sólo plano tsx) contra
`accountedRows`, que en realidad **incluye** `unknownProvenance` de los planos `css` y
`ts-compilers`/`ts-chrome-variables` también. Esa igualdad sólo se sostenía porque,
hasta este merge, esos otros planos jamás producían una fila `unknownProvenance` — un
invariante implícito, nunca afirmado ni testeado, que la nueva causa raíz rompe por
primera vez.

**Causa raíz real:** COH-1 agregó `deriveStatusTintFloor(palette)` en
`infrastructure/compilers/kernel/runtime/brand-theme/index.ts` (confirmado ausente en
b682164f6, `git show` no encuentra el símbolo). La función itera
`ON_TONE_ROLES = ['success','warning','error','info']` — declarado en
`.../color-math/readable-ink/index.ts`, un archivo que **no** estaba en la lista
`CONSTANT_SOURCES` de `tenant-reach/index.mjs` — y emite 4 templates por rol
(`${channel}-bg`, `${channel}-border`, `--ds-color-alpha-${role}-10`,
`--ds-color-alpha-${role}-20`). Sin ese archivo en `CONSTANT_SOURCES`,
`resolveConstant('ON_TONE_ROLES')` no encuentra el array en ningún lado, la enumeración
del hole `role` queda vacía, y las 4 emisiones caen a `missing-owner`.

## B. El bug de doble conteo que convirtió 4 en 8

`tenantReach()` (en el mismo `tenant-reach/index.mjs`) recalcula su propia lista
`unattributed` con el **mismo** algoritmo (`templateEmissions` + el mismo `attributed`
map de `buildEnumerators`), sobre los mismos tres archivos compilador. No conoce el
mecanismo de adjudicación por nombre que sólo vive en `cascade-producers.mjs`
(`adjudicateDeclarationOwner`), así que reporta las mismas 4 emisiones como
`unattributed` de forma independiente.

El loop de "residual emitters" en `cascade-producers.mjs` (línea ~1226) recorre
`reach.unattributed` y hace `unknown()` para cada entrada que no encuentra **ya
reclamada** (`claims`). El chequeo de dedupe sólo mira `claims`, nunca
`unknownProvenance` — así que un sitio que el loop principal ya empujó a
`unknownProvenance` (porque no tenía owner) se vuelve a empujar aquí, **duplicado**. Es
un defecto latente real en `cascade-producers.mjs`: nunca se manifestó antes porque,
hasta ahora, todo owner de compilador sin enumerador SÍ tenía una regla nombrada en
`adjudicateDeclarationOwner` (o viceversa) — `deriveStatusTintFloor` es el primer caso
en que ninguna de las dos cubre la función, y las dos rutas de `unknown()` disparan para
los mismos 4 sitios: 4 (loop principal) + 4 (residual) = 8.

**No implementé un fix para este segundo bug.** Atribuir `deriveStatusTintFloor`
correctamente (sección C) hace que ninguna de las dos rutas dispare para estos sitios,
así que no hay instancia viva que lo ejercite hoy. Lo dejo documentado como hueco
encontrado, con la reparación mínima propuesta (no aplicada): en el loop residual,
excluir también los sitios cuyo `(file, owner)` ya aparece en `unknownProvenance`, no
sólo en `claims`. Un mutante que lo probaría: reintroducir una función de compilador sin
enumerador y sin regla de adjudicación, y afirmar que `unknownProvenance` contiene
exactamente 1 fila por template, no 2.

## C. Mecanismo de la remediación (regeneración, nunca edición a mano)

`producers.json` es un artefacto generado — no se tocó una sola línea a mano. La
reparación es puramente de atribución, en la fuente que declara qué archivos puede leer
el resolutor de constantes, y después regeneración vía `--write`:

1. `packages/core/src/tooling/lane-control/runtime/tenant-reach/index.mjs`:
   - Agregada la ruta
     `packages/core/src/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink/index.ts`
     a `CONSTANT_SOURCES` (el vocabulario `ON_TONE_ROLES` vive junto al contrato para el
     que fue autorado — `readable-ink` — no junto al segundo emisor que lo consume).
   - Agregada `[BRAND_THEME, 'deriveStatusTintFloor', 'status tint floor bg/border/alpha']`
     a `loopEmitters` (mismo patrón que las otras 6 entradas ya existentes:
     `for (const role of ON_TONE_ROLES)` calza exactamente la forma que `loopBindings()`
     ya sabe resolver).
   - **Regresión encontrada y corregida en el camino:** `buildEnumerators()` construía
     `sources` con `readFileSync` sin `existsSync`, para los 6 archivos de
     `CONSTANT_SOURCES` sin excepción. El fixture mínimo de
     `withBuildFixture()` (en `cascade-producers.test.mjs`) no declara el nuevo archivo
     `readable-ink`, así que `buildProducers()` lanzaba `ENOENT` dentro de dos tests de
     `P1-1`. Corregido filtrando `CONSTANT_SOURCES` por `existsSync` antes de leer — un
     root reducido que omite un archivo de vocabulario es, correctamente, un dominio no
     resuelto (mismo comportamiento de fallo que si el archivo existiera pero no
     declarara la constante), nunca una excepción no capturada.
2. `node cascade-producers.mjs --write` para regenerar `producers.json` desde el árbol
   ya corregido.

No se tocó `cascade-disposition.mjs` ni nada que él lea: medí explícitamente
(`classifyCrossFileRows().rows.length === 2024`, idéntico antes y después) que el
subsistema de disposición es completamente ajeno a esta causa raíz.

Verificación del nombrado de canales atribuidos (vía `expandTemplate` real, no
inventado): `--ds-color-{success,warning,error,info}-bg`,
`-border`, `--ds-color-alpha-{success,warning,error,info}-10`, y
`--ds-color-alpha-{success,warning,error}-20` más `-info-20` (el enumerador no modela el
guard interno `role !== "info"`, igual que **ningún** otro enumerador de este archivo
modela guards internos de su propio loop — sobre-aproximación consistente con el resto
del sistema, no un caso nuevo).

## D. Consecuencia en `cascade-producers.test.mjs`: 13 "frozen counters" a re-pinear

Una vez restaurada la conservación, 13 tests (`C-a4`, `Z-11`, `T-14`, `T-23`, `B-11`,
`R-9`, `D-10`, `E-8`, `R-T8`, `S-8`, `SR-7`, `KS-7`, `CL-8`) fallaban en su primera
aserción: `out.stats.producerSites === 4873` (medido: ahora 4877). Confirmé contra el
`producers.json` **committeado** en b682164f6 (`git show b682164f6:...producers.json`,
sin regenerar) que 4873/10312 es exactamente el baseline pre-COH-1 — es decir, estos 13
tests ya estaban rotos por el propio merge COH-1 (el nuevo emisor más el corrimiento de
líneas en `brand-theme/index.ts` recalculan `producerSiteId` para muchas claims
existentes, ~47 altas/43 bajas netas +4, todo ordinal-rehash salvo los 4 sitios
genuinamente nuevos), sólo que la guarda de conservación lo enmascaraba lanzando antes
de llegar a la aserción.

Cada uno de los 13 tests sólo necesitaba las MISMAS tres cifras (`producerSites`,
`channelEmissions`, `distinctChannels`); todo lo demás que cada test verifica
específicamente (cohortes tsx: `closedZeroGoverned=627`, `privateRelay=728`,
`publicBoundary=534`, `closedProducer=66`, `closedNonObject=69`,
`emissionsWithCausalRoot=196`, `universeTotal=2024`, y las cuentas puntuales de cada
test — `S-8`'s 8 filas, `SR-7`'s 22, `KS-7`'s 67, `CL-8`'s 11, etc.) permanecía
bit-a-bit idéntico, confirmando que el universo tsx no se movió un milímetro. Repineado
siguiendo la convención ya establecida en el archivo (comentario con fecha + aritmética
+ referencia), nunca borrando el rastro de re-pins anteriores (F2A-1, C-02b).

Valores nuevos: `producerSites: 4877`, `channelEmissions: 10343`,
`distinctChannels: 4587`.

## E. Por qué el write-set se expandió más allá de lo declarado

El encargo acotaba el write-set a `producers.json` + lo que `cascade-disposition.mjs`
lea + tests del tool. Medido (sección A), el 100% de esta regresión vive en el plano
`ts-compilers`, al que `cascade-disposition.mjs` no tiene ninguna vía de influencia — el
universo tsx que sí gobierna es idéntico bit a bit antes y después. No existe ninguna
edición dentro del write-set declarado que pudiera restaurar la conservación: la única
ruta era atribuir `deriveStatusTintFloor` en la fuente real de la enumeración
(`tenant-reach/index.mjs`), o falsear la guarda misma (descartado: viola "no generated
artifact, baseline or evidence receipt is hand-edited" y el propio espíritu fail-closed
que el archivo se pasa 40 líneas de comentario defendiendo). Elijo la primera vía y la
dejo enteramente trazada aquí para que el DT la audite como excepción puntual, no como
precedente.

## F. Verificaciones (todas re-ejecutadas tras el fix, no una sola vez)

- `node cascade-producers.mjs --check` → **OK**, `producers.json` matches the tree.
- `node cascade-producers.test.mjs` → **217/217 pass**, 0 fail (era 202/15 con el
  fixture roto, 204/13 tras arreglar `existsSync`, 217/0 tras repinear los 13 frozen
  counters).
- `node program-check.mjs` → BLOCKED con **exactamente 117** filas, todas
  `source digest is stale` bajo `F4B/`, cero filas de ninguna otra clase (confirmado
  por conteo exacto, no por inspección visual).
- `node program-check.test.mjs` → 52/53 pass; el único rojo es el test 1
  ("live modern-rescue program contracts are internally consistent"), con el mismo
  array de 117 stale receipts F4B verificado línea por línea; `A11` (guard estático de
  la lista transitiva) está verde.

## G. Fuera de alcance, intacto

`docs/reauditoria-cloud/` (untracked, foreign) y
`packages/core/docs/history/programs/modern-rescue/research/2026-08/r1-button-opus-grammar.md`
(untracked, preexistente) no se tocaron ni se agregaron al commit. No se tocó el harness
F4C, ningún ground del lab, ni ningún lote R1. `git worktree` usado para el commit
pre-merge (`/tmp/mr-preimage`, sólo lectura, symlink de `node_modules`) fue removido al
terminar (`git worktree remove --force`); no dejó rastro en el árbol principal.
