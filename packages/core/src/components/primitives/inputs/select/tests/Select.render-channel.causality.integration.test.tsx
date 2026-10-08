/**
 * The render channel in a real browser: custom content keeps the tenant cascade (every decision
 * moves the same readings with and without the hooks), carries its own content paint, audits
 * clean, and keeps a foreign label's direction off the row chrome.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernSelect from '../engines/modern';
import type { SelectOption, SelectOptionRenderState, SelectProps, SelectValueRenderState } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  measureArms,
  seriousFindings,
  type ProbeDecisions,
  type ProbeTarget,
} from '@tests/support/family-causality';

const OPTIONS: SelectOption[] = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
  { value: 'alan', label: 'Alan Turing', disabled: true },
  { value: 'ar', label: 'العربية', lang: 'ar' },
];

const content = (option: SelectOption, state: SelectOptionRenderState | SelectValueRenderState) => (
  <span data-pattern="probe">
    <span aria-hidden="true" data-part="glyph">*</span>
    <span data-probe="text" {...state.labelProps}>{option.label}</span>
  </span>
);
const CHANNEL: Partial<SelectProps> = {
  renderOption: (option, _d, state) => content(option, state),
  renderValue: (option, _d, state) => content(option, state),
};

afterEach(() => cleanup());

/** The open panel as the browser receives it: the portal subtree, its ids prefixed per fixture. */
function openPanel(fixture: string, ui: React.ReactElement, keys: readonly string[] = []): string {
  const view = render(ui);
  const trigger = view.getByRole('combobox');
  fireEvent.click(trigger);
  for (const key of keys) fireEvent.keyDown(trigger, { key });
  const dropdown = document.querySelector('.ds-select-shell__dropdown')!;
  const portal = dropdown.closest('body > *')!;
  const rootHtml = view.container.innerHTML;
  let html = `${rootHtml}${portal.outerHTML}`;
  const ids = [...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]!))].sort((a, b) => b.length - a.length);
  for (const id of ids) html = html.split(id).join(`${fixture}-${id.replace(/[^\w-]/g, '')}`);
  view.unmount();
  return html;
}

describe('the render channel keeps the tenant cascade (T-12)', () => {
  const closed = (props: Partial<SelectProps>) =>
    renderToStaticMarkup(<ModernSelect options={OPTIONS} defaultValue="ada" forceCustomDropdown aria-label="Owner" {...props} />);
  const panel = (fixture: string, props: Partial<SelectProps>) =>
    openPanel(fixture, <ModernSelect options={OPTIONS} defaultValue="ada" forceCustomDropdown aria-label="Owner" {...props} />, ['ArrowDown']);

  const markup = [
    `<div id="d">${closed({})}</div>`,
    `<div id="r">${closed(CHANNEL)}</div>`,
    `<div id="dp">${panel('dp', {})}</div>`,
    `<div id="rp">${panel('rp', CHANNEL)}</div>`,
  ].join('');

  const side = (s: 'd' | 'r', text: string): ProbeTarget[] => {
    const own = s === 'd' ? '' : " [data-probe='text']";
    const active = `#${s}p .ds-select-shell__dropdown [data-part='option'][data-active='true']`;
    return [
      { id: `${s}.triggerHeight`, selector: `#${s} [data-part='trigger']`, property: '@rect.height' },
      { id: `${s}.triggerRadius`, selector: `#${s} [data-part='trigger']`, property: 'border-top-left-radius' },
      { id: `${s}.triggerFont`, selector: `#${s} [data-part='trigger']`, property: 'font-size' },
      { id: `${s}.valueFont`, selector: `#${s} [data-part='value']${own}`, property: 'font-size' },
      { id: `${s}.valueColor`, selector: `#${s} [data-part='value']${own}`, property: 'color' },
      { id: `${s}.activeBg`, selector: active, property: 'background-color' },
      { id: `${s}.selectedBorder`, selector: `#${s}p [data-part='option'][data-selected='true']`, property: 'border-top-color' },
      { id: `${s}.checkColor`, selector: `#${s}p [data-part='option-check']`, property: 'color' },
      { id: `${s}.contentFont`, selector: `${active} ${text}`, property: 'font-size' },
      { id: `${s}.contentColor`, selector: `${active} ${text}`, property: 'color' },
    ];
  };
  const targets: ProbeTarget[] = [
    ...side('d', "[data-part='option-label']"),
    ...side('r', "[data-probe='text']"),
    { id: 'glyphWidth', selector: "#rp [data-part='option'][data-active='true'] [data-part='glyph']", property: '@rect.width' },
    { id: 'glyphRadius', selector: "#rp [data-part='option'][data-active='true'] [data-part='glyph']", property: 'border-top-left-radius' },
  ];

  const DECISIONS: Readonly<Record<string, unknown>> = {
    'palette.seeds': { primary: '#2F6B9A' },
    'typography.scale': 1.08,
    'shape.radius-scale': 1.2,
    'shape.control-height': 'tall',
    'density.mode': 'spacious',
    'states.emphasis': 'subtle',
  };
  const arms: Record<string, ProbeDecisions> = {
    base: {},
    ...Object.fromEntries(Object.entries(DECISIONS).map(([id, value]) => [id, { [id]: value }])),
  };
  const moved = (readings: Record<string, Record<string, string>>, arm: string, s: 'd' | 'r') =>
    Object.keys(readings.base!)
      .filter((key) => key.startsWith(`${s}.`) && readings[arm]![key] !== readings.base![key])
      .map((key) => key.slice(2))
      .sort();

  it('moves the same readings with and without the hooks, for every decision in every vertical', async () => {
    const report: Record<string, Record<string, string[]>> = {};
    for (const vertical of VERTICALS) {
      const readings = await measureArms({ vertical, markup, arms, targets });
      for (const [key, value] of Object.entries(readings.base!)) expect(value, `${vertical} ${key}`).not.toMatch(/^<no match/);
      report[vertical] = {};
      for (const decision of Object.keys(DECISIONS)) {
        const onDefault = moved(readings, decision, 'd');
        expect(moved(readings, decision, 'r'), `${vertical} ${decision}`).toEqual(onDefault);
        report[vertical]![decision] = onDefault;
      }
      // Tenant paint reaches the hook's content, and the hook's own static content holds.
      expect(readings['typography.scale']!['r.contentFont'], `${vertical} content font`).not.toBe(readings.base!['r.contentFont']);
      expect(readings['typography.scale']!['r.triggerRadius'], `${vertical} radius control`).toBe(readings.base!['r.triggerRadius']);
      expect(readings['shape.radius-scale']!['r.triggerRadius'], `${vertical} radius moves`).not.toBe(readings.base!['r.triggerRadius']);
      expect(readings['palette.seeds']!['r.activeBg'], `${vertical} active row around content`).not.toBe(readings.base!['r.activeBg']);
      expect(readings['palette.seeds']!['r.contentFont'], `${vertical} content font control`).toBe(readings.base!['r.contentFont']);
      expect(readings['shape.radius-scale']!.glyphWidth, `${vertical} glyph`).toBe(readings.base!.glyphWidth);
      expect(readings['shape.radius-scale']!.glyphRadius, `${vertical} glyph radius`).toBe(readings.base!.glyphRadius);
    }
    console.info(`render-channel moved sets ${JSON.stringify(report)}`);
  }, 240_000);
});

