# Hardening pre-K4 (T-0 authority-honesty) — Postaudit Fable 5 del SOURCE_READY (auditor READ-ONLY)

**Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Estado verificado (apertura y cierre de esta ronda):** HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` (sin mover) · **staged 0** · porcelain = exactamente **6** paths dirty: los **5 del lote** + el preexistente `docs/ROADMAP-EJECUCION-2026-08-19.md`, que sigue **byte-idéntico** en `a4aabddee653cf94f66a7d589a4947bda5fef64a270441ded93e44caae83b202`. Ningún path extra, ningún untracked, ningún residuo.

**Autoridades (SHA-256 verificados byte-exactos):**
- SOURCE_READY `/private/tmp/f4a-pre-k4-hardening-opus-source-ready.md` = `291ff3e9c8e0cecc22e42dcd3a1194059337574a11cafc0ddef707193d27e94a`
- Brief v2 `/private/tmp/f4a-t0-opus-implementation-brief-v2.md` = `e8c5314a920c439fdfa307af80534f9dc6f5fe6b5ffa21918b4ba0d93f58f541`
- Mi preaudit `/private/tmp/f4a-t0-fable-preaudit.md` = `50733688deb2956ac7757c202ff43373e04b13e14206c219ca2526191126ca7e` — ACCEPT que habilitó esta implementación

**Leyes cumplidas:** cero writes al repo; cero suites mutantes, `gates:ci`, builds o generadores; cero git mutante; cero pedido de commit; Kimi no consultado. Ejecuté sólo lectura, `shasum`, `grep`, `git diff` de inspección, imports de módulos de datos, y dos validadores read-only probados en fuente (`program-state --check`; `program-check.mjs`). Write-set de la sesión: este memo y su `.ready`.

---

## VERDICT: ACCEPT

El diff vivo es **exactamente** el mandado por el brief v2 que preaudité: cinco paths, ni un byte fuera de ellos, con el roadmap preexistente intacto. Cada contador, digest, posición y predicado que re-verifiqué de primera mano coincide con el informe SOURCE_READY. Los dos hallazgos honestos de §7 quedan adjudicados abajo (la corrección N2: **ACEPTADA**; el rojo Node 25: **clasificación causal honesta, ajena al lote**). Ninguna stop condition A–K disparó ni debió disparar.

---

## 1. Diff vivo inspeccionado completo — los cinco paths, exactos

- **Path 1 `checkpoint.intent.json`** — prueba máxima disponible: el archivo implementado es **byte-idéntico al que yo mismo construí de forma independiente durante el preaudit** (tres ediciones quirúrgicas aplicadas sobre el intent real, con el `blockedOn` extraído byte-exacto de la línea 72 del brief). Posthash `5a86b12ae6369bdd…dd5e4` — cuyo prefijo de 16 hex ES el `intentDigest` predicho. Tres campos, ninguna clave añadida/quitada, formato preservado.
- **Path 2 `program-state/index.mjs`** — diff leído entero: la constante `FLAGS` exportada con los seis flags (1:1 con los `flags.get()` reales), docblock, y su consumo en usage (`accepted flags: …`). **Cero ramas de decisión tocadas.** Predicado del test re-medido ahora: cada flag entrecomillado exactamente **1 vez**.
- **Path 3 `README.md`** — un solo hunk, **5+5 líneas, todas dentro del bloque `## Current checkpoint`**: stamp `head=9d5582dfd · intent=5a86b12ae6369bdd · render=55b37c5b919255e4` (los dos digests que el brief predijo y yo reproduje en el preaudit), wave F4A vigente, `blockedOn` con la cola y las **4** obligaciones, lane authority `codex→codex-dt`, `advisory-audit` **`fable-and-kimi-read-only`→`fable`**. La tabla "Derived at write time" no se movió (255/5100/0/0/255 intactos). Nada fuera del bloque.
- **Path 4 `gates-manifest/index.mjs`** — exactamente **una** entrada: id `modern-rescue-checkpoint-state`, argv **verbatim** al brief, `blocking: true`, sin campo `excluded`, insertada tras `modern-rescue-program-contract`, con su comentario de racional.
- **Path 5 `prompt-codex-continue.md`** — exactamente las **dos** líneas de contador `:53`/`:102` `88→89`; barrido propio: **0** "88" vivos residuales en el archivo; la Clase A histórica (10 líneas del roadmap + `prompt-kimi-continue:366`) intacta — el roadmap lo pruebo por SHA y los otros por porcelain (no están dirty).

`git diff --check`: **limpio** (cero errores de whitespace).

## 2. Contadores, digests, gate y FLAGS — re-verificados por vías propias

- **Canon por import del manifiesto real:** total **91** · blocking **89** · excluded **2 idénticos** (`channel-liveness`, `lane-control-drills`) · `validateManifest []` · entrada en **idx 14**, **1** ocurrencia. Exacto al informe y a mi simulación de preaudit.
- **`program-state --check` vivo (corrido por mí):** **EXIT 0, `no violations`**, provenance `written against HEAD 9d5582dfd, which is still HEAD`. Esto prueba de una vez: intent limpio (cero P1/P2/P9), README = render fresco byte-exacto, digests del stamp verdaderos, y `before`/`after` estructuralmente intactos.
- **`program-check.mjs` vivo (corrido por mí):** **`CONSTITUTION_READY`, EXIT 0** — D5 confirmado de primera mano; ningún hallazgo textual nuevo sobre el README re-renderizado (stop H no disparó).
- **Censo del manifest:** `git status --porcelain packages/core/manifest` = **0** líneas → el árbol está byte-idéntico a HEAD, que es una prueba aún más fuerte que la igualdad pre/post del informe. Residuo `*.t1-test-backup`/`*.f1-drill-backup`: **0** (ambos patrones C-5).
- **Contadores no movidos:** cubiertos por el censo byte-idéntico del manifest (tagRegistry/divergentSlots/universo/posición viven ahí) y por la tabla derivada del README sin cambios.

