# Master Rubric (120 Angles)

Scoring scale:

- `9-10`: premium-final
- `7-8`: strong but not fully closed
- `5-6`: credible, partial, or hybrid
- `3-4`: weak or drift-prone
- `1-2`: misleading or broken

## 1. DS Contracts And Tenant Model

| # | Criterion | Score | Note |
|---|---|---:|---|
| 1 | `TenantConfig` has a coherent premium model | 8 | much better after narrowing |
| 2 | bundled vs DB tenant boundary is explicit | 8 | largely real now |
| 3 | `appearance.general` is a real runtime contract | 8 | real, but not universal |
| 4 | `appearance.advanced` is bounded | 7 | bounded, still not premium-final |
| 5 | `brandTheme` story is honest for bundled tenants | 8 | still the strongest premium source |
| 6 | `brandThemeId` truth is fully resolved in docs/contracts | 5 | some old audit docs still discuss it as live strategy |
| 7 | contract surface avoids inert props | 8 | much cleaner than before |
| 8 | DB tenant v1 contract is truthful | 7 | improved, still hybrid at authoring/preview edges |
| 9 | session/bootstrap tenant contract matches canonical model | 4 | first paint still legacy-skewed |
| 10 | authoring contract matches runtime contract | 4 | preview/authoring still old-model centered |

Section average: `6.7`

## 2. DS Runtime And Theme Resolution

| # | Criterion | Score | Note |
|---|---|---:|---|
| 11 | theme precedence is explicit | 9 | one of the strongest areas |
| 12 | `backgroundMode` reaches runtime behavior | 9 | proven better than before |
| 13 | provider merge order is coherent | 8 | strong |
| 14 | static generator includes `appearance` | 8 | real improvement |
| 15 | client runtime preserves `appearance` | 8 | fixed and real |
| 16 | tenant config normalization is understandable | 8 | much better |
| 17 | first paint is equivalent to post-fetch state | 4 | still incomplete for DB tenants |
| 18 | server/client parity is trustworthy | 7 | mostly good, not complete |
| 19 | bundled tenant registry path is solid | 8 | credible |
| 20 | runtime path is documented truthfully | 6 | some rubric docs still lag |

Section average: `7.5`

## 3. DS Preview, Authoring, And Static Path

| # | Criterion | Score | Note |
|---|---|---:|---|
| 21 | preview accepts canonical appearance inputs | 3 | still legacy contract |
| 22 | authoring helpers generate canonical tenant configs | 4 | old model still central |
| 23 | preview uses real DS primitives | 3 | hand-built sample markup remains |
| 24 | preview is safe as a source of visual truth | 4 | directionally useful, not authoritative |
| 25 | static artifact generation reflects runtime appearance | 8 | much stronger now |
| 26 | static output supports bundled premium path | 8 | yes |
| 27 | DB preview path is credible | 4 | still partial |
| 28 | preview exercises Modern engine honestly | 3 | too much fake sample DOM |
| 29 | authoring path is future-proof | 5 | needs canonical reset |
| 30 | preview/authoring docs are current | 5 | still mixed |

Section average: `4.7`

## 4. DS Primitive Token Fidelity

| # | Criterion | Score | Note |
|---|---|---:|---|
| 31 | `Statistic` is on canonical bridge/tokens | 9 | now genuinely closed |
| 32 | `Card` variant surface is materially better | 8 | much improved |
| 33 | `Progress` token path is truthful | 8 | fixed |
| 34 | `Stepper` token naming aligns with `Steps` | 8 | fixed |
| 35 | `Descriptions` is fully canonical | 5 | still hybrid |
| 36 | high-visibility Modern display primitives are mostly tokenized | 7 | mixed but improved |
| 37 | input closure across M8 is credible | 7 | better than before |
| 38 | feedback primitives are mostly truthful | 7 | better, not perfect |
| 39 | modern theme bridge usage is consistent | 6 | some hybrids remain |
| 40 | old Daisy/Tailwind dependency on appearance is gone where it matters | 6 | reduced, not eliminated |

Section average: `7.1`

## 5. DS Patterns, Accessibility, And Interaction

| # | Criterion | Score | Note |
|---|---|---:|---|
| 41 | `CommandPalette` semantics are credible | 8 | much better now |
| 42 | `CommandPalette` focus management is strong | 8 | improved substantially |
| 43 | `DataTable` keyboard row entry is present | 8 | fixed |
| 44 | `DataTable` sorting semantics are solid | 8 | credible |
| 45 | `DataTable` reorder interaction has keyboard parity | 4 | still mouse-only grip |
| 46 | `AppShell` mobile drawer is modal-grade | 4 | not yet |
| 47 | shell controls are keyboard-safe | 8 | improved after shell fixes |
| 48 | flagship patterns avoid local escape hatches | 6 | DS side improved, app side still bypasses |
| 49 | interaction states feel systemized | 7 | okay in DS, less okay in apps |
| 50 | accessibility guardrails match complexity | 5 | not yet sign-off grade |

Section average: `6.6`

## 6. App-Platform Shell And Structural Ownership

| # | Criterion | Score | Note |
|---|---|---:|---|
| 51 | shell geometry is DS-owned | 8 | strong improvement |
| 52 | `AppLayout` is thin and structural | 8 | yes |
| 53 | mobile drawer desktop-collapse bug is resolved | 8 | fixed in current worktree |
| 54 | sidebar toggle semantics are accessible | 8 | fixed |
| 55 | shell visual language is fully DS-owned | 5 | still too local aesthetically |
| 56 | shell slots are thin consumers | 6 | structurally yes, visually mixed |
| 57 | topbar/search feels like a DS structure | 5 | still plain/local |
| 58 | sidebar/footer/avatar treatment is systemized | 5 | still local styling |
| 59 | shell metrics no longer drift in host | 8 | much better |
| 60 | shell is premium-final | 6 | healthier, not premium-final |

