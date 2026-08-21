# PROMPT DE CONTINUACIÓN — DT del roadmap de remediación del design system

> **Para un agente Kimi (K3, esfuerzo máximo) que retoma el trabajo de
> DT/coordinador desde OTRA CUENTA.** Leyendo SOLO este archivo tenés que poder
> salir andando. Leélo entero antes de tocar nada. El estado vivo y detallado
> está en `docs/ROADMAP-EJECUCION-2026-08-19.md` §13 (mismo directorio); si algo
> acá contradice §13, **gana §13** (se actualiza con cada lote; este prompt es
> una foto al último commit).
>
> Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (monorepo; el paquete
> del DS es `packages/core` = `@rottay/design-system`). Rama: `main`. **Nunca
> push.** Un commit por lote. Publicar versiones está permitido.

## 1. Quién sos y cuál es el modelo operativo (orden del dueño, 2026-08-20)

Sos el **DT/coordinador** del programa. Identidad vigente (roadmap §12,
decisión 13; constitución reconciliada en commit `85d0583b9`):

- **Vos (Kimi K3)**: DT. Diseñás los lotes, escribís briefs, verificás CADA
  reporte de worker contra el árbol (nunca de palabra), sellás gat-07,
  commiteás. Implementás SOLO piezas críticas (constitución, gates-manifest,
  adjudicaciones de arquitectura). Todo lo mecánico se delega.
- **Workers Claude vía tmux**: ejecutan los lotes. Opus para riesgo alto,
  Sonnet para mecánico puro. **NUNCA commitean ni pushean**: dejan el árbol
  listo, escriben reporte en `/tmp` y levantan flag file. Vos verificás contra
  el árbol, sellás y commiteás.
- **Fable 5**: auditor independiente (terminal `fable-ejec`). Audita AL CIERRE
  DE CADA FRENTE antes de abrir el siguiente. DT ≠ auditor (decisión 13): vos
  no te auditás a vos mismo.
- Codex ya no está en el loop.

## 2. Operatoria EXACTA de las terminales (tmux + Claude CLI)

**Las terminales son procesos del OS del usuario de macOS: sobreviven al
cambio de cuenta de Kimi.** No las pierdas — su contexto de conversación es
trabajo acumulado de Claude que no está en ningún archivo.

### Terminales vivas y su estado (verificar con `tmux ls`)

- `f05-opus` — **Claude Opus**, la más valiosa ahora: tiene TODO el contexto
  del roster F4A-1 (mediciones, método `compileBrandTheme`, los nudos). Usala
  para F4A-2…F4A-15. NOTA: tiene un texto colgado en el input
  ("F4A-2: el harness de paridad que lee el roster") que no se deja borrar con
  C-u/BSpace/Escape; si se llega a enviar solo, ignorá la respuesta y mandá el
  brief real completo.
- `f05-sonnet` — Claude Sonnet, contexto de la reconciliación de identidad.
  Reutilizable para lotes mecánicos nuevos.
- `fable-ejec` — **Claude CLI con modelo Fable**, el auditor. Tiene el contexto
  de la auditoría de cierre de F2. NO se limpió después; antes de pedirle la
  auditoría de F4A evaluá `/clear` (su veredicto F2 está en
  `/tmp/fable-f2-cierre-verdict.md`, no se pierde).
- `f02-sonnet`, `fable-f0` — viejas, contexto de F2/F0. Se pueden cerrar
  (`tmux kill-session -t <nombre>`) o dejar; no tienen nada pendiente.

### Cómo se lanzaron (por si tenés que recrear alguna)

```bash
tmux new-session -d -s <nombre> -c /Users/daniel/Developer/Rottay/ui-design-system
tmux send-keys -t <nombre> "claude --model <opus|sonnet|fable> --dangerously-skip-permissions" Enter
```

