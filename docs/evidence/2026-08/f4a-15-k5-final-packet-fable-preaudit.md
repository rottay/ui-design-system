# F4A-15 / K5 — preauditoría Fable 5 del paquete FINAL para Kimi (read-only)

VERDICT: REJECT — cinco correcciones mínimas, exhaustivas y falsificables para una v2; el cuerpo del paquete (colisiones, MEASURED, los siete OPEN_KIMI, la regla de los 98, el anti-clausura-falsa y el prompt en su forma) es sólido y NO se reescribe.

Auditor: Fable 5 (read-only). DT: Codex. Fecha: 2026-08-21.
Paquete: `/private/tmp/f4a-15-k5-final-decision-packet-opus.md` — SHA-256 `5e53fcad8a0281e482c22f626ae12d4304380ba798651da0d10b1262a046818b` (verificado byte-exacto).
Insumos verificados byte-exactos: K4 brief v3 `06ecaa76c0a54b018fa91ca5d1bc68326e83e0af8af49c7779361a9ec0622ff1`; mi ratificación K5c `f0a972c08134c3c307435db15a86d498c4bd826708d8789ad574a2e622b6f967`.
HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, worktree limpio, staged 0 — apertura y cierre. **Cero writes de repo/K4/K5; cero build/generadores/tests mutantes/git mutante.**

## Correcciones exactas para la v2 (las cinco, en orden de severidad)

### C-1 (BLOQUEANTE — chequeo 1): la justificación de precedencia de §0.1 es FALSA — reproducido, no adoptado por sospecha

§0.1 afirma: *"El estado de K4 vive en los mismos archivos que K5 tocaría (`bithire/index.ts`, `rottay/index.ts`, `evnto/index.ts`)"*. Contra el K4 brief v3 (byte-verificado): su write-set es **exactamente** `packages/core/manifest/cascade/root-catalog.json` + `docs/f4a/roster-variantes.json` + `docs/f4a/roster-variantes.md` (v3 §1, hashes en líneas 63-65), y su **invariante 1 PROHÍBE tocar los tres brand themes**: *"Cero fuente de tema. Los 3 `brand-themes/*/index.ts` byte-idénticos, probado por hash"* (v3 §4.1, línea 352). Los write-sets de K4 y K5 son **disjuntos**; el paquete afirma lo contrario de lo que la propia invariante de K4 garantiza. La sospecha de Codex queda **confirmada por reproducción**.

**Corrección exacta** (la conclusión K4-primero SE CONSERVA; se corrige la premisa): reemplazar la frase por la base verdadera de la precedencia — **(i)** orden del programa: la secuencia del checkpoint es F4A-14 (K4) antes de F4A-15 (K5), y el frente serializa un lote por vez bajo el DT; **(ii)** la corrección única de roadmap/checkpoint fue adjudicada a ejecutarse DESPUÉS de K4 (Opus K5 v1 §8, sostenida por mi challenge); **(iii)** ambos lotes re-corren la misma cadena de verificación/gates, que el DT serializa. Nada de eso depende de compartir archivos — y decir que los comparte induciría a un lector a inferir conflictos de merge inexistentes o, peor, a relajar la invariante 1 de K4.

### C-2 (chequeo 2): la fila de los dos 37 en §2 niega un hecho MEDIDO del propio corpus

§2 dice de los dos 37: *"ningún insumo establece que sean el mismo conjunto. Este paquete no lo afirma."* Falso sobre el corpus: mi auditoría K5c (SHA `6e11dca1…`, insumo de la ratificación que este paquete lista como entrada de primer grado) **midió la biyección**: los 37 campos emisibles de `BrandTableChrome` coinciden **1:1** con la unión léxica autorada — cero campos del tipo que ningún tema autore, cero hojas autoradas fuera del tipo (verificado campo a campo contra `themes/index.ts:2060-2107`). **Corrección**: reclasificar la fila como MEASURED ("misma cardinalidad Y mismo conjunto, biyección medida — auditoría Fable K5c"), citándola. Esto FORTALECE el análisis de los dos 34 (que es correcto y queda intacto: el 34 semántico contiene los 3 muertos y colapsa padding; el 34 consumido los excluye y cuenta padding ×4 — verifiqué su prueba de consumo y es consistente con mi propio censo). Sugerencia menor en la misma tabla: existe un TERCER 34 en el propio paquete — el destino del contador de K5a (40→34) — que por la disciplina que §2 exige merece su fila o una nota.

