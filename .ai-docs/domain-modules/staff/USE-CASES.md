# dm-staff - Use Cases

> **Staff Management and Scheduling**

**Total: 70 use cases (45 mutations, 25 queries) | 70 zero-arg factories (100% coverage)**

**REVIEW-2026 Result Pattern**: ALL 70 use cases migrated. Uses `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. ~50K LOC.

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [staff-member](#staff-member)
  - [scheduling](#scheduling)
  - [staffing](#staffing)
  - [time-tracking](#time-tracking)
  - [credentials](#credentials)
  - [payroll](#payroll)
- [Queries](#queries)
  - [staff-member](#staff-member-1)
  - [scheduling](#scheduling-1)
  - [staffing](#staffing-1)
  - [time-tracking](#time-tracking-1)
  - [credentials](#credentials-1)
  - [payroll](#payroll-1)
- [Entities](#entities)
- [Related](#related)

---

## Overview

> **Staff Management and Scheduling**

The Staff module handles comprehensive personnel management for events and venues. It covers the complete lifecycle of staff members including profile management, skill tracking, certifications, shift scheduling, time tracking, credential management, and payroll processing.

**Total: 70 use cases (45 mutations, 25 queries)** | ~50K LOC

**REVIEW-2026 Result Pattern**: ALL 70 use cases return `Result<T>` via `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. No more thrown errors or manual `{ success: true/false }` objects.

---

## Mutations

### staff-member
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Creates staff profile | CreateStaffMemberUseCase |
| update | Updates staff | UpdateStaffMemberUseCase |
| update-status | Changes status | UpdateStaffStatusUseCase |
| set-availability | Sets availability | SetAvailabilityUseCase |
| add-skill | Adds skill | AddSkillUseCase |
| remove-skill | Removes skill | RemoveSkillUseCase |
| add-certification | Adds certification | AddCertificationUseCase |
| verify-certification | Verifies certification | VerifyCertificationUseCase |
| create-evaluation | Creates performance evaluation | CreateEvaluationUseCase |

### scheduling
| Use Case | Description | Class |
|----------|-------------|-------|
| create-shift | Creates shift | CreateShiftUseCase |
| update-shift | Updates shift | UpdateShiftUseCase |
| delete-shift | Deletes shift | DeleteShiftUseCase |
| assign-to-shift | Assigns staff to shift | AssignToShiftUseCase |
| unassign-from-shift | Unassigns from shift | UnassignFromShiftUseCase |
| confirm-shift-assignment | Confirms assignment | ConfirmShiftAssignmentUseCase |
| start-shift | Starts shift | StartShiftUseCase |
| request-shift-swap | Requests swap | RequestShiftSwapUseCase |
| approve-swap-request | Approves swap | ApproveSwapRequestUseCase |
| reject-swap-request | Rejects swap | RejectSwapRequestUseCase |

### staffing
| Use Case | Description | Class |
|----------|-------------|-------|
| create-requirement | Creates staffing requirement | CreateRequirementUseCase |
| update-requirement | Updates requirement | UpdateRequirementUseCase |
| assign-staff | Assigns staff | AssignStaffUseCase |
| unassign-staff | Unassigns staff | UnassignStaffUseCase |
| confirm-assignment | Confirms assignment | ConfirmAssignmentUseCase |
| decline-assignment | Declines assignment | DeclineAssignmentUseCase |
| send-invitation | Sends invitation | SendInvitationUseCase |
| respond-to-invitation | Responds to invitation | RespondToInvitationUseCase |

### time-tracking
| Use Case | Description | Class |
|----------|-------------|-------|
| check-in | Records check-in | CheckInUseCase |
| check-out | Records check-out | CheckOutUseCase |
| start-break | Starts break | StartBreakUseCase |
| end-break | Ends break | EndBreakUseCase |

### credentials
| Use Case | Description | Class |
|----------|-------------|-------|
| generate-credential | Generates credential | GenerateCredentialUseCase |
| activate-credential | Activates credential | ActivateCredentialUseCase |
| revoke-credential | Revokes credential | RevokeCredentialUseCase |
| suspend-credential | Suspends credential | SuspendCredentialUseCase |
| grant-zone-access | Grants zone access | GrantZoneAccessUseCase |
| revoke-zone-access | Revokes zone access | RevokeZoneAccessUseCase |

### payroll
| Use Case | Description | Class |
|----------|-------------|-------|
| calculate-payroll | Calculates payroll | CalculatePayrollUseCase |
| generate-settlement | Generates settlement | GenerateSettlementUseCase |
| approve-settlement | Approves settlement | ApproveSettlementUseCase |
| approve-payroll | Approves payroll | ApprovePayrollUseCase |
| process-settlement | Processes settlement | ProcessSettlementUseCase |
| record-payment | Records payment | RecordPaymentUseCase |
| add-bonus | Adds bonus | AddBonusUseCase |
| add-deduction | Adds deduction | AddDeductionUseCase |

