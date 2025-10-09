# Design System - Documentación para Claude AI

## 📋 Información General del Proyecto

**Nombre:** Design System Multi-Tema
**Versión Actual:** 0.1.4
**Estado:** Step 1.5 Completado ✅ (Sistema de Temas Funcional)
**Tipo:** Librería React reutilizable basada en Ant Design
**Objetivo:** Sistema de diseño modular con múltiples temas predefinidos para proyectos Next.js

---

## 🎯 Visión General

### Concepto Principal
El proyecto es un **design system como librería NPM** que proporciona componentes UI reutilizables con sistema de temas intercambiables. Está construido como un wrapper sobre Ant Design que permite aplicar diferentes estilos visuales completos (8 temas predefinidos) manteniendo la misma API.

### Objetivos del Proyecto
1. **Componentes Primitivos (Nivel 1):** Wrappers de componentes Ant Design con estilos customizados
2. **Componentes Customs (Nivel 2):** Composiciones de primitivos (SearchableTable, FormCard, etc.) - Fase 2
3. **8 Temas Visuales:** Spotify, Facebook, GitHub, Slack, Notion, Linear, Netflix, Base/Default
4. **Dashboard/Showcase:** App estilo Storybook para demostración
5. **Librería Compilable:** Exportable como paquete npm compatible con Next.js

---

## 📂 Estructura del Proyecto

```
designSystem/
├── packages/
│   ├── core/                              # Librería principal (Design System)
│   │   ├── .storybook/                    # Configuración Storybook
│   │   │   ├── main.ts
│   │   │   └── preview.tsx
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Display/               # Componentes de visualización
│   │   │   │   │   ├── Avatar/
│   │   │   │   │   ├── Badge/
│   │   │   │   │   ├── Calendar/
│   │   │   │   │   ├── Carousel/
│   │   │   │   │   ├── Collapse/
│   │   │   │   │   ├── Descriptions/
│   │   │   │   │   ├── Empty/
│   │   │   │   │   ├── Image/
│   │   │   │   │   ├── List/
│   │   │   │   │   ├── QRCode/
│   │   │   │   │   ├── Statistic/
│   │   │   │   │   ├── Table/
│   │   │   │   │   ├── Tag/
│   │   │   │   │   ├── Timeline/
│   │   │   │   │   ├── Tree/
│   │   │   │   │   └── Typography/
│   │   │   │   ├── Feedback/              # Componentes de feedback
│   │   │   │   │   ├── Alert/
│   │   │   │   │   ├── Message/
│   │   │   │   │   ├── Modal/
│   │   │   │   │   ├── Notification/
│   │   │   │   │   ├── Progress/
│   │   │   │   │   ├── Rate/
│   │   │   │   │   ├── Result/
│   │   │   │   │   ├── Skeleton/
│   │   │   │   │   └── Spin/
│   │   │   │   ├── Inputs/                # Componentes de entrada
│   │   │   │   │   ├── AutoComplete/
│   │   │   │   │   ├── Cascader/
│   │   │   │   │   ├── Checkbox/
│   │   │   │   │   ├── ColorPicker/
│   │   │   │   │   ├── DatePicker/
│   │   │   │   │   ├── Form/
│   │   │   │   │   ├── Input/
│   │   │   │   │   ├── InputNumber/
│   │   │   │   │   ├── Mentions/
│   │   │   │   │   ├── Radio/
│   │   │   │   │   ├── Select/
│   │   │   │   │   ├── Slider/
│   │   │   │   │   ├── Switch/
│   │   │   │   │   ├── TimePicker/
│   │   │   │   │   ├── Transfer/
│   │   │   │   │   ├── TreeSelect/
│   │   │   │   │   └── Upload/
│   │   │   │   ├── Layout/                # Componentes de layout
│   │   │   │   │   ├── Card/
│   │   │   │   │   ├── Container/
│   │   │   │   │   ├── Divider/
│   │   │   │   │   ├── Flex/
│   │   │   │   │   ├── Grid/
│   │   │   │   │   ├── Layout/
│   │   │   │   │   ├── Space/
│   │   │   │   │   ├── Splitter/
│   │   │   │   │   └── Stack/
│   │   │   │   ├── Navigation/            # Componentes de navegación
│   │   │   │   │   ├── Affix/
│   │   │   │   │   ├── Anchor/
│   │   │   │   │   ├── BackTop/
│   │   │   │   │   ├── Breadcrumb/
│   │   │   │   │   ├── Button/            # ✅ Componente principal implementado
│   │   │   │   │   ├── FloatButton/
│   │   │   │   │   ├── Menu/
│   │   │   │   │   ├── Pagination/
│   │   │   │   │   ├── Segmented/
│   │   │   │   │   ├── Steps/
│   │   │   │   │   └── Tabs/
│   │   │   │   ├── Overlay/               # Componentes overlay
│   │   │   │   └── index.ts
│   │   │   ├── providers/
│   │   │   │   ├── ThemeProvider.tsx      # Provider de temas (actualmente básico)
│   │   │   │   └── index.ts
│   │   │   ├── themes/                    # Sistema de temas (pendiente implementación completa)
│   │   │   └── index.ts                   # Export principal
│   │   ├── dist/                          # Output del build
│   │   │   ├── index.js                   # ESM bundle
│   │   │   ├── index.cjs                  # CommonJS bundle
│   │   │   └── index.d.ts                 # TypeScript definitions
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── dashboard/                         # Showcase/Demo App
│       ├── src/
│       │   ├── components/
│       │   │   ├── Layout.tsx
│       │   │   └── Sidebar.tsx
│       │   ├── pages/
│       │   │   ├── Overview.tsx
│       │   │   ├── ButtonPage.tsx
│       │   │   ├── AlertPage.tsx
│       │   │   ├── AvatarPage.tsx
│       │   │   ├── BadgePage.tsx
│       │   │   └── ComponentPage.tsx
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── node_modules/
├── package.json                           # Root workspace config
├── pnpm-workspace.yaml
├── README.md
├── PLAN_DESARROLLO.md
├── STEP1_COMPLETADO.md
└── claude.md                              # Este archivo
```

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
- **Testing:** Storybook 9.1.10 (configurado)
- **Dashboard:** Vite + React Router DOM 7.9.3

