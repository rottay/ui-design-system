# Contrato de consumo para las apps (base productiva)

Propósito: que las apps se construyan **desde hoy** contra un contrato que no cambia mientras el DS se termina por detrás. Todo lo que no está en este contrato puede desaparecer (D-07) sin aviso a las apps. Cuando se aplique el borrador, este documento vive en `packages/core/docs/consumer-contract/index.md` y la regla de lint de WO-CON-01 lo hace ejecutable.

## 1. Superficie de importación sancionada (HECHO: censo 2026-09-05 sobre app-bithire, app-evnto, app-platform y showroom)

Subpaths que las apps importan hoy y que el contrato garantiza (los nombres exportados pueden crecer; no se retiran sin changeset 3.0 y codemod):

| Subpath | Uso medido (bithire / evnto / platform) | Estado en el contrato |
| --- | --- | --- |
| `@rottay/design-system` | 1.155 / 383 / 444 imports | garantizado (componentes de los cuatro tiers, hooks públicos, `DesignSystemProvider`) |
| `@rottay/design-system/icons` (+ `icons/roles/*`) | 860 / 99 / 171 | garantizado (facade semántica; nunca proveedores) |
| `@rottay/design-system/marks` | 10 / 0 / 0 | garantizado (`BrandMark`, `CloudServiceMark`) |
| `@rottay/design-system/charts` (+ `/renderers`, `/spec`, `/access`) | 15 / 0 / 0 | garantizado; la implementación cambia en WO-FAM-09 sin cambiar la API pública de los 18 charts |
| `@rottay/design-system/motion` | 3 / 0 / 0 | garantizado (vocabulario `--ds-motion-*` y primitivas) |
| `@rottay/design-system/server` | 5 / 4 / 6 | garantizado **solo** para los nombres de §2; el resto de sus exports actuales se recorta en WO-CAT-03 |
| `@rottay/design-system/styles.css`, `fonts/*.css`, `eslint` | por layout/config | garantizado (un solo entrypoint CSS desde WO-CAN-03) |

Subpaths que las apps **no deben importar** (internos, producto-específicos o destinados a retiro):

| Subpath | Motivo | Quién lo retira |
| --- | --- | --- |
| `./contracts/*`, `./runtime/*` (i18n, motion, navigation, forms, cross-tab-sync, provider, root-attributes, responsive, tenant, visual-authority, tenant-theme) | internos; el montaje pasa por `mountTenantTheme` | WO-RET-01 (F-42, F-94) |
| `./primitives/*`, `./patterns/*`, `./structures/*`, `./surfaces/*` (69 subpaths por componente) | 0 consumidores; el root los exporta | WO-RET-01 |
| `./icons/presets/bithire`, `./icons/bithire` (10 imports en bithire) | semántica de producto en el corpus compartido (F-113); pasa a preset del vertical | WO-RET-01; bithire migra por codemod |
| `./tenant-theme-canary-fixtures` (1 import en bithire, 2 en showroom) | fixture de test publicado (F-42) | WO-RET-01 |
| `./commercial` / `commercial.css` (53 imports en app-platform) | el paquete **no exporta** ese subpath en `package.json` (NO VERIFICADO cómo resuelve hoy); programa comercial pausado (D-13) | sin acción del DS (owner 2026-09-05: app-platform y lo comercial fuera de alcance); app-platform lo resuelve de su lado cuando entre en alcance |
| `./effects`, `./spatial`, `./spatial/spec` | sin consumidor productivo (D-19: adoptar con consumidor real o retirar) | WO-RET-01 |
| `./styles/{default,bithire,evnto,rottay,modern}`, `./dist/*.css` | un solo entrypoint CSS | WO-CAN-03 |
| `./public-entrypoints-manifest`, `./supplier-contract`, `./supplier-honesty-cli`, `./hooks-manifest` | herramientas internas | WO-RET-01 |

## 2. API de tema contra la que programar desde hoy

Servidor (layout raíz de cada app):

```ts
import { mountTenantTheme, staticThemeIntent, documentThemeIntent } from "@rottay/design-system/server";
// vertical fijo (identidad estática, D-28): sin patch
const mounted = await mountTenantTheme(staticThemeIntent({ vertical: "bithire" }));
// tenant con documento en DB (v2, §3)
const mounted = await mountTenantTheme(documentThemeIntent({ vertical: "bithire", slug, document }));
// mounted = { rootAttributes, styleElements, artifactDigest, hydrationProof }
```

