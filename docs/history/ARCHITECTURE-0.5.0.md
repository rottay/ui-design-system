# Rottay Design System - Architecture & Pending Work

> **Version:** 0.5.0 historical migration ledger
> **Physical paths reviewed:** 2026-07-16

> [!WARNING]
> Archived evidence only. For the current ownership tree, use
> [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md). Paths, counts and pending-work
> claims below intentionally preserve their historical context.

This document preserves the original migration ledger and its dated measurements. Current source
ownership follows `foundation/`, `infrastructure/`, `graphics/`, `ui/`, and `tooling/`; do not read
the historical counts below as a live inventory.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Current State](#2-current-state)
3. [Pending Tasks](#3-pending-tasks)
4. [Technical Standards](#4-technical-standards)
5. [Agent Instructions](#5-agent-instructions)

---

## 1. System Architecture

### 1.1 Component Structure

```
/packages/core/src/ui/primitives/
├── display/
├── inputs/
├── feedback/
├── layout/
├── navigation/
└── overlay/
```

### 1.2 Component Folder Structure - CRÍTICO

Cada componente tiene la siguiente estructura. **NO hay carpeta `base/`** - fue eliminada por ser código muerto.

```
ComponentName/
├── index.ts           → Factory + exports (createEngineComponent)
├── types/
│   └── index.ts       → Props compartidos por todos los engines
├── compound/          → Layout wrappers (1 sola versión, compartida)
│   ├── index.ts       → Exports de subcomponentes
│   └── Group/         → Ej: Button.Group, Avatar.Group
│       └── index.tsx  → Usa CSS variables var(--ds-*)
└── engines/           → 3 implementaciones DIFERENTES
    ├── index.ts       → Barrel export
    ├── classic/       → Wrapper de Ant Design
    │   └── index.tsx  → Usa componentes antd
    ├── modern/        → Wrapper de DaisyUI/Tailwind
    │   └── index.tsx  → Usa clases .btn, .card, etc.
    └── rustic/        → CSS puro inline
        └── index.tsx  → Usa styles con var(--ds-*)
```

> **Note**: a fourth engine `custom` is reserved for white-label tenants that ship a pluggable component pack. It is not in the main engines folder; it is registered at runtime via the engine factory.

**Flujo de renderizado:**

```
Usuario: <Avatar size="lg" />
            ↓
index.ts: createEngineComponent('Avatar', { classic, modern, rustic })
            ↓
factory: useEngineContext() → ¿Qué engine está activo?
            ↓
      ┌─────┴─────┬───────────┐
      ↓           ↓           ↓
   classic/    modern/     rustic/
   index.tsx   index.tsx   index.tsx
      ↓           ↓           ↓
   <AntAvatar>  <div class=  <div style=
                "avatar">    "var(--ds-*)">
```

**¿Por qué NO hay `base/`?**

| Antes (incorrecto) | Ahora (correcto) |
|--------------------|------------------|
| `base/` = implementación CSS con var() | Rustic = fallback vanilla |
| Rustic duplicaba base con hardcoded | Rustic usa var(--ds-*) |
| Código muerto, nunca usado | Sin duplicación |

**compound/ vs engines/:**

| Carpeta | Cambia entre engines? | Propósito |
|---------|----------------------|-----------|
| `compound/` | ❌ NO | Layout wrappers (Group, Item) |
| `engines/` | ✅ SÍ | Implementación por librería |

### 1.3 Engine System

| Engine | Library | Files |
|--------|---------|-------|
| **classic** | Ant Design 5.21 | Physical engine implementation |
| **modern** | Rottay-native React/CSS layer | Physical engine implementation |
| **rustic** | Vanilla CSS | Physical engine implementation |
| **custom** | Pluggable per-tenant pack | Reserved for white-label tenants; registered at runtime via the engine factory |

### 1.3.1 Vertical Presets

Verticals represent industry-specific configuration bundles. Each Rottay application maps to a vertical that provides a complete set of defaults: engine, personality, density, and surface preferences.

| Vertical | App | Engine | Density | Personality |
|----------|-----|--------|---------|-------------|
| **evnto** | app-evnto | modern | spacious | Playful, bounce entrance, spring physics |
| **bithire** | app-bithire | classic | compact | Formal, fade entrance, data-dense |
| **platform** | app-platform | classic | comfortable | Neutral, balanced animations |

**Resolution chain (highest to lowest priority):**

```
DesignSystemProvider props (forceEngine, productProfile)
  > Tenant config (personality, tokenOverrides)
    > Vertical preset (personality, engine, defaultProductProfile)
      > Product profile (personality, tokenOverrides)
        > Engine defaults
          > DEFAULT_PERSONALITY
```

**Runtime visual authority:** `DesignSystemProvider` also exposes an independent,
mutually exclusive ownership contract. `visualAuthority="provider"` is the
backward-compatible default and lets `ThemeProvider` load/emit tenant visuals.
`visualAuthority="compiled-artifact"` means the application has already mounted
the exact server-compiled tenant artifact. In that mode the complete normalized
`TenantConfig` still reaches tenant, locale, theme, motion, feature, token-read,
and component contexts, but the runtime does not load tenant CSS or emit
branding variables, token overrides, appearance variables, personality bridge
variables, or generated chrome CSS. This prevents inline specificity from silently overriding the canonical
artifact; precedence is ownership-based instead of cascade-order-dependent.

**Usage:**

```tsx
<DesignSystemProvider vertical="evnto" tenantSlug="acme">
  <App />
</DesignSystemProvider>
```

When a vertical is provided:
- Its `engine` is used as the default (unless `forceEngine` overrides it)
- Its `defaultProductProfile` is used when no explicit `productProfile` prop is given
- Its `personality` is merged into the personality chain between DEFAULT and product profile

Files:
- `packages/core/src/foundation/contracts/kernel/verticals/index.ts` -- `VerticalKey`
- `packages/core/src/foundation/contracts/composition/tenants/index.ts` -- `VerticalPreset`
- `packages/core/src/infrastructure/runtime/verticals/foundation/registry/index.ts` -- `VERTICAL_REGISTRY`, `getVerticalPreset()`
- `packages/core/src/infrastructure/runtime/verticals/index.ts` -- public internal barrel

### 1.4 Token System (CSS Cascade) - IMPORTANTE

**Concepto clave:** Los valores hardcodeados van en `default.css` y `tenants/`. Los engines SOLO usan `var(--ds-*)`.

```
┌─────────────────────────────────────────────────────────────────────┐
│  CAPA 1: default.css (:root)                                        │
│  ─────────────────────────────────────────────────────────────────  │
│  VALORES HARDCODEADOS - El "tema base" universal del design system  │
│                                                                     │
│  :root {                                                            │
│    --ds-button-primary-bg: #0066CC;        ← Valor real             │
│    --ds-button-primary-bg-hover: #0052A3;  ← Valor real             │
│    --ds-button-md-radius: 8px;             ← Valor real             │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ CSS Cascade (herencia)

┌─────────────────────────────────────────────────────────────────────┐
│  CAPA 2: tenants/rottay/index.css                                   │
│  ─────────────────────────────────────────────────────────────────  │
│  OVERRIDES HARDCODEADOS - Solo lo que Rottay quiere DIFERENTE       │
│                                                                     │
│  [data-tenant="rottay"] {                                           │
│    --ds-button-primary-bg: #0a66c2;  ← Rottay usa otro azul         │
│    --ds-button-md-radius: 9999px;    ← Rottay quiere pills          │
│    /* Lo que NO está aquí, hereda de default.css */                 │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ CSS Cascade (mayor especificidad)

┌─────────────────────────────────────────────────────────────────────┐
│  CAPA 3: engines/classic/theme.css                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  MAPEO DINÁMICO - Conecta variables con clases de cada librería     │
│  ⚠️ NUNCA valores hardcodeados, SOLO var(--ds-*)                    │
│                                                                     │
│  html[data-tenant] .ant-btn-primary {                               │
│    background: var(--ds-button-primary-bg);   ← Variable dinámica   │
│    border-radius: var(--ds-button-md-radius); ← Variable dinámica   │
│  }                                                                  │
│                                                                     │
│  /* El valor final depende del tenant activo:                       │
│     - Sin tenant: usa default.css (#0066CC, 8px)                    │
│     - data-tenant="rottay": usa rottay (#0a66c2, 9999px)            │
│     - data-tenant="bithire": usa bithire (sus valores)              │
│  */                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

**Ejemplo multi-tenant:**

```css
/* default.css - Base universal */
:root {
  --ds-button-primary-bg: #0066CC;
  --ds-button-md-radius: 8px;
}

/* tenants/rottay/index.css - Brand Rottay */
[data-tenant="rottay"] {
  --ds-button-primary-bg: #0a66c2;
  --ds-button-md-radius: 9999px;  /* Pills */
}

/* tenants/bithire/index.css - Brand Bithire */
[data-tenant="bithire"] {
  --ds-button-primary-bg: #FF6B00;  /* Naranja */
  --ds-button-md-radius: 4px;       /* Más cuadrado */
}

/* engines/classic/theme.css - NO CAMBIA por tenant */
html[data-tenant] .ant-btn-primary {
  background: var(--ds-button-primary-bg);  /* Resuelve según tenant */
  border-radius: var(--ds-button-md-radius);
}
```

| Archivo | Contiene | Propósito |
|---------|----------|-----------|
| `default.css` | Valores hardcodeados | Theme base universal |
| `tenants/{name}/index.css` | Valores hardcodeados (overrides) | Personalización por marca |
| `engines/{name}/theme.css` | Solo `var(--ds-*)` | Mapeo a clases de librería |

### 1.5 Tenant Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DETECTION STRATEGIES                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Server Headers    → X-Tenant-ID header (SSR)             │
│ 2. Subdomain         → acme.app.rottay.com → "acme"         │
│ 3. Custom Domain API → client.com → API lookup → "acme"     │
│ 4. Fallback          → "default"                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CONFIG RESOLUTION                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Memory Cache      → Fastest                              │
│ 2. LocalStorage      → 1 hour TTL                           │
│ 3. Static Files      → /.designsystem/tenants/{slug}/       │
│ 4. Remote API        → GET {apiEndpoint}/{slug}             │
│ 5. Default Config    → Fallback                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.6 Key Files

| File | Purpose |
|------|---------|
| `packages/core/src/foundation/tokens/css/foundation/themes/default.css` | Central tokens |
| `packages/core/src/foundation/tokens/css/runtime/engines/classic/theme.css` | Ant Design CSS mapping |
| `packages/core/src/foundation/tokens/css/runtime/engines/modern/theme.css` | Modern engine mapping |
| `packages/core/src/foundation/tokens/css/runtime/engines/rustic/theme.css` | Vanilla CSS classes |
| `packages/core/src/foundation/tokens/css/facade/artifacts/rottay/index.css` | Tenant artifact |
| `packages/core/src/infrastructure/runtime/bootstrap/composition/react/provider/index.tsx` | `DesignSystemProvider` implementation |
| `packages/core/src/infrastructure/runtime/tenant/composition/react/provider/index.tsx` | `TenantProvider` implementation |
| `packages/core/src/infrastructure/runtime/tenant/runtime/resolution/index.ts` | Tenant detection facade |

---

## 2. Current State

### 2.1 What's Working

| Area | Status | Notes |
|------|--------|-------|
| CSS Token System | ✅ | default.css + engine themes complete |
| Component Wrappers | ✅ | 76 components × 3 engines |
| JSDoc Documentation | ✅ | 390 files documented |
| Build & Tests | ✅ | 24KB bundle, 2,217 tests passing |
| Tenant CSS Cascade | ✅ | [data-tenant] selector works |

### 2.2 What's NOT Working

| Area | Status | Problem |
|------|--------|---------|
| **Engine Hardcoding** | ❌ | Engines usan valores hardcodeados (#fff, #0066cc) en vez de var(--ds-*) |
| Classic Engine Depth | ⚠️ | 70-80% are shallow wrappers, not real customizations |
| Ant Design 5.x API | ❌ | NOT using ConfigProvider/Design Token API |
| TypeScript Quality | ⚠️ | 18 components use `as any` |
| Tenant Auto-Detection | ❌ | TODO in DesignSystemProvider not implemented |
| data-tenant Auto-Set | ❌ | Must be set manually on HTML element |
| Backend API Docs | ❌ | No documentation for expected API contract |

### 2.3 Cleanup Done

| Date | Change | Impact |
|------|--------|--------|
| 2025-12-28 | Eliminadas 60 carpetas `base/` | -60 files, Rustic es el fallback vanilla |
| 2025-12-28 | Removidos exports de Base* en index.ts | 39 files limpiados |
| 2025-12-28 | Rustic engines migrados a CSS vars (display/) | 10 components: Calendar, Carousel, Descriptions, Empty, Image, List, QRCode, Statistic, Timeline, Tree |
| 2025-12-28 | Rustic engines migrados a CSS vars (feedback/) | 11 components: Alert, Drawer, Message, Modal, Notification, Progress, Rate, Result, Skeleton, Spinner, Toast |
| 2025-12-28 | Rustic engines migrados a CSS vars (navigation/) | 12 components: Menu, Tabs, Breadcrumb, Pagination, Steps, Affix, Anchor, BackTop, FloatButton, Link, Segmented, Stepper |
| 2025-12-28 | DISPLAY completo: Classic + Modern CSS | 17 components migrados con tokens + CSS variables para multi-tenant |
| 2025-12-28 | NAVIGATION completo: Classic + Modern CSS | 12 components migrados + Stepper tokens agregados |
| 2025-12-28 | OVERLAY completo: Classic + Modern CSS | 5 components migrados (Dropdown, Popconfirm, Popover, Tour, Watermark) |
| 2025-12-28 | FEEDBACK completo: Tokens + Classic CSS + Modern CSS | 11 components: +78 tokens nuevos (Drawer, Message, Notification, Toast), todos los engines usan --ds-* vars |

---

## 3. Pending Tasks

---

## 4. Component Migration Tracking

> **Objetivo:** Migrar cada componente a customización máxima para Ant Design y Tailwind/DaisyUI, con soporte multi-tenant.

### 4.1 Proceso de Migración por Componente

Para cada componente, seguir estos pasos EN ORDEN:

```
┌────────────────────────────────────────────────────────────────────────┐
│ PASO 1: INVESTIGAR                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ • Ant Design: https://ant.design/components/{component}                │
│   → Ir a pestaña "Design Token" → Ver TODOS los tokens customizables   │
│                                                                        │
│ • DaisyUI: https://daisyui.com/components/{component}                  │
│   → Ver clases CSS y variables disponibles                             │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ PASO 2: ACTUALIZAR default.css                                         │
├────────────────────────────────────────────────────────────────────────┤
│ Por cada propiedad customizable de la librería:                        │
│ • Agregar --ds-{component}-{property}: {valor};                        │
│ • Incluir TODOS los estados: hover, focus, active, disabled            │
│ • Incluir TODAS las variantes: primary, secondary, success, etc.       │
│ • Incluir TODOS los tamaños: xs, sm, md, lg, xl                        │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ PASO 3: ACTUALIZAR classic/theme.css                                   │
├────────────────────────────────────────────────────────────────────────┤
│ • Mapear CADA token a su clase .ant-{component}                        │
│ • Usar SOLO var(--ds-*), NUNCA valores hardcodeados                    │
│ • Cubrir TODOS los estados con selectores CSS                          │
│ • Selector: html[data-tenant] .ant-{component}                         │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ PASO 4: ACTUALIZAR modern/theme.css                                    │
├────────────────────────────────────────────────────────────────────────┤
│ • Mapear CADA token a su clase DaisyUI/Tailwind                        │
│ • Usar SOLO var(--ds-*), NUNCA valores hardcodeados                    │
│ • Mantener paridad visual con classic                                  │
│ • Selector: [data-tenant] .btn, .card, etc.                            │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ PASO 5: VERIFICAR MULTI-TENANT                                         │
├────────────────────────────────────────────────────────────────────────┤
│ • Probar con data-tenant="rottay" → ¿Aplica los overrides?             │
│ • Probar sin tenant → ¿Usa default.css?                                │
│ • Verificar que NO hay valores hardcodeados en engines                 │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ PASO 6: ACTUALIZAR TRACKING                                            │
├────────────────────────────────────────────────────────────────────────┤
│ • Marcar componente como ✅ en la tabla de abajo                        │
│ • Agregar fecha y notas                                                │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Migration Status

**Leyenda:**
- ⬜ PENDING - No iniciado
- 🔄 IN PROGRESS - En proceso (indicar quién)
- ✅ COMPLETE - Migración completa y verificada

**Resumen:** 76/76 completados (100%) - INPUTS 20/20 ✅ + DISPLAY 17/17 ✅ + FEEDBACK 11/11 ✅ + NAVIGATION 12/12 ✅ + LAYOUT 10/10 ✅ + OVERLAY 6/6 ✅

---

#### INPUTS (20) - Prioridad ALTA ✅ COMPLETADO

| # | Componente | Tokens | Classic CSS | Modern CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Button | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +20 tokens, fixed primitives, added active states |
| 2 | Input | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +12 tokens (filled, addon, clear), Rustic uses var(--ds-input-*) |
| 3 | Select | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +20 tokens (status, tag, dropdown), Rustic uses var(--ds-select-*) |
| 4 | Checkbox | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +15 tokens (sizes, error, label), Rustic uses var(--ds-checkbox-*) |
| 5 | Radio | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +20 tokens (sizes, button style), Rustic uses var(--ds-radio-*) |
| 6 | Switch | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +15 tokens, Rustic uses var(--ds-switch-*) |
| 7 | Slider | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +15 tokens, Rustic uses var(--ds-slider-*) |
| 8 | DatePicker | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +15 tokens, Rustic uses var(--ds-datepicker-*) |
| 9 | TimePicker | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +35 tokens, Classic/Modern time panel styles |
| 10 | Form | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +7 tokens (item, label, error), Rustic inline styles |
| 11 | InputNumber | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +20 tokens (controls, addon, affix) |
| 12 | Textarea | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +20 tokens (sizes, filled, count) |
| 13 | Upload | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +15 tokens, Rustic uses var(--ds-upload-*) |
| 14 | AutoComplete | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +8 tokens (dropdown, options) |
| 15 | Cascader | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +8 tokens (menu, item states) |
| 16 | ColorPicker | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +30 tokens (swatch, palette, slider, presets) |
| 17 | Mentions | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +7 tokens (dropdown, option, highlight) |
| 18 | Transfer | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +10 tokens (list, header, item) |
| 19 | TreeSelect | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +25 tokens (trigger, dropdown, nodes) |
| 20 | Toggle | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +25 tokens, Classic Switch mapping

#### DISPLAY (17) - Prioridad MEDIA ✅ COMPLETADO

| # | Componente | Tokens | Classic CSS | Modern CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Card | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | Engines use var(--ds-card-*) |
| 2 | Table | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | Engines use var(--ds-table-*) |
| 3 | Avatar | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +20 tokens, engines use var(--ds-*) |
| 4 | Badge | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +9 tokens, engines use var(--ds-badge-*) |
| 5 | Tag | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +15 tokens, rustic uses var(--ds-tag-*) |
| 6 | Tooltip | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +17 tokens, engines rewritten (no base) |
| 7 | Typography | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | SIZE_MAP uses CSS vars, rustic rewritten |
| 8 | Calendar | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +22 tokens, all engines use --ds-calendar-* |
| 9 | Carousel | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +12 tokens, all engines use --ds-carousel-* |
| 10 | Descriptions | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-descriptions-* |
| 11 | Empty | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-empty-* |
| 12 | Image | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +12 tokens, all engines use --ds-image-* |
| 13 | List | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-list-* |
| 14 | QRCode | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-qrcode-* |
| 15 | Statistic | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-statistic-* |
| 16 | Timeline | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-timeline-* |
| 17 | Tree | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +14 tokens, all engines use --ds-tree-* |

#### FEEDBACK (11) - Prioridad MEDIA ✅ COMPLETADO

| # | Componente | Tokens | Classic CSS | Modern CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Modal | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-modal-* vars |
| 2 | Alert | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-alert-* vars with type colors |
| 3 | Message | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +20 tokens, all engines use --ds-message-* vars |
| 4 | Notification | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +15 tokens, all engines use --ds-notification-* vars |
| 5 | Progress | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-progress-* vars |
| 6 | Skeleton | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-skeleton-* vars |
| 7 | Spinner | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-spinner-* vars |
| 8 | Result | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-result-* with status colors |
| 9 | Rate | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-rate-* vars |
| 10 | Drawer | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +18 tokens, all engines use --ds-drawer-* vars |
| 11 | Toast | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +25 tokens, all engines use --ds-toast-* vars |

#### NAVIGATION (12) - Prioridad MEDIA ✅ COMPLETADO

| # | Componente | Tokens | Classic CSS | Modern CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Menu | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-menu-* vars |
| 2 | Tabs | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-tabs-* vars |
| 3 | Breadcrumb | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-breadcrumb-* vars |
| 4 | Pagination | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-pagination-* vars |
| 5 | Steps | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-steps-* vars |
| 6 | Affix | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-affix-* vars |
| 7 | Anchor | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-anchor-* vars |
| 8 | BackTop | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-back-top-* vars |
| 9 | FloatButton | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-float-button-* vars |
| 10 | Link | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-link-* vars |
| 11 | Segmented | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-segmented-* vars |
| 12 | Stepper | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +17 tokens, all engines use --ds-stepper-* vars |

#### LAYOUT (10) - Prioridad BAJA ✅ COMPLETADO

| # | Componente | Tokens | Classic CSS | Modern CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Box | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | Utility component, uses inline styles |
| 2 | Collapse | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +5 tokens, all engines use --ds-collapse-* vars |
| 3 | Container | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +7 tokens, all engines use --ds-container-* vars |
| 4 | Divider | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +4 tokens, all engines use --ds-divider-* vars |
| 5 | Flex | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | Utility component, uses inline styles |
| 6 | Grid | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | Utility component, uses inline styles |
| 7 | Layout | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +15 tokens, all engines use --ds-layout-* vars |
| 8 | Space | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-space-* vars |
| 9 | Splitter | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +5 tokens, all engines use --ds-splitter-* vars |
| 10 | Stack | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | Utility component, uses inline styles |

#### OVERLAY (6) - Prioridad BAJA ✅ COMPLETADO

| # | Componente | Tokens | Classic CSS | Modern CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Dropdown | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-dropdown-* vars |
| 2 | Popconfirm | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-popconfirm-* vars |
| 3 | Popover | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-popover-* vars |
| 4 | Tour | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-tour-* vars |
| 5 | Watermark | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | All engines use --ds-watermark-* vars |

---

## 5. Other Pending Tasks

### 5.1 Tenant Auto-Detection (HIGH)

**Problem:** Hay un TODO en DesignSystemProvider que no está implementado.

**Archivo histórico, reubicado en:**
`packages/core/src/infrastructure/runtime/bootstrap/composition/react/provider/index.tsx`

**Código actual:**
```tsx
// TODO: Implement actual tenant resolution
const config = DEFAULT_TENANT_CONFIG;  // ← Siempre usa default!
```

**Implementación requerida:**
```tsx
useEffect(() => {
  async function detectTenant() {
    const slug = await resolveTenant();
    const config = await getTenantConfig(slug);
    document.documentElement.setAttribute('data-tenant', slug);
    setTenantConfig(config);
  }
  if (!propTenantConfig) detectTenant();
}, []);
```

### 5.2 Backend API Documentation (HIGH)

Crear `/docs/BACKEND_API.md` documentando:
- `GET /api/domains/lookup?domain={hostname}` → `{ slug, found }`
- `GET /api/tenants/{slug}` → `TenantConfig`

### 5.3 CI/CD (MEDIUM)

- Visual regression testing (Chromatic/Percy)
- CSS purging para producción
- Bundle size monitoring

---

## 6. Technical Standards

### 6.1 Code Quality

- **TypeScript:** Strict mode, NO `any`
- **Components:** `forwardRef`, `displayName`, `'use client'`
- **Props:** Consistent pattern (`size`, `variant`, `disabled`, `className`)

### 6.2 CSS Standards

- **Variables:** `--ds-` prefix required
- **Naming:** `--ds-{category}-{element}-{variant}-{state}-{property}`
- **Units:** `rem` for sizing, `px` for borders
- **Colors:** Variables only, no hardcoded hex en engines

---

## 7. Agent Instructions

### Para continuar trabajo:

```
1. Leer este documento completo
2. Verificar git status
3. Correr npm run build
4. Elegir componente de Section 4.2 (empezar por INPUTS)
5. Seguir proceso de Section 4.1
6. Actualizar tracking cuando complete
```

### Prioridad de Trabajo

```
1. CRITICAL: Migración de componentes (Section 4)
   - Empezar por Button como piloto
   - Seguir con resto de INPUTS
   - Luego DISPLAY, FEEDBACK, etc.

2. HIGH: Tenant auto-detection (Section 5.1)

3. MEDIUM: CI/CD y calidad (Section 5.3)
```

### Reference Links

**Ant Design 5.x:**
- Design Tokens: https://ant.design/docs/react/customize-theme
- Component Tokens: https://ant.design/components/{component}#design-token

**Tailwind/DaisyUI:**
- DaisyUI Components: https://daisyui.com/components
- DaisyUI Themes: https://daisyui.com/docs/themes

---

*Document Version: 0.7.0*
*Last Updated: 2025-12-28*
