# P7 — Entrega cross-repo: app-platform, commit colgante, Evnto local-ds

HEAD verificado (ui-design-system): `dcc44a6093de0ba4f9dcbdb733ae467008cffb21`
git status inicial = final en los 4 repos (no escribí nada; sólo `docs/reauditoria-cloud/` sin trackear en DS, y modificaciones ajenas en vuelo en platform/bithire/evnto, todas presentes ya al inicio y sin tocar).

## Reproducción (hecho base, comando → salida)

### 1. Imports `@rottay/design-system/commercial` en app-platform

```
cd app-platform
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 \
  | xargs -0 grep -n "from '@rottay/design-system/commercial'" | wc -l   → 53
find src ... | xargs -0 grep -l "from '@rottay/design-system/commercial'" | wc -l → 49
```
53 líneas de import en 49 archivos (JS/TSX, entrypoint `/commercial`) — **coincide EXACTO con Codex**. Aparte, 3 archivos hacen `import '@rottay/design-system/commercial.css';` (`docs/layout.tsx:12`, `(landing)/layout.tsx:1`, `(auth)/login/page.tsx:16`) y 1 comentario (`master-diagram/hotspots.ts:7`) menciona el specifier sin importarlo — total 53 archivos si se cuenta CSS+comentario+JS (número que dio Cloud/el roadmap DS, "53 archivos").

Símbolos únicos importados (15):
`AsciiDiagram, AsciiDiagramReveal, AsciiFrame, DiagramEdge, DiagramNode, InvertSection, MonoStat, ProductWindow, SectionFrame, TerminalBlock, TerminalBlockLine, TextureBackdrop, TreeNode, TreeView, Typewriter`.

**`./commercial` NO está en `exports` del DS local** (`node -e "Object.keys(require('./packages/core/package.json').exports)"` → 121 claves, ninguna `commercial`); **sí está en el 2.19.35 instalado** (`app-platform/node_modules/@rottay/design-system/package.json:177,189,269` → `"./commercial"`, `"./commercial.css"`, `entrypoints/commercial/index.ts`).

Contenido real del `./commercial` de 2.19.35 (`node -e "Object.keys(require('.../node_modules/@rottay/design-system/dist/commercial.js'))"`):
`AsciiDiagram, AsciiFrame, COMMERCIAL_GRAY_HEX, COMMERCIAL_INK_HEX, COMMERCIAL_PAPER_HEX, CropMarks, InvertSection, MonoStat, ProductWindow, SectionFrame, TerminalBlock, TextureBackdrop, TreeView, Typewriter, commercialGray, commercialTokens`.

**Destino de cada símbolo hoy en el DS local** (verificado en runtime real, `node -e "require('./packages/core/dist/index.cjs')"`, no en el `.d.ts` — el d.ts rolled-up no lista nombres por symbol):
| Símbolo | En `dist/index.cjs` root hoy | Ruta fuente | Nota |
|---|---|---|---|
| AsciiFrame | sí (function) | `ui/primitives/layout/AsciiFrame` | re-exportado vía `primitives/layout→primitives→ui→index.ts` |
| InvertSection | sí | `ui/primitives/layout/InvertSection` | ídem |
| TextureBackdrop | sí | `ui/primitives/display/TextureBackdrop` | ídem |
| Typewriter | sí | `ui/primitives/display/Typewriter` | ídem |
| MonoStat | sí | `ui/patterns/data/mono-stat` | vía `patterns/data→patterns→ui→index.ts` |
| TerminalBlock | sí | `ui/patterns/feedback/terminal-block` | ídem |
| SectionFrame | sí | `ui/structures/headers/section-frame` | vía `structures/headers→structures→ui→index.ts` |
| AsciiDiagram | sí | `ui/patterns/visualization/ascii-diagram` | vía `patterns/visualization→patterns→ui→index.ts` |
| AsciiDiagramReveal/DiagramEdge/DiagramNode/TerminalBlockLine/TreeNode | tipos (verificado en fuente TS, no en runtime JS) | `.../contracts/index.ts` | re-exportados como `export type` en la misma cadena |
| **TreeViewConnector / PatternTreeView** | sí (funciones) | `ui/patterns/visualization/tree-view` | **reemplazan a `TreeView`** |
| **TreeView** | **NO** (`undefined`, `'TreeView' in m === false`) | — | ver debajo |
| **ProductWindow** | **NO** (`undefined`, no existe en `packages/core/src` en absoluto) | `packages/showroom/src/components/product-window/index.tsx` | vive SÓLO en el paquete showroom, no en el DS publicable |