---

## 📦 Configuración de Workspaces

### Root package.json
```json
{
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=design-system-dashboard",
    "build": "npm run build --workspace=@designsystem/core",
    "build:all": "npm run build --workspaces",
    "dev:core": "npm run dev --workspace=@designsystem/core",
    "preview": "npm run preview --workspace=design-system-dashboard"
  }
}
```

### @designsystem/core package.json
```json
{
  "name": "@designsystem/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

---

## 🎨 Sistema de Componentes

### Patrón de Implementación
Cada componente sigue esta estructura:

```
ComponentName/
├── ComponentName.tsx          # Implementación del componente
├── ComponentName.stories.tsx  # Stories de Storybook
├── types.ts                   # TypeScript types
└── index.ts                   # Re-exports
```

### Ejemplo de Componente (Button)
```tsx
// Button.tsx
import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  fullWidth = false,
  style,
  ...rest
}) => {
  return (
    <AntButton
      style={{
        width: fullWidth ? '100%' : undefined,
        ...style,
      }}
      {...rest}
    />
  );
};

Button.displayName = 'Button';
```

### Categorías de Componentes

#### ✅ Display (17 componentes)
- Avatar, Badge, Calendar, Carousel, Collapse
- Descriptions, Empty, Image, List, QRCode
- Statistic, Table, Tag, Timeline, Tree, Typography

#### ✅ Feedback (9 componentes)
- Alert, Message, Modal, Notification, Progress
- Rate, Result, Skeleton, Spin

#### ✅ Inputs (17 componentes)
- AutoComplete, Cascader, Checkbox, ColorPicker
- DatePicker, Form, Input, InputNumber, Mentions
- Radio, Select, Slider, Switch, TimePicker
- Transfer, TreeSelect, Upload

#### ✅ Layout (9 componentes)
- Card, Container, Divider, Flex, Grid
- Layout, Space, Splitter, Stack

#### ✅ Navigation (11 componentes)
- Affix, Anchor, BackTop, Breadcrumb, Button
- FloatButton, Menu, Pagination, Segmented, Steps, Tabs

#### ⏳ Overlay (pendiente)
- Drawer, Popconfirm, Popover, Tooltip, etc.

---

## 🎭 Sistema de Temas

### ✅ Estado Actual - COMPLETAMENTE IMPLEMENTADO
- ✅ **ThemeProvider funcional** con Context API
- ✅ **8 Temas implementados:** Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel, Base
- ✅ **Hook useTheme** para cambio dinámico de temas
- ✅ **ThemeSwitcher UI** integrado en dashboard
- ✅ **Cambio de temas en tiempo real** funcionando

### ThemeProvider Actual (FUNCIONAL ✅)
```tsx
// packages/core/src/providers/ThemeProvider.tsx
import React, { createContext, useState } from 'react';
import { ConfigProvider } from 'antd';
import { templates } from '../themes';
import type { TemplateName } from '../themes/types';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTemplate = 'base',
}) => {
  const [template, setTemplate] = useState<TemplateName>(defaultTemplate);
  const themeConfig = templates[template];

  return (
    <ThemeContext.Provider value={{ template, setTemplate }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
```

### ✅ Arquitectura de Temas Implementada

#### 1. Tipos de Temas
```typescript
// packages/core/src/themes/types.ts
export type ThemeName =
  | 'spotify'    // Verde #1DB954, dark
  | 'facebook'   // Azul #1877F2, light
  | 'github'     // Gris oscuro, dark/light
  | 'slack'      // Púrpura #611F69
  | 'notion'     // Beige/gris suave
  | 'linear'     // Azul/púrpura gradiente
  | 'netflix'    // Rojo #E50914, dark
  | 'base';      // Default

export interface ThemeConfig {
  token: {
    colorPrimary: string;
    colorBgContainer: string;
    colorBgElevated: string;
    colorText: string;
    colorTextSecondary: string;
    colorBorder: string;
    fontFamily: string;
    borderRadius: number;
    // ... más tokens de Ant Design
  };
  components?: {
    Button?: {
      borderRadius?: number;
      controlHeight?: number;
      fontWeight?: number;
    };
    Input?: { /* config */ };
    // ... más componentes
  };
}
```

#### 2. Tema Spotify (Ejemplo a implementar)
```typescript
// packages/core/src/themes/spotify.ts
export const spotifyTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1DB954',           // Verde Spotify
    colorBgContainer: '#121212',       // Background dark
    colorBgElevated: '#181818',        // Superficies elevadas
    colorText: '#FFFFFF',              // Texto principal
    colorTextSecondary: '#B3B3B3',     // Texto secundario
    colorBorder: '#282828',            // Bordes
    fontFamily: 'Circular Std, -apple-system, sans-serif',
    borderRadius: 8,
  },
  components: {
    Button: {
      borderRadius: 500,               // Botones completamente redondos
      controlHeight: 48,
      fontWeight: 700,
    },
    Input: {
      borderRadius: 4,
      controlHeight: 40,
    },
  },
};
```

#### 3. ThemeProvider con Context (A implementar)
```typescript
// packages/core/src/providers/ThemeProvider.tsx
import React, { createContext, useState } from 'react';
import { ConfigProvider } from 'antd';
import { themes } from '../themes';
import type { ThemeName } from '../themes/types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'spotify'
}) => {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme);
  const themeConfig = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