describe('the render channel audits clean (T-13) and the gate sees a nested control (T-9)', () => {
  const gallery = (renderOption: SelectProps['renderOption']) =>
    openPanel(
      'ax',
      <ModernSelect
        options={OPTIONS}
        defaultValue="ada"
        forceCustomDropdown
        aria-label="Owner"
        listboxLabel="People"
        renderOption={renderOption}
        renderValue={CHANNEL.renderValue}
      />,
      ['ArrowDown'],
    );

  it('has no serious finding with selected, active, disabled and Arabic custom rows', async () => {
    const markup = gallery(CHANNEL.renderOption);
    expect(markup).toContain('aria-label="People"');
    expect(markup).toContain('lang="ar"');
    expect(markup).toContain('aria-disabled="true"');
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(axeDebt(findings), `${scope.vertical} ${scope.theme}`).toEqual({});
    }
  }, 180_000);

  it('reports nested-interactive when a hook returns a control (negative control)', async () => {
    const markup = gallery((option) => <button type="button">{option.label as string}</button>);
    const findings = await auditAxe({ vertical: 'bithire', theme: 'light', markup });
    expect(findings.map((finding) => finding.id)).toContain('nested-interactive');
  }, 60_000);
});

describe('a foreign label keeps its own direction while the row follows the page (T-14)', () => {
  const LANGS: SelectOption[] = [
    { value: 'en', label: 'English', lang: 'en' },
    { value: 'ar', label: 'العربية', lang: 'ar' },
  ];

  it('reads rtl text in an ltr row and ltr text in an rtl row, with the check at the inline end', async () => {
    const ltr = openPanel('l', <ModernSelect options={LANGS} defaultValue="ar" forceCustomDropdown aria-label="Language" />);
    const rtl = openPanel(
      'r',
      <div dir="rtl">
        <ModernSelect options={LANGS} defaultValue="en" forceCustomDropdown aria-label="Language" />
      </div>,
    );
    const selected = "[data-part='option'][data-selected='true']";
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="ltr">${ltr}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'label', selector: `${selected} [data-part='option-label']`, property: 'direction' },
        { id: 'row', selector: selected, property: 'direction' },
        { id: 'labelLeft', selector: `${selected} [data-part='option-label']`, property: '@rect.left' },
        { id: 'checkLeft', selector: `${selected} [data-part='option-check']`, property: '@rect.left' },
      ],
    });
    const mirrored = await measureArms({
      vertical: 'bithire',
      markup: `<div id="rtl">${rtl}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'label', selector: `${selected} [data-part='option-label']`, property: 'direction', dir: 'rtl' },
        { id: 'row', selector: selected, property: 'direction', dir: 'rtl' },
        { id: 'labelLeft', selector: `${selected} [data-part='option-label']`, property: '@rect.left', dir: 'rtl' },
        { id: 'checkLeft', selector: `${selected} [data-part='option-check']`, property: '@rect.left', dir: 'rtl' },
      ],
    });
    const l = result.base!;
    expect([l.label, l.row]).toEqual(['rtl', 'ltr']);
    expect(Number(l.checkLeft)).toBeGreaterThan(Number(l.labelLeft));
    const r = mirrored.base!;
    expect([r.label, r.row]).toEqual(['ltr', 'rtl']);
    expect(Number(r.checkLeft)).toBeLessThan(Number(r.labelLeft));
  }, 120_000);
});
