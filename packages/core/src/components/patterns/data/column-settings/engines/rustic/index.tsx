'use client';

/**
 * @fileoverview ColumnSettingsDropdown -- Rustic engine: a DECLARED ABSENCE.
 *
 * This module used to be `export { default } from '../classic'`, which painted
 * Classic chrome under the Rustic name: invisible to the forwarding-engine gate,
 * invisible to the freeze, and a different product than the caller selected.
 * Rustic is frozen (owner decision 2026-09-05) and ships no column settings of
 * its own, so the absence is stated instead of forwarded.
 */

export default function ColumnSettingsRusticAbsent(): never {
  throw new Error(
    'PatternColumnSettings has no rustic implementation. Rustic is a frozen ' +
      'compatibility engine; there is no fallback engine.'
  );
}
