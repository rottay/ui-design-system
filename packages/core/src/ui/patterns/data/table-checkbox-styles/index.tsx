'use client';

/**
 * @fileoverview TableCheckboxStyles pattern -- injects CSS animations and
 * interaction styles for table checkbox flows.
 *
 * @description
 * Drop-in `<style>` pattern that ships the animations and hover/cursor
 * styling shared by table-row interactions across the design system. Add
 * this pattern once inside a table wrapper and the underlying primitives
 * automatically pick up the keyframes (`ds-table-checkbox-slide-in`,
 * `ds-table-checkbox-pulse-check`, `ds-table-checkbox-fade-in`) and the
 * row/action-button hover states.
 *
 * The pattern is intentionally engine-free: it only emits CSS that targets
 * generic `table` markup and DS tokens. Consumers can append additional CSS
 * via the `customStyles` prop without forking the component.
 *
 * @deprecated MERGE/RETIRE CANDIDATE (registered for Codex adjudication,
 * 2026-08 wave; do NOT delete during the wave — law 11). Findings:
 * - Zero consumers outside this directory: the only references are the
 *   barrel re-export (`patterns/data/index.ts`) and its own contract test.
 * - The three keyframes have zero `animation:` consumers anywhere in the DS.
 * - The capabilities it ships are already owned by governed surfaces:
 *   row hover/selected paint by `runtime/engines/modern/skin/table.css`
 *   (primitive Table) and `.../skin/data-table.css` (PatternDataTable), and
 *   checkbox paint by the certified Checkbox primitive — which is what both
 *   modern table families actually compose.
 * - The embedded CSS violates current laws (`!important` ×2, raw `0.15s
 *   ease` timings, global `table` reach, `.clickable-row`/`.link-text`/
 *   `.action-btn` ad-hoc classes); those declarations are identity-bound by
 *   `TableCheckboxStyles.embedded-css-contract.test.tsx` (7 pinned paint
 *   declarations + mount/unmount lifecycle), so the emitted CSS stays
 *   byte-stable until Codex retires or re-pins the contract.
 */

const CHECKBOX_ANIMATION_CSS = `
  @keyframes ds-table-checkbox-slide-in {
    from {
      opacity: 0;
      transform: translateX(-8px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes ds-table-checkbox-pulse-check {
    0%, 100% {
      box-shadow: 0 0 0 0 var(--ds-color-primary-200);
    }
    50% {
      box-shadow: 0 0 0 4px var(--ds-color-primary-100);
    }
  }

  @keyframes ds-table-checkbox-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Table checkbox styling */
  table input[type="checkbox"] {
    accent-color: var(--ds-color-primary);
  }

  /* Row hover effects */
  table tbody tr {
    transition: background 0.15s ease;
  }

  table tbody tr:hover {
    background: var(--ds-color-neutral-50);
  }

  /* Clickable row cursor */
  .clickable-row {
    cursor: pointer;
  }

  .clickable-row:hover .link-text {
    color: var(--ds-color-primary) !important;
    text-decoration: underline;
  }

  /* Action buttons hover */
  .action-btn {
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  .action-btn:hover {
    opacity: 1 !important;
  }

  table tbody tr:hover .action-btn {
    opacity: 0.8;
  }
`;

export interface TableCheckboxStylesProps {
  /** Additional custom CSS appended after the base animations */
  customStyles?: string;
}

export function TableCheckboxStyles({ customStyles }: TableCheckboxStylesProps) {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: customStyles ? `${CHECKBOX_ANIMATION_CSS}\n${customStyles}` : CHECKBOX_ANIMATION_CSS,
      }}
    />
  );
}
