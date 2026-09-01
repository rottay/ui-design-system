# Revisión post-Cloud v2 — Kimi (consultoría read-only del owner)

Fecha: 2026-08-28 · HEAD verificado en vivo: `f166570d92433fe1437133975732003c1fd29a32`
Worktree al verificar: limpio salvo `?? docs/reauditoria-cloud/` (sin tracked
modificados). Perímetro respetado: cero escrituras fuera de este archivo, cero
commits, cero contacto con panes modern-rescue. Base leída completa:
`README.md`, `06`, `07` de esta carpeta, `reauditoria-codex/` y mi propia
`reauditoria-kimi/`. Cada afirmación material de Cloud v2 fue tratada como
hipótesis y reproducida o refutada abajo.

## 0. Estado del árbol (reproducido)

- `git log --oneline -4`: confirma `ecdc01a61` (fix `schemaVersion`
  fail-closed, drills 25/25) y `f166570d9` (asiento §13 + deuda nueva: drill de
  `cascade-producers` muta el artefacto real en disco). **D3 quedó consumida por
  el DT** — el §0 de Cloud v2 es exacto en esto.
- La refutación de Cloud a mi "worktree mezclado con `producers.json`": la
  acepto con matiz temporal. Mi `git status` de la primera ronda (HEAD
  `dcc44a609`, más temprano ese día) mostró ` M
  packages/core/manifest/cascade/extracted/producers.json` junto a los 2
  archivos del gate; Cloud midió más tarde y el diff `dcc44a6..f166570d9` (3
  archivos) prueba que ese cambio nunca se committeó — fue revertido o absorbido
  entre ambas observaciones. Las dos fotos fueron honestas en su instante; la
  preocupación (pérdida de trabajo no committeado) quedó disuelta por el commit
  del DT. No es un error de método mío ni de Cloud: es la tesis de RC-01
  actuando.
- Acepto dos refutaciones limpias de Cloud v2 a mi ronda anterior: el "67" sí
  existe tres veces en prosa (`manifest/cascade/roots/token-overrides.json:11,21`
  y `cascade/materialized/token-overrides.json:12`; mi grep buscaba números
  entrecomillados — fallo de patrón mío), y el 23º `scope:` era la línea del
  tipo (22 valores reales). También acepto el matiz PR: `ci.yml:6-7`
  (`pull_request.branches: [main, develop]`) filtra por rama destino, así que un
  PR desde una rama espejo hacia `main` sí dispara CI sin tocar el workflow.

## 1. ¿El manifest segmentado funciona hoy como source of truth?

Verificación propia (`packages/core/manifest/`):

- **Contrato: SÍ.** 255 archivos de familia (`find manifest/families -name
  '*.json' | wc -l` = 255), 20 controles, 3 grupos; `index.json.denominators`
  = 255/13/7/20/5100 — consistente con `program/index.json` y la ley de una sola
  autoridad por eje (controls/groups/families con ownership exclusivo).
- **Grafo: SÍ, derivado.** `index.json.generatedControlFamilyView` existe como
  vista inversa generada (la arista vive en la familia, el índice deriva).
- **Prueba observada: honesta pero vacía, y con vocabulario desalineado.**
  `rollups.familyReviews` = 255 unreviewed / 0 accepted;
  `controlFamilyDispositions` = **5100 UNKNOWN, 0 de todo lo demás**;
  `familyMaximumClaims` = 252 `SOURCE_BOUND` + 3 `INVENTORIED_ONLY`. Dos hechos:
  (a) el rollup es íntegro — declara cero sin maquillarlo; (b) `SOURCE_BOUND`
  **no es un estado del ciclo de vida de la constitución** (README del programa:
  `UNKNOWN → IMPLEMENTED → COMPUTED_VERIFIED → SIGHTED_ACCEPTED`). El manifest
  enrolla una escala (PRESCRIPCIÓN: INVENTORIED_ONLY / SOURCE_BOUND) distinta de
  la escala de prueba (IMPLEMENTED / COMPUTED_VERIFIED / SIGHTED_ACCEPTED). Las
  5.100 celdas UNKNOWN son el puente que falta entre ambas.
