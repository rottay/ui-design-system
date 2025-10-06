# Design System - Multi-Tema

Design system modular basado en Ant Design con soporte para múltiples temas. Actualmente incluye tema Spotify con componente Button.

## 📦 Instalación

### Opción 1: Link local (desarrollo)

```bash
# En el directorio del design system
cd packages/core
yarn link

# En tu proyecto Next.js
yarn link @designsystem/core
```

### Opción 2: Instalación directa (cuando esté publicado)

```bash
yarn add @designsystem/core
# o
npm install @designsystem/core
# o
pnpm add @designsystem/core
```

## 🚀 Uso en Next.js

### Setup con App Router (Next.js 13+)

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
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Setup con Pages Router (Next.js 12)

```tsx
// pages/_app.tsx
import { ThemeProvider } from '@designsystem/core';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme="spotify">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### Uso de componentes

```tsx
'use client'; // Solo si usas App Router

import { Button, useTheme } from '@designsystem/core';

export default function MyPage() {
  const { currentTheme } = useTheme();

  return (
    <div>
      <h1>Tema actual: {currentTheme}</h1>

      {/* Variantes */}
      <Button type="primary">Primary</Button>
      <Button type="default">Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="link">Link</Button>
      <Button type="text">Text</Button>

      {/* Tamaños */}
      <Button type="primary" size="large">Large</Button>
      <Button type="primary" size="middle">Middle</Button>
      <Button type="primary" size="small">Small</Button>

      {/* Estados */}
      <Button type="primary" loading>Loading</Button>
      <Button type="primary" disabled>Disabled</Button>
      <Button type="primary" danger>Danger</Button>

      {/* Full width (prop custom) */}
      <Button type="primary" fullWidth>Full Width</Button>

      {/* Con íconos */}
      <Button type="primary" icon={<PlayIcon />}>
        Play
      </Button>
    </div>
  );
}
```

## 🎨 Temas Disponibles

### Spotify (Actual)
- Color principal: `#1DB954` (Verde Spotify)
- Background: `#121212` (Dark)
- Botones redondeados estilo Spotify

**Próximamente:**
- Facebook
- GitHub
- Slack
- Notion
- Linear
- Netflix
- Base/Default

## 📚 Componentes Disponibles

### ✅ Button (Primitivo)

Wrapper del componente Button de Ant Design con tema Spotify aplicado.

**Props:**
- Todas las props de [Ant Design Button](https://ant.design/components/button)
- `fullWidth?: boolean` - Hace el botón de ancho completo

**Ejemplo:**
```tsx
<Button type="primary" fullWidth loading>
  Cargando...
</Button>
```

## 🔧 Configuración Next.js

Si usas el App Router, asegúrate de tener esta configuración en `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@designsystem/core', 'antd'],

  // Si tienes problemas con styled-components
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
```

## 🛠️ Desarrollo

### Estructura del proyecto

```
designSystem/
├── packages/
│   ├── core/              # Librería principal
│   │   ├── src/
│   │   │   ├── components/    # Componentes primitivos
│   │   │   ├── themes/        # Temas
│   │   │   ├── providers/     # ThemeProvider
│   │   │   └── hooks/         # useTheme
│   │   └── dist/          # Build output
│   └── dashboard/         # Showcase/Demo
├── package.json
└── pnpm-workspace.yaml
```

### Comandos disponibles

```bash
# Desarrollo del dashboard (showcase)
yarn dev

# Build de la librería
yarn build

# Build de todos los packages
yarn build:all

# Desarrollo del core (watch mode)
yarn dev:core

# Preview del dashboard
yarn preview
```

### Ver el showcase

```bash
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el dashboard con ejemplos del Button.

## 📖 Roadmap

### Step 1 (Actual) ✅
- [x] Setup del monorepo
- [x] Componente Button primitivo
- [x] Tema Spotify
- [x] Dashboard básico
- [x] Build & export

### Step 2 (Próximo)
- [ ] Más componentes primitivos (Input, Typography, Spinner)
- [ ] Más temas (Facebook, GitHub, Netflix)
- [ ] Mejorar dashboard con navegación

### Step 3
- [ ] Todos los primitivos necesarios
- [ ] Los 8 temas completos
- [ ] Sistema de theming dinámico mejorado

### Step 4
- [ ] Componentes customs (composiciones)
- [ ] SearchableTable
- [ ] FormCard

### Step 5
- [ ] Tests unitarios
- [ ] Publicación a npm
- [ ] CI/CD

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Ver `PLAN_DESARROLLO.md` para más detalles.

## 📄 Licencia

MIT

---

**Versión:** 0.1.0 (Step 1 - MVP)
**Última actualización:** 2025-10-03
