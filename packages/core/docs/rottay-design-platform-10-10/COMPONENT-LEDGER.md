# Modern Component Upgrade Ledger

This is the one-by-one certification ledger for 94 public primitive families:
89 engine-backed primitives plus the specialized public `CodeBlock`,
`MarkdownView`, and `VoiceInputButton` families plus the public CSS-first
`SemanticSurface` plus the public `layout/responsive` family (`Show`, `Hide`,
`ResponsiveSlot` — Codex-verified public components, added as DS-P094 at
`audit`, not accepted). `P1` is the product-contract pass. `P2` is the adversarial craft pass. No item is complete without live
multi-brand evidence and a score of at least 90/100; flagship components
require 95/100.

Certification basket:

| Category | Accepted | Total | Certified |
| --- | ---: | ---: | ---: |
| Public primitives | 14 | 94 | 14.9% |
| Selected cross-product artifacts | 0 | 15 | 0% |
| Canonical surfaces | 0 | 6 | 0% |
| AI capability families | 0 | 6 | 0% |
| **Overall** | **14** | **121** | **11.6%** |

Recipes, supplier spikes, infrastructure, compiler work and application routes
are acceptance gates/canary evidence. They are not denominator artifacts.

Status vocabulary: `queued`, `audit`, `implementation`, `review`, `accepted`.

