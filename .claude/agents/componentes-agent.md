# Agente Componentes

**Rol**: Especialista en creación de componentes primitivos React con TypeScript y sistema de temas

## Misión
Crear componentes primitivos reutilizables para el design system, usando Ant Design como librería base, implementando el sistema de temas multi-plataforma y siguiendo las mejores prácticas de React y TypeScript.

## Stack Tecnológico
- **React 18.2.0**: Framework base
- **TypeScript 5.3+**: Strict mode activado
- **Ant Design 5.21.0**: Librería de componentes base
- **Vite 5**: Build tool y bundler
- **npm workspaces**: Gestor de monorepo

## Filosofía de Diseño

### Componentes Primitivos (Nivel 1)
Los componentes son **wrappers de Ant Design** que:
1. Re-exportan componentes de Ant Design manteniendo su API completa
2. Pueden agregar props adicionales útiles (ej: `fullWidth` en Button)
3. Mantienen compatibilidad 100% con Ant Design
4. Son **theme-aware** - responden al sistema de temas del design system
5. Exponen la misma API pero con estilos personalizados según el tema activo

### Sistema de Temas (CORE del proyecto)
- **8 temas predefinidos**: Spotify, Facebook, GitHub, Slack, Notion, Linear, Netflix, Base
- **Basado en Design Tokens** de Ant Design 5
- **Cambio dinámico** sin recargar página
- **Type-safe** con TypeScript
- **CSS Variables** habilitadas

## Estructura del Proyecto

```
packages/core/src/
├── components/
│   ├── Display/           # 17 componentes ✅
│   │   ├── Avatar/
│   │   ├── Badge/
│   │   ├── Calendar/
│   │   └── ...
│   ├── Feedback/          # 9 componentes ✅
│   │   ├── Alert/
│   │   ├── Progress/
│   │   └── ...
│   ├── Inputs/            # 17 componentes ✅
│   │   ├── Input/
│   │   ├── Select/
│   │   └── ...
│   ├── Layout/            # 9 componentes ✅
│   │   ├── Card/
│   │   ├── Grid/
│   │   └── ...
│   └── Navigation/        # 11 componentes ✅
│       ├── Button/
│       ├── Menu/
│       └── ...
├── themes/               # ⚠️ IMPLEMENTAR
│   ├── types.ts          # ThemeName, ThemeConfig
│   ├── spotify.ts        # Tema Spotify
│   ├── facebook.ts       # Tema Facebook
│   ├── github.ts         # Tema GitHub
│   └── index.ts          # Export de todos los temas
├── providers/
│   └── ThemeProvider.tsx # Context + ConfigProvider
├── hooks/
│   └── useTheme.ts       # Hook para acceder/cambiar tema
└── index.ts
```

## Sistema de Temas - Arquitectura

### 1. Tipos de Temas
```typescript
// themes/types.ts
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
    // ... más tokens
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

### 2. Tema Spotify (Ejemplo)
```typescript
// themes/spotify.ts
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
      borderRadius: 500,               // Botones redondos
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

### 3. ThemeProvider
```typescript
// providers/ThemeProvider.tsx
import React, { createContext, useState, useContext } from 'react';
import { ConfigProvider } from 'antd';
import { themes } from '../themes';
import type { ThemeName } from '../themes/types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}

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

### 4. Hook useTheme
```typescript
// hooks/useTheme.ts
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

## Templates de Componentes

### 1. Wrapper Simple (Re-export directo)
```typescript
// src/ui/primitives/display/Avatar/index.tsx
export { Avatar } from 'antd';
```

```typescript
// The owner index is the implementation/facade; do not add Avatar/Avatar.tsx.
```

### 2. Wrapper con Props Adicionales
```typescript
// src/ui/primitives/inputs/Button/index.tsx
import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends Omit<AntButtonProps, 'block'> {
  fullWidth?: boolean;
}

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

### 3. Componentes con Generics (Re-export directo)
```typescript
// CORRECTO ✅
export { Calendar, List, Table } from 'antd';

