# Design System - Documentación para Claude AI

## 📋 Información General del Proyecto

**Nombre:** Design System Multi-Tema
**Versión Actual:** 0.1.4
**Estado:** ✅ **Phase 4 COMPLETADA** - Sistema de temas funcional con 8 temas + Componentes Composite Theme-Aware
**Tipo:** Librería React reutilizable basada en Ant Design
**Objetivo:** Sistema de diseño modular con múltiples temas predefinidos para proyectos Next.js

---

## 🎯 Visión General

### Concepto Principal
El proyecto es un **design system como librería NPM** que proporciona componentes UI reutilizables con sistema de temas intercambiables. Está construido como un wrapper sobre Ant Design que permite aplicar diferentes estilos visuales completos (8 temas predefinidos) manteniendo la misma API.

### ✅ Lo que ESTÁ COMPLETO

1. ✅ **Componentes Primitivos (63):** Wrappers básicos de Ant Design
2. ✅ **Componentes Composite (8):** AuthLayout, DashboardCard, DashboardLayout, DataTable, EmptyState, FormBuilder, PageHeader, SearchableSelect - TODOS con estilos theme-aware
3. ✅ **8 Temas Funcionales:** Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel, Base
4. ✅ **Dashboard/Showcase:** App funcional con demos de todos los componentes
5. ✅ **Storybook:** 8 stories completas para componentes composite
6. ✅ **Persistencia:** localStorage para guardar tema seleccionado
7. ✅ **Librería Compilable:** Build funcionando (ESM + CJS + TypeScript definitions)

---

## 🔧 Stack Tecnológico

### Core
- **Framework:** React 18.2.0
- **UI Base:** Ant Design 5.21.0
- **Lenguaje:** TypeScript 5.3.0
- **Build Tool:** Vite 5.0.0
- **Package Manager:** npm (workspaces)

### Herramientas de Desarrollo
- **Bundler:** Vite (library mode)
- **Type Generation:** vite-plugin-dts 3.7.0
- **Documentation:** Storybook 9.1.10
- **Dashboard:** Vite + React Router DOM 7.9.3

---

## 🎨 Sistema de Componentes Composite

### 8 Componentes Theme-Aware (100% Completos)

