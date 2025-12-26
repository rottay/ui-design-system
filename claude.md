# Design System - Documentación para Claude AI

## Información General

**Nombre:** Rottay Design System
**Versión:** 0.3.0
**Estado:** En desarrollo activo (Wave 4)
**Tipo:** Librería React multi-tenant con sistema de engines

---

## Arquitectura de Engines

El sistema usa **3 engines** que renderizan los mismos componentes con diferentes librerías:

| Engine | Librería Base | Descripción |
|--------|--------------|-------------|
| **Titan** | Ant Design | Engine principal, full-featured |
| **Hermes** | DaisyUI/Tailwind | Engine ligero, utility-first |
| **Apollo** | Vanilla HTML/CSS | Engine headless, máxima accesibilidad |

### Uso de Engines

```tsx
// Engine por defecto (Titan)
<Button variant="primary">Click</Button>

// Override por componente
<Button engine="hermes" variant="primary">Click</Button>

// Override global via Provider
<EngineProvider engine="apollo">
  <App />
</EngineProvider>
```

---

## Estructura de Carpetas

```
packages/core/src/
├── components/
│   ├── primitives/           # ~76 componentes UI básicos
│   │   ├── display/          # Avatar, Badge, Card, Image, Tag, Tooltip, etc.
│   │   ├── inputs/           # Button, Input, Select, Checkbox, Form, etc.
│   │   ├── feedback/         # Alert, Modal, Toast, Progress, Skeleton, etc.
│   │   ├── layout/           # Box, Stack, Grid, Flex, Container, etc.
│   │   ├── navigation/       # Tabs, Menu, Breadcrumb, Pagination, etc.
│   │   └── overlay/          # Dropdown, Popover, Popconfirm, Tour, etc.
│   └── custom/               # Componentes compuestos (DataTable, etc.)
├── system/
│   ├── providers/            # ThemeProvider, EngineProvider, etc.
│   ├── hooks/                # useTheme, useEngine, useBreakpoints, etc.
│   └── engines/              # Factory y registry de engines
├── config/
│   ├── tenants/              # Configuración multi-tenant
│   └── themes/               # Temas y presets
├── tokens/                   # CSS variables y design tokens
├── types/                    # TypeScript definitions
└── i18n/                     # Internacionalización
```

---

## Componentes Primitivos (~76 total)

### Estructura de un Componente

```
Component/
├── types/index.ts            # Props e interfaces
├── base/index.tsx            # Componente base con CSS variables
├── compound/index.ts         # Subcomponentes (Component.Item, etc.)
├── engines/
│   ├── titan/index.tsx       # Implementación Ant Design
│   ├── hermes/index.tsx      # Implementación DaisyUI
│   ├── apollo/index.tsx      # Implementación Vanilla
│   └── index.ts              # Barrel export
└── index.ts                  # Export principal
```

### Por Categoría

**Display (17):** Avatar, Badge, Card, Image, Tag, Tooltip, Typography, Table, Calendar, List, Empty, Statistic, Carousel, Descriptions, Timeline, Tree, QRCode

**Inputs (20):** Button, Input, Select, Checkbox, Radio, Toggle, Textarea, Switch, InputNumber, Form, DatePicker, TimePicker, AutoComplete, Cascader, TreeSelect, Mentions, Transfer, ColorPicker, Slider, Upload

**Feedback (11):** Alert, Spinner, Progress, Modal, Toast, Skeleton, Drawer, Message, Notification, Result, Rate

**Layout (10):** Box, Stack, Grid, Divider, Container, Flex, Space, Layout, Splitter, Collapse

**Navigation (12):** Tabs, Breadcrumb, Pagination, Menu, Stepper, Steps, Affix, Segmented, BackTop, Anchor, FloatButton

**Overlay (6):** Modal (Overlay), Dropdown, Popover, Popconfirm, Tour, Watermark

---

## Sistema de Theming

### CSS Variables

Los componentes usan CSS variables para theming dinámico:

```tsx
// El componente usa variables CSS
const avatarStyle = {
  '--avatar-size': `var(--avatar-${size}-size)`,
  '--avatar-bg': `var(--avatar-${variant}-bg)`,
  width: 'var(--avatar-size)',
  height: 'var(--avatar-size)',
};
```

