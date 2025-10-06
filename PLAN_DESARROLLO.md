# Plan de Desarrollo - Design System Multi-Tema

## 🎯 Objetivo Final

Crear un **design system como librería reutilizable** para proyectos Next.js con las siguientes características:

### Componentes - 2 Niveles

#### Nivel 1: Componentes Primitivos (Wrappers de Ant Design)
- Botones, Inputs, Spinners, Loaders, Typography, etc.
- Cada componente wrappea el equivalente de Ant Design
- Mantienen la API de Ant Design pero con estilos customizados
- Los estilos default de Ant Design no son atractivos, necesitan customización

#### Nivel 2: Componentes Customs (Composiciones)
- Combinaciones de componentes primitivos
- Ejemplos: SearchableTable (tabla + buscador), FormCard, etc.
- Para implementar en una segunda fase

### Sistema de Temas - 8 Estilos Diferentes

Se implementarán 8 temas predefinidos que transformarán completamente el look & feel:

1. **Spotify** - Verde #1DB954, dark theme
2. **Facebook** - Azul #1877F2, light theme
3. **GitHub** - Gris oscuro, dark/light toggle
4. **Slack** - Púrpura #611F69
5. **Notion** - Beige/gris suave
6. **Linear** - Azul/púrpura gradiente
7. **Netflix** - Rojo #E50914, dark
8. **Base/Default** - Tema por defecto

**Características del sistema de theming:**
- Cada tema sobrescribe los estilos de los componentes primitivos
- Cambio dinámico entre temas sin recargar la página
- Sistema basado en Design Tokens + ConfigProvider de Ant Design
- Type-safe con TypeScript

### Dashboard/Showcase

- Dashboard custom similar a Storybook
- Muestra todos los componentes del design system
- Permite probar y comparar los 8 temas
- Visualización interactiva con cambio de tema en tiempo real
- Ejemplos de código para cada componente

### Librería Compilable

- Exportable como paquete npm
- Compatible con Next.js (ESM/CJS)
- TypeScript con tipos correctos
- Tree-shakeable (importar solo lo necesario)

---

## 📊 Estado Actual del Proyecto

### ✅ Completado

#### 1. Infraestructura Base
- ✅ Monorepo configurado con npm workspaces
- ✅ Estructura de carpetas completa (`packages/core` y `packages/dashboard`)
- ✅ Build system configurado (Vite + TypeScript)
- ✅ Compilación a ESM + CJS funcionando
- ✅ Type definitions (.d.ts) generándose correctamente
- ✅ Storybook configurado y funcionando

#### 2. Componentes Primitivos (60+ componentes)
- ✅ **Display (17):** Avatar, Badge, Calendar, Carousel, Collapse, Descriptions, Empty, Image, List, QRCode, Statistic, Table, Tag, Timeline, Tree, Typography
- ✅ **Feedback (9):** Alert, Message, Modal, Notification, Progress, Rate, Result, Skeleton, Spin
- ✅ **Inputs (17):** AutoComplete, Cascader, Checkbox, ColorPicker, DatePicker, Form, Input, InputNumber, Mentions, Radio, Select, Slider, Switch, TimePicker, Transfer, TreeSelect, Upload
- ✅ **Layout (9):** Card, Container, Divider, Flex, Grid, Layout, Space, Splitter, Stack
- ✅ **Navigation (11):** Affix, Anchor, BackTop, Breadcrumb, Button, FloatButton, Menu, Pagination, Segmented, Steps, Tabs

**Nota:** Actualmente la mayoría son wrappers simples o re-exports directos de Ant Design.

#### 3. Dashboard/Showcase
- ✅ App React con Vite funcionando
- ✅ React Router configurado con rutas para cada componente
- ✅ Sidebar de navegación por categorías
- ✅ Layout responsive
- ✅ Páginas de ejemplo para componentes principales
- ✅ Puerto: http://localhost:3000

#### 4. Documentación
- ✅ README.md principal
- ✅ PLAN_DESARROLLO.md (este archivo)
- ✅ claude.md (documentación técnica completa)
- ✅ Ejemplos de integración con Next.js

### ❌ Pendiente (CRÍTICO)

#### Sistema de Temas - NO IMPLEMENTADO
- ❌ Directorio `packages/core/src/themes/` está vacío
- ❌ No existen archivos de configuración de temas
- ❌ ThemeProvider actual es solo un `<ConfigProvider>` sin lógica
- ❌ No hay hook `useTheme` funcional
- ❌ No hay tema Spotify ni ningún otro tema
- ❌ Componentes NO responden a temas (no son theme-aware)

