# Plan de Implementación - Sistema de Templates/Temas

## 📋 Resumen Ejecutivo

**Objetivo:** Implementar un sistema de templates (temas) CSS donde al elegir un template, TODOS los componentes cambian su estilo automáticamente.

**Solución:** Usar Design Tokens de Ant Design 5 + Context API + ConfigProvider

**Templates:** 8 templates predefinidos (Base, Spotify, Facebook, GitHub, Slack, Notion, Linear, Netflix)

**Tecnología:** TypeScript + React Context + Ant Design 5 ThemeConfig

---

## 🏗️ Arquitectura del Sistema

### 1. Estructura de Archivos

```
packages/core/src/
├── themes/                           # ⭐ NUEVO
│   ├── types.ts                      # Types: TemplateName, TemplateConfig
│   ├── tokens/                       # Design tokens por template
│   │   ├── base.ts                   # Template Base (Ant Design default)
│   │   ├── spotify.ts                # Template Spotify
│   │   ├── facebook.ts               # Template Facebook
│   │   ├── github.ts                 # Template GitHub
│   │   ├── slack.ts                  # Template Slack
│   │   ├── notion.ts                 # Template Notion
│   │   ├── linear.ts                 # Template Linear
│   │   └── netflix.ts                # Template Netflix
│   └── index.ts                      # Export central de templates
│
├── providers/
│   └── ThemeProvider.tsx             # ⚙️ ACTUALIZAR (agregar Context)
│
├── hooks/                            # ⭐ NUEVO
│   ├── useTheme.ts                   # Hook para acceder/cambiar template
│   └── index.ts                      # Export del hook
│
├── components/                       # ✅ YA EXISTE
│   └── [63 componentes]              # NO SE MODIFICAN (theme-aware automático)
│
└── index.ts                          # ⚙️ ACTUALIZAR (export hooks + themes)
```

### 2. Flujo de Datos

```
Usuario selecciona template → useTheme.setTemplate('spotify')
                                         ↓
                            Context actualiza estado
                                         ↓
                          ConfigProvider recibe nuevo ThemeConfig
                                         ↓
                      Ant Design aplica tokens a TODOS los componentes
                                         ↓
                            UI se actualiza automáticamente
```

### 3. Conceptos Clave

**Design Tokens:** Variables de diseño (colores, spacing, typography) definidas en Ant Design 5
**ThemeConfig:** Objeto de configuración que Ant Design usa para aplicar estilos
**Template:** Conjunto de Design Tokens con nombre único
**ConfigProvider:** Componente de Ant Design que aplica el tema globalmente
**Context API:** Mecanismo de React para compartir el template activo

---

## 📝 Fase 1: Fundación del Sistema

### Paso 1.1: Crear Types de Templates

**Archivo:** `packages/core/src/themes/types.ts`

```typescript
import type { ThemeConfig } from 'antd';

/**
 * Nombres de templates disponibles
 */
export type TemplateName =
  | 'base'      // Ant Design default
  | 'spotify'   // Verde #1DB954, dark
  | 'facebook'  // Azul #1877F2, light
  | 'github'    // Gris #24292e, dark/light
  | 'slack'     // Púrpura #611F69
  | 'notion'    // Beige/gris suave
  | 'linear'    // Azul/púrpura gradiente
  | 'netflix';  // Rojo #E50914, dark

/**
 * Configuración de template (alias de ThemeConfig de Ant Design)
 */
export type TemplateConfig = ThemeConfig;

/**
 * Metadata de template (opcional - para mostrar en UI)
 */
export interface TemplateMetadata {
  name: TemplateName;
  displayName: string;
  description: string;
  primaryColor: string;
  theme: 'light' | 'dark';
  preview?: string; // URL de imagen preview
}

/**
 * Mapa de todos los templates
 */
export type TemplatesMap = Record<TemplateName, TemplateConfig>;

/**
 * Mapa de metadata (opcional)
 */
export type TemplatesMetadataMap = Record<TemplateName, TemplateMetadata>;
```

**✅ Criterio de éxito:** TypeScript compila sin errores, types exportados correctamente

