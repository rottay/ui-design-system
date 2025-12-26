# Wave 4 - Primitivos Faltantes

## Resumen Ejecutivo

**Total Primitivos Faltantes:** 42
**Engines a implementar:** Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
**Template de referencia:** Avatar (`/packages/core/src/components/primitives/display/Avatar/`)

---

## Estructura de Archivos por Componente

Cada primitivo debe seguir esta estructura exacta:

```
ComponentName/
├── index.ts              # Re-export del base
├── types/
│   └── index.ts          # Props, interfaces, defaults
├── base/
│   └── index.tsx         # createEngineComponent + compound
├── engines/
│   ├── index.ts          # Export engines
│   ├── titan/
│   │   └── index.tsx     # Ant Design implementation
│   ├── hermes/
│   │   └── index.tsx     # DaisyUI implementation
│   └── apollo/
│       └── index.tsx     # Vanilla HTML/CSS implementation
└── styles/
    └── index.ts          # CSS variables (opcional)
```

---

## Engines

### Titan (Ant Design)
- Import desde `antd`
- Mapear props del sistema a props de Ant Design
- Usar `ConfigProvider` para theming

### Hermes (DaisyUI/Tailwind)
- Clases de Tailwind CSS
- Clases de DaisyUI (`btn`, `card`, `badge`, etc.)
- `data-theme` para theming

### Apollo (Vanilla HTML/CSS)
- HTML semántico puro
- CSS variables para theming
- Sin dependencias externas
- Máxima accesibilidad

---

## Agentes Paralelos - Distribución

### Agent A: Display - Datos (4 componentes) 🚀 **IN PROGRESS**
| # | Componente | Categoría | Ant Design Equiv | Prioridad | Estado |
|---|------------|-----------|------------------|-----------|--------|
| 1 | **Calendar** | display | Calendar | Alta | 🔄 In Progress |
| 2 | **Table** | display | Table | Alta | 🔄 In Progress |
| 3 | **Statistic** | display | Statistic | Media | 🔄 In Progress |
| 4 | **QRCode** | display | QRCode | Baja | 🔄 In Progress |

**Path:** `src/components/primitives/display/`
**Started:** 2024-12-25

---

### Agent B: Display - Contenido (4 componentes) 🚀 **IN PROGRESS**
| # | Componente | Categoría | Ant Design Equiv | Prioridad | Estado |
|---|------------|-----------|------------------|-----------|--------|
| 1 | **List** | display | List | Alta | 🔄 In Progress |
| 2 | **Descriptions** | display | Descriptions | Media | 🔄 In Progress |
| 3 | **Timeline** | display | Timeline | Media | 🔄 In Progress |
| 4 | **Tree** | display | Tree | Media | 🔄 In Progress |

**Path:** `src/components/primitives/display/`
**Started:** 2024-12-25

---

### Agent C: Display - UI (4 componentes) 🚀 **IN PROGRESS**
| # | Componente | Categoría | Ant Design Equiv | Prioridad | Estado |
|---|------------|-----------|------------------|-----------|--------|
| 1 | **Carousel** | display | Carousel | Media | 🔄 In Progress |
| 2 | **Collapse** | display | Collapse | Alta | 🔄 In Progress |
| 3 | **Empty** | display | Empty | Alta | 🔄 In Progress |
| 4 | **Comment** | display | Comment (deprecated) | Baja | 🔄 In Progress |

**Path:** `src/components/primitives/display/`
**Started:** 2024-12-25

---

### Agent D: Feedback (4 componentes) 🚀 **IN PROGRESS**
| # | Componente | Categoría | Ant Design Equiv | Prioridad | Estado |
|---|------------|-----------|------------------|-----------|--------|
| 1 | **Message** | feedback | message | Alta | 🔄 In Progress |
| 2 | **Notification** | feedback | notification | Alta | 🔄 In Progress |
| 3 | **Result** | feedback | Result | Media | 🔄 In Progress |
| 4 | **Rate** | feedback | Rate | Media | 🔄 In Progress |

**Path:** `src/components/primitives/feedback/`
**Started:** 2024-12-25

