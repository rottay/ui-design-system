/**
 * @fileoverview Does each component fixture still describe the component?
 *
 * `requiresSelectors` guards one direction only: it fails when the CSS a
 * fixture targets is renamed or dropped. Nothing guarded the other direction —
 * an engine changing its root anatomy leaves the fixture describing an element
 * nothing renders, and the probe keeps returning readings for it. That is the
 * defect that let `button-modern-md` sit on `.ds-btn` (a rustic rule no
 * component emits) while reporting confidently about "the modern button", and
 * it was wrong in only 4 of 276 readings, all in the one vertical that authors
 * control geometry. Silent staleness is the worse version: next time there
 * would be no 4-row tell.
 *
 * So: render the engine, compare it to the fixture, fail with the exact
 * divergence.
 *
 * WHAT IS COMPARED — the selectable shape, not the bytes. Two renders that a
 * selector cannot tell apart must not fail this test, or it becomes noise and
 * gets baselined away. Ignored: attribute order, class order, whitespace
 * between tags, `id` (React generates unstable ones), and `data-probe` (the
 * harness adds it; no component emits it). Compared: tag, class SET, every
 * other attribute and its value — `style` included, because an inline
 * declaration paints and the probe reads computed style off this element.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernCard from '@/ui/primitives/display/Card/engines/modern';
import ModernButton from '@/ui/primitives/inputs/Button/engines/modern';
import ModernInput from '@/ui/primitives/inputs/Input/engines/modern';
import ModernFlex from '@/ui/primitives/layout/Flex/engines/modern';
import ModernGrid from '@/ui/primitives/layout/Grid/engines/modern';
import ModernSpace from '@/ui/primitives/layout/Space/engines/modern';
import ModernStack from '@/ui/primitives/layout/Stack/engines/modern';

import { FIXTURES } from '../index.mjs';

/**
 * The render each component fixture claims to represent. A fixture is either
 * registered here or declares `synthetic: true`; the coverage test below fails
 * on anything that is neither, so a new component fixture cannot arrive
 * without drift cover.
 */
const COMPONENT_RENDERS: Readonly<Record<string, () => React.ReactElement>> = {
  'card-modern-md': () => (
    // `title` is not decoration: it is the only element that carries
    // [data-part='title'], and therefore the only place
    // --ds-letter-spacing-heading is painted. experience.profile's causal run
    // binds its title target to it.
    <ModernCard variant="elevated" size="md" padding="md" radius="md" title="Card title">
      card body
    </ModernCard>
  ),
  'button-modern-md': () => (
    <ModernButton variant="primary" size="md">
      button
    </ModernButton>
  ),
  'input-modern-md': () => <ModernInput size="md" defaultValue="input" />,
  'flex-modern-preset-gap': () => (
    <ModernFlex gap="md">
      <span>a</span>
      <span>b</span>
    </ModernFlex>
  ),
  'flex-modern-numeric-gap': () => (
    <ModernFlex gap={8}>
      <span>a</span>
      <span>b</span>
    </ModernFlex>
  ),
  'grid-modern-preset-gap': () => (
    <ModernGrid columns={2} gap="md">
      <div>a</div>
      <div>b</div>
    </ModernGrid>
  ),
  'grid-modern-numeric-gap': () => (
    <ModernGrid columns={2} gap={8}>
      <div>a</div>
      <div>b</div>
    </ModernGrid>
  ),
  'stack-modern-preset-gap': () => (
    <ModernStack spacing="md">
      <div>a</div>
      <div>b</div>
    </ModernStack>
  ),
  'stack-modern-numeric-gap': () => (
    <ModernStack spacing={8}>
      <div>a</div>
      <div>b</div>
    </ModernStack>
  ),
  'space-modern-preset-gap': () => (
    <ModernSpace size="md">
      <span>a</span>
      <span>b</span>
    </ModernSpace>
  ),
  'space-modern-numeric-gap': () => (
    <ModernSpace size={8}>
      <span>a</span>
      <span>b</span>
    </ModernSpace>
  ),
};