| ID      | Primitive              | Wave | P1       | P2       | Score | Flagship proof          |
| ------- | ---------------------- | ---: | -------- | -------- | ----: | ----------------------- |
| DS-P001 | display/Avatar         |    1 | queued   | queued   |     — | Candidate identity      |
| DS-P002 | display/Badge          |    1 | queued   | queued   |     — | Candidate status        |
| DS-P003 | display/Calendar       |    5 | queued   | queued   |     — | Interview scheduling    |
| DS-P004 | display/Callout        |    2 | queued   | queued   |     — | AI/risk explanation     |
| DS-P005 | display/Card           |    2 | accepted | accepted |    96 | Every workspace         |
| DS-P006 | display/Carousel       |    8 | queued   | queued   |     — | Showroom stress         |
| DS-P007 | display/Descriptions   |    5 | audit    | queued   |     — | Candidate facts         |
| DS-P008 | display/Empty          |    2 | audit    | queued   |     — | Empty queues            |
| DS-P009 | display/Image          |    8 | queued   | queued   |     — | Candidate media         |
| DS-P010 | display/Kbd            |    1 | queued   | queued   |     — | Command hints           |
| DS-P011 | display/List           |    3 | queued   | queued   |     — | Activity and results    |
| DS-P012 | display/QRCode         |    8 | queued   | queued   |     — | Showroom stress         |
| DS-P013 | display/Statistic      |    5 | audit    | queued   |     — | Pipeline metrics        |
| DS-P014 | display/Table          |    3 | audit    | queued   |     — | Candidate list          |
| DS-P015 | display/Tag            |    1 | audit    | queued   |     — | Skills and scopes       |
| DS-P016 | display/Timeline       |    5 | queued   | queued   |     — | Candidate journey       |
| DS-P017 | display/Tooltip        |    1 | accepted | accepted |    95 | Icon actions/table      |
| DS-P018 | display/Tree           |    8 | queued   | queued   |     — | Hierarchy stress        |
| DS-P019 | display/Typography     |    1 | accepted | accepted |    97 | All Candidates surfaces |
| DS-P020 | feedback/Alert         |    2 | audit    | queued   |     — | Blocking state          |
| DS-P021 | feedback/Drawer        |    4 | audit    | queued   |     — | Mobile/peek             |
| DS-P022 | feedback/Message       |    2 | audit    | queued   |     — | Inline feedback         |
| DS-P023 | feedback/Modal         |    4 | audit    | queued   |     — | Confirmed action        |
| DS-P024 | feedback/Notification  |    4 | audit    | queued   |     — | Async AI result         |
| DS-P025 | feedback/Progress      |    2 | queued   | queued   |     — | AI and readiness        |
| DS-P026 | feedback/Rate          |    8 | queued   | queued   |     — | Feedback stress         |
| DS-P027 | feedback/Result        |    4 | queued   | queued   |     — | Workflow completion     |
| DS-P028 | feedback/Skeleton      |    2 | queued   | queued   |     — | List/detail loading     |
| DS-P029 | feedback/Spinner       |    2 | queued   | queued   |     — | Local pending state     |
| DS-P030 | feedback/Toast         |    4 | audit    | queued   |     — | Save/action outcome     |
| DS-P031 | inputs/AutoComplete    |    2 | queued   | queued   |     — | Search/filter           |
| DS-P032 | inputs/Button          |    1 | accepted | accepted |    96 | Every action            |
| DS-P033 | inputs/Cascader        |    8 | queued   | queued   |     — | Taxonomy stress         |
| DS-P034 | inputs/Checkbox        |    2 | queued   | queued   |     — | Table selection         |
| DS-P035 | inputs/ColorPicker     |    8 | queued   | queued   |     — | Brand Studio            |
| DS-P036 | inputs/DatePicker      |    2 | queued   | queued   |     — | Availability            |
| DS-P037 | inputs/Form            |    2 | audit    | queued   |     — | Candidate editing       |
| DS-P038 | inputs/FormField       |    2 | queued   | queued   |     — | Candidate editing       |
| DS-P039 | inputs/Input           |    2 | audit    | queued   |     — | Search/detail form      |
| DS-P040 | inputs/InputNumber     |    2 | queued   | queued   |     — | Salary/range            |
| DS-P041 | inputs/Mentions        |    8 | queued   | queued   |     — | Collaboration stress    |
| DS-P042 | inputs/OTPInput        |    8 | queued   | queued   |     — | Auth stress             |
| DS-P043 | inputs/PasswordInput   |    2 | queued   | queued   |     — | Auth proof              |
| DS-P044 | inputs/Radio           |    2 | queued   | queued   |     — | View choice             |
| DS-P045 | inputs/Select          |    2 | audit    | queued   |     — | Filters/editing         |
| DS-P046 | inputs/Slider          |    2 | queued   | queued   |     — | Score/appearance        |
| DS-P047 | inputs/Switch          |    2 | queued   | queued   |     — | Settings                |
| DS-P048 | inputs/TagInput        |    2 | queued   | queued   |     — | Skills/tags             |
| DS-P049 | inputs/Textarea        |    2 | queued   | queued   |     — | Notes/AI prompt         |
| DS-P050 | inputs/TimePicker      |    2 | queued   | queued   |     — | Scheduling              |
| DS-P051 | inputs/Toggle          |    2 | queued   | queued   |     — | Toolbar modes           |
| DS-P052 | inputs/Transfer        |    8 | queued   | queued   |     — | Assignment stress       |
| DS-P053 | inputs/TreeSelect      |    8 | audit    | queued   |     — | Taxonomy stress         |
| DS-P054 | inputs/Upload          |    2 | queued   | queued   |     — | CV/evidence             |
| DS-P055 | layout/AspectRatio     |    1 | accepted | accepted |    90 | Media proof             |
| DS-P056 | layout/Box             |    1 | accepted | accepted |    92 | All surfaces            |
| DS-P057 | layout/Collapse        |    3 | queued   | queued   |     — | Progressive disclosure  |
| DS-P058 | layout/Container       |    1 | accepted | accepted |    93 | All surfaces            |
| DS-P059 | layout/Divider         |    1 | accepted | accepted |    93 | All compounds           |
| DS-P060 | layout/Flex            |    1 | accepted | accepted |    91 | All surfaces            |
| DS-P061 | layout/Grid            |    1 | accepted | accepted |    92 | Details/overview        |
| DS-P062 | layout/Layout          |    6 | queued   | queued   |     — | Workspace shell         |
| DS-P063 | layout/ScrollArea      |    4 | queued   | queued   |     — | Tables/rails            |
| DS-P064 | layout/Space           |    1 | accepted | accepted |    91 | Rhythm stress           |
| DS-P065 | layout/Splitter        |    6 | queued   | queued   |     — | Matching/peek           |
| DS-P066 | layout/Stack           |    1 | accepted | accepted |    91 | All surfaces            |
| DS-P067 | navigation/Affix       |    6 | queued   | queued   |     — | Sticky actions          |
| DS-P068 | navigation/Anchor      |    8 | queued   | queued   |     — | Long detail proof       |
| DS-P069 | navigation/BackTop     |    8 | queued   | queued   |     — | Long detail proof       |
| DS-P070 | navigation/Breadcrumb  |    3 | audit    | queued   |     — | Candidate navigation    |
| DS-P071 | navigation/FloatButton |    6 | queued   | queued   |     — | AI/customize action     |
| DS-P072 | navigation/Link        |    1 | queued   | queued   |     — | Every workspace         |
| DS-P073 | navigation/Menu        |    3 | audit    | queued   |     — | App/workspace nav       |
| DS-P074 | navigation/Pagination  |    3 | audit    | queued   |     — | Candidate list          |
| DS-P075 | navigation/Segmented   |    3 | audit    | queued   |     — | View/density modes      |
| DS-P076 | navigation/Stepper     |    5 | queued   | queued   |     — | Setup/workflow          |
| DS-P077 | navigation/Steps       |    5 | queued   | queued   |     — | Pipeline/journey        |
| DS-P078 | navigation/Tabs        |    3 | accepted | accepted |    95 | Candidates feature tabs |
| DS-P079 | overlay/AlertDialog    |    4 | queued   | queued   |     — | Destructive action      |
| DS-P080 | overlay/ConfirmDialog  |    4 | queued   | queued   |     — | AI/action confirmation  |
| DS-P081 | overlay/ContextMenu    |    4 | queued   | queued   |     — | Table row actions       |
| DS-P082 | overlay/Dropdown       |    4 | audit    | queued   |     — | Toolbar/actions         |
| DS-P083 | overlay/HoverCard      |    4 | queued   | queued   |     — | Candidate peek          |
| DS-P084 | overlay/Modal          |    4 | queued   | queued   |     — | Complex action          |
| DS-P085 | overlay/Popconfirm     |    4 | queued   | queued   |     — | Inline confirmation     |
| DS-P086 | overlay/Popover        |    4 | accepted | accepted |    95 | Filters/context         |
| DS-P087 | overlay/Sheet          |    4 | audit    | queued   |     — | Widget catalog/mobile   |
| DS-P088 | overlay/Tour           |    8 | queued   | queued   |     — | Onboarding stress       |
| DS-P089 | overlay/Watermark      |    8 | queued   | queued   |     — | Governance stress       |
| DS-P090 | display/CodeBlock      |    5 | queued   | queued   |     — | AI artifact/code proof  |
| DS-P091 | display/MarkdownView   |    5 | queued   | queued   |     — | AI/evidence rendering   |
| DS-P092 | inputs/VoiceInputButton |   4 | queued   | queued   |     — | Prompt/input modality   |
| DS-P093 | layout/SemanticSurface | K1 | audit | queued | — | Cross-product surface roles |
| DS-P094 | layout/responsive | — | audit | queued | — | Bounded responsive visibility (Show/Hide/ResponsiveSlot) |

