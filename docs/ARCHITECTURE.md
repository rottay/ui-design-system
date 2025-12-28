# Rottay Design System - Architecture & Pending Work

> **Version:** 0.5.0
> **Last Updated:** 2025-12-28

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
/packages/core/src/components/primitives/
├── display/     17 components
├── inputs/      20 components
├── feedback/    11 components
├── layout/      10 components
├── navigation/  12 components
└── overlay/      6 components
                 ──
                 76 total (228 engine implementations)
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
    ├── titan/         → Wrapper de Ant Design
    │   └── index.tsx  → Usa componentes antd
    ├── hermes/        → Wrapper de DaisyUI/Tailwind
    │   └── index.tsx  → Usa clases .btn, .card, etc.
    └── apollo/        → CSS puro inline
        └── index.tsx  → Usa styles con var(--ds-*)
```

**Flujo de renderizado:**

```
Usuario: <Avatar size="lg" />
            ↓
index.ts: createEngineComponent('Avatar', { titan, hermes, apollo })
            ↓
factory: useEngineContext() → ¿Qué engine está activo?
            ↓
      ┌─────┴─────┬───────────┐
      ↓           ↓           ↓
   titan/      hermes/     apollo/
   index.tsx   index.tsx   index.tsx
      ↓           ↓           ↓
   <AntAvatar>  <div class=  <div style=
                "avatar">    "var(--ds-*)">
