import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { PatternApprovalWorkflow } from '..';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

describe('PatternApprovalWorkflow integration', () => {
  it.each(STABLE_ENGINES)('renders the live pattern with the %s engine', async (engine) => {
    if (engine === 'classic') {
      await import('../engines/classic');
    } else if (engine === 'modern') {
      await import('../engines/modern');
    } else {
      await import('../engines/rustic');
    }

    const { container } = renderWithEngine(
      <PatternApprovalWorkflow
        title="Venue contract"
        entity="Venue contract"
        currentStep={1}
        steps={[
          { key: 'finance', approver: 'Finance', status: 'approved', comments: 'Budget approved' },
          { key: 'legal', approver: 'Legal', status: 'pending' },
        ]}
        onApprove={() => undefined}
        onReject={() => undefined}
        onEscalate={() => undefined}
      />,
      engine
    );

    await waitFor(
      () => {
        expect(container.textContent).toContain('Venue contract');
        expect(container.textContent).toContain('Finance');
        expect(container.textContent).toContain('Legal');
      },
      { timeout: 15000 }
    );
  }, 30000);
});