El `--dangerously-skip-permissions` es OBLIGATORIO (orden del dueño): sin eso
Claude se frena a pedir permiso por cada tool call y el trabajo delegado no
avanza. En la status line de la terminal se ve "bypass permissions on". Fable
es el modelo más avanzado de Claude; se usa SOLO para auditar.

### Cómo se opera una terminal (lo que aprendí a los golpes)

- **Leer estado**: `tmux capture-pane -t <nombre> -p | tail -30` (más scrollback:
  `-S -300`). Si está "cocinando" (spinner), NO la interrumpas.
- **Despachar instrucciones CORTAS**:
  `tmux send-keys -t <nombre> "texto" && sleep 1 && tmux send-keys -t <nombre> Enter`.
- **Despachar instrucciones LARGAS (briefs)**: escribilas a un archivo y
  pegalas con buffer — los send-keys largos se truncan o se comen el Enter:

  ```bash
  cat > /tmp/<lote>-brief.md << 'EOF'
  ...brief completo...
  EOF
  tmux send-keys -t <nombre> C-u   # limpiar input (no siempre funciona; ver nota f05-opus)
  tmux load-buffer /tmp/<lote>-brief.md && tmux paste-buffer -t <nombre>
  sleep 1 && tmux send-keys -t <nombre> Enter
  ```

- **Verificá con capture-pane que el brief entró y arrancó** (spinner visible).
- **Convención de entrega**: el worker NUNCA escribe en el repo salvo que el
  brief diga exactamente qué archivos; termina escribiendo
  `/tmp/<lote>-reporte.md` y `touch /tmp/<lote>-listo.txt`. Vos esperás el
  flag, leés el reporte ENTERO, y verificás contra el árbol.
- **Los workers paran cuando la premisa está mal — es una FEATURE, no un
  bug.** Sus paradas fueron correctas 8 de 8 en este programa (la última: me
  falsaron la premisa del nudo K3 con una medición). Leé la parada entera y
  adjudicá vos.

## 3. Estado al momento de este prompt (2026-08-20, ~28h30m de sesión)

**Frentes cerrados con auditoría Fable aprobada:** F0, F0.5, F1, F2
(veredicto de cierre: CIERRE ACEPTADO, cero discrepancias).

**F4A (canon estructural de los 3 themes) — EN CURSO. Hecho:**

- **F4A-0 ✅** medición pre-rewrite (7 predicciones falsifican EXACTO; 5 no
  falsifican → se adjudicaron). Commit `4d25db448`.
- **F4A-1 ✅ CERRADO** — diseño MÍO + roster por Opus, verificado por mí
  contra el JSON. Esquema: la asignación vive EN FUENTE como tags JSDoc de
  vocabulario cerrado `@domicile seed|baseline|derived|pro-expert|unassigned`
  + `@governor <dial|función|razón>` (parseable por harness; artefacto
  compilado byte-idéntico; mismo export; sin segunda foundation). Roster
  final: `docs/f4a/roster-variantes.json` (schemaVersion 3) + `.md` — **66
  raíces × 3 temas = 198 entradas**, BLOCKED 0, seed 85 / derived 33 /
  baseline 0 (a nivel raíz, por diseño) / unassigned 80. TODOS los insumos de
  F4A viven commiteados en `docs/f4a/` (ver su README): el roster + los 3
  documentos de diseño del DT (adjudicaciones definicionales, esquema, parte
  3). Los originales en `/tmp/f4a-1*` son copias de trabajo — el repo manda.
- **Reconciliación de identidad ✅** commit `85d0583b9` (incluye MI fix a
  `manifest/generator/index.test.mjs`: el drill producer=approver usa la
  constante `SIGHTED_APPROVER`; moraleja: el gate `modern-rescue-tooling-drills`
  corre DOS archivos de test — correr uno solo no alcanza).