---

## Queries

### staff-member
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Gets staff by ID | GetStaffByIdQuery |
| list | Lists staff | ListStaffQuery |
| get-availability | Gets availability | GetAvailabilityQuery |
| get-skills | Gets skills | GetSkillsQuery |
| get-certifications | Gets certifications | GetCertificationsQuery |

### scheduling
| Use Case | Description | Class |
|----------|-------------|-------|
| get-shift-schedule | Gets shift schedule | GetShiftScheduleQuery |
| get-staff-shifts | Gets staff shifts | GetStaffShiftsQuery |
| list-shift-assignments | Lists assignments | ListShiftAssignmentsQuery |
| get-swap-requests | Gets swap requests | GetSwapRequestsQuery |

### staffing
| Use Case | Description | Class |
|----------|-------------|-------|
| get-event-requirements | Gets event requirements | GetEventRequirementsQuery |
| get-staff-assignments | Gets staff assignments | GetStaffAssignmentsQuery |
| get-pending-invitations | Gets pending invitations | GetPendingInvitationsQuery |
| get-waiting-list | Gets waiting list | GetWaitingListQuery |

### time-tracking
| Use Case | Description | Class |
|----------|-------------|-------|
| get-check-in-status | Gets check-in status | GetCheckInStatusQuery |
| get-event-check-ins | Gets event check-ins | GetEventCheckInsQuery |
| get-time-records | Gets time records | GetTimeRecordsQuery |

### credentials
| Use Case | Description | Class |
|----------|-------------|-------|
| get-staff-credentials | Gets staff credentials | GetStaffCredentialsQuery |
| get-event-credentials | Gets event credentials | GetEventCredentialsQuery |
| validate-credential | Validates credential | ValidateCredentialQuery |

### payroll
| Use Case | Description | Class |
|----------|-------------|-------|
| get-payroll-summary | Gets payroll summary | GetPayrollSummaryQuery |
| get-staff-earnings | Gets staff earnings | GetStaffEarningsQuery |
| get-pending-settlements | Gets pending settlements | GetPendingSettlementsQuery |
| get-payment-history | Gets payment history | GetPaymentHistoryQuery |
| list-payroll-periods | Lists payroll periods | ListPayrollPeriodsQuery |
| get-payroll-dashboard-stats | Gets payroll dashboard stats | GetPayrollDashboardStatsQuery |

---

## Entities

### Staff Status

```typescript
type StaffStatus =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'terminated';
```

### Shift Status

```typescript
type ShiftStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';
```

### Assignment Status

```typescript
type AssignmentStatus =
  | 'pending'
  | 'invited'
  | 'confirmed'
  | 'declined'
  | 'checked_in'
  | 'completed'
  | 'no_show';
```

---

## Domain Events

All mutations publish domain events via the unified EventBus from `@rottay/core`. Events follow the naming convention: `staff.{aggregate}.{action}`.

### Staff Member Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `staff.member.created` | Staff member created | staffMemberId, email, firstName, lastName, role |
| `staff.member.updated` | Staff member updated | staffMemberId, updatedBy |
| `staff.member.status_changed` | Status changed | staffMemberId, previousStatus, newStatus, reason, effectiveDate |
| `staff.skill.added` | Skill added | skillId, staffMemberId, skillName, category, proficiencyLevel |
| `staff.skill.removed` | Skill removed | skillId, staffMemberId, skillName |
| `staff.certification.added` | Certification added | certificationId, staffMemberId, certificationName, issuingOrganization, verificationStatus |
| `staff.certification.verified` | Certification verified | certificationId, staffMemberId, certificationName, verifiedBy |
| `staff.availability.set` | Availability set | availabilityId, staffMemberId, date, dayOfWeek, availabilityType, startTime, endTime |
| `staff.evaluation.created` | Evaluation created | evaluationId, staffMemberId, evaluatorId, evaluationType, overallRating, newAverageRating, eventId |

### Shift Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `staff.shift.created` | Shift created | shiftId, eventId, role, startTime, endTime, requiredCount |
| `staff.shift.updated` | Shift updated | shiftId, eventId |
| `staff.shift.deleted` | Shift deleted | shiftId, eventId |
| `staff.shift.assigned` | Staff assigned to shift | assignmentId, shiftId, staffMemberId, eventId, position |
| `staff.shift.unassigned` | Staff unassigned | assignmentId, shiftId, staffMemberId, eventId, reason |
| `staff.shift.confirmed` | Assignment confirmed | assignmentId, shiftId, staffMemberId, eventId |
| `staff.shift.started` | Shift started | shiftId, eventId, supervisorId, startedAt |