---

### Paso 1.2: Implementar Template Base

**Archivo:** `packages/core/src/themes/tokens/base.ts`

```typescript
import type { TemplateConfig } from '../types';

/**
 * Template Base - Ant Design Default
 * Usa los colores y estilos por defecto de Ant Design 5
 */
export const baseTemplate: TemplateConfig = {
  token: {
    // Colores principales
    colorPrimary: '#1890ff',              // Azul Ant Design
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    // Backgrounds
    colorBgContainer: '#ffffff',          // Fondo contenedor
    colorBgElevated: '#ffffff',           // Fondo elevado (modals, dropdowns)
    colorBgLayout: '#f0f2f5',             // Fondo layout

    // Textos
    colorText: 'rgba(0, 0, 0, 0.88)',     // Texto principal
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',

    // Bordes
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',

    // Tipografía
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // Espaciado
    borderRadius: 6,
    controlHeight: 32,

    // Otros
    wireframe: false,
  },

  // Configuración específica por componente (opcional)
  components: {
    Button: {
      controlHeight: 32,
      borderRadius: 6,
    },
    Input: {
      controlHeight: 32,
      borderRadius: 6,
    },
  },
};
```

**✅ Criterio de éxito:** Template base funciona, estilos son idénticos a Ant Design default

---

### Paso 1.3: Implementar Template Spotify (Proof of Concept)

**Archivo:** `packages/core/src/themes/tokens/spotify.ts`

```typescript
import type { TemplateConfig } from '../types';

/**
 * Template Spotify - Dark Theme
 * Inspirado en el diseño de Spotify
 */
export const spotifyTemplate: TemplateConfig = {
  token: {
    // Colores principales - Verde Spotify
    colorPrimary: '#1DB954',              // Verde Spotify
    colorSuccess: '#1DB954',
    colorWarning: '#FFB626',
    colorError: '#E22134',
    colorInfo: '#1DB954',

    // Backgrounds - Dark Theme
    colorBgContainer: '#121212',          // Negro Spotify (fondo principal)
    colorBgElevated: '#181818',           // Negro elevado (cards, modals)
    colorBgLayout: '#000000',             // Negro absoluto (layout)
    colorBgSpotlight: '#282828',          // Gris oscuro (hover states)

    // Textos - Light on Dark
    colorText: '#FFFFFF',                 // Blanco (texto principal)
    colorTextSecondary: '#B3B3B3',        // Gris claro (texto secundario)
    colorTextTertiary: '#878787',         // Gris medio
    colorTextQuaternary: '#535353',       // Gris oscuro

    // Bordes
    colorBorder: '#282828',               // Gris muy oscuro
    colorBorderSecondary: '#181818',

    // Tipografía - Circular Std (fallback a system fonts)
    fontFamily: `'Circular Std', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    fontSize: 14,
    fontSizeHeading1: 48,
    fontSizeHeading2: 32,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontWeightStrong: 700,                // Spotify usa texto bold

    // Espaciado y formas
    borderRadius: 8,                      // Border radius base
    controlHeight: 48,                    // Controles más grandes

    // Otros
    wireframe: false,
  },

  // Configuración específica por componente
  components: {
    Button: {
      borderRadius: 500,                  // Botones completamente redondos
      controlHeight: 48,
      fontWeight: 700,
      primaryShadow: 'none',              // Sin sombras
      defaultShadow: 'none',
    },

    Input: {
      borderRadius: 4,
      controlHeight: 40,
      colorBgContainer: '#181818',
      colorBorder: '#2a2a2a',
      activeBorderColor: '#1DB954',
      hoverBorderColor: '#1DB954',
    },

    Card: {
      borderRadius: 8,
      colorBgContainer: '#181818',
    },

    Modal: {
      borderRadius: 8,
      contentBg: '#282828',
      headerBg: '#282828',
    },

    Table: {
      borderRadius: 8,
      headerBg: '#181818',
      rowHoverBg: '#2a2a2a',
    },

    Select: {
      borderRadius: 4,
      controlHeight: 40,
    },

    Menu: {
      colorBgContainer: '#000000',
      itemBg: 'transparent',
      itemHoverBg: '#282828',
      itemActiveBg: '#282828',
      itemSelectedBg: '#282828',
      itemSelectedColor: '#1DB954',
    },
  },
};
```

**✅ Criterio de éxito:** Template Spotify renderiza con verde #1DB954 y fondos dark

---

### Paso 1.4: Crear Index de Templates

**Archivo:** `packages/core/src/themes/index.ts`

```typescript
// Re-export types
export * from './types';
export type { TemplateConfig, TemplateName } from './types';

