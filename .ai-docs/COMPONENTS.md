# Design System Components

Ruta real del package:

`/Users/daniel/Developer/Rottay/ui-design-system/packages/core`

## Mapa de documentación

El set vivo de documentación del DS hoy está concentrado en estos `6` archivos:

- `COMPONENTS.md`
- `COMPONENT_INDEX.md`
- `ENGINES.md`
- `PATTERNS.md`
- `SURFACES.md`
- `THEMING.md`

Lectura recomendada:

- empezar por `COMPONENTS.md` para entender capas y contratos públicos
- ir a `THEMING.md` para tenanting, product profiles, personality y dark mode
- ir a `SURFACES.md` para el catálogo page-level y builders
- usar `COMPONENT_INDEX.md` como inventario rápido

## Arquitectura vigente

La arquitectura pública del DS es:

1. `tokens`
2. `primitives`
3. `patterns`
4. `surfaces`
5. `app-owned composition`

Reglas que sí siguen vigentes:

- `tokens` y `product profiles` son la fuente de verdad visual
- `tenantConfig` define branding, locale, engine, features y overrides serializables
- `primitives` no se reemplazan; son la base del sistema
- `patterns` encapsulan UI reusable de complejidad media
- `surfaces` resuelven mecánicas de página
- `legacy` queda fuera del core público

## Provider principal

El punto de entrada canónico es `DesignSystemProvider`.

Archivo:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/core/providers/root/index.tsx`

Capacidades principales:

- engine runtime (`classic`, `modern`, `rustic`, `athena`)
- tenant config + tenant overrides
- product profile
- i18n con `locale`, `fallbackLocale`, `customTranslations`
- theme/dark mode existentes
- personality bridge hacia CSS variables

## Contratos públicos importantes

- `TenantConfig`
  - `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/core/types/tenants/index.ts`
- `ProductProfile`
  - `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/core/types/product-profiles/index.ts`
- `EntityAdapter`
  - `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/types.ts`
- `Surface*Config`
  - `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/types.ts`

## Primitives

Las primitives siguen siendo el ladrillo base. Algunas categorías importantes:

Conteo actual del catálogo:

- `89` primitives top-level
- `29` patterns top-level
- `28` surfaces
- `10` charts
- `assistant` sub-patterns, `charts`, `hooks` y motion/effects documentados por separado

Convención de conteo:

- `patterns` cuenta solo el catálogo reusable top-level
- `assistant`, `charts` y `pattern hooks` se documentan aparte para evitar inflar el inventario
- `stories` y `tests` nunca se cuentan como catálogo público
- `surfaces` tiene tests y stories co-locados en cada surface (e.g., `surfaces/chat/ChatSurface.test.tsx`), con shared helpers en `surfaces/common/`

- layout: `Box`, `Flex`, `Grid`, `Stack`, `Divider`, `Container`
- typography: `Typography`, `Heading`, `Text`, `Paragraph`, `Link`
- display: `Card`, `Badge`, `Tag`, `Statistic`, `Avatar`, `Table`
- inputs: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Form`
- feedback: `Skeleton`, `Toast`, `Message`, `Notification`, `Modal`, `Drawer`
- overlay/navigation: `Popover`, `Dropdown`, `Tabs`, `Menu`, `Breadcrumb`

Ubicación:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/primitives`

## Patterns

Patterns públicos destacados:

- `PatternDataTable`
- `PatternKanbanBoard`
- `PatternFormBuilder`
- `PatternStatsGrid`
- `PatternDetailPanel`
- `PatternTimeline`
- `PatternFilterPanel`
- `PatternCommandPalette`
- `PatternCalendarView`
- `PatternMapView`
- `PatternApprovalWorkflow`
- `PatternStepWizard`
- `PatternLiveFeed`
- `PatternTreeView`
- charts D3 (`BarChart`, `LineChart`, `AreaChart`, `PieChart`, `RadarChart`, `FunnelChart`, `TreeMap`, `HeatMap`, `GanttChart`, `NetworkGraph`)
- assistant UI reusable:
  - `StreamingText`
  - `TypingIndicator`
  - `ToolCallCard`
  - `MessageBubble`
  - `AssistantStatusBadge`

Ubicación:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/patterns`

