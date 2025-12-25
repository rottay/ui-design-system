# Guía de Integración i18n para Agentes Wave 1-5

## Para Agentes de Wave 1 y 2 (Componentes Primitivos)

### Paso 1: Importar useTranslation

```tsx
import { useTranslation } from '../../i18n';
```

### Paso 2: Usar en componente

```tsx
export function Avatar({ status, alt, loading }: AvatarProps) {
  const { t } = useTranslation('components');

  return (
    <div>
      {loading && <span>{t('avatar.loading')}</span>}
      {status && <span>{t(`avatar.status.${status}`)}</span>}
      <img alt={alt || t('avatar.fallback')} />
    </div>
  );
}
```

### Paso 3: Agregar traducciones si faltan

Si necesitas un string nuevo:

1. Editarlo en `/i18n/locales/es/components.json`
2. Traducirlo en `/i18n/locales/en/components.json`
3. Traducirlo en `/i18n/locales/pt/components.json`
4. Traducirlo en `/i18n/locales/fr/components.json`

---

## Componentes que DEBEN usar i18n

### Display

#### Avatar
```tsx
const { t } = useTranslation('components');
// avatar.loading, avatar.error, avatar.fallback
// avatar.status.online, avatar.status.offline, etc.
// avatar.group.surplus, avatar.group.empty
```

#### Badge
```tsx
const { t } = useTranslation('common');
// Probablemente no necesita traducciones (contenido viene de props)
```

### Inputs

#### Button
```tsx
const { t } = useTranslation('components');
// button.loading, button.submit, button.cancel, button.confirm
```

#### Input
```tsx
const { t } = useTranslation('components');
// input.placeholder, input.required, input.optional
// input.clear, input.show_password, input.hide_password
```

#### Select
```tsx
const { t } = useTranslation('components');
// select.placeholder, select.no_options, select.loading
// select.search, select.clear
```

#### Upload
```tsx
const { t } = useTranslation('components');
// upload.drag_drop, upload.uploading, upload.success, upload.error
// upload.remove, upload.max_size, upload.accepted_formats
```

### Feedback

#### Modal
```tsx
const { t } = useTranslation('components');
// modal.close, modal.confirm, modal.cancel
```

#### Alert
```tsx
const { t } = useTranslation('components');
// alert.close
```

#### Notification
```tsx
const { t } = useTranslation('components');
// notification.close, notification.mark_as_read, notification.clear_all
```

### Navigation

#### Pagination
```tsx
const { t } = useTranslation('components');
// pagination.previous, pagination.next
// pagination.page (con interpolación: { current, total })
// pagination.go_to, pagination.items_per_page
```

---

## Para Agentes de Wave 3 (Componentes Composed)

### DataTable

```tsx
import { useTranslation } from '../../i18n';

export function DataTable({ ... }: DataTableProps) {
  const { t } = useTranslation('components');

  return (
    <div>
      {/* Empty state */}
      {!data.length && <p>{t('table.empty')}</p>}

      {/* Loading state */}
      {loading && <p>{t('table.loading')}</p>}

      {/* Selection badge */}
      {selectedRows.length > 0 && (
        <span>
          {t('table.rows_selected', { count: selectedRows.length })}
        </span>
      )}

      {/* Filter button */}
      <button>{t('table.clear_filters')}</button>

      {/* Sort buttons */}
      <button>{t('table.sort_asc')}</button>
      <button>{t('table.sort_desc')}</button>
    </div>
  );
}
```

### FileUploader

```tsx
import { useTranslation, formatFileSize, useLocale } from '../../i18n';

export function FileUploader({ maxSize, accept }: FileUploaderProps) {
  const { t } = useTranslation('components');
  const { config } = useLocale();

  return (
    <div>
      <p>{t('upload.drag_drop')}</p>

      {maxSize && (
        <small>
          {t('upload.max_size', {
            size: formatFileSize(maxSize, config.numberLocale)
          })}
        </small>
      )}

      {accept && (
        <small>
          {t('upload.accepted_formats', { formats: accept })}
        </small>
      )}

      {uploading && <span>{t('upload.uploading')}</span>}
      {uploadSuccess && <span>{t('upload.success')}</span>}
      {uploadError && <span>{t('upload.error')}</span>}

      <button>{t('upload.remove')}</button>
    </div>
  );
}
```

