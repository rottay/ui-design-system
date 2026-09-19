/**
 * @fileoverview Enter commits a field only when an IME is not confirming a candidate.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { isComposingKey, resolveDelegatedSubmitIntent, resolveSubmitIntent } from '..';

describe('resolveSubmitIntent', () => {
  it('commits a plain Enter and ignores every other key', () => {
    expect(resolveSubmitIntent({ key: 'Enter' })).toBe('submit');
    expect(resolveSubmitIntent({ key: 'a' })).toBe('none');
    expect(resolveSubmitIntent({ key: 'Tab', isComposing: true })).toBe('none');
  });

  it('never commits while a composition is open, however the browser reports it', () => {
    expect(resolveSubmitIntent({ key: 'Enter', isComposing: true })).toBe('composing');
    expect(resolveSubmitIntent({ key: 'Enter', nativeEvent: { isComposing: true } })).toBe('composing');
    expect(resolveSubmitIntent({ key: 'Enter', keyCode: 229 })).toBe('composing');
    expect(resolveSubmitIntent({ key: 'Enter', nativeEvent: { keyCode: 229 } })).toBe('composing');
    expect(isComposingKey({ key: 'Enter', keyCode: 13 })).toBe(false);
  });

  it('keeps Shift+Enter for a new line only in a multi-line field', () => {
    expect(resolveSubmitIntent({ key: 'Enter', shiftKey: true }, { multiline: true })).toBe('newline');
    expect(resolveSubmitIntent({ key: 'Enter', shiftKey: true })).toBe('submit');
    expect(resolveSubmitIntent({ key: 'Enter' }, { multiline: true })).toBe('submit');
  });

  it('reads a React keyboard event from a real field', () => {
    const onSubmit = vi.fn();
    function Field() {
      return (
        <input
          aria-label="Candidate"
          onKeyDown={(event) => {
            if (resolveSubmitIntent(event) === 'submit') onSubmit();
          }}
        />
      );
    }
    render(<Field />);
    const field = screen.getByRole('textbox', { name: 'Candidate' });
    fireEvent.keyDown(field, { key: 'Enter', keyCode: 229 });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Enter', keyCode: 13 });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('resolveDelegatedSubmitIntent', () => {
  function rootOver(child: React.ReactElement, onIntent: (intent: string) => void) {
    return (
      <div
        data-testid="root"
        onKeyDown={(event) => onIntent(resolveDelegatedSubmitIntent(event))}
      >
        {child}
      </div>
    );
  }

  it('refuses a press a descendant already consumed', () => {
    const intents: string[] = [];
    const onActivate = vi.fn();
    render(
      rootOver(
        <div
          role="presentation"
          data-testid="child"
          onKeyDown={(event) => {
            event.preventDefault();
            onActivate();
          }}
        />,
        (intent) => intents.push(intent),
      ),
    );
    fireEvent.keyDown(screen.getByTestId('child'), { key: 'Enter' });
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(intents).toEqual(['none']);
  });

  it('leaves Enter with any interactive owner, native or ARIA-roled', () => {
    for (const child of [
      <button key="b" data-testid="child" type="button" />,
      <div key="r" role="button" tabIndex={0} data-testid="child" />,
      <div key="t" role="textbox" tabIndex={0} data-testid="child" />,
      <div key="c" contentEditable suppressContentEditableWarning data-testid="child" />,
    ]) {
      const intents: string[] = [];
      const view = render(rootOver(child, (intent) => intents.push(intent)));
      fireEvent.keyDown(screen.getByTestId('child'), { key: 'Enter' });
      expect(intents).toEqual(['none']);
      view.unmount();
    }
  });

  it('still commits an unclaimed press, and still defers to the IME', () => {
    const intents: string[] = [];
    render(rootOver(<span data-testid="child" />, (intent) => intents.push(intent)));
    const child = screen.getByTestId('child');
    fireEvent.keyDown(child, { key: 'Enter' });
    fireEvent.keyDown(child, { key: 'Enter', keyCode: 229 });
    fireEvent.keyDown(child, { key: 'a' });
    expect(intents).toEqual(['submit', 'composing', 'none']);
  });
});