`packages/core/src/ui/patterns/visualization/tree-view/index.ts` (comentario propio del archivo, cita literal):
> "The family ships two presentations of one hierarchy grammar: `PatternTreeView` (engine-dispatched, interactive...) and `TreeViewConnector` (static ASCII connectors, server-safe, used by landing/docs layouts). Both are owned here; neither is published through the `visualization` group barrel's deep paths any more."

Esto es la prueba directa de "TreeView cambió de identidad" (Codex): el nombre `TreeView` no existe más; se partió en dos componentes con nombres nuevos, uno de los cuales (`TreeViewConnector`, server-safe, ASCII) es literalmente el reemplazo funcional para el uso que le da `docs-atlas/tree-view` y `sitemap-footer` de app-platform.

**Veredicto tarea 1: CONFIRMADO — 13/15 símbolos SÍ tienen sucesor canónico en el root barrel del DS local hoy (sólo hay que cambiar el specifier a `@rottay/design-system`); 2/15 no lo tienen bajo ese nombre (`TreeView` renombrado, `ProductWindow` retirado a showroom).** Coincide palabra por palabra con Codex ("La mayoría de símbolos tiene export canónico nuevo, pero `ProductWindow` pasó a showroom y `TreeView` cambió de identidad").

### 2. CSS/aliases y verifier

`app-platform/next.config.ts:53-63` (aliases Turbopack/Webpack, sólo activos si `useLocalDs`):
```
"@rottay/design-system/commercial.css": .../dist/commercial.css
"@rottay/design-system/styles/platform": .../dist/platform.css
"@rottay/design-system/styles/rottay":   .../dist/platform.css   ← "rottay" apunta al mismo archivo que "platform"
"@rottay/design-system/dist/platform.css": .../dist/platform.css
"@rottay/design-system/commercial":      .../dist/commercial.js
```
`globals.css:14`: `@import '@rottay/design-system/dist/platform.css';` (único import CSS del bundle base, con comentario propio explicando por qué se eligió ese path sobre `styles/platform`).

Gates existentes en app-platform: `scripts/verify-local-ds.mjs` (lectura pura: sólo `existsSync`/`readFileSync`, sin `symlinkSync/rmSync/spawnSync/execSync`; verificado además por `scripts/local-ds-boundary.test.mjs::"the verifier cannot mutate or compile the producer"`) y `scripts/local-ds-boundary.test.mjs` (test que ancla la forma de `next.config.ts`/`verify-local-ds.mjs`/`ds-toggle.sh`, incluye aserción explícita `assert.equal(existsSync(...,"link-local-ds.mjs"),false,...)` — es decir, el propio test certifica que app-platform **retiró deliberadamente** el patrón de symlink mutante que bithire y evnto todavía usan). No existe `dependency-honesty` en app-platform (ese nombre es un gate del lado DS, ver más abajo).

Corrida real (permitida — sólo lee):
```
$ cd app-platform && USE_LOCAL_DS=true node scripts/verify-local-ds.mjs
[local-ds] The producer is not ready for consumer aliases.
Missing artifacts:
- dist/commercial.js
- dist/platform.css
Compile ui-design-system in its own repository, then retry app-platform.
$ echo $?
1
```
Confirmado en vivo: `ls ui-design-system/packages/core/dist/{commercial.js,platform.css}` → ambos "No such file or directory". `pnpm dev:local-ds`/`pnpm dev:local-ds:webpack` en app-platform (que corren este verifier con `USE_LOCAL_DS=true` antes de `next dev`) **fallan hoy con exit 1**, tal como afirma Codex ("`dev:local-ds` ya falla"). El `dev`/`build` por defecto (sin `USE_LOCAL_DS`) NO se ven afectados: `localModeEnabled()` devuelve `false` y el script sale 0 sin verificar nada — compilan hoy porque usan el 2.19.35 instalado real (directorio, no symlink; confirmado `ls -la node_modules/@rottay/design-system` → `drwxr-xr-x`, `require(.../package.json).version` → `2.19.35`, igual al pin de `package.json:132`). Cero drift de versión en platform — el problema es 100% deuda cruzada de artefactos retirados, no desalineación de pin.

