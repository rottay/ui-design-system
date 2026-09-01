# Evnto Opportunities

## Top Recommendations

### 1. Multi-venue / event-night command center

Evnto’s control-room energy is currently spread across several separate operational surfaces.

Proof:

- [events control room](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/events/screens/control-room/index.tsx)
- [staff command](/Users/daniel/Developer/Rottay/app-evnto/src/features/venue-operations/staff/screens/command/index.tsx)
- [CommandCenterSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/workspace/command-center/index.tsx)

### 2. Coverage-first staffing matrix

Staffing should become dispatch-oriented, not just card/review-oriented.

Proof:

- [staffing event detail](/Users/daniel/Developer/Rottay/app-evnto/src/features/venue-operations/staffing/screens/event-detail/index.tsx)
- [staff schedule](/Users/daniel/Developer/Rottay/app-evnto/src/features/venue-operations/staff/screens/schedule/index.tsx)
- [PatternShiftMatrix](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/workflow/shift-matrix/ShiftMatrix.types.ts)

### 3. Cross-domain approvals desk

Purchasing, event finance, and payroll approvals are still fragmented.

Proof:

- [purchasing detail](/Users/daniel/Developer/Rottay/app-evnto/src/features/commerce-operations/purchasing/screens/detail/index.tsx)
- [settlement ops](/Users/daniel/Developer/Rottay/app-evnto/src/features/finance-operations/payroll/screens/settlement-ops/index.tsx)
- [PatternApprovalInbox](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/workflow/approval-inbox/ApprovalInbox.types.ts)

### 4. VIP reservation workflow board

The VIP workbench is already close to a Kanban product and should be promoted accordingly.

Proof:

- [vip workbench](/Users/daniel/Developer/Rottay/app-evnto/src/features/venue-operations/vip-tables/screens/workbench/index.tsx)
- [KanbanSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/operations/kanban/index.tsx)

### 5. Run-of-show scheduler

Lineup/stage planning is asking for a scheduler, not just timeline cards.

Proof:

- [lineup screen](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/events/screens/lineup/index.tsx)
- [SchedulerSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/operations/scheduler/index.tsx)
- [PatternCalendarView](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/visualization/calendar-view/CalendarView.types.ts)

### 6. Operational ledger for stock, payroll, and finance

Evnto already has multiple audit-trail-heavy domains that fit a single ledger grammar.

Proof:

- [stock ledger](/Users/daniel/Developer/Rottay/app-evnto/src/features/commerce-operations/inventory/screens/ledger/index.tsx)
- [settlement ops](/Users/daniel/Developer/Rottay/app-evnto/src/features/finance-operations/payroll/screens/settlement-ops/index.tsx)
- [PatternOperationalLedger](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/workflow/operational-ledger/OperationalLedger.types.ts)

### 7. Draft-safe setup flows

Onboarding and cloning flows are expensive enough to deserve autosave, recovery, and undo/redo.

Proof:

- [onboarding](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/onboarding/screens/main/index.tsx)
- [clone wizard](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/events/screens/clone/index.tsx)
- [undo-redo hook](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/infrastructure/runtime/application/state/undo-redo/index.ts)

### 8. Real export / report pack

Export/report behavior is still too ad hoc and too placeholder-heavy.

Proof:

- [events list export](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/events/screens/list/index.tsx)
- [staff list export](/Users/daniel/Developer/Rottay/app-evnto/src/features/venue-operations/staff/screens/list/index.tsx)
- [reports hub](/Users/daniel/Developer/Rottay/app-evnto/src/features/intelligence-admin/reports/screens/hub/index.tsx)
- [useTableExport](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/infrastructure/runtime/application/data/runtime/table-export/index.ts)

### 9. Threaded collaboration on critical records

Events and suppliers want threaded rationale and handoff context, not just passive activity logs.

Proof:

- [event detail activity](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/events/components/event-detail/index.tsx)
- [supplier detail activity](/Users/daniel/Developer/Rottay/app-evnto/src/features/commerce-operations/suppliers/screens/detail/index.tsx)
- [PatternCommentThread](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/communication/comment-thread/CommentThread.types.ts)

### 10. Media and document operations workspace

Event media and purchasing receipts are close enough to share one operating model.

Proof:

- [event media](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/events/screens/media/index.tsx)
- [purchasing receipts](/Users/daniel/Developer/Rottay/app-evnto/src/features/commerce-operations/purchasing/screens/receipts/index.tsx)
- [PatternFileManager](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/misc/file-manager/FileManager.types.ts)
- [PatternModerationGallery](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/workflow/moderation-gallery/ModerationGallery.types.ts)

### 11. Keyboard-first operator mode

Evnto would benefit hugely from contextual command registration and shortcuts overlays on live nights.

Proof:

- [command palette](/Users/daniel/Developer/Rottay/app-evnto/src/ui/command-palette/index.tsx)
- [command items](/Users/daniel/Developer/Rottay/app-evnto/src/ui/command-palette/use-command-items.ts)
- [useRegisterCommands](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/infrastructure/runtime/application/commands/index.ts)

### 12. Notification escalation matrix

Notification preferences are duplicated and should graduate into a richer escalation product.

Proof:

- [settings notifications](/Users/daniel/Developer/Rottay/app-evnto/src/features/settings/screens/tabs/notifications-tab/index.tsx)
- [admin settings notifications](/Users/daniel/Developer/Rottay/app-evnto/src/features/intelligence-admin/settings/screens/tabs/notifications-tab/index.tsx)
- [useNotificationPreferences](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/infrastructure/runtime/application/notifications/index.ts)

## Best Sequence

Highest near-term ROI:

1. command center
2. approvals desk
3. draft-safe setup
4. VIP workflow board
5. operational ledger