## Shared pattern tickets already identified

| ID      | Capability             | Owner layer | Status         | Product proof          |
| ------- | ---------------------- | ----------- | -------------- | ---------------------- |
| DS-C001 | WorkspaceTabs          | pattern     | audit          | Candidates navigation  |
| DS-C002 | RecordHero             | pattern     | queued         | Candidate dossier      |
| DS-C003 | ActionDock             | structure   | queued         | Candidate dossier      |
| DS-C004 | PriorityBand           | pattern     | queued         | Candidates overview    |
| DS-C005 | RankedActionList       | pattern     | queued         | Today/next actions     |
| DS-C006 | DecisionBrief          | pattern     | queued         | AI intelligence        |
| DS-C007 | AssistantRail          | pattern     | queued         | Scoped copilot         |
| DS-C008 | JourneyWorkspace       | surface     | queued         | Candidate journey      |
| DS-C009 | DetailFactsEditor      | pattern     | queued         | Candidate details      |
| DS-C010 | ListToolbar            | pattern     | audit          | Candidate list         |
| DS-C011 | DataTable              | pattern     | review         | Candidate list         |
| DS-C012 | PeekPanel              | pattern     | queued         | Candidate list         |
| DS-C013 | SplitDecisionWorkspace | surface     | queued         | Matching               |
| DS-C014 | DecisionComparison     | pattern     | review         | Compare                |
| DS-C015 | WidgetBoard            | pattern     | implementation | Overview/customization |

