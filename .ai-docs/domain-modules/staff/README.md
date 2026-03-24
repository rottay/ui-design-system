# Staff Module (dm-staff)

> **Staff management, scheduling, and payroll for events**

## What It Does

The Staff module provides complete workforce management for event operations. It handles staff profiles with skills and certifications, shift scheduling with swap requests, real-time time tracking, credential management for access control, and payroll processing.

The module supports staffing requirements per event, invitation workflows for shift assignments, and comprehensive payroll with bonuses and deductions. Staff credentials can grant zone-based access at venues.

## When to Use

- **Staff Profiles**: Manage staff with skills and certifications
- **Scheduling**: Create and manage shift schedules
- **Staffing**: Assign staff to event requirements
- **Time Tracking**: Clock in/out and break management
- **Credentials**: Issue and manage access credentials
- **Payroll**: Calculate and process staff payments

## Key Concepts

| Concept | Description |
|---------|-------------|
| **StaffMember** | Staff profile with skills |
| **Shift** | Scheduled work period |
| **StaffingRequirement** | Event staffing need |
| **Credential** | Access badge/credential |
| **TimeRecord** | Clock in/out record |
| **Settlement** | Payroll settlement |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 70 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Staff management
import { makeCreateStaffMemberUC, makeAddSkillUC, makeAddCertificationUC } from '@rottay/staff';

// Scheduling
import { makeCreateShiftUC, makeAssignToShiftUC, makeRequestShiftSwapUC } from '@rottay/staff';

// Time tracking
import { makeCheckInUC, makeCheckOutUC, makeStartBreakUC } from '@rottay/staff';

// Credentials
import { makeGenerateCredentialUC, makeGrantZoneAccessUC } from '@rottay/staff';

// Payroll
import { makeCalculatePayrollUC, makeGenerateSettlementUC, makeApproveSettlementUC } from '@rottay/staff';
```

## Shift Status Flow

```typescript
type ShiftStatus =
  | 'scheduled'   // Shift scheduled
  | 'confirmed'   // Staff confirmed
  | 'in_progress' // Shift ongoing
  | 'completed'   // Shift finished
  | 'cancelled'   // Shift cancelled
  | 'no_show';    // Staff didn't show
```

## REVIEW-2026: Result Pattern Migration

- **Status**: Complete -- ALL 70 use cases migrated
- **Codebase**: ~50K LOC
- **Pattern**: All use cases return `Result<T>` using `createSuccessResult(data)` and `createErrorResult(code, message, details)` from `@rottay/core`
- **Previous pattern**: Mixed throwing errors and manual `{ success: true/false }` objects
- Mutations inherit from `BaseMutationUseCase`, queries from `BaseQueryUseCase`

## Related Modules

- [Events](../events/) - Event staffing requirements
- [Bar](../bar/) - Bar staff operations
- [Payments](../payments/) - Staff payroll payments