**Hallazgo nuevo no visto por ninguno de los tres: hay un gate del lado DS que EXIGE mantener el alias roto.** `ui-design-system/scripts/boundaries/dependency-honesty/index.mjs:3208-3209` (`validatePlatformLocalBoundary`, invocado por `auditPlatformLocalBoundary` → `auditApps` → script `dependency:honesty`/`dependency:honesty:apps`, ambos en `package.json` del DS) declara:
```js
const expectedPackageAliases = new Map([
  [DESIGN_SYSTEM_PACKAGE, 'dist/index.js'],
  [`${DESIGN_SYSTEM_PACKAGE}/server`, 'dist/server.js'],
  [`${DESIGN_SYSTEM_PACKAGE}/icons`, 'dist/icons.js'],
  [`${DESIGN_SYSTEM_PACKAGE}/commercial`, 'dist/commercial.js'],
  [`${DESIGN_SYSTEM_PACKAGE}/commercial.css`, 'dist/commercial.css'],
]);
```
Si alguien retira estos dos alias de `next.config.ts` de app-platform (el primer paso obvio de cualquier migración), el gate del DS `dependency:honesty` falla con `"next.config.ts is missing executable local alias..."`. Es decir: **un gate del DS (`dependency-honesty`) exige que app-platform siga apuntando a un artefacto que otro gate del mismo DS (`platform-identity-zero-gate`) prohíbe que el DS vuelva a producir.** Esto ya está anotado como tarea pendiente en el propio roadmap DS (ver más abajo, no es 100% nuevo, pero ningún brazo de la triangulación lo citó con código) — "re-anclar `dependency-honesty.mjs` (que hoy EXIGE el alias)" en `docs/history/programs/architecture-refactor/2026-08/execution/index.md:506`.
Nota tangencial: correr `pnpm run dependency:honesty` hoy en el DS falla ANTES de llegar siquiera a auditar app-platform, por un error no relacionado (`unresolved runtime module edge... recipes/profiles/index.ts:76:11`) — así que el gate real hoy no está verde por ninguna razón, ni siquiera llega a evaluar el alias de platform. No re-audito esto (fuera de alcance de P7), sólo lo señalo como "no puedo confirmar en vivo si el check de alias específico pasa o falla" — por lectura de código sí pasa (el alias sigue presente en `next.config.ts` hoy).

**`platform-identity-zero-gate`** (`packages/core/scripts/verticals/platform-identity-zero-gate/index.mjs:13,56-58`): `RETIRED = ['plat','form'].join('')`; `CONTENT_RULES` incluye `['bundle-path', /\bdist[/\\]platform\.css\b|\bplatform\.css\b/gi]` y `['style-export', /(?:\.\/)?styles[/\\]platform(?:\.css)?\b/gi]`. Confirmado wired **blocking** en `packages/core/scripts/ci/gates-manifest/index.mjs:41-42` (`platform-identity-zero-drill` + `platform-identity-zero`, ambos `blocking: true`), que alimenta `pnpm run gates:ci` → `scripts/ci/runner/index.mjs` (corrección menor a un reporte previo que decía "corre en `pnpm lint`": corre en el runner de gates, no en lint).

**Veredicto tarea 2: CONFIRMADO.** El verifier existe, es de sólo-lectura (verificado por su propio test unitario y por inspección), y falla hoy en modo `USE_LOCAL_DS=true` exactamente como describe Codex. La cadena de aliases en `next.config.ts` es más ancha que los 4 imports CSS que citó Cloud (incluye el entrypoint JS `/commercial` también).

### 3. Adjudicación RC-09