## Surfaces

El catálogo real de surfaces está documentado en:

- `/Users/daniel/Developer/Rottay/.ai-docs/design-system/SURFACES.md`

El barrel público vive en:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/index.ts`

Helpers DX agregados:

- `26` builders de surfaces tipados
- `createListSurfaceConfig`
- `createDashboardSurfaceConfig`
- `createChatSurfaceConfig`
- `createDetailSurfaceConfig`
- `createFormSurfaceConfig`
- `createWizardSurfaceConfig`
- `createHeaderSurfaceConfig`
- `createSidebarSurfaceConfig`
- `createDetailFormSurfaceConfig`
- `createVisualizationSurfaceConfig`
- `createSearchSurfaceConfig`
- `createEditorSurfaceConfig`
- `createOperationalSurfaceConfig`
- `createMediaSurfaceConfig`
- `createSchedulerSurfaceConfig`
- `createCompareSurfaceConfig`
- `createAuthSurfaceConfig`
- `createOnboardingSurfaceConfig`
- `createEmptyStateSurfaceConfig`
- `createSettingsSurfaceConfig`
- `createAuditSurfaceConfig`
- `createBillingSurfaceConfig`
- `createProfileSurfaceConfig`
- `createNotificationSurfaceConfig`
- `createImportExportSurfaceConfig`
- `createReportSurfaceConfig`

Archivo:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/builders.ts`

## Personalidad, tenanting y white-label

La personalización fuerte hoy se apoya en:

- `product profiles`
  - `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/product-profiles/index.ts`
- personality resolvers de primitives
  - `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/personality/primitives.ts`
- bridge CSS runtime
  - `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/core/providers/root/system-css-variables-bridge.tsx`
- generador CSS por tenant
  - `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/tenancy/storage/static/generator/index.ts`

El generador no reemplaza el runtime provider. Sirve para:

- precomputar CSS por tenant
- onboarding de tenants nuevos
- serializar branding + overrides + personality al mismo sistema de CSS vars del core

## i18n

Locales actuales:

- `en`
- `es`
- `pt`
- `fr`
- `ar`

Archivos:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/i18n`

El root provider ya integra:

- `locale`
- `fallbackLocale`
- `customTranslations`
- `document.lang`
- `dir` (`ltr` / `rtl`)

## Motion

Los motion defaults salen de:

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/motion/hooks/use-motion-personality/index.ts`

Primitives y effects relevantes:

- `FadeIn`
- `SlideIn`
- `ScaleIn`
- `ScrollReveal`
- `StaggerChildren`
- `TextReveal`
- `CountUp`
- `Morph`
- `Magnetic`
- `Aurora`
- `ShimmerText`

La intención actual es que `productProfile + tenant + prefers-reduced-motion` impacten:

- duration
- stagger
- entrance mode
- spring physics
- pulse/skeleton cadence
- count-up enablement

## Quality gates vigentes

El package del core ya se valida con gates reales antes de promover cambios:

- `pnpm typecheck`
- `pnpm exec vitest run`
- thresholds globales de coverage en `vitest.config.ts`
  - `statements >= 80`
  - `branches >= 80`
  - `functions >= 80`
  - `lines >= 80`

Regla de mantenimiento:

- no subir coverage escondiendo carpetas del runtime
- no usar smoke tests como sustituto de tests de comportamiento
- priorizar tests reales sobre engines, theming, dark mode, tenanting y personality

## Qué ya no pertenece al core

Legacy migrado fuera del core:

- `/Users/daniel/Developer/Rottay/ui-design-system/legacy-guides/custom-components`

Eso queda como guía de migración, no como parte del contrato público del DS.
