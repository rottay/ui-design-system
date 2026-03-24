# Tenant White-Labeling RFC

Fecha: 2026-03-15

## Objetivo

Queremos que `app-platform` pueda crear o editar un tenant y definir su white-labeling completo desde producto, sin tener que tocar el código del design system para cada tenant nuevo.

Eso incluye:

- colores y branding
- motion y personalidad visual
- engine por tenant
- traducciones
- features por plan/tenant
- presets por vertical
- opcionalmente, un pack de componentes custom

La meta es:

1. que el DS lo consuma automáticamente en runtime
2. que no haya que recompilar el DS para cada tenant
3. que los fallbacks estáticos existan por vertical o por preset, no por tenant individual

## Veredicto

Sí, este enfoque tiene sentido y es mejor que mantener carpetas CSS por tenant como estrategia principal.

La recomendación es:

- usar **DB/API como source of truth de tenants reales**
- usar **presets versionados en código por vertical**
- usar **runtime CSS generation / runtime token injection** para tenant-specific white-labeling
- reservar carpetas estáticas solo para:
  - defaults de marca base
  - presets por vertical
  - tenants first-party/demo

No conviene seguir escalando `tokens/css/tenants/<tenant>` como modelo principal. Eso no escala operativamente y obliga a tratar cada tenant como si fuera una variante hardcodeada del DS.

## Principio Rector

Separar claramente estas cuatro cosas:

1. `engine`
   Define el renderer base: `classic`, `modern`, `rustic`, `custom`

2. `vertical preset`
   Define defaults compartidos por una vertical: eventos, recruiting, commerce, hospitality, etc.

3. `tenant config`
   Define branding, motion, personality, features y overrides específicos del tenant

4. `component pack`
   Define implementaciones custom de componentes si una vertical o tenant necesita un front distinto

Si estas cuatro capas quedan mezcladas, el sistema se vuelve difícil de operar. Si quedan separadas, escala bien.

## Arquitectura Recomendada

### 1. Source of Truth

Para tenants reales:

- `app-platform` guarda la configuración en DB
- expone un endpoint o resolver para devolver `TenantConfig`
- el DS resuelve por `tenantSlug` y consume esa configuración en runtime

Para fallbacks:

- presets versionados en código por vertical
- tenant default de sistema (`rottay`)

### 2. Jerarquía de Resolución

Orden recomendado:

1. engine defaults
2. product profile defaults
3. vertical preset defaults
4. tenant config desde DB/API
5. app-level `tenantOverrides`
6. component/surface local overrides

Esto permite:

- defaults consistentes por industria
- personalización fuerte por tenant
- overrides temporales desde producto sin forkear el DS

## Contrato Recomendado

### TenantConfig

Extender el contrato actual para soportar operación real de white-labeling:

```ts
interface TenantConfig {
  slug: string;
  name: string;
  domain?: string;

  engine: EngineName;
  componentPack?: string;
  vertical?: VerticalKey;

  theme: string;
  locale?: SupportedLocale;
  fallbackLocale?: SupportedLocale;

  plan: TenantPlan;
  features: string[];

  branding: TenantBranding;
  personality?: Partial<PersonalityTokens>;
  tokenOverrides?: TenantTokenOverrides;
  customTranslations?: Partial<LocaleTranslations>;
}
```

### VerticalPreset

Agregar un contrato explícito para defaults por vertical:

```ts
interface VerticalPreset {
  key: VerticalKey;
  label: string;
  defaultEngine?: EngineName;
  defaultComponentPack?: string;
  defaultBranding?: Partial<TenantBranding>;
  defaultPersonality?: Partial<PersonalityTokens>;
  defaultTokenOverrides?: TenantTokenOverrides;
  defaultFeatures?: string[];
  defaultProductProfile?: ProductProfileKey;
}
```

### ComponentPack

El pack de componentes no debe estar implícito dentro del engine custom. Debe ser un concepto explícito:

```ts
interface ComponentPackConfig {
  key: string;
  engine: Extract<EngineName, 'custom'>;
  displayName: string;
  fallbackEngine: Exclude<EngineName, 'custom'>;
}
```

## Cambio de Naming: `athena` -> `custom`

Recomendación fuerte: renombrar el engine `athena` a `custom`.

Razones:

- `athena` es un codename interno
- `custom` describe la intención real
- mejora la legibilidad de `TenantConfig`
- mejora el entendimiento para producto y plataforma

Ejemplo:

```ts
engine: 'custom'
componentPack: 'reactbits-events'
```

Eso comunica mucho mejor que:

```ts
engine: 'athena'
```

### Rename Propuesto

- `athena.ts` -> `custom-engine.ts`
- `AthenaConfig` -> `CustomEngineConfig`
- `configureAthena` -> `configureCustomEngine`
- `getAthenaConfig` -> `getCustomEngineConfig`
- `registerAthenaComponent` -> `registerCustomComponent`
- `registerAthenaComponents` -> `registerCustomComponents`
- `unregisterAthenaComponent` -> `unregisterCustomComponent`
- `clearAthenaRegistry` -> `clearCustomComponentRegistry`
- `hasAthenaComponent` -> `hasCustomComponent`
- `getAthenaComponent` -> `getCustomComponent`
- `createAthenaWrapper` -> `createCustomEngineWrapper`
- `useAthenaStatus` -> `useCustomEngineStatus`
- `EngineName`:
  - antes: `'classic' | 'modern' | 'rustic' | 'athena'`
  - después: `'classic' | 'modern' | 'rustic' | 'custom'`

