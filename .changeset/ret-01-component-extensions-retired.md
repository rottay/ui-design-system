---
"@rottay/design-system": major
---

RET-01 retires the reserved universal extensions contract: the 28 types of the
extensions module and the `EngineAwareProps.extensions` member. The protocol was
designed and never connected: no production component read `extensions`, no
runtime resolver created `ExtensionHelpers`, and passing the prop had no effect.
Only `ComponentExtensions` and `ExtensionHelpers` carried `@deprecated`; the other
26 types were published without a marker and are named here so the break is not
under-counted.

Census: zero imports of the 28 names from the package and zero `extensions`
attributes on design-system components in the showroom, app-bithire, app-evnto
and app-platform. `KeyboardShortcut` (app-bithire) and `FilterDefinition` /
`FilterPreset` (app-platform) are unrelated local declarations of the same names
and are unaffected.

No replacement type, alias or compatibility door is added. Use each component's
own documented props, compounds and slots. The 29 codemod entries are
report-only: an import of a removed name, or an `extensions` attribute on any of
the 64 engine-aware components, is reported with guidance and nothing is edited.

Runtime: an untyped caller that still passes `extensions` to the Modern `Card`
now has the key forwarded to the root element like every other engine-aware
Modern component, because the Modern `Card` no longer strips it. The frozen
Classic and Rustic `Card` engines keep their strip; their emitted output is
byte-identical. TypeScript consumers cannot pass the prop after this change.

```contract-diff
signature .#SlotContext — removed with the reserved extensions module; nothing read it (RET-01)
signature .#SlotContent — removed with the reserved extensions module; nothing read it (RET-01)
signature .#SlotMap — removed with the reserved extensions module; nothing read it (RET-01)
signature .#ExtraColumn — removed with the reserved extensions module; nothing read it (RET-01)
signature .#ColumnExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#ActionDefinition — removed with the reserved extensions module; nothing read it (RET-01)
signature .#BulkActionDefinition — removed with the reserved extensions module; nothing read it (RET-01)
signature .#ActionExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#FilterDefinition — removed with the reserved extensions module; nothing read it (RET-01)
signature .#SearchConfig — removed with the reserved extensions module; nothing read it (RET-01)
signature .#FilterPreset — removed with the reserved extensions module; nothing read it (RET-01)
signature .#FilterExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#RenderExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#SelectionExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#SortExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#PaginationExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#MotionExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#LayoutExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#DataExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#DragAndDropExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#ExportExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#KeyboardShortcut — removed with the reserved extensions module; nothing read it (RET-01)
signature .#KeyboardExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#LifecycleExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#AccessibilityExtensions — removed with the reserved extensions module; nothing read it (RET-01)
signature .#ResolvedColumn — removed with the reserved extensions module; nothing read it (RET-01)
signature .#ComponentExtensions — removed; the extension protocol it described never had a runtime (RET-01)
signature .#ExtensionHelpers — removed; no resolver ever created it (RET-01)
signature .#EngineAwareProps — member `extensions` removed; no component ever read it (RET-01)
```