/** Attributes that differ between a render and a fixture for reasons no selector can see. */
const IGNORED_ATTRIBUTES = new Set(['id', 'data-probe']);

interface Shape {
  readonly tag: string;
  readonly classes: readonly string[];
  readonly attributes: ReadonlyArray<readonly [string, string]>;
  readonly text: string;
  readonly children: readonly Shape[];
}

function toShape(element: Element): Shape {
  const attributes = [...element.attributes]
    .filter((attr) => attr.name !== 'class' && !IGNORED_ATTRIBUTES.has(attr.name))
    .map((attr) => [attr.name, attr.value] as const)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return {
    tag: element.tagName.toLowerCase(),
    classes: (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).sort(),
    attributes,
    // Direct text only: descendant text belongs to the descendant's shape.
    text: [...element.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent ?? '')
      .join('')
      .replace(/\s+/g, ' ')
      .trim(),
    children: [...element.children].map(toShape),
  };
}

function parse(html: string): Shape {
  const host = document.createElement('div');
  host.innerHTML = html;
  const root = host.firstElementChild;
  if (!root) throw new Error(`no element parsed from: ${html.slice(0, 80)}`);
  return toShape(root);
}

/**
 * Every way these two shapes differ, each naming the path where it happens.
 * A message that says only "mismatch" costs the next reader an hour, so each
 * line states the location, the property, and both sides.
 */
function differences(fixture: Shape, rendered: Shape, path = 'root'): string[] {
  const found: string[] = [];

  if (fixture.tag !== rendered.tag) {
    found.push(`${path}: tag — fixture <${fixture.tag}>, component <${rendered.tag}>`);
    // Different elements entirely; comparing their insides would be noise.
    return found;
  }

  const missing = rendered.classes.filter((c) => !fixture.classes.includes(c));
  const extra = fixture.classes.filter((c) => !rendered.classes.includes(c));
  if (missing.length > 0 || extra.length > 0) {
    found.push(
      `${path}: classes — ${
        missing.length > 0 ? `component adds [${missing.join(', ')}]` : ''
      }${missing.length > 0 && extra.length > 0 ? '; ' : ''}${
        extra.length > 0 ? `fixture has stale [${extra.join(', ')}]` : ''
      }`
    );
  }

  const fixtureAttrs = new Map(fixture.attributes);
  const renderedAttrs = new Map(rendered.attributes);
  for (const [name, value] of renderedAttrs) {
    if (!fixtureAttrs.has(name)) {
      found.push(`${path}: attribute ${name} — absent from fixture, component renders "${value}"`);
    } else if (fixtureAttrs.get(name) !== value) {
      found.push(
        `${path}: attribute ${name} — fixture "${fixtureAttrs.get(name)}", component "${value}"`
      );
    }
  }
  for (const [name, value] of fixtureAttrs) {
    if (!renderedAttrs.has(name)) {
      found.push(`${path}: attribute ${name}="${value}" — stale, component renders none`);
    }
  }

  if (fixture.text !== rendered.text) {
    found.push(`${path}: text — fixture "${fixture.text}", component "${rendered.text}"`);
  }

  if (fixture.children.length !== rendered.children.length) {
    found.push(
      `${path}: child count — fixture ${fixture.children.length}, component ${rendered.children.length}`
    );
  }
  const shared = Math.min(fixture.children.length, rendered.children.length);
  for (let index = 0; index < shared; index += 1) {
    found.push(
      ...differences(
        fixture.children[index]!,
        rendered.children[index]!,
        `${path} > ${rendered.children[index]!.tag}[${index}]`
      )
    );
  }

  return found;
}

function driftReport(id: string, fixtureHtml: string, rendered: string): string[] {
  return differences(parse(fixtureHtml), parse(rendered));
}

