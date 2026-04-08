/**
 * @fileoverview Accessibility testing helpers (package-internal).
 * @description Provides two levels of a11y checking:
 *
 * 1. **Built-in checks** (`checkAccessibility`) - Zero-dependency ARIA attribute
 *    validation that works out of the box with vitest + happy-dom/jsdom.
 *
 * 2. **axe-core integration** (`checkAccessibilityWithAxe`) - Full automated
 *    a11y audit via axe-core. Requires `vitest-axe` or `jest-axe` as a
 *    devDependency in the consuming project.
 *
 * These helpers live under `_internal/` and are NOT re-exported from the
 * package root. They are used by the DS's own test suites. There is no
 * `@rottay/design-system/testing` subpath in `package.json` — if a
 * consuming app needs to use these helpers, file a request and we will
 * promote them to a real public entry point with a stable contract.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface A11yViolation {
  /** Short identifier for the rule that was violated. */
  rule: string;
  /** Human-readable description of the problem. */
  message: string;
  /** The DOM element that triggered the violation (if available). */
  element?: Element;
  /** Severity level. */
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}

export interface A11yCheckResult {
  /** Whether the check passed (no violations). */
  passed: boolean;
  /** List of violations found. */
  violations: A11yViolation[];
}

export interface AxeRuleConfig {
  enabled: boolean;
}

export interface RottayAxeConfig {
  rules: Record<string, AxeRuleConfig>;
}

// ---------------------------------------------------------------------------
// Pre-configured axe rules for Rottay Design System
// ---------------------------------------------------------------------------

/**
 * Default axe-core rule configuration tuned for Design System component testing.
 *
 * - `region` is disabled because DS components render in isolation, not inside
 *   landmark regions.
 * - `color-contrast` is enabled to catch theme/token contrast issues.
 * - All other rules default to axe-core's standard settings.
 *
 * Pass this to `jest-axe` / `vitest-axe` `axe()` calls:
 * ```ts
 * const results = await axe(container, { rules: rottayAxeConfig.rules });
 * ```
 */
export const rottayAxeConfig: RottayAxeConfig = {
  rules: {
    // DS components are rendered outside landmarks in tests
    region: { enabled: false },
    // Contrast checking is important for multi-tenant theming
    'color-contrast': { enabled: true },
    // Interactive elements must be keyboard-accessible
    'keyboard-navigation': { enabled: true },
    // Ensure ARIA roles are valid
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    // Buttons and links must have accessible names
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    // Images must have alt text
    'image-alt': { enabled: true },
    // Form elements need labels
    'label': { enabled: true },
  },
};

// ---------------------------------------------------------------------------
// Built-in ARIA checks (zero external dependencies)
// ---------------------------------------------------------------------------

/**
 * Elements that are inherently interactive and require an accessible name.
 */
const INTERACTIVE_ROLES = new Set([
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'menuitem',
  'option',
]);

/**
 * Native elements that are interactive without an explicit `role`.
 */
const INTERACTIVE_ELEMENTS = new Set([
  'BUTTON',
  'A',
  'INPUT',
  'SELECT',
  'TEXTAREA',
]);

// Follows the WAI-ARIA accessible name computation algorithm (simplified).
// Priority: aria-label > aria-labelledby > title > associated <label> > text content.
// This ordering matches browser implementations and ensures test assertions
// align with what screen readers actually announce.
function getAccessibleName(el: Element): string {
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();

  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const doc = el.ownerDocument;
    const names = labelledBy
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean);
    if (names.length) return names.join(' ');
  }

  // title attribute
  const title = el.getAttribute('title');
  if (title?.trim()) return title.trim();

  // For inputs, check associated <label>
  if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
    const id = el.getAttribute('id');
    if (id) {
      const label = el.ownerDocument.querySelector(`label[for="${id}"]`);
      if (label?.textContent?.trim()) return label.textContent.trim();
    }
  }

  // Text content (for buttons, links, etc.)
  const text = el.textContent?.trim() ?? '';
  return text;
}

