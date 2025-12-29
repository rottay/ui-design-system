# Design System Rottay - TypeScript Types

Sistema completo de tipos TypeScript para el Design System Rottay.

## Estructura

```
/types/
├── common/              # Tipos comunes compartidos
│   └── index.ts         # BaseComponentProps, Size, Variant, etc.
├── engine/              # Tipos del sistema de engines
│   └── index.ts         # EngineName, EngineAwareProps, etc.
├── primitives/          # Tipos de componentes primitivos
│   ├── display/         # Componentes de display
│   │   ├── avatar.ts
│   │   ├── badge.ts
│   │   ├── card.ts
│   │   ├── image.ts
│   │   ├── tag.ts
│   │   ├── tooltip.ts
│   │   └── index.ts
│   ├── inputs/          # Componentes de input
│   │   ├── button.ts
│   │   ├── checkbox.ts
│   │   ├── input.ts
│   │   ├── radio.ts
│   │   ├── select.ts
│   │   ├── toggle.ts
│   │   └── index.ts
│   ├── feedback/        # Componentes de feedback
│   │   ├── alert.ts
│   │   ├── modal.ts
│   │   ├── toast.ts
│   │   └── index.ts
│   ├── navigation/      # Componentes de navegación
│   │   ├── menu.ts
│   │   ├── stepper.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts             # Export principal
```

## Tipos Comunes (common/)

### BaseComponentProps
Props base que todos los componentes heredan:
- `className?: string` - Clase CSS adicional
- `style?: CSSProperties` - Estilos inline
- `id?: string` - ID del elemento
- `data-testid?: string` - Para testing

### Tipos de Tamaño
```typescript
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
```

### Tipos de Variante
```typescript
type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient';
```

### Tipos de Forma
```typescript
type Shape = 'circle' | 'square' | 'rounded';
```

### Props Mixins
- `LoadableProps` - Para componentes con estado de loading
- `DisableableProps` - Para componentes que pueden deshabilitarse
- `WithChildren` - Para componentes con children
- `ClickableProps` - Para componentes clickeables
- `ErrorableProps` - Para componentes con estados de error
- `LabeledProps` - Para componentes con label
- `PlaceholderProps` - Para componentes con placeholder
- `ControlledProps<T>` - Para componentes controlados
- `ClearableProps` - Para componentes que pueden borrarse
- `IconProps` - Para componentes con icono
- `BorderedProps` - Para componentes con borde
- `ShadowedProps` - Para componentes con sombra

## Tipos de Engine (engine/)

### EngineName
```typescript
type EngineName = 'titan' | 'hermes' | 'apollo';
```
- `titan`: Ant Design (enterprise, feature-rich)
- `hermes`: DaisyUI/Tailwind (lightweight, utility-first)
- `apollo`: Vanilla HTML/CSS (minimal, accessible)

### EngineAwareProps
```typescript
interface EngineAwareProps {
  engine?: EngineName;
}
```

Todos los componentes primitivos heredan estas props para soportar múltiples engines.

## Componentes Primitivos Implementados

### Display
- **Avatar**: Avatar con status, grupo, badge, fallback
- **Badge**: Badge con variantes, ribbon, contador
- **Card**: Card con header, body, footer, cover, meta
- **Image**: Image con lazy loading, zoom, fallback
- **Tag**: Tag con close, click, variantes
- **Tooltip**: Tooltip con posiciones, triggers

### Inputs
- **Button**: Button con variantes, loading, iconos, grupo
- **Checkbox**: Checkbox con grupo, indeterminate
- **Input**: Input con password, textarea, search, grupo
- **Radio**: Radio con grupo, botones
- **Select**: Select con búsqueda, múltiple, grupos
- **Toggle**: Toggle (Switch) con loading, iconos

### Feedback
- **Alert**: Alert con variantes, close, acciones
- **Modal**: Modal con header/body/footer, confirm
- **Toast**: Toast con provider, posiciones, acciones

### Navigation
- **Menu**: Menu horizontal/vertical/inline, submenus
- **Stepper**: Stepper horizontal/vertical, acciones

## Uso

```typescript
import type {
  // Common
  BaseComponentProps,
  Size,
  Variant,
  
  // Engine
  EngineName,
  EngineAwareProps,
  
  // Primitives - Display
  AvatarProps,
  BadgeProps,
  CardProps,
  
  // Primitives - Inputs
  ButtonProps,
  InputProps,
  SelectProps,
  
  // Primitives - Feedback
  ModalProps,
  ToastProps,
  AlertProps,
  
  // Primitives - Navigation
  MenuProps,
  StepperProps,
} from '@rottay/design-system';

// Ejemplo de uso
const MyButton: React.FC<ButtonProps> = (props) => {
  // ...
};
```

## Características

- ✅ **JSDoc completo**: Todos los tipos tienen documentación
- ✅ **Type-safe**: Tipado estricto con TypeScript
- ✅ **Extensible**: Fácil de extender y customizar
- ✅ **Engine-aware**: Soporte para múltiples engines
- ✅ **Composable**: Props mixins reutilizables
- ✅ **React 18**: Compatible con React 18 types

## Próximos Pasos (Wave 2)

Los componentes que usarán estos tipos se implementarán en Wave 2:
- `/packages/core/src/components/primitives/titan/` - Implementaciones con Ant Design
- `/packages/core/src/components/primitives/hermes/` - Implementaciones con DaisyUI
- `/packages/core/src/components/primitives/apollo/` - Implementaciones vanilla
