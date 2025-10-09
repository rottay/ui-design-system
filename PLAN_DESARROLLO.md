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
- ✅ Compilación a ESM + CJS funcionando (53.76 kB ESM, 37.24 kB CJS)
- ✅ Type definitions (.d.ts) generándose correctamente
- ✅ Storybook configurado y funcionando

#### 2. Componentes Primitivos (63 componentes)
- ✅ **Display (17):** Avatar, Badge, Calendar, Carousel, Collapse, Descriptions, Empty, Image, List, QRCode, Statistic, Table, Tag, Timeline, Tree, Typography
- ✅ **Feedback (9):** Alert, Message, Modal, Notification, Progress, Rate, Result, Skeleton, Spin
- ✅ **Inputs (17):** AutoComplete, Cascader, Checkbox, ColorPicker, DatePicker, Form, Input, InputNumber, Mentions, Radio, Select, Slider, Switch, TimePicker, Transfer, TreeSelect, Upload
- ✅ **Layout (9):** Card, Container, Divider, Flex, Grid, Layout, Space, Splitter, Stack
- ✅ **Navigation (11):** Affix, Anchor, BackTop, Breadcrumb, Button, FloatButton, Menu, Pagination, Segmented, Steps, Tabs

**Nota:** Actualmente la mayoría son wrappers simples o re-exports directos de Ant Design que responden a temas vía ConfigProvider.

#### 3. Sistema de Temas - ✅ IMPLEMENTADO
- ✅ Directorio `packages/core/src/themes/` con 8 temas completos
- ✅ Archivos de configuración de temas (Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel, Base)
- ✅ ThemeProvider funcional con Context API
- ✅ Hook `useTheme` implementado y funcionando
- ✅ Tipos TypeScript completos (TemplateName, TemplateConfig)
- ✅ Tema Spotify completo con ~40 component tokens
- ✅ Exports actualizados y funcionando

#### 4. Dashboard/Showcase
- ✅ App React con Vite funcionando
- ✅ React Router configurado con rutas para cada componente
- ✅ Sidebar de navegación por categorías
- ✅ Layout responsive
- ✅ Páginas de ejemplo para componentes principales
- ✅ **ThemeSwitcher UI integrado**
- ✅ **Cambio de temas en tiempo real funcionando**
- ✅ Puerto: http://localhost:3001

#### 5. Documentación
- ✅ README.md principal
- ✅ PLAN_DESARROLLO.md (este archivo)
- ✅ CLAUDE.md (documentación técnica actualizada v3.0)
- ✅ Ejemplos de integración con Next.js

### 🟡 Pendiente (NO CRÍTICO)

#### Mejoras de Componentes
- ⏳ Muchos componentes son solo re-exports: `export { Input } from 'antd'`
- ⏳ Podrían beneficiarse de wrappers custom con props adicionales
- ⏳ Responden a temas pero podrían tener más customización

#### Mejoras de Temas
- ⏳ Agregar más tokens a temas existentes
- ⏳ Persistencia de tema en localStorage
- ⏳ Dark mode toggle para temas con soporte dual

---

## 📝 Roadmap Actualizado

### ✅ Step 1.5: Sistema de Temas - COMPLETADO

**Objetivo:** ~~Implementar el sistema de theming que es el corazón del proyecto.~~ **✅ COMPLETADO**

#### Tareas:

1. **Crear arquitectura de temas** ✅
   - [x] Crear `packages/core/src/themes/types.ts` con interfaces TypeScript
   - [x] Definir estructura de ThemeConfig con Design Tokens
   - [x] Crear tipos para nombres de temas (TemplateName)

2. **Implementar 8 temas** ✅
   - [x] Tema Spotify completo (~40 component tokens)
   - [x] Tema Stripe
   - [x] Tema Airbnb
   - [x] Tema Slack
   - [x] Tema Notion
   - [x] Tema Linear
   - [x] Tema Vercel
   - [x] Tema Base

3. **Crear ThemeProvider funcional** ✅
   - [x] Implementar Context API para manejo de tema
   - [x] Crear estado para tema actual
   - [x] Integrar con ConfigProvider de Ant Design
   - [x] Exportar ThemeContext

4. **Implementar useTheme hook** ✅
   - [x] Hook para acceder al tema actual
   - [x] Función `setTemplate()` para cambiar tema
   - [x] Type-safe con TypeScript
   - [x] Error handling si se usa fuera del Provider

5. **Actualizar exports** ✅
   - [x] Exportar temas desde `packages/core/src/themes/index.ts`
   - [x] Exportar useTheme desde `packages/core/src/hooks/index.ts`
   - [x] Actualizar `packages/core/src/index.ts`

