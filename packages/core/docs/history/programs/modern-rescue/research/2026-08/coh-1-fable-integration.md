# COH-1 — auditoría Fable focal POST-INTEGRACIÓN (real, ejecutada)

- Auditor: Fable 5 (claude-fable-5), sesión independiente, 2026-08-30
- Objeto: integración del lote COH-1 a main (merge 334bace48) + ediciones de
  integración sin commitear (harness `--only`, durabilidad compare-logs,
  evidencia focal COH-1)
- Método: read-only sobre el repo; toda cifra re-ejecutada o re-hasheada desde
  disco en esta sesión. Ningún archivo fuera de este informe fue escrito.
- Alcance previo: la rama COH-1 ya tenía ACCEPT propio
  (`coh-1-fable-audit-2.md`); esta auditoría cubre SOLO la integración y sus
  condiciones (G.1 del informe previo).

## VEREDICTO: ACCEPT

Cero defectos. Las tres ediciones de integración están en disco tal como se
describieron, la evidencia focal es certificable y reproducible con el harness
exacto que está en el árbol, el testigo central muestra el canal siguiendo al
seed por las dos puertas, la historia F4C quedó intacta byte a byte, y los
gates del árbol integrado no suman ni un rojo sobre la línea pre-existente.

---

## A. El merge — VERIFICADO

- `git log --graph`: 334bace48 es merge `--no-ff` con dos padres
  (main b682164f6 + rama COH-1 3222d4e7c); la rama bifurca de e14213be8 y trae
  bcccaf9ca → 30d24c0a8 → 3222d4e7c, exactamente los tres commits del ACCEPT.
- `git diff b682164f6..334bace48 --stat`: 50 archivos, +4073/−1970, todos
  dentro del alcance COH-1 (manifests typography/status, slot-inventory y su
  baseline, capabilities, themes/iso, brand-themes bithire/evnto, compilador
  brand-theme + tenant-theme, 2 tests nuevos, artifacts/styles regenerados,
  brand-studio, supplier-contract, 3 scouts).
- Overlaps con F4C: `git diff b682164f6..334bace48 --name-only | grep -i F4C`
  → vacío. El merge no tocó ni un archivo de evidencia F4C.
- Spot-check de historia F4C: 6 PNGs re-hasheados contra sus receipts
  (phase-B filas 0/27/53, phase-D filas 0/27/53: alert/bithire/390,
  cockpit/the-management/390, patterntimeline/the-management/1280) — 6/6
  `artifactSha256` MATCH.

## B. El harness editado — VERIFICADO

`git diff -- packages/showroom/scripts/f4c-canary-capture.mjs`: 32+/35−, tres
cambios y nada más:

1. `UNDECLARED_CHANNELS_WATCHED` (:214) = exactamente los 4 `-ink`
   (`success|warning|error|info`), con la nota de la autoridad paralela
   `tinted-well-tone-ink`. Los 6 ex-watched (`-bg` ×4, `success-border`,
   `alpha-success-10`) están ahora en `declaredOutputs.channels` del manifest
   — verificado por membresía directa contra
   `packages/core/manifest/controls/palette.status-seeds.json`.
2. `DECLARED_PARTIAL_PROPAGATION = []` (:230) con la nota de por qué
   (badge-success y workbench-status-success DEBEN seguir al seed post-COH-1;
   re-declaración con cita si reaparece, nunca en silencio).
3. `--only` en `selectCaptures` (:2107-2126): valida cada id contra `CAPTURES`
   y tira `Error` ante desconocido; `matrixCaptures` (:2165) se computa SIN
   `only`, así que `tierCoverage` sigue midiéndose sobre la matriz completa.

Probes ejecutadas:

- `node --check` → sintaxis OK.
- `--only nosuch` → `Error: --only nombra una captura inexistente: "nosuch"`
  en `selectCaptures` (:2122), exit≠0, ANTES de escribir nada (el outDir de
  prueba no llegó a crearse). Fail-closed real.
- Concatenación `[...declaredChannels, ...UNDECLARED_CHANNELS_WATCHED]`
  (:2159): manifest = 83 canales, 0 duplicados internos, intersección con los
  4 watched = ∅ → 87 canales únicos, sin doble lectura.
