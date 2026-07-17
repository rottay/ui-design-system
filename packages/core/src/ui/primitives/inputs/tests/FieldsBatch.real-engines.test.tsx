import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { Radio } from '../Radio';
import { Checkbox } from '../Checkbox';
import { Switch } from '../Switch';
import { Slider } from '../Slider';
import { OTPInput } from '../OTPInput';
import { Button } from '../Button';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint A -- the field family skins are real unlayered
// stylesheets, one per engine (plus agnostic homes for the compounds). The
// screenshot baselines (fields-batch.spec.ts) prove the shipped fields look
// identical at rest and in the photographed hover/focus states; they cannot
// prove the STRUCTURAL contract this migration created: that the paint lives in
// the skins (not inline), that every painting border rule clears the P-48
// tenant `*` floor at (0,3,1) -- i.e. reaches (0,4,0) -- that the interaction
// paint the removed React state / imperative handlers used to own now lives as
// `:hover`/`:focus`/`:focus-within`/`:active` rules, that per-mount keyframes
// were renamed into the skins, and that the DOM carries no inline paint on the
// migrated parts. This mirrors PatternDetailPanel.real-engines.test.tsx.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const CSS = join(here, '../../../../foundation/tokens/css');
const read = (p: string) => readFileSync(join(CSS, p), 'utf8');

/** Every new skin file this checkpoint added, keyed by a readable label. */
const SKINS: Record<string, string> = {
  'modern/form-field': read('engines/modern/skin/form-field.css'),
  'rustic/form-field': read('engines/rustic/skin/form-field.css'),
  'modern/textarea': read('engines/modern/skin/textarea.css'),
  'rustic/textarea': read('engines/rustic/skin/textarea.css'),
  'modern/tag-input': read('engines/modern/skin/tag-input.css'),
  'rustic/tag-input': read('engines/rustic/skin/tag-input.css'),
  'modern/input-number': read('engines/modern/skin/input-number.css'),
  'rustic/input-number': read('engines/rustic/skin/input-number.css'),
  'modern/password-input': read('engines/modern/skin/password-input.css'),
  'rustic/password-input': read('engines/rustic/skin/password-input.css'),
  'modern/switch': read('engines/modern/skin/switch.css'),
  'rustic/switch': read('engines/rustic/skin/switch.css'),
  'modern/toggle': read('engines/modern/skin/toggle.css'),
  'rustic/toggle': read('engines/rustic/skin/toggle.css'),
  'modern/radio': read('engines/modern/skin/radio.css'),
  'rustic/radio': read('engines/rustic/skin/radio.css'),
  'modern/checkbox': read('engines/modern/skin/checkbox.css'),
  'rustic/checkbox': read('engines/rustic/skin/checkbox.css'),
  'modern/slider': read('engines/modern/skin/slider.css'),
  'rustic/slider': read('engines/rustic/skin/slider.css'),
  'modern/otp-input': read('engines/modern/skin/otp-input.css'),
  'rustic/otp-input': read('engines/rustic/skin/otp-input.css'),
  'modern/form': read('engines/modern/skin/form.css'),
  'rustic/form': read('engines/rustic/skin/form.css'),
  'modern/input-residual': read('engines/modern/skin/input-residual.css'),
  'rustic/input-residual': read('engines/rustic/skin/input-residual.css'),
  'radio-group': read('components/skin/radio-group.css'),
  'checkbox-group': read('components/skin/checkbox-group.css'),
  'button-icon': read('components/skin/button-icon.css'),
  'voice-input-button': read('components/skin/voice-input-button.css'),
  'input-compounds': read('components/skin/input-compounds.css'),
};

/** Strip comments and `@keyframes` blocks, then return every `{selector, body}` rule. */
function cssRules(css: string): Array<{ selector: string; body: string }> {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const noAtRules = noComments.replace(/@[\w-]+[^{]*\{(?:[^{}]|\{[^}]*\})*\}/g, '');
  const rules: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noAtRules)) !== null) {
    rules.push({ selector: m[1].trim(), body: m[2].trim() });
  }
  return rules;
}

/** The specificity "b" column (classes + attrs + pseudo-classes) for one comma-free selector. */
function bColumn(selector: string): number {
  const classes = (selector.match(/\.[A-Za-z_-][\w-]*/g) || []).length;
  const attrs = (selector.match(/\[[^\]]*\]/g) || []).length;
  const pseudos = (selector.match(/(?<!:):[A-Za-z-]+/g) || []).length;
  const notArgs = (selector.match(/:not\(([^)]*)\)/g) || []).reduce(
    (n, frag) => n + bColumn(frag.slice(5, -1)),
    0,
  );
  return classes + attrs + pseudos + notArgs;
}

