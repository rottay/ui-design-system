# ROTTAY - DOCUMENTACIÃ“N TÃ‰CNICA
## Documento para Agentes IA - Cargar cuando se hable de cÃ³digo/arquitectura

---

# ARQUITECTURA GENERAL

## FilosofÃ­a
ROTTAY usa arquitectura hexagonal (ports & adapters) con separaciÃ³n clara entre:
- **Core Domain:** LÃ³gica de negocio pura, sin dependencias externas
- **Ports:** Interfaces que definen cÃ³mo el core se comunica
- **Adapters:** Implementaciones concretas (DB, APIs, UI)

## Principios
1. **Multi-tenant first:** Todo diseÃ±ado para mÃºltiples organizaciones desde dÃ­a 1
2. **Module isolation:** Cada mÃ³dulo es independiente, se puede usar solo
3. **Type safety:** TypeScript strict en todo el codebase
4. **API-first:** Todo expuesto via API, UI es solo un cliente mÃ¡s
5. **Event-driven:** ComunicaciÃ³n entre mÃ³dulos via eventos

## Monorepo Structure
```
rottay/
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ @rottay/core           # Shared utilities, types, helpers
â”‚   â”œâ”€â”€ @rottay/platform/      # Platform modules
â”‚   â”‚   â”œâ”€â”€ auth-system
â”‚   â”‚   â”œâ”€â”€ multi-tenant
â”‚   â”‚   â”œâ”€â”€ navigation-control
â”‚   â”‚   â”œâ”€â”€ access-control
â”‚   â”‚   â”œâ”€â”€ identity-management
â”‚   â”‚   â””â”€â”€ feature-flags
â”‚   â”œâ”€â”€ @rottay/modules/       # Domain modules
â”‚   â”‚   â”œâ”€â”€ ai-chat
â”‚   â”‚   â”œâ”€â”€ ai-voice
â”‚   â”‚   â”œâ”€â”€ ai-vision
â”‚   â”‚   â”œâ”€â”€ crypto-blockchain
â”‚   â”‚   â”œâ”€â”€ wallet
â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”œâ”€â”€ inventory
â”‚   â”‚   â”œâ”€â”€ reservations
â”‚   â”‚   â”œâ”€â”€ payments
â”‚   â”‚   â”œâ”€â”€ loyalty
â”‚   â”‚   â”œâ”€â”€ marketing
â”‚   â”‚   â”œâ”€â”€ analytics
â”‚   â”‚   â”œâ”€â”€ notifications
â”‚   â”‚   â”œâ”€â”€ files
â”‚   â”‚   â””â”€â”€ audit
â”‚   â””â”€â”€ @rottay/ui             # Shared UI components
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ bithire/               # Recruiting app
â”‚   â”œâ”€â”€ noctis/                # Events app
â”‚   â”œâ”€â”€ mesa/                  # Restaurant app
â”‚   â”œâ”€â”€ nexo/                  # Lending app
â”‚   â”œâ”€â”€ fortuna/               # Gaming app
â”‚   â””â”€â”€ admin/                 # Internal admin
â”œâ”€â”€ infra/                     # Terraform, Docker, etc.
â””â”€â”€ docs/                      # Documentation
```

---

# TECH STACK COMPLETO

## Runtime & Language
| Tech | VersiÃ³n | Notas |
|------|---------|-------|
| Node.js | 20+ | LTS, native fetch, ESM |
| TypeScript | 5+ | Strict mode siempre |
| pnpm | 8+ | Workspaces para monorepo |

## Framework & Routing
| Tech | VersiÃ³n | Notas |
|------|---------|-------|
| Next.js | 14+ | App Router, Server Components |
| React | 18+ | Concurrent features |
| tRPC | 10+ | End-to-end type safety (evaluando) |

## Database & ORM
| Tech | Uso | Notas |
|------|-----|-------|
| PostgreSQL | Primary DB | Via Neon (serverless) |
| Drizzle ORM | Query builder | Type-safe, lightweight |
| Redis | Cache, sessions | Via Upstash (serverless) |
| BullMQ | Job queues | Background processing |

## Frontend
| Tech | Uso | Notas |
|------|-----|-------|
| Ant Design | Component library | Enterprise-grade |
| TailwindCSS | Utility CSS | Con Ant Design |
| Zustand | State management | Simple, performant |
| React Query | Server state | Caching, mutations |
| React Hook Form | Forms | Con Zod validation |

