import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { DEFAULT_COLORS, SPACING_MAP } from '../types';
import ClassicDivider from '../engines/classic';
import ModernDivider from '../engines/modern';
import RusticDivider from '../engines/rustic';

const ENGINE_COMPONENTS = {
  classic: ClassicDivider,
  modern: ModernDivider,
  rustic: RusticDivider,
} as const;

describe('Divider runtime engines', () => {
  it.each(Object.entries(ENGINE_COMPONENTS))(
    'renders a text divider through the live %s engine',
    (engine, Component) => {
      const ref = createRef<HTMLDivElement>();

      render(
        <Component
          ref={ref}
          data-testid={`divider-${engine}`}
          dashed
          textPosition="left"
          plain
          color="rebeccapurple"
          thickness="thick"
          spacing="xl"
          className="custom-divider"
          style={{ opacity: 0.9 }}
        >
          Section label
        </Component>
      );

      const divider = screen.getByTestId(`divider-${engine}`);
      expect(divider).toHaveAttribute('role', 'separator');
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
      expect(divider).toHaveClass('custom-divider');
      expect(divider).toHaveStyle({ margin: `${SPACING_MAP.xl} 0`, opacity: '0.9' });
      expect(ref.current).toBe(divider);
      expect(screen.getByText('Section label')).toBeInTheDocument();

      if (engine === 'classic') {
        expect(divider).toHaveClass('ant-divider');
        expect(divider).toHaveClass('ant-divider-horizontal');
        expect(divider).toHaveClass('ant-divider-dashed');
        expect(divider).toHaveClass('ant-divider-with-text');
        expect(divider).toHaveClass('ant-divider-with-text-left');
        expect(divider).toHaveClass('ant-divider-plain');
      }

      if (engine === 'modern') {
        expect(divider).toHaveClass('divider');
        expect(divider).toHaveClass('divider-horizontal');
        expect(divider).toHaveClass('divider-start');
      }

      if (engine === 'rustic') {
        expect(divider).toHaveClass('divider');
        expect(divider).toHaveClass('divider--horizontal');
        expect(divider).toHaveClass('divider--dashed');
        expect(divider).toHaveClass('divider--with-text');
        expect(divider).toHaveClass('divider--ds-text-left');
        expect(divider).toHaveClass('divider--plain');
      }
    }
  );

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'renders a vertical divider without text through the %s engine',
    (engine, Component) => {
      render(
        <Component
          data-testid={`divider-vertical-${engine}`}
          orientation="vertical"
          variant="dotted"
          color={DEFAULT_COLORS[engine]}
          margin="lg"
          thickness={3}
          style={{ minHeight: 48 }}
        >
          Hidden text
        </Component>
      );

      const divider = screen.getByTestId(`divider-vertical-${engine}`);
      expect(divider).toHaveAttribute('aria-orientation', 'vertical');
      expect(divider).toHaveStyle({ margin: `0 ${SPACING_MAP.lg}`, minHeight: '48px' });
      expect(screen.queryByText('Hidden text')).not.toBeInTheDocument();

      if (engine === 'classic') {
        expect(divider).toHaveClass('ant-divider-vertical');
        expect(divider.style.borderLeft).toContain('3px dotted');
      }

      if (engine === 'modern') {
        expect(divider).toHaveClass('divider-vertical');
        expect(divider.style.borderLeft).toContain('3px dotted');
        expect(divider.style.borderLeft).toContain(DEFAULT_COLORS.modern);
      }

      if (engine === 'rustic') {
        expect(divider).toHaveClass('divider--vertical');
        expect(divider).toHaveClass('divider--dotted');
        expect(divider.style.borderLeft).toContain('3px dotted');
      }
    }
  );

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'supports alias props and renders line segments in the %s engine',
    (engine, Component) => {
      render(
        <Component
          data-testid={`divider-alias-${engine}`}
          type="horizontal"
          orientationMargin="right"
          spacing="sm"
        >
          Aliased
        </Component>
      );

      const divider = screen.getByTestId(`divider-alias-${engine}`);
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
      expect(divider).toHaveStyle({ margin: `${SPACING_MAP.sm} 0` });

      const content = screen.getByText('Aliased');
      expect(content).toBeInTheDocument();

      if (engine === 'classic') {
        expect(divider).toHaveClass('ant-divider-with-text-right');
        expect(within(divider).getByText('Aliased')).toHaveStyle({ fontSize: '16px' });
      }

      if (engine === 'modern') {
        expect(divider).toHaveClass('divider-end');
        expect(within(divider).getByText('Aliased')).toHaveStyle({ textTransform: 'uppercase' });
      }

      if (engine === 'rustic') {
        expect(divider).toHaveClass('divider--ds-text-right');
        expect(within(divider).getByText('Aliased')).toHaveStyle({ lineHeight: '1.5' });
      }
    }
  );
});