```

#### 4. Hook useTheme (A implementar)
```typescript
// packages/core/src/hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeProvider';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

#### 5. Index de Temas (A implementar)
```typescript
// packages/core/src/themes/index.ts
export * from './types';
export { spotifyTheme } from './spotify';
export { facebookTheme } from './facebook';
export { githubTheme } from './github';
// ... más temas

export const themes = {
  spotify: spotifyTheme,
  facebook: facebookTheme,
  github: githubTheme,
  // ...
};
```

---

## 🚀 Comandos Disponibles

### Desarrollo
```bash
# Dashboard de demostración (Puerto 3000)
npm run dev

# Desarrollo del core (watch mode)
npm run dev:core

# Storybook
npm run storybook --workspace=@designsystem/core
```

### Build
```bash
# Build de la librería core
npm run build

# Build de todos los workspaces
npm run build:all

# Build específico de Storybook
npm run build-storybook --workspace=@designsystem/core
```

### Preview
```bash
# Preview del dashboard
npm run preview
```

---

## 📊 Estado de Implementación

### ✅ Step 1 - COMPLETADO
- [x] Monorepo configurado (npm workspaces)
- [x] Estructura de carpetas completa
- [x] 63 Componentes primitivos
- [x] ThemeProvider básico
- [x] Dashboard con rutas y navegación
- [x] Build configurado (ESM + CJS)
- [x] TypeScript types generados
- [x] Storybook configurado
- [x] Documentación completa

