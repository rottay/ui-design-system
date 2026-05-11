/** @fileoverview EditorSurface tests -- content canvas, toolbar, save/publish actions. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { EditorSurface } from '..';
import type { EditorSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

function buildConfig(): EditorSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Compose article',
      },
    },
    behavior: {
      initialValue: 'Draft copy',
      saveAction: {
        id: 'save-article',
        label: 'Save draft',
        onClick: vi.fn(),
      },
    },
  };
}

describe('EditorSurface', () => {
  beforeAll(async () => {
    await import('../../../../../primitives/inputs/Textarea/engines/rustic');
  });

  it('routes save actions through the current editor value', async () => {
    const config = buildConfig();

    renderSurface(<EditorSurface config={config} />);

    const textbox = await screen.findByDisplayValue('Draft copy', undefined, { timeout: 15000 });

    fireEvent.change(textbox, {
      target: {
        value: 'Updated draft copy',
      },
    });

    const saveButton = screen.getByText('Save draft').closest('button');
    if (!saveButton) throw new Error('Save draft button not found');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(config.behavior.saveAction?.onClick).toHaveBeenCalledWith('Updated draft copy');
    });
  });

  it('covers controlled values, toolbar/preview/footer branches, and publish/cancel actions', async () => {
    const onChange = vi.fn();
    const cancelAction = {
      id: 'cancel-editor',
      label: 'Cancel',
      onClick: vi.fn(),
    };
    const publishAction = {
      id: 'publish-editor',
      label: 'Publish',
      loading: true,
      onClick: vi.fn(),
    };

    renderSurface(
      <EditorSurface
        config={{
          visual: {
            layout: 'split',
          },
          presentation: {
            chrome: {
              title: 'Compose article',
            },
            description: 'Collaborative editing',
            helperText: 'Review the content before publishing.',
            toolbar: <div>Editor toolbar</div>,
            preview: <div>Preview panel</div>,
            statusBar: <div>Editor status</div>,
            renderEditor: (value, setValue) => (
              <button type="button" onClick={() => setValue(`${value} + custom`)}>
                Custom editor
              </button>
            ),
          },
          behavior: {
            value: 'Controlled value',
            onChange,
            cancelAction,
            publishAction,
          },
        }}
      />
    );

    expect(await screen.findByText('Collaborative editing')).toBeInTheDocument();
    expect(screen.getByText('Review the content before publishing.')).toBeInTheDocument();
    expect(screen.getByText('Editor toolbar')).toBeInTheDocument();
    expect(screen.getByText('Preview panel')).toBeInTheDocument();
    expect(screen.getByText('Editor status')).toBeInTheDocument();

    const customEditorButton = screen.getByText('Custom editor').closest('button');
    if (!customEditorButton) throw new Error('Custom editor button not found');
    fireEvent.click(customEditorButton);
    expect(onChange).toHaveBeenCalledWith('Controlled value + custom');

    const cancelButton = screen.getByText('Cancel').closest('button');
    if (!cancelButton) throw new Error('Cancel button not found');
    fireEvent.click(cancelButton);
    expect(cancelAction.onClick).toHaveBeenCalledTimes(1);

    const publishButton = screen.getByText('Publish').closest('button');
    if (!publishButton) throw new Error('Publish button not found');
    expect(publishButton).toBeDisabled();
  });
});