## AI & Voice
| Tech | Uso | Notas |
|------|-----|-------|
| OpenAI | GPT-4, embeddings | Chat, analysis |
| Anthropic | Claude | Alternative LLM |
| ElevenLabs | Voice synthesis | Text-to-speech |
| Retell AI | Voice agents | Phone calls |
| Whisper | Transcription | Speech-to-text |

## Payments & Crypto
| Tech | Uso | Notas |
|------|-----|-------|
| Stripe | USA payments | Cards, subscriptions |
| MercadoPago | LATAM payments | Argentina, Brasil |
| Thirdweb | Crypto payments | Web3 integration |

## Infrastructure
| Tech | Uso | Notas |
|------|-----|-------|
| Vercel | Hosting | Next.js optimized |
| Neon | PostgreSQL | Serverless, branching |
| Upstash | Redis | Serverless |
| GitHub Actions | CI/CD | Automated deploys |
| GitHub Packages | NPM registry | Private packages |

## Monitoring & Analytics
| Tech | Uso | Notas |
|------|-----|-------|
| Datadog | APM, logs | Production monitoring |
| Sentry | Error tracking | Frontend & backend |
| PostHog | Product analytics | Feature flags tambiÃ©n |
| Mixpanel | User analytics | Funnels, retention |

## Vision AI (IRIS)
| Tech | Uso | Notas |
|------|-----|-------|
| OpenCV | Image processing | Python bindings |
| YOLO | Object detection | Real-time |
| TensorFlow | ML models | Custom training |
| face_recognition | Facial recognition | dlib-based |
| Tesseract | OCR | Document reading |
| FFmpeg | Video processing | Stream handling |

---

# MÃ“DULOS DE PLATAFORMA (@rottay/platform)

## 1. auth-system (78 use cases)

### DescripciÃ³n
Sistema completo de autenticaciÃ³n y sesiones. Soporta mÃºltiples mÃ©todos de auth y es la base para todos los productos.

### Funcionalidades Core
| Feature | DescripciÃ³n |
|---------|-------------|
| Email/Password | Registro, login, reset password |
| OAuth Providers | Google, GitHub, Microsoft, Apple |
| Magic Links | Passwordless via email |
| 2FA/MFA | TOTP (Google Authenticator), SMS, Email |
| Session Management | JWT + refresh tokens, device tracking |
| Token Blacklisting | Revoke tokens on logout/security events |
| Rate Limiting | Brute force protection |
| Audit Log | Track all auth events |

### Providers Soportados
- Google OAuth 2.0
- GitHub OAuth
- Microsoft/Azure AD
- Apple Sign In
- SAML 2.0 (enterprise)
- Custom OIDC

### Schemas Principales
```typescript
// User base (sin tenant-specific data)
interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  passwordHash?: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Session
interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  createdAt: Date;
}

// OAuth Account Link
interface OAuthAccount {
  id: string;
  userId: string;
  provider: 'google' | 'github' | 'microsoft' | 'apple';
  providerAccountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}
```

### API Endpoints
```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
POST /auth/mfa/enable
POST /auth/mfa/verify
POST /auth/mfa/disable
GET  /auth/oauth/:provider
GET  /auth/oauth/:provider/callback
GET  /auth/sessions
DELETE /auth/sessions/:id
```

---

## 2. multi-tenant (50+ use cases)

### DescripciÃ³n
Core del sistema multi-tenant. Maneja aislamiento de datos, branding por tenant, y provisioning.

### Funcionalidades Core
| Feature | DescripciÃ³n |
|---------|-------------|
| Tenant Isolation | Row-level security, schema separation option |
| Tenant Branding | Logo, colores, dominio custom |
| Tenant Provisioning | Crear nuevo tenant con todo configurado |
| Cross-tenant Queries | BLOQUEADAS por defecto, opt-in para admin |
| Tenant Switching | Usuario puede pertenecer a mÃºltiples tenants |
| Tenant Settings | ConfiguraciÃ³n por tenant |
| Usage Tracking | MÃ©tricas por tenant para billing |

### Strategies de Aislamiento
1. **Shared DB, Shared Schema:** tenant_id en cada tabla (default)
2. **Shared DB, Separate Schema:** Un schema PostgreSQL por tenant
3. **Separate DB:** Una base de datos por tenant (enterprise)