## Canonical surface certification

| ID        | Surface           | Status | Primary proof |
| --------- | ----------------- | ------ | ------------- |
| DS-SUR001 | ListSurface       | queued | Candidate list |
| DS-SUR002 | OverviewSurface   | queued | Candidates overview |
| DS-SUR003 | RecordSurface     | queued | Candidate record |
| DS-SUR004 | DecisionSurface   | queued | Matching/compare |
| DS-SUR005 | WidgetWorkspace   | queued | Customizable overview |
| DS-SUR006 | AIWorkspace       | queued | Supplier-neutral AI flow |

## AI capability-family certification

| ID       | Family | Status | Scope |
| -------- | ------ | ------ | ----- |
| DS-AI001 | Status and generation control | queued | async status, streaming and stop/retry |
| DS-AI002 | Evidence, confidence and cost | queued | sources, uncertainty and estimate/actual usage |
| DS-AI003 | Prompt and suggestion | queued | composer, scope, attachments, voice and suggested actions |
| DS-AI004 | Recommendation and plan | queued | value, evidence, editable scope and execution boundary |
| DS-AI005 | Approval, run, artifact and diff | queued | tools, interruption, recovery, accept/reject and undo |
| DS-AI006 | Assistant and generative surface | queued | scoped copilot, typed generated UI and outcome insight |

## Catalog ownership debt

- `feedback/Modal` (`DS-P023`) and `overlay/Modal` (`DS-P084`) are two public
  families with overlapping names/responsibility. Neither can be newly
  certified until `DS-CAN009` names the canonical behavior/anatomy owner,
  compatibility path and deprecation/migration rule.
- Modern has 39 physical pattern engines versus Classic 43 and Rustic 37.
  Parity gaps are tracked by named family and must not be hidden by the 132
  aggregate Modern implementation count.

## Acceptance evidence fields

Each accepted row must link to:

- implementation diff;
- token/recipe mapping;
- Pass 1 behavior and accessibility evidence;
- Pass 2 Storybook/showroom matrix;
- contrasting-theme comparison;
- flagship application screenshot or recording;
- unresolved limitations, if any.

## Accepted wave evidence

### Wave A-01 — 6/92 public primitives accepted at that historical denominator

Shared release evidence for `DS-P005`, `DS-P017`, `DS-P019`, `DS-P032`,
`DS-P078`, and `DS-P086`:

- implementation and recipe ownership: the corresponding Modern engines plus
  `foundation/tokens/css/runtime/engines/modern/skin/*`;
- tenant contracts: `BrandChrome`, `TenantThemeChrome`, the Appearance schema,
  and the canonical chrome-variable compiler own Tooltip/Popover material,
  density, geometry, and motion channels;
- Pass 1/Pass 2 evidence: 17 focused Vitest files, 246 assertions passing;
- packaging evidence: public supplier contract, CSS source-integrity gate,
  TypeScript, Vite ESM/CJS declarations, Modern/commercial/vertical CSS, font
  packs, build stamp, and public-barrel gate all passing;
- live proof:
  `packages/showroom/e2e/whitelabel/brand-locale-visual-matrix.spec.ts`, 7/7
  passing across 12 stable visual cells (BitHire static vs The Management
  Appearance projection;
  EN/ES/AR; LTR/RTL; desktop/mobile), including opened Tooltip and Popover
  computed chrome;
- contrasting-theme proof: the matrix requires materially different type,
  corners, depth, surfaces, controls, overlay materials, and foreground pixels;
- flagship application proof: the shared specimen exercises the exact Card,
  Typography, Button, Tabs, Tooltip, and Popover public components consumed by
  Candidates; Candidates remains the next-wave canary rather than a substitute
  for DS acceptance;
- unresolved limitation: some legacy async interaction tests emit React `act()`
  warnings although all assertions pass; removing that test-harness noise is
  tracked separately and does not change runtime behavior.

