import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import ClassicBadge from '../engines/classic';
import ModernBadge from '../engines/modern';
import RusticBadge from '../engines/rustic';

// P-43: --ds-badge-hover-transform is emitted by resolvePartialPersonalityCssVariables
// (runtime/personality/primitives.ts) and, before this change, had no reader anywhere in
// the repo. The reader is CSS, not a JS mouse handler (element.style mutation from a
// handler is the anti-pattern WO-ARC-07 is draining from this engine -- React does not
// own that value and no test can read it through a DOM contract). So what is assertable
// here, matching Card.real-engines.test.tsx's idiom, is the state the component publishes
// (data-interactive, and the --ds-badge-position-transform custom property the indicator
// badge's corner offset now travels as) and the rule the skin stylesheet answers it with.
// jsdom does not evaluate real :hover-triggered style recalculation, so the composed hover
// transform itself is verified by reading the stylesheet's own text, not by firing a
// mouse event and reading computed style back.
describe('Badge hover transform (P-43)', () => {
  describe('modern engine', () => {
    it('stamps data-interactive on a clickable standalone badge, and omits it otherwise', () => {
      const { rerender } = render(<ModernBadge clickable onClick={vi.fn()}>Ready</ModernBadge>);
      expect(screen.getByText('Ready')).toHaveAttribute('data-interactive', 'true');

      rerender(<ModernBadge>Static</ModernBadge>);
      expect(screen.getByText('Static')).not.toHaveAttribute('data-interactive');
    });

    it('carries the indicator badge corner offset as --ds-badge-position-transform, not the transform property', () => {
      render(
        <ModernBadge count={3} clickable onClick={vi.fn()} position="top-right">
          <span>Anchor</span>
        </ModernBadge>
      );
      const el = screen.getByText('3');

      expect(el).toHaveAttribute('data-interactive', 'true');
      expect(el.style.getPropertyValue('--ds-badge-position-transform')).toBe('translate(50%, -50%)');
    });

    it('omits data-interactive from a non-interactive indicator badge while still carrying the position offset', () => {
      render(
        <ModernBadge count={3} position="bottom-left">
          <span>Anchor</span>
        </ModernBadge>
      );
      const el = screen.getByText('3');

      expect(el).not.toHaveAttribute('data-interactive');
      expect(el.style.getPropertyValue('--ds-badge-position-transform')).toBe('translate(-50%, 50%)');
    });

    it('carries the modern skin class the stylesheet selects on', () => {
      render(<ModernBadge clickable onClick={vi.fn()}>Ready</ModernBadge>);
      const el = screen.getByText('Ready');

      expect(el.className).toContain('rottay-badge');
      expect(el.className).toContain('rottay-badge--modern');
    });
  });

  describe('rustic engine', () => {
    it('stamps data-interactive on a clickable standalone badge, and omits it otherwise', () => {
      const { rerender } = render(<RusticBadge clickable onClick={vi.fn()}>Ready</RusticBadge>);
      expect(screen.getByText('Ready')).toHaveAttribute('data-interactive', 'true');

      rerender(<RusticBadge>Static</RusticBadge>);
      expect(screen.getByText('Static')).not.toHaveAttribute('data-interactive');
    });

    it('carries the rustic skin classes the stylesheet selects on', () => {
      render(<RusticBadge clickable onClick={vi.fn()}>Ready</RusticBadge>);
      const el = screen.getByText('Ready');

      expect(el.className).toContain('rottay-badge');
      expect(el.className).toContain('rottay-badge--rustic');
    });

    it('carries the indicator badge corner offset as --ds-badge-position-transform, not the transform property', () => {
      render(
        <RusticBadge count={3} clickable onClick={vi.fn()} position="bottom-right">
          <span>Anchor</span>
        </RusticBadge>
      );
      const el = screen.getByText('3');

      expect(el).toHaveAttribute('data-interactive', 'true');
      expect(el.className).toContain('rottay-badge--rustic');
      expect(el.style.getPropertyValue('--ds-badge-position-transform')).toBe('translate(50%, 50%)');
    });

    it('omits data-interactive from a non-interactive indicator badge while still carrying the position offset', () => {
      render(
        <RusticBadge count={3} position="top-left">
          <span>Anchor</span>
        </RusticBadge>
      );
      const el = screen.getByText('3');

      expect(el).not.toHaveAttribute('data-interactive');
      expect(el.style.getPropertyValue('--ds-badge-position-transform')).toBe('translate(-50%, -50%)');
    });
  });

  describe('classic engine', () => {
    it('does not stamp data-interactive on either render path -- classic has no --ds-badge-hover-transform treatment', () => {
      const { rerender } = render(<ClassicBadge clickable onClick={vi.fn()}>Ready</ClassicBadge>);
      expect(screen.getByText('Ready')).not.toHaveAttribute('data-interactive');

      rerender(
        <ClassicBadge count={3} clickable onClick={vi.fn()}>
          <span>Anchor</span>
        </ClassicBadge>
      );
      expect(screen.getByText('3').closest('.ant-badge')).not.toHaveAttribute('data-interactive');
    });
  });

  describe('skin stylesheets', () => {
    it('modern skin composes the personality hover transform onto the position offset, keyed on data-interactive and :hover', () => {
      const skin = readFileSync(
        join(__dirname, '../../../../../tokens/css/engines/modern/skin/badge.css'),
        'utf-8'
      );

      expect(skin).toContain('.rottay-badge.rottay-badge--modern {');
      expect(skin).toContain('transform: var(--ds-badge-position-transform, translateY(0));');
      expect(skin).toContain(".rottay-badge.rottay-badge--modern[data-interactive='true']:hover {");
      expect(skin).toContain(
        'transform: var(--ds-badge-position-transform, translateY(0)) var(--ds-badge-hover-transform, translateY(0) scale(1));'
      );
      // The `none` keyword cannot be combined with a transform function in the
      // same value -- see the file's own header comment. Regression guard.
      expect(skin).not.toContain('position-transform, none)');
    });

    it('rustic skin composes the personality hover transform onto the position offset, keyed on data-interactive and :hover', () => {
      const skin = readFileSync(
        join(__dirname, '../../../../../tokens/css/engines/rustic/skin/badge.css'),
        'utf-8'
      );

      expect(skin).toContain('.rottay-badge.rottay-badge--rustic {');
      expect(skin).toContain('transform: var(--ds-badge-position-transform, translateY(0));');
      expect(skin).toContain(".rottay-badge.rottay-badge--rustic[data-interactive='true']:hover {");
      expect(skin).toContain(
        'transform: var(--ds-badge-position-transform, translateY(0)) var(--ds-badge-hover-transform, translateY(0) scale(1));'
      );
      expect(skin).not.toContain('position-transform, none)');
    });

    it('both skin files are imported unlayered from foundation/base.css and entrypoints/styles.css', () => {
      const base = readFileSync(join(__dirname, '../../../../../tokens/css/foundation/base.css'), 'utf-8');
      const entry = readFileSync(join(__dirname, '../../../../../tokens/css/entrypoints/styles.css'), 'utf-8');

      for (const sheet of [base, entry]) {
        expect(sheet).toContain("@import '../engines/modern/skin/badge.css';");
        expect(sheet).toContain("@import '../engines/rustic/skin/badge.css';");
      }
    });
  });
});