### Schemas Principales
```typescript
interface Tenant {
  id: string;
  name: string;
  slug: string;  // URL-safe identifier
  domain?: string;  // Custom domain
  settings: TenantSettings;
  branding: TenantBranding;
  plan: 'free' | 'starter' | 'growth' | 'business' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  createdAt: Date;
}

interface TenantBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
}

interface TenantSettings {
  timezone: string;
  locale: string;
  currency: string;
  features: Record<string, boolean>;
}

interface TenantMembership {
  id: string;
  userId: string;
  tenantId: string;
  role: string;
  invitedBy?: string;
  joinedAt: Date;
}
```

### Middleware Pattern
```typescript
// Todas las queries pasan por este middleware
const withTenant = (ctx: Context) => {
  const tenantId = ctx.tenant?.id;
  if (!tenantId) throw new UnauthorizedError();
  
  return {
    // Todas las queries incluyen tenant_id automÃ¡ticamente
    where: { tenantId, ...ctx.where }
  };
};
```

---

## 3. navigation-control (30+ use cases)

### DescripciÃ³n
Control dinÃ¡mico de navegaciÃ³n basado en roles, permisos, y feature flags.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Dynamic Menus | MenÃºs cambian segÃºn rol/permisos |
| Route Guards | ProtecciÃ³n de rutas en frontend |
| Breadcrumbs | GeneraciÃ³n automÃ¡tica |
| Deep Linking | URLs directas a cualquier recurso |
| Mobile Navigation | Adaptado para mÃ³vil |
| Keyboard Shortcuts | Power user features |

### Schema
```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: NavigationItem[];
  permissions?: string[];  // Required permissions
  featureFlag?: string;    // Must be enabled
  badge?: {
    count?: number;
    color?: string;
  };
  order: number;
}
```

---

## 4. access-control (28 use cases)

### DescripciÃ³n
Sistema RBAC (Role-Based Access Control) con permisos granulares.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Roles | Roles predefinidos y custom |
| Permissions | Permisos granulares por recurso/acciÃ³n |
| Role Hierarchy | Roles heredan de otros roles |
| Resource-level | Permisos a nivel de objeto especÃ­fico |
| Time-based | Permisos temporales |
| Audit | Log de cambios de permisos |

### Default Roles
```typescript
const defaultRoles = {
  owner: {
    inherits: ['admin'],
    permissions: ['*'],  // Everything
  },
  admin: {
    inherits: ['manager'],
    permissions: [
      'tenant:manage',
      'users:manage',
      'roles:manage',
      'billing:manage',
    ],
  },
  manager: {
    inherits: ['member'],
    permissions: [
      'users:invite',
      'users:remove',
      'reports:view',
    ],
  },
  member: {
    permissions: [
      'profile:edit',
      'resources:view',
      'resources:create',
    ],
  },
};
```

### Permission Format
```
resource:action
resource:action:scope

Examples:
- users:view
- users:edit
- users:delete
- jobs:create
- jobs:edit:own      (solo sus propios jobs)
- reports:view:team  (solo su equipo)
```

---

## 5. identity-management (22 use cases)

### DescripciÃ³n
GestiÃ³n de usuarios, organizaciones, equipos e invitaciones.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| User Profiles | Datos extendidos de usuario |
| Organizations | AgrupaciÃ³n de tenants |
| Teams | Sub-grupos dentro de tenant |
| Invitations | Sistema de invites con expiry |
| User Preferences | Settings por usuario |
| Avatar/Photos | Upload y procesamiento |

### Schemas
```typescript
interface UserProfile {
  userId: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  metadata: Record<string, any>;
}

interface Team {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: Date;
}

interface Invitation {
  id: string;
  tenantId: string;
  email: string;
  role: string;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
  token: string;
}
```

---

## 6. feature-flags (22 use cases)

### DescripciÃ³n
Sistema de feature flags para rollouts graduales y A/B testing.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Boolean Flags | Simple on/off |
| Percentage Rollout | X% de usuarios |
| User Targeting | Por usuario especÃ­fico |
| Tenant Targeting | Por tenant |
| A/B Testing | Variantes con mÃ©tricas |
| Kill Switches | Apagar features en emergencia |
| Flag Dependencies | Flag A requiere Flag B |
| Scheduled Flags | Activar en fecha futura |

