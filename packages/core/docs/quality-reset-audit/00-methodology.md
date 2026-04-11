# Methodology

Inputs used:

- code inspection across `ui-design-system/packages/core`
- code inspection across `app-platform`
- live local app validation for `app-platform`
- two screenshots provided by the user
- a 10-agent audit program with distinct scopes

Scopes covered:

1. visual first impression and premium feel
2. shell layout and navigation
3. Modern primitives and patterns
4. tenancy and customization architecture
5. accessibility and interaction quality
6. dashboard and workspace UX
7. typography, color, motion, and brand differentiation
8. performance and maintainability risk
9. cross-vertical coherence
10. docs, tests, guardrails, and story honesty

How scores are assigned:

- `1-3`: broken or severely misleading
- `4-5`: functional but mediocre
- `6-7`: solid but clearly incomplete
- `8-9`: strong and differentiated
- `10`: best-in-class, truthful, and repeatable

Evaluation principles:

- do not confuse tokenization with authored quality
- do not confuse technical polish with visual hierarchy
- do not call a contract complete unless the product truly authors and consumes it
- do not call a surface premium if the first impression is still generic

Important note about the 10-agent program:

- 10 agents were launched across two waves
- the highest-signal returned analyses are captured in `16-agent-ledger.md`
- some broader exploratory threads were shut down when they failed to converge quickly enough
- the final rubric is based on the returned agent signal plus direct local inspection
