# Modern Display + Layout Audit

Scope:

- `src/ui/primitives/display/**/engines/modern.tsx`
- `src/ui/primitives/layout/**/engines/modern.tsx`
- directly adjacent token/type helpers when they change the effective customization path

## Main Findings

### 1. Foundation primitives still hardcode the layout scale

The biggest Modern theming gap is the foundation layer.

`Box`, `Stack`, `Grid`, `Container`, and `Divider` still map spacing, radius, and shadow
through fixed Tailwind/rem tables instead of tenant-driven DS tokens.

Key references:

- `src/ui/primitives/layout/Box/engines/modern.tsx:158`
- `src/ui/primitives/layout/Box/Box.types.ts:467`
- `src/ui/primitives/layout/Stack/engines/modern.tsx:24`
- `src/ui/primitives/layout/Grid/engines/modern.tsx:160`
- `src/ui/primitives/layout/Container/engines/modern.tsx:27`
- `src/ui/primitives/layout/Divider/engines/modern.tsx`

This is high impact because every higher-level primitive composes these.

### 2. Several Modern display/layout components never hit their own bridge CSS

`modern/theme.css` already contains bridge selectors for multiple component families, but
some renderers never emit the expected classes, so the bridge is effectively dead for those
components.

Key examples called out during audit:

- `Calendar`
- `Descriptions`
- `List`
- `Empty`
- `Image`
- `QRCode`
- `Tree`
- `Collapse`

Representative refs:

- `src/foundation/tokens/css/runtime/engines/modern/theme.css:1763`
- `src/ui/primitives/display/Calendar/engines/modern.tsx:169`
- `src/ui/primitives/display/Descriptions/engines/modern.tsx:71`
- `src/ui/primitives/display/List/engines/modern.tsx:118`
- `src/ui/primitives/display/Tree/engines/modern.tsx:893`
- `src/ui/primitives/layout/Collapse/engines/modern.tsx:217`

### 3. Scalar sizes still bypass token maps

Several display/layout primitives have token maps in adjacent type files, but scalar
rendering still falls back to fixed tables or Tailwind classes.

Key examples:

- `Badge` size maps vs scalar rendering
- `Typography` size maps vs scalar rendering
- `Image` size maps vs scalar rendering
- `Kbd` geometry still local

Representative refs:

- `src/ui/primitives/display/Badge/Badge.types.ts:308`
- `src/ui/primitives/display/Badge/engines/modern.tsx:127`
- `src/ui/primitives/display/Typography/Typography.types.ts:462`
- `src/ui/primitives/display/Typography/engines/modern.tsx:58`
- `src/ui/primitives/display/Image/Image.types.ts:422`
- `src/ui/primitives/display/Image/engines/modern.tsx:20`
- `src/ui/primitives/display/Kbd/engines/modern.tsx:19`

### 4. Some declared props never affect the DOM

Examples:

- `Tooltip` exposes `arrow`, `radius`, `offset`, `zIndex`, `maxWidth`, and `interactive`
  but the Modern engine hardcodes offset/radius/timing.
- `Collapse` exposes `size`, but Modern does not read it.
- `Splitter` documents pixel semantics for `min` / `max`, while Modern clamps them as percentages.

Representative refs:

- `src/ui/primitives/display/Tooltip/Tooltip.types.ts:123`
- `src/ui/primitives/display/Tooltip/engines/modern.tsx:110`
- `src/ui/primitives/layout/Collapse/Collapse.types.ts:81`
- `src/ui/primitives/layout/Collapse/engines/modern.tsx:166`
- `src/ui/primitives/layout/Splitter/Splitter.types.ts:68`
- `src/ui/primitives/layout/Splitter/engines/modern.tsx:59`

## Display Primitives

Status legend:

- `Strong`: shell and major states are meaningfully DS-driven
- `Mixed`: DS vars reach the shell, but major scalar/bridge/interaction paths still bypass
- `Weak`: large parts of the primitive still rely on dead bridges, fixed maps, or defaults

| Primitive | Status | Main note |
| --- | --- | --- |
| `Avatar` | Strong | Core shell reads DS variables well |
| `Badge` | Mixed | Good shell tokenization, scalar size path still bypasses token maps |
| `Calendar` | Mixed | DS values land, but the engine does not fully connect to bridge selectors |
| `Callout` | Mixed | Benefits from `.alert`, but customization depth is shallow |
| `Card` | Strong | One of the better token-forward Modern display primitives |
| `Carousel` | Mixed | Partial benefit from bridge classes, not fully token-first |
| `Descriptions` | Weak | Bridge exists but renderer does not fully emit the styling path |
| `Empty` | Weak | Bridge path is effectively dead |
| `Image` | Mixed | Shell is tokenized, scalar sizing still local |
| `Kbd` | Mixed | DS colors land, geometry remains local |
| `List` | Weak | Theme bridge exists but render path does not fully use it |
| `QRCode` | Weak | Bridge path is incomplete for real customization |
| `Statistic` | Mixed | Color shell is DS-aware, typography/geometry remain mostly fixed |
| `Table` | Mixed | Strong color shell, but density/row/control chrome are still partially fixed |
| `Tag` | Mixed | Shell tokenized, scalar size path still local |
| `Timeline` | Strong | One of the few bridge-connected display primitives |
| `Tooltip` | Mixed | Declared prop surface is wider than actual runtime behavior |
| `Tree` | Weak | Bridge path is incomplete, customization does not fully reach rows |
| `Typography` | Mixed | Responsive path is good; scalar sizing still uses local maps |

## Layout Primitives

| Primitive | Status | Main note |
| --- | --- | --- |
| `AspectRatio` | Pass-through | Structural primitive, little DS theming surface by design |
| `Box` | Weak | Foundation hardcodes spacing/radius/shadow decisions |
| `Collapse` | Mixed | Tokenized shell, but bridge + `size` prop parity are incomplete |
| `Container` | Weak | Fixed width/spacing maps bypass DS scale |
| `Divider` | Mixed | Part of the foundation hardcode problem |
| `Flex` | Mixed | Responsive path is healthy, scalar gap/flex remain local |
| `Grid` | Weak | Foundation hardcodes layout scale and track behavior |
| `Layout` | Mixed | Some shell vars land, but many layout/chrome details remain fixed |
| `ScrollArea` | Mixed | Uses Daisy color tokens for scrollbars, not DS-first scrollbar tokens |
| `Space` | Strong | One of the cleaner preset-driven layout primitives |
| `Splitter` | Mixed | Some customization path exists, but prop semantics drift from contract |
| `Stack` | Weak | Foundation hardcodes spacing scale |

## Strong Coverage Worth Keeping

- Responsive customization is solid where the shared responsive helpers are used:
  `Box`, `Flex`, `Stack`, `Card`, `Badge`, and `Typography`.
- `Card`, `Avatar`, `Badge`, and `Space` are good reference implementations for
  Modern token-first shell styling.
- `Timeline` is a useful proof point that the DaisyUI/Tailwind bridge can work when
  the renderer actually emits the expected classes.

## What To Fix First In This Category

1. Replace fixed spacing/radius/shadow maps in foundation primitives with DS token values or CSS variables.
2. Reconnect or delete dead bridge selectors for `Calendar`, `Descriptions`, `List`, `Empty`, `Image`, `QRCode`, `Tree`, and `Collapse`.
3. Make scalar sizing use the same token maps as responsive sizing.
4. Wire declared props that currently do nothing (`Tooltip`, `Collapse`, `Splitter`, parts of `Layout`).