### ✅ Step 1.5 - COMPLETADO
- [x] Sistema completo de temas implementado
- [x] 8 Temas funcionales (Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel, Base)
- [x] ThemeProvider con Context API
- [x] Hook useTheme
- [x] Theme switcher en dashboard
- [x] Cambio dinámico de temas funcionando
- [x] Exports actualizados
- [x] Build funcionando (53.76 kB ESM, 37.24 kB CJS)

### 📝 Step 2 - PLANIFICADO
- [ ] Mejorar temas existentes con más tokens
- [ ] Añadir persistencia de tema (localStorage)
- [ ] Mejorar Storybook con addon de temas

### 🔮 Step 3 - FUTURO
- [ ] Todos los wrappers de Ant Design
- [ ] 8 temas completos
- [ ] Sistema de theming dinámico avanzado

### 🎯 Step 4 - FUTURO
- [ ] Componentes customs (SearchableTable, FormCard)
- [ ] Composiciones complejas

### 🧪 Step 5 - FUTURO
- [ ] Tests unitarios
- [ ] Publicación a npm
- [ ] CI/CD

---

## 🔌 Uso de la Librería

### Instalación (cuando esté publicada)
```bash
npm install @designsystem/core
# o
pnpm add @designsystem/core
```

### Setup en Next.js (App Router)
```tsx
// app/providers.tsx
'use client';
import { ThemeProvider } from '@designsystem/core';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="spotify">
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

### Setup en Next.js (Pages Router)
```tsx
// pages/_app.tsx
import { ThemeProvider } from '@designsystem/core';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme="spotify">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### Uso de Componentes
```tsx
import { Button, Avatar, Badge } from '@designsystem/core';

export default function MyComponent() {
  return (
    <>
      <Button type="primary" fullWidth>Click me</Button>
      <Avatar src="/avatar.jpg" size={64} />
      <Badge count={5}>Notifications</Badge>
    </>
  );
}
```

---

## 🔍 Exports Actuales

```typescript
// De packages/core/src/index.ts
export * from './components';  // Todos los componentes
export * from './providers';   // ThemeProvider
```

### Componentes Exportados
```typescript
// Display
export { Avatar, Badge, Calendar, Carousel, Collapse,
         Descriptions, Empty, Image, List, QRCode,
         Statistic, Table, Tag, Timeline, Tree, Typography }

// Feedback
export { Alert, Message, Modal, Notification, Progress,
         Rate, Result, Skeleton, Spin }

// Inputs
export { AutoComplete, Cascader, Checkbox, ColorPicker,
         DatePicker, Form, Input, InputNumber, Mentions,
         Radio, Select, Slider, Switch, TimePicker,
         Transfer, TreeSelect, Upload }

// Layout
export { Card, Container, Divider, Flex, Grid,
         Layout, Space, Splitter, Stack }

// Navigation
export { Affix, Anchor, BackTop, Breadcrumb, Button,
         FloatButton, Menu, Pagination, Segmented, Steps, Tabs }

// Providers
export { ThemeProvider }
```

