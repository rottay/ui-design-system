import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import axe from 'axe-core';

import { Rate as ModernRate } from '../engines/modern';

/**
 * Rate modern-engine APG remediation proof (K2, revised by the W6 roving
 * pass): the widget is a single, coherent APG radio-group composite --
 * `div[role="radiogroup"]` root with `span[role="radio"]` stars, no native
 * radio inputs, no `<label>` semantics. Native form participation survives
 * through one `input[type="hidden"]` carrier, which has no ARIA semantics
 * and never reaches assistive tech.
 *
 * The pre-remediation model (`<label role="radio">` wrapping a hidden
 * `<input type="radio">`) failed axe with `aria-allowed-role` (role radio is
 * not allowed on <label>) and `nested-interactive` (focusable descendants).
 *
 * W6 revision: the K2 model made the radiogroup itself the single tab stop.
 * The APG radio-group pattern puts focus on the RADIOS with a roving
 * tabindex (exactly one tabbable radio — the checked one, or the first when
 * none is checked — and arrows moving focus together with the selection),
 * so the root is no longer focusable.
 */

/** The single tabbable star of the roving tabindex. */
const tabbableStar = () =>
  screen
    .getAllByRole('radio')
    .find((node) => node.getAttribute('tabindex') === '0') as HTMLElement;