- Drill cruzado (¿una focal puede pasar por fase?): `--compare F4C/phase-A
  COH-1/focal-B` → `pass=false`, exit 1, con `FAIL: fila ausente en la corrida
  B: …` por cada una de las filas de la matriz que la focal no tiene. El
  comparador exige el set completo, como promete el comentario (:2116-2118).

## C. La evidencia focal — VERIFICADA Y RE-EJECUTADA

`COH-1/{README.md, focal-A, focal-B, focal-D}`, cada corrida con
`receipt.json` + `captures/` (24 PNGs = 4 escenas × 2 grounds × 3 anchos).

- Receipts: `pass=true`, `runMode=full`, 24/24 planned=captured, 0 failures,
  `crashed=false`, `git.head=334bace48` en los tres.
- Honestidad de la muestra: `tierCoverage.matrixCaptureIds` = 9 (matriz
  completa), `tierCoverage.executedCaptureIds` = [labels, dashboard,
  workbench, feedback]; `measuredOver` lo declara en texto.
- Procedencia exacta: `harnessSelfSha256` = `a5ddf61e…` y
  `controlManifestSha256` = `0d2bbd4c…` en los tres receipts — ambos
  coinciden byte a byte con `shasum -a 256` del harness editado y del manifest
  en el árbol de trabajo HOY. La evidencia fue producida por el código que se
  está integrando, no por otra versión.
- Coherencia post-cambio: `declaredPartialPropagation=[]`,
  `channelsRead.declaredByControl=83`, `channelsRead.undeclaredWatched=4` en
  los tres receipts.
- Re-ejecución `--check` sobre focal-A/B/D: `filas 24, fallos 0` × 3.
  `runCheck` (:1966-2003) re-hashea CADA PNG contra `artifactSha256` y falla
  ante PNG no declarado en `captures/` — los 72 PNGs quedan verificados por
  la herramienta, más 9 re-hasheados de forma independiente con python (3 por
  corrida, filas 0/11/23) — 9/9 MATCH. 24 PNGs en disco por corrida, ni uno
  extra.
- Re-ejecución `--compare focal-A focal-B` → `pass=true`: MOVERs success con
  paint>0 y hermanos warning/error/info/none en NOT_MOVED; bithire HOLD_ALL
  (el brazo static no puede moverse por una fila DB). Ruido raster: 2 filas
  (dashboard/bithire/390: 15 px, Δmax 1/255; workbench/bithire/768: 9 px,
  Δmax 1/255), dentro de tolerancia y exactamente como declara el README
  focal ("2 filas, ≤15 px, Δ≤1").
- Re-ejecución `--compare focal-A focal-D` → `pass=true`.

## D. El testigo central — VERIFICADO

Valores extraídos de los receipts (carrier `badge-success`, canal
`--ds-color-success-bg`, leído sobre el elemento):

| corrida | fila | valor | significado |
|---|---|---|---|
| F4C phase-B (pre-COH-1) | labels/the-management/1280 | `#f0fdf4` | literal CONGELADO pese al seed mutado |
| COH-1 focal-A (baseline) | labels/the-management/1280 | `#E8F6FF` | el `-50` del seed azul heredado |
| COH-1 focal-B (seed mutado `#2F7A3D`) | labels/the-management/1280 | `#E2FCE4` | el `-50` del seed verde — SIGUE al seed |
| COH-1 focal-B | workbench/the-management/1280 (workbench-status-success) | `#E2FCE4` | mismo canal, mismo seguimiento |
| COH-1 focal-D (static bithire `#7C3AED`) | labels/bithire/1280 | `#F7F6FF` | el `-50` del violeta |
| COH-1 focal-D | labels/bithire/1280, `--ds-color-alpha-success-10` | `color-mix(in srgb, #7C3AED 10%, transparent)` | alpha derivada del seed |

Los seis valores coinciden con lo que declaran el README focal y el brief. El
canal que F4C midió congelado ahora rastrea el seed por la puerta DB
(focal-B) y por la puerta static (focal-D).

## E. El árbol — VERIFICADO