6. **ThemeSwitcher UI** ✅
   - [x] Componente ThemeSwitcher en dashboard
   - [x] Selector con 8 temas
   - [x] Integrado en Sidebar

7. **Build y Testing** ✅
   - [x] Build exitoso (53.76 kB ESM, 37.24 kB CJS)
   - [x] Dashboard corriendo en http://localhost:3001
   - [x] Cambio de temas funcionando en tiempo real

#### Criterios de Completitud: ✅ TODOS CUMPLIDOS
- ✅ 8 Temas funcionales
- ✅ ThemeProvider cambia estilos dinámicamente
- ✅ useTheme permite cambiar tema en runtime
- ✅ Todos los componentes responden a temas vía ConfigProvider

**Fecha de Completitud:** 2025-10-09

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

### 🔵 Step 4: Componentes Avanzados & Utilidades

**Objetivo:** Expandir el design system con componentes compuestos, hooks, tokens y utilidades.

#### 4.1 Componentes Compuestos/Patterns (Nivel 2)

**Componentes de Datos:**
1. **DataTable**
   - [ ] Tabla con buscador integrado
   - [ ] Filtros por columna
   - [ ] Paginación avanzada
   - [ ] Export a CSV/Excel
   - [ ] Sorting multi-columna
   - [ ] Inline editing

2. **FormBuilder**
   - [ ] Constructor de formularios dinámicos
   - [ ] Validación integrada (Zod/Yup)
   - [ ] Estados de loading/error/success
   - [ ] Multi-step forms
   - [ ] Auto-save draft

**Componentes de Layout:**
3. **PageHeader**
   - [ ] Breadcrumbs integrados
   - [ ] Title + subtitle
   - [ ] Action buttons area
   - [ ] Tabs support
   - [ ] Back button

4. **DashboardLayout**
   - [ ] Layout completo con sidebar
   - [ ] Header con user menu
   - [ ] Responsive (mobile drawer)
   - [ ] Breadcrumbs automáticos
   - [ ] Footer configurable

5. **AuthLayout**
   - [ ] Login/Signup pre-construidos
   - [ ] Reset password flow
   - [ ] Social login buttons
   - [ ] Ilustraciones/background
   - [ ] Responsive

**Componentes de Feedback:**
6. **EmptyState**
   - [ ] Ilustraciones predefinidas
   - [ ] Multiple variants (no-data, error, search, etc.)
   - [ ] CTAs integrados
   - [ ] Customizable

7. **DashboardCard**
   - [ ] Card con estadísticas
   - [ ] Gráficos integrados (opcional)
   - [ ] Trend indicators
   - [ ] Loading states

8. **SearchableSelect**
   - [ ] Select con búsqueda optimizada
   - [ ] Infinite scroll
   - [ ] Multi-select avanzado
   - [ ] Tags custom

#### 4.2 Hooks Utilitarios

**Performance Hooks:**
- [ ] `useDebounce(value, delay)` - Debouncing de valores
- [ ] `useThrottle(callback, delay)` - Throttling de funciones
- [ ] `useMemoCompare(value, compare)` - Memoización con comparador custom

**UI Hooks:**
- [ ] `useMediaQuery(query)` - Responsive breakpoints
- [ ] `useClickOutside(ref, callback)` - Detectar clicks fuera
- [ ] `useToggle(initialValue)` - Toggle de estados booleanos
- [ ] `useHover(ref)` - Detectar hover
- [ ] `useFocus(ref)` - Detectar focus
- [ ] `useWindowSize()` - Dimensiones de ventana

**Storage Hooks:**
- [ ] `useLocalStorage(key, initialValue)` - Persistencia local
- [ ] `useSessionStorage(key, initialValue)` - Persistencia de sesión
- [ ] `useCookie(key, initialValue)` - Manejo de cookies

**Utility Hooks:**
- [ ] `useClipboard()` - Copy/paste
- [ ] `usePrevious(value)` - Valor anterior de state
- [ ] `useUpdateEffect(effect, deps)` - Effect solo en updates
- [ ] `useDebugValue(value, formatter)` - Debug en DevTools
- [ ] `useIsomorphicLayoutEffect()` - SSR-safe layoutEffect

#### 4.3 Design Tokens como Constantes

**Tokens de Color:**
```typescript
// packages/core/src/tokens/colors.ts
- [ ] Colors primarios por tema
- [ ] Colors semánticos (success, error, warning, info)
- [ ] Neutral palette (50-900)
- [ ] Alpha variants
```

**Tokens de Espaciado:**
```typescript
// packages/core/src/tokens/spacing.ts
- [ ] Spacing scale (xs, sm, md, lg, xl, 2xl, etc.)
- [ ] Padding utilities
- [ ] Margin utilities
- [ ] Gap utilities
```

