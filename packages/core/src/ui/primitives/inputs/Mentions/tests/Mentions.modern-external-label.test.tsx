import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernMentions from '../engines/modern';
import { Mentions as ClassicMentions } from '../engines/classic';
import { Mentions as RusticMentions } from '../engines/rustic';

const OPTIONS = [{ value: 'alice', label: 'Alice' }];

/**
 * The engine synthesizes an accessible name from the placeholder so the control
 * is never nameless. That fallback must not outrank a real label supplied by a
 * field wrapper, and the `id` the wrapper points its `<label for>` at must reach
 * the textarea.
 */
describe('Mentions modern - external label composition', () => {
  it('forwards the id a field wrapper wires its label to', () => {
    render(<ModernMentions options={OPTIONS} id="team-notes" placeholder="Type @ to mention" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'team-notes');
  });

  it('lets an external aria-labelledby win over the placeholder fallback', () => {
    render(
      <div>
        <span id="notes-label">Team notes</span>
        <ModernMentions
          options={OPTIONS}
          id="team-notes"
          aria-labelledby="notes-label"
          placeholder="Type @ to mention"
        />
      </div>,
    );

    // The visible label is what AT announces -- not the placeholder.
    expect(screen.getByRole('textbox', { name: 'Team notes' })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-label');
  });

  it('keeps synthesizing a name from the placeholder when no external label exists', () => {
    render(<ModernMentions options={OPTIONS} placeholder="Type @ to mention" />);

    expect(screen.getByRole('textbox', { name: 'Type @ to mention' })).toBeInTheDocument();
  });
});

describe('Modern Mentions label-for precedence', () => {
  it('lets a <label for> bound through id own the accessible name', () => {
    render(
      <>
        <label htmlFor="notes-field">Notify reviewer</label>
        <ModernMentions id="notes-field" options={[]} placeholder="Mention a reviewer" />
      </>
    );

    const field = screen.getByRole('textbox');
    expect(field).not.toHaveAttribute('aria-label');
    expect(field).toHaveAccessibleName('Notify reviewer');
  });
});

describe('Mentions id/aria-labelledby passthrough across engines', () => {
  it.each([
    ['classic', ClassicMentions],
    ['rustic', RusticMentions],
  ])('%s forwards id and aria-labelledby to the field', (_engine, Engine) => {
    const { container } = render(
      <>
        <span id="ext-label">Notify reviewer</span>
        <Engine id="notes-field" aria-labelledby="ext-label" options={[]} />
      </>
    );

    const field = container.querySelector('#notes-field');
    expect(field).toBeTruthy();
    expect(field).toHaveAttribute('aria-labelledby', 'ext-label');
  });
});