### C-3 (chequeo 4): contradicción interna §0.3 vs §7-K5a sobre la puerta Kimi

§0.3 fija el orden global: *"K4 cierra -> Kimi adjudica los 7 -> DT emite brief -> recién ahí existe un write-set. Saltarse un eslabón es condición de PARADA."* Pero la fila K5a de §7 declara como precondición *"K4 cerrado. Ninguna decisión de Kimi"* — un write-set que existiría SIN el eslabón Kimi. Contradicción real. Por la orden del owner (cada paso se consulta con Kimi), **corrección**: la precondición de K5a pasa a *"K4 cerrado + respuesta de Kimi al paquete recibida"*, con la aclaración de que K5a **no depende de ninguna de las siete decisiones** (su contenido sigue siendo mecánico: las 5 ya-derivadas + `cellFontSize`) pero **no salta la cadena de consulta**. Alternativa inferior pero coherente: que §0.3 escriba la exención explícita — lo inaceptable es que las dos secciones se contradigan.

### C-4 (chequeo 6): la receta de restore sobre-afirma seguridad

`git show HEAD:<path> > <path>` **pisa** cualquier cambio previo no commiteado del archivo; es seguro sólo bajo el protocolo que K4 v3 sí escribe y este paquete omite. **Corrección** al preámbulo de pruebas causales de §7: el restore presupone **(i)** hashes de pre-estado del write-set capturados a /tmp ANTES de escribir, **(ii)** verificación de que los archivos del write-set estaban limpios al abrir el lote, **(iii)** respaldo por copia verificada por hash (protocolo K4 v3 §Restore), **(iv)** diff post-restore contra el pre.sha; y la ley general: **sólo se restauran archivos del write-set** — el estado dirty AJENO (p. ej. `stash@{0}`) se preserva siempre.

### C-5 (chequeo 9): el prompt a Kimi no porta el SHA de su insumo único

El prompt ordena *"Verificá su SHA-256 al abrir"* sobre el paquete, pero no da valor ni marcador — Kimi no puede verificar contra nada. Como este REJECT fuerza reemisión de todos modos, **corrección**: añadir en el prompt la línea `SHA-256 del paquete: <<RELLENA EL DT AL EMITIR v2>>`, a completar por el DT tras generar la v2 (el documento no puede auto-incluir su hash). El resto del prompt está completo y correcto: las siete decisiones con sus opciones, la forma de K-5 (por vertical y por eje, manta inadmisible, 46 no es cantidad de placeholders), la regla de consecuencias-aceptadas, la prohibición de inventar números, las colisiones, la regla contractual de los 98, "ACCEPT ≠ habilitación", el STOP global, el write-set de dos archivos y la obligación de reportar HEAD/worktree/SHAs.

### Nit no bloqueante

§12 dice "las 10 reglas `data-anatomy-table`": son **9 sitios selectores** (2126,2131 ruled; 2140,2148,2154 zebra; 2167,2173,2178,2183 open) más la línea de comentario 2114 — decir "9 selectores" o "10 líneas".

## Lo sospechado que NO es error (verificado a favor del paquete)

