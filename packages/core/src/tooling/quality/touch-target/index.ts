/**
 * Touch-target authority — the entrypoint.
 *
 * This module used to hold a SECOND, per-FILE census: `auditTouchTargetFloors`
 * plus a `TOUCH_TARGET_EXEMPTIONS` table keyed on skin filenames. It is gone
 * (FASE F). It was unsound in two directions at once: one floored control
 * anywhere in a file marked the whole file floored, and one exemption absolved
 * every control in the file — including controls added years later. Its
 * successor discovers interactivity per SELECTOR and per JSX ELEMENT, and
 * proves coverage against the specific box that carries the floor.
 *
 * There is now ONE mechanism (`discovery/`) and ONE table
 * (`adjudications.json`). Everything is re-exported from here so consumers
 * have a single import site.
 */
export * from './discovery';
