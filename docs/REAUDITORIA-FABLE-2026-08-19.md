# Re-auditoría Fable — 2026-08-19

Ejecución del Anexo de [`docs/DIAGNOSTICO-Y-PLAN-2026-08-19.md`](DIAGNOSTICO-Y-PLAN-2026-08-19.md):
verificación afirmación por afirmación de ese plan y de
[`docs/ARCHITECTURE.md`](ARCHITECTURE.md) contra el árbol real, con comandos
propios. Ninguna cifra se dio por válida: todas fueron re-medidas.

---

## 0. Método, alcance y límites

**Qué se auditó.** El árbol de trabajo (working tree), no `HEAD`: `git status
--porcelain` devuelve 35 archivos modificados y 6 no rastreados **antes** de
esta auditoría, así que todo lo que sigue describe el disco de hoy, que es lo
que el Anexo pide. Commit base: `0e3f67c19`.

**Rol.** Read-only. No se modificó, movió ni borró ningún archivo. El único
archivo creado es este. No se ejecutó ningún gate ni script del repo (podrían
escribir artefactos); todas las medidas salen de lectura: `grep`, `find`,
`git ls-files`, `md5`, y scripts propios de análisis escritos fuera del repo
(`/tmp`) que sólo leen.

**Apps externas.** El Anexo pide marcar NO VERIFICADO lo que dependa de las
apps salvo que se mida en disco. Se midió en disco: los tres repos están
presentes y se leyeron en su estado local, que **no necesariamente es el de
CI**:

```
app-bithire   8abd05578  2026-08-10
app-evnto     6ff6ae9ec  2026-07-31
app-platform  44abb819   2026-08-04
```

Toda cifra de apps de este informe vale para esos commits.

**Advertencia de método aplicada a mí mismo.** El censo de consumidores falló
tres veces antes de dar números defendibles, y las tres corrigen hacia abajo:

1. `grep -w <símbolo>` cuenta **docstrings**. `ListToolbar` aparece en un
   comentario de `Spinner/engines/modern`; `AlertIcon` en un ejemplo de uso de
   `Tag/engines/rustic`. Ninguno es un import.
2. `grep -w <símbolo>` no distingue **proveedor**: 23 de las 24 importaciones
   internas de `Space` en el DS vienen de `antd`, no del primitive.
3. Una regex de import con cuantificador perezoso sobre `[\s\S]` **traga la
   prosa** entre un `export` y un `from` posterior, e inventa consumidores
   (así apareció un falso `Alert/contracts → Callout`).

El censo definitivo se hace sobre un **grafo de imports con comentarios
eliminados antes de parsear** (17.026 aristas, 3.827 archivos de
`packages/core/src` + `packages/showroom`; cláusulas sin llaves anidadas;
especificadores relativos y `@/` resueltos a rutas de repo). Para las apps, la
misma técnica restringida a especificadores `@rottay/design-system*`. Se cuentan
**archivos importadores distintos**, excluyendo el owner, los tests, las
historias y los barriles de tier. Este grafo no ve `export * from`, así que
puede subcontar re-exportaciones comodín; se dice donde importa.

**Consecuencia directa de (1) y (2): el plan comete el mismo error en su
divergencia 2** (ver §2). Es la razón por la que este informe insiste en
distinguir *menciones* de *imports* y *símbolo del DS* de *símbolo homónimo del
app*.

---

## 1. Veredicto ejecutivo

El plan es sólido en su tesis central (**no hay que reescribir primitivas; el
trabajo es cableado, drenaje de pintura inline y craft**) y la mayoría de sus
cifras se reproducen exactamente. Los problemas están concentrados en siete
puntos, y cinco de ellos son bloqueantes:

| # | Hallazgo | Gravedad |
|---|---|---|
| 1 | `./commercial` ya fue retirado de la fuente y sigue publicado en 2.19.35 con 53 consumidores en app-platform; la versión local es un **patch** (2.19.36) y hay **0 changesets** | Bloqueante |
| 2 | La divergencia 1 (chrome de colección a `structures/`) obliga a que `patterns/data/data-table` importe una **structure** — inversión de la ley de tiers que la propia divergencia invoca | Bloqueante |
| 3 | La divergencia 2 mide mal: los 36 `<DetailSurface>` de app-bithire son **su propio componente** (`src/ui/details/surface-shell/`), no el del DS. app-bithire importa el `DetailSurface` del DS **cero veces**. El marcador real es **3 vs 3** — el mismo empate que el plan dice haber revertido | Bloqueante |
| 4 | La lista de borrado del §2 incluye owners con consumidores vivos: `tokens/ts/foundation/base/*` (5), `compilers/kernel/runtime/appearance/` (3, uno es el compilador de composición), `contracts/kernel/tokens/extensions/` (2) | Bloqueante |
| 5 | Las unificaciones de la divergencia 4 tienen **61 archivos importadores en apps** (`Space` 36, `ConfirmDialog` 17, `Toggle` 8) que el plan sólo agenda en F8; `FloatButton.BackTop` —declarado retiro sin consumidores— está en `app-bithire/src/app/(dashboard)/layout.tsx:401`; y `Typography.Link → TextLink` provoca un **cambio silencioso de componente**, no una rotura | Bloqueante |
| 6 | El gate exports→artefacto de F0 no puede vivir en `gates:ci`: CI corre `gates:ci` (ci.yml:176) **antes** de `build` (ci.yml:199) | Alta |
| 7 | La línea base de F2 (908 canales pelados) subestima la deuda: 1.958 nombres de canal nunca alcanzan una `var()` de raíz | Alta |

Aparte, dos afirmaciones del plan quedan **refutadas** por medición
(`--_ds-*: 252`, `10 alias duplicados`) y una tarea de F1 ya está hecha (la
adjudicación de exposición por raíz).

---

## 2. Las 7 divergencias del §3 (prioridad 1 del Anexo)

### Divergencia 1 — el chrome de colección lo gana `structures/workspace/`

**REFUTADO en su coste declarado; el cambio rompe la ley de tiers que lo justifica.**

Censo de imports reales (archivos importadores distintos, sin el owner, sin
tests/stories, sin barriles de tier):

| Par | patterns (prod DS) | structures (prod DS) | patterns (showroom) | structures (showroom) |
|---|---|---|---|---|
| `list-toolbar` / `table-toolbar` | 5 | 0 | 4 | 3 |
| `column-settings` / `column-menu` | 0 | 2 | 2 | 3 |
| `saved-views` / `saved-views-menu` | 1 | 0 | 4 | 3 |
| `filter-panel` / `field-filters-panel` | 9 | 0 | 4 | 3 |
| **Total dedup. por archivo** | **11** | **2** | **8** | **4** |

La dirección que midió Kimi (~22 vs ~13 a favor de patterns) se sostiene: hoy
**11 archivos de producción del DS** dependen del lado patterns y **2** del lado
structures. Los 11 son:

```
entrypoints/public/contracts/patterns/index.ts
entrypoints/public/patterns/list-toolbar/index.ts
ui/patterns/data/data-table/presentation/table/index.tsx
ui/surfaces/presentation/pages/admin/audit/index.tsx
ui/surfaces/presentation/pages/data/list/index.tsx
ui/surfaces/presentation/pages/data/report/index.tsx
ui/surfaces/presentation/pages/data/search/index.tsx
ui/surfaces/presentation/pages/operations/kanban/index.tsx
ui/surfaces/presentation/pages/workspace/collection-workspace/index.tsx
ui/surfaces/presentation/pages/workspace/collection-workspace/render-dispatch/index.tsx
ui/surfaces/presentation/pages/workspace/decision-inbox/index.tsx
```

Los 2 del lado structures son `entrypoints/public/structures/column-menu` y
`collection-workspace`.

Lo que el plan no ve:

