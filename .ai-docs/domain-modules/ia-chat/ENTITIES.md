# dm-ia-chat - Entities

> **Entidades del módulo de chat con IA**

---

## Entidades Principales

### Agent

Configuración de un agente de IA.

```typescript
interface Agent {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  providerId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  tools: AgentTool[];
  knowledgeBaseIds: string[];
  isDefault: boolean;
  version: number;
  status: AgentStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type AgentStatus = 'draft' | 'active' | 'deprecated';

interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}
```

### Provider

Proveedor de servicios de IA.

```typescript
interface Provider {
  id: string;
  tenantId: string;
  code: string;           // e.g., 'openai', 'anthropic'
  name: string;
  type: ProviderType;
  baseUrl?: string;
  apiKey: string;         // Encrypted
  isDefault: boolean;
  isActive: boolean;
  settings: ProviderSettings;
  quotaLimits: QuotaLimits;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type ProviderType =
  | 'chat'
  | 'stt'
  | 'tts'
  | 'embedding'
  | 'image'
  | 'moderation';

interface ProviderSettings {
  timeout: number;
  retries: number;
  rateLimit: number;
  customHeaders?: Record<string, string>;
}
```

### Model

Modelo de IA disponible.

```typescript
interface Model {
  id: string;
  tenantId: string;
  providerId: string;
  externalId: string;     // e.g., 'gpt-4-turbo'
  name: string;
  type: ModelType;
  capabilities: ModelCapabilities;
  pricing: ModelPricing;
  contextWindow: number;
  maxOutputTokens: number;
  isDefault: boolean;
  isDeprecated: boolean;
  deprecatedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type ModelType = 'chat' | 'completion' | 'embedding' | 'stt' | 'tts' | 'image';

interface ModelCapabilities {
  streaming: boolean;
  functionCalling: boolean;
  vision: boolean;
  json: boolean;
}

interface ModelPricing {
  inputTokens: number;    // per 1M tokens
  outputTokens: number;   // per 1M tokens
  currency: string;
}
```

### Config

Configuración de provider por tenant.

```typescript
interface Config {
  id: string;
  tenantId: string;
  providerId: string;
  name: string;
  type: ProviderType;
  priority: number;
  settings: ConfigSettings;
  fallbackConfigId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface ConfigSettings {
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  customEndpoint?: string;
}
```

### Usage

Registro de uso de IA.

```typescript
interface Usage {
  id: string;
  tenantId: string;
  userId: string;
  providerId: string;
  modelId: string;
  type: UsageType;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  currency: string;
  latencyMs: number;
  success: boolean;
  errorCode?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

type UsageType =
  | 'chat'
  | 'completion'
  | 'embedding'
  | 'transcription'
  | 'synthesis'
  | 'image';
```

### Health

Estado de salud de un provider.

```typescript
interface Health {
  id: string;
  providerId: string;
  status: HealthStatus;
  latencyMs: number;
  errorRate: number;
  lastCheckAt: Date;
  circuitState: CircuitState;
  circuitOpenedAt?: Date;
  consecutiveFailures: number;
  metadata: Record<string, unknown>;
}

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

type CircuitState = 'closed' | 'open' | 'half_open';
```

---

## Entidades de Soporte

### ApiKey