**Nota:** Message y Notification son imperativos (API de funciones, no componentes React puros). Necesitan:
- `message.success()`, `message.error()`, etc.
- `notification.open()`, `notification.success()`, etc.
- Provider/Container para el portal

---

### Agent E: Inputs - Pickers (4 componentes)
| # | Componente | Categoría | Ant Design Equiv | Prioridad |
|---|------------|-----------|------------------|-----------|
| 1 | **DatePicker** | inputs | DatePicker | Alta |
| 2 | **TimePicker** | inputs | TimePicker | Alta |
| 3 | **ColorPicker** | inputs | ColorPicker | Media |
| 4 | **Slider** | inputs | Slider | Media |

**Path:** `src/components/primitives/inputs/`

**Nota:** DatePicker y TimePicker comparten lógica. Considerar:
- DatePicker.RangePicker
- TimePicker.RangePicker
- Locale/i18n support

---

### Agent F: Inputs - Selects (4 componentes)
| # | Componente | Categoría | Ant Design Equiv | Prioridad |
|---|------------|-----------|------------------|-----------|
| 1 | **AutoComplete** | inputs | AutoComplete | Alta |
| 2 | **Cascader** | inputs | Cascader | Media |
| 3 | **TreeSelect** | inputs | TreeSelect | Media |
| 4 | **Mentions** | inputs | Mentions | Baja |

**Path:** `src/components/primitives/inputs/`

---

### Agent G: Inputs - Forms (4 componentes)
| # | Componente | Categoría | Ant Design Equiv | Prioridad |
|---|------------|-----------|------------------|-----------|
| 1 | **Form** | inputs | Form | Alta |
| 2 | **InputNumber** | inputs | InputNumber | Alta |
| 3 | **Switch** | inputs | Switch | Alta |
| 4 | **Transfer** | inputs | Transfer | Media |

**Path:** `src/components/primitives/inputs/`

**Nota:** Form es complejo, necesita:
- Form.Item
- Form.List
- Form.ErrorList
- Form.Provider
- useForm hook

---

### Agent H: Inputs - Upload (1 componente)
| # | Componente | Categoría | Ant Design Equiv | Prioridad |
|---|------------|-----------|------------------|-----------|
| 1 | **Upload** | inputs | Upload | Alta |

**Path:** `src/components/primitives/inputs/`

**Nota:** Upload necesita:
- Upload.Dragger
- beforeUpload, customRequest
- File list management
- Progress tracking

---

### Agent I: Layout (6 componentes)
| # | Componente | Categoría | Ant Design Equiv | Prioridad |
|---|------------|-----------|------------------|-----------|
| 1 | **Container** | layout | N/A | Alta |
| 2 | **Flex** | layout | Flex | Alta |
| 3 | **Space** | layout | Space | Alta |
| 4 | **Layout** | layout | Layout | Alta |
| 5 | **Splitter** | layout | Splitter | Media |
| 6 | **Collapse** | layout | Collapse | Media |

**Path:** `src/components/primitives/layout/`

**Nota:** Layout necesita compound components:
- Layout.Header
- Layout.Sider
- Layout.Content
- Layout.Footer

---

### Agent J: Navigation (6 componentes)
| # | Componente | Categoría | Ant Design Equiv | Prioridad |
|---|------------|-----------|------------------|-----------|
| 1 | **Anchor** | navigation | Anchor | Media |
| 2 | **Affix** | navigation | Affix | Media |
| 3 | **BackTop** | navigation | BackTop (deprecated) | Baja |
| 4 | **FloatButton** | navigation | FloatButton | Media |
| 5 | **Segmented** | navigation | Segmented | Media |
| 6 | **Steps** | navigation | Steps | Alta |

**Path:** `src/components/primitives/navigation/`

**Nota:** Ya tenemos Stepper, verificar si es lo mismo que Steps.

---

### Agent K: Overlay (6 componentes)
| # | Componente | Categoría | Ant Design Equiv | Prioridad |
|---|------------|-----------|------------------|-----------|
| 1 | **Dropdown** | overlay | Dropdown | Alta |
| 2 | **Popover** | overlay | Popover | Alta |
| 3 | **Popconfirm** | overlay | Popconfirm | Media |
| 4 | **Tour** | overlay | Tour | Media |
| 5 | **Watermark** | overlay | Watermark | Baja |

