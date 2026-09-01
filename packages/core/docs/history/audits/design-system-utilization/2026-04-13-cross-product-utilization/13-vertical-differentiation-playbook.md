# Vertical Differentiation Playbook

## Why This Exists

Sharing a design system does **not** mean the three apps should look or behave like copies.

The right target is:

- one design-system backbone
- three visibly different products
- each product aligned to its industry, user posture, and operating pressure

This playbook defines what should stay common and what should intentionally diverge.

## Non-Negotiable Differentiation Matrix

| Component Family | Platform | BitHire | Evnto | Shared DS Backbone |
| --- | --- | --- | --- | --- |
| Shell | control-plane shell, persistent utilities, dense chrome, analytic posture | recruiter cockpit, personal queue feel, decision-oriented shell | live-ops shell, quick actions, more operational urgency | `AppShell`, responsive provider, nav primitives, shared skip-links, accessibility |
| Headers | command/cockpit headers with search, filters, status, global actions | recruiter headers with stage state, ownership, SLA and candidate/job context | operational headers with schedule/date/venue state and fast actions | header slots, action groups, breadcrumb shell, responsive collapse rules |
| Lists | dense tables, saved views, scopes, batch actions, detail panes | pipeline lists, candidate cards/rows, shortlist and compare flows | mixed table/card agenda lists, queue lists, staff lists, inventory quick-adjust lists | collection workspace spine, filter bars, search, saved views, selection state |
| Cards | KPI/risk/audit cards, role-driven dashboard cards | narrative candidate/job cards, interview cards, decision cards | session/run-of-show/stock/capacity cards, operational widgets | core card primitives, metric card scaffolds, status treatments |
| Forms | compact, sectioned, admin-grade, desktop-strong but mobile-safe | guided and empathetic, more copy and review context, strong inline evidence | fast, chunked, operator-friendly, thumb-ready, low-friction edits | field primitives, validation, draft state, review state, submit orchestration |
| Detail Pages | anchored object pages, inspector panes, system history | candidate/job detail with evidence, timeline, scorecards, next actions | event/venue/product detail with schedule, capacity, assignments, live status | object/detail scaffolds, supporting pane patterns, activity/timeline spine |
| Search / Command | global command/search for entities, routes, incidents, settings | recruiter search, talent rediscovery, quick review actions | command palette plus on-site quick actions and scan-first workflows | command registry, search command bar, shortcuts, action dock patterns |
| Status Language | sober, trust-heavy, risk and compliance signal colors | talent pipeline state, SLA, feedback completeness, decision confidence | live status, urgency, readiness, capacity, service health | shared status contract, tokenized severity families |
| Motion | restrained and precise | warmer and more human, but still subtle | slightly more expressive, live and operational | motion tokens, reduced-motion support, transition primitives |
| Empty / Loading / Feedback | system/investigation tone | recruiter guidance tone | action-forward operational tone | state registry, skeletons, empty/error shells |

## Platform North Star

Platform should feel like:

- a premium control plane
- an enterprise operations console
- a place where high-trust decisions happen

### Platform Visual Grammar

- lower-chroma palette, high trust
- denser spacing than the other two apps
- more tables, inspectors, anchored detail pages, and scoped panels
- typography that supports technical confidence and scanning
- restrained motion that communicates state change, never delight-first

### Platform Lists

Platform lists should default to:

- table-first
- saved views and scopes visible
- filter state always legible
- batch actions surfaced when selection exists
- row actions persistently discoverable

Platform should use cards sparingly, mainly for:

- dashboards
- alerts
- review queues
- tenant/program summaries

### Platform Forms

Platform forms should feel:

- deliberate
- sectioned
- policy-aware
- safe to resume

Good defaults:

- grouped sections
- inline help that is short and exact
- review state before commit for destructive or policy-impacting actions
- side-by-side grouping on desktop, single-column on phone

### Platform Motion

Motion should emphasize:

- focus changes
- panel transitions
- investigation flow
- state confirmation

It should avoid:

- ornamental bouncing
- playful stagger everywhere
- animation that makes data feel less serious