```typescript
interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyHash: string;
  prefix: string;          // First 8 chars for display
  scopes: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Quota

Limites de uso y cuotas por proveedor/tenant.

```typescript
interface Quota {
  id: string;
  tenantId: string;
  providerId: string;
  metricType: UsageMetricType;
  billingCycle: BillingCycle;
  limit: number;
  used: number;
  resetAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';
```

### Request

Registro de solicitudes individuales a proveedores de IA.

```typescript
interface Request {
  id: string;
  tenantId: string;
  providerId: string;
  modelId: string;
  configId?: string;
  modelType: string;
  status: RequestStatus;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  cost: number;
  errorCode?: string;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type RequestStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
```

### Cache

Cache de respuestas de IA para reducir latencia y costos.

```typescript
interface Cache {
  id: string;
  tenantId: string;
  providerId: string;
  modelId: string;
  modelType: string;
  cacheKey: string;
  inputHash: string;
  response: Record<string, unknown>;
  tokensUsed: number;
  expiresAt: Date;
  hitCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Webhook

Configuración de webhooks para eventos de proveedores.

```typescript
interface Webhook {
  id: string;
  tenantId: string;
  providerId: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  secret: string;
  lastDeliveryAt?: Date;
  failureCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type WebhookStatus = 'active' | 'inactive' | 'failed';
```

### AuditLog

Registro de auditoría de operaciones de proveedores de IA.

```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  actorType: ActorType;
  actorId: string;
  changes: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

type AuditAction = 'create' | 'update' | 'delete' | 'enable' | 'disable' | 'rotate_key';
type ActorType = 'user' | 'system' | 'api_key';
```

---

## Relaciones

```
Provider    1──*  Model
Provider    1──*  Config
Config      1──1  Config (fallback)
Provider    1──*  ApiKey
Provider    1──*  Quota
Provider    1──1  Health
Provider    1──*  Webhook
Provider    1──*  Request
Provider    1──*  Cache
Agent       *──1  Provider
Usage       *──1  Provider
Usage       *──1  Model
Request     *──1  Model
Request     *──1  Config
Cache       *──1  Model
```

---

## Database Tables

Complete mapping of all 12 ai-providers module database tables (exported from index.ts).

All tables have: `id` (UUID PK), `tenant_id`, `is_active`, `created_at`, `updated_at`, `created_by`, `updated_by`.

### Core Provider Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Provider | `ai_providers` | tenant_id, code, name, type, status, hosting, base_url | AI provider registration (openai, anthropic, elevenlabs, etc.) |
| Model | `ai_provider_models` | tenant_id, provider_id, external_id, name, type, status, context_window, pricing (JSONB) | Voice/Chat/STT/TTS models per provider |
| Config | `ai_provider_configs` | tenant_id, provider_id, name, status, priority, default_model, fallback_config_id | Tenant-specific provider configuration |
| ApiKey | `ai_provider_api_keys` | tenant_id, provider_id, name, key_hash, prefix, status, scopes, expires_at | Encrypted API key management |

### Usage & Quota Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Usage | `ai_provider_usage` | tenant_id, provider_id, model_id, config_id, metric_type, input_tokens, output_tokens, cost | Usage tracking per tenant/provider |
| Quota | `ai_provider_quotas` | tenant_id, provider_id, metric_type, billing_cycle, limit, used, reset_at | Rate limits and quotas |

### Health & Monitoring Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Health | `ai_provider_health` | provider_id, status, latency_ms, error_rate, circuit_state, consecutive_failures | Provider health and circuit breaker state |

### Request & Cache Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Request | `ai_provider_requests` | tenant_id, provider_id, model_id, config_id, model_type, status, tokens, latency_ms, cost | Individual request logging |
| Cache | `ai_provider_cache` | tenant_id, provider_id, model_id, model_type, cache_key, input_hash, response (JSONB), expires_at | Response caching for cost/latency reduction |

### Webhook & Audit Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Webhook | `ai_provider_webhooks` | tenant_id, provider_id, url, events, status, secret, failure_count | Webhook configuration for provider events |
| AuditLog | `ai_provider_audit_logs` | tenant_id, action, entity_type, entity_id, actor_type, actor_id, changes (JSONB) | Compliance audit logging |

### Agent Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Agent | `ai_agents` | tenant_id, name, type, provider, system_prompt, model, tools (JSONB), status | AI agent configuration |

### Additional Tables (Not Yet Exported from Index)

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| ProviderPricing | `ai_provider_pricing` | tenant_id, provider_id, model_type, pricing tiers | Provider pricing configuration |
| PricingConfig | `ai_pricing_config` | tenant_id, pricing rules | Pricing rule configuration |
