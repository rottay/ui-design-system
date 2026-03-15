import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { FormBuilderProps } from '../FormBuilder.types';
import ClassicFormBuilder from '../engines/classic';
import ModernFormBuilder from '../engines/modern';
import RusticFormBuilder from '../engines/rustic';

const ENGINE_COMPONENTS = {
  classic: ClassicFormBuilder,
  modern: ModernFormBuilder,
  rustic: RusticFormBuilder,
} as const;

describe('PatternFormBuilder runtime engines', () => {
  it.each(Object.entries(ENGINE_COMPONENTS))(
    'renders the rich field matrix through the %s engine',
    async (_engine, Component) => {
      render(
        <Component
          title="Create Event"
          description="Operational event form"
          layout="grid"
          columns={2}
          gap={24}
          initialValues={{ eventType: 'conference', tags: ['vip'] }}
          fields={[
            { name: 'eventName', label: 'Event name', type: 'text', required: true },
            { name: 'details', label: 'Details', type: 'textarea' },
            {
              name: 'eventType',
              label: 'Event type',
              type: 'select',
              options: [
                { label: 'Conference', value: 'conference' },
                { label: 'Festival', value: 'festival' },
              ],
            },
            {
              name: 'tags',
              label: 'Tags',
              type: 'multi-select',
              options: [
                { label: 'VIP', value: 'vip' },
                { label: 'Live', value: 'live' },
              ],
            },
            { name: 'published', label: 'Published', type: 'checkbox' },
            {
              name: 'audience',
              label: 'Audience',
              type: 'radio',
              options: [
                { label: 'Internal', value: 'internal' },
                { label: 'Public', value: 'public' },
              ],
            },
            { name: 'featured', label: 'Featured', type: 'switch' },
            { name: 'eventDate', label: 'Event date', type: 'date' },
            { name: 'eventTime', label: 'Event time', type: 'time' },
            { name: 'eventAt', label: 'Event at', type: 'datetime' },
            { name: 'brandColor', label: 'Brand color', type: 'color' },
            { name: 'satisfaction', label: 'Satisfaction', type: 'slider' },
            {
              name: 'internalNotes',
              label: 'Internal notes',
              type: 'custom',
              render: () => <div>Custom renderer</div>,
              hidden: (values) => values.eventType !== 'conference',
            },
          ]}
          actions={<button type="submit">Create event</button>}
          onSubmit={() => undefined}
        />
      );

      expect(screen.getByText('Create Event')).toBeInTheDocument();
      expect(screen.getByText('Operational event form')).toBeInTheDocument();
      expect(screen.getByText('Event name')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
      expect(screen.getByText('Event type')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Audience')).toBeInTheDocument();
      expect(screen.getByText('Brand color')).toBeInTheDocument();
      expect(screen.getByText('Custom renderer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
    }
  );

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'validates, submits and handles steps through the %s engine',
    async (_engine, Component) => {
      const onSubmit = vi.fn();
      const onValidationChange = vi.fn();
      const onStepChange = vi.fn();

      render(
        <Component
          title="Setup Wizard"
          layout="steps"
          stepLabels={['Basics', 'Review']}
          onSubmit={onSubmit}
          onValidationChange={onValidationChange}
          onStepChange={onStepChange}
          fields={[
            {
              name: 'eventName',
              label: 'Event name',
              type: 'text',
              required: true,
              validation: { minLength: 3, message: 'Event name too short' },
            },
            {
              name: 'capacity',
              label: 'Capacity',
              type: 'number',
              validation: { min: 50, max: 500, message: 'Capacity out of bounds' },
            },
            {
              name: 'slug',
              label: 'Slug',
              type: 'text',
              validation: { pattern: '^[a-z-]+$', message: 'Slug format invalid' },
            },
            {
              name: 'reviewer',
              label: 'Reviewer',
              type: 'text',
              defaultValue: 'ops-team',
            },
          ]}
          actions={<button type="submit">Finish</button>}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /finish/i }));

      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalled();
      });

      const textbox = screen.getAllByRole('textbox')[0];
      fireEvent.change(textbox, { target: { value: 'Launch week' } });

      // Classic number inputs render as spinbuttons, while the modern/rustic
      // engines use the native number role. The query keeps the test portable.
      const spinbutton = screen.getByRole('spinbutton');
      fireEvent.change(spinbutton, { target: { value: '120' } });

      const slugField = screen.getAllByRole('textbox').find((node) => {
        const input = node as HTMLInputElement;
        return input.value === '' || input.value === 'ops-team';
      });

      if (slugField) {
        fireEvent.change(slugField, { target: { value: 'launch-week' } });
      }

      const nextButton = screen.queryByRole('button', { name: /next/i });
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(onStepChange).toHaveBeenCalled();
      }

      fireEvent.click(screen.getByRole('button', { name: /finish/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            eventName: 'Launch week',
            capacity: 120,
          })
        );
      });
    }
  );

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'updates advanced field types and navigation controls through the %s engine',
    async (_engine, Component) => {
      const onChange = vi.fn();
      const onStepChange = vi.fn();

      render(
        <Component
          layout="steps"
          stepLabels={['Basics', 'Preferences']}
          onChange={onChange}
          onStepChange={onStepChange}
          fields={[
            { name: 'eventName', label: 'Event name', type: 'text' },
            {
              name: 'eventType',
              label: 'Event type',
              type: 'select',
              placeholder: 'Choose type',
              options: [
                { label: 'Conference', value: 'conference' },
                { label: 'Festival', value: 'festival' },
              ],
            },
            {
              name: 'tags',
              label: 'Tags',
              type: 'multi-select',
              options: [
                { label: 'VIP', value: 'vip' },
                { label: 'Hybrid', value: 'hybrid' },
              ],
            },
            { name: 'published', label: 'Published', type: 'checkbox' },
            {
              name: 'audience',
              label: 'Audience',
              type: 'radio',
              options: [
                { label: 'Internal', value: 'internal' },
                { label: 'Public', value: 'public' },
              ],
            },
            { name: 'featured', label: 'Featured', type: 'switch' },
            { name: 'brandColor', label: 'Brand color', type: 'color' },
            { name: 'satisfaction', label: 'Satisfaction', type: 'slider' },
            { name: 'asset', label: 'Asset', type: 'file' },
            {
              name: 'preview',
              label: 'Preview',
              type: 'custom',
              render: (_field, value) => <div>Preview: {String(value ?? 'empty')}</div>,
            },
          ]}
        />
      );

      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: 'Launch Week' },
      });

      const nativeSelects = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];
      const primarySelect = nativeSelects.find((node) => !node.multiple);
      if (primarySelect) {
        fireEvent.change(primarySelect, { target: { value: 'festival' } });
      }

      const multiSelect = nativeSelects.find((node) => node.multiple);
      if (multiSelect) {
        Array.from(multiSelect.options).forEach((option) => {
          option.selected = option.value === 'vip';
        });
        fireEvent.change(multiSelect);
      }

      const checkboxInputs = Array.from(
        document.querySelectorAll('input[type="checkbox"]')
      ) as HTMLInputElement[];
      if (checkboxInputs[0]) {
        fireEvent.click(checkboxInputs[0]);
      }

      const publicAudience = document.querySelector(
        'input[type="radio"][value="public"]'
      ) as HTMLInputElement | null;
      if (publicAudience) {
        fireEvent.click(publicAudience);
      }

      const featuredSwitch =
        screen.queryByRole('switch') ??
        checkboxInputs[checkboxInputs.length - 1];
      if (featuredSwitch) {
        fireEvent.click(featuredSwitch);
      }

      const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement | null;
      if (colorInput) {
        fireEvent.change(colorInput, { target: { value: '#ff0000' } });
      }

      const slider = document.querySelector('input[type="range"]') as HTMLInputElement | null;
      if (slider) {
        fireEvent.change(slider, { target: { value: '80' } });
      }

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
      if (fileInput) {
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['banner'], 'banner.png', { type: 'image/png' })],
          },
        });
      }

      const nextButton = screen.queryByRole('button', { name: /next/i });
      if (nextButton) {
        fireEvent.click(nextButton);
      }

      const previousButton = screen.queryByRole('button', { name: /previous/i });
      if (previousButton) {
        fireEvent.click(previousButton);
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
      expect(onStepChange).toHaveBeenCalled();
    }
  );
});