Cloud (I-1/E-3) reportó 4 imports CSS rotos (`dist/platform.css` ×1, `commercial.css` ×3) y los llamó "deuda dormida" porque el 2.19.35 instalado los trae. **Cierto pero incompleto**: no vio los 53 imports JS del entrypoint `/commercial` retirado (`ProductWindow`/`TreeView` sin sucesor bajo ese nombre), ni el alias `next.config.ts` de 5 entradas, ni el verifier gobernado que ya falla hoy en modo local, ni el gate cruzado `dependency-honesty` que exige mantener el alias roto. Codex reprodujo y amplió correctamente los 53/49; mi reproducción confirma sus cifras exactas y agrega el detalle símbolo-por-símbolo (13/15 migrables por specifier, 2/15 necesitan decisión de producto).

**¿Hay un WO/lote con dueño?** Sí — y es ANTERIOR a la reauditoría de Cloud (2026-08-19, 9 días antes de esta corrida). `ui-design-system/docs/history/programs/architecture-refactor/2026-08/execution/index.md`:
- §0.4 (hechos del terreno): "La migración de los 53 archivos `/commercial` de app-platform no tiene dueño en ningún roadmap. La reclasificación ya ocurrió (2026-08-12) con destino incompleto: `ProductWindow` se fue al showroom (inalcanzable para apps) y ~14 tokens `--ds-commercial-*` fueron renombrados a `--ds-color-*` — fallo CSS silencioso que un codemod de especificador no cubre. Se crea el lote con dueño en F8."
- §11 (F8 — "Las apps entran al sistema"): "**Lote `/commercial` (con dueño, nuevo):** migrar los 53 archivos de app-platform: especificadores → barril raíz + **renombre de ~14 tokens `--ds-commercial-*` → `--ds-color-*`** (fallo silencioso de CSS — verificación visual obligatoria) + decisión de `ProductWindow` (§12.3) + retiro del alias webpack + re-anclar `dependency-honesty.mjs` (que hoy EXIGE el alias) + `local-ds-boundary.test.mjs` de platform." Precondición explícita: "symlink de evnto regularizado (ventana 1, §1)".

Esto revela algo que **ninguno de Cloud/Codex/Kimi mencionó**: hay una migración de tokens CSS (`--ds-commercial-*` → `--ds-color-*`, ~14 tokens) descrita como "fallo CSS silencioso" — es decir, incluso después de arreglar los specifiers JS/CSS de los 53 archivos, si esos archivos usan clases/tokens `--ds-commercial-*` en su propio CSS (no sólo imports JS), el renombre de tokens en el DS ya rompió su pintura SIN error de build (los tokens no declarados caen a `unset`, no a un error). No verifiqué directamente si esos 14 tokens aparecen en el CSS propio de app-platform (fuera del universo de esta tarea, que pedía imports/exports, no tokens) — lo dejo como pregunta abierta.

**¿La decisión 6 del owner (`ProductWindow`) está tomada?** **NO, sigue abierta por diseño.** `ROADMAP-EJECUCION-2026-08-19.md` §12 "Decisiones del dueño", ítem 6: *"`ProductWindow`: se decide en la fase de app-platform al reclasificar commercial; hoy no bloquea nada del DS."* Lo que SÍ está decidido es **cuándo** se decide (en F8, junto con el lote `/commercial`), no **qué** se hace con `ProductWindow`. Confirma la lectura de Kimi/Codex de que es una decisión aplazada, no tomada — y contradice cualquier lectura que la de por resuelta.

**Veredicto tarea 3: RC-09 — CONFIRMADO Y MÁS GRAVE, como dice la matriz de Codex/Kimi, con matiz: el lote correcto YA estaba especificado con dueño (F8) en el roadmap DS desde el 19-08, 9 días antes de esta reauditoría — no es un vacío de gobernanza, es una tarea planeada y todavía no ejecutada. El riesgo real no es "nadie lo sabe", es "está secuenciado detrás de F0-F7 y nadie lo corrió".**

### 4. Commit colgante `a037d3a3c` (release 2.19.37 de bithire)

```
git -C ui-design-system cat-file -t a037d3a3c            → commit
git -C ui-design-system branch -a --contains a037d3a3c   → (vacío)
git -C ui-design-system merge-base --is-ancestor a037d3a3c HEAD; echo $?  → 1 (NOT ancestor)
git -C ui-design-system show --stat a037d3a3c
  commit a037d3a3cc55368aa14ca0c8747878f9db15f8e0
  Author: davila23 <daniel.avila@rottay.com>
  Date:   Sun Aug 9 23:24:54 2026 -0400
      chore(release): prepare design system 2.19.37
   package.json               | 2 +-
   packages/core/package.json | 2 +-
```
El commit en sí sólo bumpea 2 campos `version` — no es "el código que se publicó", es el commit de preparación de release (probablemente hubo un `npm publish` corrido con ese árbol como working tree en ese momento, luego el commit quedó fuera de toda rama).