**Path:** `src/components/primitives/overlay/`

**Nota:** Dropdown ya puede existir parcialmente en Menu.

---

## Template de Implementación

### 1. types/index.ts
```typescript
import type { ReactNode, CSSProperties } from 'react';
import type { BaseComponentProps, Size } from '@/types/common';
import type { EngineAwareProps } from '@/types/engine';

export type ComponentNameSize = Size;
export type ComponentNameVariant = 'default' | 'primary' | 'secondary';

export interface ComponentNameProps extends BaseComponentProps, EngineAwareProps {
  /** Size of the component */
  size?: ComponentNameSize;
  /** Visual variant */
  variant?: ComponentNameVariant;
  /** Whether component is disabled */
  disabled?: boolean;
  /** Children content */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export const COMPONENT_NAME_DEFAULTS = {
  size: 'md' as ComponentNameSize,
  variant: 'default' as ComponentNameVariant,
  disabled: false,
} as const;
```

### 2. base/index.tsx
```typescript
'use client';

import { createEngineComponent } from '@/system/engine/createEngineComponent';
import type { ComponentNameProps } from '../types';

import TitanComponentName from '../engines/titan';
import HermesComponentName from '../engines/hermes';
import ApolloComponentName from '../engines/apollo';

const ComponentNameBase = createEngineComponent<ComponentNameProps>({
  name: 'ComponentName',
  engines: {
    titan: TitanComponentName,
    hermes: HermesComponentName,
    apollo: ApolloComponentName,
  },
  defaultEngine: 'titan',
});

// If compound components needed:
// export const ComponentName = Object.assign(ComponentNameBase, {
//   SubComponent: ComponentNameSubComponent,
// });

export const ComponentName = ComponentNameBase;
export default ComponentName;
```

### 3. engines/titan/index.tsx
```typescript
/**
 * ComponentName - Titan Engine (Ant Design)
 */

'use client';

import React from 'react';
import { ComponentName as AntComponentName } from 'antd';
import type { ComponentNameProps } from '../../types';
import { COMPONENT_NAME_DEFAULTS } from '../../types';

const SIZE_MAP = {
  xs: 'small',
  sm: 'small',
  md: 'middle',
  lg: 'large',
  xl: 'large',
} as const;

export default function TitanComponentName(props: ComponentNameProps): React.ReactElement {
  const {
    size = COMPONENT_NAME_DEFAULTS.size,
    variant = COMPONENT_NAME_DEFAULTS.variant,
    disabled = COMPONENT_NAME_DEFAULTS.disabled,
    children,
    className = '',
    style,
    ...rest
  } = props;

  return (
    <AntComponentName
      size={SIZE_MAP[size]}
      disabled={disabled}
      className={`rottay-componentname rottay-componentname--titan ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </AntComponentName>
  );
}

TitanComponentName.displayName = 'TitanComponentName';
```

### 4. engines/hermes/index.tsx
```typescript
/**
 * ComponentName - Hermes Engine (DaisyUI/Tailwind)
 */

'use client';

import React from 'react';
import type { ComponentNameProps } from '../../types';
import { COMPONENT_NAME_DEFAULTS } from '../../types';

const SIZE_CLASSES = {
  xs: 'componentname-xs',
  sm: 'componentname-sm',
  md: 'componentname-md',
  lg: 'componentname-lg',
  xl: 'componentname-xl',
} as const;

