import { describe, expect, it } from 'vitest';
import * as dispatch from '..';
import * as foundation from '../foundation';
import * as errorAnatomy from '../error-anatomy';
import * as cards from '../cards';
import * as footers from '../footers';

describe('render-dispatch module split — bindings', () => {
  it('publishes exactly the runtime binding it published before the split', () => {
    expect(Object.keys(dispatch).sort()).toEqual(['CollectionRenderDispatch']);
  });

  it('gives each owned module only the bindings the dispatch consumes', () => {
    expect(Object.keys(foundation).sort()).toEqual([
      'getColumnCapabilityId',
      'getColumnHeader',
      'readCollectionRecordValue',
      'resolveKey',
    ]);
    expect(Object.keys(errorAnatomy)).toEqual(['CollectionErrorAnatomy']);
    expect(Object.keys(cards).sort()).toEqual([
      'CARDS_SKELETON_COUNT',
      'CardItem',
      'isNestedInteractiveCardTarget',
      'renderFallbackCard',
      'resolveCardsGridTemplateColumns',
    ]);
    expect(Object.keys(footers).sort()).toEqual(['CardsIncrementalFooter', 'CollectionPaginationFooter']);
  });
});

describe('render-dispatch module split — moved helpers', () => {
  it('resolves keys and record values as before', () => {
    expect(foundation.resolveKey({ id: 7 }, 'id')).toBe('7');
    expect(foundation.resolveKey({ id: 7 }, (row) => `k${row.id}`)).toBe('k7');
    expect(foundation.readCollectionRecordValue(null, 'id')).toBeUndefined();
    expect(foundation.getColumnCapabilityId({ key: 'name', fieldId: '  ' } as never)).toBe('name');
  });

  it('keeps the cards grid template and skeleton count', () => {
    expect(cards.CARDS_SKELETON_COUNT).toBe(6);
    expect(cards.resolveCardsGridTemplateColumns(3)).toBe('repeat(3, minmax(0, 1fr))');
    expect(cards.resolveCardsGridTemplateColumns(undefined)).toBe(
      'var(--ds-listing-grid-columns, repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr)))',
    );
  });
});