- **M-14, byte-claim de rottay**: VERIFICADO — el artefacto emite `--ds-color-bg-primary: #0C0C0E` (rottay/index.css:336, mayúsculas), byte-idéntico al literal fuente `'#0C0C0E'` de `bg`/`rowBg`. La distinción color-vs-byte del paquete es correcta y este caso está bien citado como el byte-medido.
- **§5, citas de `token-overrides`**: VERIFICADAS verbatim contra `capabilities/index.ts:431-450` — `tier: 'pro'`, `defaultBehavior: 'none; closed allowlist, max 200 entries, fails closed'`, `compat: 'escape hatch, not the model: every recurring override is a candidate for a real capability'`. La tabla de tres tiers es sólida y mantiene `tokenOverrides` ≠ `pro-expert` (éste exige capability propia; PRO_EXPERT=0 en table, M-11 ✓).
- **La colisión de los dos 34**: correcta y bien probada — el contraste de consumo (muertos 0/0/0 vs padding 1/1/1/3) es consistente con mi censo propio (132/34/3/98) de la ronda K5c.
- **`variant-parity.baseline.json` como destino de "Baja #14"**: LEGÍTIMO — es la autoridad manual decrease-only con 13 Bajas precedentes escritas a mano por el DT tras regenerar (no es un `manifest/generated/*`); el protocolo "después de regenerar y verificar" del paquete es el correcto. K5c no se mezcla con K5a/K5b en ninguna fila ✓.
- **Chequeo 3**: exactamente SIETE `OPEN_KIMI` (los seis de Opus v2 + K-7 del plano atributo), ninguno adjudicado, ninguna posición atribuida, y la advertencia "ACCEPT de Fable ratifica MEDICIÓN y ARQUITECTURA, NO implementación" está en §4, §10 y en el prompt (regla 6) ✓. Los contenidos obligatorios de K-6 (convergencia con rottay, el comentario del radius, la coincidencia base + divergencia dark + fallback del skin para el par H4) son exactamente los que yo medí ✓.
- **Chequeo 5 (contadores)**: K5a 40→34 exacto (−6); K5a+ sin movimiento de contador con la prueba correcta (retiro del tag de familia `rottay:7259`); K5b →0; K5c paso 3 mueve `divergentSlots`, nunca `untaggedAuthoredLeaves` ✓.
- **Chequeo 7 (sidecar)**: las tres condiciones ratificadas están íntegras (ley en el TIPO, domicilio bajo `variant-parity` con rechazo explícito del root nuevo, `plane` desde el día uno), condicionado a K-7, nada escrito ✓ — no crea segunda autoridad.
- **Chequeo 8 (responsive/premium)**: §9 es explícitamente anti-progreso-falso ("presentar K5 como avance de responsive sería falso"; premium sólo indirecto; declaración anti-clausura-falsa) ✓ — no falsea progreso.

## Comandos read-only ejecutados

`git rev-parse HEAD`, `git status --porcelain`, `git diff --cached --name-only` (apertura y cierre); `shasum -a 256` de los tres insumos; lectura completa del paquete; verificación del write-set e invariante 1 de K4 v3 contra el documento byte-verificado (líneas 14, 63-65, 352); `grep`/`sed` contra el árbol: `rottay/index.css:336` (casing de `--ds-color-bg-primary`), `capabilities/index.ts:430-450` (bloque token-overrides completo). Los censos y conteos citados por el paquete (132/34/3/98, 40, 46=16/0/30, dos 34, biyección de los 37, reglas de anatomy, byte-checks) ya estaban re-verificados por mí en las rondas K5/K5c sobre este MISMO árbol (HEAD idéntico, verificado). **Cero escrituras al repo; write-set exacto de esta ronda: este memo y su `.ready`.**

## Repo intacto

Cierre verificado: HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, porcelain 0, staged 0. K4/K5 intactos.

## Resumen para la v2

Cinco ediciones puntuales, ninguna estructural: (C-1) reescribir la premisa de precedencia de §0.1 con los write-sets reales y las tres bases verdaderas del orden; (C-2) reclasificar los dos 37 como MEASURED-mismo-conjunto citando la auditoría K5c, y anotar el tercer 34; (C-3) alinear §7-K5a con §0.3 (puerta Kimi en la precondición o exención explícita en §0.3); (C-4) blindar la receta de restore con el protocolo K4 v3; (C-5) marcador de SHA del paquete en el prompt a Kimi. Con esas cinco, el paquete queda emitible hacia Kimi sin re-medir nada.
