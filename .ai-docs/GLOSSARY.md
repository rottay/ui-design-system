# Glosario Rottay

> **Términos del dominio y arquitectura**

---

## Arquitectura

| Término | Definición |
|---------|------------|
| **Hexagonal Architecture** | Patrón donde la lógica de negocio está aislada de detalles externos mediante ports y adapters |
| **DDD** | Domain-Driven Design - Diseño guiado por el dominio de negocio |
| **CQRS** | Command Query Responsibility Segregation - Separación de operaciones de lectura y escritura |
| **Port** | Interfaz que define un contrato entre capas (ej: `ProductRepositoryPort`) |
| **Adapter** | Implementación concreta de un port (ej: `PostgresProductRepository`) |
| **Use Case** | Caso de uso - Una operación de negocio específica |
| **Orchestrator** | Servicio que coordina múltiples use cases en un workflow complejo |

---

## Multi-Tenancy

| Término | Definición |
|---------|------------|
| **Tenant** | Inquilino - Una organización cliente que usa la plataforma |
| **TenantContext** | Objeto que contiene información del tenant actual (tenantId, userId, etc.) |
| **Tenant Isolation** | Garantía de que los datos de un tenant nunca se mezclan con otros |
| **Dedicated Tenant** | Tenant con base de datos separada (enterprise tier) |
| **Shared Tenant** | Tenant que comparte base de datos con otros (standard tier) |

---

## Entidades Comunes

| Término | Definición |
|---------|------------|
| **Audit Fields** | Campos de auditoría: createdAt, updatedAt, createdBy, updatedBy |
| **Soft Delete** | Eliminación lógica usando `isActive = false` en lugar de DELETE |
| **Value Object** | Objeto inmutable sin identidad, definido solo por sus valores |
| **Entity** | Objeto con identidad única (id) que persiste en el tiempo |
| **Aggregate** | Grupo de entidades tratadas como unidad para cambios de datos |

---

## Platform Modules

| Término | Definición |
|---------|------------|
| **Auth** | Autenticación - Verificar identidad (OAuth, JWT, MFA). Session segment: `user.auth` |
| **Identity** | Gestión de perfiles de usuario, consent, SCIM. Session segment: `user.identity` |
| **Permissions** | RBAC - Control de acceso basado en roles. Session segment: `user.permissions` |
| **Tenancy** | Gestión de tenants, API keys, suscripciones. Session segment: `user.tenancy` |
| **Compliance** | KYC, AML, GDPR, auditorías, SOC2 |
| **Feature Flags** | Toggles para habilitar/deshabilitar funcionalidades |
| **UnifiedSessionUser** | Session user type from @rottay/auth. Segments: identity, auth, permissions, tenancy, preferences, context |

---

## Domain Modules (dm-*)

| Término | Definición |
|---------|------------|
| **dm-recruiter** | ATS (Applicant Tracking System) - Sistema de seguimiento de candidatos |
| **dm-scoring** | LLM-as-Judge - Evaluación con IA usando rúbricas |
| **dm-ia-chat** | Chat con inteligencia artificial |
| **dm-events** | Gestión de eventos y ticketing |
| **dm-bar** | Gestión de bar e inventario |
| **dm-staff** | Gestión de personal y turnos |
| **dm-payments** | Procesamiento de pagos |
| **dm-web3** | NFTs, tokens, contratos inteligentes |

---

## dm-recruiter

| Término | Definición |
|---------|------------|
| **Candidate** | Persona que aplica a un puesto |
| **Job** | Posición/vacante abierta |
| **Application** | Aplicación de un candidato a un job |
| **Interview** | Entrevista programada o realizada |
| **Offer** | Oferta de empleo a un candidato |
| **Pipeline** | Flujo de etapas por las que pasa un candidato |
| **Scorecard** | Evaluación estructurada de un candidato |

---

## dm-scoring

| Término | Definición |
|---------|------------|
| **Rubric** | Plantilla de evaluación con dimensiones y criterios |
| **Dimension** | Aspecto específico a evaluar (ej: "Comunicación") |
| **Scorable** | Cualquier cosa que puede ser evaluada |
| **Scorecard** | Resultado de una evaluación completa |
| **DimensionScore** | Puntuación en una dimensión específica |
| **Evidence** | Evidencia extraída que justifica una puntuación |
| **Calibration** | Proceso de alinear evaluaciones humanas y de IA |

---

## dm-events

| Término | Definición |
|---------|------------|
| **Event** | Evento programado (concierto, conferencia, etc.) |
| **Ticket** | Entrada para un evento |
| **Waitlist** | Lista de espera para un evento sold out |
| **Resale** | Reventa de tickets entre usuarios |
| **LiveSession** | Sesión en vivo durante un evento |
| **Venue** | Lugar donde se realiza el evento |

