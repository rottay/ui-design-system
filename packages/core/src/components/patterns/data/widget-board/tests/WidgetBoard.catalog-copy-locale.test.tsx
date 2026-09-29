import React from 'react';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { renderWithEngineContext } from '@tests/support/engine';
import type { SupportedLocale } from '@/foundation/i18n/kernel/contracts';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { WidgetBoardItem, WidgetBoardLabels, WidgetBoardProps } from '../contracts';
import ModernWidgetBoard from '../engines/modern';
import ClassicWidgetBoard from '../engines/classic';
import RusticWidgetBoard from '../engines/rustic';

afterEach(cleanup);

const labels: WidgetBoardLabels = {
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
  remove: 'Remove',
};

const item = (id: string, visible: boolean, order: number): WidgetBoardItem => ({
  id,
  size: 'md',
  order,
  visible,
  title: id,
  accessibleTitle: id,
  content: <span>{id}</span>,
});

const ITEMS = [item('shown', true, 0), item('hidden-a', false, 1)];

type Board = (props: WidgetBoardProps) => React.ReactElement;

/** Opens the catalog, searches for nothing it holds, and reads the catalog copy. */
async function catalogCopy(
  Board: Board,
  engine: 'modern' | 'classic' | 'rustic',
  options: { locale?: SupportedLocale; labels?: WidgetBoardLabels } = {},
) {
  const board = (
    <Board
      items={ITEMS}
      labels={options.labels ?? labels}
      editable
      defaultEditing
      defaultCatalogOpen
    />
  );
  renderWithEngineContext(
    options.locale ? (
      <I18nProvider locale={options.locale} fallbackLocale={options.locale}>
        {board}
      </I18nProvider>
    ) : (
      board
    ),
    engine,
  );
  const input = (await waitFor(() => {
    const node = document.body.querySelector<HTMLInputElement>("[data-part='catalog-search'] input");
    if (!node) throw new Error('catalog search not found');
    return node;
  })) as HTMLInputElement;
  const search = { placeholder: input.getAttribute('placeholder'), name: input.getAttribute('aria-label') };
  fireEvent.change(input, { target: { value: 'zzz-no-such-widget' } });
  const noResults = await waitFor(() => {
    const node = document.body.querySelector("[data-part='catalog-no-results']");
    if (!node) throw new Error('no-results row not found');
    return node.textContent;
  });
  return { ...search, noResults };
}

describe('WidgetBoard modern — the catalog copy comes from the i18n catalog', () => {
  it.each([
    ['es', 'Buscar widgets', 'Ningún widget coincide con la búsqueda'],
    ['pt', 'Pesquisar widgets', 'Nenhum widget corresponde à pesquisa'],
    ['en', 'Search widgets', 'No widgets match the search'],
  ] as const)('words the catalog search in %s', async (locale, search, noResults) => {
    expect(await catalogCopy(ModernWidgetBoard, 'modern', { locale })).toEqual({
      placeholder: search,
      name: search,
      noResults,
    });
  });

  it('keeps caller labels above the catalog', async () => {
    const custom = { ...labels, catalogSearchPlaceholder: 'Find a card', catalogNoResults: 'Nothing here' };
    expect(await catalogCopy(ModernWidgetBoard, 'modern', { locale: 'es', labels: custom })).toEqual({
      placeholder: 'Find a card',
      name: 'Find a card',
      noResults: 'Nothing here',
    });
  });

  it('keeps the English floor without a provider', async () => {
    expect(await catalogCopy(ModernWidgetBoard, 'modern')).toEqual({
      placeholder: 'Search widgets',
      name: 'Search widgets',
      noResults: 'No widgets match the search',
    });
  });

  it.each([
    ['classic', ClassicWidgetBoard],
    ['rustic', RusticWidgetBoard],
  ] as const)('%s stays on the English literal under a Spanish provider', async (engine, Board) => {
    expect(await catalogCopy(Board, engine, { locale: 'es' })).toEqual({
      placeholder: 'Search widgets',
      name: 'Search widgets',
      noResults: 'No widgets match the search',
    });
  });
});
