# F4A-close — sidecar `semantic-groups`: verificación de premisa (Cloud Opus, READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system` · **HEAD** `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · **staged 0** · porcelain **25** (antes del asiento de roadmap).
**Sesión:** cero writes al repo, cero suite pesada, cero git mutante. **Kimi fuera.**
**K5 y su sello GAT-07: cerrados con Fable ACCEPT** (verificado: el postaudit de K5 da `VERDICT: ACCEPT`).

---

# VERDICT: STOP

**La premisa "sidecar `semantic-groups` es el siguiente tranche real y requisito previo de K5c" no se
sostiene contra el árbol.** Tres hallazgos medidos, independientes entre sí. **No diseño el tranche**
porque diseñarlo sería fabricar una obligación que ninguna autoridad del repo tiene, y el propio encargo
manda parar en ese caso.

**Una mitad de la premisa SÍ es correcta y la conservo** (§3): el gate anfitrión existe y no hace falta
fila CI nueva.

---

## 1. Evidencia del STOP

### H-1 — `semantic-groups` no tiene **ningún** ancla en el repositorio

`grep -rl 'semantic-groups\|semanticGroups'` sobre `*.mjs`, `*.json`, `*.ts`, `*.md`, excluyendo
`node_modules`: **cero coincidencias en el árbol** y **cero en `docs/`**. `find -name '*semantic-group*'`:
**cero**. El nombre existe **sólo en memos de `/private/tmp`** — el packet v2 §8 lo propuso y mis propios
briefs lo arrastraron. **No es una obligación del programa; es una propuesta mía aún no adjudicada.**

Igual medí los otros nombres que el encargo pide no dar por históricos:
- **`K5c`**: **0 menciones** en `docs/ROADMAP-EJECUCION-2026-08-19.md`. La ley sí nombra *"K5: siete
  `OPEN_DT`, **tranches a/b/c**"* (§691), así que **el tranche “c” existe**; la etiqueta `K5c` y su
  contenido detallado son construcción de `/private/tmp`.
- **`realKeypathParity`**: existe **sólo como prosa** — 1 nota en `baseline/index.json`, 1 en
  cada handoff, 2 en el roadmap. **Cero código.**

### H-2 — El sidecar no está en la cola vinculante ni en el núcleo de F4A-close

Cola vigente, `ROADMAP:686-697`, paso **6** (el resto de F4A-close), verbatim:

> «Deudas semánticas F4A-close, paridad real rediseñada, ratchet a cero, cerca cascade y auditoría final.»

**Cinco ítems. El sidecar no es ninguno.** Y el núcleo de F4A-close (`ROADMAP:2066-2070`) enumera
**cuatro** obligaciones: *ratchet a tolerancia cero · gate de paridad real sobre keypaths evaluados ·
`gates:ci` final · auditoría Fable del frente*. **Tampoco está.**

El postaudit Fable de K5 lo menciona **una sola vez**, y para decir lo contrario de "prerequisito":
§5 Perímetro — *«nada de sidecar/K5c/DOMICILES/canales muertos se mezcló»*. Es constancia de que quedó
**fuera**, no de que sea previo.

### H-3 — No es prerequisito **mecánico** de la adjudicación de `evnto × CHROME.table.border`

Éste es el hallazgo que cierra la cuestión, y es de arquitectura, no de nomenclatura:

- El productor `manifest/variant-parity/index.mjs` tiene **0 ocurrencias** de `plane` y de `anatomy`.
- Su universo de slots sale de **`authoredLeafPaths(text, tenant)`** — un walk léxico de **hojas
  autoradas** (`:313`, `:441`); un `@placeholder` cubre **por prefijo** sobre ese universo (`:18-20`).
- **`anatomy` está autorado por 0 de los 3 temas** (medido ahora: rottay 0 · bithire 0 · evnto 0).

⇒ **Ningún slot de plano `attribute` existe en el universo del productor.** La prohibición de K-7=(B)
—"ningún eje de plano `attribute` admite placeholder de canal"— **es inviolable por construcción hoy**:
no hay dónde cometer la infracción. El campo `plane` del sidecar guardaría un estado **inalcanzable**.

**Conclusión:** sembrar el único placeholder de K5c **no requiere** el sidecar. Requiere el mecanismo de
placeholder que **ya existe** y que ya sostiene los 33 vigentes.

---

## 2. Además: hay un orden mejor, y es el que la propia ley pide

No es sólo que el sidecar no sea previo. **Sembrar el placeholder antes de rediseñar `realKeypathParity`
es el orden equivocado**, por una razón escrita en el árbol:

`baseline/index.json:8` (nota medida, verbatim):

> «El 0 real se certifica sobre keypaths evaluados por el gate `realKeypathParity` de F4A-close
> (adjudicación A4), **no con este contador que incluye placeholders**.»

Y un placeholder **mueve exactamente ese contador** (`divergentSlots`; los 33 vigentes llegaron ahí
*"-6 por los 20 placeholders de hoja"*). Sembrar primero significa **mover un contador que la propia
adjudicación A4 declara no-autoritativo**, antes de definir la unidad que sí lo será. Si el rediseño
cambia la unidad —y C-1 de Fable, ya ratificada, **obliga** a cambiarla porque
`evaluatedUnion − evaluatedIntersection → 0` es inalcanzable (2559 − 342 = 2217 con exclusividad
legítima)— el placeholder quedaría sembrado contra una vara superseded.

---

## 3. Lo que SÍ es correcto de la premisa, y se conserva