Cliente: `DesignSystemProvider` con `visualAuthority="compiled-artifact"` y nada más (sin `brandTheme`, `tokenOverrides`, `personality`, `appearance`, `engine`). Preview en app-platform: componente `TenantPreview` del DS (WO-EMI-01) alimentado con `previewThemeIntent`; nunca `compileTenantTheme` ni reescritura textual de CSS en la app.

Nombres que las apps usan hoy y que quedan **prohibidos** en código nuevo: `compileTenantTheme`, `compileTheme`, `resolveTheme`, `liftAuthoredTheme`, `THEME_ENGINE_ADAPTERS`, `BrandTheme`, `TenantAppearance*`, `tokenOverrides`, `getTenantBranding()` con campos visuales fuera de `companyName/logo/logoMark/favicon/locale`. Hasta que WO-CON-02 entregue `mountTenantTheme`, cada app mantiene sus tres archivos actuales (`runtime-tenant-theme/{ssr,contracts,artifact-resolution}`) sin ampliarlos; el codemod de WO-CON-02 los reemplaza por la llamada única.

## 3. Documento de tenant v2 (lo que escribe app-platform)

```ts
type TenantThemeDocument = {
  version: 2;
  plan: "standard" | "pro" | "internal";
  decisions: Partial<ThemeDecisions>;      // solo ids del catálogo aprobado (kit D-27), dominios cerrados
  overrides?: SanctionedOverrides;         // D-03: canales sancionados, nunca `--ds-*` crudos
};
```

`ThemeDecisions` es el kit de 29 decisiones (`audit/50-matrices/customization-inventory` §5), pendiente de D-27. Los documentos v1 existentes migran con `migrate v1→v2` (total, fail-closed). Un documento v2 puede activar decisiones que **todavía no se propagan** (§4): la puerta lo acepta, lo registra y el indicador lo muestra; cuando el corte de familia llega, la decisión se enciende sin tocar la app ni el documento.

## 4. Qué puede cambiar un tenant HOY con efecto real (HECHO: `audit/50-matrices/cascade` §1)

| Efecto hoy | Decisiones |
| --- | --- |
| Pleno y coherente en static y DB | `palette.seeds` (salvo rampa `accent` y el bloque base vacío de rottay en DB, F-05), `palette.status-seeds`, `typography.pairing`, `typography.families`, `navigation.sidebar-tone`, `experience.profile`, `profiles.expressive` |
| Parcial | `typography.scale` (1 canal), `density.mode` (escala efectiva; 9/123 skins), `motion.dial` (11/25 familias), `surfaces.elevation-posture` (17/25), `surfaces.effect-intensity` (8/25), `shape.button-style` (solo DB) |
| Sin efecto útil | `shape.radius-scale` (se auto-cancela, F-07), `spacing.rhythm` (2/25), `recipe-profile` (sin lector), `chrome.anatomy` (4/123), `profiles.icon`, `responsive.posture`, `palette.dark-mode` por tenant (F-05) |
| No existen aún | las 10 decisiones nuevas del kit (`neutral-temperature`, `contrast-posture`, `role-weights`, `numeric`, `nesting`, `control-height`, `border-style`, `states.emphasis`, `states.focus-style`, `motion.character`) |

Indicador "decisiones encendidas" (STATUS, WO-CON-03): hoy **7 plenas / 22** y 0 / 10 nuevas; objetivo 29 / 29 con sonda por eje. Dos tenants se ven distintos hoy por color, tipografía y perfil expresivo; forma, ritmo, estados y modo llegan con los cortes (olas 3–4).

## 5. Regla evolutiva

1. Las apps programan contra §1–§3 y no se vuelven a tocar por trabajo interno del DS; solo el changeset 3.0 (WO-RET-01) puede exigir un codemod, y únicamente sobre lo listado como prohibido.
2. Cada corte de familia enciende decisiones y sube el indicador; ninguna WO de las olas 3–5 cambia una firma de §2 ni el esquema de §3.
3. Las fachadas de WO-CON-02 y WO-CON-03 son **excepciones fechadas** a la regla de unicidad (dos caminos durante la transición): las borran WO-EMI-02 (montaje real, misma firma) y WO-DER-06/WO-CAT-02 (derivación real, mismo documento). Una excepción sin WO que la borre no se acepta.
4. Cambios en las apps: las notas X-01…X-06 de `audit/70-plan/risks` son la lista; se ejecutan en el hito A con los codemods del DS, no antes.

## 6. Tres niveles de personalización (dónde vive cada cosa que pidió el owner)