### SearchBar

```tsx
import { useTranslation } from '../../i18n';

export function SearchBar({ ... }: SearchBarProps) {
  const { t } = useTranslation('components');

  return (
    <div>
      <input placeholder={t('search.placeholder')} />
      {searching && <span>{t('search.searching')}</span>}
      {!results.length && <p>{t('search.no_results')}</p>}
    </div>
  );
}
```

---

## Formateo de Datos

### Fechas

```tsx
import { formatDate, useLocale } from '../../i18n';

export function DateDisplay({ date }: { date: Date }) {
  const { config } = useLocale();

  return (
    <span>
      {formatDate(date, config.dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </span>
  );
}
```

### Tiempo Relativo

```tsx
import { formatRelativeTime, useLocale } from '../../i18n';

export function NotificationItem({ timestamp }: { timestamp: Date }) {
  const { config } = useLocale();

  return (
    <span>{formatRelativeTime(timestamp, config.dateLocale)}</span>
    // => "hace 5 minutos" (es)
    // => "5 minutes ago" (en)
  );
}
```

### Números

```tsx
import { formatNumber, useLocale } from '../../i18n';

export function StatCard({ value }: { value: number }) {
  const { config } = useLocale();

  return (
    <span>{formatNumber(value, config.numberLocale)}</span>
    // es-ES: 1.234.567,89
    // en-US: 1,234,567.89
  );
}
```

### Moneda

```tsx
import { formatCurrency, useLocale } from '../../i18n';

export function PriceTag({ price, currency }: PriceTagProps) {
  const { config } = useLocale();

  return (
    <span>{formatCurrency(price, config.numberLocale, currency)}</span>
    // es-ES EUR: 1.234,56 €
    // en-US USD: $1,234.56
  );
}
```

### Tamaño de Archivos

```tsx
import { formatFileSize, useLocale } from '../../i18n';

export function FileCard({ size }: { size: number }) {
  const { config } = useLocale();

  return (
    <span>{formatFileSize(size, config.numberLocale)}</span>
    // => "1,50 MB" (es-ES)
    // => "1.50 MB" (en-US)
  );
}
```

---

## Validaciones de Formularios

```tsx
import { useTranslation } from '../../i18n';

export function FormField({ error, errorType, params }: FormFieldProps) {
  const { t } = useTranslation('validation');

  if (!error) return null;

  const getMessage = () => {
    switch (errorType) {
      case 'required':
        return t('required');
      case 'email':
        return t('email');
      case 'min_length':
        return t('min_length', params); // { min: 8 }
      case 'password.weak':
        return t('password.min_length', params);
      default:
        return t('pattern');
    }
  };

  return <span className="error">{getMessage()}</span>;
}
```

---

## Mensajes de Error

```tsx
import { useTranslation } from '../../i18n';

export function ErrorBoundary({ error }: { error: Error }) {
  const { t } = useTranslation('errors');

  const getErrorMessage = (errorCode: string) => {
    const messages = {
      'network': t('network'),
      'not_found': t('not_found'),
      'unauthorized': t('unauthorized'),
      'server_error': t('server_error'),
      'timeout': t('timeout'),
      'generic': t('generic'),
    };

    return messages[errorCode] || messages.generic;
  };

  return (
    <div className="error-boundary">
      <p>{getErrorMessage(error.code)}</p>
    </div>
  );
}
```

---

## Checklist de Integración

### Para cada componente primitivo:

- [ ] Importar `useTranslation` o `useLocale` según sea necesario
- [ ] Reemplazar strings hardcodeados por `t('key')`
- [ ] Usar interpolación para valores dinámicos: `t('key', { param: value })`
- [ ] Formatear fechas con `formatDate()`
- [ ] Formatear números con `formatNumber()`
- [ ] Formatear moneda con `formatCurrency()`
- [ ] Verificar que existan las traducciones en los 4 locales
- [ ] Agregar traducciones faltantes si es necesario

### Para cada componente composed:

- [ ] Todos los pasos anteriores
- [ ] Mensajes de estado (loading, empty, error) traducidos
- [ ] Botones y acciones traducidos
- [ ] Placeholders traducidos
- [ ] Mensajes de validación traducidos
- [ ] Formateo de datos (fechas, números) implementado

---

## Strings Comunes ya Disponibles

No necesitas crear nuevas traducciones para estos strings comunes:

```typescript
// common namespace
t('common.yes')           // Sí / Yes / Sim / Oui
t('common.no')            // No / No / Não / Non
t('common.save')          // Guardar / Save / Salvar / Enregistrer
t('common.cancel')        // Cancelar / Cancel / Cancelar / Annuler
t('common.delete')        // Eliminar / Delete / Excluir / Supprimer
t('common.edit')          // Editar / Edit / Editar / Modifier
t('common.loading')       // Cargando... / Loading... / Carregando... / Chargement...
t('common.search')        // Buscar / Search / Buscar / Rechercher
t('common.filter')        // Filtrar / Filter / Filtrar / Filtrer
// ... y 50+ más
```

---

## Agregar Nuevas Traducciones

Si necesitas agregar un nuevo string:

1. **Identificar el namespace correcto:**
   - `common`: Palabras generales (sí, no, guardar, cancelar)
   - `components`: Strings específicos de componentes UI
   - `errors`: Mensajes de error
   - `validation`: Mensajes de validación

2. **Editar los 4 locales:**

```bash
# 1. Español (base)
packages/core/src/i18n/locales/es/{namespace}.json

# 2. English
packages/core/src/i18n/locales/en/{namespace}.json

# 3. Português
packages/core/src/i18n/locales/pt/{namespace}.json

# 4. Français
packages/core/src/i18n/locales/fr/{namespace}.json
```

3. **Seguir la estructura existente:**

```json
{
  "mycomponent": {
    "title": "Mi Título",
    "description": "Descripción con {count} elementos",
    "actions": {
      "submit": "Enviar",
      "cancel": "Cancelar"
    }
  }
}
```

4. **Usar en el componente:**

```tsx
const { t } = useTranslation('components');
t('mycomponent.title');
t('mycomponent.description', { count: 5 });
t('mycomponent.actions.submit');
```

---

## Tips y Best Practices

1. **Siempre usar namespace:**
   ```tsx
   // ❌ Malo
   const { t } = useTranslation();
   t('components.button.submit');

   // ✅ Bueno
   const { t } = useTranslation('components');
   t('button.submit');
   ```

2. **Interpolación para valores dinámicos:**
   ```tsx
   // ❌ Malo
   `Página ${current} de ${total}`

   // ✅ Bueno
   t('pagination.page', { current, total })
   ```

3. **Formatters para datos:**
   ```tsx
   // ❌ Malo
   date.toLocaleDateString()

   // ✅ Bueno
   formatDate(date, config.dateLocale)
   ```

4. **No hardcodear strings:**
   ```tsx
   // ❌ Malo
   <button>Guardar</button>

   // ✅ Bueno
   <button>{t('common.save')}</button>
   ```

5. **Reutilizar traducciones comunes:**
   ```tsx
   // Si ya existe en common, úsalo
   t('common.loading')  // ✅

   // No crees uno nuevo en components
   t('components.mycomponent.loading')  // ❌
   ```

---

## Soporte

Si tienes dudas sobre i18n:
1. Revisa `README.md` en `/i18n/`
2. Mira `EXAMPLES.tsx` para casos de uso
3. Consulta `IMPLEMENTATION_SUMMARY.md` para detalles técnicos

---

**Implementado por:** Agente D - Wave 0
**Para uso por:** Agentes Wave 1-5