### Swap Request Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `staff.swap.requested` | Swap requested | swapRequestId, requestType, shiftAssignmentId, requesterId, targetStaffId, eventId, reason |
| `staff.swap.approved` | Swap approved | swapRequestId, requestType, approverId, shiftAssignmentId, eventId |
| `staff.swap.rejected` | Swap rejected | swapRequestId, requestType, rejectedBy, reason, shiftAssignmentId, eventId |

### Attendance Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `staff.attendance.checked_in` | Staff checked in | checkInId, staffMemberId, eventId, shiftAssignmentId, checkInMethod, checkInTime, latitude, longitude |
| `staff.attendance.checked_out` | Staff checked out | checkInId, staffMemberId, eventId, shiftAssignmentId, checkOutTime, totalMinutes, breakMinutes, workedMinutes |
| `staff.break.started` | Break started | breakId, staffMemberId, shiftAssignmentId, eventId, breakType, expectedDuration, startTime |
| `staff.break.ended` | Break ended | breakId, staffMemberId, shiftAssignmentId, eventId, durationMinutes, totalBreakMinutes, endTime |

### Credential Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `staff.credential.generated` | Credential generated | credentialId, staffMemberId, eventId, credentialType, validFrom, validUntil |
| `staff.credential.activated` | Credential activated | credentialId, staffMemberId, eventId, activatedBy |
| `staff.credential.suspended` | Credential suspended | credentialId, staffMemberId, eventId, suspendedBy, reason |
| `staff.credential.revoked` | Credential revoked | credentialId, staffMemberId, eventId, revokedBy, reason, revokedAccessCount |
| `staff.zone_access.granted` | Zone access granted | accessId, credentialId, staffMemberId, zoneId, accessLevel, grantedBy |
| `staff.zone_access.revoked` | Zone access revoked | accessId, credentialId, zoneId, revokedBy, reason |

### Staffing Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `staff.requirement.created` | Requirement created | requirementId, eventId, role, requiredCount |
| `staff.requirement.updated` | Requirement updated | requirementId, eventId, role |
| `staff.assignment.created` | Assignment created | assignmentId, staffMemberId, eventId, role, requirementId |
| `staff.assignment.cancelled` | Assignment cancelled | assignmentId, staffMemberId, eventId, reason |
| `staff.assignment.confirmed` | Assignment confirmed | assignmentId, staffMemberId, eventId, requirementId |
| `staff.assignment.declined` | Assignment declined | assignmentId, staffMemberId, eventId, reason, requirementId |
| `staff.invitation.sent` | Invitation sent | invitationId, staffMemberId, eventId, role, expiresAt |
| `staff.invitation.accepted` | Invitation accepted | invitationId, assignmentId, staffMemberId, eventId, role |
| `staff.invitation.declined` | Invitation declined | invitationId, staffMemberId, eventId, reason |

### Payroll Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `staff.payroll.calculated` | Payroll calculated | payrollId, staffMemberId, eventId, periodStart, periodEnd, workedHours, overtimeHours, grossPay |
| `staff.payroll.approved` | Payroll approved | payrollId, staffMemberId, eventId, approvedBy, netPay |
| `staff.payroll.bonus_added` | Bonus added | bonusId, payrollId, staffMemberId, amount, bonusType, reason, newBonusesTotal, newNetPay |
| `staff.payroll.deduction_added` | Deduction added | deductionId, payrollId, staffMemberId, amount, deductionType, reason, newDeductionsTotal, newNetPay |
| `staff.settlement.generated` | Settlement generated | settlementId, settlementNumber, eventId, totalAmount, staffCount, payrollCount, periodStart, periodEnd |
| `staff.settlement.approved` | Settlement approved | settlementId, settlementNumber, approvedBy, totalAmount, staffCount |
| `staff.settlement.processed` | Settlement processed | settlementId, settlementNumber, processedBy, paymentCount, payrollsMarkedPaid, totalAmount |
| `staff.payment.completed` | Payment completed | paymentId, paymentReference, staffMemberId, settlementId, amount |
| `staff.payment.failed` | Payment failed | paymentId, staffMemberId, settlementId, amount, failureReason |

---

## Related

| Module | Relationship |
|--------|--------------|
| [dm-events](../events/USE-CASES.md) | Staff assignments are linked to events; staffing requirements are defined per event |
| [dm-bar](../bar/USE-CASES.md) | Bar staff scheduling and shift management for bar operations |
| [dm-payments](../payments/USE-CASES.md) | Payroll settlements and staff payment processing |