- **Lo más importante a favor del manifest:** los "descubrimientos" estrella de
  las tres auditorías ya estaban escritos en él. `manifest/controls/
  shape.button-style.json:99,113` documenta íntegro el defecto RC-05
  (`DECLARED_CHANNEL_DOES_NOT_PAINT`: el control emite `--ds-radius-button`,
  `button.css:73,364` lee `--ds-button-md-radius`, 3 productores y 2 lectores
  no-registro enumerados), `chrome.anatomy.json:116-117` ya declara
  `STRUCTURALLY_UNREACHABLE`, y `responsive.posture.json:111` ya declara
  `OPEN_OWNER`. El manifest funciona como contrato y como memoria; lo que falla
  no es el registro sino que **nadie lo leía como cola de trabajo** — y que sus
  recibos de prueba viven fuera, referenciados por ruta en `test-artifacts/`.
- Consecuencia para F9: las 5.100 celdas UNKNOWN son reales y el manifest es el
  instrumento correcto para adjudicarlas; no hace falta ningún instrumento
  nuevo de seguimiento, hace falta empezar a mover celdas.

## 2. Cascada: clase B de Cloud vs root-membership / channel-liveness

Reproducciones propias a HEAD vivo:

- `root-membership --check` → **OK — 1610 canales, 881 con raíz** (digest
  `2c525e4f43c1`). Las cifras de Codex reproducen exactas.
- `channel-liveness --check` → `universe=440, emitted=117`, LIVE = 394+1+12 =
  **407, no-LIVE = 33**, EXIT 0 (ratchet anclado). Las cifras de Codex
  reproducen exactas; el hallazgo "unresolved emission pattern" confirma que
  `emitted=117` es piso, como dice Cloud. El conteo 48-vs-49 de findings no lo
  reproduje con exactitud (la salida no imprime total; conté 43 líneas de
  hallazgo, algunas multi-fila) — drift plausible, no cerrado por mí.
- El ratchet viejo sigue diciendo 2169/4373 (mi corrida de la ronda anterior;
  los 2 commits intermedios no lo tocan). La refutación de Cloud v2 se sostiene
  en mis spot-checks: `--ds-motion-intensity` está en la lista de deuda P2 Y
  declarado en `facade/artifacts/bithire/index.css:789` — el instrumento no ve
  las raíces de artefacto; y `--ds-carousel-arrow-size` (muestra de la clase B)
  se lee en `skin/carousel.css:124` con literal `32px` y ningún productor — la
  clase existe.
- **Las listas de datos de P2 no reconcilian del todo:** `P2-FINAL-orphan-debt
  .txt` tiene 1.024 líneas (64+960, cuadra con la tabla de `brazos-v2/P2-cascade
  .md:147-153`), pero `P2-none-1329.txt` tiene **931** líneas donde el informe
  afirma 960, y no existe lista publicada de los 760 de modern. La clase B es
  real por muestreo; su cifra exacta (760/960) no es independientemente
  reproducible desde `datos-v2/` tal como se empaquetó.
- **Colisión de vocabulario que ninguno de los tres vio:** la constitución YA
  tiene clases A/B/C/D para la cascada (`customization-model/index.json:555-560`:
  `A_derivable` 2473, `B_variante` 802, `C_semilla` 262, `D_irreducible` 156).
  La "clase B" de Cloud (760 modern/960 corpus, literal sin productor) es una
  clasificación distinta con la misma letra, sobre otro universo. Si entra al
  programa con ese nombre, dos leyes homónimas van a hablar de cosas distintas.
  Debe renombrarse (p.ej. "clase literal-huérfana") o mapearse explícitamente.
