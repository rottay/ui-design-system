# @designsystem/core

Librería de componentes UI basada en Ant Design con soporte para múltiples temas.

## Instalación

```bash
npm install @designsystem/core
```

## Uso Rápido

```tsx
import { ThemeProvider, Button } from '@designsystem/core';

function App() {
  return (
    <ThemeProvider defaultTheme="spotify">
      <Button type="primary">Click me</Button>
    </ThemeProvider>
  );
}
```

## Documentación Completa

Ver el [README principal](../../README.md) para documentación completa, ejemplos y guías de integración con Next.js.

## Exports

```tsx
// Componentes
import { Button } from '@designsystem/core';

// Temas
import { spotifyTheme, themes } from '@designsystem/core';

// Providers
import { ThemeProvider } from '@designsystem/core';

// Hooks
import { useTheme } from '@designsystem/core';
```

## Licencia

MIT