| Nivel | Quién decide | Ejemplos | Mecanismo del DS | WO |
| --- | --- | --- | --- | --- |
| 1 · Decisiones del tenant | el tenant (por plan Standard/Pro) en el documento v2 | paleta, tipografía, radio, densidad, ritmo, elevación, motion, estados, modo, perfil expresivo | catálogo tipado → derivación → canales; sonda por eje | WO-CAT-*, WO-DER-*, WO-FAM-* |
| 2 · Configuración de superficie y de componente (`adapt`) | la app (BitHire), por pantalla y por componente | qué regiones existen, **posturas phone/tablet/desktop** (móvil simplificado: regiones ocultas, barra inferior, densidad), vista por defecto; y por componente el slot `adapt`: **qué columnas quedan en una tabla en phone, cuáles se achican, si pasa a cards**, tamaño de cards de una colección, qué muestra un widget según su propio tamaño (`compact/regular/expanded`) | contrato de posturas + `SurfaceRegion` + slot `adapt` tipado por familia (mismos nombres de postura en todas) + kit de layout adaptativo (auto-fit) + kernel de animación de layout | WO-INV-04, WO-INV-06, WO-INV-07, WO-INV-08, WO-FAM-12, WO-FAM-13 |
| 3 · Props de instancia | el componente en la página | `<Card scale="lg">`, `<Grid autoFit minItem="…">`, variantes | props tipadas mapeadas a canales, nunca a valores | cortes de familia |

Ejemplo del nivel 2 en una tabla (lo declara BitHire, lo resuelve el DS en el servidor):

```tsx
<PatternDataTable
  columns={columns}
  adapt={{
    phone: { columns: { keep: ["name", "status", "owner"], shrink: ["status"] }, presentation: "cards", rowActions: "swipe" },
    tablet: { columns: { keep: ["name", "status", "owner", "updatedAt"] } },
  }}
/>
```

Regla: el DS estipula el lugar y el tipo (`adapt` con posturas iguales en todas las familias); la app decide el contenido; nada de esto espera a que el DS "resuelva" cada pantalla. Los widgets con resize se autoajustan por postura de contenedor, con reflow animado por el kernel de layout (WO-INV-08) y presupuesto de perfección medido en trazas (0 tareas largas durante un resize).

Precedencia: el nivel 1 mueve los canales que los niveles 2 y 3 consumen; una prop de instancia nunca contradice una decisión del tenant (lo verifica el gate de WO-CAN-04). "Cards más grandes con el espacio vacío autoajustado" es nivel 2/3 sobre canales derivados del nivel 1 (`--ds-card-min-inline-size`, `--ds-card-scale`, `--ds-grid-gap`); "que el móvil se vea distinto y muchísimo más simplificado" es nivel 2 (posturas por superficie) resuelto en el servidor para que el primer pintado ya sea el móvil; "responsive" es el contrato único de breakpoints y posturas (WO-DER-04 + WO-INV-04) que alimenta a los tres niveles.

Con el kit de 29 decisiones más los niveles 2 y 3, dos tenants de BitHire se distinguen en color, tipografía, forma, densidad, ritmo, elevación, motion, estados y modo, y cada pantalla de BitHire decide su forma por postura sin tocar el DS. Lo que **no** cubre y queda fuera a propósito: layouts arbitrarios por tenant (el tenant no reordena pantallas), CSS crudo por tenant (D-03) y semántica de producto en el DS.

## 7. Dos carriles autónomos a partir del hito A (owner, 2026-09-05)

"Hasta acá es todo lo que necesitás saber": cuando WO-CON-04 está en verde, §1–§5 es la totalidad de lo que un agente que construye una app necesita leer del DS.

| Carril | Quién | Qué hace | Qué no toca |
| --- | --- | --- | --- |
| APP | un agente (o varios) en `app-bithire` | rediseño total de las páginas en el área de previews de BitHire, contra este contrato (niveles 2 y 3 de §6); registra su trabajo en `app-bithire/roadmap/` | internos del DS; nunca crea un segundo DS en `_shared/`; no importa subpaths prohibidos; no escribe CSS de tenant |
| DS | un agente (o varios) en `ui-design-system` | olas 2–5 del roadmap detrás del contrato; publica versiones con changesets; sube el indicador de decisiones encendidas | repos de las apps; firmas y esquema de §2–§3 |

Alcance (owner, 2026-09-05): solo app-bithire importa ahora; app-platform, lo comercial y app-evnto quedan fuera y sus paquetes de migración se difieren. Mecanismos de desacople (WO-CON-05): versión fijada por la app y actualizada cuando ella decide; changeset obligatorio para cualquier cambio de superficie pública; una sola vía para pedir capacidades al DS (WO en el roadmap con el test promote-to-DS); sección "contract diff" en STATUS. Un cambio del DS que rompa el fixture de consumidor (WO-CON-04) no se mergea.