```
git reflog | grep a037d3a3c              → 0 matches
git reflog show --all | grep a037d3a3c   → 0 matches
git fsck --unreachable --no-reflogs 2>&1 | grep a037d3a3c → "unreachable commit a037d3a3c..."
```
**Matiz nuevo sobre el riesgo de GC (ni Cloud ni Kimi lo verificaron a este nivel):** el objeto NO está loose (`.git/objects/a0/37d3a3c...` no existe) — está **empaquetado** dentro de `.git/objects/pack/pack-1f9b37cfe9739f546fcb9ac677b308a5fe71e236.pack` (`git verify-pack -v` lo confirma), pack fechado 20-ago (11 días después del commit). Un objeto empaquetado **no** es candidato de la poda automática de `git gc --auto` (que sólo poda objetos *loose* más viejos que `gc.pruneExpire`, default "2 weeks ago" — y aquí no hay override: `git config gc.reflogExpire/gc.pruneExpire` → vacíos, defaults activos). El commit ya sobrevivió al menos un ciclo de gc/repack estando "dangling". **El riesgo real no es "una poda rutinaria lo va a comer en cualquier momento"; es que sigue siendo irrecuperable por nombre (no hay branch/tag) y vulnerable únicamente a un `git repack -ad` / `git gc --prune=now` explícito** — menos inminente de lo que sugiere el framing de "riesgo real de GC" de Cloud/Kimi, pero la conclusión práctica (ancklarlo con una rama YA) es la misma y sigue siendo urgente porque nada impide que alguien corra esa poda agresiva sin saber que hay un commit huérfano ahí.

```
git tag -l | grep 2.19        → (vacío)
git tag -l                    → 9 tags, todos @rottay/design-system@2.8.x o v0.2.0 — el proyecto dejó de taggear releases desde hace ~11 versiones minor.
```
No existe tag `v2.19.37` ni ningún tag ≥2.9.

```
find . -iname "release" -type d (excl. node_modules) → ./test-artifacts/release  (raíz del repo DS, NO dentro de packages/core)
ls test-artifacts/release/  → 2.19.29, 2.19.3
```
No hay evidencia local de release para 2.19.36 ni 2.19.37 — sólo 2.19.29 y 2.19.3 (versiones mucho más viejas). Confirma que no hay ningún artefacto de respaldo local para reconstruir lo que bithire tiene pineado.

**Veredicto tarea 4: CONFIRMADO en su totalidad** (commit existe, no es ancestro de ninguna rama, no está en ningún reflog, no hay tag, no hay evidencia de release local para 2.19.36/2.19.37). Corrección de matiz: el riesgo de pérdida por GC rutinario es menor de lo implicado porque el objeto ya está empaquetado, pero la irrecuperabilidad por referencia (sin branch/tag) es 100% real y el fix (`git branch release/2.19.37 a037d3a3c`) sigue siendo correcto y urgente — una `git gc --aggressive` o `git repack -ad` sí lo perdería.

### 5. Evnto: symlink local — ¿gobernado o accidental?

