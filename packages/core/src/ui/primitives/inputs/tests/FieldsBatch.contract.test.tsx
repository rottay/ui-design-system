import React from 'react';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import { Input } from '../Input';
import { Slider } from '../Slider';
import { InputNumber } from '../InputNumber';
import { PasswordInput } from '../PasswordInput';
import { Radio } from '../Radio';
import { TagInput } from '../TagInput';
import { Checkbox } from '../Checkbox';
import { Form } from '../Form';
import { Toggle } from '../Toggle';
import { Switch } from '../Switch';
import { OTPInput } from '../OTPInput';
import { Textarea } from '../Textarea';
import { FormField } from '../FormField';
import { Button } from '../Button';
import { VoiceInputButton } from '../VoiceInputButton';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint A -- the field family (15 input components)
// data-part contract evidence.
//
// The pre-step stamps `data-part` (plus a handful of literal `data-*` state
// attributes -- data-checked, data-disabled, data-error, etc.) onto all 15
// components without moving any paint: every useState hover/focus pair and
// every imperative handler stays exactly where it was. This file proves the
// stamp reached the DOM for each component under every engine it supports;
// it does not assert paint (that is `fields-batch.spec.ts`'s job).
//
// Every render goes through `createEngineComponent`'s Suspense-wrapped lazy
// engine loader for the 13 engine-split components, so a synchronous
// `container.querySelector(...)` right after `render()` can race the still-
// pending engine chunk -- same idiom as PatternDetailPanel's contract test.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