- **Nudos adjudicados** (detalle en §13): K1 descongelar `--ds-color-primary`
  en F4A-5 SIN cambiar valor (135 lectores arrastrados); K2 `--ds-color-border`
  raíz canónica del par, evnto invierte atadura a pintura idéntica, R35
  REDERIVED, H3 deriva en el mismo lote (F4A-5); **K3-REVISADO: raíz NUEVA
  `--ds-color-text-page`** (la primera versión quedó falsada por el worker:
  `--ds-color-text-secondary` ya existía con otro valor y 262 lectores —
  INTACTO). Valores medidos por tema: rottay `#A0A0A5` base/`#6B6B6B` light;
  bithire `#53697E` base/`#9aacbf` dark; evnto `#3d3d3d` base SIN dark (se
  autora solo en base). Mis rulings: bithire también con text-page aunque era
  cero-delta contra text-secondary (independencia de diales en F4B); evnto sin
  dark (agregar dark no es cero-delta). Ojo: `#A0A0A5` son 50 OCURRENCIAS en
  fuente rottay (42 canales tier.page.fg + 8 hojas ajenas) — el packet F4A-6
  enumera exacto. K4: las 16 asimétricas con valor = resolución computada de
  hoy (F4A-14). K5: tabla bithire = baseline con razón, NO se unifica (F4A-15).
  10 por-crear = seed, materialización a F2-asimétrico/F4B.

