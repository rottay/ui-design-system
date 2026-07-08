# @rottay/design-system

## 2.16.5

### Patch Changes

- feat(inputs): `Input` gains a bare `type="file"` passthrough — renders a chrome-free `<input type="file">` that forwards its ref (for programmatic `.click()`) and its native change event (so callers read `event.target.files`), plus `accept` / `multiple` props. Lets apps use a DS primitive for native file pickers instead of raw `<input type="file">`. (app-bithire WO-CNF-01 / RT-ERR-02.)

## 2.16.4

### Patch Changes

- fix(Box): void HTML elements (`input`, `img`, `br`, `hr`, `area`, `base`, `col`, `embed`, `source`, `track`, `wbr`) rendered via `Box as="…"` no longer crash under the `modern` engine. `ModernBox` passed `React.Children.toArray(undefined)` (=== `[]`) as the `createElement` children argument, and React-DOM rejects a children argument on a void element ("`<input>` is a void element tag and must neither have children…"), so every void `Box` was replaced by the `EngineErrorBoundary`. All three engines (`modern`/`classic`/`rustic`) now gate on `isVoidElement(as)` and create void elements with no children argument. This unbroke the public apply page whose hidden job-identifier input was dropped. (app-bithire WO-CNF-01 / RT-ERR-01.)
- feat(inputs): `Input` gains a bare `type="hidden"` passthrough — renders a chrome-free, form-participating `<input type="hidden">` for server-action forms (FormData) without any wrapper, focus ring, or placeholder styling.

## 2.9.0

### Minor Changes

- a65322b: feat(surfaces): CollectionWorkspace gains `surfaceMode` (`"page" | "embed"`) and a `chrome` config to control which workspace regions (header, command, context, stats, insights, activeFilters, ...) render per instance. Embedded workspaces (nested inside another surface) default to minimal chrome; page workspaces render the full collection chrome. Enables consuming apps to embed collection workspaces inside record-detail sections without the full page chrome.

## 2.8.14

### Patch Changes

- Fix modern data table body cells so visible row content uses configured column widths instead of collapsing to zero width.