```
grep -n '"dev"\|"dev:local-ds"' app-evnto/package.json
  "dev": "node ../scripts/rottay-local-modules.mjs --emit && next dev --turbopack -p 3002"
  "dev:local-ds": "node ../scripts/rottay-local-modules.mjs --emit && USE_LOCAL_DS=true node scripts/link-local-ds.mjs && USE_LOCAL_DS=true next dev --turbopack -p 3002"
readlink app-evnto/node_modules/@rottay/design-system → /Users/daniel/Developer/Rottay/ui-design-system/packages/core
grep -n '"@rottay/design-system"' app-evnto/package.json → "2.19.29"
```
`scripts/link-local-ds.mjs` **existe y es un script gobernado y nombrado** (`USE_LOCAL_DS`), coincide con Codex. Pero su mecánica es **la misma que app-platform retiró explícitamente por peligrosa**: usa `symlinkSync`/`rmSync` (mutante), y — hallazgo no visto por ninguno de los tres — **si los artefactos DS locales faltan, el propio script de evnto DISPARA UN BUILD en el repo DS**:
```js
function ensureLocalDsArtifacts(dsRoot) {
  const requiredArtifacts = [resolve(dsRoot,'dist/modern-engine.css'), resolve(dsRoot,'dist/platform.css')];
  if (requiredArtifacts.every(existsSync)) return;
  console.log('[link-local-ds] Missing local DS CSS bundles. Generating minimal artifacts...');
  run('pnpm', ['build:modern-css'], dsRoot);
  run('pnpm', ['build:vertical-css'], dsRoot);
}
```
Ya establecimos que `dist/platform.css` **no existe** en el DS local hoy. Es decir: **la próxima vez que alguien corra `pnpm dev:local-ds` en evnto, el script va a intentar correr `pnpm build:modern-css` y `pnpm build:vertical-css` DENTRO del repo `ui-design-system` sin que quien corrió el comando en evnto lo haya pedido explícitamente** — una escritura cruzada de repo disparada por un flag de otro repo. (No lo ejecuté — regla dura de sólo-lectura de este brazo; lo confirmo por lectura del código y por el hecho ya verificado en tarea 2 de que los artefactos requeridos faltan.) El mismo patrón toca `platform/packages/platform/auth-client` si `USE_LOCAL_AUTH_CLIENT`/`USE_LOCAL_DS` está activo.

¿Es el symlink actual un accidente o consecuencia del mecanismo gobernado?
- No hay `postinstall` en `app-evnto/package.json` que dispare `link-local-ds.mjs` automáticamente (`grep '"postinstall"' package.json` → 0 matches) — un `pnpm install` limpio NO tocaría el symlink.
- `.env.local` de evnto NO tiene `USE_LOCAL_DS=true` (`grep` → 0 matches) — no hay disparador ambiental oculto.
- El único camino que produce el `readlink` observado es que alguien corrió `USE_LOCAL_DS=true node scripts/link-local-ds.mjs` (directo o vía `pnpm dev:local-ds`) en algún momento — el target calculado por el script (`resolve(__dirname, '../../ui-design-system/packages/core')`) coincide byte a byte con el `readlink` real.

**Documentación a nivel app:** `grep -n "USE_LOCAL_DS\|link-local-ds" app-evnto/CLAUDE.md app-evnto/README.md` → **0 resultados en ambos**. A diferencia de app-platform (que documenta el patrón inline en `globals.css` y lo blinda con `local-ds-boundary.test.mjs`), evnto no documenta el mecanismo en ningún archivo de referencia del propio repo.

**Fragilidad:** un `pnpm install` normal en evnto **si reemplazaría** el symlink actual por la resolución normal de pnpm hacia 2.19.29 (comportamiento estándar de pnpm: gestiona sus propios symlinks desde el store de contenido y no respeta un symlink manual/externo bajo `node_modules/`), así que el estado activo hoy es efímero y no sobrevive al flujo de mantenimiento más común del repo.

**Adjudicación Cloud "defecto sin registrar" vs Codex "modo intencional": AMBOS TIENEN RAZÓN EN PARTES DISTINTAS.** Codex tiene razón en que el mecanismo es real, nombrado, código-gobernado y deliberadamente invocado (no "manual" en el sentido de `ln -s` a mano). Cloud tiene razón en que **no está documentado a nivel de app** (0 menciones en `CLAUDE.md`/`README.md` de evnto) y en que el estado activo hoy **es frágil/no persistente** — exactamente la brecha que el propio roadmap DS ya señaló el 19-08 como "Ventana 1: evnto symlinkeada a fuente local... Regularizar ANTES de F5 (F0 lo declara; dueño decide cómo)" y que la decisión del dueño #5 (§12) resolvió en principio ("link declarado y documentado mientras dure la reconstrucción") **pero que todavía no se ejecutó del lado de `app-evnto` (CLAUDE.md sigue sin la mención)**. Es una decisión tomada del lado DS, no implementada del lado app — ni defecto puro ni modo maduro, un intermedio real.

### 6. bithire: pin 2.19.37 vs instalado