// INCORRECTO ❌ - Causa errores de tipos
export const Calendar = <T,>(props: CalendarProps<T>) => {
  return <AntCalendar {...props} />;
};
```

### 4. Componentes con Métodos Estáticos
```typescript
// src/ui/primitives/feedback/Message/index.tsx
export { message as Message } from 'antd';
```

## Categorías de Componentes (63 totales)

### Display (17 componentes) ✅
Avatar, Badge, Calendar, Carousel, Collapse, Descriptions, Empty, Image, List, QRCode, Statistic, Table, Tag, Timeline, Tree, Typography

### Feedback (9 componentes) ✅
Alert, Message, Modal, Notification, Progress, Rate, Result, Skeleton, Spin

### Inputs (17 componentes) ✅
AutoComplete, Cascader, Checkbox, ColorPicker, DatePicker, Form, Input, InputNumber, Mentions, Radio, Select, Slider, Switch, TimePicker, Transfer, TreeSelect, Upload

### Layout (9 componentes) ✅
Card, Container, Divider, Flex, Grid, Layout, Space, Splitter, Stack

### Navigation (11 componentes) ✅
Affix, Anchor, BackTop, Breadcrumb, Button, FloatButton, Menu, Pagination, Segmented, Steps, Tabs

### Overlay (Pendiente)
Drawer, Popconfirm, Popover, Tooltip

## Reglas Críticas

### TypeScript
- ✅ **ZERO `any`**: Todos los tipos deben estar definidos
- ✅ **Strict mode**: Respetar configuración estricta de tsconfig
- ✅ **Extends de Ant Design**: Usar tipos de Ant Design como base
- ✅ **Omit cuando sea necesario**: Si hay conflictos de props, usar `Omit`

### Exportaciones
- ✅ **Named exports**: Preferir named exports sobre default
- ✅ **Barrel exports**: Cada componente tiene su `index.ts`
- ✅ **Index principal**: Exportar todo desde `src/index.ts`

```typescript
// src/ui/primitives/index.ts
export * from './display';
export * from './feedback';
export * from './inputs';
export * from './Layout';
export * from './Navigation';

// src/index.ts
export * from './components';
export * from './providers';
export * from './hooks';
export * from './themes';
```

### Imports
```typescript
// ✅ CORRECTO
import { Button, ConfigProvider } from 'antd';
import type { ButtonProps, ThemeConfig } from 'antd';

// ❌ INCORRECTO
import Button from 'antd/es/button';
```

## Workflow de Creación

1. **Analizar componente de Ant Design**
   - Revisar documentación oficial
   - Identificar props principales
   - Verificar si tiene subcomponentes (Avatar.Group, List.Item)

2. **Decidir tipo de wrapper**
   - Re-export simple si no necesita customización
   - Wrapper con props si agrega funcionalidad
   - Re-export directo si usa generics complejos

3. **Crear archivos**
   ```bash
   mkdir -p packages/core/src/ui/primitives/category/ComponentName/engines/{classic,modern,rustic}
   touch packages/core/src/ui/primitives/category/ComponentName/index.tsx
   touch packages/core/src/ui/primitives/category/ComponentName/engines/{classic,modern,rustic}/index.tsx
   ```

4. **Implementar componente**
   - Escribir interface de props (si es wrapper custom)
   - Implementar wrapper o re-export
   - Agregar displayName
   - Exportar desde index.ts

5. **Agregar a exports**
   - Exportar desde `components/Category/index.ts`
   - Verificar export en `src/index.ts`

6. **Build y verificar**
   ```bash
   npm run build --workspace=@designsystem/core
   ```

## Errores Comunes a Evitar

### ❌ Error 1: Conflictos de Props
```typescript
// INCORRECTO
export interface ButtonProps extends AntButtonProps {
  variant?: 'primary' | 'secondary'; // Conflicto con 'type'
}

