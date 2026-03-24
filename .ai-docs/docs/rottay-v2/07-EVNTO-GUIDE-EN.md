# Evnto — Product Guide (Rottay Vertical)

**Last updated:** 2026-02-10  
**Audience:** venues, operators, event organizers, partners evaluating the product.  
**Ground truth:** this guide references repo-backed app dependencies and the capability surface of the underlying domain modules.

---

## 1) What is Evnto?

Evnto is Rottay’s events vertical: a product direction focused on the operational reality of running events.

The real problem for venues and organizers is not “ticketing in isolation”.
It’s the messy chain of:
- event lifecycle management
- access/check‑in
- bar/POS operations
- staff operations
- analytics and operational visibility

Evnto is built using the same multi‑tenant platform primitives as other Rottay verticals, plus specialized domain modules for events, bar, and staff.

---

## 2) Who it’s for (buyer profiles)

- venue owners and operators
- event organizers and promoters
- bar and floor operations teams
- staff coordinators

Outcome framing:
- fewer operational failures on event night
- unified workflows instead of scattered tools
- predictable staffing and bar operations

---

## 3) The operational workflow (ASCII)

```text
Organizer / Operator
   |
   v
Event setup (venue, stages, lineup, ticket types)
   |
   v
Publish / Sell / Manage
   |
   +--> Attendee ticket lifecycle (buy/transfer/check-in)
   |        |
   |        v
   |     Check-in / access control (QR primitives)
   |
   +--> Bar/POS operations (orders -> prep -> pickup)
   |
   +--> Staff ops (staff -> shifts -> assignments -> time records)
   |
   v
Analytics / finance snapshots (where enabled)
```

---

## 4) Domain modules behind Evnto (capability surface)

Even if the UI does not expose every feature yet, the domain modules define what Evnto can become without rebuilding foundations.

### 4.1 Events & ticketing domain (`@rottay/events`)

Documented capabilities include:
- event lifecycle (draft → publish → in progress → complete/cancel)
- venue/stage/lineup management
- ticket types, tickets, waitlists
- check‑in primitives (QR flow)
- resale marketplace primitives (as documented)
- finance + analytics surfaces

Source:
- `.ai-docs/domain-modules/events/USE-CASES.md` (83 documented use cases)

### 4.2 Bar / POS domain (`@rottay/bar`)

Documented capabilities include:
- bar orders + preparation workflows
- POS primitives
- inventory, suppliers, purchase orders

Source:
- `.ai-docs/domain-modules/bar/USE-CASES.md` (76 documented use cases)

### 4.3 Staff operations domain (`@rottay/staff`)

Documented capabilities include:
- staff members and credentials
- shifts and assignments
- time records and payroll‑period primitives

Source:
- `.ai-docs/domain-modules/staff/USE-CASES.md`

---

## 5) What the Evnto app depends on today (repo-backed)

From `app-evnto/package.json` (as of 2026-02-10), Evnto directly depends on:
- `@rottay/events`
- `@rottay/bar`
- `@rottay/staff`
- `@rottay/auth`, `@rottay/identity`, `@rottay/tenancy`
- `@rottay/design-system`

Modules like `@rottay/payments` and `@rottay/web3` exist in this repo but are not listed as direct Evnto app dependencies as of this date.

Verified inventory:
- [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## 6) Multi-tenant and white-label direction

Evnto follows Rottay’s tenant-first principles:
- tenant-scoped data boundaries
- RBAC + plan enforcement patterns where enabled
- branding direction (where contracted and implemented)

Platform reference:
- [`04-PLATFORM-OVERVIEW-EN.md`](./04-PLATFORM-OVERVIEW-EN.md)

---

## 7) Next docs

- Verticals overview: [`05-VERTICALS-OVERVIEW-EN.md`](./05-VERTICALS-OVERVIEW-EN.md)
- Developer guide: [`08-DEVELOPER-GUIDE-EN.md`](./08-DEVELOPER-GUIDE-EN.md)