function checkInteractiveAccessibleNames(container: HTMLElement): A11yViolation[] {
  const violations: A11yViolation[] = [];

  // Check elements with explicit interactive roles
  const allElements = container.querySelectorAll('[role]');
  for (const el of allElements) {
    const role = el.getAttribute('role');
    if (role && INTERACTIVE_ROLES.has(role)) {
      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          rule: 'interactive-accessible-name',
          message: `Element with role="${role}" has no accessible name. Add aria-label, aria-labelledby, or text content.`,
          element: el,
          severity: 'serious',
        });
      }
    }
  }

  // Check native interactive elements
  for (const tagName of INTERACTIVE_ELEMENTS) {
    const elements = container.querySelectorAll(tagName);
    for (const el of elements) {
      // Skip hidden elements
      if (
        el.getAttribute('aria-hidden') === 'true' ||
        el.hasAttribute('hidden') ||
        (el as HTMLElement).style?.display === 'none'
      ) {
        continue;
      }

      // Skip elements that are purely presentational
      if (el.getAttribute('role') === 'presentation' || el.getAttribute('role') === 'none') {
        continue;
      }

      // Inputs of type "hidden" are not interactive
      if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden') {
        continue;
      }

      const name = getAccessibleName(el);
      if (!name) {
        violations.push({
          rule: 'interactive-accessible-name',
          message: `<${el.tagName.toLowerCase()}> element has no accessible name. Add aria-label, aria-labelledby, or visible text.`,
          element: el,
          severity: 'serious',
        });
      }
    }
  }

  return violations;
}

function checkImagesHaveAlt(container: HTMLElement): A11yViolation[] {
  const violations: A11yViolation[] = [];
  const images = container.querySelectorAll('img');

  for (const img of images) {
    if (img.getAttribute('aria-hidden') === 'true') continue;
    if (img.getAttribute('role') === 'presentation' || img.getAttribute('role') === 'none') continue;

    const alt = img.getAttribute('alt');
    if (alt === null) {
      violations.push({
        rule: 'image-alt',
        message: '<img> element is missing an alt attribute. Add alt="" for decorative images or a descriptive alt for meaningful ones.',
        element: img,
        severity: 'critical',
      });
    }
  }

  return violations;
}

function checkAriaAttributes(container: HTMLElement): A11yViolation[] {
  const violations: A11yViolation[] = [];

  // Check that aria-labelledby references existing IDs
  const labelledByElements = container.querySelectorAll('[aria-labelledby]');
  for (const el of labelledByElements) {
    const ids = el.getAttribute('aria-labelledby')?.split(/\s+/) ?? [];
    for (const id of ids) {
      if (!el.ownerDocument.getElementById(id)) {
        violations.push({
          rule: 'aria-valid-attr-value',
          message: `aria-labelledby references id="${id}" which does not exist in the document.`,
          element: el,
          severity: 'serious',
        });
      }
    }
  }

  // Check that aria-describedby references existing IDs
  const describedByElements = container.querySelectorAll('[aria-describedby]');
  for (const el of describedByElements) {
    const ids = el.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
    for (const id of ids) {
      if (!el.ownerDocument.getElementById(id)) {
        violations.push({
          rule: 'aria-valid-attr-value',
          message: `aria-describedby references id="${id}" which does not exist in the document.`,
          element: el,
          severity: 'moderate',
        });
      }
    }
  }

  // Check that aria-controls references existing IDs
  const controlsElements = container.querySelectorAll('[aria-controls]');
  for (const el of controlsElements) {
    const ids = el.getAttribute('aria-controls')?.split(/\s+/) ?? [];
    for (const id of ids) {
      if (!el.ownerDocument.getElementById(id)) {
        violations.push({
          rule: 'aria-valid-attr-value',
          message: `aria-controls references id="${id}" which does not exist in the document.`,
          element: el,
          severity: 'moderate',
        });
      }
    }
  }

  return violations;
}

function checkTabIndex(container: HTMLElement): A11yViolation[] {
  const violations: A11yViolation[] = [];
  const elementsWithTabIndex = container.querySelectorAll('[tabindex]');

  for (const el of elementsWithTabIndex) {
    const tabIndex = parseInt(el.getAttribute('tabindex') ?? '0', 10);
    if (tabIndex > 0) {
      violations.push({
        rule: 'tabindex-positive',
        message: `Element has tabindex="${tabIndex}". Positive tabindex values create confusing tab order. Use tabindex="0" or tabindex="-1" instead.`,
        element: el,
        severity: 'moderate',
      });
    }
  }

  return violations;
}

