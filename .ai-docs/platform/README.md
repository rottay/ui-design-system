# Platform Modules

> **Módulos de infraestructura usados por todas las aplicaciones y domain modules**
>
> **IMPORTANT (2026-02-06):** The `platform/` directory now contains **only** `packages/`. The standalone API server (`platform/src/`, 429 routes) has been deleted. `app-platform` is the sole API server for platform administration.

---

## Ubicación

```
platform/
└── packages/platform/
    ├── auth/
    ├── identity/
    ├── tenancy/
    ├── permissions/
    ├── compliance/
    ├── feature-flags/
    ├── navigation/
    └── notifications/
```

---

## Resumen de Módulos

| Módulo | Mutations | Queries | Total | Descripción |
|--------|-----------|---------|-------|-------------|
| [auth](./auth/USE-CASES.md) | 46 | 21 | 67 | OAuth, JWT, MFA, Sessions, SSO, SCIM |
| [identity](./identity/USE-CASES.md) | 51 | 47 | 98 | Perfiles, SCIM, Groups, B2B/B2C |
| [tenancy](./tenancy/USE-CASES.md) | 11 | 6 | 17 | Multi-tenancy, API Keys |
| [permissions](./permissions/USE-CASES.md) | 5 | 9 | 14 | RBAC, Access Control |
| [compliance](./compliance/USE-CASES.md) | 85 | 53 | 138 | KYC, AML, GDPR, Healthcare, etc. |
| [feature-flags](./feature-flags/USE-CASES.md) | 4 | 4 | 8 | Feature Toggles, A/B Testing |
| [navigation](./navigation/USE-CASES.md) | 32 | 42 | 74 | Menús, Rutas, Access Control |
| [notifications](./notifications/USE-CASES.md) | 17 | 14 | 31 | Email, SMS, Push, In-App |

**Total: 447 use cases**

---

## Características Comunes

Todos los platform modules:

1. **Siguen arquitectura hexagonal** - domain, application, adapters
2. **Usan Result Pattern** - `success()` / `error()`
3. **Requieren TenantContext** - Multi-tenancy obligatorio
4. **Exportan desde barrel files** - `index.ts`
5. **DI en config/di/** - Factories centralizadas

---

## Dependencias

```
@rottay/core  <──  @rottay/auth
              <──  @rottay/identity
              <──  @rottay/tenancy
              <──  @rottay/permissions
              <──  @rottay/compliance
              <──  @rottay/feature-flags
              <──  @rottay/navigation
              <──  @rottay/notifications
```

---

## Uso desde Apps

```typescript
// En app-platform, app-bithire, app-evnto
import { makeLoginUseCase } from '@rottay/auth';
import { makeCreateUserUseCase } from '@rottay/identity';
import { makeCheckPermissionUseCase } from '@rottay/permissions';
```

---

## Compliance Sub-Modules

El módulo de compliance es el más grande, con 16 dominios especializados:

| Dominio | Mutations | Queries | Descripción |
|---------|-----------|---------|-------------|
| kyc | 13 | 12 | Know Your Customer |
| aml | 6 | 4 | Anti-Money Laundering |
| gdpr | 6 | 6 | General Data Protection Regulation |
| healthcare | 7 | 2 | HIPAA compliance |
| gaming | 9 | 6 | Gaming regulations |
| crypto | 5 | 3 | MiCA, Travel Rule |
| banking | 6 | 2 | Open Banking, PSD2 |
| ai-hiring | 8 | 0 | AI hiring bias audits |
| bipa | 4 | 2 | Biometric Information Privacy |
| breach-management | 2 | 1 | Data breach reporting |
| consumer | 2 | 2 | Consumer privacy |
| hr-employment | 5 | 3 | Employment regulations |
| insurance | 3 | 1 | Insurance compliance |
| legal | 2 | 1 | Legal/ethics |
| securities | 3 | 3 | SEC, MiFID, Crowdfunding |
