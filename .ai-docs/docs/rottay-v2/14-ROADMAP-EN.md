# Rottay — Roadmap (Now / Next / Later)

**Last updated:** 2026-02-10  
**Audience:** internal planning, investor diligence, product alignment.  
**Rule:** avoid hard dates unless explicitly scheduled; use status labels instead.

---

## Status labels

- **Now (shipping / in repo):** code exists in this workspace and is used or usable.
- **Next (in progress):** active work or clearly scoped implementation plans exist.
- **Later (planned):** intentional direction; requires more discovery/implementation.

Verified inventory for “Now” items:
- [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)

---

## Now (shipping / in repo)

### Platform foundation
- `@rottay/core` primitives and architecture rules
- Platform modules: auth, identity, tenancy, permissions, feature-flags, navigation, notifications, compliance
- Plan enforcement model documented (RBAC + features + quotas)
- Platform admin app (`app-platform/`)

### Verticals in this repo
- BitHire (`app-bithire/`) + LinkedIn Chrome extension (`ext-bithire/`)
- Evnto (`app-evnto/`)

### Shared UI/tooling
- `@rottay/design-system` (shared design system)
- `ui-remotion/` (marketing video tooling)

---

## Next (in progress / clearly scoped)

### 1) Reduce naming drift (developer experience)

There is a “final names” mapping in `MODULES-DEFINITION.md` (e.g., `recruiter → talent`, `scoring → assessment`, `ia-chat → ai-assistant`, `events → ticketing`).

Next steps:
- decide “public marketing names” vs “package names”
- define migration strategy (aliases, deprecation windows)
- update docs so external messaging matches shipping package names

### 2) Make packaging/bundles explicit (commercialization)

Turn the platform into clear bundles:
- Foundation (auth/identity/tenancy/permissions)
- Monetization & control (feature flags + quotas, optional payments)
- Experience (navigation + notifications)
- Compliance profiles (scoped add-ons)

Outcome:
- easier pricing and sales conversations
- reduces “too many choices” paralysis

### 3) Vertical polish + integration alignment

Evnto’s app dependencies currently include events/bar/staff; payments and web3 modules exist but are not direct deps as of 2026-02-10.

Next steps:
- make explicit which features are “module capability” vs “wired in UI”
- align vertical messaging to actual app scope

### 4) Event bus unification (platform compounding)

There is a detailed implementation plan in:
- `EVENTBUS_ARCHITECTURE.md`

Outcome:
- decoupled integrations
- compliance/notifications/analytics triggers become consistent
- webhooks and enterprise integrations become easier to productize

---

## Later (planned / discovery needed)

### 1) Dedicated isolation tiers (enterprise)

Tenancy types and plan configuration include concepts that support enterprise isolation, but the operational model should be made explicit:
- shared DB with tenant-level isolation (default)
- higher isolation tiers (dedicated DB and/or dedicated infra) where contracted

### 2) External licensing model for “builders”

Rottay’s monetization strategy includes subscription-gated module access for third-party builders (e.g., compile/publish packages, provide keys/tokens, enforce features at runtime).

The enforcement building blocks exist (plans/features/quotas), but the product surface must be designed:
- provisioning and key lifecycle
- offline/grace behavior
- transparent metering and billing

### 3) Open-source strategy for design system

There is a strategic desire to make design system primitives public (and keep custom components private).

Planned outputs:
- public repo split (or public package publishing)
- clear licensing and contribution guidelines

---

## Source pointers

- Verified package inventory: [`00-FACTS-AND-STATUS.md`](./00-FACTS-AND-STATUS.md)
- Planned naming map: `MODULES-DEFINITION.md`
- Event bus plan: `EVENTBUS_ARCHITECTURE.md`