/**
 * Perform built-in accessibility checks on a rendered container.
 *
 * This runs a set of zero-dependency ARIA and HTML checks suitable for
 * validating Design System components in unit tests:
 *
 * - Interactive elements have accessible names
 * - Images have alt attributes
 * - ARIA attribute references point to existing elements
 * - No positive tabindex values
 *
 * For comprehensive automated a11y testing, use `checkAccessibilityWithAxe()`
 * which requires `vitest-axe` or `jest-axe` as a dependency.
 *
 * @throws {Error} If any violations are found, with a formatted report.
 *
 * @example
 * ```tsx
 * const { container } = render(<Button>Click me</Button>);
 * await checkAccessibility(container);
 * ```
 */
export async function checkAccessibility(container: HTMLElement): Promise<void> {
  const violations: A11yViolation[] = [
    ...checkInteractiveAccessibleNames(container),
    ...checkImagesHaveAlt(container),
    ...checkAriaAttributes(container),
    ...checkTabIndex(container),
  ];

  if (violations.length === 0) return;

  const report = violations
    .map((v, i) => {
      const tag = v.element ? `<${v.element.tagName.toLowerCase()}>` : '(unknown)';
      return `  ${i + 1}. [${v.severity.toUpperCase()}] ${v.rule}\n     ${v.message}\n     Element: ${tag}`;
    })
    .join('\n\n');

  throw new Error(
    `Accessibility check failed with ${violations.length} violation(s):\n\n${report}\n`
  );
}

/**
 * Run the built-in checks without throwing, returning a structured result.
 *
 * Useful when you want to inspect violations programmatically or implement
 * custom assertion logic.
 */
export async function getAccessibilityViolations(
  container: HTMLElement
): Promise<A11yCheckResult> {
  const violations: A11yViolation[] = [
    ...checkInteractiveAccessibleNames(container),
    ...checkImagesHaveAlt(container),
    ...checkAriaAttributes(container),
    ...checkTabIndex(container),
  ];

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Full axe-core accessibility check for consumers that have `vitest-axe`
 * or `jest-axe` installed.
 *
 * This function dynamically imports `vitest-axe` (falling back to `jest-axe`)
 * and runs axe-core with the Rottay DS configuration.
 *
 * @throws {Error} If neither `vitest-axe` nor `jest-axe` is available.
 * @throws {Error} If axe-core finds violations.
 *
 * @example
 * ```tsx
 * // Requires: pnpm add -D vitest-axe
 * const { container } = render(<Button>Click me</Button>);
 * await checkAccessibilityWithAxe(container);
 * ```
 */
export async function checkAccessibilityWithAxe(
  container: HTMLElement,
  config?: Partial<RottayAxeConfig>
): Promise<void> {
  // Dynamic import so the DS itself does not depend on axe-core. Consumers
  // that want full automated audits install vitest-axe (preferred) or jest-axe
  // as a devDependency. The fallback chain tries both test frameworks.
  let axeModule: { axe: (container: HTMLElement, options?: unknown) => Promise<{ violations: Array<{ id: string; description: string; impact?: string; nodes: Array<{ html: string }> }> }> };

  try {
    axeModule = await import('vitest-axe');
  } catch {
    try {
      axeModule = await import('jest-axe');
    } catch {
      throw new Error(
        'checkAccessibilityWithAxe() requires "vitest-axe" or "jest-axe" as a devDependency.\n' +
          'Install one of them: pnpm add -D vitest-axe\n' +
          'Or use checkAccessibility() for zero-dependency ARIA checks.'
      );
    }
  }

  const mergedRules = {
    ...rottayAxeConfig.rules,
    ...(config?.rules ?? {}),
  };

  const results = await axeModule.axe(container, { rules: mergedRules });

  if (results.violations.length === 0) return;

  const report = results.violations
    .map((v, i) => {
      const nodeSnippets = v.nodes
        .slice(0, 3)
        .map((n) => `       ${n.html}`)
        .join('\n');
      return `  ${i + 1}. [${(v.impact ?? 'unknown').toUpperCase()}] ${v.id}\n     ${v.description}\n${nodeSnippets}`;
    })
    .join('\n\n');

  throw new Error(
    `axe-core found ${results.violations.length} accessibility violation(s):\n\n${report}\n`
  );
}