```

**¿Por qué NO hay `base/`?**

| Antes (incorrecto) | Ahora (correcto) |
|--------------------|------------------|
| `base/` = implementación CSS con var() | Apollo = fallback vanilla |
| Apollo = duplicaba base con hardcoded | Apollo = usa var(--ds-*) |
| Código muerto, nunca usado | Sin duplicación |

**compound/ vs engines/:**

| Carpeta | Cambia entre engines? | Propósito |
|---------|----------------------|-----------|
| `compound/` | ❌ NO | Layout wrappers (Group, Item) |
| `engines/` | ✅ SÍ | Implementación por librería |

### 1.3 Engine System

| Engine | Library | Files |
|--------|---------|-------|
| **Titan** | Ant Design 5.21 | 76 components + theme.css (1,707 lines) |
| **Hermes** | Tailwind 4.x / DaisyUI | 76 components + theme.css (1,047 lines) |
| **Apollo** | Vanilla CSS | 76 components + theme.css (1,087 lines) |

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
│  CAPA 3: engines/titan/theme.css                                    │
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

/* engines/titan/theme.css - NO CAMBIA por tenant */
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

| File | Purpose | Lines |
|------|---------|-------|
| `tokens/css/themes/default.css` | Central tokens | 1,452 |
| `tokens/css/engines/titan/theme.css` | Ant Design CSS mapping | 1,707 |
| `tokens/css/engines/hermes/theme.css` | Tailwind CSS mapping | 1,047 |
| `tokens/css/engines/apollo/theme.css` | Vanilla CSS classes | 1,087 |
| `tokens/css/tenants/rottay/index.css` | Tenant overrides | 336 |
| `system/providers/root/index.tsx` | DesignSystemProvider | 192 |
| `system/providers/tenant/index.tsx` | TenantProvider | 90 |
| `config/tenants/resolver/index.ts` | Tenant detection | 56 |

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
| Titan Engine Depth | ⚠️ | 70-80% are shallow wrappers, not real customizations |
| Ant Design 5.x API | ❌ | NOT using ConfigProvider/Design Token API |
| TypeScript Quality | ⚠️ | 18 components use `as any` |
| Tenant Auto-Detection | ❌ | TODO in DesignSystemProvider not implemented |
| data-tenant Auto-Set | ❌ | Must be set manually on HTML element |
| Backend API Docs | ❌ | No documentation for expected API contract |

### 2.3 Cleanup Done

| Date | Change | Impact |
|------|--------|--------|
| 2025-12-28 | Eliminadas 60 carpetas `base/` | -60 files, Apollo es el fallback vanilla |
| 2025-12-28 | Removidos exports de Base* en index.ts | 39 files limpiados |

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
│ PASO 3: ACTUALIZAR titan/theme.css                                     │
├────────────────────────────────────────────────────────────────────────┤
│ • Mapear CADA token a su clase .ant-{component}                        │
│ • Usar SOLO var(--ds-*), NUNCA valores hardcodeados                    │
│ • Cubrir TODOS los estados con selectores CSS                          │
│ • Selector: html[data-tenant] .ant-{component}                         │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ PASO 4: ACTUALIZAR hermes/theme.css                                    │
├────────────────────────────────────────────────────────────────────────┤
│ • Mapear CADA token a su clase DaisyUI/Tailwind                        │
│ • Usar SOLO var(--ds-*), NUNCA valores hardcodeados                    │
│ • Mantener paridad visual con Titan                                    │
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

**Resumen:** 1/76 completados (1.3%)

---

#### INPUTS (20) - Prioridad ALTA

| # | Componente | Tokens | Titan CSS | Hermes CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Button | ✅ | ✅ | ✅ | ✅ | COMPLETE | 2025-12-28 | +20 tokens, fixed primitives, added active states |
| 2 | Input | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 3 | Select | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 4 | Checkbox | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 5 | Radio | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 6 | Switch | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 7 | Slider | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 8 | DatePicker | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 9 | TimePicker | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 10 | Form | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 11 | InputNumber | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 12 | Textarea | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 13 | Upload | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 14 | AutoComplete | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 15 | Cascader | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 16 | ColorPicker | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 17 | Mentions | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 18 | Transfer | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 19 | TreeSelect | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 20 | Toggle | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |

#### DISPLAY (17) - Prioridad MEDIA

| # | Componente | Tokens | Titan CSS | Hermes CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Card | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 2 | Table | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 3 | Avatar | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 4 | Badge | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 5 | Tag | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 6 | Tooltip | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 7 | Typography | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 8 | Calendar | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 9 | Carousel | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 10 | Descriptions | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 11 | Empty | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 12 | Image | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 13 | List | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 14 | QRCode | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 15 | Statistic | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 16 | Timeline | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 17 | Tree | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |

#### FEEDBACK (11) - Prioridad MEDIA

| # | Componente | Tokens | Titan CSS | Hermes CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Modal | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 2 | Alert | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 3 | Message | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 4 | Notification | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 5 | Progress | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 6 | Skeleton | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 7 | Spinner | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 8 | Result | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 9 | Rate | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 10 | Drawer | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 11 | Toast | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |

#### NAVIGATION (12) - Prioridad MEDIA

| # | Componente | Tokens | Titan CSS | Hermes CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Menu | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 2 | Tabs | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 3 | Breadcrumb | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 4 | Pagination | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 5 | Steps | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 6 | Affix | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 7 | Anchor | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 8 | BackTop | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 9 | FloatButton | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 10 | Link | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 11 | Segmented | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 12 | Stepper | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |

#### LAYOUT (10) - Prioridad BAJA

| # | Componente | Tokens | Titan CSS | Hermes CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Box | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 2 | Collapse | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 3 | Container | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 4 | Divider | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 5 | Flex | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 6 | Grid | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 7 | Layout | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 8 | Space | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 9 | Splitter | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 10 | Stack | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |

#### OVERLAY (6) - Prioridad BAJA

| # | Componente | Tokens | Titan CSS | Hermes CSS | Multi-tenant | Status | Fecha | Notas |
|---|------------|--------|-----------|------------|--------------|--------|-------|-------|
| 1 | Dropdown | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 2 | Popconfirm | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 3 | Popover | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 4 | Tour | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |
| 5 | Watermark | ⬜ | ⬜ | ⬜ | ⬜ | PENDING | - | - |

---

## 5. Other Pending Tasks

### 5.1 Tenant Auto-Detection (HIGH)

**Problem:** Hay un TODO en DesignSystemProvider que no está implementado.

**Archivo:** `/system/providers/root/index.tsx`

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

*Document Version: 0.6.0*
*Last Updated: 2025-12-28*