describe('component fixtures still describe their components', () => {
  it('covers every non-synthetic fixture', () => {
    const uncovered = FIXTURES.filter(
      (fixture) => !fixture.synthetic && !(fixture.id in COMPONENT_RENDERS)
    ).map((fixture) => fixture.id);

    expect(
      uncovered,
      `fixture(s) with no render registered and no "synthetic": true — a component fixture ` +
        `without drift cover is how the .ds-btn defect survived: ${uncovered.join(', ')}`
    ).toEqual([]);
  });

  for (const [id, render] of Object.entries(COMPONENT_RENDERS)) {
    it(`${id} matches its engine`, () => {
      const fixture = FIXTURES.find((entry) => entry.id === id);
      expect(fixture, `roster has no fixture "${id}"`).toBeDefined();

      const drift = driftReport(id, fixture!.html, renderToStaticMarkup(render()));

      expect(
        drift,
        `${id} no longer describes what the engine renders:\n  ${drift.join(
          '\n  '
        )}\n\nRegenerate: render the engine with renderToStaticMarkup, drop React-generated ` +
          `ids, re-add data-probe, and paste into fixtures.json.`
      ).toEqual([]);
    });
  }

  /**
   * THE POSITIVE CONTROL. A comparator that returns "no differences" for
   * everything passes every fixture forever, which is precisely the failure
   * this test exists to end — and a false zero from a silent parser is how a
   * sibling lane's sweep reported a clean corpus tonight. Each mutation below
   * is a drift shape that has actually occurred or plausibly will; each must be
   * both CAUGHT and NAMED, so a mutation that only trips the count check is not
   * enough.
   */
  describe('the comparator detects drift (positive control)', () => {
    const base =
      '<button class="rottay-button rottay-button--modern" data-part="trigger" data-size="md">' +
      '<span data-part="content">go</span></button>';

    const mutations: ReadonlyArray<readonly [string, string, RegExp]> = [
      [
        'a dropped engine class — the .ds-btn shape exactly',
        '<button class="rottay-button" data-part="trigger" data-size="md">' +
          '<span data-part="content">go</span></button>',
        /classes.*rottay-button--modern/,
      ],
      [
        'a renamed anatomy part',
        '<button class="rottay-button rottay-button--modern" data-part="root" data-size="md">' +
          '<span data-part="content">go</span></button>',
        /attribute data-part.*"root".*"trigger"/,
      ],
      [
        'a dropped attribute the size rules key on',
        '<button class="rottay-button rottay-button--modern" data-part="trigger">' +
          '<span data-part="content">go</span></button>',
        /attribute data-size.*absent from fixture/,
      ],
      [
        'a changed tag',
        '<a class="rottay-button rottay-button--modern" data-part="trigger" data-size="md">' +
          '<span data-part="content">go</span></a>',
        /tag.*<a>.*<button>/,
      ],
      [
        'a missing child element',
        '<button class="rottay-button rottay-button--modern" data-part="trigger" data-size="md"></button>',
        /child count/,
      ],
      [
        'drift in a descendant, not the root',
        '<button class="rottay-button rottay-button--modern" data-part="trigger" data-size="md">' +
          '<span data-part="busy-content">go</span></button>',
        /root > span\[0\].*data-part/,
      ],
    ];

    for (const [name, mutated, expected] of mutations) {
      it(`catches ${name}`, () => {
        const drift = driftReport('control', mutated, base);
        expect(drift.length, `mutation went undetected: ${name}`).toBeGreaterThan(0);
        expect(
          drift.join('\n'),
          `detected, but the message does not name the drift: ${drift.join('; ')}`
        ).toMatch(expected);
      });
    }

    it('reports nothing when the shape only differs cosmetically', () => {
      const reordered =
        '<button data-size="md" data-part="trigger" class="rottay-button--modern rottay-button" id="_R_7_">\n' +
        '  <span data-part="content">go</span>\n' +
        '</button>';
      expect(driftReport('control', reordered, base)).toEqual([]);
    });
  });
});
