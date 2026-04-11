# Modern Navigation + Feedback + Overlay Audit

Scope:

- `src/components/primitives/navigation/**/engines/modern.tsx`
- `src/components/primitives/feedback/**/engines/modern.tsx`
- `src/components/primitives/overlay/**/engines/modern.tsx`
- directly adjacent helpers when they materially change runtime customization

## Main Findings

### 1. Chrome is barely used in this scope

Repo audit did not find a real first-class chrome consumption path inside Modern
navigation / feedback / overlay primitives.

In practice, these primitives mostly read:

- raw `--ds-*` CSS variables
- DaisyUI bridge classes
- local maps / defaults

They do **not** meaningfully read Modern chrome channels as a system in the way the
contracts imply.

### 2. Personality is almost absent

The main personality-aware example in this scope is `Skeleton`, but the Modern engine itself
is still mostly DaisyUI/default-driven. The wrapper reads personality defaults; the renderer
does not make personality a first-class axis.

### 3. The biggest DS-bypass cases are obvious and concentrated

Highest-priority bypasses called out during audit:

- `Progress`
- `Link`
- `Breadcrumb`
- `Stepper`
- `Skeleton`
- `AlertDialog`

These are the clearest cases where the Modern path still collapses to library defaults,
hardcoded metrics, or contract surfaces that never reach the actual render path.

## Feedback Primitives

| Primitive | Status | Main note |
| --- | --- | --- |
| `Alert` | Strong | Good shell tokenization, though still partly DaisyUI-driven |
| `Drawer` | Strong | Panel tokens land well |
| `Message` | Strong | Good shell-level DS consumption |
| `Modal` | Strong | Stronger panel token path than most feedback primitives |
| `Notification` | Strong | Good shell tokenization |
| `Progress` | Weak | Core control still relies on Daisy `progress-*` behavior and hardcoded circle sizing |
| `Rate` | Weak | Some tokenized size helpers exist, but runtime visuals still hinge on Daisy defaults |
| `Result` | Strong | Text/status shell is meaningfully DS-aware |
| `Skeleton` | Weak | Wrapper sees personality, renderer remains mostly Daisy/default-driven |
| `Spinner` | Mixed | Colors are tokenized, but sizes are still hardcoded |
| `Toast` | Strong | Good CSS-var path, including animation helpers |

## Navigation Primitives

| Primitive | Status | Main note |
| --- | --- | --- |
| `ActionDock` | Weak | Engine is effectively pass-through |
| `Affix` | Mixed | Only shallow tokenization of affixed shell |
| `Anchor` | Strong | One of the healthier navigation primitives |
| `BackTop` | Strong | Good DS variable usage |
| `BottomTabBar` | Weak | Shared shell reads some tokens, but geometry and badge text remain local |
| `Breadcrumb` | Weak | Uses Daisy shell and drops part of its declared surface |
| `FloatButton` | Strong | Good DS variable usage |
| `Link` | Weak | Maps to Daisy `link-*` classes and ignores its richer token contract |
| `Menu` | Strong | Active/hover colors read DS variables well |
| `MobileHeader` | Weak | Shared shell reads some tokens, but key layout metrics remain local |
| `Pagination` | Strong | Active state and shell read DS variables well |
| `Segmented` | Strong | Stronger DS token path than many peers |
| `Stepper` | Weak | Bypasses tokenized compound path and relies on Daisy `step*` |
| `Steps` | Mixed | Some text colors are tokenized; step shell remains largely Daisy/default-driven |
| `Tabs` | Strong | Good tokenized color/surface path |

## Overlay Primitives

| Primitive | Status | Main note |
| --- | --- | --- |
| `AlertDialog` | Weak | Mostly Daisy modal shell; only partial DS tinting |
| `ConfirmDialog` | Strong | Good DS-aware palette and shell |
| `ContextMenu` | Strong | Good DS-aware token usage |
| `Dropdown` | Strong | Good DS-aware token usage |
| `HoverCard` | Strong | Good DS-aware token usage |
| `Modal` | Strong | Uses tokenized size/padding/radius maps |
| `Popconfirm` | Strong | Good DS-aware token usage |
| `Popover` | Strong | Good DS-aware token usage |
| `Sheet` | Strong | Panel tokens land well |
| `Tour` | Strong | Good DS-aware token usage |
| `Watermark` | Mixed | Font color is tokenized, but geometry/rotation/gap remain local |

## Concrete Gaps

### `Link` ignores its richer contract

Modern link rendering maps mostly to DaisyUI class variants and does not honor the richer
tokenized contract exposed in the adjacent types.

Refs:

- `src/components/primitives/navigation/Link/engines/modern.tsx:70`
- `src/components/primitives/navigation/Link/engines/modern.tsx:163`
- `src/components/primitives/navigation/Link/Link.types.ts:255`

### `Stepper` bypasses the tokenized compound path

Modern `Stepper` flattens `Stepper.Step` children and skips the tokenized compound styling path.

Refs:

- `src/components/primitives/navigation/Stepper/engines/modern.tsx:122`
- `src/components/primitives/navigation/Stepper/engines/modern.tsx:245-266`
- `src/components/primitives/navigation/Stepper/compound/Step/index.tsx:205`

### `Progress` is still mostly library-driven

The control still depends on Daisy progress classes and hardcoded circle sizing.

Refs:

- `src/components/primitives/feedback/Progress/engines/modern.tsx:83`
- `src/components/primitives/feedback/Progress/engines/modern.tsx:158`
- `src/components/primitives/feedback/Progress/engines/modern.tsx:167`
- `src/components/primitives/feedback/Progress/engines/modern.tsx:192`

### `Skeleton` still misses real personality-driven rendering

The wrapper sees personality defaults, but the Modern engine remains mostly Daisy/default-based.

Refs:

- `src/components/primitives/feedback/Skeleton/Skeleton.tsx:64-79`
- `src/components/primitives/feedback/Skeleton/engines/modern.tsx:163`
- `src/components/primitives/feedback/Skeleton/engines/modern.tsx:166`
- `src/components/primitives/feedback/Skeleton/engines/modern.tsx:194`
- `src/components/primitives/feedback/Skeleton/engines/modern.tsx:205`

### `Spinner` ignores its own size token contract

Modern reads DS colors, but still uses local hardcoded sizes instead of the tokenized size map.

Refs:

- `src/components/primitives/feedback/Spinner/engines/modern.tsx:44`
- `src/components/primitives/feedback/Spinner/engines/modern.tsx:105`
- `src/components/primitives/feedback/Spinner/Spinner.types.ts:142`

## What To Fix First In This Category

1. Move `Link`, `Breadcrumb`, `Stepper`, `Progress`, `Skeleton`, and `AlertDialog` off their current default-heavy paths.
2. Decide whether chrome/personality are real runtime channels for this scope or just contract-level intent.
3. Reuse the tokenized compound/type helpers that already exist instead of re-deriving local maps in engines.
4. Add tests that prove a DS token override changes actual rendered output for one representative primitive per family.