export default function HermesComponentName(props: ComponentNameProps): React.ReactElement {
  const {
    size = COMPONENT_NAME_DEFAULTS.size,
    variant = COMPONENT_NAME_DEFAULTS.variant,
    disabled = COMPONENT_NAME_DEFAULTS.disabled,
    children,
    className = '',
    style,
  } = props;

  const classes = [
    'componentname',
    SIZE_CLASSES[size],
    `componentname-${variant}`,
    disabled && 'componentname-disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}

HermesComponentName.displayName = 'HermesComponentName';
```

### 5. engines/apollo/index.tsx
```typescript
/**
 * ComponentName - Apollo Engine (Vanilla HTML/CSS)
 */

'use client';

import React from 'react';
import type { ComponentNameProps } from '../../types';
import { COMPONENT_NAME_DEFAULTS } from '../../types';

const SIZE_STYLES = {
  xs: { fontSize: '12px', padding: '4px 8px' },
  sm: { fontSize: '14px', padding: '6px 12px' },
  md: { fontSize: '16px', padding: '8px 16px' },
  lg: { fontSize: '18px', padding: '10px 20px' },
  xl: { fontSize: '20px', padding: '12px 24px' },
} as const;

export default function ApolloComponentName(props: ComponentNameProps): React.ReactElement {
  const {
    size = COMPONENT_NAME_DEFAULTS.size,
    disabled = COMPONENT_NAME_DEFAULTS.disabled,
    children,
    className = '',
    style,
  } = props;

  const baseStyles: React.CSSProperties = {
    ...SIZE_STYLES[size],
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'default',
    ...style,
  };

  return (
    <div
      className={`rottay-componentname rottay-componentname--apollo ${className}`}
      style={baseStyles}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}

ApolloComponentName.displayName = 'ApolloComponentName';
```

---

## Exports Requeridos

Después de crear cada componente, actualizar:

### 1. Category index.ts
```typescript
// src/components/primitives/display/index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName/types';
```

### 2. Primitives index.ts
```typescript
// src/components/primitives/index.ts
export * from './display';
export * from './feedback';
// etc.
```

### 3. Main index.ts
```typescript
// src/index.ts
export * from './components/primitives';
```

---

## Checklist por Componente

- [ ] `types/index.ts` - Props interface + defaults
- [ ] `engines/titan/index.tsx` - Ant Design implementation
- [ ] `engines/hermes/index.tsx` - DaisyUI implementation
- [ ] `engines/apollo/index.tsx` - Vanilla implementation
- [ ] `engines/index.ts` - Export engines
- [ ] `base/index.tsx` - createEngineComponent
- [ ] `index.ts` - Re-export
- [ ] Category `index.ts` updated
- [ ] Build passes (`npm run build`)

---

## Notas Importantes

1. **Compound Components**: Usar `Object.assign()` pattern
2. **Imperative APIs**: Message/Notification necesitan providers
3. **Deprecated Components**: Comment, BackTop - implementar pero marcar
4. **CSS Variables**: Usar `--rottay-{component}-{property}`
5. **Accessibility**: Apollo debe ser WCAG 2.1 AA compliant
6. **TypeScript**: Strict mode, no `any`
7. **Tests**: No requeridos en Wave 4 (Wave 5)

---

## Orden de Prioridad

### Alta Prioridad (Implementar Primero)
1. Form, InputNumber, Switch (Agent G)
2. DatePicker, TimePicker (Agent E)
3. Table, Calendar (Agent A)
4. Message, Notification (Agent D)
5. Layout, Container, Flex, Space (Agent I)
6. Dropdown, Popover (Agent K)
7. Steps (Agent J)

### Media Prioridad
8. List, Descriptions, Timeline, Tree (Agent B)
9. AutoComplete, Cascader, TreeSelect (Agent F)
10. Carousel, Collapse, Empty (Agent C)
11. Slider, ColorPicker (Agent E)
12. Result, Rate (Agent D)
13. Upload (Agent H)
14. Splitter, Anchor, Affix (Agent I, J)
15. Popconfirm, Tour (Agent K)
16. FloatButton, Segmented (Agent J)

### Baja Prioridad
17. QRCode, Statistic (Agent A)
18. Comment (deprecated) (Agent C)
19. Mentions (Agent F)
20. Transfer (Agent G)
21. BackTop (deprecated) (Agent J)
22. Watermark (Agent K)

---

## Referencias

- **Avatar Template:** `/packages/core/src/components/primitives/display/Avatar/`
- **Engine Types:** `/packages/core/src/types/engine/index.ts`
- **createEngineComponent:** `/packages/core/src/system/engine/createEngineComponent.tsx`
- **Ant Design Docs:** https://ant.design/components/overview
- **DaisyUI Docs:** https://daisyui.com/components/

---

*Documento creado: 2024-12-25*
*Wave 4 - 42 Primitivos Faltantes*
*11 Agentes Paralelos (A-K)*