// Import templates
import { baseTemplate } from './tokens/base';
import { spotifyTemplate } from './tokens/spotify';
import type { TemplatesMap, TemplatesMetadataMap } from './types';

/**
 * Mapa de todos los templates disponibles
 */
export const templates: TemplatesMap = {
  base: baseTemplate,
  spotify: spotifyTemplate,
  // Fase 2: agregar más templates
  facebook: baseTemplate,  // Placeholder temporales
  github: baseTemplate,
  slack: baseTemplate,
  notion: baseTemplate,
  linear: baseTemplate,
  netflix: baseTemplate,
};

/**
 * Metadata de templates (para UI)
 */
export const templatesMetadata: TemplatesMetadataMap = {
  base: {
    name: 'base',
    displayName: 'Base (Ant Design)',
    description: 'Tema por defecto de Ant Design',
    primaryColor: '#1890ff',
    theme: 'light',
  },
  spotify: {
    name: 'spotify',
    displayName: 'Spotify',
    description: 'Tema oscuro inspirado en Spotify',
    primaryColor: '#1DB954',
    theme: 'dark',
  },
  // Resto de metadata...
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    description: 'Tema azul inspirado en Facebook',
    primaryColor: '#1877F2',
    theme: 'light',
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    description: 'Tema oscuro inspirado en GitHub',
    primaryColor: '#24292e',
    theme: 'dark',
  },
  slack: {
    name: 'slack',
    displayName: 'Slack',
    description: 'Tema púrpura inspirado en Slack',
    primaryColor: '#611F69',
    theme: 'light',
  },
  notion: {
    name: 'notion',
    displayName: 'Notion',
    description: 'Tema suave inspirado en Notion',
    primaryColor: '#d4d4d4',
    theme: 'light',
  },
  linear: {
    name: 'linear',
    displayName: 'Linear',
    description: 'Tema gradiente inspirado en Linear',
    primaryColor: '#5E6AD2',
    theme: 'dark',
  },
  netflix: {
    name: 'netflix',
    displayName: 'Netflix',
    description: 'Tema rojo inspirado en Netflix',
    primaryColor: '#E50914',
    theme: 'dark',
  },
};

// Named exports individuales
export { baseTemplate, spotifyTemplate };
```

**✅ Criterio de éxito:** Imports funcionan, objeto `templates` contiene todos los templates

---

## 🔄 Fase 2: Sistema de Context y Provider

### Paso 2.1: Actualizar ThemeProvider

**Archivo:** `packages/core/src/providers/ThemeProvider.tsx`

```typescript
import React, { createContext, useState, useCallback, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { templates } from '../themes';
import type { TemplateName } from '../themes/types';

/**
 * Context type
 */
interface ThemeContextType {
  template: TemplateName;
  setTemplate: (template: TemplateName) => void;
}

/**
 * Context para compartir el template activo
 */
export const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Props del ThemeProvider
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTemplate?: TemplateName;
  persist?: boolean; // Si true, guarda en localStorage
}