```
grep -n '"@rottay/design-system"' app-bithire/package.json → "2.19.37"
ls -la app-bithire/node_modules/@rottay/ | grep design-system
  design-system -> ../.pnpm/@rottay+design-system@2.19.37_.../node_modules/@rottay/design-system
node -e "console.log(require('./node_modules/@rottay/design-system/package.json').version)" → 2.19.37
```
El symlink es el symlink **normal de pnpm** hacia su store de contenido (`.pnpm/...`), NO un symlink manual hacia `ui-design-system/packages/core` como evnto. Pin y versión instalada coinciden exactamente (2.19.37 == 2.19.37) — **cero drift de versión local en bithire**; el problema de bithire es enteramente el de la tarea 4 (el commit fuente del 2.19.37 publicado no es reconstruible), no un problema de symlink/pin desalineado.

Bithire también tiene su propio `scripts/link-local-ds.mjs` y `USE_LOCAL_DS` en `next.config.ts:83` (mecanismo gobernado, mismo patrón mutante que evnto — bithire tampoco migró al patrón read-only de app-platform), pero no está activo en esta corrida (no exporté `USE_LOCAL_DS`, y el symlink real observado es el de pnpm hacia el paquete instalado, no hacia el repo DS).

## Causalidad y severidad

- **app-platform (H-I-1/E-3/RC-09):** BLOQUEANTE confirmado y ampliado. Cadena completa: DS retira `/commercial`, `commercial.css`, `styles/platform`, `dist/platform.css` del wildcard, y ~14 tokens `--ds-commercial-*` → app-platform sigue importando los 4 (CSS) + 53 (JS, 49 archivos) + dependiendo del alias en `next.config.ts` → un gate del propio DS (`dependency-honesty`) exige mantener ese alias roto → el verifier gobernado de platform (`verify-local-ds.mjs`) ya falla hoy en modo local. Ningún gate CI hoy detecta esto en modo normal (no-local) porque el 2.19.35 instalado real todavía trae los artefactos viejos — la falla es 100% latente hasta el próximo repin, exactamente como dice RC-09.
- **Commit colgante 2.19.37 (H-E-4):** BLOQUEANTE confirmado, matizado (empaquetado, no loose — menos urgente de lo que sugiere "riesgo de GC", pero igual de urgente por irrecuperabilidad de referencia).
- **Evnto symlink (H-I-4/E-6):** MEDIO, con matiz de gobernanza a medio camino — mecanismo real y deliberadamente invocado, pero sin documentación de app y frágil ante `pnpm install`.

## Fix correcto (tipo, sin implementar) y fixes que NO deben ejecutarse

**Fix correcto (ya especificado por el roadmap DS, F8, 2026-08-19 — no inventar uno nuevo):**
1. Ejecutar el lote `/commercial` de F8 tal como está escrito: migrar los 53 archivos de specifier a la raíz del DS (13/15 símbolos son un cambio mecánico de import; `TreeView`→`TreeViewConnector`/`PatternTreeView` requiere elegir cuál según uso — server-safe ASCII vs interactivo — no es un alias 1:1); decidir `ProductWindow` (§12.3, todavía abierta); renombrar los ~14 tokens `--ds-commercial-*`→`--ds-color-*` en el CSS propio de app-platform con verificación visual; retirar los alias de `next.config.ts`; re-anclar `dependency-honesty.mjs` del DS para que deje de exigir el alias.
2. Anclar `a037d3a3c` con una rama (`git branch release/2.19.37 a037d3a3c`) — no requiere `--force`, no toca HEAD, es aditivo — ANTES de cualquier `git gc --aggressive`/`git repack -ad`.
3. Evnto: documentar `USE_LOCAL_DS`/`scripts/link-local-ds.mjs` en `app-evnto/CLAUDE.md` (paridad con lo que ya hace bithire/platform a su manera), y decidir pin honesto (repin a 2.19.36+ o mantener 2.19.29 real quitando el symlink) — la propia decisión #5 del dueño (19-08) ya lo resolvió en principio; falta ejecutarla.