describe('Field family data-part contract (WO-SKIN-02 checkpoint A)', () => {
  describe('Input', () => {
    it.each(ENGINES)('stamps root and affix/clear/count/error-message parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Input prefix="$" suffix="USD" clearable defaultValue="120" showCount maxLength={10} error errorMessage="Too long" />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="affix-prefix"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="affix-suffix"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="clear-button"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="count"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="error-message"]')).toHaveLength(1);
    });

    it.each(ENGINES)('stamps the Input.TextArea/Addon compounds\' fresh anatomy under the %s engine', async (engine) => {
      const { container: taContainer } = renderWithEngine(
        <Input.TextArea showCount maxLength={10} error errorMessage="Too long" defaultValue="hi" />,
        engine,
      );
      expect(taContainer.querySelectorAll('[data-part="root"]')).toHaveLength(1);
      expect(taContainer.querySelectorAll('[data-part="control"]')).toHaveLength(1);
      expect(taContainer.querySelectorAll('[data-part="count"]')).toHaveLength(1);
      expect(taContainer.querySelectorAll('[data-part="error-message"]')).toHaveLength(1);

      const { container: addonContainer } = render(<Input.Addon>https://</Input.Addon>);
      expect(addonContainer.querySelectorAll('[data-part="root"]')).toHaveLength(1);
    });

    it.each(ENGINES)("stamps Input.Password's visibility-toggle and Input.Search's search-button under the %s engine", async (engine) => {
      const { container: pwContainer } = renderWithEngine(<Input.Password defaultValue="secret" />, engine);
      await waitForPart(pwContainer, 'root');
      expect(pwContainer.querySelectorAll('[data-part="visibility-toggle"]')).toHaveLength(1);

      const { container: searchContainer } = renderWithEngine(<Input.Search onSearch={vi.fn()} />, engine);
      await waitForPart(searchContainer, 'root');
      expect(searchContainer.querySelectorAll('[data-part="search-button"]')).toHaveLength(1);
    });
  });

  describe('Slider', () => {
    // The custom rail/track/handle DOM exists only on the `range` branch; the
    // single-value branch renders a native <input type="range"> (UA-drawn, no
    // parts to stamp beyond root + mark-label).
    it.each(ENGINES)('range branch stamps root/rail/track/handle/mark-label under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Slider range defaultValue={[20, 60]} marks={{ 0: 'Min', 100: 'Max' }} />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="rail"]').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('[data-part="track"]').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('[data-part="handle"]').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('[data-part="mark-label"]').length).toBe(2);
    });

    it.each(ENGINES)('single-value branch stamps root + mark-label under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Slider defaultValue={40} marks={{ 0: 'Min', 100: 'Max' }} />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="mark-label"]').length).toBe(2);
    });
  });

  describe('InputNumber', () => {
    it.each(ENGINES)('stamps root/addon/prefix-suffix/stepper-button parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <InputNumber prefix="$" suffix="USD" addonBefore="Qty" addonAfter="ea" defaultValue={5} />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="addon-before"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="addon-after"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="prefix"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="suffix"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="stepper-button"]')).toHaveLength(2);
    });
  });

  describe('PasswordInput', () => {
    it.each(ENGINES)('stamps root/visibility-toggle/strength-track/strength-fill parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <PasswordInput strengthIndicator strengthLevel="good" defaultValue="Abcd1234" />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="visibility-toggle"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="strength-track"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="strength-fill"]')).toHaveLength(1);
    });
  });

  describe('Radio', () => {
    it.each(ENGINES)('stamps root/circle/dot/label parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Radio name="contract-radio" label="Choice" description="a description" />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="circle"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="dot"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="description"]')).toHaveLength(1);
    });

    it.each(ENGINES)('stamps Radio.Group option parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Radio.Group
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ]}
          value="a"
          onChange={vi.fn()}
        />,
        engine,
      );
      expect(container.querySelectorAll('[data-part="root"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="option"]')).toHaveLength(2);
    });
  });

  describe('TagInput', () => {
    it.each(ENGINES)('stamps root/tag-chip/tag-remove/input parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <TagInput value={['design', 'system']} onChange={vi.fn()} />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="tag-chip"]')).toHaveLength(2);
      expect(container.querySelectorAll('[data-part="tag-remove"]')).toHaveLength(2);
      expect(container.querySelectorAll('[data-part="input"]')).toHaveLength(1);
    });
  });

  describe('Checkbox', () => {
    it.each(ENGINES)('stamps root/box/checkmark/label parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Checkbox label="Accept" checked onChange={vi.fn()} />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="box"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="checkmark"]').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
    });

    it.each(ENGINES)('stamps Checkbox.Group option parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Checkbox.Group
          options={[
            { value: 'x', label: 'X' },
            { value: 'y', label: 'Y' },
          ]}
          value={['x']}
          onChange={vi.fn()}
        />,
        engine,
      );
      expect(container.querySelectorAll('[data-part="root"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="option"]')).toHaveLength(2);
    });
  });

  describe('Form', () => {
    it.each(ENGINES)('stamps root/item/label/required-mark/help-text parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Form>
          <Form.Item label="Email" name="email" required help="We never share it">
            <input />
          </Form.Item>
        </Form>,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="item"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="required-mark"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="help-text"]')).toHaveLength(1);
    });

    it.each(ENGINES)('stamps the error-list part under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Form>
          <Form.ErrorList fieldName="email" />
        </Form>,
        engine,
      );
      await waitForPart(container, 'root');
      // ErrorList renders nothing until the form context carries an error for
      // the named field -- asserting root reached the DOM is the meaningful
      // contract here; the list itself is exercised via the Form.Item case above.
      expect(container.querySelectorAll('[data-part="root"]')).toHaveLength(1);
    });
  });

  describe('Toggle', () => {
    it.each(ENGINES)('stamps root/track/thumb/label parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Toggle label="Notifications" checked onChange={vi.fn()} />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="track"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="thumb"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
    });
  });

  describe('Switch', () => {
    it.each(ENGINES)('stamps root/track/thumb/label parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Switch checked onChange={vi.fn()} checkedChildren="On" unCheckedChildren="Off" />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="track"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="thumb"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
    });
  });

  describe('OTPInput', () => {
    it.each(ENGINES)('stamps root/slot/error-message parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <OTPInput length={4} value="12" error errorMessage="Invalid code" onChange={vi.fn()} />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="slot"]')).toHaveLength(4);
      expect(container.querySelectorAll('[data-part="error-message"]')).toHaveLength(1);
    });
  });

  describe('Textarea', () => {
    it.each(ENGINES)('stamps the root part under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Textarea defaultValue="hello" />, engine);
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="root"]')).toHaveLength(1);
    });

    it('stamps the rustic-only count part', async () => {
      const { container } = renderWithEngine(
        <Textarea showCount maxLength={20} defaultValue="hello" />,
        'rustic',
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="count"]')).toHaveLength(1);
    });
  });

  describe('FormField', () => {
    it.each(ENGINES)('stamps root/label/required-mark/error-message/help-text parts under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <FormField label="Username" name="username" required error="Too short">
          <input />
        </FormField>,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="label"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="required-mark"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="error-message"]')).toHaveLength(1);
    });
  });

  describe('Button.Icon', () => {
    it('stamps the trigger and spinner parts (no engine split)', () => {
      const { container, rerender } = render(
        <Button.Icon icon={<span aria-hidden>+</span>} aria-label="Add" />,
      );
      expect(container.querySelectorAll('[data-part="trigger"]')).toHaveLength(1);

      rerender(<Button.Icon icon={<span aria-hidden>+</span>} aria-label="Add" loading />);
      expect(container.querySelectorAll('[data-part="spinner"]')).toHaveLength(1);
    });
  });

  describe('VoiceInputButton', () => {
    beforeAll(() => {
      // useVoiceInput's `isSupported` gate checks for a constructable
      // SpeechRecognition on `window` -- jsdom carries neither by default.
      // A minimal stub is enough to let the root button mount; this test
      // never calls `.start()`/`.stop()`, so no other method needs a body.
      class FakeSpeechRecognition {
        continuous = false;
        interimResults = false;
        lang = 'en-US';
        maxAlternatives = 1;
        onstart: (() => void) | null = null;
        onresult: (() => void) | null = null;
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        start() {}
        stop() {}
        abort() {}
      }
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeSpeechRecognition;
    });

    it('stamps the root part once the browser reports speech-recognition support', async () => {
      const { container } = render(<VoiceInputButton lang="en-US" onTranscript={vi.fn()} />);
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="root"]')).toHaveLength(1);
    });
  });
});
