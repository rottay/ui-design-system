# F4A-14a v2 — reauditoría Fable 5 del brief reemitido (read-only)

VERDICT: REJECT — un único defecto nuevo, clase P0, con corrección exacta de tres números; las ocho correcciones de mi REJECT previo están incorporadas y verificadas de primera mano. Reemisión quirúrgica.

Auditor: Fable 5 (read-only). DT: Codex. Fecha: 2026-08-21.
Brief auditado: /private/tmp/f4a-14a-opus-implementation-brief-v2.md — SHA-256 `99b31ed5fcd849fe008232a2097a971c5442ac5f70b66f184913b6801be00e76` (verificado byte-exacto).
Mi REJECT previo: /private/tmp/f4a-14a-fable-preaudit.md — SHA-256 `50b307dedc89c751c9b77096d8a0a0dd5470258af76e985faa4c0203932adbd2` (verificado byte-exacto).

## Snapshot observado

- HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, worktree limpio (0 porcelain).
- Los 3 hashes de pre-estado del write-set siguen exactos a §1 del brief (re-medidos esta ronda: catálogo `35a6912f…`, roster.json `7c8f562b…`, roster.md `1808731f…`).
- Invariantes vivas re-confirmadas: 64 raíces, channelStatus 48/10/6 (→47/10/7 con la única movida autorizada), exposure 26/28/10; gates verdes en pre-estado (corridos en mi preauditoría; árbol sin cambios desde entonces por hash).

## Finding nuevo

### P0-2. §2.9 y §5: el total mandado de `method.assignments` (256 = 93+94+69) es medible-mente falso — el derivable real post-reparación es **261 (rottay 95, bithire 96, evnto 70)**.

Medición de primera mano (suma de las `assignments` de las 64 raíces del catálogo en pre-estado):

- **Suma actual: 268 (rottay 101, bithire 97, evnto 70)** — NO 263 (99/95/69) como asume el brief. La prosa de `method.assignments` dice 263/99/95/69.
- **Reconciliación exacta del drift**: `tier.page.ink` — la raíz 64, agregada por F4A-6 según la propia `reconciliation.byExposure.reading` del catálogo — carga `assignments {total:5, rottay:2, bithire:2, evnto:1}`. 263+5=268, 99+2=101, 95+2=97, 69+1=70: cuadra al entero. El 263 SÍ era derivable — del snapshot de 63 raíces para el que la prosa fue escrita; F4A-6 sumó la raíz sin actualizar la prosa.
- **Delta de las reparaciones** (verificado: raised.fg rottay −2, overlay.fg rottay −2, overlay.bg rottay −2 y bithire −1; total −7 — la aritmética del brief sobre el delta es correcta): 268−7 = **261 (95, 96, 70)**. El 256 del brief es 263−7: resta bien sobre una base equivocada. El "69" de evnto delata la herencia de la prosa stale (evnto real: 70, y las reparaciones no lo tocan).
- **La propia stop condition 9 del brief dispararía**: un worker que "recalcule y escriba el total nuevo" como manda §2.9 deriva 268 en pre-estado, no puede reconciliar el 263, y §10 además le prohíbe copiar el número del brief ("derivado, no copiado"). El lote como está escrito NO puede completarse sin contradecir su propio texto: es un deadlock, no una corrupción silenciosa — mérito de stop 9 y de la cláusula de §10, que convierten el número falso en parada en vez de en dato falso. Pero un brief cuyo paso obligatorio manda escribir un valor inalcanzable no es emitible.

**Corrección exacta (3 números + narrativa):**

1. §2.9: "Delta: rottay −6, bithire −1 → **261 (rottay 95, bithire 96, evnto 70)**", con la base declarada: *"la prosa dice 263 (99/95/69) para el snapshot de 63 raíces; el catálogo de hoy suma 268 (101/97/70) porque F4A-6 agregó `tier.page.ink` (+5: rottay +2, bithire +2, evnto +1) sin actualizar la prosa"*.
2. §5, fila `method.assignments`: "263→" reemplazado por "268→**261** (101→95, 97→96, 70)" — o la forma que el DT prefiera, siempre con 261/95/96/70 como destino.
3. La entrada en `corrections` narra AMBOS hechos: (a) el drift preexistente de F4A-6 (263→268 nunca asentado), y (b) el delta K4 (−7). Stop 9 se conserva con el diagnóstico corregido: *"si la suma post-reparación no da 261, PARAR"*.
4. Alternativa igualmente aceptable: el DT adjudica el drift F4A-6 como hallazgo aparte ANTES del lote y el brief sólo escribe el delta −7 sobre la base que el DT fije. Lo único inaceptable es el 256.