Section average: `6.7`

## 7. App-Platform Dashboard

| # | Criterion | Score | Note |
|---|---|---:|---|
| 61 | dashboard architecture is more maintainable than before | 8 | extraction helped |
| 62 | dashboard file-size sprawl is solved | 5 | still very large in places |
| 63 | dashboard hierarchy is strong | 4 | visually still weak |
| 64 | one focal scene exists | 4 | not enough hierarchy |
| 65 | repeated dashboard chrome is DS-owned | 4 | still mostly app-local |
| 66 | widget shell is credible | 8 | strongest visible sub-system |
| 67 | metric tiles are systemized | 4 | still local |
| 68 | action/filter clusters are systemized | 4 | still local |
| 69 | dashboard visual language feels premium | 5 | better, still repetitive |
| 70 | dashboard is sibling-reusable across apps | 4 | not yet |

Section average: `5.0`

## 8. App-Platform Workspace And Data UX

| # | Criterion | Score | Note |
|---|---|---:|---|
| 71 | workspace composes real DS patterns | 8 | yes |
| 72 | workspace still injects raw CSS around DS table | 4 | yes |
| 73 | workspace uses local micro-DS buttons/pills | 4 | yes |
| 74 | workspace control stack is elegant | 5 | still over-banded |
| 75 | table interaction quality is credible | 7 | decent |
| 76 | row action affordance quality is premium | 4 | too timid/cheap |
| 77 | workspace visual density is premium | 5 | busy and flat |
| 78 | selection/preview rail feels integrated | 7 | mostly good |
| 79 | data surface hierarchy is strong | 5 | still shallow |
| 80 | workspace is ready to be standardized as DS structure | 6 | close, but app-owned styling remains |

Section average: `5.5`

## 9. App-Platform Settings And Tenant Admin

| # | Criterion | Score | Note |
|---|---|---:|---|
| 81 | read path is appearance-aware | 8 | yes |
| 82 | write path is appearance-first | 8 | much improved |
| 83 | branding tab still exposes legacy colors directly | 5 | still true |
| 84 | legacy mirror through `updateBranding` is fully demoted | 6 | demoted, not removed |
| 85 | basic admin path is canonical enough for v1 | 7 | credible |
| 86 | advanced whitelabel path is explicitly expert-only | 5 | still too parallel |
| 87 | settings pages are thin DS-backed surfaces | 5 | many are still heavy/local |
| 88 | billing/api keys/webhooks feel DS-authored | 5 | still app-heavy |
| 89 | admin model feels coherent end to end | 6 | improved, still hybrid |
| 90 | tenant styling story is premium-final | 5 | not yet |

Section average: `6.0`

## 10. App-Evnto Architecture And DS Consumption

| # | Criterion | Score | Note |
|---|---|---:|---|
| 91 | provider order is sound | 8 | yes |
| 92 | tenant/branding pipeline is coherent | 8 | much healthier |
| 93 | shell ownership is DS-owned | 4 | still app-local |
| 94 | search experience is DS structural consumer | 4 | still custom/local |
| 95 | notification center is DS structural consumer | 4 | wrapped in local chrome |
| 96 | host CSS stays engine-agnostic | 3 | Classic-targeted overrides remain |
| 97 | table/data surfaces consume DS patterns well | 8 | strong area |
| 98 | widget/dashboard chrome is DS-owned | 5 | still local |
| 99 | feedback/modal primitives are upstreamed | 5 | custom confirm dialog remains |
| 100 | Evnto feels like a sibling of Platform | 6 | closer at boundary than at structure |

Section average: `5.5`

## 11. App-BitHire Architecture And DS Consumption

| # | Criterion | Score | Note |
|---|---|---:|---|
| 101 | provider order is sound | 8 | yes |
| 102 | tenant/branding pipeline is coherent | 8 | improved |
| 103 | shell ownership is DS-owned | 4 | still app-local |
| 104 | `v2` parallel shell family is gone | 2 | still present |
| 105 | visible product chrome is mostly DS-owned | 4 | still highly local |
| 106 | settings experience is structurally aligned with platform | 4 | still different/custom |
| 107 | theme overrides remain disciplined | 7 | relatively disciplined |
| 108 | auth path avoids redundant DS layers | 6 | some duplication noted |
| 109 | large surfaces stay thin consumers | 4 | style-heavy surface files remain |
| 110 | BitHire feels like a sibling of Platform | 5 | not yet structurally |

Section average: `5.2`

## 12. Cross-App Coherence, Guardrails, And Docs Truth

| # | Criterion | Score | Note |
|---|---|---:|---|
| 111 | bundled-vs-DB rule is shared across apps | 8 | yes |
| 112 | `appearance` transport is shared across apps | 8 | yes |
| 113 | one shell contract is shared across apps | 4 | no |
| 114 | settings/admin model feels like one product family | 4 | no |
| 115 | shared page/surface header patterns are unified | 4 | duplicated/local variants remain |
| 116 | DS guardrails cover end-to-end behavior | 5 | too shallow |
| 117 | token fidelity guardrails are broad enough | 5 | only a small matrix |
| 118 | docs are fully current and trustworthy | 5 | several older rubric docs still lag |
| 119 | apps feel like siblings in visible composition | 5 | partially |
| 120 | system is premium-final as a multi-app family | 4 | not yet |

Section average: `5.2`

## Consolidated View

Highest scoring zones:

- DS runtime and theme resolution
- tenant transport and provider wiring
- selected high-visibility DS closures

Lowest scoring zones:

- preview/authoring truth
- app-platform dashboard hierarchy
- cross-app shell/settings coherence
- BitHire structural convergence