### Wave A-02 — 14/92 public primitives accepted at that historical denominator

Shared release evidence for `DS-P055`, `DS-P056`, `DS-P058`, `DS-P059`,
`DS-P060`, `DS-P061`, `DS-P064`, and `DS-P066`:

- implementation ownership: the public contracts and all three runtime engines
  for AspectRatio, Box, Container, Divider, Flex, Grid, Space, and Stack, plus
  the Modern layout skin and responsive rule projection;
- tenant contracts: `BrandChrome`, `TenantThemeChrome`, the closed Appearance
  schema, and the canonical compiler own the relevant surface, border, depth,
  corner, typography, spacing, and motion channels; component markup stays
  identical while those channels change;
- Pass 1/Pass 2 evidence: 49 focused layout and compiler Vitest files, 1,337
  assertions passing and two intentional skips;
- adversarial evidence: invalid/non-finite layout numbers normalize safely,
  long content cannot force Grid track overlap, Flex scalar/tuple/responsive gaps
  share one canonical resolver, and Divider exposes logical `start`/`end`
  semantics while preserving deprecated physical aliases;
- packaging evidence: supplier contract, CSS source-integrity, TypeScript,
  Vite ESM/CJS declarations, Modern/commercial/vertical CSS, font packs, build
  stamp, public-barrel gate, and the production Showroom build all pass;
- live proof:
  `packages/showroom/e2e/whitelabel/layout-foundations-matrix.spec.ts`, 8/8
  passing across 12 stable visual cells (BitHire static vs The Management
  Appearance projection;
  EN/ES/AR; LTR/RTL; desktop/mobile), plus in-place static → Appearance →
  static cleanup and responsive overflow assertions;
- RTL proof: the application now requests `textPosition="start"`; Divider owns
  the physical mirroring. Three Arabic snapshots changed deliberately after
  visual diff inspection, while all geometry and overflow assertions remained
  green;
- contrasting-theme proof: the same public component tree renders materially
  different typography, density, corners, borders, depth, surfaces, controls,
  and direction without app-authored visual branching;
- regression caught before acceptance: the hostile-input Grid hardening first
  removed valid arbitrary string templates; the focused suite failed, string
  compatibility was restored, and the full aggregate suite was rerun green;
- evidence boundary: The Management is exercised through a DB-safe Appearance
  document projection, not a live database query. Live tenant retrieval remains
  an application integration responsibility and is not claimed by this DS gate;
- unresolved systemic limitation: the broader Modern CSS fleet still contains
  duplicated component paint and framework-specific compatibility overrides.
  They are now isolated behind a shrinking bridge and remain a prerequisite for
  accepting additional primitive families.

### Cascade and ownership checkpoint after Wave A-02

- bundled Tailwind/DaisyUI is bounded by `rottay-framework`; first-party tokens,
  components and engine skins win through declared layer ownership rather than
  selector specificity or unlayered paint;
- the current 617-line Modern `theme.css` and 450-line
  `framework-bridge.css` have explicit responsibility boundaries:
  typed `BrandTheme`/`Appearance` compilers plus canonical foundation defaults
  own custom properties, `theme.css` owns inherited component paint, and
  `framework-bridge.css` contains the remaining compatibility debt without
  token redefinition; there is no separate authoritative `variables.css`;
- the generic Daisy Divider selectors and global Space utility hacks were
  removed after public primitives stopped emitting those framework classes;
- `css-layer-paint-gate` now rejects wrong layer ownership, token declarations
  in paint/bridge files, unscoped bridge selectors, and resurrection of those
  generic framework hooks; its focused suite passes 8/8;
- `packages/core/scripts/engine-token-audit.baseline.json` still records the
  flattened aggregate `themeCss.lineCount = 1345`; that is a historical audit
  counter, not the current size of `theme.css`;
- Divider no longer relies on Daisy pseudo-elements and keeps a tokenized
  intrinsic vertical-size floor, preserving action separators inside Space as
  well as logical RTL positioning;
- post-change evidence: the complete design-system build and production
  Showroom build pass; the combined brand/locale and layout matrix passes 15/15
  without snapshot updates after the intentional Divider baselines were
  reviewed and regenerated.