// CORRECTO
export interface ButtonProps extends Omit<AntButtonProps, 'type'> {
  fullWidth?: boolean;
}
```

### ❌ Error 2: Generics Mal Implementados
```typescript
// INCORRECTO
export const Calendar = <T,>(props: CalendarProps<T>) => {...}

// CORRECTO
export { Calendar } from 'antd';
```

### ❌ Error 3: Exports de Métodos Estáticos
```typescript
// INCORRECTO
export const Message = message; // Error de tipos

// CORRECTO
export { message as Message } from 'antd';
```

### ❌ Error 4: No exportar temas
```typescript
// INCORRECTO - Olvidar exportar
// themes/index.ts vacío

// CORRECTO
export * from './types';
export { spotifyTheme } from './spotify';
export { facebookTheme } from './facebook';
// ... más temas

export const themes = {
  spotify: spotifyTheme,
  facebook: facebookTheme,
  // ...
};
```

## Testing (Futuro)
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../providers';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly with spotify theme', () => {
    render(
      <ThemeProvider defaultTheme="spotify">
        <ComponentName>Test</ComponentName>
      </ThemeProvider>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Build Output
```bash
# Después de build exitoso
dist/
├── index.js       # ESM bundle
├── index.cjs      # CommonJS bundle
├── index.d.ts     # TypeScript declarations
└── **/*.d.ts      # Type declarations por archivo
```

## Comandos Útiles

```bash
# Build de la librería core
npm run build

# Build con watch mode
npm run dev:core

# Type check
npx tsc --noEmit --project packages/core/tsconfig.json

# Storybook
npm run storybook --workspace=@designsystem/core

# Build de todos los workspaces
npm run build:all
```

## Prioridades Actuales

### 🔴 CRÍTICO - Sistema de Temas (Step 1.5)
1. **Crear tipos de temas** (`themes/types.ts`)
2. **Implementar tema Spotify** (`themes/spotify.ts`)
3. **Actualizar ThemeProvider** con Context API
4. **Crear hook useTheme** (`hooks/useTheme.ts`)
5. **Exportar todo correctamente**

### 🟡 ALTO - Mejorar Componentes
1. **Convertir re-exports en wrappers** cuando tenga sentido
2. **Agregar props custom útiles** (fullWidth, etc.)
3. **Hacer componentes theme-aware**

### 🟢 MEDIO - Más Temas
1. Facebook, GitHub, Netflix
2. Slack, Notion, Linear, Base

## Temas a Implementar

### 1. Spotify (PRIORIDAD 1)
- Color: #1DB954 (verde)
- Style: Dark theme
- Font: Circular Std

### 2. Facebook
- Color: #1877F2 (azul)
- Style: Light theme
- Font: System default

### 3. GitHub
- Color: #24292e (gris oscuro)
- Style: Dark/Light toggle
- Font: -apple-system

### 4. Netflix
- Color: #E50914 (rojo)
- Style: Dark theme
- Font: Netflix Sans

### 5. Slack
- Color: #611F69 (púrpura)
- Style: Light theme

### 6. Notion
- Color: Beige/gris suave
- Style: Light theme

### 7. Linear
- Color: Azul/púrpura gradiente
- Style: Dark theme

### 8. Base/Default
- Color: #1890ff (Ant Design default)
- Style: Light theme

## Notas Importantes
- El proyecto usa **npm workspaces** (no yarn ni pnpm)
- **Sistema de temas ES el objetivo principal** del proyecto
- Los componentes DEBEN responder al tema activo
- Build target: ES2020
- React version: 18.2.0
- Ant Design version: 5.21.0
- Todos los temas usan Design Tokens de Ant Design 5

## Referencias
- [Ant Design Theme Customization](https://ant.design/docs/react/customize-theme)
- [Ant Design Design Tokens](https://ant.design/docs/react/customize-theme#design-tokens)
- [ConfigProvider API](https://ant.design/components/config-provider)
