import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernApprovalWorkflow from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

interface Rule {
  selector: string;
  body: string;
}

function rulesOf(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim().replace(/\s+/g, ' '),
    body: match[2],
  }));
}

function forcedColorsBlock(css: string): string {
  const start = css.indexOf('@media (forced-colors: active)');
  if (start === -1) return '';
  let depth = 0;
  for (let index = css.indexOf('{', start); index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  return css.slice(start);
}

const FORCED = forcedColorsBlock(SKIN);
const AUTHORED = rulesOf(SKIN.replace(FORCED, ''));

const declarations = (body: string) =>
  body
    .split(';')
    .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
    .filter(Boolean);

const paintsSolidOutline = (rule: Rule) =>
  declarations(rule.body).some(
    (declaration) => /^outline\s*:/.test(declaration) && /solid/.test(declaration) && !/transparent/.test(declaration),
  );

const paintsFocusIndicator = (rule: Rule) =>
  /(^|[\s;])outline(-[a-z]+)?\s*:/.test(rule.body) || /--ds-(button-)?focus-ring/.test(rule.body);

const BUTTON_PARTS = ['step-action-button'];

describe('Modern ApprovalWorkflow — step actions wear the Button focus signature', () => {
  it('renders every step action as a keyboard-reachable DS Button that keeps its part', async () => {
    const { container } = render(
      <ModernApprovalWorkflow
        title="Expense report"
        steps={[
          { key: 'mgr', approver: 'Manager', status: 'approved' },
          { key: 'fin', approver: 'Finance', status: 'pending' },
        ]}
        currentStep={1}
        onApprove={() => undefined}
        onReject={() => undefined}
        onEscalate={() => undefined}
      />,
    );

    // The public Button is lazy: the first render is its Suspense fallback.
    await screen.findByRole('button', { name: 'Approve Finance' });

    const actions = [...container.querySelectorAll('[data-part="step-action-button"]')];
    expect(actions.map((action) => action.getAttribute('data-action'))).toEqual([
      'approve',
      'reject',
      'escalate',
    ]);
    for (const action of actions) {
      expect(action.tagName).toBe('BUTTON');
      expect(action).toHaveClass('ds-button', 'ds-button--modern');
      expect(action).toHaveAttribute('data-variant');
      expect(action).not.toHaveAttribute('tabindex', '-1');
    }
  });

  it('paints no focus indicator of its own on the composed Buttons', () => {
    // A family outline tied the Button ring rule and drew a solid contour over
    // the `underline` and `glow` signatures.
    for (const part of BUTTON_PARTS) {
      const named = [...AUTHORED, ...rulesOf(FORCED)].filter((rule) =>
        rule.selector.includes(`[data-part='${part}']`),
      );
      expect(named.length).toBeGreaterThan(0);
      for (const rule of named) {
        expect(paintsFocusIndicator(rule), rule.selector).toBe(false);
      }
    }
  });

  it('leaves no solid focus outline anywhere in the skin', () => {
    const focusRules = AUTHORED.filter((rule) => /focus/.test(rule.selector));
    expect(focusRules.filter(paintsSolidOutline)).toEqual([]);
  });
});