#### 1. **AuthLayout**
- Layout para páginas de autenticación
- Backgrounds theme-specific: Spotify (#121212), Stripe (#FAFAFA), Notion (#FFFFFF), Linear (#F9FAFB)
- BorderRadius adaptativo: Spotify (8px), Stripe (6px), Notion (3px), Linear (12px)
- **File:** `packages/core/src/composite/AuthLayout/`

#### 2. **DashboardCard**
- Cards para dashboards con estadísticas y trends
- Icon sizes por tema: Spotify (64px), Stripe (56px), Notion (48px)
- Font sizes adaptativos: Spotify (32px bold), Stripe (28px), Notion (26px)
- **File:** `packages/core/src/composite/DashboardCard/`

#### 3. **DashboardLayout**
- Layout completo para dashboards con sidebar y header
- Header heights: Spotify (72px), Stripe (64px), Notion (60px)
- Sidebar widths: Spotify/Linear (240px), Stripe (220px), Notion (200px)
- **File:** `packages/core/src/composite/DashboardLayout/`

#### 4. **DataTable**
- Tabla con búsqueda, selección y acciones
- Selection badge con estilos por tema
- **File:** `packages/core/src/composite/DataTable/`

#### 5. **EmptyState**
- Estados vacíos con 6 variantes (no-data, no-results, error, 404, offline, maintenance)
- Icon sizes adaptativos por tema
- **File:** `packages/core/src/composite/EmptyState/`

#### 6. **FormBuilder**
- Constructor de formularios dinámicos desde JSON
- Container styles por tema
- Label typography adaptativa
- **File:** `packages/core/src/composite/FormBuilder/`

#### 7. **PageHeader**
- Headers de página con breadcrumbs, acciones y tabs
- Title sizes: Spotify (32px), Stripe (28px), Notion (26px), Linear (30px)
- Avatar sizes adaptativos
- **File:** `packages/core/src/composite/PageHeader/`

#### 8. **SearchableSelect**
- Select con búsqueda y debouncing
- BorderRadius por tema
- **File:** `packages/core/src/composite/SearchableSelect/`

---

## 🎭 Sistema de Temas - COMPLETAMENTE IMPLEMENTADO

### ✅ 8 Temas Funcionales

| Tema | Color Primary | Background | BorderRadius | Estado |
|------|--------------|------------|--------------|---------|
| **Spotify** | #1DB954 (Verde) | #121212 (Dark) | 8px | ✅ Completo |
| **Stripe** | #635BFF (Violeta) | #FAFAFA (Light) | 6px | ✅ Completo |
| **Airbnb** | #FF5A5F (Coral) | #FFFFFF (White) | 8px | ✅ Completo |
| **Slack** | #611F69 (Púrpura) | #FFFFFF (White) | 4px | ✅ Completo |
| **Notion** | #000000 (Negro) | #FFFFFF (White) | 3px | ✅ Completo |
| **Linear** | #5E6AD2 (Azul) | #F9FAFB (Gray) | 12px | ✅ Completo |
| **Vercel** | #000000 (Negro) | #FAFAFA (Light) | 8px | ✅ Completo |
| **Base** | #1890ff (Azul) | #FFFFFF (White) | 6px | ✅ Completo |

### ThemeProvider - Funcional ✅

```tsx
// packages/core/src/providers/ThemeProvider.tsx
import React, { createContext, useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { templates } from '../themes';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTemplate = 'base',
}) => {
  // Inicializa desde localStorage con fallback
  const [template, setTemplate] = useState<TemplateName>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('designsystem-theme');
      if (saved && templates[saved]) return saved as TemplateName;
    }
    return defaultTemplate;
  });

  // Guarda en localStorage automáticamente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('designsystem-theme', template);
    }
  }, [template]);

  return (
    <ThemeContext.Provider value={{ template, setTemplate }}>
      <ConfigProvider theme={templates[template]}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
```

### useTheme Hook - Funcional ✅

```tsx
// packages/core/src/hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeProvider';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context; // { template, setTemplate }
};
```

---

## 🚀 Comandos Disponibles

### Desarrollo
```bash
# Dashboard de demostración (Puerto 3000-3004)
npm run dev

# Storybook (Puerto 6006)
npm run storybook --workspace=@es-rottay/designsystem-core
```

### Build
```bash
# Build de la librería core
npm run build

# Output: dist/index.js (175KB ESM), dist/index.cjs (120KB CJS)
```

---

## 📊 Estado de Implementación

### ✅ Phase 1 - COMPLETADO
- [x] Monorepo configurado (npm workspaces)
- [x] 63 Componentes primitivos (Display, Feedback, Inputs, Layout, Navigation)
- [x] Build system (ESM + CJS + TypeScript)
- [x] Dashboard básico
- [x] Storybook configurado

### ✅ Phase 2 - COMPLETADO
- [x] Sistema de temas con 8 temas funcionales
- [x] ThemeProvider con Context API
- [x] Persistencia en localStorage
- [x] useTheme hook
- [x] ThemeSwitcher UI

### ✅ Phase 3 - COMPLETADO
- [x] 8 Componentes composite implementados
- [x] TODOS con estilos theme-aware (backgrounds, borders, shadows, padding, typography)
- [x] 8 Stories completas en Storybook

### ✅ Phase 4 - COMPLETADO
- [x] Dashboard actualizado con componentes composite
- [x] Página "AllComposites" mostrando todos los componentes
- [x] 3 páginas demo (AuthLayout, DataTable, EmptyState)
- [x] Overview con DashboardCards y PageHeader
- [x] ThemeSwitcher integrado en sidebar

### 🎯 Phase 5 - PENDIENTE (Opcional)
- [ ] Actualizar README.md
- [ ] Tests unitarios con Vitest
- [ ] Publicación a npm
- [ ] CI/CD con GitHub Actions

---

## 🔌 Uso de la Librería

### Instalación (local, aún no publicada)
```bash
# En tu proyecto Next.js
npm install file:../path/to/designsystem/packages/core
```

### Setup en Next.js (App Router)
```tsx
// app/providers.tsx
'use client';
import { ThemeProvider } from '@es-rottay/designsystem-core';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTemplate="spotify">
      {children}
    </ThemeProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Usar Componentes
```tsx
import {
  DashboardCard,
  PageHeader,
  useTheme
} from '@es-rottay/designsystem-core';
import { Users } from 'lucide-react';

export default function Dashboard() {
  const { template, setTemplate } = useTheme();

  return (
    <div>
      <PageHeader title="Mi Dashboard" />

      <DashboardCard
        title="Usuarios Activos"
        value="2,350"
        trend={{ direction: 'up', value: 8.2 }}
        icon={<Users size={24} />}
        color="success"
      />

      <button onClick={() => setTemplate('spotify')}>
        Cambiar a Spotify
      </button>
    </div>
  );
}
```

---

## 📦 Exports Actuales

```typescript
// packages/core/src/index.ts
export * from './components';  // 63 componentes primitivos
export * from './composite';   // 8 componentes composite
export * from './providers';   // ThemeProvider
export * from './hooks';       // useTheme
export * from './themes';      // templates, type definitions
```

### Componentes Composite Exportados
```typescript
export {
  AuthLayout,
  DashboardCard,
  DashboardLayout,
  DataTable,
  EmptyState,
  FormBuilder,
  PageHeader,
  SearchableSelect,
}

export type {
  AuthLayoutProps,
  DashboardCardProps,
  DashboardLayoutProps,
  DataTableProps,
  EmptyStateProps,
  FormBuilderProps,
  PageHeaderProps,
  SearchableSelectProps,
}
```

---

## 📚 Dashboard/Showcase

### Páginas Implementadas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | Overview | DashboardCards + PageHeader + instrucciones |
| `/composite/all` | AllComposites | TODOS los componentes composite en una página |
| `/composite/auth-layout` | AuthLayoutDemo | 3 variantes de AuthLayout |
| `/composite/data-table` | DataTableDemo | DataTable con búsqueda y selección |
| `/composite/empty-state` | EmptyStateDemo | 6 variantes de EmptyState |
| `/icons` | IconsPage | Galería de iconos |
| `/:category/:component` | ComponentDemo | Demos dinámicos de primitivos |

### ThemeSwitcher
- Ubicación: Sidebar superior
- 8 temas disponibles
- Persistencia automática en localStorage

---

## 🏗️ Build Output

```bash
npm run build --workspace=@es-rottay/designsystem-core

# Output:
# ✓ dist/index.js     175.83 kB │ gzip: 39.47 kB
# ✓ dist/index.cjs    120.87 kB │ gzip: 33.16 kB
# ✓ dist/index.d.ts   TypeScript definitions
```

---

## 💡 Diferencias Visuales por Tema

### Spotify (Dark, Bold)
- Background: `#121212` (negro oscuro)
- BorderRadius: `8px`
- Shadows: Intensas `0 4px 12px rgba(0,0,0,0.4)`
- Typography: `32px`, `fontWeight 700`
- Icons: `64px` (grandes)

### Stripe (Professional, Light)
- Background: `#FAFAFA` (gris claro)
- BorderRadius: `6px`
- Shadows: Sutiles `0 2px 8px rgba(0,0,0,0.08)`
- Typography: `28px`, `fontWeight 600`
- Icons: `56px` (medianos)

### Notion (Minimal, Square)
- Background: `#FFFFFF` (blanco)
- BorderRadius: `3px` (muy cuadrado)
- Shadows: Signature `rgba(15,15,15,0.05) 0px 0px 0px 1px`
- Typography: `26px`, `fontWeight 700`
- Icons: `48px` (pequeños)

### Linear (Modern, Rounded)
- Background: `#F9FAFB` (gris moderno)
- BorderRadius: `12px` (muy redondeado)
- Shadows: Mínimas `0 1px 2px rgba(0,0,0,0.05)`
- Typography: `30px`, `fontWeight 600`
- Icons: `64px` (grandes)

---

## 🎯 Resumen Ejecutivo

**Estado Actual: FASE 4 COMPLETADA ✅**

✅ **Sistema de temas funcional** - 8 temas completos con persistencia
✅ **Componentes composite theme-aware** - 8/8 con estilos específicos por tema
✅ **Dashboard showcase completo** - Múltiples páginas demo funcionales
✅ **Build funcionando** - ESM + CJS + TypeScript definitions
✅ **Storybook completo** - 8 stories para componentes composite

**Listo para:**
- ✅ Uso en proyectos Next.js (local install)
- ✅ Demos y presentaciones
- ✅ Documentación visual (Storybook)

**Siguiente paso opcional:**
- Publicar a npm
- Tests unitarios
- CI/CD

---

## 📖 Referencias

- [Ant Design 5 Docs](https://ant.design/components/overview)
- [Ant Design Theme Editor](https://ant.design/theme-editor)
- [Storybook](https://storybook.js.org)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)

---

*Última actualización: 2025-10-11*
*Versión: 4.0*
*Estado: Phase 4 COMPLETADA - Sistema completamente funcional*