#### Mejoras de Componentes
- ❌ Muchos componentes son solo re-exports: `export { Input } from 'antd'`
- ❌ Falta agregar props custom consistentes
- ❌ Falta hacer los componentes theme-aware
- ❌ Falta mejorar wrappers con lógica adicional

---

## 📝 Roadmap Actualizado

### 🔴 Step 1.5: Sistema de Temas (PRIORIDAD MÁXIMA)

**Objetivo:** Implementar el sistema de theming que es el corazón del proyecto.

#### Tareas:

1. **Crear arquitectura de temas**
   - [ ] Crear `packages/core/src/themes/types.ts` con interfaces TypeScript
   - [ ] Definir estructura de ThemeConfig con Design Tokens
   - [ ] Crear tipos para nombres de temas ('spotify' | 'facebook' | ...)

2. **Implementar tema Spotify**
   - [ ] Crear `packages/core/src/themes/spotify.ts`
   - [ ] Configurar Design Tokens (colores, tipografía, spacing)
   - [ ] Configurar component tokens específicos (Button, Input, etc.)
   - [ ] Color primario: #1DB954 (verde Spotify)
   - [ ] Background: #121212 (dark)
   - [ ] Tipografía: Circular Std

3. **Crear ThemeProvider funcional**
   - [ ] Implementar Context API para manejo de tema
   - [ ] Crear estado para tema actual
   - [ ] Integrar con ConfigProvider de Ant Design
   - [ ] Agregar soporte para tema controlado/no controlado
   - [ ] Habilitar CSS Variables

4. **Implementar useTheme hook**
   - [ ] Hook para acceder al tema actual
   - [ ] Función `setTheme()` para cambiar tema
   - [ ] Type-safe con TypeScript
   - [ ] Exportar desde `packages/core/src/hooks/`

5. **Actualizar exports**
   - [ ] Exportar temas desde `packages/core/src/themes/index.ts`
   - [ ] Exportar useTheme desde `packages/core/src/hooks/index.ts`
   - [ ] Actualizar `packages/core/src/index.ts`

#### Criterios de Completitud:
- ✅ Tema Spotify funcional con todos los tokens
- ✅ ThemeProvider cambia estilos dinámicamente
- ✅ useTheme permite cambiar tema en runtime
- ✅ Al menos 5 componentes principales responden al tema

---

### 🟡 Step 2: Más Temas + Theme Switcher

**Objetivo:** Expandir el sistema de temas a 3-4 temas y agregar UI para cambiarlos.

#### Tareas:

