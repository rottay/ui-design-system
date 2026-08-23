# F4A-15 / K5 — ratificación Fable 5 del paquete FINAL v2 (read-only)

VERDICT: ACCEPT

Auditor: Fable 5 (read-only). DT: Codex. Fecha: 2026-08-21.
Paquete v2: `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md` — SHA-256 `c29bf3fbfd5cdbf81b106d595c70c4572b2864549fdc52746aaf951f27a3ae15` (verificado byte-exacto).
Mi REJECT previo: SHA-256 `44414513d85d4b3d0d34c177be330b26629a8c61abc0d8a29de1dca582d608ca` (verificado byte-exacto).
HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, worktree limpio, staged 0 — apertura y cierre. **Cero writes de repo/K4/K5; cero build/generadores/tests/git mutante.**

## Las cinco correcciones + nit — verificadas una a una, reproducidas donde había claim nuevo

**C-1 (§0.1) — INCORPORADA Y CORRECTA.** La v2 declara los write-sets de K4 y K5 **disjuntos** con los 3 paths exactos de K4 v3 y su invariante 1 citada verbatim ("Cero fuente de tema… byte-idénticos, probado por hash"), retira explícitamente la afirmación falsa de v1 ("compartían archivos: era FALSO y queda retirado") con la razón de por qué era dañina, y conserva la precedencia K4-primero sobre las tres bases verdaderas de mi REJECT (orden F4A-14→F4A-15 + un-lote-por-vez; corrección de autoridades post-K4 per Opus K5 v1 §8; serialización de la cadena de gates). **Caza de regresiones**: cero claims residuales de K4 tocando temas en todo el documento — la única mención es la retractación. Las citas de línea nuevas contra K4 v3 las reproduje contra el archivo crudo: `## 4. Invariantes` en la línea 350 con la invariante 1 en 352 ✓ y `## 9. Restore` exactamente en la línea **491** ✓ (archivo de 536 líneas) — los rangos 348-352 y 491-506 de §12 son correctos.

**C-2 (§2) — INCORPORADA Y CORRECTA, con un añadido verificado.** La fila de los dos 37 ahora dice **"SÍ — MISMO CONJUNTO: biyección 1:1 MEDIDA"** citando mi auditoría K5c (`6e11dca1…`) con el método (campo a campo contra `themes/index.ts:2060-2107`), y reconoce que v1 negaba un hecho del corpus. El **tercer 34** (destino del contador de K5a, 40→34) tiene su propia fila con la advertencia de que los tres 34 significan cosas distintas ✓. El añadido nuevo de la v2 — la derivación "37 = 38 − `anatomy`" apoyada en "**anatomy autorado por 0 de los 3 temas (0 menciones)**" — lo reproduje esta ronda: `grep -c anatomy` = **0 / 0 / 0** en `rottay/bithire/evnto/index.ts` ✓. La colisión de los dos 34 queda intacta y correcta.

**C-3 (§0.3 + §7 fila K5a) — INCORPORADA SIN EXENCIÓN RESIDUAL.** §0.3 ahora dice "Sin excepción, tampoco para K5a: su contenido no depende de ninguna de las siete decisiones, pero no salta la consulta exigida por el owner"; la precondición de la fila K5a es "**K4 cerrado + respuesta de Kimi al paquete recibida**" y su STOP añade "Despachar sin respuesta de Kimi -> PARAR (§0.3)". Barrí el documento entero: **ninguna otra fila ni párrafo conserva una vía sin puerta Kimi** (K5a+ y K5b exigen respuestas K-N por escrito, que SON respuestas de Kimi; K5c pasos 2-3 exigen K-5/K-7; sidecar exige K-7).

**C-4 (§7 preámbulo) — INCORPORADA COMPLETA.** El protocolo de restore ahora es el de K4 v3, íntegro y en orden: (1) prehashes a /tmp ANTES de escribir (write-set + temas + artefactos), (2) **write-set limpio al abrir, con PARAR si un archivo ya venía sucio**, (3) respaldo por copia verificada por hash, (4) **restore desde el respaldo exacto** con diff/hash post-restore contra el pre-estado y porcelain vacío; más la ley general: sólo se restauran archivos del write-set, **el dirty ajeno se preserva siempre** (stash@{0} nombrado), y checkout/reset/stash prohibidos por la ley post-incidente. **No queda ningún `git show HEAD:<path> > <path>` presentado como receta universal** — la v2 lo declara explícitamente NO seguro salvo bajo el protocolo.