/**
 * ThemeProvider - Gestiona el template activo y aplica estilos
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTemplate = 'base',
  persist = false,
}) => {
  // Estado del template activo
  const [template, setTemplateState] = useState<TemplateName>(() => {
    // Si persist=true, intentar cargar de localStorage
    if (persist && typeof window !== 'undefined') {
      const saved = localStorage.getItem('design-system-template');
      if (saved && saved in templates) {
        return saved as TemplateName;
      }
    }
    return defaultTemplate;
  });

  // Función para cambiar template
  const setTemplate = useCallback((newTemplate: TemplateName) => {
    if (!(newTemplate in templates)) {
      console.warn(`Template "${newTemplate}" no existe. Templates disponibles:`, Object.keys(templates));
      return;
    }

    setTemplateState(newTemplate);

    // Guardar en localStorage si persist=true
    if (persist && typeof window !== 'undefined') {
      localStorage.setItem('design-system-template', newTemplate);
    }
  }, [persist]);

  // Obtener configuración del template actual
  const themeConfig = templates[template];

  // Context value
  const contextValue = {
    template,
    setTemplate,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';
```

**✅ Criterio de éxito:** ThemeProvider gestiona estado, aplica template, persiste en localStorage (opcional)

---

### Paso 2.2: Crear Hook useTheme

**Archivo:** `packages/core/src/hooks/useTheme.ts`

```typescript
import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeProvider';

/**
 * Hook para acceder y cambiar el template activo
 *
 * @example
 * ```tsx
 * function ThemeSwitcher() {
 *   const { template, setTemplate } = useTheme();
 *
 *   return (
 *     <Select value={template} onChange={setTemplate}>
 *       <Option value="base">Base</Option>
 *       <Option value="spotify">Spotify</Option>
 *     </Select>
 *   );
 * }
 * ```
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme debe ser usado dentro de un ThemeProvider. ' +
      'Asegúrate de envolver tu app con <ThemeProvider>.'
    );
  }

  return context;
};
```

**Archivo:** `packages/core/src/hooks/index.ts`

```typescript
export { useTheme } from './useTheme';
```

**✅ Criterio de éxito:** Hook lanza error si se usa fuera de ThemeProvider, retorna template y setTemplate

---

### Paso 2.3: Actualizar Exports Principales

**Archivo:** `packages/core/src/index.ts`

```typescript
// Componentes (YA EXISTE)
export * from './components';

// Providers (ACTUALIZADO)
export * from './providers';
export { ThemeProvider } from './providers/ThemeProvider';

// Hooks (NUEVO)
export * from './hooks';
export { useTheme } from './hooks/useTheme';

// Themes (NUEVO)
export * from './themes';
export { templates, templatesMetadata } from './themes';
export type { TemplateName, TemplateConfig } from './themes/types';
```

**✅ Criterio de éxito:** Todo se exporta correctamente, no hay errores de TypeScript

---

## 🧪 Fase 3: Testing y Verificación

### Paso 3.1: Testing Manual en Dashboard

**Archivo a modificar:** `packages/dashboard/src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@designsystem/core';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTemplate="spotify" persist={true}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

**Crear componente ThemeSwitcher:**

**Archivo:** `packages/dashboard/src/components/ThemeSwitcher.tsx`

```typescript
import React from 'react';
import { Select } from 'antd';
import { useTheme, templatesMetadata } from '@designsystem/core';
import type { TemplateName } from '@designsystem/core';

export const ThemeSwitcher: React.FC = () => {
  const { template, setTemplate } = useTheme();

  const options = Object.entries(templatesMetadata).map(([key, meta]) => ({
    value: key,
    label: `${meta.displayName} (${meta.theme})`,
  }));

  return (
    <Select
      value={template}
      onChange={(value: TemplateName) => setTemplate(value)}
      options={options}
      style={{ width: 200 }}
    />
  );
};
```

**Agregar a Layout:**

```typescript
// packages/dashboard/src/components/Layout.tsx
import { ThemeSwitcher } from './ThemeSwitcher';

// Agregar en el header o sidebar:
<ThemeSwitcher />
```

**✅ Criterio de éxito:**
- Selector muestra templates
- Al cambiar template, TODOS los componentes cambian estilo
- localStorage guarda preferencia
- Al recargar, mantiene template seleccionado

---

### Paso 3.2: Comandos de Verificación

```bash
# 1. Build de la librería
npm run build --workspace=@designsystem/core

# 2. Verificar que no hay errores TypeScript
npx tsc --noEmit --project packages/core/tsconfig.json

# 3. Ejecutar dashboard
npm run dev

# 4. Verificar exports
node -e "const lib = require('./packages/core/dist/index.cjs'); console.log(Object.keys(lib))"
```

**✅ Criterio de éxito:**
- Build sin errores
- TypeScript compila
- Dashboard carga
- Exports incluyen: `ThemeProvider`, `useTheme`, `templates`

---

### Paso 3.3: Checklist de Validación

**Validación Visual:**
- [ ] Template "base" renderiza con azul #1890ff
- [ ] Template "spotify" renderiza con verde #1DB954 y fondos dark
- [ ] Cambiar template actualiza TODOS los componentes
- [ ] Botones, inputs, cards responden al template
- [ ] Textos son legibles (contrast ratio correcto)
- [ ] LocalStorage guarda preferencia (si persist=true)

**Validación Técnica:**
- [ ] No hay errores en consola
- [ ] Build exitoso sin warnings
- [ ] TypeScript strict mode pasa
- [ ] Todos los exports disponibles
- [ ] useTheme lanza error fuera de provider
- [ ] ConfigProvider recibe ThemeConfig correcto

---

## 🚀 Fase 4: Implementar Templates Restantes

### Paso 4.1: Template Facebook

**Archivo:** `packages/core/src/themes/tokens/facebook.ts`

```typescript
import type { TemplateConfig } from '../types';

export const facebookTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#1877F2',              // Azul Facebook
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#F0F2F5',
    colorText: '#050505',
    colorTextSecondary: '#65676B',
    colorBorder: '#CED0D4',
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    borderRadius: 8,
    controlHeight: 36,
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 36,
      fontWeight: 600,
    },
  },
};
```

### Paso 4.2: Template GitHub

```typescript
export const githubTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#238636',              // Verde GitHub
    colorBgContainer: '#0d1117',          // Dark
    colorBgElevated: '#161b22',
    colorText: '#c9d1d9',
    colorTextSecondary: '#8b949e',
    colorBorder: '#30363d',
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', sans-serif`,
    borderRadius: 6,
    controlHeight: 32,
  },
};
```

### Paso 4.3: Template Netflix

```typescript
export const netflixTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#E50914',              // Rojo Netflix
    colorBgContainer: '#141414',          // Negro Netflix
    colorBgElevated: '#181818',
    colorText: '#FFFFFF',
    colorTextSecondary: '#B3B3B3',
    colorBorder: '#2F2F2F',
    fontFamily: `'Netflix Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
    borderRadius: 4,
    controlHeight: 48,
  },
};
```

### Paso 4.4: Actualizar index.ts

```typescript
// Importar todos los templates
import { facebookTemplate } from './tokens/facebook';
import { githubTemplate } from './tokens/github';
import { netflixTemplate } from './tokens/netflix';
// ... más imports

export const templates: TemplatesMap = {
  base: baseTemplate,
  spotify: spotifyTemplate,
  facebook: facebookTemplate,
  github: githubTemplate,
  netflix: netflixTemplate,
  // ... resto
};
```

**✅ Criterio de éxito:** Todos los 8 templates implementados y funcionando

---

## ⚠️ Errores Comunes a Evitar

### 1. ❌ Olvidar exportar templates
```typescript
// INCORRECTO
const spotifyTemplate = { ... };

// CORRECTO
export const spotifyTemplate: TemplateConfig = { ... };
```

### 2. ❌ ThemeConfig incompleto
```typescript
// INCORRECTO - Falta token
export const myTemplate = {
  components: { Button: {} }
};

// CORRECTO
export const myTemplate: TemplateConfig = {
  token: { colorPrimary: '#000' },
  components: { Button: {} }
};
```

### 3. ❌ Usar useTheme fuera de provider
```typescript
// INCORRECTO - Error en runtime
function App() {
  const { template } = useTheme(); // ❌ No hay provider
  return <div>{template}</div>;
}

// CORRECTO
<ThemeProvider>
  <App />
</ThemeProvider>
```

### 4. ❌ Template name typo
```typescript
// INCORRECTO
setTemplate('spotfy'); // ❌ Typo

// CORRECTO
setTemplate('spotify'); // ✅ Type-safe
```

### 5. ❌ No persistir cambios
```typescript
// Si quieres persistencia, usa persist prop
<ThemeProvider persist={true}>
```

---

## 📊 Consideraciones de Performance

### 1. Cambio de Template es Instantáneo
- Ant Design optimiza re-renders
- Solo componentes visibles se actualizan
- CSS Variables permiten cambio rápido

### 2. Bundle Size
- Cada template agrega ~1-2KB
- Tree-shaking elimina templates no usados
- Total: ~8-16KB para todos los templates

### 3. SSR con Next.js
```typescript
// app/providers.tsx (Next.js 13+)
'use client';

import { ThemeProvider } from '@designsystem/core';

export function Providers({ children }) {
  return (
    <ThemeProvider defaultTemplate="spotify" persist={true}>
      {children}
    </ThemeProvider>
  );
}
```

---

## 🎯 Resumen de Implementación

### Archivos a Crear (11 archivos nuevos)
1. ✅ `themes/types.ts` - Types del sistema
2. ✅ `themes/tokens/base.ts` - Template base
3. ✅ `themes/tokens/spotify.ts` - Template Spotify
4. ✅ `themes/tokens/facebook.ts` - Template Facebook
5. ✅ `themes/tokens/github.ts` - Template GitHub
6. ✅ `themes/tokens/slack.ts` - Template Slack
7. ✅ `themes/tokens/notion.ts` - Template Notion
8. ✅ `themes/tokens/linear.ts` - Template Linear
9. ✅ `themes/tokens/netflix.ts` - Template Netflix
10. ✅ `themes/index.ts` - Export central
11. ✅ `hooks/useTheme.ts` - Hook

### Archivos a Actualizar (3 archivos)
1. ✅ `providers/ThemeProvider.tsx` - Agregar Context
2. ✅ `hooks/index.ts` - Export hook
3. ✅ `index.ts` - Export themes + hook

### Testing
1. ✅ Dashboard con ThemeSwitcher
2. ✅ Build sin errores
3. ✅ TypeScript strict mode
4. ✅ Persistencia en localStorage

---

## 🔄 Orden de Ejecución Recomendado

### Sprint 1 (1-2 días): Fundación
1. Crear `themes/types.ts`
2. Crear `themes/tokens/base.ts`
3. Crear `themes/tokens/spotify.ts`
4. Crear `themes/index.ts`
5. Testing: base y spotify funcionan

### Sprint 2 (1 día): Context & Hook
6. Actualizar `providers/ThemeProvider.tsx`
7. Crear `hooks/useTheme.ts`
8. Actualizar exports
9. Testing: cambio de template funciona

### Sprint 3 (2-3 días): Templates Restantes
10. Implementar 6 templates restantes
11. Actualizar `themes/index.ts`
12. Testing: todos los templates funcionan

### Sprint 4 (1 día): UI & Polish
13. Crear ThemeSwitcher en dashboard
14. Agregar persistencia localStorage
15. Testing final completo
16. Documentación

**Total estimado:** 5-7 días de desarrollo

---

## ✅ Checklist Final

### Desarrollo
- [ ] Todos los archivos creados
- [ ] TypeScript compila sin errores
- [ ] Build exitoso
- [ ] Exports correctos

### Templates
- [ ] Base template funciona
- [ ] Spotify template funciona
- [ ] Facebook template funciona
- [ ] GitHub template funciona
- [ ] Slack template funciona
- [ ] Notion template funciona
- [ ] Linear template funciona
- [ ] Netflix template funciona

### Funcionalidad
- [ ] useTheme retorna template actual
- [ ] setTemplate cambia template
- [ ] Componentes responden a cambios
- [ ] localStorage persiste (opcional)
- [ ] SSR compatible

### Testing
- [ ] ThemeSwitcher UI funciona
- [ ] Todos los componentes se actualizan
- [ ] No hay errores en consola
- [ ] Performance aceptable

### Documentación
- [ ] README actualizado
- [ ] Ejemplos de código
- [ ] API reference
- [ ] Migration guide

---

**Última actualización:** 2025-10-05
**Estado:** Plan completo - Listo para implementar