1. **`data-table` compone `filter-panel`.**
   `ui/patterns/data/data-table/presentation/table/index.tsx:27` importa
   `PatternFilterPanel` desde `../../../../facade` y lo renderiza en `:332`.
   `ui/patterns/facade/index.ts:15` lo re-exporta desde `../forms/filter-panel`.
   Si el owner canónico pasa a `structures/workspace/field-filters-panel`,
   **un pattern tendría que importar una structure**. Eso invierte la dirección
   `primitives → patterns → structures → surfaces` de ARCHITECTURE §1.3, que es
   exactamente la ley invocada para revertir la decisión de Kimi. La divergencia
   se contradice a sí misma en su consumidor más importante.

2. **El coste declarado está incompleto.** El plan acepta migrar
   «`collection-workspace`, `data/list`, `decision-inbox` y el entrypoint
   público»: 4 destinos. Los importadores reales son 11. Faltan en la lista:
   `admin/audit`, `data/report`, `data/search`, `operations/kanban`, el propio
   `data-table`, `collection-workspace/render-dispatch`,
   `entrypoints/public/contracts/patterns` y el barril `patterns/facade`.

3. **Se pierde cobertura de motores.** El lado patterns es engine-backed; el
   lado structures no lo es:
   ```
   1254  ui/patterns/data/list-toolbar/engines/modern/index.tsx
    993  ui/patterns/data/list-toolbar/engines/classic/index.tsx
      9  ui/patterns/data/list-toolbar/engines/rustic/index.tsx
    243  ui/structures/workspace/table-toolbar/runtime/rendering/index.tsx
   ```
   Igual para los otros tres pares. ARCHITECTURE §1.4 dice que `classic` y
   `rustic` se mantienen «for compatibility coverage»; esta divergencia los
   elimina para cuatro familias de chrome sin decirlo.

4. **`ui/patterns/runtime/filtering/panel-state` (`useFilterPanel`)** —owner que
   ARCHITECTURE §2.6 conserva— está documentado íntegramente en términos de
   `PatternFilterPanel` (`index.ts:6,18`). Queda huérfano o hay que reescribirlo.

*Comandos: grafo de imports resuelto sobre `packages/core/src` +
`packages/showroom`; `grep -n "PatternFilterPanel" ui/patterns/data/data-table/presentation/table/index.tsx`;
`find … -name '*.ts*' -not -path '*/tests/*' | xargs wc -l`.*

### Divergencia 2 — `DetailSurface` canónica, `record-workbench` se retira

**REFUTADO en su evidencia. El «45 vs 3» mide un componente que no es del DS;
el marcador real es 3 vs 3, exactamente el empate que el plan dice revertir.**

La medición cruda en JSX reproduce algo parecido al plan:

```
grep -rn '<DetailSurface'          app-*/src --include='*.tsx'
  app-bithire 36 | app-evnto 4 | app-platform 2   → 42
grep -rn '<RecordWorkbenchSurface' app-*/src --include='*.tsx'
  app-platform 3                                   → 3
```

Pero **36 de esos 42 no son el `DetailSurface` del design system**:

```
ls app-bithire/src/ui/details/surface-shell/
  alignment-grid chart-frame contracts details-mode embedded-collection
  header hero-metric importance index.tsx layout …
app-bithire/src/ui/details/surface-shell/index.tsx:54
  import type { DetailSurfaceProps } from "./contracts";

grep -rn "DetailSurface" app-bithire/src | grep "@rottay/design-system"
  (vacío)
```

**app-bithire tiene su propio `DetailSurface`** —`src/ui/details/surface-shell/`,
con sus propios contratos— e importa el del DS **cero veces**. Los otros dos:
app-evnto lo importa en 2 archivos (`commerce/products/screens/detail`,
`venue/staff/screens/detail`), app-platform en 1
(`identity/users/screens/detail`).

Marcador honesto de consumo del DS:

| | DS `DetailSurface` | DS `RecordWorkbenchSurface` |
|---|---|---|
| archivos de app que lo importan | **3** (evnto 2, platform 1) | **3** (platform 3) |
| consumidores de producción dentro del DS | 0 | 0 |
| archivos de showroom | 3 | 3 |

Es decir **3-3**, el mismo empate que reportaban las auditorías previas y que
esta divergencia dice haber medido mal. El argumento cuantitativo del plan se
cae entero.

Lo cual **no** hace incorrecta la decisión, pero sí cambia por completo su
fundamento y añade un dato incómodo que el plan no registra: **el consumidor
más grande del DS no usa ninguna de las dos superficies — se construyó la
suya**. Si `DetailSurface` va a ser la recipe canónica de detalle, el hecho
relevante a explicar es por qué app-bithire (42 pantallas de detalle) la
rechazó, no si gana 45 a 3.

La autodeclaración sí es falsa, y eso se sostiene: `record-workbench/index.tsx:6`
dice «Enhanced DetailSurface with: tab management, related records, action
toolbar…» y sus imports (`:23-34`) no tocan `DetailSurface` — compone `Box`,
`Stack`, `Flex`, `Text`, `Heading`, `Button`, `Skeleton` directamente.
**CONFIRMADO.**

Dos precisiones más:

- **«492 líneas de contrato» es impreciso.** 492 es el archivo completo
  (`index.tsx`), que incluye 4 interfaces *y* el componente. El contrato son
  `RecordTab` (`:45`), `RecordAction` (`:55`), `MetadataField` (`:66`) y
  `RecordWorkbenchSurfaceProps` (`:72`), 47 campos declarados.
- **El delta no es de 3 campos, es de modelo.** `DetailSurfaceProps` exige
  `adapter: EntityAdapter<TRaw,TView>` y un `config` partido en
  `presentation`/`behavior`/`visual`/`access`
  (`ui/surfaces/foundation/contracts/index.ts:636`). `RecordWorkbenchSurface`
  es *bring-your-own-render*: `tabs: [{ render: () => ReactNode }]`, sin
  adapter y sin modelo de acceso. Migrar las 3 pantallas de compliance exige
  escribir un `EntityAdapter` por pantalla y reestructurar el config, no sólo
  añadir «slot de relacionados, empty-state por tab, badge por tab» al
  contrato de `DetailSurface`. La recomendación del §6.5 («absorber el delta
  antes, en el mismo lote») sigue siendo la correcta, pero el lote es mayor de
  lo que el plan presupuesta.

### Divergencia 3 — no se declara `./commercial`

**CONFIRMADO en el hecho; REFUTADO en el encuadre. Esto ya no es una decisión
a futuro: es una rotura latente y el plan la agenda en el frente equivocado.**

Estado medido:

```
Object.keys(package.json.exports).filter(/commercial/)   → NONE
grep -n 'commercial' packages/core/package.json          → (vacío)
find packages/core/src -iname '*commercial*'             → (vacío)
grep -n 'commercial' vite.config.ts public-entrypoints.manifest.json → (vacío)
ls packages/core/dist/commercial*   → commercial.js .cjs .d.ts .css   (11 ago)
ls packages/core/src/entrypoints/   → charts eslint graphics icons public server
ls packages/core/dist/entrypoints/  → charts commercial eslint graphics icons public server
```

`dist/commercial.d.ts` dice `export * from './entrypoints/commercial/index'` y
`dist/commercial.js` importa de `./ui/patterns/commercial/…` — rutas que **ya no
existen en fuente**. `dist/` está en `.gitignore:8` y tiene 0 archivos
trackeados: lo que hay en disco es un build viejo. **El build actual no puede
producir `dist/commercial.js`.**

Del lado consumidor:

```
grep -rl "@rottay/design-system/commercial" app-platform/src | wc -l   → 53
app-platform/next.config.ts:53,60  → alias a dist/commercial.css y dist/commercial.js
                                     (sólo activo con USE_LOCAL_DS=true)
app-platform/package.json          → "@rottay/design-system": "2.19.35"
node_modules/@rottay/design-system/package.json (2.19.35)
                                   → exports: ./commercial, ./commercial.css
```

Es decir: **el paquete publicado 2.19.35 SÍ declara `./commercial`** y los 53
archivos resuelven contra él. Y:

```
packages/core/package.json → version 2.19.36
ls .changeset/             → config.json  README.md      (0 changesets)
```

