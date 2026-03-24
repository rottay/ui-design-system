# Notifications Module

> **Multi-channel notification system: Email, SMS, Push, In-App**

## What It Does

The Notifications module provides a unified notification system supporting multiple channels including email, SMS, push notifications, and in-app messages. It handles template management, user preferences, scheduling, and delivery tracking.

The module integrates with providers like SendGrid, Twilio, and Firebase for actual delivery. It supports priority levels, batch sending, and automatic retry for failed deliveries. Users can manage their notification preferences per channel and notification type.

## When to Use

- **Transactional Email**: Send verification, receipts, alerts
- **SMS Notifications**: Time-sensitive alerts
- **Push Notifications**: Mobile app engagement
- **In-App Messages**: UI notifications and badges
- **Scheduled Notifications**: Future delivery scheduling
- **Notification Preferences**: User opt-in/opt-out management

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Notification** | Individual notification message |
| **Template** | Reusable notification template |
| **Preference** | User channel preferences |
| **PushToken** | Device push notification token |
| **DeliveryStatus** | Notification delivery state |

## REVIEW-2026 Changes

### Phase 1.3 - CommunicationsWorker Services (COMPLETE)

- **INotificationService implementation**: DONE
  - `NotificationServiceAdapter` in `config/di/workers/communications-worker/index.ts`
  - Routes to existing providers: SendGrid (email), Twilio (SMS), Firebase (push)
  - Template resolution via TemplateRepositoryPort
  - Slack channel: logged but not implemented (TODO: add Slack provider)

- **IWebhookService implementation**: DONE
  - `WebhookServiceAdapter` in `config/di/workers/communications-worker/index.ts`
  - HTTP POST to tenant-configured endpoints (env-based config)
  - HMAC-SHA256 payload signing when webhook secret is available
  - Retry logic with exponential backoff (3 attempts, 10s timeout)
  - Standard headers: Content-Type, X-Event-Type, X-Event-Id, X-Webhook-Signature
  - Endpoint resolution: `WEBHOOK_{TYPE}_{TENANT}_URL` or `WEBHOOK_{TYPE}_URL` env vars

- **Worker bootstrap**: WIRED
  - `startWiredCommunicationsWorker()` called by WorkerOrchestrator
  - Automatically injects NotificationServiceAdapter and WebhookServiceAdapter
  - Controlled by `WORKER_COMMUNICATIONS_ENABLED` env var (default: true)
  - Exported via `@rottay/notifications/workers` entry point

- EventRouter now correctly routes events to `communications-events` queue
- 73+ events in EVENT_REGISTRY (now 354 total events) have notification config
- 31 use cases total (confirmed)

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 31 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Sending
import { makeSendNotificationUC, makeSendBatchUC, makeScheduleNotificationUC } from '@rottay/notifications';

// Templates
import { makeCreateTemplateUC, makePreviewTemplateUC } from '@rottay/notifications';

// Preferences
import { makeUpdatePreferencesUC, makeRegisterPushTokenUC } from '@rottay/notifications';

// In-app
import { makeMarkAsReadUC, makeGetUnreadCountUC } from '@rottay/notifications';
```

## Notification Channels

```typescript
type NotificationChannel =
  | 'email'    // Email via SendGrid/SES
  | 'sms'      // SMS via Twilio
  | 'push'     // Push via Firebase/APNS
  | 'in_app'   // In-app notifications
  | 'webhook'; // External webhooks
```

## Session 2026-02-06 Changes

- **Welcome email wired to tenant creation**: When a new tenant is created via `tenancy.tenant.created` event, a welcome email is automatically dispatched through the CommunicationsWorker
- **Status change notification wired to tenant activation**: When a tenant status changes (e.g., activated) via `tenancy.tenant.status_changed` event, the appropriate notification is sent to tenant admins
- **Webhook signature verification**: Inbound webhooks from SendGrid, Twilio, Mailgun, and SES now verify signatures before processing

## Database Tables

All tables use the `ntf_` prefix. Schema files located in `platform/packages/platform/notifications/adapters/out/persistence/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Notification | `ntf_notifications` | id, tenant_id, user_id, type, channel, subject, body, priority, status, sent_at, is_active | Core notification records. Channels: email, sms, push, in_app, webhook. |
| DeliveryLog | `ntf_delivery_logs` | id, tenant_id, notification_id, channel, provider, status, error, attempts, delivered_at | Per-channel delivery tracking with retry info. |
| InAppNotification | `ntf_in_app_notifications` | id, tenant_id, user_id, title, body, type, action_url, read_at, is_active | In-app notification inbox with read tracking. |
| Template | `ntf_templates` | id, tenant_id, name, key, channel, subject, body, variables, is_active | Reusable notification templates. |
| TemplateVersion | `ntf_template_versions` | id, tenant_id, template_id, version, subject, body, is_active, created_at | Template version history. |
| Preference | `ntf_preferences` | id, tenant_id, user_id, channel, notification_type, enabled, is_active | User notification preferences per channel/type. |
| Scheduled | `ntf_scheduled` | id, tenant_id, notification_id, scheduled_at, status, executed_at, is_active | Future delivery scheduling. |
| ProviderConfig | `ntf_provider_configs` | id, tenant_id, channel, provider, credentials (encrypted), priority, is_active | Per-tenant notification provider configs (SendGrid, Twilio, Firebase). |
| Unsubscribe | `ntf_unsubscribes` | id, tenant_id, user_id, email, channel, notification_type, reason, unsubscribed_at | CAN-SPAM/GDPR unsubscribe tracking. |
| NotificationEvent | `ntf_notification_events` | id, tenant_id, notification_id, event_type, metadata, created_at | Notification lifecycle events (sent, delivered, opened, clicked, bounced). |

## Related Modules

- [Auth](../auth/) - Verification emails, MFA codes
- [Identity](../identity/) - User contact information
- [Compliance](../compliance/) - GDPR consent for communications
