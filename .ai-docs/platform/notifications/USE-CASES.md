# platform/notifications - Use Cases

> **Multi-Channel Notification System**

**Total: 31 use cases (18 mutations, 13 queries)**

---

## Quick Index

### Mutations
- [send](#send) - Send, batch, schedule, resend
- [templates](#templates) - Template management
- [preferences](#preferences) - User preference management
- [in-app](#in-app) - In-app notification actions
- [webhooks](#webhooks) - Webhook processing
- [providers](#providers) - Provider configuration

### Queries
- [notifications (queries)](#notifications-1) - Notification retrieval
- [templates (queries)](#templates-1) - Template retrieval
- [preferences (queries)](#preferences-1) - Preference retrieval
- [in-app (queries)](#in-app-1) - In-app notification queries
- [analytics](#analytics) - Notification analytics
- [providers (queries)](#providers-1) - Provider health checks

---

## Overview

The **notifications** module provides a comprehensive multi-channel notification system for the platform. It handles sending notifications across multiple channels (email, SMS, push, in-app, webhooks), managing notification templates, user preferences, and delivery tracking.

**Key Capabilities:**
- Multi-channel delivery (email, SMS, push, in-app, webhook)
- Template-based notifications with variable substitution
- User preference management and subscription handling
- Scheduled and batch notification processing
- Delivery status tracking and analytics
- Provider health monitoring and failover

---

## Entities

| Entity | Description |
|--------|-------------|
| `Notification` | Individual notification record with recipient, channel, and content |
| `Template` | Reusable notification template with variable placeholders |
| `Preference` | User notification preferences per channel and type |
| `PushToken` | Device push notification token (Firebase/APNS) |
| `DeliveryLog` | Delivery attempt log with status and timestamps |
| `Provider` | Notification provider configuration (SendGrid, Twilio, etc.) |

---

## Mutations

### send
| Use Case | Factory | Description |
|----------|---------|-------------|
| send-notification | `makeSendNotificationUseCase()` | Sends individual notification |
| send-batch | `makeSendBatchUseCase()` | Sends notifications in batch |
| schedule-notification | `makeScheduleNotificationUseCase()` | Schedules notification for future delivery |
| cancel-scheduled | `makeCancelScheduledUseCase()` | Cancels scheduled notification |
| process-scheduled | `makeProcessScheduledUseCase()` | Processes scheduled notifications |
| resend-failed | `makeResendFailedUseCase()` | Resends failed notifications |

### templates
| Use Case | Factory | Description |
|----------|---------|-------------|
| create-template | `makeCreateTemplateUseCase()` | Creates notification template |
| update-template | `makeUpdateTemplateUseCase()` | Updates template |
| delete-template | `makeDeleteTemplateUseCase()` | Deletes template |

### preferences
| Use Case | Factory | Description |
|----------|---------|-------------|
| update-preferences | `makeUpdatePreferencesUseCase()` | Updates notification preferences |
| register-push-token | `makeRegisterPushTokenUseCase()` | Registers push notification token |
| remove-push-token | `makeRemovePushTokenUseCase()` | Removes push token |
| unsubscribe | `makeUnsubscribeUseCase()` | Unsubscribes from notifications |

### in-app
| Use Case | Factory | Description |
|----------|---------|-------------|
| mark-as-read | `makeMarkAsReadUseCase()` | Marks notification as read |
| mark-all-as-read | `makeMarkAllAsReadUseCase()` | Marks all notifications as read |
| archive-notification | `makeArchiveNotificationUseCase()` | Archives notification |

### webhooks
| Use Case | Factory | Description |
|----------|---------|-------------|
| process-webhook | `makeProcessWebhookUseCase()` | Processes provider webhook |

### providers
| Use Case | Factory | Description |
|----------|---------|-------------|
| configure-provider | `makeConfigureProviderUseCase()` | Configures notification provider |

---

## Queries

### notifications
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-notification | `makeGetNotificationUseCase()` | Gets notification by ID |
| get-notifications | `makeGetNotificationsUseCase()` | Lists notifications |
| get-in-app-notifications | `makeGetInAppNotificationsUseCase()` | Gets in-app notifications |
| get-unread-count | `makeGetUnreadCountUseCase()` | Gets unread notification count |

### templates
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-template | `makeGetTemplateUseCase()` | Gets template by ID |
| list-templates | `makeListTemplatesUseCase()` | Lists templates |
| preview-template | `makePreviewTemplateUseCase()` | Previews template with data |

### preferences
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-preferences | `makeGetPreferencesUseCase()` | Gets user preferences |
| can-receive | `makeCanReceiveUseCase()` | Checks if user can receive notification type |

### analytics
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-analytics | `makeGetAnalyticsUseCase()` | Gets notification analytics |
| get-delivery-status | `makeGetDeliveryStatusUseCase()` | Gets delivery status |
| get-delivery-stats | `makeGetDeliveryStatsUseCase()` | Gets delivery statistics |

### providers
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-provider-health | `makeGetProviderHealthUseCase()` | Gets provider health status |

---

## Notification Channels

```typescript
type NotificationChannel =
  | 'email'       // Email via SendGrid/SES
  | 'sms'         // SMS via Twilio
  | 'push'        // Push notifications (Firebase/APNS)
  | 'in_app'      // In-app notifications
  | 'webhook';    // Webhook to external system
```

---

## Notification Priority

```typescript
type NotificationPriority =
  | 'low'         // Can wait
  | 'normal'      // Standard delivery
  | 'high'        // High priority
  | 'critical';   // Immediate delivery
```

---

## Delivery Status

```typescript
type DeliveryStatus =
  | 'pending'     // Pending delivery
  | 'queued'      // In queue
  | 'sending'     // Sending
  | 'delivered'   // Delivered
  | 'failed'      // Failed
  | 'bounced'     // Bounced (email)
  | 'clicked'     // Link clicked (email)
  | 'opened';     // Opened (email)
```

---

## Template Variables

```typescript
interface TemplateContext {
  user: {
    name: string;
    email: string;
  };
  tenant: {
    name: string;
    logo?: string;
  };
  data: Record<string, unknown>;  // Specific variables
}
```

---

## Usage Example

```typescript
// Send notification
await sendNotification.execute({
  templateId: 'welcome-email',
  channel: 'email',
  recipientId: user.id,
  data: {
    userName: user.name,
    activationLink: 'https://...',
  },
  priority: 'high',
}, context);
```

---

## Related

| Module | Relationship |
|--------|--------------|
| [platform/users](../users/USE-CASES.md) | User data for recipients and preferences |
| [platform/tenants](../tenants/USE-CASES.md) | Tenant branding for templates |
| [platform/jobs](../jobs/USE-CASES.md) | Background job processing for scheduled/batch notifications |
| [platform/analytics](../analytics/USE-CASES.md) | Notification metrics and reporting |
| [platform/audit](../audit/USE-CASES.md) | Notification activity logging |