## BitHire North Star

BitHire should feel like:

- a recruiter operating system
- structured but humane
- fast to triage and compare
- evidence-led, never bureaucracy-led

### BitHire Visual Grammar

- warmer than Platform
- slightly softer corners and friendlier card rhythm
- stronger use of people signals: avatars, owners, interviewers, stage chips
- more explicit momentum indicators: aging, overdue feedback, blockers, confidence
- more conversational microcopy in forms and decision states

### BitHire Lists And Cards

BitHire should not be table-only.

Its best shapes are:

- candidate rows with evidence snippets
- stage-grouped views
- compare cards
- recruiter inbox queues
- interview schedule boards

Tables still matter for:

- jobs
- reports
- bulk operations
- offer/admin review

But more surfaces should favor:

- entity summaries
- stage state
- last-touch activity
- feedback completeness
- next best action

### BitHire Forms

BitHire forms should feel:

- guided
- reassuring
- recruiter/hiring-manager friendly

Good defaults:

- clear step boundaries
- progressive disclosure
- review summaries before irreversible stage changes
- explicit attribute and rubric guidance in interview/scorecard flows

### BitHire Motion

Motion can be a touch warmer here:

- candidate advancement
- scheduling confirmations
- offer decision milestones
- focus changes in compare/roundup flows

But it should still prioritize speed and clarity over flourish.

## Evnto North Star

Evnto should feel like:

- a live event operations console
- a venue and schedule coordination tool
- something useful on the floor, not just in the back office

### Evnto Visual Grammar

- most operational of the three
- stronger live-status treatments
- more temporal structure: now, next, upcoming, delayed, capacity, ready
- more modular widgets and action surfaces
- clearer “at a glance” cards for things that change during a live day

### Evnto Lists And Cards

Evnto should use more mixed list/card models than the other apps:

- agenda/timeline cards
- queue lists
- capacity/status strips
- venue/staff/product operational boards
- scan/search-first check-in rows

Pure dense tables still make sense for:

- admin reports
- product management
- finance-heavy back-office screens

But the product should lean harder into:

- timeline
- queue
- board
- widget
- compact action list

### Evnto Forms

Evnto forms should feel:

- quick
- robust under pressure
- easy to complete on phone or tablet

Good defaults:

- large tap targets
- fewer side-by-side fields on smaller widths
- sticky bottom actions
- defaults and presets where possible
- “save and continue operating” bias

### Evnto Motion

Evnto can support the most expressive motion of the three apps, but still in a workmanlike way:

- queue confirmation
- live status pulse
- agenda changes
- action dock transitions
- quick operator feedback

The test is simple:

does motion make the live system easier to read under pressure?

If not, it should be removed.

## What Should Stay Centralized

These should remain DS-owned or DS-first:

- tokens
- primitives
- responsive runtime
- accessibility rules
- command infrastructure
- collection workspace spine
- skeleton/loading/empty/error registry
- draft-safe form mechanics
- header and shell slots
- motion primitives

## What Should Vary By Vertical

These should vary by app through `vertical/`, `ui/`, feature-owned components, or tenant personality:

- density defaults
- default card types
- default list posture
- header hierarchy
- shell action placement
- state badge semantics
- iconography emphasis
- motion amplitude and timing
- default empty-state tone
- mobile transform rules

## Concrete Differentiation Rules For Cloud

Cloud should use the following rules when implementing:

1. Do not copy the same list wrapper into all three apps with only color changes.
2. Do not copy the same page header into all three apps with only icon changes.
3. Do not copy the same cards across apps when the mental model differs.
4. Do not make forms identical across apps unless the user task is truly identical.
5. Use the DS for shared mechanics and accessibility, then let each app set its own default composition and recipe posture.

## DS Additions That Would Unlock Better Differentiation

The most valuable additions for deliberate divergence are:

1. header family with product-specific recipes
2. adaptive collection workspace with table/card/queue variants
3. draft-safe form family with desktop and mobile recipes
4. object/detail scaffold with optional supporting pane
5. action dock / compact mobile actions
6. activity / decision / audit timeline family