describe('Rate modern engine — APG radio-group model', () => {
  describe('DOM model', () => {
    it('renders a radiogroup root with exactly `count` span radios', () => {
      const { container } = render(<ModernRate defaultValue={3} count={5} />);

      const root = screen.getByRole('radiogroup', { name: 'Rating' });
      expect(root).toBe(screen.getByTestId('rate'));

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(5);
      radios.forEach((radio) => {
        expect(radio.tagName).toBe('SPAN');
        expect(radio).toHaveAttribute('data-part', 'star');
      });

      // No competing models: no <label> semantics, no native radio inputs.
      expect(container.querySelectorAll('label')).toHaveLength(0);
      expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(0);
    });

    it('roving tabindex: the checked radio is the only tab stop, never the radiogroup', () => {
      render(<ModernRate defaultValue={3} />);

      const root = screen.getByRole('radiogroup');
      expect(root).not.toHaveAttribute('tabindex');

      const radios = screen.getAllByRole('radio');
      expect(tabbableStar()).toBe(screen.getByRole('radio', { name: '3 stars' }));
      radios
        .filter((radio) => radio !== tabbableStar())
        .forEach((radio) => {
          expect(radio).toHaveAttribute('tabindex', '-1');
        });
    });

    it('roving tabindex falls back to the first star when the value is 0', () => {
      render(<ModernRate defaultValue={0} />);
      expect(tabbableStar()).toBe(screen.getByRole('radio', { name: '1 star' }));
    });

    it('checks exactly one radio — the star the committed value rounds to', () => {
      render(<ModernRate defaultValue={3} />);

      const checked = screen
        .getAllByRole('radio')
        .filter((node) => node.getAttribute('aria-checked') === 'true');
      expect(checked).toHaveLength(1);
      expect(checked[0]).toBe(screen.getByRole('radio', { name: '3 stars' }));
    });

    it('announces the half VALUE on the checked star, not the ordinal (allowHalf)', () => {
      render(<ModernRate allowHalf defaultValue={2.5} />);

      // The checked radio is still exactly one — the star the value falls
      // on — but its accessible name preserves the half-point identity
      // ("2.5 stars"), never "3 stars" / "third star".
      const checked = screen
        .getAllByRole('radio')
        .filter((node) => node.getAttribute('aria-checked') === 'true');
      expect(checked).toHaveLength(1);
      expect(checked[0]).toBe(screen.getByRole('radio', { name: '2.5 stars' }));
      // The roving tab stop follows the checked star.
      expect(tabbableStar()).toBe(checked[0]);
    });

    it('allows zero checked radios when the value is 0 (APG-permitted)', () => {
      render(<ModernRate defaultValue={0} />);

      const checked = screen
        .getAllByRole('radio')
        .filter((node) => node.getAttribute('aria-checked') === 'true');
      expect(checked).toHaveLength(0);
    });

    it('aria-checked tracks the committed value, never the hover preview', () => {
      render(<ModernRate defaultValue={2} />);

      fireEvent.mouseEnter(screen.getByRole('radio', { name: '5 stars' }));
      // Visual preview moved (star 5 paints filled)…
      expect(screen.getByRole('radio', { name: '5 stars' })).toHaveAttribute('data-state', 'full');
      // …but the checked radio is still the committed 2nd star.
      const checked = screen
        .getAllByRole('radio')
        .filter((node) => node.getAttribute('aria-checked') === 'true');
      expect(checked).toHaveLength(1);
      expect(checked[0]).toBe(screen.getByRole('radio', { name: '2 stars' }));
    });

    it('radiogroup keeps its accessible name and state attributes', () => {
      render(<ModernRate defaultValue={3} disabled readOnly />);

      const root = screen.getByRole('radiogroup', { name: 'Rating' });
      expect(root).toHaveAttribute('aria-disabled', 'true');
      expect(root).toHaveAttribute('aria-readonly', 'true');
      expect(root).not.toHaveAttribute('tabindex');
      // Inert widget: no star is tabbable either.
      screen.getAllByRole('radio').forEach((radio) => {
        expect(radio).toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('hidden form carrier', () => {
    it('mirrors click, keyboard and controlled values', () => {
      const handleChange = vi.fn();
      const { container, rerender } = render(
        <ModernRate defaultValue={1} onChange={handleChange} />,
      );
      const carrier = () =>
        container.querySelector('input[type="hidden"]') as HTMLInputElement;

      expect(carrier().value).toBe('1');

      fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
      expect(carrier().value).toBe('4');

      fireEvent.keyDown(tabbableStar(), { key: 'ArrowLeft' });
      expect(carrier().value).toBe('3');

      rerender(<ModernRate value={5} onChange={handleChange} />);
      expect(carrier().value).toBe('5');
    });

    it('keeps a stable unique group name and legacy submission gating', () => {
      const { container, unmount } = render(<ModernRate defaultValue={2} />);
      const first = container.querySelector('input[type="hidden"]') as HTMLInputElement;
      expect(first.name).toMatch(/^rottay-rate-/);
      expect(first.disabled).toBe(false);
      unmount();

      const { container: second } = render(<ModernRate defaultValue={2} readOnly />);
      const gated = second.querySelector('input[type="hidden"]') as HTMLInputElement;
      // readOnly/disabled ratings never submitted under the legacy model
      // either (their native radios were disabled) — behavior preserved.
      expect(gated.disabled).toBe(true);
    });
  });

  describe('keyboard matrix (roving radios, arrows commit per APG)', () => {
    it('ArrowRight/ArrowUp increment; ArrowLeft/ArrowDown decrement', () => {
      const handleChange = vi.fn();
      render(<ModernRate defaultValue={3} onChange={handleChange} />);

      fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
      fireEvent.keyDown(tabbableStar(), { key: 'ArrowUp' });
      fireEvent.keyDown(tabbableStar(), { key: 'ArrowLeft' });
      fireEvent.keyDown(tabbableStar(), { key: 'ArrowDown' });

      expect(handleChange.mock.calls.map((call) => call[0])).toEqual([4, 5, 4, 3]);
    });

    it('clamps at 0 and count', () => {
      const handleChange = vi.fn();
      render(<ModernRate defaultValue={5} count={5} onChange={handleChange} />);

      fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
      expect(handleChange).toHaveBeenLastCalledWith(5);

      fireEvent.keyDown(tabbableStar(), { key: 'Home' });
      fireEvent.keyDown(tabbableStar(), { key: 'ArrowLeft' });
      expect(handleChange).toHaveBeenLastCalledWith(0);
    });

    it('Home clears to 0 and End selects count', () => {
      const handleChange = vi.fn();
      render(<ModernRate defaultValue={2} count={5} onChange={handleChange} />);

      fireEvent.keyDown(tabbableStar(), { key: 'End' });
      fireEvent.keyDown(tabbableStar(), { key: 'Home' });
      expect(handleChange.mock.calls.map((call) => call[0])).toEqual([5, 0]);
    });

    it('steps by 0.5 when allowHalf is set', () => {
      const handleChange = vi.fn();
      render(<ModernRate allowHalf defaultValue={2} onChange={handleChange} />);

      fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
      fireEvent.keyDown(tabbableStar(), { key: 'ArrowLeft' });
      expect(handleChange.mock.calls.map((call) => call[0])).toEqual([2.5, 2]);
    });

    it('moves the checked radio AND the focus as the value changes', () => {
      render(<ModernRate defaultValue={2} />);

      fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
      const checked = screen
        .getAllByRole('radio')
        .filter((node) => node.getAttribute('aria-checked') === 'true');
      expect(checked).toHaveLength(1);
      expect(checked[0]).toBe(screen.getByRole('radio', { name: '3 stars' }));
      // APG: focus travels with the selection.
      expect(checked[0]).toHaveFocus();
      expect(tabbableStar()).toBe(checked[0]);
    });

    it('half steps keep focus on the star the value falls on', () => {
      render(<ModernRate allowHalf defaultValue={2} />);

      fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });
      const checked = screen
        .getAllByRole('radio')
        .filter((node) => node.getAttribute('aria-checked') === 'true');
      expect(checked).toHaveLength(1);
      expect(checked[0]).toBe(screen.getByRole('radio', { name: '2.5 stars' }));
      expect(checked[0]).toHaveFocus();
    });

    it('Home moves focus to the first star (no radio checked at 0)', () => {
      render(<ModernRate defaultValue={3} />);

      fireEvent.keyDown(tabbableStar(), { key: 'Home' });
      expect(screen.getByRole('radio', { name: '1 star' })).toHaveFocus();
      expect(tabbableStar()).toBe(screen.getByRole('radio', { name: '1 star' }));
    });

    it('does not respond when disabled, readOnly, or keyboard=false', () => {
      const handleChange = vi.fn();
      const { rerender } = render(<ModernRate defaultValue={2} disabled onChange={handleChange} />);
      fireEvent.keyDown(screen.getAllByRole('radio')[0], { key: 'ArrowRight' });

      rerender(<ModernRate defaultValue={2} readOnly onChange={handleChange} />);
      fireEvent.keyDown(screen.getAllByRole('radio')[0], { key: 'ArrowRight' });

      rerender(<ModernRate defaultValue={2} keyboard={false} onChange={handleChange} />);
      fireEvent.keyDown(tabbableStar(), { key: 'ArrowRight' });

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('focus behavior', () => {
    it('paints the skin focus ring on the focused star only', () => {
      render(<ModernRate defaultValue={3} />);

      const star = tabbableStar();
      fireEvent.focus(star);
      expect(star).toHaveAttribute('data-focused', 'true');
      screen
        .getAllByRole('radio')
        .filter((radio) => radio !== star)
        .forEach((radio) => {
          expect(radio).not.toHaveAttribute('data-focused');
        });

      fireEvent.blur(star);
      screen.getAllByRole('radio').forEach((radio) => {
        expect(radio).not.toHaveAttribute('data-focused');
      });
    });

    it('click focuses the clicked star, like a native radio', () => {
      render(<ModernRate defaultValue={1} />);

      const star4 = screen.getByRole('radio', { name: '4 stars' });
      fireEvent.click(star4);
      expect(star4).toHaveFocus();
      expect(tabbableStar()).toBe(star4);
    });

    it('supports autoFocus on the roving tab stop', () => {
      render(<ModernRate defaultValue={2} autoFocus />);
      expect(tabbableStar()).toHaveFocus();
      expect(screen.getByRole('radio', { name: '2 stars' })).toHaveFocus();
    });
  });

  describe('RTL', () => {
    it('renders with direction: rtl and keeps the full model intact', () => {
      render(<ModernRate defaultValue={3} direction="rtl" />);

      const root = screen.getByRole('radiogroup', { name: 'Rating' });
      expect(root).toHaveStyle({ direction: 'rtl' });
      expect(screen.getAllByRole('radio')).toHaveLength(5);
      const checked = screen
        .getAllByRole('radio')
        .filter((node) => node.getAttribute('aria-checked') === 'true');
      expect(checked).toHaveLength(1);
    });

    it('keeps direction-neutral keys working in RTL', () => {
      const handleChange = vi.fn();
      render(<ModernRate defaultValue={2} direction="rtl" onChange={handleChange} />);

      fireEvent.keyDown(tabbableStar(), { key: 'ArrowUp' });
      fireEvent.keyDown(tabbableStar(), { key: 'ArrowDown' });
      fireEvent.keyDown(tabbableStar(), { key: 'End' });
      expect(handleChange.mock.calls.map((call) => call[0])).toEqual([3, 2, 5]);
    });
  });

  describe('axe-core audit (new model)', () => {
    it.each([
      ['interactive, half-filled', <ModernRate key="a" defaultValue={2.5} allowHalf />],
      ['interactive, full value', <ModernRate key="b" defaultValue={5} />],
      ['empty value', <ModernRate key="c" defaultValue={0} />],
      ['disabled', <ModernRate key="d" defaultValue={3} disabled />],
      ['readOnly', <ModernRate key="e" defaultValue={4} readOnly />],
      ['RTL', <ModernRate key="f" defaultValue={2.5} allowHalf direction="rtl" />],
      ['tooltips + custom character', (
        <ModernRate
          key="g"
          defaultValue={3}
          tooltips={['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']}
          character={({ index }) => <span data-testid={`char-${index}`}>*</span>}
        />
      )],
    ])('has no axe violations: %s', async (_label, element) => {
      const { container } = render(element);
      const results = await axe.run(container, { resultTypes: ['violations'] });
      expect(results.violations).toEqual([]);
    });
  });
});