### Schema
```typescript
interface FeatureFlag {
  id: string;
  key: string;  // 'new-dashboard', 'voice-interviews'
  name: string;
  description?: string;
  type: 'boolean' | 'percentage' | 'variant';
  enabled: boolean;
  rules: FeatureFlagRule[];
  variants?: FeatureFlagVariant[];
  createdAt: Date;
}

interface FeatureFlagRule {
  id: string;
  flagId: string;
  condition: {
    type: 'user' | 'tenant' | 'percentage' | 'attribute';
    operator: 'equals' | 'contains' | 'gt' | 'lt';
    value: any;
  };
  enabled: boolean;
  priority: number;
}
```

### Usage
```typescript
// Check flag
const isEnabled = await featureFlags.isEnabled('voice-interviews', {
  userId: user.id,
  tenantId: tenant.id,
});

// Get variant
const variant = await featureFlags.getVariant('pricing-test', {
  userId: user.id,
});
// Returns: 'control' | 'variant-a' | 'variant-b'
```

---

# MÃ“DULOS DE DOMINIO (@rottay/modules)

## 1. ai-chat

### DescripciÃ³n
Chatbots y asistentes conversacionales para todos los productos.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Multi-provider | OpenAI, Anthropic, local models |
| Conversation Memory | Historial con contexto |
| RAG | Retrieval-augmented generation |
| Function Calling | Tools/actions |
| Streaming | Respuestas en tiempo real |
| Templates | Prompts predefinidos por use case |
| Analytics | MÃ©tricas de uso y calidad |

### Uso por Producto
- **BITHIRE:** Pre-screening de candidatos via WhatsApp
- **NOCTIS:** AtenciÃ³n al cliente, info de eventos
- **MESA:** Reservas, pedidos, consultas menÃº
- **NEXO:** Consultas de prÃ©stamo, cobranza
- **FORTUNA:** Soporte jugadores

---

## 2. ai-voice

### DescripciÃ³n
Llamadas telefÃ³nicas automatizadas con IA.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Outbound Calls | Iniciar llamadas |
| Inbound Calls | Recibir llamadas |
| Voice Synthesis | ElevenLabs, otras |
| Speech Recognition | Whisper, otros |
| Call Scripts | Flujos configurables |
| Call Recording | GrabaciÃ³n con consent |
| Transcription | TranscripciÃ³n automÃ¡tica |
| Sentiment Analysis | Detectar tono/emociÃ³n |
| Transfer to Human | Escalado |

### Uso por Producto
- **BITHIRE:** Entrevistas telefÃ³nicas a candidatos
- **NEXO:** Llamadas de cobranza automatizadas
- **MESA:** ConfirmaciÃ³n de reservas
- **NOCTIS:** ConfirmaciÃ³n de reservas VIP

---

## 3. ai-vision (IRIS)

### DescripciÃ³n
Computer vision para anÃ¡lisis de imÃ¡genes y video.

### Capacidades
| Capacidad | Tech | Uso |
|-----------|------|-----|
| People Counting | YOLO, OpenCV | Aforo, ocupaciÃ³n |
| Face Recognition | face_recognition | VIP, banned |
| Object Detection | TensorFlow | Items, productos |
| Behavior Analysis | ML custom | Peleas, caÃ­das |
| ID Verification | Tesseract + face | KYC |
| RTSP Streaming | FFmpeg | CÃ¡maras en vivo |
| Heatmaps | Custom | Movimiento |

### Uso por Producto
- **NOCTIS:** Crowd counting, seguridad
- **MESA:** OcupaciÃ³n mesas, productividad
- **FORTUNA:** Anti-fraud, chip counting
- **NEXO:** KYC identity verification

---

## 4. crypto-blockchain

### DescripciÃ³n
IntegraciÃ³n con Web3 y pagos crypto.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Wallet Connect | Conectar wallets |
| Token Payments | Aceptar crypto |
| NFT Integration | Mint, transfer |
| Smart Contracts | Deploy, interact |
| Multi-chain | ETH, Polygon, Base |
| Fiat Offramp | Crypto â†’ USD |

### Provider
Thirdweb para la mayorÃ­a de funcionalidades.

---

## 5. wallet