**El gate anfitrión existe y no hace falta fila CI nueva.** Cuando el sidecar se adjudique, su domicilio
correcto es `packages/core/manifest/variant-parity/` y su chequeo **cabalga la fila existente**
`{ id: 'variant-parity', run: ['node','manifest/variant-parity/index.mjs','--check'], blocking: true }`
(`gates-manifest:248`). Eso mantiene el canon en **89 blocking + 2 excluded**, evita R-3, y hace
estructuralmente imposible la "segunda autoridad": mismo productor, mismo gate, misma disciplina de
baseline. **Ese diseño sigue en pie — como tranche POSTERIOR, no como prerequisito.**

**Qué lo volvería prerequisito** (condición falsable, para que la decisión sea revisable): que algún tema
empiece a autorar `chrome.<familia>.anatomy`. En ese momento aparecería un slot de plano `attribute` en el
universo de `authoredLeafPaths`, la prohibición de K-7=(B) pasaría a ser violable, y el campo `plane`
dejaría de guardar un estado inalcanzable. **Hoy: 0/0/0.**

---

## 4. Siguiente paso correcto

**Rediseñar `realKeypathParity` (paso 6 de la cola, ítem "paridad real rediseñada") ANTES de sembrar el
placeholder y antes del sidecar.** Es lo que la ley enumera, lo que A4 exige y lo que decide si el
placeholder es siquiera el instrumento adecuado.

**Lo que ese tranche debe producir primero, y es puramente de medición (mecánico, Sonnet):**
1. Censo de la unidad candidata: hoja-léxica (2559/342), posición (2526/33), canal-artefacto (1762/432),
   hoja-evaluada (3726/3690) — **re-medidos hoy**, no citados.
2. Para cada unidad, si el objetivo **0 es alcanzable y falsable**, con los números del árbol. C-1 lo
   exige **antes** de escribir una línea de gate.
3. Enumeración de los 33 `divergentSlots` vigentes con su razón por slot (la nota dice que son *"slots que
   NINGÚN tema autora en ninguno de los tres"*): verificarlo slot por slot.

**Lo que NO es mecánico y necesita challenge Fable (arquitectura):**
- **La elección de unidad y conjunto-objetivo** de `realKeypathParity`, y la prueba de alcanzabilidad.
  Es C-1 sin resolver; ninguna medición la decide sola.
- **Si el placeholder `evnto × border` sigue siendo el instrumento correcto** una vez fijada la unidad, o
  si esa exclusividad se adjudica por otra vía sin mover `divergentSlots`.
- **La adjudicación del sidecar** como tranche propio, con su condición de activación de §3.
- Prohibido pinnear `1918/1823` en ningún baseline: **sin origen en ninguna autoridad** (C-1).

**Deudas semánticas de F4A-close, abiertas y enumerables hoy** (primer ítem del paso 6): `statsGrid`
(6 menciones en el roadmap), `CHARTS`/accent + esqueleto `THEME.*` (3), las familias "sin control" (4),
`control.ratio.iconSize` (1). Son tranche propio, con mecanismo adjudicado por el DT y **sólo docblocks**.

---

## 5. Conflicto con el dirty actual, y por qué también aconseja parar

Porcelain **25**, **antes del asiento de roadmap**. Entre los sucios están
`manifest/generated/variant-parity.json` y `manifest/variant-parity/baseline/index.json`, que son
**exactamente** los archivos que un tranche de sidecar tocaría o leería como vecinos. Abrir un tranche
cuyo write-set colinda con paths sucios **antes** de que el asiento cierre viola la precondición
"write-set limpio path por path" que rige todos los tranches de este frente. **Primero el asiento; después,
el tranche que la cola diga.**

---

## 6. STOPs de esta adjudicación

**S-1** Ejecutar el sidecar como "requisito previo de K5c" sin adjudicación DT que lo incorpore a la cola →
PARAR: no está en `ROADMAP:686-697` ni en el núcleo `:2066-2070`.
**S-2** Sembrar el placeholder de `evnto × CHROME.table.border` **antes** de que la unidad de
`realKeypathParity` esté fijada → PARAR (§2): movería `divergentSlots`, contador que A4 declara
no-autoritativo.
**S-3** Crear `manifest/semantic-groups/` de primer nivel, o una fila de gate CI nueva → PARAR: segunda
autoridad y canon movido (§3).
**S-4** Pinnear `1918/1823`, o cualquier cifra sin derivación nombrada y reproducible, en un baseline →
PARAR (C-1).
**S-5** Abrir cualquier tranche con el write-set colindando con los 25 sucios, antes del asiento → PARAR (§5).
**S-6** Tratar `K5c`, `semantic-groups` o `realKeypathParity` como nombres con ancla en el repo → PARAR:
medido, **ninguno de los tres tiene código**; dos no aparecen ni en `docs/`.

---

## 7. Cierre

- **Cero writes al repo.** Write-set de la sesión: este memo y su `.ready`.
- **STOP con evidencia**, no por cautela: el sidecar no tiene ancla, no está en la cola, y **no es
  prerequisito mecánico** porque el plano `attribute` no existe en el universo del productor (`anatomy`
  0/0/0).
- **Siguiente paso correcto: `realKeypathParity` rediseñado**, con su prueba de alcanzabilidad C-1 antes
  de escribir gate; después, el placeholder si sigue siendo el instrumento; el sidecar como tranche propio.
- La mitad sana de la premisa —gate anfitrión existente, sin fila CI nueva— queda registrada para cuando
  el sidecar se adjudique, con su condición falsable de activación.
- No abre deuda nueva ni toca roadmap.

# VERDICT: STOP