**Fixes que NO deben ejecutarse por este brazo ni de apuro por nadie:**
- NO correr `pnpm dev:local-ds` en evnto sin antes generar `dist/platform.css`/`dist/modern-engine.css` en el DS de forma controlada — dispararía un build no solicitado en el repo DS vía `ensureLocalDsArtifacts`.
- NO cambiar sólo `globals.css` de app-platform (import CSS) sin tocar los 49 archivos JS del entrypoint `/commercial` — Codex ya lo advirtió, esta reproducción lo confirma con símbolos concretos.
- NO correr `git gc --aggressive` / `git repack -ad` / `git prune` en el DS antes de anclar `a037d3a3c` con una rama.
- NO asumir que "documentar el symlink de evnto" resuelve el problema sin decidir también el pin real — documentar un estado frágil no lo hace persistente.

## Hallazgos nuevos que ninguno de los tres vio

1. **Gate cruzado contradictorio**: `dependency-honesty` del DS (`validatePlatformLocalBoundary`) EXIGE que `next.config.ts` de app-platform siga aliaseando `@rottay/design-system/commercial`→`dist/commercial.js` y `commercial.css`→`dist/commercial.css`, mientras `platform-identity-zero-gate` del mismo DS prohíbe que el DS vuelva a producir esos artefactos bajo el nombre "platform". Dos gates del mismo repo, ambos blocking, en contradicción de facto sobre el mismo par de rutas.
2. **`ensureLocalDsArtifacts` en `app-evnto/scripts/link-local-ds.mjs` dispara `pnpm build:modern-css`/`build:vertical-css` en el repo DS** si los artefactos faltan (y hoy faltan) — un `pnpm dev:local-ds` en evnto hoy provocaría escritura no solicitada en `ui-design-system`.
3. **El lote `/commercial` con dueño (F8) YA estaba escrito en el roadmap DS 9 días antes de esta reauditoría** (`ROADMAP-EJECUCION-2026-08-19.md §0.4/§11/§12.3`) — incluye una migración de ~14 tokens `--ds-commercial-*`→`--ds-color-*` descrita como "fallo CSS silencioso" que ningún brazo (Cloud/Codex/Kimi) citó; no verifiqué si esos tokens aparecen realmente en el CSS de app-platform (fuera del universo de imports que me tocaba), queda abierto.
4. **El commit colgante `a037d3a3c` está empaquetado, no loose** — sobrevivió ya un ciclo de gc/repack. El riesgo de pérdida por GC rutinario es menor de lo que insinúa el lenguaje "riesgo real de GC" de Cloud/Kimi; el riesgo real es la ausencia de referencia (branch/tag), vulnerable sólo a poda agresiva explícita.
5. **`test-artifacts/release/` vive en la raíz del repo DS, no en `packages/core/`** — un reporte previo lo buscó en la ruta equivocada y no encontró nada; en la ruta correcta sólo hay evidencia de 2.19.29/2.19.3, ninguna para 2.19.36/2.19.37.
6. **bithire y evnto comparten el patrón mutante `link-local-ds.mjs`/`USE_LOCAL_DS`; app-platform es la única de las tres que migró al patrón read-only (`verify-local-ds.mjs` + alias declarativo en `next.config.ts`, blindado por un test que prohíbe explícitamente que el script mutante exista)** — una asimetría de madurez entre apps que ningún brazo señaló.

## Lo que no pude cerrar

- Si los ~14 tokens `--ds-commercial-*` (mencionados en el roadmap DS como ya renombrados a `--ds-color-*`) aparecen realmente en el CSS/TSX de los 53 archivos de app-platform — necesitaría un censo dedicado de esos nombres de token, fuera del alcance de "imports/exports" que me tocaba.
- Si el check específico de alias de `dependency-honesty` (`validatePlatformLocalBoundary`) pasaría o fallaría hoy en una corrida limpia — el comando real (`pnpm run dependency:honesty`) muere antes por un error no relacionado en `recipes/profiles/index.ts`; confirmé por lectura de código que el alias sigue presente en `next.config.ts` hoy, así que ESE check específico pasaría, pero no lo vi ejecutar de punta a punta.
- No verifiqué el contenido de la versión realmente publicada en el registry npm privado para 2.19.37 (fuera de alcance de sólo-lectura sobre los 4 repos locales) — sólo confirmé que no hay evidencia LOCAL (git ni test-artifacts) para reconstruirla.