### DescripciÃ³n
Billeteras internas para crÃ©ditos, puntos, balance.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Balance Types | Real, bonus, locked |
| Transactions | Deposits, withdrawals, transfers |
| Limits | Diarios, semanales, mensuales |
| Holds | Reservar fondos |
| History | Historial completo |
| Reconciliation | Cuadre de cuentas |

### Uso por Producto
- **NOCTIS:** CrÃ©ditos para bar, cross-venue
- **FORTUNA:** Balance de jugador
- **NEXO:** Balance de financiera

---

## 6. orders

### DescripciÃ³n
Sistema de pedidos para productos fÃ­sicos y servicios.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Order Creation | Carrito, checkout |
| Order Status | Pending â†’ Confirmed â†’ Preparing â†’ Ready â†’ Delivered |
| Modifications | Agregar/quitar items |
| Discounts | Cupones, promociones |
| Tips | Propinas |
| Split Payment | Dividir cuenta |
| Order History | Historial por usuario |

### Uso por Producto
- **MESA:** Pedidos en mesa, delivery
- **NOCTIS:** Bar orders

---

## 7. inventory

### DescripciÃ³n
Control de stock para productos fÃ­sicos.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Stock Tracking | Cantidad actual |
| Low Stock Alerts | Alertas automÃ¡ticas |
| Stock Movements | Entradas, salidas, ajustes |
| Multiple Locations | Varios almacenes |
| Variants | Tallas, colores |
| Batch/Lot | Trazabilidad |
| Cost Tracking | FIFO, promedio |

---

## 8. reservations

### DescripciÃ³n
Sistema de reservas para mesas, espacios, slots de tiempo.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Resource Types | Mesas, canchas, salas |
| Availability | Calendario real-time |
| Booking Rules | AnticipaciÃ³n, duraciÃ³n |
| Confirmations | Email, SMS, WhatsApp |
| Reminders | Recordatorios automÃ¡ticos |
| Waitlist | Lista de espera |
| No-show Tracking | Historial de faltas |

---

## 9. payments

### DescripciÃ³n
Procesamiento de pagos fiat y crypto.

### Providers
| Provider | RegiÃ³n | MÃ©todos |
|----------|--------|---------|
| Stripe | USA, Global | Cards, ACH, Apple Pay |
| MercadoPago | LATAM | Cards, transferencia, efectivo |
| Thirdweb | Global | Crypto |

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| One-time Payments | Cobros Ãºnicos |
| Subscriptions | Pagos recurrentes |
| Payment Links | Links de pago |
| Invoicing | Facturas |
| Refunds | Devoluciones |
| Disputes | Manejo de chargebacks |
| Multi-currency | MÃºltiples monedas |

---

## 10. loyalty

### DescripciÃ³n
Programas de lealtad, puntos, niveles.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Points | Acumular/canjear |
| Tiers | Bronce, Plata, Oro |
| Rewards | CatÃ¡logo de premios |
| Referrals | Programa de referidos |
| Challenges | Gamification |
| Expiration | Vencimiento de puntos |

---

## 11. marketing

### DescripciÃ³n
Herramientas de marketing y comunicaciÃ³n.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Campaigns | Crear campaÃ±as |
| Segments | Segmentar usuarios |
| A/B Testing | Probar variantes |
| Automations | Triggers automÃ¡ticos |
| Templates | Email, SMS, push |
| Analytics | MÃ©tricas de campaÃ±as |

---

## 12. analytics

### DescripciÃ³n
MÃ©tricas y reportes para todos los productos.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Dashboards | VisualizaciÃ³n |
| Custom Reports | Reportes personalizados |
| Real-time | Datos en tiempo real |
| Export | CSV, PDF, Excel |
| Scheduled Reports | EnvÃ­o automÃ¡tico |
| Funnels | AnÃ¡lisis de embudos |
| Cohorts | AnÃ¡lisis de cohortes |

---

## 13. notifications

### DescripciÃ³n
Sistema unificado de notificaciones.

### Canales
| Canal | Provider |
|-------|----------|
| Email | SendGrid, SES |
| SMS | Twilio, SNS |
| Push | Firebase, OneSignal |
| WhatsApp | Twilio, Meta |
| In-app | Custom |

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Templates | Por canal y evento |
| Preferences | Usuario elige canales |
| Scheduling | Programar envÃ­o |
| Batching | Agrupar notificaciones |
| Analytics | Open rates, clicks |

---

## 14. files

