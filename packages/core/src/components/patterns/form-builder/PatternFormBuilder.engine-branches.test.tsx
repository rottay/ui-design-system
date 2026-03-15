import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClassicFormBuilder from './engines/classic';
import ModernFormBuilder from './engines/modern';
import RusticFormBuilder from './engines/rustic';

const ENGINE_COMPONENTS = [
  ['classic', ClassicFormBuilder],
  ['modern', ModernFormBuilder],
  ['rustic', RusticFormBuilder],
] as const;

describe('PatternFormBuilder branch coverage', () => {
  it.each(ENGINE_COMPONENTS)(
    'covers controlled values, hidden fields, custom renderers, and step control in the %s engine',
    async (_engine, Component) => {
      const onChange = vi.fn();
      const onStepChange = vi.fn();

      render(
        <Component
          title="Operations"
          description="Controlled matrix"
          layout="steps"
          stepLabels={['Basics', 'Advanced']}
          currentStep={1}
          onStepChange={onStepChange}
          onChange={onChange}
          showLabels={false}
          showRequired={false}
          values={{
            notes: 'Seed note',
            hiddenState: 'hide',
            publish: true,
            palette: '#112233',
            satisfaction: 4,
          }}
          renderField={(field, defaultRender, value) =>
            field.name === 'preview' ? (
              <button type="button" onClick={() => onChange({ preview: value })}>
                Preview {String(value ?? 'empty')}
              </button>
            ) : (
              defaultRender
            )
          }
          fields={[
            { name: 'notes', label: 'Notes', type: 'textarea', required: true },
            {
              name: 'hiddenState',
              label: 'Hidden state',
              type: 'text',
              hidden: true,
            },
            {
              name: 'conditional',
              label: 'Conditional',
              type: 'text',
              hidden: (values) => values.hiddenState === 'hide',
            },
            { name: 'publish', label: 'Publish', type: 'switch' },
            { name: 'eventDate', label: 'Date', type: 'date' },
            { name: 'eventTime', label: 'Time', type: 'time' },
            { name: 'eventAt', label: 'DateTime', type: 'datetime' },
            { name: 'asset', label: 'Asset', type: 'file' },
            { name: 'palette', label: 'Palette', type: 'color' },
            { name: 'satisfaction', label: 'Satisfaction', type: 'rating' },
            {
              name: 'preview',
              label: 'Preview',
              type: 'custom',
              render: (_field, value) => <div>Value: {String(value ?? 'empty')}</div>,
            },
          ]}
          onSubmit={() => undefined}
        />
      );

      expect(screen.getByText('Operations')).toBeInTheDocument();
      expect(screen.getByText('Controlled matrix')).toBeInTheDocument();
      expect(screen.queryByText('Conditional')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /preview empty/i })).toBeInTheDocument();
      expect(screen.queryByText('Notes')).not.toBeInTheDocument();

      const previous = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(previous);
      expect(onStepChange).toHaveBeenCalledWith(0);
    }
  );

  it.each([
    ['modern', ModernFormBuilder],
    ['rustic', RusticFormBuilder],
  ] as const)(
    'covers native advanced field interactions and validation branches in the %s engine',
    async (_engine, Component) => {
      const onSubmit = vi.fn();
      const onValidationChange = vi.fn();

      render(
        <Component
          layout="horizontal"
          onSubmit={onSubmit}
          onValidationChange={onValidationChange}
          fields={[
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
              validation: { minLength: 3, maxLength: 8, pattern: '^[a-z]+$', message: 'Invalid name' },
            },
            { name: 'publishAt', label: 'Publish at', type: 'datetime' },
            { name: 'asset', label: 'Asset', type: 'file' },
            { name: 'palette', label: 'Palette', type: 'color' },
            { name: 'score', label: 'Score', type: 'slider', validation: { min: 1, max: 5 } },
            { name: 'rating', label: 'Rating', type: 'rating' },
          ]}
          actions={<button type="submit">Submit builder</button>}
        />
      );

      const textboxes = screen.getAllByRole('textbox');
      fireEvent.change(textboxes[0], { target: { value: 'ab' } });
      fireEvent.click(screen.getByRole('button', { name: /submit builder/i }));

      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalled();
      });

      fireEvent.change(textboxes[0], { target: { value: 'launch' } });

      const datetime = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
      fireEvent.change(datetime, { target: { value: '2026-03-13T10:30' } });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['hero'], 'hero.png', { type: 'image/png' })],
        },
      });

      const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });

      const rangeInput = document.querySelector('input[type="range"]') as HTMLInputElement;
      fireEvent.change(rangeInput, { target: { value: '4' } });

      const radios = screen.queryAllByRole('radio');
      if (radios.length > 0) {
        fireEvent.click(radios[radios.length - 1]);
      } else {
        const stars = Array.from(document.querySelectorAll('span')).filter((node) =>
          node.textContent?.includes('★')
        );
        fireEvent.click(stars[stars.length - 1] as HTMLElement);
      }

      fireEvent.click(screen.getByRole('button', { name: /submit builder/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'launch',
            publishAt: '2026-03-13T10:30',
            palette: '#ff0000',
            score: 4,
          })
        );
      });
    }
  );
});