- **Qué instrumento gobierna la cola — mi postura:** ninguno de los tres tal
  cual. `root-membership` es el gate sano (verde, anclado, con digest);
  `channel-liveness` es el clasificador fail-closed y ya ve a
  `--ds-radius-button` como `READ_NO_PRODUCTIVE_TERMINAL` — o sea, **el
  programa ya tenía la señal RC-05 antes de las tres auditorías**; el ratchet
  queda refutado como mapa. La cola honesta es la conjunción: 729 sin atribuir
  (root-membership) ∪ 33 no-LIVE (liveness) ∪ clase literal-huérfana de Cloud
  (tras reconstruirla sobre productores declarados y renombrarla), y **las 170
  contradicciones entre instrumentos son el primer ítem** — dos gates blocking
  que discrepan sobre el mismo canal son un defecto de instrumento previo a
  cualquier drenaje. Esto coincide con Cloud v2 (reconstruir el clasificador,
  gate de contradicción) y corrige a Codex (sus dos instrumentos no miden la
  clase B) y a mi ronda anterior (la reconciliación ya no es el paso previo: ya
  la hizo P2; lo pendiente es la reconstrucción).

## 3. Secuencia S0–S5: postura y paralelización sin saltar causalidad

Mi postura: **S0→S1→S2→S3→S4 es la secuencia correcta y es convergente con la
mía de la ronda anterior** (instrumentos → causales con delta → slice F4C →
cascada → entrega). Tres precauciones causales que la letra de S0-S5 no
explicita:

1. **S0 toca autoridad T-1 y rutas reservadas.** El sub-ítem Expert 294→290
   toca `program/index.json`, `customization-model/index.json`, `rounds/index.json`, README y
   `program-check.mjs` — edición constitucional que exige orden explícita del
   owner y corrida de `program-check` antes/después (AGENTS.md §Verification).
   Los demás ítems de S0 (`evidence.symbol`, checkpoints) tocan manifests —
   varios son generados: corregir el símbolo en la fuente del manifiesto, no en
   el artefacto. Verifiqué que `program-check.mjs` hardcodea 294 en cuatro
   sitios (:254, :643-644, :699-700, :1276-1277) y compara copia contra copia:
   el quinto check contra `overrideTokens()` que pide Cloud es la parte que
   importa; sin él, el número vuelve a driftar.
2. **S1 pisa el singleton del compilador.** `appearance-posture` (button-style)
   y `chrome-variables` están bajo `packages/core/src/infrastructure/compilers/
   **`, ruta reservada del integrador de arquitectura (`agent-orchestration.
   json` reservedPaths + laneTypes: un solo architecture-integrator). S1 se
   puede paralelizar por archivos disjuntos (registry de configuración,
   `page-shell.css`, `migrate-v1`, console) **menos** los dos ítems de
   compilador, que se serializan en un solo lane o se ejecutan en tandas.
3. **S3 depende de S0+S1, no sólo del slice.** Re-anclar el ratchet sobre la
   clase renombrada antes de reconstruir el clasificador sería baselinar un
   instrumento refutado (prohibido por la ley decrease-only de baselines). Y el
   slice F4C (S2) debe ir **después** del fix de `evidence.symbol` y del fan-out
   de button-style, o medirá diales muertos y producirá capturas A/B de un
   canal que no pinta.
4. **Consistencia con la ley interna del programa:** la secuencia S0→S1→S3
   respeta `customization-model/index.json:585-592` (`mandatorySequence`: productores
   primero, las cinco filas de dominio cerrado — entre ellas button-style y
   chrome.anatomy — después; prohibido arrancar por (b) sin (a)). El fan-out de
   button-style es trabajo de productores = paso (a); la proyección estática de
   anatomía es fila (b) y queda correctamente fuera de S1. Cloud v2 no cita
   esta alineación; la señalo porque convierte su secuencia de "propuesta" en
   "ejecución de una ley ya asentada". Nota de higiene: esa misma clave ancla su
   evidencia en `/private/tmp/mr-COLAPSABILIDAD.md` — la cadena de evidencia
   efímera (RC-01) también atraviesa la constitución.

