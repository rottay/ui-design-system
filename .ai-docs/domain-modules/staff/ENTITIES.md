# dm-staff - Entities

> **Entidades del módulo de personal y scheduling**

---

## Entidades Principales

### StaffMember

```typescript
interface StaffMember {
  id: string;
  tenantId: string;
  companyId: string;
  userId: string;
  employeeNumber?: string;
  type: StaffType;
  status: StaffStatus;
  department?: string;
  position: string;
  hourlyRate?: {
    amount: number;
    currency: string;
  };
  skills: StaffSkill[];
  certifications: Certification[];
  availability: WeeklyAvailability;
  contactInfo: {
    phone: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  bankInfo?: BankInfo;
  hiredAt: Date;
  terminatedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type StaffType =
  | 'full_time'
  | 'part_time'
  | 'contractor'
  | 'freelance'
  | 'temporary';

interface StaffSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verifiedAt?: Date;
}

interface Certification {
  name: string;
  issuer: string;
  issuedAt: Date;
  expiresAt?: Date;
  documentUrl?: string;
  verified: boolean;
  verifiedAt?: Date;
}
```

### Shift

```typescript
interface Shift {
  id: string;
  tenantId: string;
  companyId: string;
  eventId?: string;
  locationId: string;
  name: string;
  date: Date;
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  breakMinutes: number;
  requiredStaff: number;
  assignedStaff: number;
  status: ShiftStatus;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ShiftAssignment

```typescript
interface ShiftAssignment {
  id: string;
  tenantId: string;
  shiftId: string;
  staffId: string;
  status: AssignmentStatus;
  role: string;
  confirmedAt?: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ShiftSwapRequest

```typescript
interface ShiftSwapRequest {
  id: string;
  tenantId: string;
  requesterId: string;
  requesterShiftId: string;
  targetStaffId?: string;
  targetShiftId?: string;
  type: SwapType;
  status: SwapStatus;
  reason: string;
  approvedBy?: string;
  approvedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type SwapType = 'swap' | 'drop' | 'pickup';

type SwapStatus =
  | 'pending'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';
```

### StaffingRequirement

```typescript
interface StaffingRequirement {
  id: string;
  tenantId: string;
  eventId: string;
  role: string;
  quantity: number;
  assigned: number;
  skills: string[];
  certifications: string[];
  hourlyRate: {
    amount: number;
    currency: string;
  };
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### TimeRecord

```typescript
interface TimeRecord {
  id: string;
  tenantId: string;
  staffId: string;
  shiftId?: string;
  eventId?: string;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  totalMinutes?: number;
  breakMinutes?: number;
  workMinutes?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Credential

```typescript
interface Credential {
  id: string;
  tenantId: string;
  staffId: string;
  eventId?: string;
  type: CredentialType;
  code: string;
  qrCode: string;
  status: CredentialStatus;
  validFrom: Date;
  validUntil: Date;
  zoneAccess: string[];
  issuedAt: Date;
  issuedBy: string;
  revokedAt?: Date;
  revokedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type CredentialType = 'badge' | 'wristband' | 'pass' | 'digital';

type CredentialStatus = 'active' | 'suspended' | 'revoked' | 'expired';
```

### PayrollPeriod

```typescript
interface PayrollPeriod {
  id: string;
  tenantId: string;
  companyId: string;
  periodStart: Date;
  periodEnd: Date;
  status: PayrollStatus;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  currency: string;
  settlements: string[];  // Settlement IDs
  approvedBy?: string;
  approvedAt?: Date;
  processedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type PayrollStatus =
  | 'draft'
  | 'calculated'
  | 'pending_approval'
  | 'approved'
  | 'processing'
  | 'paid';
```

### Settlement

```typescript
interface Settlement {
  id: string;
  tenantId: string;
  payrollPeriodId: string;
  staffId: string;
  periodStart: Date;
  periodEnd: Date;
  hoursWorked: number;
  hourlyRate: number;
  grossPay: number;
  deductions: Deduction[];
  bonuses: Bonus[];
  netPay: number;
  currency: string;
  status: SettlementStatus;
  approvedBy?: string;
  approvedAt?: Date;
  paidAt?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type SettlementStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'paid';

interface Deduction {
  type: string;
  description: string;
  amount: number;
}

interface Bonus {
  type: string;
  description: string;
  amount: number;
}
```

### StaffSkill

```typescript
interface StaffSkill {
  id: string;
  tenantId: string;
  companyId: string;
  staffMemberId: string;
  skillName: string;
  skillCategory?: string;
  proficiencyLevel?: number;
  yearsExperience?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### StaffCertification

```typescript
interface StaffCertification {
  id: string;
  tenantId: string;
  companyId: string;
  staffMemberId: string;
  certificationName: string;
  certificationNumber?: string;
  issuingOrganization?: string;
  issueDate?: Date;
  expiryDate?: Date;
  status: string;                // pending, verified, rejected, expired
  verifiedAt?: Date;
  verifiedBy?: string;
  documentUrl?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### StaffAvailability

```typescript
interface StaffAvailability {
  id: string;
  tenantId: string;
  companyId: string;
  staffMemberId: string;
  dayOfWeek?: number;
  specificDate?: Date;
  availabilityType: string;
  startTime?: string;            // HH:mm
  endTime?: string;              // HH:mm
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### StaffEvaluation

```typescript
interface StaffEvaluation {
  id: string;
  tenantId: string;
  companyId: string;
  staffMemberId: string;
  eventId?: string;
  evaluatorId: string;
  evaluationType: string;
  overallRating?: number;
  punctualityRating?: number;
  performanceRating?: number;
  attitudeRating?: number;
  teamworkRating?: number;
  strengths?: string;
  areasForImprovement?: string;
  comments?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### StaffAssignment

```typescript
interface StaffAssignment {
  id: string;
  tenantId: string;
  companyId: string;
  eventId: string;
  staffMemberId: string;
  requirementId?: string;
  role: string;
  status: string;                // pending, confirmed, declined, cancelled
  hourlyRate: number;
  currency: string;
  confirmedAt?: Date;
  declinedAt?: Date;
  cancelledAt?: Date;
  declineReason?: string;
  cancellationReason?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### StaffInvitation

```typescript
interface StaffInvitation {
  id: string;
  tenantId: string;
  companyId: string;
  eventId: string;
  staffMemberId: string;
  requirementId?: string;
  role: string;
  status: string;                // pending, accepted, declined, expired
  hourlyRate: number;
  currency: string;
  message?: string;
  expiresAt?: Date;
  respondedAt?: Date;
  responseMessage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### WaitingListEntry

```typescript
interface WaitingListEntry {
  id: string;
  tenantId: string;
  companyId: string;
  eventId: string;
  staffMemberId: string;
  requirementId?: string;
  preferredRoles?: string[];     // JSONB
  priority: number;
  status: string;                // waiting, contacted, assigned, cancelled
  contactedAt?: Date;
  assignedAt?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### BreakRecord

```typescript
interface BreakRecord {
  id: string;
  tenantId: string;
  companyId: string;
  checkInOutId: string;
  shiftAssignmentId?: string;
  breakType: string;
  startTime: Date;
  endTime?: Date;
  expectedDuration: number;      // minutes
  actualDuration?: number;       // minutes
  status: string;                // active, completed, exceeded
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### CheckInOut

```typescript
interface CheckInOut {
  id: string;
  tenantId: string;
  companyId: string;
  staffMemberId: string;
  eventId?: string;
  shiftAssignmentId?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  checkInMethod: string;         // manual, qr, nfc, geolocation
  checkOutMethod?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  totalBreakMinutes: number;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ZoneAccess

```typescript
interface ZoneAccess {
  id: string;
  tenantId: string;
  companyId: string;
  credentialId: string;
  zoneId: string;
  accessLevel: string;           // standard, elevated, full
  validFrom?: Date;
  validUntil?: Date;
  timeRestrictionStart?: string; // HH:mm
  timeRestrictionEnd?: string;   // HH:mm
  status: string;                // active, revoked
  revokedAt?: Date;
  revokedBy?: string;
  revocationReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### PayrollCalculation

```typescript
interface PayrollCalculation {
  id: string;
  tenantId: string;
  companyId: string;
  staffMemberId: string;
  eventId?: string;
  assignmentId?: string;
  periodStart: Date;
  periodEnd: Date;
  scheduledHours?: number;
  workedHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  hourlyRate: number;
  overtimeRate: number;
  currency: string;
  basePay: number;
  overtimePay: number;
  grossPay: number;
  bonusesTotal: number;
  deductionsTotal: number;
  netPay: number;
  status: string;               // draft, calculated, approved, paid
  calculatedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### BonusDeduction

```typescript
interface BonusDeduction {
  id: string;
  tenantId: string;
  companyId: string;
  payrollCalculationId: string;
  type: string;                  // bonus or deduction
  category: string;
  description?: string;
  amount: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### PaymentRecord

```typescript
interface PaymentRecord {
  id: string;
  tenantId: string;
  companyId: string;
  settlementId: string;
  staffMemberId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;                // pending, processing, completed, failed
  externalReference?: string;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  retryCount: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

---

## Relaciones

```
StaffMember     1──*  StaffSkill
StaffMember     1──*  StaffCertification
StaffMember     1──*  StaffAvailability
StaffMember     1──*  StaffEvaluation
StaffMember     1──*  StaffAssignment
StaffMember     1──*  StaffInvitation
StaffMember     1──*  WaitingListEntry
StaffMember     1──*  ShiftAssignment (via shift_assignments)
StaffMember     1──*  CheckInOut
StaffMember     1──*  Credential
StaffMember     1──*  PayrollCalculation
StaffMember     1──*  Settlement
StaffMember     1──*  PaymentRecord
Shift           1──*  ShiftAssignment
ShiftSwapRequest *──1 Shift (requester_shift)
ShiftSwapRequest *──1 Shift (target_shift, optional)
CheckInOut      1──*  BreakRecord
Credential      1──*  ZoneAccess
PayrollCalculation 1──* BonusDeduction
Settlement      1──*  PaymentRecord
Event           1──*  StaffingRequirement (event_staff_requirements)
Event           1──*  Shift
Event           1──*  StaffAssignment
Event           1──*  StaffInvitation
```

---

## Database Tables

> Complete mapping of domain entities to their actual PostgreSQL table names.
> All tables are created via `withSchema()` factory in multi-tenant schemas.

| # | Entity | DB Table | Key Columns | Notes |
|---|--------|----------|-------------|-------|
| 1 | StaffMember | `staff_members` | id, tenant_id, company_id, user_id, email, first_name, last_name, primary_role, status, hourly_rate, currency, hire_date, total_events_worked, average_rating | Core staff profile |
| 2 | StaffSkill | `staff_skills` | id, tenant_id, company_id, staff_member_id, skill_name, skill_category, proficiency_level, years_experience | Staff competencies |
| 3 | StaffCertification | `staff_certifications` | id, tenant_id, company_id, staff_member_id, certification_name, certification_number, issuing_organization, issue_date, expiry_date, status, verified_at, document_url | Verified certifications |
| 4 | StaffAvailability | `staff_availability` | id, tenant_id, company_id, staff_member_id, day_of_week, specific_date, availability_type, start_time, end_time | Weekly/specific date availability |
| 5 | StaffEvaluation | `staff_evaluations` | id, tenant_id, company_id, staff_member_id, event_id, evaluator_id, evaluation_type, overall_rating, punctuality_rating, performance_rating, attitude_rating, teamwork_rating | Multi-criteria performance reviews |
| 6 | StaffingRequirement | `staff_event_requirements` | id, tenant_id, company_id, event_id, role, required_count, assigned_count, confirmed_count, hourly_rate | Event staffing needs |
| 7 | StaffAssignment | `staff_assignments` | id, tenant_id, company_id, event_id, staff_member_id, requirement_id, role, status, hourly_rate, confirmed_at, declined_at | Event-level staff assignments |
| 8 | StaffInvitation | `staff_invitations` | id, tenant_id, company_id, event_id, staff_member_id, requirement_id, role, status, hourly_rate, message, expires_at, responded_at | Staff event invitations |
| 9 | WaitingListEntry | `staff_waiting_list_entries` | id, tenant_id, company_id, event_id, staff_member_id, requirement_id, preferred_roles (JSONB), priority, status | Staff standby queue |
| 10 | Shift | `staff_shifts` | id, tenant_id, company_id, event_id, name, role, start_time, end_time, required_count, assigned_count, confirmed_count, zone_id, hourly_rate, break_duration, status | Scheduled work periods |
| 11 | ShiftAssignment | `staff_shift_assignments` | id, tenant_id, company_id, shift_id, staff_member_id, assignment_id, status, position, assigned_at, confirmed_at | Shift-level staff assignment |
| 12 | ShiftSwapRequest | `staff_shift_swap_requests` | id, tenant_id, company_id, requester_id, target_id, requester_shift_id, target_shift_id, request_type, status, approved_by | Shift swap/drop/pickup requests |
| 13 | BreakRecord | `staff_break_records` | id, tenant_id, company_id, check_in_out_id, shift_assignment_id, break_type, start_time, end_time, expected_duration, actual_duration, status | Break tracking within shifts |
| 14 | CheckInOut | `staff_check_in_outs` | id, tenant_id, company_id, staff_member_id, event_id, shift_assignment_id, check_in_time, check_out_time, check_in_method, check_in_latitude, check_in_longitude, total_break_minutes, verified | Geolocation time tracking |
| 15 | Credential | `staff_credentials` | id, tenant_id, company_id, staff_member_id, event_id, credential_code, qr_code_url, credential_type, status, valid_from, valid_until, photo_url, photo_verified | Digital staff credentials |
| 16 | ZoneAccess | `staff_zone_access` | id, tenant_id, company_id, credential_id, zone_id, access_level, valid_from, valid_until, time_restriction_start, time_restriction_end, status | Credential-zone access mapping |
| 17 | PayrollCalculation | `staff_payroll_calculations` | id, tenant_id, company_id, staff_member_id, event_id, assignment_id, period_start, period_end, worked_hours, overtime_hours, hourly_rate, base_pay, overtime_pay, gross_pay, bonuses_total, deductions_total, net_pay, status | Detailed pay calculations |
| 18 | BonusDeduction | `staff_bonus_deductions` | id, tenant_id, company_id, payroll_calculation_id, type, category, description, amount, currency | Bonus/deduction line items |
| 19 | Settlement | `staff_settlements` | id, tenant_id, company_id, staff_member_id, settlement_number, period_start, period_end, total_amount, currency, status, submitted_at, approved_at, processed_at, completed_at | Payment batch settlements |
| 20 | PaymentRecord | `staff_payment_records` | id, tenant_id, company_id, settlement_id, staff_member_id, amount, currency, payment_method, status, external_reference, retry_count | Individual payment transactions |
