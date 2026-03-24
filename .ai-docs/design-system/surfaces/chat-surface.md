# ChatSurface

> Source: `ui-design-system/packages/core/src/components/surfaces/chat/index.tsx`

## Purpose

Reusable conversation surface for AI assistants, support inboxes, and operator messaging workflows. Owns layout, transcript scaffolding, composer behavior, and personality-aware motion. Deliberately delegates rich message rendering to assistant patterns so the shell stays vendor-agnostic.

## Config Structure

### ChatSurfaceConfig

```typescript
interface ChatSurfaceConfig {
  visual: ChatSurfaceVisualConfig;
  presentation: ChatSurfacePresentationConfig;
  behavior: ChatSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

### Visual (ChatSurfaceVisualConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxWidth` | `number \| string` | -- | Max chat area width |
| `sidebarWidth` | `number \| string` | -- | Sidebar width (conversation list) |
| `composerRows` | `number` | `4` | Visible rows in composer textarea |
| `transcriptHeight` | `number \| string` | `520` | Transcript scroll area height |
| `stackOnMobile` | `boolean` | `true` | Stack sidebar below chat on mobile |
| `stackOnTablet` | `boolean` | -- | Stack on tablet |
| `hideListOnMobile` | `boolean` | `true` (builder) | Hide conversation list sidebar on mobile |
| `stickyInputOnMobile` | `boolean` | `true` (builder) | Sticky composer at bottom on mobile |

### Presentation (ChatSurfacePresentationConfig)

| Property | Type | Description |
|----------|------|-------------|
| `chrome` | `SurfacePageChrome` | Page title, breadcrumbs |
| `headerContent` | `ReactNode` | Extra header (participant list, call controls) |
| `sidebar` | `ReactNode` | Sidebar content (conversation list, contact info) |
| `emptyState` | `ReactNode` | Shown when transcript is empty |
| `composerPlaceholder` | `string` | Composer input placeholder |
| `renderMessage` | `(message, index) => ReactNode` | Custom message renderer |
| `renderPart` | `(part, context) => ReactNode` | Custom AI message part renderer |
| `footer` | `ReactNode` | Footer content |

### Behavior (ChatSurfaceBehaviorConfig)

| Property | Type | Description |
|----------|------|-------------|
| `messages` | `ChatSurfaceMessage[]` | **Required** -- ordered message list (oldest first) |
| `draft` | `string` | Current composer text (controlled) |
| `onDraftChange` | `(value) => void` | Draft change callback |
| `onSend` | `(value) => void \| Promise<void>` | Send message handler |
| `sendLabel` | `string` | Send button label (default: i18n "Send") |
| `sending` | `boolean` | Loading state for send button |
| `assistantTyping` | `boolean` | Show typing indicator |
| `typingLabel` | `string` | Typing indicator label |
| `actions` | `SurfaceAction<void>[]` | Page-level actions |

### ChatSurfaceMessage

```typescript
interface ChatSurfaceMessage {
  id: string;
  author: ReactNode;                          // Display name
  body?: ReactNode;                           // Simple message body
  parts?: AssistantMessagePart[];             // Structured AI parts (text, code, tool calls)
  timestamp?: ReactNode;
  avatar?: ReactNode;
  meta?: ReactNode;                           // "edited", "via API"
  attachments?: ReactNode;                    // Files, images below body
  status?: ReactNode;                         // Custom status indicator
  align?: 'start' | 'end';                   // Incoming vs outgoing
  role?: AssistantMessageRole;                // 'user' | 'assistant' | 'system' | 'tool'
  deliveryStatus?: AssistantDeliveryStatus;   // sent, delivered, read, failed
  streaming?: boolean;                        // Still being streamed (AI typing)
}
```

## Props Interface

```typescript
interface ChatSurfaceProps {
  config: ChatSurfaceConfig;
  loading?: boolean;
}
```

## Builder Function

```typescript
function createChatSurfaceConfig(
  config: ChatSurfaceConfig
): ChatSurfaceConfig
```

Mobile-first defaults:
- `hideListOnMobile: true`
- `stickyInputOnMobile: true`

## Internal Composition

### Patterns Used
- **MessageBubble**: Default message rendering with parts, avatar, timestamp, delivery status
- **TypingIndicator**: Animated typing dots for AI assistant

### Primitives Used
- `Box`, `Button`, `Card`, `Grid`, `Stack`, `Text`, `Textarea`

### Surface Infrastructure
- **PageShellSurface**: Page chrome wrapper
- **SurfaceActionBar**: Permission-aware page actions
- **SurfaceSectionCard**: Card wrapper for conversation and composer sections
- **SurfaceEmptyState**: Empty transcript state
- **FadeIn / StaggerChildren**: Entrance animations (personality-driven)
- **SurfaceAccentBarWrapper**: Accent bar

### Key Internal Logic

1. **Message normalization**: Legacy `body` fields are auto-promoted to `AssistantMessagePart[]` for backward compatibility
   - String body becomes `{ type: 'text', content: String(body), streaming }`
   - Non-primitive bodies become `{ type: 'artifact', content: body }`
   - Attachments appended only when not already in parts array
2. **Controlled/uncontrolled composer**: When `draft` is provided, app owns state; otherwise surface manages internal state with `useState`
3. **Send lifecycle**: Async `onSend` support with auto-clear of internal draft on completion
4. **Typing speed**: Personality `pulseSpeed` token drives TypingIndicator animation duration (fast: 0.8s, slow: 1.8s, normal: 1.2s)
5. **Transcript area**: Scrollable with `role="log"` and `aria-live="polite"` for accessibility
6. **Sidebar layout**: 12-column grid with 8/4 split when sidebar exists and viewport is wide enough
7. **Accent-aware composer**: When personality accent bar is active, composer gets a matching primary border color
8. **Entrance animation**: Messages stagger-animate as a coordinated group when `animateEntrance` is enabled

## Usage Example

```typescript
const config = createChatSurfaceConfig({
  visual: { transcriptHeight: 600 },
  presentation: {
    chrome: { title: 'AI Assistant' },
    composerPlaceholder: 'Ask me anything...',
    sidebar: <ConversationList />,
  },
  behavior: {
    messages: chatMessages,
    onSend: async (text) => {
      await sendMessage(text);
    },
    assistantTyping: isThinking,
    typingLabel: 'AI is thinking...',
  },
});

<ChatSurface config={config} loading={isLoading} />
```