## 4. Qué cambios de roadmap aceptan de verdad Cloud, Codex y Kimi

Consenso triple provisional (los tres, con evidencia reproducida):

1. La arquitectura se sostiene; nadie propone revertirla.
2. Próximo tramo visible: slice F4C acotado con `DELTA_ESPERADO` y captura A/B,
   después de un bloque corto de instrumentos y defectos causales.
3. Instrumentos que mienten primero: Expert 294/290 (+ check contra fuente),
   testigo de `shape.button-style`, checkpoint de liveness.
4. Defectos causales pequeños: button-style por fan-out (no fallback),
   `recipes.profile` en code-owned, PageShell `inline-size: 100%`,
   `palette.dark` con aviso, filtro Expert del console.
5. app-platform necesita el lote cross-repo completo antes de cualquier
   publish/repin; anclar `release/2.19.37`.
6. Ningún agente hace push; D1 es del owner.
7. Proyecciones 20-25 % y 51-217 días retiradas; 62 %/43 % sin fórmula;
   comunicar sólo cifras ancladas.
8. F9 por celda con grupos como generadores de evidencia (D10-a); el
   denominador 5.100 no se reduce por representante.
9. No ejecutar: fallback de 1 línea, swap RTL de safe-area, cola de 2.169,
   `scope` en `TenantCapabilityDeclaration`, recorte de gates sin perfil.

Requieren decisión de Daniel (nadie más puede): **D1** respaldo/CI (mi
recomendación actualizada: (b) bundle hoy + (a) enmienda con rama espejo, y el
matiz PR de Cloud elimina la necesidad de tocar `ci.yml` — corrijo mi D1
anterior) · **D2** T-1 Expert (los tres: (a), ahora) · **D4** ventana
app-platform (los tres: diseñar ya, ejecutar antes del repin; ProductWindow y
TreeView son sub-decisiones abiertas desde el 19-08) · **D5** diales (los tres:
adjudicar nombre a nombre después del slice) · **D6** scope vía tier de
instancia existente (los tres: (a); `scope` en el registro está prohibido por
ley fechada — Cloud v2 A8 lo acepta) · **D7** instrumento de cascada (mi
postura: conjunción + renombre de la clase B + gate de contradicción; Cloud:
reconstruir; Codex: sus dos instrumentos — sigue siendo el mayor disenso
técnico) · **D8** orden (convergente; detalle en §3) · **D9** cifras ancladas
(unánime) · **D11** apertura DB acotada a `modes.dark.{typography,surfaces}` +
issue `ignored_field` · **D12** responsive.posture (narrar, no emitir CSS) ·
**D13** gates con perfil previo · **D14** evnto (documentar, repin, quitar el
build cruzado).

## 5. Disensos que mantengo o abro

1. **Contra Cloud v2 (nuevo):** la clase B debe renombrarse antes de entrar al
   programa (colisión con `A_derivable/B_variante/C_semilla/D_irreducible` de
   `customization-model/index.json:555-560`), y sus cifras exactas no reconcilian con
   las listas publicadas (931≠960; sin lista de los 760). La clase existe; el
   número aún no es baselinable.
2. **Contra los tres:** `channel-liveness` ya clasificaba `--ds-radius-button`
   como `READ_NO_PRODUCTIVE_TERMINAL` y el manifest ya documentaba el defecto
   RC-05 íntegro. La lectura correcta de "nadie lo vio" es "nadie lo leyó como
   cola": el problema de gobierno no es falta de instrumentos sino de consumo
   de sus salidas. Eso refuerza D9 (métricas ancladas en cada asiento) más que
   cualquier instrumento nuevo.