## Reauditoría de mis correcciones previas — las ocho, contra el árbol

1. **P0-1 (assignments base+dark de raised/overlay fg)** — INCORPORADA Y CORRECTA: §2.1/§2.2 ahora `{total:2, rottay:0, bithire:2, modes:{bithire:["base","dark"]}}`, con la columna "actual" completada con los modes reales (rottay `["base","light"]`, bithire `["base","dark"]` — verificados contra el catálogo). La evidencia nueva es real: `authoredLeafPaths` existe (export de `manifest/mirror-parity/index.mjs`, consumido por `variant-parity/index.test.mjs:21,468`), y las emisiones citadas son exactas (`:741`/`:1566` raised, `:717`/`:1545` overlay-fg, bloque dark abre en `:1251` y corre hasta EOF). La preservación explícita de la posición dark de bithire quedó además en el invariante 8 y en los fences.
2. **P1-1 (58/174)** — INCORPORADA: §3 dice "las 58 raíces restantes (174 entries) no se tocan" ✓ (198 = 66×3, 8 reparadas, re-verificado).
3. **P1-2 (ancla del governor)** — INCORPORADA, y la corrección del brief A MI hallazgo es CORRECTA: verifiqué el texto exacto del roster — las 9 entries (3 raíces × 3 temas; 3 bithire: `color.border`, `--ds-color-text-secondary`, `--ds-color-text-page`) llevan `"dial: (raiz autora — dial en F4B)"`, no el texto genérico de fuente. Mi regex `/dial en F4B/` matcheaba ambos vocabularios y mi preauditoría atribuyó al roster el texto de los tags; el número (3 bithire) era correcto, la atribución de vocabulario no. Los conteos de fuente del brief son exactos: `"sin control atribuido en mapa-familia-canales F4A-3a"` = **797 rottay / 618 bithire / 95 evnto** (grep -c verificado). La declaración de que la reparación de overlay.bg agrega una cuarta entry bithire deliberada está escrita (§4.7) ✓.
4. **P2-1 (rótulo NOOP)** — INCORPORADA: invariante 6 conserva la instrucción sin el rótulo inexistente ✓.
5. **P2-2 (predicado del 17)** — INCORPORADA: §2.4 escribe ambos predicados con sus resultados (case-sensitive `[Pp]adding` → 15/17/0; minúscula → 15/15/0) y la ley "si se escribe el número, se escribe el predicado" ✓ — coincide exactamente con mi medición (los 2 extra son `textareaPaddingX/Y` autorados en bithire 5871/5876; placeholders en rottay). Gap 7/7/0 exacto bajo ambas capitalizaciones ✓.
6. **P2-3 (method.assignments)** — INCORPORADA EN FORMA, FALLADA EN VALOR: el mecanismo (recalcular + asentar en `corrections` + stop 9 de derivabilidad) es exactamente lo que pedí y está bien construido; el valor mandado es el P0-2 de arriba. Nota de honestidad propia: mi preauditoría estimó el delta "−6 o −9" desde el 263 de la prosa sin sumar el catálogo; la suma real (268) es de esta ronda. `reconciliation.byExposure` no afectada ✓ (re-confirmado: renombrar canal no mueve exposures).
7. **P2-4 (collapses/derivation + headers .md)** — INCORPORADA: el segundo canal va sólo a `derivation`/`evidence`, nunca a `collapses` (fence explícito §7) ✓; los headers listados son :503 y :577 más "el equivalente de overlay.fg" — ese header es **`.md:523`** (`tier.overlay.fg · --ds-color-text-primary ·`), medido; conviene fijar el número. Nit cosmético: la celda P2-4 de la tabla §0 dice "headers en `.md:185/503/577`" — :185 es el texto-licencia de effect.intensity (§2.7), no un header. Barrido de consistencia que dejo medido para el worker: las líneas del .md con los canales viejos son :503/:523/:577 (las de este lote) y :469/:495 (`tier.base.fg`, `tier.control.fg` — NO son de este lote y no se tocan) más la prosa de :717 (cita histórica, no se toca).
8. **P2-5 (iconSize residuo, K4 no cerrado)** — INCORPORADA SIN CLAUSURA FALSA: §2.8 declara la reparación PARCIAL con el registro medido del canal real (`--ds-input-md-icon-size`/`--ds-button-md-icon-size`; piso `icon.css:21` para `--ds-icon-md-size`), fence de no tocar `roots[41].channel`, §10 exige declararlo en el reporte y §11 lo lista abierto junto con el scope, la proyección, la semántica de asignación de dos brazos y la clase F4B ✓. Ninguna parte del brief vende K4 como cerrado: el lote es 14a (8 raíces) y §11 enumera lo que queda.