La eliminación de un subpath público con 53 consumidores está hoy en cola como
**patch, sin changeset**. Ni el plan ni ARCHITECTURE §1.9 —que enuncia «There is
no `./commercial` subpath» como ley ya vigente— registran que el retiro ya
ocurrió en fuente y sigue vivo en el contrato publicado.

Consecuencia de orden: el plan pone las 53 referencias en **F8** («último,
porque toca repos ajenos») y «Regenerar `dist/`» en **F6**. Cualquiera de las
dos cosas que ocurra primero rompe app-platform. Esto pertenece a F0 con
changeset major, no a F8.

### Divergencia 4 — unificaciones nuevas (`Message`, `Callout`, `Space`, `ConfirmDialog`, `FloatButton.BackTop`, `map-view`)

**PARCIAL. Dentro del DS son limpias; fuera del DS cuatro de ellas tienen 62 archivos de app que el plan no cuenta.**

Consumidores dentro del DS (grafo resuelto, excluyendo el propio owner):

Dentro del DS, los 9 owners sólo son alcanzados por su barril de categoría, su
entrypoint público y sus tests; el único acoplamiento real entre owners es
`BackTop` ← `FloatButton/contracts` y una referencia de `Alert/contracts` a
`Callout` que resultó ser **prosa, no import** (ver §7.2). Retiro limpio dentro
del paquete.

Fuera del paquete no lo es. Imports desde `@rottay/design-system*`, archivos
distintos, con comentarios eliminados antes de parsear:

```
Space          36   (app-platform 35, app-evnto 1)
ConfirmDialog  17   (app-platform)
Toggle          8   (app-bithire)
Callout         1   (app-evnto)
FloatButton     1   (app-bithire)
Message / Stepper / HoverCard / BackTop / MapView / StatsHeader / ListSurface
                0
```

`Message`, `Stepper`, `HoverCard` y `map-view`: retiro limpio, **CONFIRMADO**.
`Space`, `ConfirmDialog` y `Toggle`: **61 archivos de app**. El §5 del plan
(«Riesgos») sólo dice «las apps no usan esos subpaths hoy (verificado)», lo cual
es cierto de los 77 subpaths granulares pero no de estos componentes, y F8 —el
frente que toca apps— sólo menciona iconos y el alias `/commercial`.

**`FloatButton.BackTop` NO es un retiro sin consumidores.**
`app-bithire/src/app/(dashboard)/layout.tsx` importa `FloatButton` (`:23`) y usa
las tres formas: `FloatButton.Group` (`:135,159`), `FloatButton` suelto
(`:151,183,378`) y **`FloatButton.BackTop` (`:401`)**. El plan y ARCHITECTURE §3
dan por hecho que «standalone `BackTop` is the canonical control and the
`FloatButton.BackTop` compound retires — one capability, one public name»; ese
retiro rompe el layout del dashboard de app-bithire.

**Renombre `Typography.Link → TextLink`: no es una rotura, es peor.**
`ui/primitives/display/index.ts` exporta `Link` desde `Typography`;
`ui/primitives/navigation/index.ts:71` exporta el otro como `NavLink`. Los 3
archivos de app-bithire que importan `Link` desde `@rottay/design-system`
(`features/applications/…/tab-primitives`, `features/candidates/…/evaluation`,
`features/sprints/…/tab-primitives`) reciben hoy el `Link` tipográfico. Después
del renombre, `import { Link }` **sigue compilando** pero resuelve al `Link` de
navegación, que es otro componente con otro contrato (`LinkType` +
`AnchorHTMLAttributes` vs `TypographyCraftProps`). Un cambio silencioso de
componente no lo detecta el typecheck de la app en todos los casos y no lo
cubre un changeset major por sí solo: hace falta un codemod o un período con
`TextLink` disponible antes de reasignar el nombre `Link`.

### Divergencia 5 — `Calendar`/`CalendarView` se quedan los dos con ley de composición

**CONFIRMADO como decisión; la ley que la sostiene no se cumple hoy en 2 de 3 casos.**

```
ui/primitives/display/Tree      → importado por ui/patterns/visualization/tree-view/engines/modern  ✓
ui/primitives/display/Calendar  → único importador: ui/primitives/display/index.ts  ✗
ui/primitives/display/Timeline  → importado por ui/patterns/communication/activity-log/engines/modern
                                   (NO por ui/patterns/visualization/timeline)  ✗
```

`tree-view` sí compone `Tree` (el ejemplar que ARCHITECTURE §1.3 cita).
`calendar-view` **no** compone `Calendar` y el pattern `timeline` **no** compone
el primitive `Timeline`. La divergencia 5 es por tanto una **construcción
nueva**, no una preservación, y el plan lo agenda correctamente en F5. Lo que
falla es ARCHITECTURE: ver §5 de este informe.

### Divergencia 6 — la métrica es 263 asignaciones, no 3.548 canales

**CONFIRMADO exactamente.**

```
sum(root-catalog.json.roots[].assignments.total)  → 263
sum(root-catalog.json.roots[].collapses.total)    → 3275
3275 / 3693 = 88,68 %   (el plan dice 88,7 %)
418 = 3693 - 3275 = ratchet.baselineToday.value   ✓ (seeds 262 + perFamily 156)
```

La cifra de 263 (raíz × modo) es el residuo declarado por el propio catálogo y
se reproduce sumando el campo. La métrica es defendible y consistente.

### Divergencia 7 — `mono-stat` se queda como capacidad distinta

**CONFIRMADO.** `MonoStat` lo importan **7 archivos de app-platform** y 3 del
showroom; `Statistic` tiene 4 importadores de producción dentro del DS, 4 en
showroom y **0 en apps**. Poblaciones de consumo disjuntas: tratarlo como
variante de `Statistic` habría roto 7 archivos de app sin beneficio para ningún
consumidor de `Statistic`. La divergencia es correcta y su evidencia es más
fuerte de lo que el plan declara.

---

## 3. Lista maestra de borrado del §2 (prioridad 2 del Anexo)

### 3.1 Ítems con consumidor que el plan omitió