/** True if the declaration block sets a border COLOR (paints), not a `none`/`0` reset. */
function paintsBorder(body: string): boolean {
  const re =
    /(?:^|[\s;{])border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?\s*:\s*([^;]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const value = m[1].trim().toLowerCase();
    if (value.startsWith('none') || value.startsWith('0') || value === 'unset' || value === 'inherit')
      continue;
    if (/^border-(?:radius|width|style|spacing|collapse|image)/.test(value)) continue;
    return true;
  }
  return false;
}

describe.each(Object.keys(SKINS))('fields skin %s -- structural contract', (label) => {
  const rules = cssRules(SKINS[label]);

  it('parses into a non-trivial set of rules (guards a broken read)', () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it('every painting border rule reaches specificity (0,4,0)', () => {
    const offenders: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      for (const part of selector.split(',')) {
        if (bColumn(part) < 4) offenders.push(part.trim());
      }
    }
    expect(
      offenders,
      `these border rules sit below (0,4,0) and lose their color to the tenant * floor (P-48):\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('buys the 4th unit from data-part/data-*, never role/aria-label/placeholder', () => {
    const incidental: string[] = [];
    for (const { selector, body } of rules) {
      if (!paintsBorder(body)) continue;
      if (/\[(?:role|aria-label|placeholder)\b/.test(selector)) incidental.push(selector);
    }
    expect(incidental, `border specificity must not depend on an incidental attribute:\n${incidental.join('\n')}`).toEqual([]);
  });
});

/** Comment-stripped copies -- keyframe/negative pins must not match prose in the header. */
const NC: Record<string, string> = Object.fromEntries(
  Object.entries(SKINS).map(([k, v]) => [k, v.replace(/\/\*[\s\S]*?\*\//g, '')]),
);

describe('fields skins -- per-component interaction + keyframe pins', () => {
  it('Switch modern: track hover keyed on data-checked + focus ring from the input :focus-visible', () => {
    expect(/\[data-checked='true'\]:hover:not\(\[data-disabled='true'\]\)[^{]*\[data-part='track'\]/.test(NC['modern/switch'])).toBe(true);
    expect(/input:focus-visible ~ \[data-part='track'\]/.test(NC['modern/switch'])).toBe(true);
  });

  it('Switch rustic: renames the spinner keyframe to ds-switch-spin and does not redefine the global spin', () => {
    expect(/@keyframes\s+ds-switch-spin\b/.test(NC['rustic/switch'])).toBe(true);
    expect(/@keyframes\s+spin\b/.test(NC['rustic/switch'])).toBe(false);
  });

  it('Radio: modern keys a :hover on the circle; rustic invents no hover (asymmetry preserved)', () => {
    expect(/:hover[^{]*\[data-part='circle'\]/.test(NC['modern/radio'])).toBe(true);
    expect(/:hover/.test(NC['rustic/radio'])).toBe(false);
  });

  it('Checkbox: modern keys a :hover on the box; rustic invents no hover', () => {
    expect(/:hover[^{]*\[data-part='box'\]/.test(NC['modern/checkbox'])).toBe(true);
    expect(/:hover/.test(NC['rustic/checkbox'])).toBe(false);
  });

  it('Slider: rustic paints a focus ring on the handle (via the focused class); modern draws none (asymmetry)', () => {
    expect(/\.rottay-slider--focused \[data-part='handle'\]/.test(NC['rustic/slider'])).toBe(true);
    expect(/:hover|:focus|:focus-within/.test(NC['modern/slider'])).toBe(false);
  });

  it('OTP modern: the focus border replaces the imperative writes and error is gated out', () => {
    expect(/\[data-part='slot'\]:focus:not\(\[data-error='true'\]\)/.test(NC['modern/otp-input'])).toBe(true);
  });

  it('Form: keyframes are engine-namespaced (ds-form-modern-* / ds-form-rustic-*), never the old rottay-form-*', () => {
    expect(/@keyframes\s+ds-form-modern-feedback-in\b/.test(NC['modern/form'])).toBe(true);
    expect(/@keyframes\s+ds-form-rustic-feedback-in\b/.test(NC['rustic/form'])).toBe(true);
    expect(/@keyframes\s+rottay-form-/.test(NC['modern/form'] + NC['rustic/form'])).toBe(false);
    expect(/@keyframes\s+spin\b/.test(NC['rustic/form'])).toBe(false);
  });

  it('VoiceInputButton: keyframes renamed ds-voice-input-button-*', () => {
    expect(/@keyframes\s+ds-voice-input-button-pulse\b/.test(NC['voice-input-button'])).toBe(true);
    expect(/@keyframes\s+ds-voice-input-button-spin\b/.test(NC['voice-input-button'])).toBe(true);
    expect(/voiceInputPulse|voiceInputSpin/.test(NC['voice-input-button'])).toBe(false);
  });

  it('Button.Icon: the removed hover/active state is a :hover/:active rule gated :not(:disabled)', () => {
    expect(/\[data-part='trigger'\]:hover:not\(:disabled\)/.test(NC['button-icon'])).toBe(true);
    expect(/\[data-part='trigger'\]:active:not\(:disabled\)/.test(NC['button-icon'])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// The DOM carries the data-part contract, not the paint. Representative subset,
// both engines: Radio, Checkbox, Switch, Slider, OTPInput, Button.Icon.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function firstPart(container: HTMLElement, part: string): Promise<HTMLElement> {
  await waitFor(() => expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull());
  return container.querySelector<HTMLElement>(`[data-part="${part}"]`)!;
}

function expectNoPaint(el: HTMLElement, label: string) {
  expect(el.style.background, `${label}: background inline`).toBe('');
  expect(el.style.backgroundColor, `${label}: background-color inline`).toBe('');
  expect(el.style.border, `${label}: border inline`).toBe('');
  expect(el.style.borderColor, `${label}: border-color inline`).toBe('');
  expect(el.style.color, `${label}: color inline`).toBe('');
  expect(el.style.boxShadow, `${label}: box-shadow inline`).toBe('');
  expect(el.style.outline, `${label}: outline inline`).toBe('');
}

describe.each(ENGINES)('fields DOM carries the contract, not the paint -- %s engine', (engine) => {
  it('Radio circle/dot/label paint nothing inline', async () => {
    const { container } = renderWithEngine(<Radio label="Pick" checked value="a" />, engine);
    expectNoPaint(await firstPart(container, 'circle'), `radio ${engine} circle`);
    expectNoPaint(await firstPart(container, 'dot'), `radio ${engine} dot`);
    expectNoPaint(await firstPart(container, 'label'), `radio ${engine} label`);
  });

  it('Checkbox box/label paint nothing inline', async () => {
    const { container } = renderWithEngine(<Checkbox label="Agree" checked />, engine);
    expectNoPaint(await firstPart(container, 'box'), `checkbox ${engine} box`);
    expectNoPaint(await firstPart(container, 'label'), `checkbox ${engine} label`);
  });

  it('Switch track/thumb/label paint nothing inline', async () => {
    const { container } = renderWithEngine(<Switch checked checkedChildren="On" />, engine);
    expectNoPaint(await firstPart(container, 'track'), `switch ${engine} track`);
    expectNoPaint(await firstPart(container, 'thumb'), `switch ${engine} thumb`);
  });

  it('Slider rail/track/handle paint nothing inline', async () => {
    const { container } = renderWithEngine(<Slider range defaultValue={[20, 60]} marks={{ 0: 'Lo', 100: 'Hi' }} />, engine);
    expectNoPaint(await firstPart(container, 'rail'), `slider ${engine} rail`);
    expectNoPaint(await firstPart(container, 'track'), `slider ${engine} track`);
    expectNoPaint(await firstPart(container, 'handle'), `slider ${engine} handle`);
  });

  it('OTPInput slots + error-message paint nothing inline', async () => {
    const { container } = renderWithEngine(<OTPInput length={4} error errorMessage="Bad code" />, engine);
    expectNoPaint(await firstPart(container, 'slot'), `otp ${engine} slot`);
    expectNoPaint(await firstPart(container, 'error-message'), `otp ${engine} error-message`);
  });

  it('Button.Icon trigger paints nothing inline (variant tokens ride a custom-property hatch)', async () => {
    const { container } = renderWithEngine(
      <Button.Icon icon={<span>x</span>} aria-label="Close" variant="primary" />,
      engine,
    );
    expectNoPaint(await firstPart(container, 'trigger'), `button-icon ${engine} trigger`);
  });
});
