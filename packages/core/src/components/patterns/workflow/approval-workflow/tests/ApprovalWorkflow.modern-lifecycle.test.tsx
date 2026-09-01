import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernApprovalWorkflow from '../engines/modern';

describe('Modern ApprovalWorkflow — loading lifecycle', () => {
  it('announces the skeleton branch as busy', () => {
    // The skeleton renders no text at all, so aria-busy is the only pending
    // signal an assistive technology can observe on this branch.
    const { container } = render(
      <ModernApprovalWorkflow title="Expense report" steps={[]} loading />,
    );

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('aria-busy', 'true');
  });

  it('does not mark the settled tree as busy', () => {
    const { container } = render(
      <ModernApprovalWorkflow
        title="Expense report"
        steps={[{ key: 'fin', approver: 'Finance', status: 'pending' }]}
      />,
    );

    expect(container.querySelector('[data-part="root"]')).not.toHaveAttribute('aria-busy');
  });
});
