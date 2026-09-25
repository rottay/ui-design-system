import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithEngineContext } from '@tests/support/engine';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { WidgetBoardLabels } from '../contracts';
import { WidgetBoardEngine } from '../engines/foundation';

const labels: WidgetBoardLabels = {
  context: 'Role workspace',
  heading: 'Decision cockpit',
  customize: 'Customize',
  done: 'Done',
  addWidget: 'Add widget',
  reset: 'Reset',
  emptyCatalog: 'Empty',
  editHint: 'Editing',
  readHint: 'Reading',
  move: 'Move',
  resize: 'Resize',
  resizeWidth: 'Resize width',
  resizeHeight: 'Resize height',
  autoHeight: 'Automatic height',
  remove: 'Remove',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WidgetBoard — provider locale', () => {
  // No supported locale changes the lower-casing of a catalog query, so the
  // witness is the locale the folding is asked for.
  it('folds the catalog query in the provider text locale', () => {
    const lower = vi.spyOn(String.prototype, 'toLocaleLowerCase');
    renderWithEngineContext(
      <I18nProvider locale="fr">
        <WidgetBoardEngine
          labels={labels}
          items={[{ id: 'one', size: 'md', order: 0, visible: true, title: 'one', accessibleTitle: 'one', content: <span>one</span> }]}
        />
      </I18nProvider>,
      'classic',
    );

    expect(lower).toHaveBeenCalledWith('fr-FR');
    expect(lower.mock.calls.every((args) => args[0] === 'fr-FR')).toBe(true);
  });
});
