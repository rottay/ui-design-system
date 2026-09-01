# Industry Benchmarks And Source Map

## Why This Exists

The original audit established what the repo is doing today.

This document adds the missing external reference frame:

- what modern control-plane/admin products optimize for
- what strong recruiting products optimize for
- what strong event/venue operations products optimize for
- what modern adaptive/mobile guidance says we should do with those patterns

The goal is not to copy any one vendor.

The goal is to extract the recurring patterns that are worth encoding into:

- the design system
- app-level `vertical/` recipes and shell behavior
- app-level `ui/` component families
- feature-owned surface configs

## Platform Benchmarks

Platform should feel like a control plane, not a generic SaaS CRUD app.

| Source | What it emphasizes | What it should change in Rottay |
| --- | --- | --- |
| [SAP Fiori Object Page](https://experience.sap.com/fiori-design-web/object-page/) | Dense object detail with anchor/tab navigation, display/edit/create modes, responsive business-object layout | Platform detail pages should standardize around sectioned object views, anchored navigation, and a clearer split between view mode and edit mode |
| [SAP Fiori Analytical List Page](https://experience.sap.com/fiori-design-web/analytical-list-page/) | One page can combine filters, charts, tables, drilldown, and direct actions on transactional content | Platform dashboards and investigative screens should stop splitting analysis and action into separate ad hoc screens; the DS should support chart + table + action workbenches as a first-class surface |
| [SAP Fiori Overview Page](https://experience.sap.com/fiori-design-web/overview-page/) | Role-based overview pages made of cards, live filtering, and quick navigation to the next action | Platform landing dashboards should become role-aware card systems with immediate action, not just collections of pretty metric boxes |
| [SAP Fiori Flexible Column Layout](https://experience.sap.com/fiori-design-web/flexible-column-layout/) | List-detail and list-detail-detail navigation, one/two/three columns depending on width, full-screen rightmost column on phone | Platform investigative flows should adopt a stronger list/detail/supporting-pane discipline instead of improvising detail drawers and ad hoc side panels |
| [Carbon UI Shell Header](https://v10.carbondesignsystem.com/components/UI-shell-header/usage/) | Persistent shell, product-to-global information hierarchy, utility icons, search placement, responsive collapse into panel navigation | Platform headers should become more systematic: search left, utilities right, product context left, global actions right, and shell-wide keyboard/accessibility conventions |
| [Carbon Data Table](https://carbondesignsystem.com/components/data-table/usage/) | Open vs collapsed search, sorting, batch actions, inline actions, overflow behavior on touch, skeleton loading | Platform table workspaces should standardize search placement, batch action behavior, row actions, and touch-friendly overflow persistence |

### Platform Synthesis

If Platform follows the benchmark direction, it should become:

- denser
- calmer
- more role-aware
- more object/detail-oriented
- more capable of mixing analytics and action on the same page

The clearest DS opportunities for Platform are:

1. object-page scaffold
2. analytical workbench scaffold
3. card-based overview dashboard scaffold
4. list/detail/supporting-pane scaffold

## BitHire Benchmarks

BitHire should feel like a structured hiring operating system, not a generic admin shell painted blue.

| Source | What it emphasizes | What it should change in BitHire |
| --- | --- | --- |
| [Greenhouse Structured Hiring: Introduction](https://support.greenhouse.io/hc/en-us/articles/360007245452-Structured-hiring-Introduction) | Define the ideal candidate, use a deliberate rubric, base decisions on evidence, reduce redundancy and bias | BitHire should make structured criteria visible everywhere: scorecards, stage context, required feedback, and candidate decision evidence |
| [Greenhouse Structured Hiring Guide](https://support.greenhouse.io/hc/en-us/articles/360039539772-Structured-hiring-guide) | Kickoff, scorecards, interview planning, interview kits, scheduling, expectations for feedback, roundup meetings | BitHire should elevate the workflow spine end to end, not just provide isolated screens for jobs, candidates, interviews, and offers |
| [Greenhouse Scorecard Overview](https://support.greenhouse.io/hc/en-us/articles/4414777492891-Scorecard-overview) | Predetermined attributes, categorized scorecards, automatic assignment on scheduling, group review during roundup | BitHire needs DS-backed scorecard patterns, attribute chips, interviewer focus states, and recruiter-friendly review surfaces |
| [Greenhouse Structured Decision-Making](https://support.greenhouse.io/hc/en-us/articles/360004923392-Structured-decision-making) | Structured process reduces bias and discourages shifting criteria and mental shortcuts | BitHire should make “gut feel” visually secondary and structured evidence visually primary in cards, headers, and decisions |
| [Greenhouse Application Review Stage](https://support.greenhouse.io/hc/en-us/articles/4401963991707-Application-review-stage) | Review queues, application history, agency questions, shortcuts, candidate roundup handoff | BitHire should have a stronger recruiter inbox/review queue surface with keyboard-first triage, applicant context, and follow-on actions |
| [Greenhouse Candidate Roundup](https://support.greenhouse.io/hc/en-us/articles/360007247872-Structured-hiring-Candidate-roundup) | Summarized scorecards, team sync, shortlist of actions, lessons learned | BitHire should own a real decision/roundup workspace instead of scattering the decision state across notes, forms, and detail pages |
| [Greenhouse Focus Attributes For Candidate Roundup](https://support.greenhouse.io/hc/en-us/articles/360003464191-Focus-attributes-for-candidate-roundup) | Explicit focus attributes for the final discussion | BitHire should encode “focus attributes” as a visible product grammar in candidate lists, interview kits, and final decision views |

### BitHire Synthesis

If BitHire follows the benchmark direction, it should become:

- more evidence-driven
- more stage-aware
- more humane without becoming soft or vague
- more workflow-cohesive from intake to offer
- more optimized for recruiter throughput

The clearest DS opportunities for BitHire are:

1. recruiter review queue
2. scorecard and interview-kit pattern family
3. candidate compare / roundup workspace
4. scheduler / interviewer coordination surface

## Evnto Benchmarks

Evnto should feel like a live operations and attendee experience platform, not a re-skinned back office.

| Source | What it emphasizes | What it should change in Evnto |
| --- | --- | --- |
| [Cvent Mobile Event App Guide](https://www.cvent.com/en/blog/events/evaluating-mobile-event-app-providers) | Schedules, maps, exhibitor/sponsor profiles, personalized schedules, sync across devices, push notifications, polling, messaging, location-aware experiences, usability and stability | Evnto should treat agenda, maps, attendance, messaging, notifications, and sponsor/exhibitor touchpoints as primary product surfaces, not extras |
| [Cvent Event Apps](https://www.cvent.com/en/event-marketing-management/mobile-event-apps/) | Personal agendas, AI-powered networking, attendee messaging, personalized journeys, recommendations, in-session engagement | Evnto should push personalization, attendee-facing summaries, and operator-facing orchestration closer together |
| [Cvent OnArrival / Check-In](https://www.cvent.com/en/event-marketing-management/onarrival-event-check-in-software) | Search by multiple identifiers, on-demand badges, attendance tracking, walk-ins, capacity control, real-time reporting, phone/tablet support | Evnto should treat check-in as a fast operations console with scanning/search, session capacity, and live exception handling |
| [EventMobi Agenda Best Practices](https://www.eventmobi.com/blog/best-practices-how-to-get-the-most-out-of-the-agenda-feature-in-your-event-app/) | Tracks, personal schedules, roles, live polls, Q&A | Evnto needs stronger agenda/session/list patterns with role chips, track grouping, and embedded engagement state |
| [EventMobi Event App Design Best Practices](https://www.eventmobi.com/blog/best-practices-for-event-app-design/) | Home screen widgets, shortcut-heavy navigation, agenda/location/attendees prominence, branded home experiences | Evnto should own a more modular, widget-like home and command surface that supports the live-event mental model |
| [EventMobi Check-In Best Practices](https://www.eventmobi.com/blog/event-check-in-app-elevate-guest-arrival-experience/) | First impression matters, signage and flow matter, clunky queues damage the event experience | Evnto should treat queue health, signage, wait-state visibility, and arrival speed as first-class UX concerns |

### Evnto Synthesis

If Evnto follows the benchmark direction, it should become:

- more mobile-forward
- more live-status-driven
- more shortcut-heavy
- more queue/agenda/attendance oriented
- more obviously designed for real event pressure

The clearest DS opportunities for Evnto are:

1. command-center dashboard system
2. agenda/run-of-show components
3. check-in queue and capacity patterns
4. operational action dock / operator quick actions

## Cross-Cutting Mobile And Adaptive Sources

| Source | What it emphasizes | Repo implication |
| --- | --- | --- |
| [Android Canonical Layouts](https://developer.android.com/design/ui/mobile/guides/layout-and-content/canonical-layouts) | Start from list-detail, feed, and support-pane layouts; compact screens show one pane, supporting content can move to sheets/dialogs | The DS should stop treating phone layouts as “the same page but narrower” and start offering canonical adaptive surface transforms |
| [Android Layouts And Navigation Patterns](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns) | Bottom nav for 3-5 top-level destinations, rail on larger screens, drawers are less ideal on compact sizes | App shells should define explicit compact-navigation policies instead of relying on desktop sidebars plus a modal copy |
| [Android Edge-To-Edge Guidance](https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge) | Inset critical UI, let backgrounds extend edge-to-edge, collapse bottom bars on scroll where appropriate | DS/app shells should formalize safe-area, cutout, and action-dock behavior instead of leaving it to local CSS |
| [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | Clear visual hierarchy, progressive disclosure, safe areas, adaptable layouts, convertible navigation | Surfaces should prioritize hierarchy, disclosure, and safe-area correctness over squeezing everything onscreen at once |
| [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion) | Motion should convey status, feedback, and instruction; system settings and input method matter | Motion recipes should remain purposeful and should respect reduced motion and input context across all three apps |

## What These Sources Mean For The Design System

The external material points in the same direction the local audit already suggested:

1. Shared primitives are not the main gap.
2. Shared surface systems are the main gap.
3. Each vertical needs its own interaction grammar.
4. Mobile needs adaptive surface transforms, not simple compression.
5. Tenant/brand differentiation must extend beyond color to density, motion, card behavior, and default layout posture.

## Highest-Confidence Design Moves

These are the benchmark-backed moves I would trust the most:

1. Build a DS-level collection workspace spine with table, filters, saved views, actions, selection state, and mobile transforms.
2. Build a DS-level header/cockpit family with product context, page context, search, utilities, and mobile collapse rules.
3. Build a DS-level draft-safe form system with grouped sections, sticky actions, review state, and mobile single-column modes.
4. Build one real adaptive list/detail/supporting-pane story instead of each app improvising drawers, inspectors, and stacked detail screens.
5. Encode per-vertical density, status, and motion defaults into product profiles and tenant personality instead of leaving them to per-screen styling.