## Runtime vs Build-Time

### Lo que debe funcionar en runtime

Sin recompilar el DS:

- branding
- color scale
- typography tuning
- spacing/radius/shadows
- motion/personality
- feature flags
- locale/custom translations
- engine selection
- tenant-specific CSS generation
- selección de preset por vertical

Esto ya está bastante encaminado con:

- [DesignSystemProvider](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/bootstrap/DesignSystemProvider.tsx)
- [ThemeProvider](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/theming/ThemeProvider.tsx)
- [tenancy/storage](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/tenancy/storage/index.ts)
- [generateTenantCss](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/tenancy/storage/static/generator/index.ts)
- [useCreateTenant](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/tenancy/useCreateTenant.ts)

### Lo que no debería requerir build por tenant

No conviene requerir build del DS para:

- un nuevo logo
- cambio de primary color
- cambio de hover/motion
- cambio de border radius
- dark mode tuning
- activar una feature o preset

Si eso requiere build, el sistema se vuelve cuello de botella.

### Lo que sí puede seguir siendo build-time

- presets first-party oficiales
- assets de demo
- packs de componentes versionados
- CSS base común del DS

## Fallback Strategy Recomendada

### No por tenant

Evitar:

- `tokens/css/tenants/acme`
- `tokens/css/tenants/tenant-x`
- `tokens/css/tenants/tenant-y`

como modelo principal.

### Sí por vertical o preset

Preferir:

- `verticals/events`
- `verticals/recruiting`
- `verticals/hospitality`
- `verticals/commerce`

o un home equivalente como:

- `product-profiles/verticals`
- `tenancy/presets`

Cada vertical define un baseline.
Cada tenant persiste solo sus diferencias.

## Sobre “ReactBits para un tenant y otro front para otro”

Sí, conceptualmente tiene sentido, pero hoy el engine custom no está listo para eso de forma robusta si dos tenants distintos conviven en el mismo runtime.

Problema actual:

- la registry del engine custom es global
- no está scopiada por tenant ni por component pack

### Mejora recomendada

Pasar de:

```ts
Map<ComponentName, Component>
```

a:

```ts
Map<ComponentPackKey, Map<ComponentName, Component>>
```

o equivalente.

Entonces la resolución sería:

1. leer `tenant.componentPack`
2. cargar ese pack
3. resolver el componente dentro de ese pack
4. fallback al engine definido

### Regla

- `engine='custom'` define que el tenant usa implementación custom
- `componentPack='reactbits-events'` define cuál

Eso es mucho más escalable que un singleton global.

## Diseño Recomendado para app-platform

En el onboarding/edición de tenant, exponer al menos:

- `vertical`
- `engine`
- `componentPack` opcional
- `primaryColor`
- `secondaryColor`
- `accentColor`
- `logo`
- `locale`
- `theme mode defaults`
- `personality preset`
- controles finos de motion
- radius/density/shadows
- features por plan

La UI no debería pedir “todos los tokens”; debería ofrecer:

1. presets
2. sliders/toggles de alto nivel
3. advanced mode para overrides finos

## Recomendaciones de Producto/Plataforma

### Recomendado

- vertical preset + tenant override
- DB/API como source of truth
- runtime CSS generation
- custom engine con `componentPack`
- fallback a presets por vertical

### No recomendado

- carpeta por tenant como estrategia principal
- registrar tenants reales en código
- usar el DS como owner de data de negocio del tenant
- dejar `athena` como nombre público

## Plan Propuesto para Claude

### Fase 1: Naming + contrato

1. renombrar `athena` -> `custom`
2. actualizar `EngineName`
3. actualizar registry, docs, tests y exports

### Fase 2: Vertical presets

1. crear contrato `VerticalPreset`
2. crear registry de verticals
3. integrar vertical preset en la cadena de resolución de tokens/tenant

### Fase 3: Tenant source of truth

1. declarar que DB/API es el source of truth para tenants reales
2. mantener static registry solo para defaults/demo
3. asegurar que `DesignSystemProvider` priorice runtime config limpia

### Fase 4: Custom component packs

1. agregar `componentPack` a `TenantConfig`
2. hacer tenant-scoped o pack-scoped la registry custom
3. soportar lazy loading por pack

### Fase 5: Cleanup de estrategia estática

1. dejar carpetas estáticas por vertical/preset
2. dejar tenants built-in solo si son first-party/demo
3. evitar seguir creciendo `tokens/css/tenants/*` para tenants reales

## Decisión Final Recomendada

Sí, el modelo correcto es:

- **tenant real = configuración en DB/API**
- **DS = resolución runtime**
- **fallbacks = presets por vertical**
- **custom front = `engine: 'custom'` + `componentPack`**

Ese diseño es más escalable, más operable y más claro que seguir metiendo tenants individuales como carpetas dentro del DS.
