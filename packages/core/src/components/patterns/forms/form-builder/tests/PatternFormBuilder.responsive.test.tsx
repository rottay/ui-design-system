import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mockMatchMedia } from '../../../../../_internal/testing/helpers/match-media';
import {
  resolveAdaptiveFormFieldColumnSpan,
  resolveAdaptiveFormLayout,
} from '../adaptive-layout';
import ClassicFormBuilder from '../engines/classic';
import ModernFormBuilder from '../engines/modern';
import RusticFormBuilder from '../engines/rustic';

const ENGINE_COMPONENTS = [
  ['classic', ClassicFormBuilder],
  ['modern', ModernFormBuilder],
  ['rustic', RusticFormBuilder],
] as const;

const fields = [{ name: 'name', label: 'Name', type: 'text' as const, colSpan: 3 }];

describe('PatternFormBuilder responsive layout', () => {
  it.each(ENGINE_COMPONENTS)(
    'collapses a 3-column grid to one column at 320 and 390 in the %s engine',
    (_engine, Component) => {
      for (const width of [320, 390]) {
        mockMatchMedia(width);
        const { container, unmount } = render(
          <Component fields={fields} layout="grid" columns={3} autoAdaptive onSubmit={() => undefined} />
        );

        expect(container.querySelector('[style*="grid-template-columns"]')).toBeNull();
        expect(container.querySelector('[style*="grid-column"]')).toBeNull();
        unmount();
      }
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'caps a 3-column grid and its field span at two on tablet in the %s engine',
    (_engine, Component) => {
      mockMatchMedia(768);
      const { container } = render(
        <Component fields={fields} layout="grid" columns={3} autoAdaptive onSubmit={() => undefined} />
      );

      expect(container.querySelector('[style*="grid-template-columns: repeat(2"]')).toBeTruthy();
      expect(container.querySelector('[style*="grid-column: span 2"]')).toBeTruthy();
      expect(container.querySelector('[style*="grid-column: span 3"]')).toBeNull();
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'preserves a desktop field span exactly in the %s engine',
    (_engine, Component) => {
      mockMatchMedia(1280);
      const { container } = render(
        <Component fields={fields} layout="grid" columns={2} autoAdaptive onSubmit={() => undefined} />
      );

      expect(container.querySelector('[style*="grid-column: span 3"]')).toBeTruthy();
    }
  );

  it('turns phone horizontal layouts vertical while preserving desktop opt-out', () => {
    expect(
      resolveAdaptiveFormLayout({
        layout: 'horizontal',
        columns: 3,
        autoAdaptive: true,
        isMobile: true,
        isTablet: false,
      })
    ).toEqual({ layout: 'vertical', columns: 1 });

    expect(
      resolveAdaptiveFormLayout({
        layout: 'horizontal',
        columns: 3,
        autoAdaptive: false,
        isMobile: true,
        isTablet: false,
      })
    ).toEqual({ layout: 'horizontal', columns: 3 });

    expect(
      resolveAdaptiveFormLayout({
        layout: 'grid',
        columns: 2.75,
        autoAdaptive: true,
        isMobile: false,
        isTablet: false,
      })
    ).toEqual({ layout: 'grid', columns: 2.75 });

    expect(
      resolveAdaptiveFormFieldColumnSpan({
        columnSpan: 3.5,
        columns: 2,
        autoAdaptive: false,
        isMobile: false,
        isTablet: true,
      })
    ).toBe(3.5);

    expect(
      resolveAdaptiveFormFieldColumnSpan({
        columnSpan: 3.5,
        columns: 2,
        autoAdaptive: true,
        isMobile: false,
        isTablet: false,
      })
    ).toBe(3.5);
  });
});