| Ítem del §2 | Veredicto | Consumidor omitido |
|---|---|---|
| `tokens/ts/foundation/base/*` | **REFUTADO** | `…/base/density` tiene 5 consumidores de producción: `infrastructure/compilers/kernel/foundation/css/appearance-posture/index.ts:28`, `infrastructure/runtime/theming/composition/react/tokens/index.ts`, `ui/structures/dashboard/insights/foundation/contracts/index.ts:2`, `ui/structures/dashboard/insights/presentation/metrics/cards/index.tsx`, `ui/surfaces/presentation/pages/workspace/collection-workspace/index.tsx:88`. Además ARCHITECTURE §3 dice que `density` **se mueve** a `foundation/presets/` — los dos documentos se contradicen sobre el mismo owner |
| `compilers/kernel/runtime/appearance/` («absorbido») | **REFUTADO** | 3 consumidores de producción + 5 de test. El decisivo: `infrastructure/compilers/composition/tenant-theme/index.ts:69` importa `withExpressiveFieldDefaults` de `../../kernel/runtime/appearance`. No es una lápida: es dependencia viva del compilador de composición. También lo consume `ui/patterns/customization/branding-preview-sandbox/index.tsx:52` (`appearanceToVariables`) |
| `contracts/kernel/tokens/extensions/` («nunca cableado») | **REFUTADO** | `foundation/contracts/kernel/tokens/extensions` es importado por `foundation/contracts/runtime/engine/index.ts:23` y usado como campo `extensions?: ComponentExtensions` en `:57`. Los tres motores de `Card` lo desestructuran (`engines/{classic,modern,rustic}/index.tsx`, `extensions: _extensions`). Está cableado en el tipo y descartado en runtime: quitarlo cambia un contrato de motor |
| `icons/presentation/legacy/` («el catálogo cubre las 15») | **PARCIAL** | 15 carpetas, pero sólo 2 están re-exportadas: `graphics/icons/index.ts:31-34` exporta `AlertIcon` y `LoaderIcon` (las otras 13 están explícitamente NO re-exportadas por colisión de nombre). **`app-platform/src/features/compliance/docs/components/catalog-workbench/readiness.tsx:5` importa `AlertIcon` de `@rottay/design-system/icons`.** Los equivalentes de catálogo (`security-alert`, `status-loading`) son **roles semánticos**, no componentes homónimos: no es un drop-in. También lo cita `ui/primitives/display/Tag/engines/rustic/index.tsx:26,56` |
| «10 alias duplicados de package.json» | **REFUTADO** | Por comando byte-idéntico a un gate del manifiesto son **17**, no 10 (`engine-audit:check`, `hooks:check`, `gat07:check`, `ownership:patterns:check`, `quality-evidence:v2:drills`, `size-axis:check`, `spacing-rhythm:check`, `spacing-rhythm:test`, `channel-liveness:check`, `channel-liveness:test`, `platform-identity:check`, `platform-identity:test`, `gate:styles-css`, `cra12:check:local`, `appboundary:check`, `wiring:check`, `tokens:catalog:check`). Y al menos 3 tienen invocador propio: `engine-audit:check` ← raíz `verify:core`; `hooks:check` ← `prebuild`; `gat07:check` ← `ci.yml:187`. No es riesgo cero |
| «lápidas `collapse-paint.css` y `patterns-paint.css`» | **PARCIAL** | Sólo la primera es lápida. El propio `src/foundation/tokens/residual-adjudication.json:46-47` dice que `collapse-paint.css` está correctamente completada (sus 10 declaraciones sí viajan en los tres bundles vía `collapse.css`), mientras que `patterns-paint.css` (914 líneas) **no fue migrada**: `:68` registra que ningún skin es dueño de `.ds-metric-card__status-dot`. Borrarla es tirar pintura autorada sin destino, no retirar una lápida |
| Los 2 gates sin invocador | **PARCIAL** | Cierto que tienen 0 referencias en `package.json` y en `ci-gates.manifest.mjs` (`grep -c` → 0). Pero sus drills sí corren en CI: `channel-wiring-zero-delta-gate.test.mjs` y `cra-17-integral-gate.test.mjs` importan el módulo y quedan bajo el glob recursivo de `test:scripts` (`ci.yml:179`). Si la decisión es «se borra», el test cae en el mismo lote (AUDITORIA-KIMI ya lo señaló para cra-17; el plan no lo recoge) |
| 77 subpaths granulares | **PARCIAL** | 0 importadores en las tres apps (verificado **exhaustivamente**, los 77, no por muestreo). Pero **2 tienen importador en el showroom**: `./runtime/root-attributes` y `./runtime/visual-authority`, 1 archivo cada uno |
| Toda retirada de `ui/` | **OMISIÓN TRANSVERSAL** | El §2 no menciona el lado showroom. Cada candidato tiene fila en `packages/showroom/src/data/registry/*.ts` y en `src/data/navigation.ts`, y hay tests que **enumeran** esos mapas (`e2e/diagnostics/primitive-category-roster.unit.test.mjs` comprueba que cada `Record<PrimitiveCategory,…>` declare exactamente las 6 categorías gobernadas, y que la lista de mapas del test sea el conjunto completo del árbol). Un retiro de componente es lote DS + entrypoint + registry + navigation + ruta + roster + capturas |
| `quality-evidence` v1 | **PARCIAL** | Correcto que está vivo vía `quality-evidence:check` y `quality-evidence-gate.test.mjs`. Falta un consumidor: `packages/core/test-artifacts/quality-evidence/wo-cra-23/R0/manifest.json` referencia `quality-evidence/cli.mjs` — evidencia trackeada que quedaría apuntando a la nada |
| `coverage/` + `coverage-final/` | **PARCIAL** | Existen y están vacíos (0 B; `coverage/` sólo contiene `.tmp/`), pero **no están trackeados** (`.gitignore:18-19`). Ningún commit puede borrarlos: es limpieza de disco local, no un lote de repo. Lo mismo aplica a `packages/showroom/.tmp/` (32 entradas, 0 trackeadas, `.gitignore:101`) |

### 3.2 Ítems del §2 verificados como retiro limpio

| Ítem | Medición |
|---|---|
| 23 carpetas vacías bajo `src` (35 en repo) | `find packages/core/src -type d -empty \| wc -l` → **23**; repo (sin `node_modules`/`.git`) → **35**. CONFIRMADO exacto |
| 8 carpetas vacías `entrypoints/public/**` | `{primitives,patterns,structures,surfaces} × {contracts,runtime}` = **8**, todas en la lista de vacías. CONFIRMADO |
| «17 codemods de febrero» | 16 `.mjs` + `helper-gaps-report.json`, todos con `git log -1` en 2026-02-08 salvo `fix-null-array-guards.mjs` (2026-02-17). **0 referencias externas** (las 3 coincidencias son autorreferencias). CONFIRMADO (con la precisión de que uno es un reporte, no un codemod) |
| «7 scripts vivos de la raíz» | `dependency-honesty.mjs` + su test, `effect-registry-audit.mjs` + su test, `roadmap-status.mjs` + su test, `roadmap-commercial-status.mjs` = **7**, todos de julio. CONFIRMADO |
| Monolito `probe/cascade-probe.mjs` + test | Hay **dos** `cascade-probe.mjs`. El vivo es el de la raíz del programa (31.712 B), que importa `./probe/css-parse.mjs` y `./probe/leg1-symbolic.mjs`. El monolito es `probe/cascade-probe.mjs` (**94.953 B**), con **0 importadores**; su test (28.154 B) sólo lo menciona en un comentario de uso. CONFIRMADO |
| «5 módulos vivos de la sonda» (§4) | `css-model.mjs`, `css-parse.mjs`, `leg1-symbolic.mjs`, `leg2-chromium.mjs`, `value-eval.mjs` = **5**. CONFIRMADO |
| `.claude/agents/` | 2 archivos: `componentes-agent.md`, `storybook-agent.md`. CONFIRMADO |
| 19 espejos `tokens/ts/runtime/components/*` | 20 entradas = 19 componentes + `index.ts`. Único consumidor: `tokens/ts/facade/index.ts`, cuyo único consumidor es `foundation/tokens/index.ts`. Cadena cerrada: retirar `components` + `mirrors` + `facade` juntos es limpio, con el paso de barril que el plan ya prevé. CONFIRMADO |
| `kernel/accessibility/wcag/` | 0 consumidores. CONFIRMADO |
| `contracts/composition/components/` | 1 consumidor, el barril `foundation/contracts/index.ts`. CONFIRMADO |
| cascarones vacíos | `presentation-profiles/` 7 dirs / 0 files; `runtime/graphics/continuous-runtime-governor/` 6 dirs / 0 files; `theming/foundation/color/` 2 dirs / 0 files. CONFIRMADO. (`engines/foundation/contracts/binding/` tiene 1 archivo, no está vacío — imprecisión menor) |
| `theming/composition/react/provider/theme/` | 0 consumidores. CONFIRMADO |
| `resolution/{subdomain,domain}/` | 1 consumidor cada uno (el barril `resolution/index.ts`) + 1 test cada uno. CONFIRMADO con el paso de test |
| `icons/runtime/adapters/` vacío | 0 archivos; contiene sólo `phosphor-ssr/`, que también está vacío. CONFIRMADO |
| alias residual `WorkspaceFilterRail` | Sólo `ui/structures/workspace/active-filters-bar/index.ts:20,22`. 0 consumidores en DS, showroom o apps. CONFIRMADO |
| pictogramas `candidate-evidence` / `event-moment` | Presentes en `graphics/pictograms/foundation/catalog/index.ts:6,8`. Corpus = **8** artworks. El campo `family` (`:18-25`) contiene los literales de producto `'bithire'` y `'evnto'`. CONFIRMADO |
| `probe/kit-inventory` | Existe (`packages/showroom/src/app/probe/kit-inventory`), entre 43 probes. CONFIRMADO |
| `audit-presets.mjs` + `audit-report.json` | Existen, trackeados, 0 referencias externas. CONFIRMADO |
| 4 `.md` de raíz a archivar | `BACKLOG.md`, `DESIGN_SYSTEM_FINAL_REVIEW.md`, `DOCUMENTATION_ENHANCEMENT.md`, `WAVE_4_PRIMITIVES.md`, los 4 trackeados. CONFIRMADO |
| `pages/data/list`, `record-workbench`, `approval-inbox`, `stats-header`, `map-view` | 0 consumidores de producción en el DS (excepto `pages/data/list`, con 1: una fixture de `brand-studio/runtime/tenant-theme-preview`). 0 en apps. CONFIRMADO |

