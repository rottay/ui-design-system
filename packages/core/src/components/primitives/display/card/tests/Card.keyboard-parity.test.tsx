/**
 * @fileoverview A clickable Card is operable from the keyboard in both engines (P-51).
 *
 * The rustic engine announced every `clickable || onClick` card as a
 * `role="button"` with a tab stop, and carried no `onKeyDown` at all. A keyboard
 * user could reach it, was told it was a button, and could not activate it --
 * WCAG 2.1.1, the function available to a pointer and not to a keyboard. A
 * comment above the markup called this "the rustic engine's key a11y advantage
 * over modern/classic".
 *
 * The modern engine had it right: the role, the tab stop and the activation path
 * are gated together on `onClick`, and `clickable` is a styling flag rather than
 * a promise that the card does anything.
 *
 * Both engines run through the same table here, so neither can drift again.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernCard from '../engines/modern';
import RusticCard from '../engines/rustic';

const ENGINES = [
  { name: 'modern', Card: ModernCard },
  { name: 'rustic', Card: RusticCard },
] as const;

const root = (container: HTMLElement) => container.querySelector('[data-part="root"]') as HTMLElement;

describe.each(ENGINES)('$name engine: a card with onClick is a real button', ({ Card }) => {
  it('announces itself and takes a tab stop', () => {
    const { container } = render(<Card onClick={() => {}} title="Card" />);
    expect(root(container)).toHaveAttribute('role', 'button');
    expect(root(container)).toHaveAttribute('tabindex', '0');
  });

  it.each(['Enter', ' '])('activates on %s', (key) => {
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick} title="Card" />);

    fireEvent.keyDown(root(container), { key });
    expect(onClick, `${key} did not activate a card that says it is a button`).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick} title="Card" />);

    fireEvent.keyDown(root(container), { key: 'a' });
    fireEvent.keyDown(root(container), { key: 'Escape' });
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe.each(ENGINES)('$name engine: a card that is merely styled clickable is not a button', ({ Card }) => {
  it('mints no role and no tab stop', () => {
    // A focusable `role="button"` with no activation path is worse than no
    // affordance at all: it tells a screen reader a lie and traps a Tab.
    const { container } = render(<Card clickable title="Card" />);
    expect(root(container)).not.toHaveAttribute('role');
    expect(root(container)).not.toHaveAttribute('tabindex');
  });
});

const NESTED_CONTROLS = [
  { name: 'button', control: <button type="button" data-testid="nested">Act</button> },
  { name: 'descendant of a button', control: <button type="button"><span data-testid="nested">Act</span></button> },
  { name: 'a[href]', control: <a href="#target" data-testid="nested">Link</a> },
  { name: 'text input', control: <input aria-label="Note" data-testid="nested" /> },
  { name: 'checkbox input', control: <input type="checkbox" aria-label="Select" data-testid="nested" /> },
  { name: 'select', control: <select aria-label="Pick" data-testid="nested"><option>One</option></select> },
  { name: 'textarea', control: <textarea aria-label="Note" data-testid="nested" /> },
  { name: 'details', control: <details data-testid="nested"><summary>More</summary></details> },
  { name: 'summary', control: <details><summary data-testid="nested">More</summary></details> },
  { name: 'contenteditable', control: <div contentEditable suppressContentEditableWarning data-testid="nested" /> },
  { name: 'role=button', control: <span role="button" tabIndex={0} data-testid="nested">Act</span> },
  { name: 'role=link', control: <span role="link" tabIndex={0} data-testid="nested">Go</span> },
  { name: 'role=checkbox', control: <span role="checkbox" aria-checked="false" tabIndex={0} data-testid="nested">Pick</span> },
  { name: 'role=menuitem', control: <span role="menuitem" tabIndex={0} data-testid="nested">Item</span> },
  { name: 'role=option', control: <span role="option" aria-selected="false" tabIndex={0} data-testid="nested">Option</span> },
  { name: 'role=radio', control: <span role="radio" aria-checked="false" tabIndex={0} data-testid="nested">Radio</span> },
  { name: 'role=switch', control: <span role="switch" aria-checked="false" tabIndex={0} data-testid="nested">Switch</span> },
] as const;

const nested = (container: HTMLElement) => container.querySelector('[data-testid="nested"]') as HTMLElement;

describe.each(ENGINES)('$name engine: Enter and Space on a nested control belong to that control', ({ Card }) => {
  it.each(NESTED_CONTROLS)('$name does not activate the card or lose its default', ({ control }) => {
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick} title="Card">{control}</Card>);

    const enterKept = fireEvent.keyDown(nested(container), { key: 'Enter' });
    const spaceKept = fireEvent.keyDown(nested(container), { key: ' ' });
    expect({ enterKept, spaceKept }).toEqual({ enterKept: true, spaceKept: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('still hands the key to the nested control', () => {
    const onClick = vi.fn();
    const onNestedKeyDown = vi.fn();
    const { container } = render(
      <Card onClick={onClick} title="Card">
        <button type="button" data-testid="nested" onKeyDown={onNestedKeyDown}>Act</button>
      </Card>,
    );

    fireEvent.keyDown(nested(container), { key: 'Enter' });
    fireEvent.keyDown(nested(container), { key: ' ' });
    expect(onNestedKeyDown).toHaveBeenCalledTimes(2);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(['Enter', ' '])('activates exactly once and prevents the default for %s on the root', (key) => {
    const onClick = vi.fn();
    const { container } = render(
      <Card onClick={onClick} title="Card">
        <button type="button">Act</button>
      </Card>,
    );

    expect(fireEvent.keyDown(root(container), { key })).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each(['Enter', ' '])('activates for %s from a non-interactive descendant', (key) => {
    const onClick = vi.fn();
    const { container } = render(
      <Card onClick={onClick} title="Card">
        <span data-testid="plain">Body</span>
      </Card>,
    );

    const plain = container.querySelector('[data-testid="plain"]') as HTMLElement;
    expect(fireEvent.keyDown(plain, { key })).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('leaves every key alone without onClick', () => {
    const { container } = render(
      <Card clickable title="Card">
        <button type="button" data-testid="nested">Act</button>
      </Card>,
    );

    const kept = [
      fireEvent.keyDown(root(container), { key: 'Enter' }),
      fireEvent.keyDown(root(container), { key: ' ' }),
      fireEvent.keyDown(nested(container), { key: 'Enter' }),
      fireEvent.keyDown(nested(container), { key: ' ' }),
    ];
    expect(kept).toEqual([true, true, true, true]);
  });

  it('keeps pointer activation on the root and on the nested control', () => {
    const onClick = vi.fn();
    const onNestedClick = vi.fn();
    const { container } = render(
      <Card onClick={onClick} title="Card">
        <button type="button" data-testid="nested" onClick={onNestedClick}>Act</button>
      </Card>,
    );

    fireEvent.keyDown(nested(container), { key: 'Enter' });
    fireEvent.click(root(container));
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.click(nested(container));
    expect(onNestedClick).toHaveBeenCalledTimes(1);
  });
});
