# Architecture Options

This file defines the decision space for a world-class multi-app template.

## Option A. Strict DS Consumer Model

### Idea

All apps consume:

- the same shell structure
- the same workspace structure
- the same page-header structure
- the same settings/admin structures

Verticals differ mostly through:

- tokens
- brand themes
- motion
- small layout toggles

### Pros

- maximum consistency
- easiest guardrails
- easiest maintenance
- least drift

### Cons

- highest risk that the apps feel too similar
- can make vertical identity feel superficial
- not ideal for your requirement of visibly distinct products

### Verdict

Too rigid for your goal.

## Option B. Shared Functional Core + Vertical Recipe Layer

### Idea

The DS owns:

- primitives
- patterns
- structures
- behavior/state contracts
- shell contract
- workspace contract
- settings/admin contract

Each app adds a vertical recipe layer that customizes:

- shell recipe
- workspace recipe
- dashboard recipe
- page-chrome recipe
- motion/shape/density profile

without changing the underlying behavior model.

### Pros

- keeps functionality centralized
- supports strong visual differentiation
- avoids each app becoming a new design system
- best fit for same capability, different feel

### Cons

- requires discipline in defining what is recipe vs what is core
- requires stronger DS contracts for higher-order structures

### Verdict

Recommended.

## Option C. Federated App Shells On Shared DS Primitives

### Idea

Each app keeps its own shell and visible product structures.

The DS only guarantees:

- primitives
- some patterns
- tenancy/theme/runtime

### Pros

- maximum local freedom
- easiest to continue from the current mixed state

### Cons

- highest drift
- hardest to audit
- apps become cousins, not siblings
- repeated local micro design systems keep growing

### Verdict

This is close to the current state, and it is exactly what is limiting quality.

## Recommendation

Choose Option B:

- one functional core
- one shared app template
- one DS-owned shell/workspace/settings contract
- three vertical recipe packs

## What a recipe layer may change

- order of controls
- search placement
- page-chrome density
- toolbar composition
- shell emphasis
- default panel styles
- accent treatment
- animation personality

## What a recipe layer may not change

- filtering behavior
- keyboard model
- accessibility contract
- table selection logic
- tenant pipeline
- command palette behavior
- settings save semantics