**C-5 (§13) — INCORPORADA.** El prompt porta el marcador `SHA-256 del paquete: <<RELLENA EL DT AL EMITIR v2>>` con instrucción fail-closed ("Si no coincide, PARÁ y reportalo") y el path actualizado al archivo v2. El resto del prompt está completo: las siete decisiones con sus opciones, la forma obligatoria de K-5 (por vertical y por eje, manta inadmisible, 46 no es cantidad de placeholders), consecuencias-aceptadas, prohibición de inventar números, colisiones (incluidos los dos 34 distintos), la regla contractual de los 98, "ACCEPT ≠ habilitación", STOP global, write-set de dos archivos, y el reporte obligatorio de SHAs/HEAD/worktree.

**nit (§12) — INCORPORADO**: "9 selectores + línea de comentario 2114 — 10 líneas, 9 selectores" ✓ (coincide con mi conteo: 2126/2131 ruled, 2140/2148/2154 zebra, 2167/2173/2178/2183 open).

## Cuerpo validado y decisiones — intactos

- Las tablas MEASURED (M-1…M-15), FABLE_ACCEPTED (F-A…F-H), la regla de los tres tiers de §5 (tokenOverrides ≠ pro-expert, citas verbatim que yo mismo verifiqué contra `capabilities/index.ts`), la matriz de tranches, el sidecar condicionado a K-7, el impacto anti-clausura-falsa de §9 y la tabla de errores-de-v1 de §10 están **byte-coherentes con la v1 en todo lo que mi REJECT validó a favor** — ninguna edición se salió de los sitios marcados `[C-N]`/`[nit]`.
- **Los siete `OPEN_KIMI` siguen exactos e intactos** (K-1…K-7, con sus opciones y consecuencias medidas), ninguno adjudicado, ninguna posición atribuida, ningún consenso inferido.
- **El paquete NO habilita implementación**: §0.2, la advertencia central de §4, la regla 6 del prompt y el STOP global lo dicen en cuatro sitios. Placeholders sembrados: 0, sin cambio.
- La trazabilidad de sucesión es ejemplar: §1 incorpora v1, mi REJECT y el K4 brief v3 como insumos de primer grado byte-verificados, y la tabla "Sucesión v1 → v2" mapea cada corrección a su sitio.

## Declaración de cierre (condiciones del ACCEPT)

1. **El DT puede emitir el prompt externo a Kimi**, rellenando el marcador con el **hash real del paquete v2**: `c29bf3fbfd5cdbf81b106d595c70c4572b2864549fdc52746aaf951f27a3ae15`.
2. **K4 sigue primero**: nada de este paquete —ni siquiera K5a— se despacha antes del cierre de K4, y la respuesta de Kimi al paquete es precondición de todo write-set (§0.3, sin excepción).
3. **La cuota de Kimi es un bloqueo EXTERNO**: la disponibilidad del destinatario (Kimi K3, cuya cuota agotada motivó la sucesión de DT del 2026-08-21) no la resuelve este paquete ni esta ratificación; hasta que el owner disponga del canal Kimi, la cadena queda en espera sin que ello habilite atajo alguno.
4. Esta ratificación, como todas las anteriores, **ratifica material de adjudicación — no implementación**: cero tags, cero placeholders, cero sidecar, cero gate, cero corrección de prosa quedan habilitados.

## Comandos read-only ejecutados

`git rev-parse HEAD`, `git status --porcelain`, `git diff --cached --name-only` (apertura y cierre); `shasum -a 256` de ambos insumos; lectura completa del paquete v2 con verificación sitio por sitio de las seis ediciones contra mi REJECT; reproducción de los dos claims nuevos: `wc -l` + `grep -n` sobre el K4 brief v3 crudo (536 líneas; §4 Invariantes en 350-352, §9 Restore en 491) y `grep -c anatomy` sobre los tres `brand-themes/*/index.ts` (0/0/0). Todo lo demás citado por la v2 (biyección de los 37, dos 34, censo 132/34/3/98, byte-claim de rottay, token-overrides, reglas anatomy, contadores, K4 write-set/invariante) ya estaba reproducido por mí en las rondas previas sobre este MISMO árbol (HEAD idéntico verificado). **Cero escrituras al repo; write-set exacto: este memo y su `.ready`.**

## Repo intacto

Cierre verificado: HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, porcelain 0, staged 0. K4/K5 intactos.
