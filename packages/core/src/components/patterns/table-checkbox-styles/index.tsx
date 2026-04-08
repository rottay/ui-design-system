'use client';

/**
 * @fileoverview TableCheckboxStyles pattern -- injects CSS animations and
 * interaction styles for table checkbox flows.
 *
 * @description
 * Drop-in `<style>` pattern that ships the animations and hover/cursor
 * styling shared by table-row interactions across the design system. Add
 * this pattern once inside a table wrapper and the underlying primitives
 * automatically pick up the keyframes (`slideInCheckbox`, `pulseCheck`,
 * `fadeIn`) and the row/action-button hover states.
 *
 * The pattern is intentionally engine-free: it only emits CSS that targets
 * generic `table` markup and DS tokens. Consumers can append additional CSS
 * via the `customStyles` prop without forking the component.
 *
 * @module @rottay/design-system/patterns/table-checkbox-styles
 */

const CHECKBOX_ANIMATION_CSS = `
  @keyframes slideInCheckbox {
    from {
      opacity: 0;
      transform: translateX(-8px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes pulseCheck {
    0%, 100% {
      box-shadow: 0 0 0 0 var(--ds-color-primary-200);
    }
    50% {
      box-shadow: 0 0 0 4px var(--ds-color-primary-100);
    }
  }

  @keyframes fadeIn {
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
