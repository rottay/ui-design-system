# ThemeProvider Quick Reference

## Import

```tsx
import { ThemeProvider, useTheme } from '@es-rottay/designsystem-core';
```

## Basic Setup

```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | App content |
| `theme` | `string` | `'base'` | Theme variant (light/dark/base) |
| `tenant` | `string` | `'rottay'` | Tenant identifier |
| `branding` | `TenantBranding` | `undefined` | Custom colors |
| `onError` | `(error, tenant) => void` | `undefined` | Error callback |
| `onFallback` | `(tenant) => void` | `undefined` | Fallback callback |
| `cssBaseUrl` | `string` | `'/themes'` | Base URL for CSS files |

## Hook API

```tsx
const {
  theme,      // Current theme variant
  setTheme,   // Change theme variant
  tenant,     // Current tenant
  setTenant,  // Change tenant (loads CSS)
  config,     // Theme configuration
  isLoading,  // Loading state
  isFallback  // Using fallback?
} = useTheme();
```

## Common Patterns

### Default Usage
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

### Custom Tenant
```tsx
<ThemeProvider tenant="acme">
  <App />
</ThemeProvider>
```

### With Error Handling
```tsx
<ThemeProvider
  tenant="acme"
  onError={(error, tenant) => console.error(error)}
  onFallback={(tenant) => console.warn(`Fallback from ${tenant}`)}
>
  <App />
</ThemeProvider>
```

### Custom Branding
```tsx
<ThemeProvider
  branding={{
    primaryColor: '#FF6B00',
    accentColor: '#00A3FF'
  }}
>
  <App />
</ThemeProvider>
```

### CDN CSS
```tsx
<ThemeProvider
  tenant="acme"
  cssBaseUrl="https://cdn.example.com/themes"
>
  <App />
</ThemeProvider>
```

### Dynamic Switching
```tsx
function TenantSwitcher() {
  const { tenant, setTenant } = useTheme();

  return (
    <select value={tenant} onChange={(e) => setTenant(e.target.value)}>
      <option value="rottay">Rottay</option>
      <option value="acme">ACME</option>
    </select>
  );
}
```

## CSS File Structure

Expected CSS file location:
```
{cssBaseUrl}/{tenant}.css

Examples:
- /themes/rottay.css      (default)
- /themes/acme.css
- https://cdn.example.com/themes/globex.css
```

## Fallback Chain

```
Requested Tenant
    ↓ (on error)
Rottay (rottay.css)
    ↓ (on error)
Emergency Inline Tokens
```

## Emergency Tokens

If all CSS files fail to load, these minimal tokens are injected inline:

```css
:root {
  --color-primary-500: #0066CC;
  --color-secondary-500: #6B6BD4;
  --color-background: #FFFFFF;
  --color-text-primary: #171717;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
}
```

## Branding Variables

Branding colors are injected as CSS variables:

```css
--tenant-primary: {branding.primaryColor}
--tenant-accent: {branding.accentColor}
```

## TypeScript Types

```tsx
interface ThemeProviderProps {
  children: ReactNode;
  theme?: string;
  tenant?: string;
  branding?: TenantBranding;
  onError?: (error: Error, tenant: string) => void;
  onFallback?: (originalTenant: string) => void;
  cssBaseUrl?: string;
}

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  config: ThemeConfig | null;
  tenant?: string;
  setTenant?: (tenant: string) => void;
  isLoading?: boolean;
  isFallback?: boolean;
}

interface ThemeConfig {
  name: string;
  tenant?: string;
  cssUrl?: string;
  isLoaded?: boolean;
  isError?: boolean;
  isFallback?: boolean;
  variables: Record<string, string>;
}
```

## Configuration Constants

```tsx
DEFAULT_TENANT = 'rottay'
THEME_LOAD_TIMEOUT = 5000  // 5 seconds
```

## Best Practices

1. ✅ Always wrap your app in `<ThemeProvider>`
2. ✅ Use `onError` and `onFallback` for production monitoring
3. ✅ Ensure CSS files exist before deploying
4. ✅ Use CDN for production CSS files
5. ✅ Test fallback scenarios
6. ❌ Don't nest ThemeProviders (inner overrides outer)
7. ❌ Don't call `setTenant` in render loops

## Troubleshooting

### Theme not loading?
- Check CSS file exists at `{cssBaseUrl}/{tenant}.css`
- Check browser console for errors
- Verify CORS headers if using CDN
- Check network tab for 404/CORS errors

### Fallback to Rottay?
- Check `onFallback` callback was called
- Verify original tenant CSS file exists
- Check `isFallback` state in hook

### Emergency tokens showing?
- Even Rottay failed to load
- Check `/themes/rottay.css` exists
- Verify base URL is correct

---

**Version:** 1.0.0
**Last Updated:** 2025-12-25