---

## 🏗️ Build Configuration

### Vite Config (Library Mode)
```typescript
// packages/core/vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DesignSystem',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'antd'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          antd: 'antd',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});
```

### Output del Build
```
dist/
├── index.js          # ESM bundle (~2.65 kB gzip: 1.28 kB)
├── index.cjs         # CommonJS bundle (~1.89 kB gzip: 0.98 kB)
├── index.d.ts        # TypeScript definitions
└── *.map             # Source maps
```

---

## 📚 Dashboard/Showcase

### Rutas Implementadas
```typescript
// packages/dashboard/src/App.tsx
const routes = {
  '/': Overview,
  '/button': ButtonPage,
  '/avatar': AvatarPage,
  '/badge': BadgePage,
  '/alert': AlertPage,
  // ... más rutas para cada componente
};
```

### Estructura del Dashboard
- **Layout:** Sidebar + Content area
- **Sidebar:** Navegación por categorías de componentes
- **Pages:** Ejemplos interactivos de cada componente
- **Theme:** Actualmente usa ThemeProvider básico

---

## 🐛 Issues Conocidos

### ✅ RESUELTOS
1. ~~**Sistema de temas NO implementado**~~ → **RESUELTO ✅**
   - ✅ Directorio `themes/` con 8 temas completos
   - ✅ ThemeProvider funcional con Context API
   - ✅ Hook `useTheme` implementado
   - ✅ Archivos de configuración de temas completos

2. ~~**Dashboard sin theme switcher**~~ → **RESUELTO ✅**
   - ✅ ThemeSwitcher UI implementado
   - ✅ Selector de 8 temas disponible
   - ⏳ Persistencia en localStorage (pendiente)

### 🟡 MEDIOS
3. **Componentes son re-exports básicos**
   - La mayoría son re-exports directos: `export { Input } from 'antd'`
   - Responden a temas vía ConfigProvider
   - Podrían beneficiarse de wrappers custom

4. **Falta documentación de componentes**
   - Storybook configurado pero muchas stories incompletas
   - Falta documentación de props custom
   - Falta ejemplos de uso con temas

---

## 🔜 Próximos Pasos Recomendados

### 🔴 CRÍTICO - Step 1.5: Sistema de Temas (HACER PRIMERO)
**Objetivo:** Implementar el corazón del proyecto - el sistema de temas

**Tareas específicas:**
1. **Crear tipos de temas**
   - Archivo: `packages/core/src/themes/types.ts`
   - Definir `ThemeName` type union
   - Definir `ThemeConfig` interface con Design Tokens

2. **Implementar tema Spotify**
   - Archivo: `packages/core/src/themes/spotify.ts`
   - Configurar todos los Design Tokens
   - Configurar component tokens (Button, Input, etc.)

3. **Actualizar ThemeProvider**
   - Archivo: `packages/core/src/providers/ThemeProvider.tsx`
   - Implementar Context API
   - Agregar estado de tema
   - Integrar con ConfigProvider de Ant Design

4. **Crear hook useTheme**
   - Archivo: `packages/core/src/hooks/useTheme.ts`
   - Hook para acceder al tema actual
   - Función `setTheme()` para cambiar tema

5. **Crear index de temas**
   - Archivo: `packages/core/src/themes/index.ts`
   - Exportar todos los temas
   - Crear objeto `themes` con todos los temas

6. **Actualizar exports principales**
   - Exportar desde `packages/core/src/hooks/index.ts`
   - Exportar desde `packages/core/src/index.ts`

**Criterio de éxito:**
- ✅ Tema Spotify funcional
- ✅ `useTheme` permite cambiar tema en runtime
- ✅ Al menos 5 componentes responden al tema

---

### 🟡 ALTO - Step 2: Theme Switcher + Más Temas
1. **Theme switcher en dashboard**
   - Componente selector de temas
   - Persistencia en localStorage