## Verificaciones estructurales re-confirmadas

- **Write-set exacto de 3**: mismos paths, hashes de pre-estado exactos; prohibidos con referentes reales; `stash@{0}` ajeno presente.
- **Cero tema/materialización**: el write-set no toca fuente de tema ni artefactos; invariantes 1-2 probadas por hash en la batería; la decisión del DT (preservar declinación, 0.58 intocable) está en §2.7 con las citas de fuente exactas (rottay `3767-3769`, evnto `2076-2078` — verificadas byte-coherentes en mi preauditoría, árbol sin cambios).
- **64 y 47/10/7 y 26/28/10**: verificados; la movida existe→solo-artefacto sigue siendo obligada por el freshness gate (0 declaraciones autoradas de `--ds-material-overlay-foreground`); ningún control declara los canales nuevos (LAW 2 verde post-repair); `token-overrides` existe (LAW 1).
- **Semántica de asignación declarada (§2.3/§4.9)**: la elección del DT ("emisión del canal cabeza por modo") aplicada uniformemente reproduce exactamente los tres resultados corregidos (×2/×2/×1) — coherente con la asimetría medida (`:716` base-only vs `:1664` dark-secundario) — y §11 deja la cuestión general abierta ✓.
- **Stop/restore**: stop 2 no puede disparar en falso (gate sin hash ni productor — verificado); stop 6 negativo verificado (cero generadores/consumidores de `roster-variantes`); restore sin `git checkout` ✓; stop 9 nueva es correcta en su disparo (y dispararía hoy — ver P0-2) con el diagnóstico a corregir.
- **Sin falsa clausura**: §2.8 + §10 + §11 ✓.

## Comandos read-only ejecutados

`git rev-parse HEAD`; `git status --porcelain`; `shasum -a 256` (brief v2, mi REJECT previo, los 3 del write-set); `node -e` de suma de las 64 `assignments` (total y por tema) + simulación del delta −7; `node -e` sobre el roster (texto exacto del governor de las 9 entries F4B); `node -e` sobre `tier.page.ink` y la prosa exacta de `method.assignments`; `grep -c` de los tags de fuente en los 3 temas; `grep -n` de canales viejos en el .md y de `authoredLeafPaths` en packages/core. Cero escrituras en el repo, cero tests/build/generadores, cero git mutante; write-set exacto de esta ronda: este archivo y su `.ready`.

## Condición exacta de reemisión (v3)

Única corrección bloqueante — tres números y una narrativa:

1. §2.9: destino **261 (rottay 95, bithire 96, evnto 70)**, con la base declarada (prosa 263 = snapshot de 63 raíces; hoy 268 = 101/97/70 por `tier.page.ink` +5 de F4A-6; delta K4 −7).
2. §5 fila `method.assignments`: **268→261 (101→95, 97→96, 70)**.
3. `corrections` narra el drift F4A-6 y el delta K4 como dos hechos; stop 9 con diagnóstico "si la suma post no da 261, PARAR". (Alternativa: el DT adjudica el drift aparte y el brief escribe sólo el −7 sobre la base que el DT fije; lo único inaceptable es el 256.)

Opcionales no bloqueantes: fijar `.md:523` como el header de overlay.fg; corregir la celda §0 "185/503/577" → los headers son 503/523/577 (185 es la licencia de §2.7); una línea en `corrections` por la prosa "63 raíces" de `method.roots`/`reconciliation.statement` (mismo vintage F4A-6), ya que se abre el campo igual.

Con el 261/95/96/70 escrito, el lote es ACCEPTABLE sin re-medir nada más: todas mis correcciones previas están correctamente incorporadas y verificadas contra el árbol de primera mano.