**Tokens de Tipografía:**
```typescript
// packages/core/src/tokens/typography.ts
- [ ] Font families por tema
- [ ] Font sizes (xs - 5xl)
- [ ] Line heights
- [ ] Font weights (light, regular, medium, bold, etc.)
- [ ] Letter spacing
```

**Otros Tokens:**
```typescript
- [ ] Border radius scale
- [ ] Shadows (elevation system)
- [ ] Z-index scale
- [ ] Breakpoints
- [ ] Transitions/durations
```

#### 4.4 Sistema de Iconos

- [ ] Elegir librería base (Lucide, Heroicons, Phosphor, o custom)
- [ ] Wrapper component `<Icon>` con sizing consistente
- [ ] Sizing presets (xs, sm, md, lg, xl)
- [ ] Color inheritance
- [ ] Loading/spin states
- [ ] Exportar iconos más comunes

#### 4.5 Animaciones/Transiciones

**Framer Motion Integration (opcional):**
- [ ] Transition presets por tema
- [ ] Fade, Slide, Scale variants
- [ ] Stagger animations
- [ ] Page transitions
- [ ] Loading states animados
- [ ] Skeleton loaders personalizados por tema

**CSS Animations:**
- [ ] Keyframes básicos
- [ ] Easing curves
- [ ] Duration constants

#### 4.6 Utilidades de Accesibilidad

**Componentes A11y:**
- [ ] `<VisuallyHidden>` - Ocultar visualmente pero mantener para SR
- [ ] `<FocusTrap>` - Trap de focus para modals
- [ ] `<KeyboardShortcuts>` - Gestor de atajos
- [ ] `<ScreenReaderOnly>` - Contenido solo para SR
- [ ] `<SkipLink>` - Links de navegación rápida

**Hooks A11y:**
- [ ] `useA11yAnnouncement(message)` - Live regions
- [ ] `useFocusManagement()` - Gestión de focus
- [ ] `useAriaLabel()` - ARIA labels dinámicos

#### 4.7 CSS Utilities/Helpers

**ClassName Utilities:**
- [ ] `cn()` / `clsx()` utility - Merge classNames
- [ ] Conditional className helper
- [ ] Variant composer

**Responsive Utilities:**
- [ ] Responsive visibility helpers
- [ ] Display utilities (hide-on-mobile, etc.)
- [ ] Spacing responsive utilities

**Flex/Grid Shortcuts:**
- [ ] `<FlexCenter>`, `<FlexBetween>`, etc.
- [ ] Quick grid layouts
- [ ] Container queries (cuando estén disponibles)

#### 4.8 Layout Patterns

**Pre-built Layouts:**
- [ ] `<PageLayout>` - Header + Sidebar + Content + Footer
- [ ] `<DashboardLayout>` - Dashboard típico
- [ ] `<AuthLayout>` - Login/Signup pages
- [ ] `<LandingLayout>` - Landing pages
- [ ] `<Container>` - Content container con max-width
- [ ] `<Section>` - Section wrapper con spacing

#### 4.9 Testing Utilities

**Test Helpers:**
- [ ] `renderWithTheme(component, theme)` - Render con provider
- [ ] `mockThemeContext()` - Mock del theme context
- [ ] Mock data generators
- [ ] Factory functions para componentes

**Testing Setup:**
- [ ] Custom render function
- [ ] Provider wrappers
- [ ] Mock theme config
- [ ] Testing utilities export

#### Criterios de Completitud:
- ✅ 8-10 componentes compuestos funcionando
- ✅ 15+ hooks utilitarios
- ✅ Design Tokens exportados
- ✅ Sistema de iconos integrado
- ✅ Animaciones básicas
- ✅ Utilidades A11y
- ✅ CSS utilities
- ✅ 4+ layout patterns
- ✅ Testing utilities completos
- ✅ Documentación exhaustiva de todo
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
5. **Design Tokens exportables** (colors, spacing, typography)

### 🟢 MEDIO (cuando lo anterior esté)
6. **Storybook completo con todos los componentes**
7. **Hooks utilitarios básicos** (useMediaQuery, useLocalStorage, useDebounce)
8. **Sistema de iconos** (elegir e integrar librería)
9. **Tests básicos**
10. **Documentación mejorada**

### 🔵 BAJO (futuro cercano)
11. **Componentes compuestos** (DataTable, FormBuilder, PageHeader)
12. **Layout patterns** (PageLayout, DashboardLayout, AuthLayout)
13. **Animaciones y transiciones**
14. **Utilidades de accesibilidad**

### ⚪ MUY BAJO (futuro lejano)
15. **Testing utilities completos**
16. **Publicación a npm**
17. **CI/CD completo**

---

## 📊 Métricas de Progreso

