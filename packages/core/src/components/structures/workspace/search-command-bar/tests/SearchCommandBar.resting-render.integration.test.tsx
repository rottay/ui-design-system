/* Every pin below is the value the family painted before the rewire, so a wire
   that moves a pixel at rest fails here. */
import React from 'react';
import { Writable } from 'node:stream';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { prerenderToNodeStream } from 'react-dom/static';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { measureArms, type ProbeReadings } from '@tests/support/family-causality';

/** The voice hook's reading, flipped between renders so the lozenge mounts. */
const VOICE = {
  isSupported: false,
  status: 'unsupported' as 'unsupported' | 'listening',
};

vi.mock(
  '@/infrastructure/runtime/application/automation/voice/composition/react/input',
  () => ({
    useVoiceInput: () => ({
      isSupported: VOICE.isSupported,
      status: VOICE.status,
      permissionState: 'granted',
      transcriptPreview: '',
      errorMessage: null,
      requestPermission: async () => true,
      startListening: () => {},
      stopListening: () => {},
      cancelListening: () => {},
      resetVoiceFeedback: () => {},
    }),
  }),
);

const { SearchCommandBar } = await import('../index');

const noop = () => {};

const TENANT: TenantConfig = {
  slug: 'search-command-bar-resting',
  name: 'Search command bar resting',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Search command bar resting' },
};

const COMPONENT_SOURCE = readFileSync(
  resolve(process.cwd(), 'src/components/structures/workspace/search-command-bar/index.tsx'),
  'utf8',
);

async function serverMarkup(node: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      {node}
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((done, fail) => {
    prelude
      .pipe(
        new Writable({
          write(chunk, _encoding, next) {
            html += chunk.toString();
            next();
          },
        }),
      )
      .on('finish', () => done())
      .on('error', fail);
  });
  return html;
}

function bar(
  surfaceVariant: 'default' | 'embedded',
  layoutVariant: 'default' | 'editorial-tech',
): React.ReactElement {
  return (
    <SearchCommandBar
      command={{
        placeholder: 'Search',
        value: '',
        onSearch: noop,
        hint: 'Press / to focus',
        suggestions: [{ key: 'open', label: 'Open roles' }],
      }}
      actionsSlot={<button type="button">Views</button>}
      topRailSlot={<span>rail</span>}
      surfaceVariant={surfaceVariant}
      layoutVariant={layoutVariant}
      showCommandPalette={false}
    />
  );
}

/** The SSR markup of the editorial arm, kept for the two anatomy assertions. */
let editorialHtml = '';

/* The voice-help drawer opens on a client click and cannot be server rendered,
   so its subtree is mounted by hand in the anatomy the component states. */
const HELP = [
  `<div class="ds-search-command-bar__voice-help" data-part="voice-help" data-permission-blocked="false">`,
  `<div data-part="voice-help-copy"><span data-part="voice-help-title">Microphone</span>`,
  `<span class="ds-search-command-bar__voice-help-description" data-part="voice-help-description">Allow access.</span></div>`,
  `<ul class="ds-search-command-bar__voice-help-list" data-part="voice-help-list">`,
  `<li data-part="voice-help-step">One</li><li data-part="voice-help-step">Two</li></ul>`,
  `<div data-part="voice-help-footer">`,
  `<span class="ds-search-command-bar__voice-help-hint" data-part="voice-help-hint">Hint</span></div>`,
  `</div>`,
].join('');

const TARGETS = [
  // Rewired: the four corners now ride the radius dial.
  { id: 'shellCorner', selector: "#rest [data-part='search-shell']", property: 'border-top-left-radius' },
  { id: 'editorialShellCorner', selector: "#editorial [data-part='search-shell']", property: 'border-top-left-radius' },
  { id: 'helpCorner', selector: "#help [data-part='voice-help']", property: 'border-top-left-radius' },
  { id: 'badgeCorner', selector: "#voice [data-part='voice-badge']", property: 'border-top-left-radius' },
  // Rewired: type and rule roots, none of which carry a dial.
  { id: 'dividerSize', selector: "#editorial [data-part='divider']", property: 'height' },
  { id: 'badgeLabelWeight', selector: "#voice [data-part='voice-badge-label']", property: 'font-weight' },
  { id: 'labelTracking', selector: "#rest [data-part='suggestions-label']", property: 'letter-spacing' },
  { id: 'labelWeight', selector: "#rest [data-part='suggestions-label']", property: 'font-weight' },
  { id: 'helpDescLineHeight', selector: "#help [data-part='voice-help-description']", property: 'line-height' },
  // Controls: the physical-px geometry the rewire deliberately left alone.
  { id: 'rootPadTop', selector: "#rest [data-part='root']", property: 'padding-top' },
  { id: 'shellPad', selector: "#rest [data-part='search-shell']", property: 'padding-top' },
  { id: 'inputHeight', selector: '#rest .ds-search-command-bar__input', property: 'height' },
  { id: 'clusterGap', selector: "#rest [data-part='side-cluster']", property: 'column-gap' },
  { id: 'helpPad', selector: "#help [data-part='voice-help']", property: 'padding-top' },
] as const;

