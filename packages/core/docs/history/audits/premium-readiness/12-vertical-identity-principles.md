# Vertical Identity Principles

This file answers a key product requirement:

- the apps must share functionality
- but they must not feel like copy-paste products

The right target is:

- centralized behavior
- leveled customization
- distinct vertical personality

## Core principle

We do not want three separate design systems.

We want:

- one DS runtime
- one family of canonical primitives/patterns/structures
- one shared app template
- three distinct vertical profiles

## What must stay centralized

These should behave the same everywhere unless there is a very strong reason not to:

- form behavior
- validation behavior
- table state model
- filtering model
- selection model
- saved views model
- command palette behavior
- search infrastructure
- notification plumbing
- tenant resolution and appearance pipeline
- settings surface mechanics
- shell accessibility model

## What should be customizable per vertical

These should be deliberately different so each app has a real identity:

- shell composition and emphasis
- dashboard composition
- workspace chrome and action layout
- motion profile
- shape language
- density defaults
- page-header style
- card and panel recipes
- empty states
- illustrative accents
- icon emphasis
- copy tone

## Recommended identity profiles

## Rotate / App Platform

Theme:

- cyber security
- DevOps
- control room
- signal intelligence

Characteristics:

- sharper geometry
- tighter rhythm
- denser surfaces
- stronger command posture
- clearer operational hierarchy
- less decorative softness
- more confident console energy without looking cheap

Visual rules:

- search/command can lead from the left
- actions should feel decisive and operational
- cards should feel like monitored surfaces, not marketing cards
- dashboards need strict priority ladders and live-signal emphasis

## BitHire

Theme:

- talent network
- executive recruiting
- LinkedIn-meets-ATS

Characteristics:

- more editorial spacing
- more human-profile emphasis
- clearer identity columns
- calmer professional surfaces
- stronger credibility and trust
- less control room, more network intelligence

Visual rules:

- people and company identity should be primary
- lists should privilege profile context over raw ops density
- shell should feel polished and business-like
- cards should feel professional, not futuristic

## Evnto

Theme:

- nightlife operations
- ticketing
- rounded energetic hospitality platform

Characteristics:

- softer corners
- more animated motion
- more playful accents
- warmer color energy
- more live venue and momentum than admin console

Visual rules:

- controls can feel more rounded and kinetic
- badges/status should feel more lively
- dashboards can support more expressive movement
- shell should feel hospitality/event-native, not enterprise-security-native

## Shared identity matrix

| Layer | Rotate | BitHire | Evnto |
|---|---|---|---|
| Shell | command/control | professional network | lively venue ops |
| Shape | sharp | balanced | rounded |
| Motion | restrained, precise | calm, subtle | expressive, lively |
| Workspace | operational | profile-first | roster/live-ops |
| Dashboard | control room | talent intelligence | event pulse |
| Tone | security/devops | business/social graph | hospitality/nightlife |

## Rule of thumb

If two apps feel identical in:

- shell rhythm
- page chrome
- dashboard composition
- workspace control layout

then the system is under-customized.

If two apps diverge in:

- behavior
- state model
- accessibility semantics
- tenancy logic

then the system is over-fragmented.