### DescripciÃ³n
GestiÃ³n de archivos y media.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Upload | Drag & drop, mÃºltiples |
| Storage | S3, CloudFlare R2 |
| Processing | Resize, compress, convert |
| CDN | Delivery global |
| Permissions | Control de acceso |
| Virus Scan | ClamAV |

---

## 15. audit

### DescripciÃ³n
Logging de auditorÃ­a para compliance.

### Funcionalidades
| Feature | DescripciÃ³n |
|---------|-------------|
| Action Logging | QuiÃ©n hizo quÃ© cuÃ¡ndo |
| Data Changes | Before/after |
| Immutable | No se puede borrar |
| Search | BÃºsqueda avanzada |
| Export | Para reguladores |
| Retention | PolÃ­ticas de retenciÃ³n |

---

# PATRONES DE CÃ“DIGO

## API Response Format
```typescript
// Success
{
  success: true,
  data: T,
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }
  }
}

// Error
{
  success: false,
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  }
}
```

## Error Handling
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}

// Specific errors
class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super('VALIDATION_ERROR', 'Validation failed', 400, details);
  }
}
```

## Repository Pattern
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(query: QueryOptions): Promise<T[]>;
  create(data: CreateInput<T>): Promise<T>;
  update(id: string, data: UpdateInput<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementation always includes tenant
class JobRepository implements Repository<Job> {
  constructor(private db: Database, private tenantId: string) {}
  
  async findById(id: string) {
    return this.db.jobs.findFirst({
      where: { id, tenantId: this.tenantId }
    });
  }
}
```

## Service Pattern
```typescript
class JobService {
  constructor(
    private repo: JobRepository,
    private eventBus: EventBus,
    private ai: AIService
  ) {}
  
  async createJob(input: CreateJobInput) {
    // Validate
    const validated = createJobSchema.parse(input);
    
    // Create
    const job = await this.repo.create(validated);
    
    // Side effects
    await this.eventBus.emit('job.created', { job });
    
    return job;
  }
}
```

## Event System
```typescript
// Define events
type Events = {
  'job.created': { job: Job };
  'job.updated': { job: Job; changes: Partial<Job> };
  'candidate.applied': { candidate: Candidate; job: Job };
  'interview.completed': { interview: Interview; score: number };
};

// Emit
eventBus.emit('job.created', { job });

// Listen
eventBus.on('job.created', async ({ job }) => {
  await notificationService.notifyTeam(job);
  await analyticsService.track('job_created', job);
});
```

---

# ENVIRONMENTS

## Development
- Local PostgreSQL or Neon branch
- Local Redis or Upstash
- Stripe test mode
- ElevenLabs sandbox

## Staging
- Neon staging branch
- Full integrations in test mode
- Preview deployments on Vercel

## Production
- Neon main branch
- Production API keys
- Vercel production
- Datadog monitoring

---

# CI/CD

## GitHub Actions Workflow
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm type-check

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

---

# SECURITY

## Authentication
- JWT con refresh tokens
- Tokens expiran en 15 minutos
- Refresh tokens expiran en 7 dÃ­as
- Blacklist en Redis

## Authorization
- RBAC con permisos granulares
- Row-level security en PostgreSQL
- API rate limiting por tenant

## Data Protection
- Encryption at rest (Neon)
- Encryption in transit (TLS 1.3)
- PII encryption en campos sensibles
- Audit logging

## Secrets Management
- Vercel Environment Variables
- GitHub Secrets
- No secrets en cÃ³digo

---

# PERFORMANCE

## Caching Strategy
```
1. CDN (Vercel Edge) - Static assets
2. Redis - Session, feature flags, hot data
3. React Query - Client-side cache
4. PostgreSQL - Query cache
```

## Database Optimization
- Indexes en tenant_id + foreign keys
- Connection pooling via Neon
- Query analysis con EXPLAIN
- Partitioning para tablas grandes

## Frontend Optimization
- Code splitting por ruta
- Image optimization (next/image)
- Lazy loading components
- Prefetching links

---

# TESTING

## Unit Tests
- Vitest para funciones puras
- Mock de dependencias externas

## Integration Tests
- API tests con supertest
- Database tests con test containers

## E2E Tests
- Playwright para flujos crÃ­ticos
- Visual regression tests

## Coverage Target
- 80% para cÃ³digo crÃ­tico
- 60% general