let readings: ProbeReadings;

beforeAll(async () => {
  VOICE.isSupported = false;
  VOICE.status = 'unsupported';
  const rest = await serverMarkup(bar('default', 'default'));
  const editorial = await serverMarkup(bar('embedded', 'editorial-tech'));
  editorialHtml = editorial;
  VOICE.isSupported = true;
  VOICE.status = 'listening';
  const voice = await serverMarkup(bar('default', 'default'));

  const markup = [
    `<div id="rest" style="inline-size:80rem">${rest}</div>`,
    `<div id="editorial" style="inline-size:80rem">${editorial}</div>`,
    `<div id="voice" style="inline-size:80rem">${voice}</div>`,
    `<div id="help" style="inline-size:80rem" class="ds-structure ds-search-command-bar">`,
    `<div class="ds-search-command-bar__search-shell" data-part="search-shell" data-voice-status="error">${HELP}</div></div>`,
  ].join('');

  readings = await measureArms({
    vertical: 'rottay',
    markup,
    arms: { base: {}, rounded: { 'shape.radius-scale': 1.2 } },
    targets: [...TARGETS],
  });
}, 120_000);

describe('search-command-bar rewired channels', () => {
  it('mounts the drawer in the anatomy the component states', () => {
    for (const part of [
      'voice-help',
      'voice-help-copy',
      'voice-help-description',
      'voice-help-list',
      'voice-help-step',
      'voice-help-footer',
      'voice-help-hint',
    ]) {
      expect(COMPONENT_SOURCE).toContain(`data-part="${part}"`);
    }
  });

  it('records why the two label-weight channels cannot paint', () => {
    /* The weight arrives inline from the primitive, so the skin rule that
       states the channel is outranked wherever it is written. */
    expect(editorialHtml).toContain('style="font-weight:var(--ds-type-caption-font-weight)"');
  });

  it('records that the editorial input rule has no node to match', () => {
    /* `data-editorial-tech` is forwarded to the Input's inner control while the
       family class lands on the field wrapper, so
       `.ds-search-command-bar__input[data-editorial-tech="true"]` selects
       nothing and the editorial block-size channel cannot paint. */
    expect(editorialHtml).toContain('class="ds-input-field ds-search-command-bar__input" data-part="field"');
    expect(editorialHtml).not.toContain('ds-search-command-bar__input" data-part="field" data-editorial-tech');
  });

  it('rests every rewired channel at the value it painted before the rewire', () => {
    expect(readings.base).toEqual({
      shellCorner: '15px',
      editorialShellCorner: '18px',
      helpCorner: '18px',
      badgeCorner: '9999px',
      dividerSize: '1px',
      /* Neither label weight reaches its glyph: the composed Text states
         `font-weight` inline, which no stylesheet rule can outrank. The pins
         record what the family paints, not what its channels say. */
      badgeLabelWeight: '400',
      labelTracking: '0.825px',
      labelWeight: '400',
      helpDescLineHeight: '16.875px',
      rootPadTop: '10px',
      shellPad: '6px',
      inputHeight: '42px',
      clusterGap: '18px',
      helpPad: '18px',
    });
  });

  it('gives the radius dial reach over the four corners it did not have', () => {
    for (const id of ['shellCorner', 'editorialShellCorner', 'helpCorner'] as const) {
      expect({ id, moved: readings.rounded[id] !== readings.base[id] }).toEqual({ id, moved: true });
    }
    /* The pill is already at the cap and the physical-px geometry holds: a
       radius decision may not reach anything but a corner. */
    for (const id of ['badgeCorner', 'dividerSize', 'shellPad', 'inputHeight', 'helpPad'] as const) {
      expect({ id, held: readings.rounded[id] === readings.base[id] }).toEqual({ id, held: true });
    }
  });
});