---

## dm-bar

| Término | Definición |
|---------|------------|
| **Product** | Producto vendible en el bar |
| **BarOrder** | Pedido en el bar |
| **PointOfSale** | Punto de venta (terminal) |
| **Inventory** | Inventario de productos |
| **Recipe** | Receta para productos compuestos |
| **PurchaseOrder** | Orden de compra a proveedores |

---

## dm-payments

| Término | Definición |
|---------|------------|
| **Payment** | Pago procesado |
| **Subscription** | Suscripción recurrente |
| **Refund** | Reembolso de un pago |
| **Payout** | Pago a terceros (proveedores, staff) |
| **CryptoRamp** | On-ramp/off-ramp para crypto |

---

## dm-staff

| Término | Definición |
|---------|------------|
| **Staff** | Empleado/colaborador |
| **Shift** | Turno de trabajo |
| **Schedule** | Horario/calendario de turnos |
| **ShiftAssignment** | Asignación de un staff a un turno |
| **Payroll** | Nómina/liquidación de pago |

---

## dm-web3

| Término | Definición |
|---------|------------|
| **Token** | Token fungible (ERC-20) |
| **NFT** | Token no fungible (ERC-721) |
| **SmartContract** | Contrato inteligente en blockchain |
| **Transaction** | Transacción en blockchain |
| **Wallet** | Billetera crypto |

---

## Patterns

| Término | Definición |
|---------|------------|
| **Result Pattern** | Patrón que retorna `success(data)` o `error(err)` en lugar de throw |
| **Factory Pattern** | Función `make*` que crea instancias con dependencias inyectadas |
| **Repository Pattern** | Abstracción para acceso a datos persistentes |
| **Decorator Pattern** | Patrón para agregar comportamiento cross-cutting (@Audit, @Cache) |

---

## Testing

| Término | Definición |
|---------|------------|
| **Unit Test** | Test aislado de una unidad, sin I/O real |
| **Integration Test** | Test que verifica integración con base de datos |
| **E2E Test** | Test end-to-end que simula flujo completo |
| **Test Context** | TenantContext de prueba con datos mock |

---

## Infrastructure

| Término | Definición |
|---------|------------|
| **Redis** | Cache distribuido y pub/sub |
| **Typesense** | Motor de búsqueda full-text |
| **BullMQ** | Cola de jobs para tareas asíncronas |
| **Drizzle ORM** | ORM usado para PostgreSQL |
| **Zod** | Librería de validación de schemas |
| **Circuit Breaker** | Patrón de resiliencia con estados closed/open/half_open para evitar cascading failures (usado en ResilientRedisClient) |
| **DLQ** | Dead Letter Queue -- cola donde se almacenan eventos fallidos para inspección y re-procesamiento |
| **DLQ Persistence** | Persistencia write-through de eventos fallidos en `core_failed_events` (PostgreSQL + memoria) |
| **Idempotency Key** | Clave única que previene el procesamiento duplicado de mutaciones (usado en dm-payments) |
| **Health Check** | Endpoint `/api/health` que verifica estado de DB + Redis, uptime y versión |
| **Statement Timeout** | Límite de 30s para ejecución de queries SQL (previene queries descontrolados) |
| **Structured Logger** | Logger con contexto (tenantId, correlationId, module) en lugar de `console.*`. Namespaces en app-platform: identity, tenancy, permissions, navigation, featureFlags |
| **handleApiError** | Wrapper de error handling estandarizado para API routes en app-platform (180/184 routes) |

---

## AI Token Economy

| Término | Definición |
|---------|------------|
| **Token** | Unidad de medida para consumo de AI (1 token = $0.001 USD por defecto) |
| **Token Wallet** | Balance de tokens por equipo (TeamTokenQuota) |
| **Token Transaction** | Movimiento en el ledger de tokens (purchase, allocation, consumption, etc.) |
| **Provider Rate** | Costo por uso de un provider AI específico (almacenado en `ai_provider_pricing`) |
| **Markup** | Porcentaje de ganancia aplicado sobre el costo del provider |
| **CostCalculatorService** | Servicio en dm-ia-chat que calcula el costo en Rottay Tokens |
| **ProviderConfigSchema** | Schema para generar UI dinámica de configuración por provider |
| **ConversationOutput** | Salida normalizada de una conversación AI con NormalizedTranscript |
| **TranscriptTurn** | Turno individual de una conversación con speaker attribution |
| **Turn-Aware Scoring** | Evaluación que referencia turnos específicos (turnIndex, turnRole) como evidencia |