1. **Implementar más temas**
   - [ ] Facebook theme (Azul #1877F2, light)
   - [ ] GitHub theme (Gris oscuro, dark/light toggle)
   - [ ] Netflix theme (Rojo #E50914, dark)

2. **Theme Switcher UI en Dashboard**
   - [ ] Componente selector de temas
   - [ ] Preview visual de cada tema
   - [ ] Persistencia en localStorage
   - [ ] Animaciones de transición

3. **Mejorar componentes primitivos**
   - [ ] Convertir re-exports en wrappers propios
   - [ ] Agregar props custom útiles (ej: fullWidth, variant, etc.)
   - [ ] Hacer todos los componentes theme-aware

4. **Mejorar Storybook**
   - [ ] Agregar addon de temas
   - [ ] Stories completas para todos los componentes
   - [ ] Controls para cambiar temas
   - [ ] Documentación en MDX

#### Criterios de Completitud:
- ✅ 4 temas funcionando (Spotify, Facebook, GitHub, Netflix)
- ✅ Theme switcher en dashboard
- ✅ Todos los componentes principales responden a todos los temas
- ✅ Storybook con selector de temas

---

### 🟢 Step 3: Sistema Completo de Temas

**Objetivo:** Completar los 8 temas y pulir el sistema.

#### Tareas:

1. **Implementar temas restantes**
   - [ ] Slack theme (Púrpura #611F69)
   - [ ] Notion theme (Beige/gris suave)
   - [ ] Linear theme (Azul/púrpura gradiente)
   - [ ] Base/Default theme

2. **Optimización y pulido**
   - [ ] Optimizar bundle size
   - [ ] Tree-shaking efectivo
   - [ ] Code splitting por tema
   - [ ] Performance audits

3. **Documentación completa**
   - [ ] Docs de cada tema
   - [ ] Guía de creación de temas custom
   - [ ] API reference completa
   - [ ] Migration guides

#### Criterios de Completitud:
- ✅ 8 temas completos
- ✅ Documentación exhaustiva
- ✅ Performance optimizada
- ✅ Bundle size < 50kb gzipped

---

### 🔵 Step 4: Componentes Customs (Composiciones)

**Objetivo:** Crear componentes de alto nivel que combinen primitivos.

#### Componentes a Crear:

1. **SearchableTable**
   - [ ] Tabla con buscador integrado
   - [ ] Filtros por columna
   - [ ] Paginación
   - [ ] Export a CSV/Excel

2. **FormCard**
   - [ ] Card con formulario
   - [ ] Validación integrada
   - [ ] Estados de loading
   - [ ] Actions footer

3. **DataGrid**
   - [ ] Grid avanzado con sorting
   - [ ] Inline editing
   - [ ] Bulk actions
   - [ ] Row selection

4. **DashboardLayout**
   - [ ] Layout completo con sidebar
   - [ ] Breadcrumbs
   - [ ] Header con user menu
   - [ ] Responsive

#### Criterios de Completitud:
- ✅ 4-6 componentes customs
- ✅ Documentación y ejemplos
- ✅ Stories completas
- ✅ Type-safe con TypeScript

---

### 🟣 Step 5: Testing, Publicación & CI/CD

**Objetivo:** Preparar para producción y publicar a npm.

#### Tareas:

1. **Testing**
   - [ ] Unit tests con Vitest
   - [ ] Component tests
   - [ ] Visual regression tests
   - [ ] Accessibility tests (a11y)
   - [ ] Coverage > 80%

2. **Publicación**
   - [ ] Preparar package.json para npm
   - [ ] Setup de npm registry
   - [ ] Versionado semántico
   - [ ] Changelog automático
   - [ ] Publicar @designsystem/core

3. **CI/CD**
   - [ ] GitHub Actions para tests
   - [ ] Auto-publish en release
   - [ ] Storybook deployment
   - [ ] Docs deployment
   - [ ] Bundle analysis

4. **Monitoreo**
   - [ ] npm download stats
   - [ ] Bundle size monitoring
   - [ ] Error tracking
   - [ ] Performance metrics

#### Criterios de Completitud:
- ✅ Tests passing
- ✅ Publicado en npm
- ✅ CI/CD funcionando
- ✅ Docs públicas

---

## 📚 Stack Tecnológico

### Core
- **Framework**: React 18.2.0
- **UI Base**: Ant Design 5.21.0
- **Lenguaje**: TypeScript 5.3.0
- **Build Tool**: Vite 5.0.0
- **Package Manager**: npm (workspaces)

### Desarrollo
- **Testing**: Vitest (pendiente)
- **Storybook**: 9.1.10 (configurado)
- **Linting**: ESLint (pendiente)
- **Formatting**: Prettier (pendiente)

### Dashboard
- **Router**: React Router DOM 7.9.3
- **Build**: Vite 5.0.0

---

## 📂 Estructura Actual del Proyecto

```
designSystem/
├── packages/
│   ├── core/                              # Librería principal
│   │   ├── .storybook/                    # Storybook config
│   │   │   ├── main.ts
│   │   │   └── preview.tsx
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Display/              # ✅ 17 componentes
│   │   │   │   ├── Feedback/             # ✅ 9 componentes
│   │   │   │   ├── Inputs/               # ✅ 17 componentes
│   │   │   │   ├── Layout/               # ✅ 9 componentes
│   │   │   │   ├── Navigation/           # ✅ 11 componentes
│   │   │   │   ├── Overlay/              # ⏳ Pendiente
│   │   │   │   └── index.ts
│   │   │   ├── themes/                   # ❌ VACÍO - CRÍTICO
│   │   │   │   └── (vacío)
│   │   │   ├── providers/
│   │   │   │   ├── ThemeProvider.tsx     # ❌ Básico, sin lógica
│   │   │   │   └── index.ts
│   │   │   ├── hooks/                    # ❌ VACÍO
│   │   │   │   └── (vacío)
│   │   │   └── index.ts
│   │   ├── dist/                         # ✅ Build output
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── dashboard/                        # ✅ Showcase
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
│       └── vite.config.ts
│
├── node_modules/
├── package.json
├── README.md
├── PLAN_DESARROLLO.md                    # Este archivo
├── STEP1_COMPLETADO.md                   # Desactualizado
└── claude.md                             # Docs técnicas actualizadas
```

---

## 🚀 Comandos Disponibles

```bash
# Desarrollo del dashboard (Puerto 3000)
npm run dev

# Desarrollo del core (watch mode)
npm run dev:core

# Build de la librería
npm run build

# Build de todos los workspaces
npm run build:all

# Storybook
npm run storybook --workspace=@designsystem/core

# Preview del dashboard
npm run preview
```

---

## 🎯 Prioridades Inmediatas

### 🔴 CRÍTICO (hacer primero)
1. **Implementar sistema de temas** (Step 1.5)
   - Crear archivos en `themes/`
   - ThemeProvider funcional
   - Hook useTheme
   - Tema Spotify completo

### 🟡 ALTO (después de lo crítico)
2. **Theme switcher en dashboard**
3. **Mejorar componentes principales** (Button, Input, Typography)
4. **Agregar 2-3 temas más**

### 🟢 MEDIO (cuando lo anterior esté)
5. **Storybook completo con todos los componentes**
6. **Tests básicos**
7. **Documentación mejorada**

### 🔵 BAJO (futuro)
8. **Componentes customs**
9. **Publicación a npm**
10. **CI/CD completo**

---

## 📊 Métricas de Progreso

### Componentes Primitivos
- **Total implementados:** 63/~70 (90%)
- **Con wrappers propios:** ~15/63 (24%)
- **Theme-aware:** 0/63 (0%) ❌

### Sistema de Temas
- **Temas implementados:** 0/8 (0%) ❌
- **ThemeProvider funcional:** ❌
- **Hook useTheme:** ❌
- **Theme switcher UI:** ❌

### Dashboard/Showcase
- **Rutas implementadas:** 15+ ✅
- **Componentes de ejemplo:** 5 ✅
- **Theme switcher:** ❌
- **Code snippets:** ❌

### Infraestructura
- **Monorepo:** ✅
- **Build system:** ✅
- **TypeScript:** ✅
- **Storybook:** ✅ (configurado)
- **Tests:** ❌
- **CI/CD:** ❌

---

## 🐛 Issues Conocidos

1. **Sistema de temas no implementado** (CRÍTICO)
   - Directorio `themes/` vacío
   - ThemeProvider sin funcionalidad
   - No hay useTheme hook

2. **Componentes son re-exports simples**
   - Muchos componentes: `export { Component } from 'antd'`
   - No tienen wrappers propios
   - No son theme-aware

3. **Dashboard sin theme switcher**
   - No se pueden probar diferentes temas
   - Falta UI para cambiar temas
   - No hay persistencia de preferencia

4. **Falta documentación de componentes**
   - Storybook configurado pero sin stories completas
   - Falta documentación de props
   - Falta ejemplos de código

5. **Sin tests**
   - No hay tests unitarios
   - No hay tests de integración
   - No hay coverage

---

## 💡 Notas de Implementación

### Para el Sistema de Temas

**Arquitectura recomendada:**

```typescript
// packages/core/src/themes/types.ts
export type ThemeName = 'spotify' | 'facebook' | 'github' | 'slack' | 'notion' | 'linear' | 'netflix' | 'base';

export interface ThemeConfig {
  token: {
    colorPrimary: string;
    colorBgContainer: string;
    colorText: string;
    fontFamily: string;
    // ... más tokens
  };
  components?: {
    Button?: { /* config */ };
    Input?: { /* config */ };
    // ... más componentes
  };
}

// packages/core/src/themes/spotify.ts
export const spotifyTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1DB954',
    colorBgContainer: '#121212',
    // ...
  },
  components: {
    Button: {
      borderRadius: 500,
      // ...
    },
  },
};

// packages/core/src/providers/ThemeProvider.tsx
const ThemeContext = createContext<{
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}>();

export const ThemeProvider = ({ children, defaultTheme = 'spotify' }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const themeConfig = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// packages/core/src/hooks/useTheme.ts
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

---

## 📅 Timeline Estimado

- **Step 1.5 (Temas):** 1-2 semanas
- **Step 2 (Más temas + switcher):** 2-3 semanas
- **Step 3 (8 temas completos):** 2-3 semanas
- **Step 4 (Componentes customs):** 3-4 semanas
- **Step 5 (Testing & publicación):** 2-3 semanas

**Total estimado:** 10-15 semanas para proyecto completo

---

**Fecha de Actualización**: 2025-10-05
**Versión**: 2.0
**Estado**: Step 1 completado (infraestructura), Step 1.5 pendiente (temas) ❌