## 3. Pruebas y restores del informe — corroborados

Las restauraciones de N1/N2/N4 quedan probadas por el estado final: los **cinco posthashes actuales coinciden con §1 del informe** y `--check` vivo da EXIT 0 — ninguna planta sobrevivió. La evidencia durable existe en `/private/tmp/f4a-t0-backup/` con los artefactos declarados (`porcelain.*`, `prehashes/posthashes`, `A1..A5`, `D1..D4`, `D7.out`, `D7b.out`, `ERA.out`, `N*.out/.orig`, censos y copias). A3/A4/D3/D4 no los re-corrí: el predicado exacto del flags-test lo re-medí yo a mano (los seis flags, 1 vez cada uno — es la aserción literal del test) y los pines del runner-test quedaron verificados estructuralmente en el preaudit (relacionales `>= 15`, lista de excluidos intacta, órdenes por `indexOf` invariantes bajo inserción). D7 (`gates:ci` completo) me está prohibido: la evidencia válida es la corrida Node 22 del informe, cuyas piezas verificables por separado (canon, gate nuevo, program-check) me dan verde de primera mano.

## 4. Adjudicación explícita de la corrección N2 — **ACEPTADA**

El brief §11 predijo que 1 byte mutado **dentro** del bloque stampado dispararía **P7+P8**; lo medido es **P8 solo**. Adjudico con la fuente en la mano:

- `P7` compara `stamp.render` contra el digest de un **render fresco derivado del intent** (`index.mjs:550`); una edición a mano del cuerpo del README no toca ni el stamp ni el intent, así que **P7 no puede disparar por construcción**. `P8` (`:558-573`) compara el cuerpo real contra el render fresco y **dispara nombrando la primera línea divergente**.
- La predicción del brief estaba **sobre-especificada** (extrapolaba el estado A, donde P7 disparaba porque el intent/derivación habían cambiado respecto del stamp — otra causa). La explicación del informe es mecánicamente exacta: **P7 detecta que una cifra derivada o el intent se movieron; P8 es el detector del documento editado a mano.**
- **¿Reduce detección? NO.** La mutación plantada sigue enrojeciendo el gate blocking de forma determinista (EXIT 1) con diagnóstico de línea. La negativa del brief exige que el gate enrojezca — enrojece. **¿Viola contrato? NO.** Ninguna stop condition pinea P7 para N2 (D/E/G/H quedan intactas) y ningún digest depende de ello. Es una corrección honesta de predicción, en la dirección segura, correctamente reportada en vez de silenciada.

## 5. Node 25 rojo / Node 22 verde — clasificación causal **HONESTA**

Verificado por fuente y por observación directa, no por confianza:
- El predicado vive en `gat-07-exact-proof/index.mjs:1142-1149`: compara `process.versions.node` (major) contra `NODE_VERSION` de `.github/workflows/ci.yml` — que pinea **'22'** (línea 14) — más los pines de `pnpm-lock.yaml`. **Ninguno de esos archivos está en el write-set y gat-07 no lee ninguno de los cinco paths.**
- Yo mismo observé **Node v25.2.1** como runtime local de esta máquina en esta sesión → `runtime Node major 25 != CI Node major 22` es exactamente lo que ese predicado produce, con o sin T-0.
- `gat-07-exact-proof` está en **idx 34 > 14**: `modern-rescue-checkpoint-state` corrió y pasó **antes** del corte fail-fast, como declara el informe.
- El informe preserva **las dos corridas** (`D7.out` rojo, `D7b.out` verde) en la evidencia durable y declara la del major pineado como la válida — que es la clasificación correcta: deriva de entorno local, cero causalidad con el lote. Sin maquillaje.

## 6. Kimi y perímetro

Kimi fuera de la cadena en todo el lote: ni gate, ni espera, ni atribución; el README ya no lo nombra como auditor activo (1→0) y las menciones que quedan son las que los binding topics de `program-check` exigen (retiro documentado `Kimi K3` + `2026-08-21`). El lote no tocó roadmap/, registry, themes, manifests generados ni evidencia de browser — probado por el porcelain de 6 líneas y el SHA del roadmap.

## 7. Observación no bloqueante

- **O-1** El comentario de la entrada de gate está en inglés; el brief §6 lo redactó en castellano. El contenido es fiel línea por línea (racional, cobertura de `lane-control-drills`, razón del orden) y el inglés es el idioma de todos los comentarios de ese archivo. Ningún stop ni digest pinea esos bytes. Registrado como observación, no como hallazgo.

---

## Cierre

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454` · staged 0 · porcelain = roadmap preexistente byte-idéntico + los cinco paths del lote, re-verificado al cierre de la inspección.
- Cero writes al repo; cero pedidos de commit. Write-set exacto de esta sesión: este memo y `/private/tmp/f4a-pre-k4-hardening-fable-postaudit.ready`.

# VERDICT FINAL: ACCEPT

El lote de hardening pre-K4 queda postauditado y **aceptado**: el diff vivo es el mandado, las pruebas del informe son verdaderas donde pude re-medirlas y consistentes donde no, la corrección N2 se acepta como mejora de precisión sin pérdida de detección, y el rojo Node 25 queda adjudicado como deriva de entorno ajena al tranche. El sellado (commit del lote) es decisión del DT; este memo no lo ejecuta ni lo solicita.