### 3.3 El §4 «lo que NO se toca» — verificado y reforzado

Ninguno de los 8 es huérfano, y **5 de los 8 tienen importadores directos en las
apps** — evidencia más fuerte que la que el plan declara («contract tests,
fixtures de brand-studio y probes del showroom»). Archivos importadores
distintos:

| Componente | prod DS | tests DS | showroom | apps |
|---|---|---|---|---|
| `DecisionPanorama` | 1 | 0 | 0 | 0 |
| `WidgetBoard` | 4 | 0 | 2 | **1** (bithire) |
| `BulkSelectToggle` | 0 | 1 | 3 | 0 |
| `StatusFilterPills` | 0 | 1 | 2 | **3** (platform) |
| `MonoStat` | 0 | 3 | 3 | **7** (platform) |
| `AsciiDiagram` | 0 | 3 | 3 | **7** (platform) |
| `TokenInspector` | 1 | 1 | 2 | 0 |
| `TerminalBlock` | 0 | 3 | 3 | **7** (platform) |

Los cuatro que AUDITORIA-KIMI rescató también se sostienen, con consumo de
producción **dentro** del DS: `Popover` 7, `Sheet` 4, `Statistic` 4, `Tree` 3
(más 4-6 en showroom cada uno). El §4 es **CONFIRMADO** en todos sus puntos.

---

## 4. Orden de frentes del §1 (prioridad 3 del Anexo)

### 4.1 Dependencias invertidas

1. **F6 antes que F8 rompe app-platform (bloqueante).** F6 dice «Regenerar
   `dist/` y extirpar la identidad `platform` completa»; F8 dice «retiro
   coordinado del alias webpack de `/commercial` en app-platform … cuando la
   capacidad esté reclasificada». Pero regenerar `dist/` es exactamente lo que
   elimina `dist/commercial.js` y `dist/platform.css` del disco local, y
   publicar el árbol actual es lo que elimina `./commercial` del paquete. Las 53
   referencias de app-platform tienen que migrar **antes** de F6, no después.

2. **F5 antes que F8 rompe apps (bloqueante).** F5 retira `Space`,
   `ConfirmDialog` y `Toggle`; los tres tienen consumidores en apps (34/17/8) y
   F8 es el último frente. El mismo problema con `Typography.Link`.

3. **El gate exports→artefacto de F0 no cabe donde el plan lo pone (alta).**
   ARCHITECTURE §1.10 exige que todo gate esté en `ci-gates.manifest.mjs`, pero
   CI ejecuta `gates:ci` en `ci.yml:176` y `build` en `ci.yml:199`. Un gate que
   comprueba que cada destino de `exports` existe como artefacto de build
   fallaría (o pasaría vacuo) porque `dist/` todavía no existe. Su lugar es
   post-build, junto a `distfresh:check` (`:210`) y `packinv:check` (`:218`) —
   lo que a su vez tensiona §1.10. Hay que decidir la excepción explícitamente.

4. **Retirar `compilers/kernel/runtime/appearance/` depende de consolidar la
   preview.** El plan lista la retirada en el bloque
   «foundation/infrastructure» (F0/F5) y la consolidación de
   `branding-preview-sandbox → tenant-preview` en «Converge» (F5), sin decir
   cuál va primero. Como el sandbox es consumidor del compilador (y el
   compilador de composición también lo es), el orden real es: mover
   `withExpressiveFieldDefaults`/`compileAppearanceVariables` al lowering único
   → consolidar la preview → recién entonces retirar la carpeta.

5. **La premisa de F1 ya no aplica en una de sus tres tareas.** Ver 4.2.

### 4.2 Estado de las tareas por frente

**F0 — Piso honesto.** Todo lo que el plan declara ya hecho, lo está:

```
ci-gates.manifest.mjs:151  → '--check-artifact' presente
gat-07-exact-proof.mjs:1369 → process.argv.includes('--check-artifact')   (el flag se parsea)
ci.yml:155-159 (checkout docs-engineering)  <  ci.yml:176 (gates:ci)      ✓ orden correcto
package.json:664 → node --test "scripts/**/*.test.mjs"                    ✓ recursivo
```

El glob recursivo alcanza **98** archivos de test frente a **86** del glob
plano; los 12 anidados incluyen los **7 drills de modern-rescue** y
`quality-evidence/v2/drills.test.mjs`. **CONFIRMADO.**

Gates huérfanos restantes: censo propio sobre los 43 `*-gate.mjs` (excluyendo
`.test.mjs`) contra manifiesto y `package.json` → exactamente **2**
(`channel-wiring-zero-delta-gate.mjs`, `cra-17-integral-gate.mjs`;
`ci-gates.manifest.mjs` sale del glob por su propio nombre). **CONFIRMADO.**

Citas de `platform.css`: `grep -rl 'styles/platform\.css'
packages/core/scripts/quality-evidence` → **0 archivos**. Las 802 se drenaron.
**CONFIRMADO.** Quedan 9 ocurrencias en `packages/` fuera del programa, de las
cuales una es fuente (`src/foundation/tokens/residual-adjudication.json:52`) y
una prueba que `dist/` está stale (ver 6.2).

`./styles/rottay` y `./styles/default` → `dist/rottay.css`, que no existe:
**CONFIRMADO en disco**, pero ver 6.2 para la atribución correcta.

**F1 — Vocabulario cerrado.**

- Dos enums vacíos: `chrome.anatomy` y `profiles.expressive` son los **únicos
  dos** controles con `domain.kind === 'enum'` y `enumValues: []`.
  **CONFIRMADO exacto.**
- «Adjudicación de exposición por raíz … falta la adjudicación»: **REFUTADO.**
  `manifest/cascade/root-catalog.json` ya trae `exposure` en las **63/63**
  raíces, y su bloque `reconciliation.byExposure` cuenta 26 `tenant-dial` /
  27 `internal-head` / 10 `gap` (1302 / 1477 / 496 canales). Recalculado sobre
  el array: idénticos. Lo que falta no es la adjudicación, es **gobernarla**
  (ningún gate la lee).
- Migración `targetBinding → internalChannels`: **CONFIRMADO exacto.** 255
  familias × 20 controles = **5100 celdas**; con `internalChannels` no vacío:
  **1462** (28,7 % ≈ el 29 % heredado); restantes **3638**, la cifra exacta del
  plan. Añadido no registrado por el plan: **`targetBinding` no lo lee ningún
  script** (`grep -rln targetBinding packages/core/scripts --include='*.mjs'`
  → vacío), mientras `internalChannels` lo leen `program-check.mjs`,
  `manifest/generator.mjs` y `manifest/rules.mjs`. Las 3638 celdas no están
  sólo sin migrar: están **sin gobernar**.

**F2 — La cascada existe en fuente.**

- «Materializar las 63 raíces»: **PARCIAL.** `channelStatus` reparte 46
  `existe` / 12 `por-crear` / 5 `solo-artefacto`. Sólo **12** hay que crear
  (`state.delta.{hover,active,disabled,pressed,selected,checked,expanded}`,
  `tier.accent.{bg,border}`, `control.ratio.{padding,gap}`, `alpha.ladder`).
- `daisy.classConsumers: 0` en `engine-token-audit.baseline.json`.
  **CONFIRMADO.**
