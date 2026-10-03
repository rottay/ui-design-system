---
"@rottay/design-system": patch
---

WO-RET-01. `SurfaceAccentBarWrapper`, the deprecated pass-through left behind by
the retired accent-bar API, is removed. It rendered a bare fragment and was
never exported from a package entrypoint, so the twelve surface pages that
wrapped their body in it (list, dashboard, file browser, settings, detail form,
wizard, form, guided draft form, media, editor, notification, chat) now render
that body directly with identical DOM. No public export or signature changes.
