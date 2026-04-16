# Feature Backlog By Vertical

## Why This Exists

The earlier audit already identified big opportunities.

This document makes the backlog more explicit so implementation planning can start immediately.

Each item below is intended to be:

- product-shaped
- grounded in the vertical
- compatible with the architecture and design-system direction

## Cross-App Shared Systems

These should become DS-backed or DS-first platform capabilities.

### Highest Priority

1. **Collection workspace spine**
   - table/list/card modes
   - filters, search, saved views, bulk actions, preview state
2. **Header / cockpit family**
   - dense command header
   - compact mobile header
   - metrics/status strip
3. **Draft-safe forms**
   - grouped sections
   - autosave/draft
   - sticky compact actions
4. **Decision / approval inbox**
   - review queue
   - evidence panel
   - approve/reject/request changes
5. **Activity / timeline system**
   - human actions
   - system actions
   - status changes
   - audit comments
6. **Filter sheet + supporting pane family**
   - mobile filter sheet
   - desktop inspector/supporting pane
7. **Command/search spine**
   - global search
   - command palette
   - quick actions
   - keyboard shortcuts

## Platform Backlog

### Highest-Value Features

1. **Tenant Preview And Publishing Workbench**
   - preview tenant theme and personality
   - compare before/after
   - publish with rollback
2. **Approval Center**
   - centralized approvals for policy, payment, identity, and admin actions
3. **Incident Investigation Workbench**
   - filterable event stream
   - entity drilldown
   - action sidebar
4. **Compliance Timeline**
   - audit trail
   - evidence, attachments, comments
   - policy-linked actions
5. **Identity Graph / Relationship Explorer**
   - users, roles, permissions, groups, tenants
6. **Notification Routing Studio**
   - channel rules
   - delivery previews
   - failure insight
7. **Payment Operations Console**
   - exceptions, refunds, disputes, reconciliation
8. **Dashboard Preset Library**
   - role-based dashboard templates
   - pin, share, duplicate, restore
9. **Risk Heatmap Workspace**
   - matrix view + list drilldown
10. **Policy Simulator**
   - preview impact of changing policy or role logic

### Mobile Posture

Good on phone:

- approvals
- incident summaries
- notifications
- compact investigations

Desktop-first:

- policy simulator
- dashboard preset design
- very wide audit consoles

## BitHire Backlog

### Highest-Value Features

1. **Recruiter Inbox**
   - applications to review
   - aging items
   - interview feedback missing
   - overdue offers
2. **Candidate Compare Board**
   - compare scorecards, feedback, stage fit, risks
3. **Structured Scorecard Composer**
   - categories, attributes, focus attributes, interview ownership
4. **Interview Kit Builder**
   - focus attributes, custom questions, interviewer guidance
5. **Roundup Workspace**
   - candidate-by-candidate discussion with evidence summary
6. **Scheduling Workbench**
   - interviewer availability
   - candidate availability
   - conflict and load awareness
7. **Offer Approval Flow**
   - compensation evidence
   - approvals
   - risk flags
8. **Talent Rediscovery Search**
   - past candidates, prior applications, fit patterns
9. **Pipeline Aging Dashboard**
   - bottlenecks by stage, recruiter, hiring manager, job
10. **Candidate Relationship Timeline**
   - touchpoints, interviews, notes, referrals, offers
11. **Referral And Agency Workspace**
   - referral source
   - agency submissions
   - related candidate context
12. **Hiring Manager Review Surface**
   - quick accept/reject/hold
   - evidence-first review

### Mobile Posture

Good on phone:

- recruiter inbox
- candidate review
- interview schedule
- feedback capture
- approvals

Desktop-first:

- scorecard builder
- analytics
- complex scheduling coordination
- compare board with many candidates

## Evnto Backlog

### Highest-Value Features

1. **Live Event Command Center**
   - attendance, queues, incidents, session readiness, comms
2. **Run-Of-Show Scheduler**
   - timeline, dependencies, owners, alerts
3. **Check-In Queue Console**
   - scan/search/manual lookup
   - walk-ins
   - exception states
   - badge/entry outcomes
4. **Capacity Watch**
   - room/session capacity, overflow, waitlist, alerts
5. **Staffing Matrix**
   - who is assigned where, gaps, swaps, attendance
6. **VIP Reservation Board**
   - arrivals, table status, service state, follow-up actions
7. **Inventory Quick Adjust**
   - low-stock, transfers, counts, fast corrections
8. **Venue Readiness Surface**
   - checklist, blockers, room/device readiness
9. **Sponsor / Exhibitor Cockpit**
   - booth readiness, lead activity, obligations, alerts
10. **Nightly Closeout**
   - sales, attendance, incidents, staff notes, exceptions
11. **Incident Log**
   - timestamped operational events, escalation, ownership
12. **Attendee Journey Summary**
   - agenda, registration type, interactions, access status

### Mobile Posture

Good on phone/tablet:

- check-in
- staffing
- run-of-show
- inventory quick-adjust
- live command center
- capacity watch

Desktop-first:

- procurement-heavy admin
- finance/reporting
- dense setup and maintenance screens

## Recommendations For Naming And Packaging

When turning these into build work:

1. put cross-app systems in the DS or DS-first app `ui/`
2. put vertical-specific product experiences in feature families
3. give each major system a stable noun-based name

Good examples:

- `CollectionWorkspace`
- `RoundupWorkspace`
- `CommandCenter`
- `RunOfShow`
- `ApprovalCenter`
- `CandidateCompareBoard`

## Best First Moves

If we can only start a few:

1. collection workspace spine
2. recruiter inbox for BitHire
3. command center for Evnto
4. approval center for Platform
5. draft-safe forms everywhere

That sequence would improve both the design system and the apps quickly.