2. **Implementar 3 temas más:**
   - Facebook (azul #1877F2, light)
   - GitHub (gris oscuro, dark)
   - Netflix (rojo #E50914, dark)

3. **Mejorar componentes principales:**
   - Button, Input, Typography con wrappers propios
   - Agregar props custom útiles

---

### 🟢 MEDIO - Step 3: Temas Completos
1. **4 temas restantes:**
   - Slack, Notion, Linear, Base

2. **Storybook completo:**
   - Stories para todos los componentes
   - Addon de temas
   - Documentación en MDX

---

### 🔵 BAJO - Testing & Publicación
1. **Testing:**
   - Unit tests con Vitest
   - Coverage > 80%

2. **CI/CD:**
   - GitHub Actions
   - Publicación a npm

---

## 💡 Notas para Desarrollo

### Patrones a Seguir
1. **Todos los componentes deben:**
   - Tener su propio wrapper (no solo re-export)
   - Ser theme-aware
   - Tener TypeScript types completos
   - Incluir displayName
   - Tener .stories.tsx

2. **Sistema de temas debe:**
   - Usar Design Tokens de Ant Design 5
   - Permitir override a nivel de componente
   - Ser type-safe
   - Soportar cambio dinámico

3. **Build debe generar:**
   - ESM y CJS bundles
   - TypeScript definitions
   - Source maps
   - Tree-shakeable output

### Convenciones
- **Nombres de componentes:** PascalCase
- **Props interfaces:** `ComponentNameProps`
- **Archivos de temas:** `themeName.ts` (ej: `spotify.ts`)
- **Stories:** `ComponentName.stories.tsx`

---

## 📖 Referencias Útiles

### Documentación
- [Ant Design 5 Docs](https://ant.design/components/overview)
- [Ant Design Theme Editor](https://ant.design/theme-editor)
- [Storybook React Docs](https://storybook.js.org/docs/react)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)

### Archivos Clave del Proyecto
- `PLAN_DESARROLLO.md` - Plan completo del proyecto
- `STEP1_COMPLETADO.md` - Checklist del Step 1
- `README.md` - Documentación de usuario
- `packages/core/src/index.ts` - Punto de entrada de exports
- `packages/core/vite.config.ts` - Configuración de build
- `.storybook/main.ts` - Configuración de Storybook

---

## 🎯 Resumen Ejecutivo

**Estado Actual:**
- ✅ **Step 1 (Infraestructura):** COMPLETADO - Monorepo, 63 componentes, build system, dashboard, Storybook
- ✅ **Step 1.5 (Temas):** COMPLETADO - Sistema de temas FUNCIONAL ✨

**Logro Principal:**
El proyecto ahora tiene su característica diferenciadora funcionando: **8 temas intercambiables en tiempo real** (Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel, Base). Los componentes responden a cambios de tema dinámicamente.

**Próximo Paso:**
Step 2 - Mejorar temas existentes, agregar persistencia (localStorage), expandir tokens de diseño

**Arquitectura:**
Base sólida con sistema de temas funcional. ThemeProvider + useTheme hook + 8 temas completos.

**Uso Actual:**
La librería funciona en Next.js CON sistema de temas personalizable. Los usuarios pueden cambiar entre 8 estilos visuales diferentes en runtime.

---

## 🤖 Agentes Personalizados Disponibles

### `componentes-agent`
- **Uso:** Crear/modificar componentes primitivos
- **Especialidad:** React + TypeScript + Ant Design + Sistema de temas
- **Archivo:** `.claude/agents/componentes-agent.md`

### `storybook-agent`
- **Uso:** Crear stories para documentación
- **Especialidad:** Storybook + CSF3 + Ant Design
- **Archivo:** `.claude/agents/storybook-agent.md`

**Invocar agentes con:**
```typescript
Task tool → subagent_type: "componentes-agent" o "storybook-agent"
```

---

*Última actualización: 2025-10-09*
*Versión del documento: 3.0*
*Cambio principal: Step 1.5 completado - Sistema de temas funcional con 8 temas*