```css
/* Definidas en el theme del tenant */
:root {
  --avatar-sm-size: 32px;
  --avatar-md-size: 40px;
  --avatar-lg-size: 48px;
  --avatar-default-bg: var(--color-gray-200);
  --avatar-primary-bg: var(--color-primary-100);
}
```

### ThemeProvider

```tsx
import { ThemeProvider } from '@rottay/design-system';

<ThemeProvider
  tenant="rottay"
  theme="light"
  engine="titan"
>
  <App />
</ThemeProvider>
```

---

## Hooks Disponibles

```tsx
// Theme
const { theme, setTheme } = useTheme();

// Engine
const { engine, setEngine } = useEngineContext();

// Tenant
const { tenant, config } = useTenant();

// Responsive
const { isMobile, isTablet, isDesktop } = useBreakpoints();
const matches = useMediaQuery('(min-width: 768px)');
const value = useResponsiveValue({ base: 'sm', md: 'lg' });

// Tokens
const tokens = useTokens();
```

---

## Uso de Componentes

### Import

```tsx
import {
  Button,
  Input,
  Card,
  Avatar,
  Modal,
  Form,
  useForm,
} from '@rottay/design-system';
```

### Ejemplos

```tsx
// Button con variantes
<Button variant="primary" size="lg">Primary</Button>
<Button variant="outline" loading>Loading</Button>

// Form con validación
const [form] = useForm();
<Form form={form} onFinish={handleSubmit}>
  <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
    <Input placeholder="Email" />
  </Form.Item>
  <Button type="submit">Submit</Button>
</Form>

// Card con compound components
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>

// Avatar Group
<Avatar.Group max={3}>
  <Avatar src="/user1.jpg" />
  <Avatar src="/user2.jpg" />
  <Avatar>JD</Avatar>
</Avatar.Group>

// Modal
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </Modal.Footer>
</Modal>
```

---

## Comandos

```bash
# Desarrollo
npm run dev                    # Dashboard (puerto 3000+)
npm run storybook              # Storybook (puerto 6006)

# Build
npm run build                  # Build librería (~7.5s)

# Tests
npm test                       # Vitest tests
```

---

## Stack Tecnológico

- **React** 18.2.0
- **TypeScript** 5.3.0
- **Vite** 5.0.0 (build)
- **Ant Design** 5.21.0 (Titan engine)
- **DaisyUI** 5.3.0 (Hermes engine)
- **Tailwind CSS** 4.x
- **Vitest** + Testing Library (tests)
- **Storybook** 9.x (docs)

---

## Estado de Desarrollo

| Wave | Estado | Contenido |
|------|--------|-----------|
| Wave 0 | ✅ | CSS Tokens, Types, Icons, i18n |
| Wave 1 | ✅ | Engine Override, Error Boundary, Hooks |
| Wave 2 | ✅ | Avatar Template, Responsive hooks |
| Wave 3 | ✅ | 17 primitivos base (3 engines cada uno) |
| Wave 4 | ⏳ | Tests, Storybook, Performance |

### Build Status
- **Build:** ✅ Funciona (7.58s)
- **Tests:** ⚠️ 125/216 passing (57.8%)

---

## Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `CLAUDE.md` | Esta documentación |
| `DESIGN_SYSTEM_FINAL_REVIEW.md` | Especificaciones detalladas de arquitectura |
| `WAVE_4_PRIMITIVES.md` | Tracking de primitivos por wave |
| `README.md` | Documentación pública |

---

## Notas para Desarrollo

### Crear un nuevo componente

1. Crear estructura de carpetas siguiendo el template de Avatar
2. Definir types en `types/index.ts`
3. Implementar base en `base/index.tsx` con CSS variables
4. Implementar 3 engines: titan, hermes, apollo
5. Exportar en el index de la categoría correspondiente
6. Agregar tests y stories

### Convenciones

- Todos los componentes usan `'use client'` para Next.js
- Usar `forwardRef` para ref forwarding
- Definir `displayName` para debugging
- Props siguen el patrón: `size`, `variant`, `disabled`, `className`, `style`
- CSS variables con prefijo del componente: `--button-*`, `--avatar-*`

### Reglas de Commits

- **NUNCA** agregar `Co-Authored-By: Claude` en los commits
- **NUNCA** agregar `🤖 Generated with Claude Code` en los mensajes de commit
- Los commits deben aparecer como si fueran hechos únicamente por el desarrollador
- Usar mensajes de commit convencionales: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

---

*Última actualización: 2025-12-26*
*Versión: 0.3.0*