**F4A-2 ✅ CERRADO (commit `e6364e90b`, 2026-08-20 noche).** El harness YA
EXISTE: `manifest/variant-parity/` (productor hermano, solo importa de
mirror-parity; parser léxico puro, nunca dist) + gate blocking **#88** +
artefacto `generated/variant-parity.json` + baseline autorado
`variant-parity.baseline.json` (**divergentSlots 2268 ·
untaggedAuthoredLeaves 3686**, decrease-only, falla en las dos direcciones, se
baja A MANO con revisión del DT en el commit del lote que movió el número).
Gramática de tags ya fijada y drillada (22 drills): docblocks, vocabulario
cerrado, herencia por cercanía, placeholders `@placeholder <path>` coherentes.
Su `--check` es frescura + trinquete.
**F4A-3 se dividió tras la parada del worker (9/9):** el roster (plano raíz)
no proyecta sobre las familias de fuente (plano componente) — 64/67 sin
proyección. **F4A-3a ✅** midió el plano familia→canales→control (sonda por
hoja, 3.726 compilaciones): mapa duradero en `docs/f4a/mapa-familia-canales.*`
— 33 limpias / 29 mixtas ENTRELAZADAS (los sub-bloques no existen) / 53 sin
control; el plano canal→raíz-cascada NO existe en ningún artefacto (queda
declarado). **Siguiente lote: F4A-3b (worker, brief TUYO):** canon de
comentarios byte-idéntico guiado por el mapa — kit fijo (banners ya canónicos,
0 trabajo; docblock OVERLAY deduplicado; esqueleto THEME con docblock del kit
SIN tags), tags de familia SOLO en las 33 limpias + `pro-expert` en secciones
de capability activa; las 29 mixtas quedan con nota de clase (sus tags por
hoja aterrizan EN su lote F4A-5…15); las 53 sin-control idem (disposición
final = adjudicación de F4A-close). Cero valores tocados; prueba
byte-idéntica ida y vuelta; baja `untaggedAuthoredLeaves` (3686 → residuo
medido); el baseline lo baja el DT en el commit. **Estado al cierre: F4A-3b ✅
(45 narrativos fuera, 114 del kit, 37 tags — 32 seed + 5 pro-expert;
untaggedAuthoredLeaves 3686→3029, baseline bajado por el DT; divergentSlots
2268 clavado; artefactos byte-idénticos ida y vuelta; gat-07 re-sellado
`fec98f592242…`; leyes rescatadas en `docs/f4a/leyes-fuentes-themes.md`).
Excepción pendiente del DT: `rottay CHROME.statsGrid` (token-overrides no es
dial de rottay en el roster) — nota de clase, se adjudica a más tardar en
F4A-close.** **Estado al cierre: F4A-4 ✅ (90 placeholders del kit — rottay
13→161 slots, bithire 27→196, evnto 50→573; los 34/17/10 del plan quedaron
desactualizados, manda el roster; `divergentSlots` 2268→1826 con baseline
bajado por el DT; `untaggedAuthoredLeaves` 3029 clavado; tagRegistry 37→127;
harness con cobertura por prefijo + 5 drills = 34/34; intersección autorada
345 y `positionIntersection` 787 explícitas; exclusivos sobre hojas AUTORADAS
con ancla 1061/788/2; parada correcta 11/11 por techo de bytes — los
comentarios cuentan — `maxSourceBytes` 387391→398278 con `_note` fechada;
catalog re-derivado por el DT, digest `cffd2d272b…`, deadWriters 266=266;
gat-07 re-sellado `2d5ad3e9760f…`; suite 1717/13).** **Estado al cierre:
F4A-5 ✅ = K2+H3** (el par border canonizado en los 3 temas — rottay/bithire
derivan `borderPrimaryColor` a `var(--ds-color-border)`, evnto INVIERTE
completo: el literal se muda a la raíz en cuerpo Y overlay oscuro, detalle que
la medición obligó y el brief no describía; H3 `--ds-card-border[-color]`
evnto a la raíz; color-mix subtle/tertiary re-atados. Cero-delta **36/36 por
resolución de cascada**, reproducido por el DT. R35: REDERIVED **por modo**
(la tabla por tema dejó 2 hashes rojos: R35-light, E25-dark) → 72/72 con los
6 sha256 intactos, verificado por corrida propia del DT. Negativo nombrado:
severs evnto 15→**14** (mejora), identicalValue 156→**157** (el case dejó de
separar), universo 2613→**2612**, intersección 345→**344**,
positionIntersection 787→**786**, sourceSkeleton 1819/1502/396 — re-anclajes
leídos del artefacto. `divergentSlots` **1826 sin mover** (explicado en el
baseline); `untaggedAuthoredLeaves` 3029→**3026** (Baja #3, baseline bajado
por el DT). **Parada correcta 12/12: la Parte 1 (tags PALETTE + placeholders
de hoja) proyecta +46.138 bytes contra un techo con 0 de aire** — adjudicación
del DT: `maxSourceBytes` → **900000 con aire de una vez** (el frente proyecta
~medio MB; el subpath muere en F6). **K1 quedó FUERA con razón medida: los 32
canales idénticos son de CHROME (no PALETTE), `--ds-button-primary-bg` es él
mismo rootFrozen (adjudicación, no recableo), y chocan con T2/T3 (cada uno su
fila REDERIVED) → lote propio.** Pregunta que el worker planteó y el DT
responde: la marca "dialeable" se escribe en **root-catalog (exposure
tenant-dial)** — se diseña en el brief del lote K1.)** **Estado al cierre:
F4A-5b ✅ (91 docblocks = 29 tags + 62 placeholders de hoja; las 254 hojas
PALETTE cubiertas y las 208 ausencias parciales tapadas, reconciliación con
roster cero desfases; `untaggedAuthoredLeaves` 3026→2772 = exactamente
154+52+48; `divergentSlots` 1826→1720; `positionIntersection` 786→892;
tagRegistry 218→216 tras la corrección del DT; byte-idéntico ×3 builds;
docs-engineering cero diffs; Baja #4 del baseline bajada por el DT; defecto
semántico de 4 docblocks —onPrimaryColor/borderColor en rottay/bithire—
encontrado por el DT en verificación y corregido en el cierre; choque
kit-vs-parser adjudicado: la invariante va ANTES de los tags, esquema §3
corregido; suite 1717/13 por nombre; gat-07 `f9adf7318e83…`).** **Siguiente
lote: F4A-6 (worker, brief TUYO):** K3 — raíz NUEVA `--ds-color-text-page`
(rottay `#A0A0A5`/`#6B6B6B`, bithire `#53697E`/`#9aacbf`, evnto `#3d3d3d` SIN
dark) + los canales de tinta derivan; brief borrador en `/tmp/f4a-6-brief.md`
— completar el mecanismo root-catalog con la forma que usó K1. Packet
declaration obligatoria; firmados solo REDERIVED. **Estado al cierre: F4A-6 ✅
= K3** (raíz autorada con rootId `tier.page.ink` + lowering nuevo en el
compilador; **35 canales de tinta recableados** en rottay, 7 intactos por el
filtro (a) de F2, 8 hojas ajenas dispuestas con razón; cero-delta **136/136**
por resolución de cascada). Cierre F4A-6b con DOS adjudicaciones del DT: (a)
exposición `internal-head` hasta F4B como sus 5 hermanas `tier.*.fg`; (b)
REDERIVED T1/T2/T3 autorizado — **22 hashes idénticos vs HEAD** probado
contra `git show`. Adjudicación extra del DT: `--ds-color-text-page` entró a
`TENANT_THEME_REFERENCE_TOKENS` (opción A; la B era bendecir la regresión de
9 tests). Contadores: `divergentSlots` 1720→**1694** (Baja #5),
`untaggedAuthoredLeaves` 2772→**2712**, `tagRegistry` 216→**252**, universo
2612→**2586**, intersección autorada 344 intacta. Suite **1717/13** por
nombre (×3 corridas del DT). gat-07 `145083775613…`. **Lección fijada: la
cadena de regeneración incluye reads-ledger** (dos artefactos stale detectados
en ESTE lote: el censo lo marcó la suite; el ledger `reads-adjudication.json`
lo marcó gates:ci) — cadena completa en §5.2 ya corregida. **Estado al
cierre: K1 ✅ = primary descongelada** (adjudicaciones del DT: mecanismo =
PISO LITERAL en `default.css:156` — la vía paramétrica quedó falsada por
medición, 500≠literal en 5/6 celdas —; 30 recables rottay + 2 evnto con
colapsos de overlay; bithire intacto con razón; `--ds-button-primary-bg`
paramétrico en rottay/evnto, congelado en bithire con deuda nombrada;
REDERIVED T1+3/T2+9/T3+14 con 0 líneas sha256 tocadas; la congelación MURIÓ:
rootPinned floor-literal ×3, trinquete 24→4 por decrecimiento puro).
Cero-delta probado contra HEAD: 0 diffs de resolución en 3 artefactos + piso.
Baja #6: `divergentSlots` 1694→**1669**, `untaggedAuthoredLeaves`
2712→**2655**, universo 2586→**2559**, tagRegistry 252→**281**. Parada 15/15
correcta: diente (a) huérfano → re-sujetado a bithire `--ds-button-primary-bg`
(adjudicación del DT, 5 asertas vivas). Erratum F4A-6 confirmado y cerrado
(pin select T2 stale en HEAD — ley nueva en §5.4: rosters firmados se corren
ENTEROS). Suite 1717/13 por nombre. gat-07 `7ac1f9c2e5d1…`. **Estado al
cierre: F4A-3c ✅ (worker Opus, verificado por el DT):** los 27 docblocks de
familia quedaron estrechados a `@domicile unassigned` + `@governor gap medido:
gobierno parcial — <control> alcanza N de N+M canales (M sin control; criterio
estricto 2026-08-21); la prueba por hoja aterriza en F4A-7…15` (desviación de
plantilla del worker ACEPTADA: mi "N de M" era N/(N+M) — escribirlo literal
plantaba una falsedad; reportado con prueba). Mapa republicado con
`strictClass` en las 115 (0/33/29/53), historia byte-idéntica. Métricas
clavadas (1669/2655/281; seed 54→27, unassigned 152→179). Byte-identidad de
compilados probada. **Lección 2da captura: el censo censa FUENTES — un lote de
solo-comentarios también re-corre la cadena** (el pin `positive: the full
check passes` lo marcó; digest de reconciliation re-anclado a `1b1d21bf6388`).
gat-07 `1c42b078f711…` (invariante al censo). Deuda nombrada: 6 familias con
gobierno parcial medido sin tag de sección (sidebar ×3, statsGrid, tooltip,
evnto surface) — su prueba por hoja en F4A-7…15. **Siguiente lote: F4A-7**
(worker, brief TUYO) por `/tmp/f4a-lotes-7-13.md`.

## 4. Cola vinculante después de F4A-2 (enmienda del dueño, no se reordena)

`F4A-3` canon de comentarios (byte-idéntico) → `F4A-4` roster por placeholders
(byte-idéntico: evnto +34, bithire +17, rottay +10) → `F4A-5…15` reescritas
por familia (K2→5 palette, K3→6 typography, K1→LOTE PROPIO del DT post-F4A-6,
K4→14 asimétricas, K5→15 tabla bithire; firmados solo REDERIVED) → **`F4A-3c`
correctivo (enmendado 2026-08-21 tras auditoría Codex verificada por el DT:
mapa reclasificado con criterio estricto —limpias 33→0—, los 27 tags de
familia no probados se estrechan o retiran, roster/registry/checkpoint al día,
spec del gate de paridad real) — DESPUÉS de K1 y ANTES de F4A-7…15** →
`F4A-close` TUYO (ratchet a tolerancia cero + **gate de paridad real sobre
keypaths evaluados, separado de placeholders** + gates:ci) → **auditoría
Fable del frente** (recibe el informe Codex de insumo) → `F4B` (calibración
causal de los 20 controles, receipts de 8 puntos, §7) → `F2-asimétrico` →
`F3` → `F4C` → `F5→F8` → `F9` (UNKNOWN=0 sobre 255×20=5.100 celdas) →
auditoría final → goal completo con gates:ci verde en HEAD.

## 5. Reglas operativas que NO se re-abren

1. **Node 22 + env siempre**:
   `export PATH=/Users/daniel/.nvm/versions/node/v22.17.0/bin:$PATH`
   `export DOCS_ENGINEERING_ROOT=/Users/daniel/Developer/Rottay/docs-engineering`
2. **Cadena de regeneración** (F4A-6 la fijó COMPLETA — dos artefactos stale
   en ese lote lo demostraron): censo → reconciliation → kimi → **controls** →
   catalog → **fanout-facts** → **mirror-parity** → **variant-parity** →
   **reads-ledger** (`reads-adjudication.json`: su `basedOnManifestDigest` debe
   ser el sha256 del `hooks-manifest.json` vigente; si el lote corrió
   `hooks:generate`, re-anclarlo) → **gat-07 SIEMPRE ÚLTIMO Y LO SELLÁS VOS**
   (`node scripts/evidence/gat-07-exact-proof/index.mjs --write` luego
   `--check-artifact`, desde `packages/core`; digest vigente post-F4A-6:
   `145083775613…` — se mueve con cada lote que toca la cadena, el vigente es
   el del §13 más reciente). El worker corre `gat07:check` y reporta; nunca
   sella.
3. **gates:ci**: `pnpm --filter @rottay/design-system gates:ci` desde la raíz
   del repo, ~10-18 min, EN BACKGROUND. Verde = "88 blocking gate(s) passed" +
   2 excluded visibles con sus textos (channel-liveness, lane-control-drills —
   re-adjudicados a F4A/F4B + F2-asimétrico).
4. **Suite**: pierna 1 = `node --test "scripts/**/*.test.mjs" "manifest/**/*.test.mjs"`
   desde `packages/core` (NO vitest); 1717 tests / 13 fallas conocidas,
   comparar POR NOMBRE contra baseline (`/tmp/f4a-5-fallas-baseline13.txt` o la
   vigente). lane-control-drills 10/13 NO crece. Si aparece
   `brand-authored-residue-retirement` rojo NO es flake: es el mecanismo del
   par border. Build COMPLETO (`pnpm build` en packages/core) antes de
   cualquier batería — dist parcial = falsos rojos. **Ley de rosters firmados
   (erratum F4A-6): tras tocar fuente de tema, T1/T2/T3 se corren ENTEROS
   (vitest de los 3 archivos), nunca por nombre ni solo hashes** — el pin de
   vocabulario select de T2 quedó rojo en HEAD post-F4A-6 por eso.
5. **docs-engineering** (repo hermano): SOLO contadores de catálogo. ~205
   archivos sucios ajenos del 4-ago que NUNCA se tocan.
6. **Commits**: uno por lote, con PATHSPEC EXPLÍCITO mientras un worker esté
   en vuelo (nunca `git add -A`). Los commits del trabajo del worker los hacés
   vos con la lista de paths de su reporte. NUNCA push.
7. **Packet declaration obligatoria** (F2.4+): raíz, canales, los 3
   verticales, negativo NOMBRADO (sourceSkeleton como esperada-móvil),
   restauración byte-idéntica ida y vuelta.
8. **Cero-delta** = pintura COMPUTADA igual tras resolver la raíz (contra el
   artefacto compilado), nunca plausibilidad textual.
9. **Firmados** (rosters T1/T2/T3, mass-c3, evnto-t2, R35): solo patrón
   REDERIVED, sha256 idénticos pre/post.
10. **Toda "convención medida" se verifica con grep del nombre exacto ANTES
    de asentarla** (lección del nudo K3).
11. **Actualizá §13 con cada lote** — es la única verdad resumible. Y
    actualizá ESTE prompt cuando el estado se mueva de forma material.

## 6. Cómo verificar el estado al retomar (hacelo, no asumas)

```bash
cd /Users/daniel/Developer/Rottay/ui-design-system
git log --oneline -8                  # último conocido: el de este prompt o posterior
git status --short                    # limpio salvo trabajo de worker en vuelo
tmux ls                               # terminales vivas (ver §2)
ls /tmp/*listo* 2>/dev/null           # flags de lotes terminados sin procesar
ls docs/f4a/                          # insumos F4A commiteados (roster 198 + diseño)
tail -80 docs/ROADMAP-EJECUCION-2026-08-19.md   # §13, la verdad viva
```

Si hay flags sin procesar: leé el reporte en /tmp, verificá contra el árbol,
sellá gat-07 si la cadena se tocó, gates:ci, commit, asentá en §13.

## 7. Lo que el dueño ya aprobó (no re-preguntar)

- El modelo operativo completo (vos DT, workers Claude con skip-permissions,
  Fable auditor, Codex fuera).
- Trabajo autónomo constante; ante cada hito, auditoría Fable antes de la
  próxima fase.
- Tus adjudicaciones de DT tienen validez ("doy por válido tu criterio").
- La enmienda de secuencia entera (verificada 8/8 contra el árbol, commit
  `2b3cae707`).
- Libertad para publicar versiones; **push prohibido SIEMPRE**.

## 8. Contexto de la sesión original (por si el dueño pregunta)

El dueño pidió: depurar el repo al máximo, **folder/index en todo** (nada de
archivos sueltos en raíces), paths declarativos (el path solo te dice qué hace
la cosa), manifiesto visible, foco en engine **Modern** con compatibilidad a
los otros engines, y customización por **familias de tokens con efecto
cascada** (pocas variables de alto impacto, no 5.000 sueltas). "No te fijes en
lo implementado, fijate en lo que TIENE QUE SER; que esté usado no es parámetro
de que esté bien." Las auditorías viejas en `docs/` fueron insumo, no verdad.
Las apps verticales quedan FUERA de alcance hasta F8 (el DS primero).