3. **Contra Codex (mantengo):** `root-membership`/`channel-liveness` solos no
   gobiernan la cola (no miden la clase literal-huérfana); pero contra Cloud:
   el ratchet no se "re-ancla" hasta reconstruirse, y la reconstrucción es un
   lote con drills (controles A/B de P2), no una tarde.
4. **Contra Cloud v2 (menor):** A9 cita `mandatorySequence` como si viviera en
   el manifest de anatomía; vive en `customization-model/index.json:585-592`. La
   sustancia es correcta (verificado), la cita es imprecisa.

## 6. Propuesta rápida (no aplicada)

Orden ejecutable mínimo que respeta causalidad, cercas y el singleton del
compilador:

1. **D2 primero** (owner): 294→290 + quinto check contra `overrideTokens()` +
   corrección de los "67" en `cascade/`. Horas; desbloquea la confianza en
   `program-check`.
2. **S0 restante en un solo lane DT** (son pocos archivos, todos reservados):
   `evidence.symbol` de button-style en la fuente del manifest, checkpoint de
   liveness al número real.
3. **S1 en dos tandas**: tanda compilador (fan-out de button-style con la
   plantilla `chrome-variables:1742-1746`; luego `recipes.profile` en
   code-owned) — un solo lane integrador; en paralelo, lanes disjuntos:
   PageShell `inline-size:100%` + regresión Playwright, `palette.dark` →
   `ignored_field`, filtro del console.
4. **Slice F4C (S2)** con excepción escrita, sólo sobre familias cuyos diales
   ya pintan post-S1; ley de lote `DELTA_NULO_DECLARADO`/`DELTA_ESPERADO`.
5. **S3**: reconstrucción del clasificador (con renombre de la clase B) + gate
   de contradicción de las 170, antes de cualquier drenaje.
6. **S4** antes del próximo repin; anclar `release/2.19.37` hoy (aditivo).

Nada de esto está aplicado; todo requiere la orden correspondiente del owner.

## 7. Evidencia citada (comandos y rutas)

- `git rev-parse HEAD` → `f166570d9…`; `git log --oneline -4`; `git status
  --short` → sólo `?? docs/reauditoria-cloud/`.
- `node packages/core/scripts/tokens/root-membership/index.mjs --check` →
  `OK — 1610 canales, 881 con raiz`.
- `node packages/core/scripts/tokens/channel-liveness-gate/index.mjs --check`
  → `universe=440 … emitted=117`, LIVE 394+1+12, EXIT 0, y
  `--ds-radius-button` listado como `READ_NO_PRODUCTIVE_TERMINAL`.
- `grep -n "294\|290" program-check.mjs` → líneas 254, 643-644, 699-700,
  1276-1277.
- `manifest/cascade/roots/token-overrides.json:11,21`;
  `manifest/cascade/materialized/token-overrides.json:12` ("67" ×3).
- `manifest/controls/shape.button-style.json:99,113`;
  `chrome.anatomy.json:116-117`; `responsive.posture.json:111`.
- `manifest/index.json` rollups: 5100 UNKNOWN / 0 accepted / 252 SOURCE_BOUND +
  3 INVENTORIED_ONLY.
- `find packages/core/manifest/families -name '*.json' | wc -l` → 255.
- `customization-model/index.json:555-560` (clases A/B/C/D preexistentes), :585-592
  (`mandatorySequence`), :526 y :613 (evidencia anclada en `/private/tmp`).
- Spot-checks cascada: `facade/artifacts/bithire/index.css:789`
  (`--ds-motion-intensity` declarado y a la vez "unwired");
  `skin/carousel.css:124` (`--ds-carousel-arrow-size` con literal, sin
  productor).
- Listas P2: `evidencia/datos-v2/P2-FINAL-orphan-debt.txt` (1.024),
  `P2-none-1329.txt` (931), `P2-debt-inter-rmRoot.txt` (170),
  `P2-cl-nonlive.txt` (33); informe `brazos-v2/P2-cascade.md:147-153,192-196`.