- «`fanout-facts` y `mirror-parity` … sus tests ya son alcanzados por el glob
  recursivo»: **CONFIRMADO** (ambos drills están entre los 12 anidados). Y
  **ninguno de los dos generadores está en el manifiesto** (`grep -n
  'fanout-facts\|mirror-parity\|root-checklist' ci-gates.manifest.mjs` → 0). El
  hueco es real. Cuidado al enchufarlos: `mirror-parity.mjs` **escribe** cuando
  se invoca sin `--check`, y `--check` sólo comprueba frescura del JSON, nunca
  paridad.
- Línea base: ver 6.1 — la baseline propuesta subestima la deuda.

**F3 — La pintura vive en las skins.** Ver 6.3.

**F4 — Los tres temas son espejos.** El 19,3 % heredado se **re-mide y se
confirma con dos métodos independientes** (ver §6, tabla).

**F7 — Higiene.** `test-artifacts`: raíz 7.577 archivos / **203 trackeados**;
core 589 / **589 trackeados** (el «100 % versionado» es exacto). No hay
solapamiento de contenido: la raíz aporta `r1p-round3-evidence` (178 archivos),
core aporta 4 cohortes fechadas. Scripts que resuelven contra la raíz: **7**
(`cra-17-integral-gate`, `cra-11-adaptive-contract-census`,
`gat-09-full-claim-integrity`, `generate-surface-capability-census`,
`cra-15-runtime-hardening-gate`, `engine-token-audit`, `gat-07-exact-proof`);
el plan dice 8 — diferencia de uno, probablemente
`platform-identity-zero-gate.mjs`, que usa `UI_ROOT` sólo para filtrar rutas, no
para escribir. `test-artifacts/craft/cra-16/certification.json` está trackeado y
**ningún script menciona `cra-16`**: huérfano de productor, **CONFIRMADO**.
README.md: `:110` sigue diciendo `brand-themes/{platform,bithire,evnto}` (en
disco: `rottay`, `bithire`, `evnto`) y `:144,:170,:171` siguen diciendo **263
roles** (reales: 282). **CONFIRMADO exacto.**

**F8 — Las apps entran al sistema.** 241 archivos con import directo de
proveedor de iconos (`lucide-react` / `@ant-design/icons` /
`@phosphor-icons/react`): app-bithire **0**, app-evnto **11**, app-platform
**230**. El plan dice 242 (heredado): **CONFIRMADO** con la cifra exacta de hoy.
53 archivos vía `/commercial`: **CONFIRMADO exacto**.

---

## 5. El árbol objetivo de ARCHITECTURE.md §2 (prioridad 4 del Anexo)

### 5.1 Verificación estructural

Extraje todas las rutas declaradas en los bloques de árbol de §2.3, §2.4, §2.5,
§2.7 y §2.8 y las contrasté con el disco (69 + 81 + 13 + 7 + 7 = 177 rutas).
**Ninguna es falsa**: las únicas «ausencias» son
`presets/density/` y `presets/typography-pairings/` —que §3 declara
explícitamente como movimientos pendientes—, más tres falsos positivos de mi
parser sobre prosa (`SSR lang/dir`, `slot/axis manifest`,
`data-theme/color-scheme`). En sentido inverso, sobre `foundation`,
`infrastructure`, `graphics`, `tooling`, `entrypoints`, las 4 tiers de `ui` y
sus grupos, **sólo 4 carpetas del disco no aparecen en el documento**.

Mención especial porque invita a un error: hay **dos**
`continuous-runtime-governor`.

```
infrastructure/runtime/graphics/continuous-runtime-governor              6 dirs / 0 files
infrastructure/runtime/foundation/graphics/continuous-runtime-governor   5 files
```

§2.4 lista el **segundo** como owner vivo con propósito; §3 retira el
**primero** como cascarón vacío. Los dos documentos son correctos y no se
contradicen. **CONFIRMADO.**

### 5.2 Owners con propósito faltante o contradictorio