### Componentes Primitivos
- **Total implementados:** 63/~70 (90%)
- **Con wrappers propios:** ~15/63 (24%)
- **Theme-aware:** 0/63 (0%) ❌

### Sistema de Temas
- **Temas implementados:** 8/8 (100%) ✅
- **ThemeProvider funcional:** ✅
- **Hook useTheme:** ✅
- **Theme switcher UI:** ✅

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

## 📦 Resumen de Elementos del Design System

### ✅ Ya Implementado
1. **63 Componentes Primitivos** (wrappers de Ant Design)
2. **Infraestructura** (monorepo, build, TypeScript)
3. **Dashboard básico** (showcase sin theme switcher)
4. **Storybook configurado**

### 🔴 Elementos Críticos Pendientes
1. **Sistema de Temas** (8 temas: Spotify, Facebook, GitHub, etc.)
2. **ThemeProvider funcional** con Context API
3. **Hook useTheme** para cambio dinámico
4. **Theme switcher UI** en dashboard

### 🟡 Elementos Importantes a Agregar
5. **Design Tokens exportables**
   - Colors, spacing, typography, shadows, etc.
   - Consumibles independientemente de componentes

6. **Hooks Utilitarios** (15+ hooks)
   - Performance: useDebounce, useThrottle
   - UI: useMediaQuery, useToggle, useClickOutside
   - Storage: useLocalStorage, useSessionStorage
   - Utilities: useClipboard, usePrevious

7. **Sistema de Iconos**
   - Wrapper de Lucide/Heroicons/Phosphor
   - Sizing y theming consistente

### 🟢 Componentes Compuestos (Nivel 2)
8. **DataTable** - Tabla completa con búsqueda, filtros, export
9. **FormBuilder** - Constructor de forms con validación
10. **PageHeader** - Header con breadcrumbs y actions
11. **DashboardLayout** - Layout completo pre-construido
12. **AuthLayout** - Login/Signup pre-construidos
13. **EmptyState** - Estados vacíos con ilustraciones
14. **DashboardCard** - Cards con estadísticas
15. **SearchableSelect** - Select avanzado

### 🔵 Funcionalidades Avanzadas
16. **Animaciones/Transiciones**
    - Framer Motion integration (opcional)
    - Transition presets por tema

17. **Utilidades de Accesibilidad**
    - VisuallyHidden, FocusTrap, SkipLink
    - Hooks A11y

18. **CSS Utilities**
    - className utilities (clsx/cn)
    - Responsive helpers
    - Flex/Grid shortcuts

19. **Layout Patterns**
    - PageLayout, Container, Section
    - Pre-built layouts

20. **Testing Utilities**
    - renderWithTheme
    - Mock generators
    - Custom test helpers

### 📊 Total de Elementos
- **Componentes Primitivos:** 63 (implementados)
- **Componentes Compuestos:** 8+ (pendiente)
- **Hooks Utilitarios:** 15+ (pendiente)
- **Temas:** 8 (pendiente)
- **Design Tokens:** Completo (pendiente)
- **Sistema de Iconos:** 1 (pendiente)
- **Utilidades A11y:** 5+ componentes + hooks (pendiente)
- **CSS/Layout Utilities:** Múltiples (pendiente)
- **Testing Utilities:** Suite completa (pendiente)

---

## 📅 Timeline Estimado Actualizado

### Fase 1: Core (6-8 semanas)
- **Step 1.5 (Sistema de Temas):** 1-2 semanas
- **Step 2 (4 temas + switcher):** 2-3 semanas
- **Step 3 (8 temas + tokens):** 2-3 semanas

### Fase 2: Extensiones (8-10 semanas)
- **Step 4.1 (Hooks utilitarios):** 1-2 semanas
- **Step 4.2 (Sistema de iconos + animaciones):** 1-2 semanas
- **Step 4.3 (Componentes compuestos):** 3-4 semanas
- **Step 4.4 (Utilidades A11y + CSS):** 2 semanas

### Fase 3: Producción (3-4 semanas)
- **Step 5 (Testing completo):** 1-2 semanas
- **Step 5 (Documentación + publicación):** 1 semana
- **Step 5 (CI/CD):** 1 semana

**Total estimado:** 17-22 semanas (~4-5 meses) para proyecto completo con todas las funcionalidades

---

**Fecha de Actualización**: 2025-10-09
**Versión**: 3.1
**Estado**: Step 1 completado (infraestructura) ✅, Step 1.5 completado (temas) ✅
**Nota**: Versión 3.1 - Sistema de temas completamente funcional con 8 temas, ThemeProvider, useTheme hook y ThemeSwitcher UI. Roadmap expandido con hooks, tokens, componentes compuestos, utilidades A11y, sistema de iconos, animaciones y testing utilities.
