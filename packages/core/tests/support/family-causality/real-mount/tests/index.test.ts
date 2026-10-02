/**
 * @fileoverview A step's selector must match exactly one element: an attribute,
 * style or input step on a multi-matching selector fails before it applies.
 */

import { beforeAll, describe, expect, it } from 'vitest';

import { bundleRealMount, measureRealMount, type RealMountScene, type RealMountStep } from '..';

const TIMEOUT = 120_000;
const MARKUP = '<div class="twin" id="first"></div><div class="twin" id="second"></div><div data-real-mount></div>';

const scene = (step: RealMountStep): RealMountScene => ({
  id: 'drill',
  markup: MARKUP,
  ready: '[data-drill-ready]',
  targets: [
    { id: 'attr', selector: '#first', property: '@attr.data-drill' },
    { id: 'inline', selector: '#first', property: '@inline.--drill' },
  ],
  steps: [step],
});

let bundle = '';
const measure = (step: RealMountStep) => measureRealMount({ vertical: 'bithire', bundle, scenes: [scene(step)] });

describe('real-mount step selector refusal', () => {
  beforeAll(async () => {
    bundle = await bundleRealMount({ module: 'tests/support/family-causality/real-mount/tests/fixture', props: '{}' });
  }, TIMEOUT);

  it('refuses a multi-matching attribute step', async () => {
    await expect(measure({ id: 'attr', selector: '.twin', attributes: { 'data-drill': 'on' } })).rejects.toThrow(
      'real-mount: step drill>attr matched 2 elements for .twin',
    );
  }, TIMEOUT);

  it('refuses a multi-matching style step', async () => {
    await expect(measure({ id: 'style', selector: '.twin', style: { '--drill': 'on' } })).rejects.toThrow(
      'real-mount: step drill>style matched 2 elements for .twin',
    );
  }, TIMEOUT);

  it('applies a single-matching attribute and style step', async () => {
    const readings = await measure({ id: 'both', selector: '#first', attributes: { 'data-drill': 'on' }, style: { '--drill': 'on' } });
    expect(readings.drill).toEqual({ attr: '<absent>', inline: '' });
    expect(readings['drill>both']).toEqual({ attr: 'on', inline: 'on' });
  }, TIMEOUT);
});
