/**
 * @fileoverview Input primitive smoke tests across all stable engines.
 * Validates Form+Input, Select, Checkbox, Radio, DatePicker, TimePicker,
 * Upload, TreeSelect, Slider, Cascader, Mentions, and AutoComplete.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import * as DS from '../../index';
import { STABLE_ENGINES, renderWithEngine } from '../helpers/engine-test-utils';

describe('primitive input smoke coverage', () => {
  it.each(STABLE_ENGINES)('renders Form and Input through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Form engine={engine} layout="vertical" onFinish={() => undefined}>
        <DS.Form.Item name="eventName" label="Event name">
          <DS.Input engine={engine} placeholder="Event name" />
        </DS.Form.Item>
        <button type="submit">Save form</button>
      </DS.Form>,
      engine
    );

    expect(await screen.findByText(/Event name:?/, {}, { timeout: 6_000 })).toBeInTheDocument();
    expect(await screen.findByRole('textbox', { name: /event name/i }, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Select through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Select
        engine={engine}
        value="conference"
        onChange={() => undefined}
        options={[
          { label: 'Conference', value: 'conference' },
          { label: 'Festival', value: 'festival' },
        ]}
      />,
      engine
    );

    await waitFor(
      () => {
        expect(document.body.textContent).toContain('Conference');
      },
      { timeout: 6_000 }
    );
  });

  it.each(STABLE_ENGINES)('renders Checkbox and Radio through the %s engine', async (engine) => {
    renderWithEngine(
      <div>
        <DS.Checkbox engine={engine} label="Operations" checked onChange={() => undefined} />
        <DS.Radio engine={engine} name="access" label="Full access" checked onChange={() => undefined} />
      </div>,
      engine
    );

    expect(await screen.findByText('Operations', {}, { timeout: 6_000 })).toBeInTheDocument();
    expect(await screen.findByText('Full access', {}, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders DatePicker and TimePicker through the %s engine', async (engine) => {
    renderWithEngine(
      <div>
        <DS.DatePicker engine={engine} placeholder="Select date" />
        <DS.TimePicker engine={engine} placeholder="Select time" />
      </div>,
      engine
    );

    expect(await screen.findByPlaceholderText('Select date', {}, { timeout: 6_000 })).toBeInTheDocument();
    expect(await screen.findByPlaceholderText('Select time', {}, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Upload through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Upload engine={engine} action="/upload" onChange={() => undefined}>
        <button type="button">Upload contract</button>
      </DS.Upload>,
      engine
    );

    expect(await screen.findByRole('button', { name: 'Upload contract' }, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders TreeSelect through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.TreeSelect
        engine={engine}
        placeholder="Select team"
        onChange={() => undefined}
        treeData={[
          {
            value: 'engineering',
            title: 'Engineering',
            children: [{ value: 'frontend', title: 'Frontend' }],
          },
        ]}
      />,
      engine
    );

    expect(await screen.findByText('Select team', {}, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Slider through the %s engine', async (engine) => {
    renderWithEngine(<DS.Slider engine={engine} value={60} onChange={() => undefined} />, engine);

    expect(await screen.findByRole('slider', {}, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Cascader through the %s engine', async (engine) => {
    renderWithEngine(
      <DS.Cascader
        engine={engine}
        placeholder="Choose venue"
        options={[
          {
            value: 'north-america',
            label: 'North America',
            children: [{ value: 'nyc', label: 'New York' }],
          },
        ]}
        onChange={() => undefined}
      />,
      engine
    );

    expect(await screen.findByText('Choose venue', {}, { timeout: 6_000 })).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('renders Mentions and AutoComplete through the %s engine', async (engine) => {
    renderWithEngine(
      <div>
        <DS.Mentions
          engine={engine}
          placeholder="Mention speaker"
          options={[{ value: 'daniel', label: 'Daniel' }]}
          onChange={() => undefined}
        />
        <DS.AutoComplete
          engine={engine}
          placeholder="Search contact"
          options={[{ value: 'alice@example.com', label: 'Alice Example' }]}
          onChange={() => undefined}
        />
      </div>,
      engine
    );

    expect(await screen.findByPlaceholderText('Mention speaker', {}, { timeout: 6_000 })).toBeInTheDocument();
    if (engine === 'classic') {
      expect(await screen.findByText('Search contact', {}, { timeout: 6_000 })).toBeInTheDocument();
      return;
    }

    expect(await screen.findByPlaceholderText('Search contact', {}, { timeout: 6_000 })).toBeInTheDocument();
  });
});
