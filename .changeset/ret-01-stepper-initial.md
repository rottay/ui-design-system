---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-STEPPER-INITIAL). The deprecated `StepperProps.initial` member retires from the Stepper contract. It was documented as the uncontrolled seed and marked `@deprecated Use defaultCurrent instead`, but no engine ever read it as one: the Modern engine destructured it only to keep it off the DOM and discarded the value, and the Classic and Rustic engines never mention it, so `<Stepper initial={n} />` always rendered at step 0 unless `defaultCurrent` or `current` was also stated. The consumer census measured zero `initial` on a `Stepper` across the package, the showroom and the three vertical apps. Nothing renders differently for a typed caller. Out of this lot and unchanged: the deprecated `Steps` name, `StepsProps` and `ProgressDotInfo`. `StepsProps` is a standalone interface that declares its own `initial` (it does not extend or pick from `StepperProps`), and `Steps` keeps mapping that prop to `defaultCurrent`, so `<Steps initial={n} />` still seeds the uncontrolled position exactly as before. Downstream apps: `initial` on a `Stepper` (or on an object typed `StepperProps`) fails at compile time on upgrade; replace it with `defaultCurrent`, which is the prop that actually seeds the uncontrolled step.

```contract-diff
signature .#StepperProps — member `initial?: number` removed; deprecated and never honored by any engine (Modern discarded it, Classic and Rustic never read it), zero consumers across package, showroom and the three apps; `StepsProps.initial` and the `Steps` mapping to `defaultCurrent` are unchanged, zero behavior change; migrate to `defaultCurrent` (RET-01-STEPPER-INITIAL)
```