| Hallazgo | Veredicto |
|---|---|
| **`ui/patterns/customization/token-inspector` no aparece ni una vez en ARCHITECTURE.md** (`grep -c` → 0), pero el §4 del plan lo protege explícitamente y tiene 5 consumidores en el DS + 5 en el showroom. Como §2 declara «Anything on disk that has no place in this tree is debt scheduled for removal», el árbol objetivo lo programa para borrado y el plan lo protege: **contradicción directa entre los dos documentos** | REFUTADO (ARCHITECTURE) |
| **`ui/patterns/customization/branding-preview-sandbox` tampoco aparece** (`grep -c` → 0), pese a ser el owner que §3 «converge» en `tenant-preview` y el único consumidor de UI del compilador `appearance` que §3 retira. El owner protagonista de dos ítems del delta no está nombrado en ninguno de los dos documentos | REFUTADO (ambos) |
| **`ui/patterns/tooling/storybook/`** existe (2 archivos `.stories.tsx`) y no está en §2.6. §1.3 enumera los owners de soporte admitidos por tier —`foundation/`, `runtime/`, `facade/`, `tests/`— y `tooling/` no está en esa lista, aunque el `CLAUDE.md` del repo sí lo admite explícitamente para `patterns/`. Owner real sin lugar en la ley | PARCIAL |
| **`foundation/tokens/__tests__/`** (33 archivos) es el **único** `__tests__` de todo `src` (`find … -name '__tests__' \| wc -l` → 1) y viola §1.2 («Tests live in the owning unit's `tests/` branch»). No lo nombra §2 ni lo lista §3 | REFUTADO (falta en el delta) |
| **§2.6 dice que `Calendar` es «(-> composed by calendar-view)» y `Timeline` «(-> composed by timeline)»**. Ninguna de las dos relaciones existe (ver divergencia 5). §1.3 enuncia además «A pattern that shares a name with a primitive must compose it» como ley vigente: se cumple en 1 de 3 pares. §1.11 —que según el propio documento es donde va «target law not yet materialized»— no la incluye, y componer no es «a pure reorganization» | REFUTADO |
| **§2.6 dice que `structures/dashboard/insights` «owns the dashboard contracts (StatDef-aligned)»**, pero `command-center/index.tsx:26` importa `Activity` de `patterns/communication/activity-log/contracts` y `StatDef` de `foundation/contracts/runtime/components/patterns/core` (`:24`). `insights/foundation/contracts/index.ts:21` define su **propio** `ActivityItem`. Hay tres candidatos a dueño de la gramática de actividad y §2.6 nombra al que no la tiene | PARCIAL |
| **§1.5: «The three baselines are mirror themes: identical channel surface, identical names, different values»**. Medido: intersección 369 de 1908 = **19,3 %**. §1.11 sí lo declara pendiente, así que el documento es honesto — pero §1.5 lo enuncia en presente de indicativo | PARCIAL (honesto vía §1.11) |
| **§1.6: «Component-local private variables use the `--_ds-*` prefix inside a skin»**. De 388 declaraciones en `src/**/*.css`, **27 están fuera de cualquier carpeta `skin/`** (`presentation/components/{meter,icon-frame,arc,button}.css`) | PARCIAL |
| **§2.2 lista `styles/` como «index, rottay, bithire, evnto, modern»** y omite `platform.css`, que existe. Consistente con §3 (identidad extirpada), pero el lector de §2 no sabe que hay un sexto archivo de 5,3 MB | Consistente |
| **§2.6 «Link/ THE public Link … (published as Link; the NavLink alias retires)»** describe el destino, no el presente: hoy el símbolo publicado es `NavLink` (`ui/primitives/navigation/index.ts:71`) y `Link` es el de `Typography` (`ui/primitives/display/index.ts`). Correcto como destino; peligroso porque el intercambio de nombre es silencioso (ver divergencia 4) | Consistente, con riesgo no declarado |

### 5.3 Lo que el árbol objetivo acierta

- Las 177 rutas declaradas existen (salvo los dos movimientos declarados).
- La regla de altitud funciona: `commands/registry/` en el documento vs
  `commands/runtime/registry/` en disco es elisión legítima de una rama de
  gramática, no un error.
- Los grupos de tier cuadran exactamente: `ui/structures` tiene 7 hijos y §2.6
  nombra 7; `ui/primitives` 10 y los nombra todos; `ui/surfaces` 4.
- `graphics/`, `tooling/` y `entrypoints/` no tienen ni un owner sin nombrar.

---

## 6. Cifras re-medidas (§0 y §7 del plan)

| # | Afirmación | Veredicto | Medición propia |
|---|---|---|---|
| 1 | 123 archivos de skin modern | CONFIRMADO | `find …/engines/modern/skin -name '*.css' \| wc -l` → **123** |
| 2 | 3.306 refs únicas `var(--ds-*)`, 1.365 encadenadas, 908 peladas | CONFIRMADO / método frágil | Reproduje **exactamente** 1365 y 908 con grep por línea (y 3307 únicos, no 3306). Pero ver 6.1 |
| 3 | 41 de 136 engines modern con pintura inline | PARCIAL | 41 archivos **CONFIRMADO** (226 ocurrencias). El denominador mezcla unidades: hay **141** `.tsx` bajo `ui/**/engines/modern/`, de los cuales **135** son `index.tsx` (componentes); 136 es el número de **carpetas** `engines/modern` en `src`, e incluye la de CSS |
| 4 | 20 diales (STANDARD 13 / PRO 7 / EXPERT allowlist / INTERNAL 1) | PARCIAL | 20 controles: **13 `tier: standard` + 7 `tier: pro`**. EXPERT existe como capa (`customization-model.json.expert`: allowlist de **294**, máx. 200 overrides/documento) pero no como tier de control. **«INTERNAL 1» no existe**: ningún control tiene `tier: internal` |
| 5 | 63 raíces internas catalogadas, algunas `por-crear` | CONFIRMADO | `root-catalog.json.roots.length` → **63**; `channelStatus`: 46 `existe`, **12 `por-crear`**, 5 `solo-artefacto` |
| 6 | 3.693 canales, 88,7 % colapsable, 263 asignaciones | CONFIRMADO | Σ`collapses.total` = **3275**; 3275/3693 = **88,68 %**; Σ`assignments.total` = **263**; residuo 418 = 262 semillas + 156 por-familia |
| 7 | `targetControlModel` y 14 `targetRecipeGroups` PROPOSED_NOT_IMPLEMENTED | CONFIRMADO | `implementationState: "PROPOSED_NOT_IMPLEMENTED"`; `recipeGroupExpansion.targetSemanticGroups.length` → **14** |
| 8 | Dos enums vacíos | CONFIRMADO | Únicos con `kind: 'enum'` y `enumValues: []`: `chrome.anatomy`, `profiles.expressive`. Nota: sólo **8** de los 20 controles son `closed-enum` con valores; los otros 10 son `bounded`/`profile-id`/`color-set`/`token-map`/`font-stack`/`chrome-map`/`scale` — es decir, **no hay vocabulario de variantes nombradas para 10 controles**, no sólo para 2 |
| 9 | 19,3 % de intersección entre los tres temas | CONFIRMADO (dos métodos) | Grep propio sobre `facade/artifacts/*/index.css`: rottay **1237**, bithire **1282**, evnto **430**; unión **1908**, intersección **369** → **19,34 %**. Idéntico a `manifest/generated/mirror-parity.json` |
| 10 | «el artefacto de paridad pasa en verde midiendo otra cosa» | CONFIRMADO | `mirror-parity.mjs` con `--check` sólo compara el JSON generado contra el actual y falla por **desactualización**, nunca por paridad; sin `--check` **escribe** el archivo |
| 11 | `--ds_`: cero usos | CONFIRMADO | `grep -rn -e '--ds_'` en `packages/core` (sin `dist`/`node_modules`) → **0**; también 0 en los 6 `styles/*.css` |
| 12 | `--_ds-*`: 252 definiciones vivas | **REFUTADO** | **388** declaraciones en `src/**/*.css` sobre **184** nombres únicos (skin modern: 209 decls / 69 nombres; `presentation/components`: 179 / 120). Ninguna combinación de alcance razonable da 252. El hecho cualitativo (convención real no declarada) sí se sostiene |
| 13 | 23 carpetas vacías bajo `src`, 35 en el repo | CONFIRMADO | Exacto |
| 14 | md5 idéntico `platform.css` / `rottay.css` | CONFIRMADO | Ambos `f829248b628cd3bf29914a2efdf2d6d7` (5.342.714 B) |
| 15 | 282 roles de iconos | CONFIRMADO | `corpus/manifest.json.entries.length` → **282** |
| 16 | 18 familias de charts | CONFIRMADO | `ls charts/families \| grep -v index.ts \| wc -l` → **18** |
| 17 | 13 variantes de Button | PARCIAL | El skin pinta **13** valores de `[data-variant]`. El contrato declara **15** (`Variant` 7 + 8 propias). `error` y `gradient` no tienen `data-variant` propio: el TSX los normaliza (`engines/modern/index.tsx:328-344`) y `gradient` sale por `data-gradient='true'`. La cifra es de pintura, no de API |
| 18 | 100 WOs (74/25/1) | CONFIRMADO | `registry.json.workOrders.length` → **100**; `{done:74, todo:25, 'in-progress':1}`; lanes 25/23/21/12/11/8 |
| 19 | 438 PNG de referencia | CONFIRMADO con matiz | **438** en `e2e/visual/__screenshots__`, **462** trackeados bajo `e2e/` (los otros 24 son `whitelabel/`). Si el criterio de aceptación es «visual e2e verde», la red son 462 |
| 20 | 77 subpaths granulares (39/13/11/7/5/2) | CONFIRMADO | Exacto sobre las 121 claves de `exports` |
| 21 | 0 importadores de esos 77 en las tres apps | CONFIRMADO (exhaustivo) | Comprobados los 77, no por muestreo. 2 tienen importador en el showroom |
| 22 | 242 archivos de apps con iconos vendor | CONFIRMADO | **241** hoy (0 / 11 / 230) |
| 23 | 53 archivos vía alias `/commercial` | CONFIRMADO | Exacto |

### 6.1 La línea base de F2 subestima la deuda de cableado

El plan fija «Mi línea base medida hoy: 908 bare de 3.306 en la skin modern» y
el criterio «el conteo de canales sin fallback baja y nunca sube». Dos
problemas:

**(a) El método por líneas es ciego a `var()` multilínea.** Hay **502**
ocurrencias de `var(` seguido de salto de línea antes del nombre del canal en la
skin modern, invisibles a `grep -o 'var(--ds-…'`. Con un lector que las ve, los
nombres únicos referenciados son **3654**, no 3307.

**(b) Los dos porcentajes no particionan nada.** «41 % encadenados» y «27 %
pelados» se solapan en 90 nombres y dejan fuera el tercer cubo. Partición
disjunta real sobre los 3654 nombres:

```
sólo pelado (bare)                    705
sólo encadenado a var()              1443
sólo con fallback LITERAL            1253
mixto                                 253
──────────────────────────────────────────
nunca alcanzan una var() de raíz     1958
```

Bajo la ley de ARCHITECTURE §1.6 —`var(--ds-<componente>-<canal>,
var(--ds-<raíz>))`— un fallback literal **tampoco** llega a una raíz. La deuda
real de cableado son **1958 nombres**, no 908. Un ratchet anclado en 908 puede
llegar a cero con 1253 canales todavía clavados a un literal.

*Comandos: script propio sobre los 123 `.css` con regex tolerante a saltos de
línea, clasificando cada ocurrencia en bare / chained / literal-fallback y
agregando por nombre.*

### 6.2 `dist/rottay.css`: la atribución del defecto está invertida

El plan justifica el gate exports→artefacto con «Hoy `./styles/rottay` y
`./styles/default` apuntan a `dist/rottay.css` que no existe». El hecho es
cierto en disco, pero:

```
.gitignore:8            dist/
git ls-files packages/core/dist | wc -l    → 0
build-vertical-css.mjs:5   "dist/rottay.css = base tokens + modern engine + rottay baseline"
build-vertical-css.mjs:364 writeFileSync(resolve(dist, `${name}.css`), bundle)
package.json#files      incluye "dist/rottay.css"; NO incluye "dist/platform.css"
```

`dist/` es salida de build no versionada, y `pnpm build` **sí** produce
`dist/rottay.css`. Lo que hay en disco es un build anterior al renombre. Barrido
exhaustivo de los 325 destinos distintos de `exports`: el **único** ausente es
`./dist/rottay.css` (los otros 4 «ausentes» son patrones glob que sí resuelven:
`dist/graphics/icons/…/roles/` tiene 1128 entradas).

El defecto real es el simétrico y el plan no lo nombra: **artefactos que los
gates fail-closed todavía exigen y el build ya no emite.**

```
packages/core/scripts/pack-inventory.baseline.json:13770  "path": "dist/platform.css", size 2528869
scripts/dependency-honesty.mjs:3194                        exige el alias dist/platform.css
packages/core/PERFORMANCE_BUDGET.md:56                     presupuesto para dist/platform.css
packages/core/dist/tooling/quality/no-loss/index.d.ts:4    platform: "styles/platform.css"
   ↳ la FUENTE (src/tooling/quality/no-loss/index.ts:68-70) ya sólo declara bithire/rottay/evnto
```

Ese último par es prueba independiente de que `dist/` está stale. Y
`packinv:check` corre en CI (`ci.yml:218`): la extirpación de `platform` de F6
exige **re-anclar `pack-inventory.baseline.json`**, paso que el plan no lista
(sí lista `dependency-honesty` y el presupuesto de performance).

### 6.3 El censo de pintura inline mezcla dos clases

Los 41 archivos son correctos, pero no son 41 lecturas homogéneas migrables «al
patrón Button»: **Button es uno de los 41**. Sus 8 ocurrencias
(`engines/modern/index.tsx:272-305`) no son pintura en un `style`, son
**resolvers de eje** que construyen el *nombre* del canal a partir de la
variante de tamaño:

```
resolve: (v: ButtonSize) => `var(--ds-button-${v}-padding-y)`
resolve: (v: ButtonSize) => `calc(var(--ds-button-${v}-padding-x) * var(--ds-density-effective-scale))`
```

Eso no se puede mover a una skin sin cambiar el mecanismo del eje de tamaño.
Antes de convertir el censo en ratchet decrease-only hay que clasificar las 226
ocurrencias en (a) valores de pintura migrables y (b) selección dinámica de
canal por variante. Si no, el ratchet pedirá borrar lo que el «patrón de
referencia» hace a propósito.

Dato colateral: 2 de los 41 (`ConfirmDialog`, `HoverCard`) desaparecen con las
retiradas de la divergencia 4, así que el censo baja sin trabajo de skin.

---

## 7. Hallazgos que ningún documento registra

1. **Comentario stale y normativo en `ci-gates.manifest.mjs:42-53.`** Dice que
   los tests de `quality-evidence/v2/` y de `modern-rescue/` «NEITHER glob in
   `test:scripts` reaches» y que «48 assertions … were never executed by any
   command». Ya no es cierto: el glob recursivo los alcanza (verificado: 12
   archivos anidados, 7 de ellos de modern-rescue). ARCHITECTURE §1.10 exige
   corregir «the same day» un documento que describe algo que ya no existe; el
   comentario del manifiesto es normativo para quien lo lee y contradice el F0
   del plan.

2. **`Callout` y `Alert` ya están alineados por diseño, sin dependencia de
   código.** `ui/primitives/feedback/Alert/contracts/index.ts:100,109` documenta
   que su mapa `TONE_TO_VARIANT` produce «the same relationship Callout's
   `CalloutTone` already uses», pero **no lo importa**: son dos docstrings, no
   una arista. La absorción `Callout → Alert` es por tanto limpia dentro del DS,
   y la equivalencia de tonos ya está razonada por escrito en el destino. (Ese
   par de líneas fue el falso positivo que delató el defecto de mi propia regex
   de imports; queda aquí como control.)

3. **`Message` sólo sobrevive como referencia documental en `Toast`.**
   `ui/primitives/feedback/Toast/engines/modern/index.tsx:183,229` menciona
   `Message` en dos docstrings («Exit lifecycle (Message/Notification parity)»,
   «Message engine»), no en un import. El retiro `Message → Toast` es limpio en
   código; quedan dos comentarios que citarán un owner inexistente.

4. **`record-workbench` salta la fachada de iconos.**
   `index.tsx:32` importa
   `@/graphics/icons/presentation/semantic/generated/roles/content-document`
   directamente, en vez de usar el facade `Icon` que exige ARCHITECTURE §1.7.
   Deuda menor, pero está en un owner que se retira: al migrar el delta a
   `DetailSurface` no debe viajar con él.

5. **`PatternEmptyState` no delega en `Empty` hoy.** `Empty` tiene 18
   consumidores de producción y `patterns/feedback/empty-state` no está entre
   ellos. El ítem «Converge» del §2 es trabajo nuevo, correctamente identificado,
   pero conviene saber que hoy son dos anatomías independientes.

6. **`command-center` ya tiene los mappers.** `index.tsx:124`
   (`mapStatsToStatDefs`) y `:139` (`mapActivityItems`) ya convierten sus tipos
   locales a `StatDef` y `Activity`. La convergencia es borrar dos interfaces y
   dos funciones, no reescribir la superficie.

7. **`roadmap/` y el `CLAUDE.md` del monorepo discrepan del registry.** El
   `CLAUDE.md` de este repo describe «99 WOs … craft (22)»; el registry dice 100
   con craft 23. Fuera del alcance de los dos documentos auditados, pero es la
   misma clase de deriva que F7 quiere cerrar.

---

## 8. Recuento

**Divergencias del §3:** 2 CONFIRMADAS íntegras (6, 7); 2 CONFIRMADAS con coste
mal presupuestado (4, 5); 1 CONFIRMADA en el hecho y mal encuadrada en el tiempo
(3); **2 REFUTADAS en su fundamento**: la 1 (rompe la ley de tiers que la
justifica) y la 2 (su medición cuenta un componente ajeno al DS; el marcador
real es 3-3, no 45-3).

**Lista maestra del §2:** 21 ítems verificados como retiro limpio; **8 con
consumidor omitido**, de los cuales 3 bloquean (`tokens/ts/foundation/base`,
`compilers/kernel/runtime/appearance`, `contracts/kernel/tokens/extensions`) y
uno rompe una app directamente (`FloatButton.BackTop` en el layout del
dashboard de app-bithire); 1 refutado por conteo (10 → 17 alias); 1 omisión
transversal (el showroom no aparece en ningún lote de `ui/`).

**Orden de frentes:** 2 inversiones bloqueantes (F5 y F6 antes que F8), 1 gate
en el frente equivocado del pipeline (F0), 1 orden interno sin declarar
(appearance vs preview), 1 tarea de F1 ya hecha.

**ARCHITECTURE §2:** 177 rutas declaradas, ninguna falsa. 2 owners vivos que el
árbol no nombra y uno de ellos el plan protege explícitamente
(`token-inspector`), 1 owner que el árbol no admite (`patterns/tooling`), 1
violación de §1.2 no listada en el delta (`foundation/tokens/__tests__`), 2
relaciones `->` enunciadas como vigentes que no existen (`Calendar`,
`Timeline`), 1 propiedad de contrato atribuida al owner equivocado (gramática
de actividad).

**Cifras:** 23 verificadas; 15 exactas, 6 parciales por unidad o denominador, 2
refutadas (`--_ds-*: 252`; `10 alias`).

**Lo que el plan acierta y conviene no perder de vista:** la tesis de fondo
—que el modelo skin-first ya es el correcto y el trabajo restante es mecánico—
se sostiene en todas las mediciones. Los tres tipos de trabajo que enuncia son
los tres tipos de trabajo que el árbol muestra. Los errores encontrados son de
presupuesto, de orden y de denominador, no de diagnóstico.