`git status --short` muestra EXACTAMENTE: ` M F4C/README.md`,
` M packages/showroom/scripts/f4c-canary-capture.mjs`,
`?? docs/reauditoria-cloud/`, `?? COH-1/`, `?? F4C/compare-logs/`, y los 5
scouts nuevos (`coh-1-fable-audit-2`, `coh-1-opus-formula-review`,
`coh-1-status-tints`, `hardcode-census-top5`, `r1-craft-prep`). Nada en
staging (`git diff --cached` vacío). `git diff --check` limpio.

Durabilidad compare-logs: 12 pares `.log`/`.txt`, `cmp` byte-idéntico en los
12; cada `.log` cae bajo `.gitignore:77` (`*.log`) y cada `.txt` es
track-eligible (`git check-ignore` lo confirma archivo por archivo). El diff
del F4C README es una sola zona (:451-458): re-apunta los logs a `.txt` y
documenta el defecto de durabilidad con atribución (Codex). Ninguna otra
línea de la evidencia F4C cambió.

Nota menor, no defecto: el README F4C dice "gitignore global"; la regla real
es el `.gitignore` de la raíz del repo (línea 77). El efecto descrito — los
`.log` nunca entraron al commit — es correcto tal cual.

## F. Gates del árbol integrado — VERIFICADOS

- `node packages/core/manifest/generator/index.mjs --check` → exit 1 con
  **exactamente 117** FAILs, los 117 de clase `source digest is stale` y los
  117 citando receipts `wo-cra-23/F4B/` (grep inverso: 0 FAILs fuera de F4B).
  Es la línea pre-existente, ni uno más.
- `node packages/core/scripts/tokens/slot-inventory/index.mjs --check` →
  exit 0: `OK — 3613 filas, digest ae7abbe3eab9, ledger 6/6 en su ancla`.
- `pnpm -C packages/core lint:artifacts` → exit 0; solo advisories `!` de
  contraste `-900` vs ground oscuro, pre-existentes y no bloqueantes.
- Refuerzo independiente (además de las corridas verdes ya asentadas por la
  integración): re-corrí los 2 tests nuevos COH-1 sobre el árbol integrado —
  `coh-1-status-tint-floor.test.ts` + `coh-1-status-tint-tenant-derivation.test.ts`
  → **55/55 passed** (2 files, 4.1 s).

## G. Historia y foreign — VERIFICADO

- El merge no tocó rutas F4C (A) y los PNGs F4C hashean como sus receipts (6
  spot-checks). El único cambio de working-tree bajo F4C es la referencia de
  logs del README (E) más los `.txt` aditivos; nada re-escrito.
- `docs/reauditoria-cloud/` sigue untracked (`??`), fuera de staging, y esta
  auditoría no lo tocó ni lo leyó.

---

## Condiciones para el commit de integración

Ninguna bloqueante. Al armar el commit: incluir los `.txt` de
`F4C/compare-logs/` y NO los `.log` (git los excluirá solo por `.gitignore:77`,
pero no forzarlos con `-f`), y dejar `docs/reauditoria-cloud/` fuera del
staging como ordena el brief.

## Cifras de cierre

| verificación | resultado |
|---|---|
| merge 334bace48 estructura/alcance | --no-ff, 50 archivos COH-1, 0 rutas F4C |
| PNGs F4C spot-check | 6/6 MATCH |
| harness: --only fail-closed / node --check / concat | Error exit≠0 / OK / 83+4 sin dupes |
| focal --check × 3 | 24 filas, 0 fallos cada una |
| --compare A→B / A→D | pass=true / pass=true |
| PNGs focales | 72/72 via runCheck + 9/9 independientes |
| testigo `--ds-color-success-bg` | #f0fdf4 → #E8F6FF → #E2FCE4; static #F7F6FF |
| procedencia receipts | harness-sha y manifest-sha = disco, byte a byte |
| generator --check | 117 F4B stale exactos, 0 nuevos |
| slot-inventory --check / lint:artifacts | OK / exit 0 |
| tests COH-1 nuevos | 55/55 verdes |
| compare-logs `.log`→`.txt` | 12/12 byte-idénticos, `.txt` track-eligible |

**ACCEPT.**
