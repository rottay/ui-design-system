import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { chromeToVariables } from '@/infrastructure/compilers/kernel/foundation/css/chrome-variables';
import { Card } from '..';
import ModernCard from '../engines/modern';
import { responsiveCss } from '@tests/support/responsive';

const modernSkinPath = join(
  __dirname,
  '../../../../../foundation/tokens/css/runtime/engines/modern/skin/card/index.css',
);
const cardTokensPath = join(
  __dirname,
  '../../../../../foundation/tokens/css/presentation/components/card/index.css',
);

describe('Card Pass 2 craft contract', () => {
  it('keeps nested actions independent from the actionable card', () => {
    const onCardClick = vi.fn();
    const onNestedClick = vi.fn();
    const { container } = render(
      <ModernCard onClick={onCardClick} title="Decision evidence">
        <button type="button" onClick={onNestedClick}>Open source</button>
      </ModernCard>,
    );

    const root = container.querySelector('.ds-card--modern') as HTMLElement;
    const nested = screen.getByRole('button', { name: 'Open source' });

    fireEvent.pointerDown(nested);
    fireEvent.click(nested);
    fireEvent.keyDown(nested, { key: 'Enter' });

    expect(onNestedClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('still activates from ordinary descendant content', () => {
    const onCardClick = vi.fn();
    render(
      <ModernCard onClick={onCardClick}>
        <span>Decision summary</span>
      </ModernCard>,
    );

    fireEvent.click(screen.getByText('Decision summary'));
    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it('normalizes physical media positions into logical RTL-safe anatomy', () => {
    const { container, rerender } = render(
      <ModernCard
        dir="rtl"
        cover="/portrait.webp"
        coverAlt="صورة المرشحة"
        coverPosition="left"
        title="ملخص القرار المهني الطويل الذي يجب أن يلتف من دون أن يكسر البطاقة"
      >
        أدلة موثقة من المقابلات والسيرة الذاتية.
      </ModernCard>,
    );

    let root = container.querySelector('.ds-card--modern') as HTMLElement;
    expect(root).toHaveAttribute('dir', 'rtl');
    expect(root).toHaveAttribute('data-cover-position', 'start');
    expect(root.firstElementChild).toHaveAttribute('data-part', 'cover');
    expect(screen.getByAltText('صورة المرشحة')).toBeInTheDocument();

    rerender(
      <ModernCard cover="/portrait.webp" coverAlt="Candidate portrait" coverPosition="right">
        Evidence
      </ModernCard>,
    );
    root = container.querySelector('.ds-card--modern') as HTMLElement;
    expect(root).toHaveAttribute('data-cover-position', 'end');
    expect(root.lastElementChild).toHaveAttribute('data-part', 'cover');
  });

  it('keeps image loading and error feedback localizable without baked copy', () => {
    const { container } = render(
      <Card.Image
        src="/missing.webp"
        alt="صورة المرشحة"
        loadingLabel="جارٍ تحميل الصورة"
        errorLabel="تعذر تحميل الصورة"
      />,
    );

    expect(screen.getByRole('status', { name: 'جارٍ تحميل الصورة' })).toBeInTheDocument();
    fireEvent.error(screen.getByAltText('صورة المرشحة'));
    expect(screen.getByRole('status', { name: 'تعذر تحميل الصورة' })).toBeInTheDocument();
    expect(container.querySelector('.ds-card-image')).toHaveAttribute('data-error', 'true');
  });

  it('keeps one DS anatomy locale-agnostic across tenant language and direction', async () => {
    const { container, rerender } = render(
      <section lang="en" dir="ltr">
        <Card
          engine="modern"
          title="Candidate ready for review"
          description="Verified evidence and next action"
          actions={[<button key="continue" type="button">Continue</button>]}
        />
      </section>,
    );

    // The engine factory lazy-loads the modern engine behind suspense; the
    // first assertion of each render awaits resolution so nothing settles
    // outside act().
    let localeRoot = container.querySelector('section') as HTMLElement;
    expect(localeRoot).toHaveAttribute('lang', 'en');
    expect(localeRoot).toHaveAttribute('dir', 'ltr');
    expect(await screen.findByText('Candidate ready for review')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Continue' })).toBeInTheDocument();

    rerender(
      <section lang="es" dir="ltr">
        <Card
          engine="modern"
          title="Candidata lista para revisión"
          description="Evidencia verificada y próxima acción"
          actions={[<button key="continue" type="button">Continuar</button>]}
        />
      </section>,
    );

    localeRoot = container.querySelector('section') as HTMLElement;
    expect(localeRoot).toHaveAttribute('lang', 'es');
    expect(await screen.findByText('Candidata lista para revisión')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Continuar' })).toBeInTheDocument();

    rerender(
      <section lang="ar" dir="rtl">
        <Card
          engine="modern"
          title="المرشحة جاهزة للمراجعة"
          description="أدلة موثقة والخطوة التالية"
          actions={[<button key="continue" type="button">متابعة</button>]}
        />
      </section>,
    );

    localeRoot = container.querySelector('section') as HTMLElement;
    expect(localeRoot).toHaveAttribute('lang', 'ar');
    expect(localeRoot).toHaveAttribute('dir', 'rtl');
    expect(await screen.findByText('المرشحة جاهزة للمراجعة')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'متابعة' })).toBeInTheDocument();
    expect(container.querySelector('.ds-card--modern')).toBeInTheDocument();
  });

  it('materially diverges BitHire and DB-backed The Management through the same compiler channels', () => {
    const bithire = chromeToVariables({
      cardComponent: {
        bg: '#FFFFFF',
        border: '#D4E0EA',
        radius: '12px',
        shadow: '0 1px 2px rgba(20, 40, 59, 0.06)',
        hoverTransform: 'translateY(-1px)',
        headerBg: 'linear-gradient(112deg, #EDF5FC, #FFFFFF)',
        titleFontSize: '13px',
        titleLetterSpacing: '-0.005em',
        coverAspectRatio: '16 / 9',
        coverObjectPosition: '50% 35%',
        transitionDuration: '160ms',
        texture: 'linear-gradient(90deg, transparent, #3A6FB00A)',
        textureOpacity: 0.06,
        surfaceGradient: 'linear-gradient(180deg, #FFFFFF, #F8FBFE)',
        stateOverlayHoverOpacity: 0.28,
        headerGap: '10px',
        bodyLineHeight: '1.5',
        skeletonDuration: '900ms',
      },
    });
    const theManagement = chromeToVariables({
      cardComponent: {
        bg: '#FFFEFB',
        border: '#9B8A73',
        radius: '6px',
        shadow: '0 8px 24px rgba(46, 38, 28, 0.12)',
        hoverTransform: 'translateY(-2px)',
        headerBg: 'linear-gradient(112deg, #FFFFFF, #FBF3E7)',
        titleFontSize: '15px',
        titleLetterSpacing: '0.01em',
        coverAspectRatio: '4 / 3',
        coverObjectPosition: '50% 20%',
        transitionDuration: '240ms',
        texture: 'radial-gradient(circle, #9B8A7312 1px, transparent 1px)',
        textureOpacity: 0.12,
        surfaceGradient: 'linear-gradient(180deg, #FFFEFB, #FBF3E7)',
        stateOverlayHoverOpacity: 0.52,
        headerGap: '14px',
        bodyLineHeight: '1.65',
        skeletonDuration: '1400ms',
      },
    });

    const requiredChannels = [
      '--ds-card-bg',
      '--ds-card-border',
      '--ds-card-radius',
      '--ds-card-shadow',
      '--ds-card-interactive-transform-hover',
      '--ds-card-header-bg',
      '--ds-card-title-font-size',
      '--ds-card-title-letter-spacing',
      '--ds-card-cover-aspect-ratio',
      '--ds-card-cover-object-position',
      '--ds-card-transition-duration',
      '--ds-card-texture',
      '--ds-card-texture-opacity',
      '--ds-card-surface-gradient',
      '--ds-card-state-overlay-hover-opacity',
      '--ds-card-header-gap',
      '--ds-card-body-line-height',
      '--ds-card-skeleton-duration',
    ] as const;

    for (const channel of requiredChannels) {
      expect(bithire[channel]).toBeDefined();
      expect(theManagement[channel]).toBeDefined();
      expect(bithire[channel]).not.toBe(theManagement[channel]);
    }
  });

  it('routes responsive padding through the visible Card anatomy', () => {
    const { container } = render(
      <ModernCard padding={{ xs: 'sm', lg: 'lg' }}>Responsive evidence</ModernCard>,
    );

    const style = responsiveCss(container);
    const body = container.querySelector('[data-part="body"]') as HTMLElement;
    const skin = readFileSync(modernSkinPath, 'utf-8');

    expect(style).toContain('--ds-card-instance-padding:');
    expect(style).toContain('@media (min-width: 1024px)');
    expect(body).not.toHaveAttribute('style');
    expect(skin).toContain('padding: var(--ds-card-instance-padding');
  });

  it('keeps variants, state precedence and accessibility modes in the skin', () => {
    const skin = readFileSync(modernSkinPath, 'utf-8');
    const tokens = readFileSync(cardTokensPath, 'utf-8');

    expect(skin).toContain("[data-variant='elevated']");
    expect(skin).toContain("[data-variant='outlined']");
    expect(skin).toContain("[data-variant='filled']");
    expect(skin).toContain("[data-variant='ghost']");
    expect(skin).toContain("[data-cover-position='start']");
    expect(skin).toContain("[data-cover-position='end']");
    expect(skin).toContain('@container ds-card (max-width: 28rem)');
    expect(skin).toContain('@media (prefers-reduced-motion: reduce)');
    expect(skin).toContain('@media (forced-colors: active)');
    expect(skin).toContain('--ds-card-state-overlay-hover-opacity');
    expect(skin).not.toContain('@keyframes ds-card-skeleton');
    expect(skin).not.toMatch(/\[data-part='skeleton/);
    expect(tokens).toContain('.ds-card.ds-card--modern::before');
    expect(tokens).not.toMatch(/(^|\n)\.ds-card::before/);
    expect(skin.lastIndexOf("[data-state~='disabled']")).toBeGreaterThan(
      skin.indexOf("[data-tone='primary']"),
    );
    expect(skin).not.toMatch(/border-(left|inline-start)\s*:/);
    expect(skin).not.toContain("[data-cover-position='left']");
    expect(skin).not.toContain("[data-cover-position='right']");
  });
});

describe('Card unavailable state under forced colors', () => {
  const skin = readFileSync(modernSkinPath, 'utf-8');
  const forcedColors = skin.slice(skin.indexOf('@media (forced-colors: active)'));

  // The disabled card carries its state in `opacity` plus a disabled ink
  // token, and forced colors honours neither -- the card read as fully live.
  it('re-expresses the unavailable card in the system inactive colour', () => {
    expect(forcedColors).toContain("[data-state~='disabled']");
    expect(forcedColors).toMatch(/\[data-state~='disabled'\][\s\S]{0,400}?GrayText/);
  });

  it('carries the inactive signal into the card title and description', () => {
    const rule = forcedColors.slice(forcedColors.indexOf("[data-state~='disabled']"));
    expect(rule).toContain("[data-part='title']");
    expect(rule).toContain("[data-part='description']");
  });

  it('places the unavailable rule after selection so a selected card still reads inactive', () => {
    expect(forcedColors.indexOf("[data-selected='true']")).toBeLessThan(
      forcedColors.indexOf("[data-state~='disabled']"),
    );
  });

  it('still stamps the hook the rule selects on', () => {
    const { container } = render(
      <ModernCard disabled onClick={vi.fn()} title="Archived">
        Body
      </ModernCard>,
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.getAttribute('data-state')).toContain('disabled');
    expect(root.querySelector('[data-part="title"]')).not.toBeNull();
  });
});

describe('Card keyboard focus under forced colors', () => {
  const skin = readFileSync(modernSkinPath, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
  const split = skin.indexOf('@media (forced-colors: active)');
  const rulesOf = (css: string) =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
      ([, selector, body]) => [(selector ?? '').replace(/\s+/g, ' ').trim(), body ?? ''] as const,
    );
  const weight = (selector: string) => (selector.match(/\.[\w-]+|\[[^\]]+\]/g) ?? []).length;
  const outlines = (css: string) =>
    rulesOf(css).filter(([selector, body]) => selector.startsWith('.ds-card') && /outline:/.test(body));

  const forced = outlines(skin.slice(split));
  const focusArm = forced.find(([selector]) => selector.includes("[data-state~='focus-visible']"));

  it('paints a system-colour outline no thinner than two pixels at the tenant offset', () => {
    expect(focusArm).toBeDefined();
    expect(focusArm?.[1]).toMatch(/outline:\s*max\(2px, var\(--ds-focus-ring-width\)\) solid Highlight;/);
    expect(focusArm?.[1]).toMatch(/outline-offset:\s*var\(--ds-focus-ring-offset\);/);
  });

  // A card that keeps its own colours (`forced-color-adjust: none`) keeps every
  // normal rule too, so the system arm must win the cascade on its own weight.
  it('outranks every other outline the skin states for the card root', () => {
    const arm = focusArm?.[0] ?? '';
    const rivals = [...outlines(skin.slice(0, split)), ...forced].filter(
      ([selector]) => selector !== arm && !selector.includes("[data-state~='disabled']"),
    );
    expect(rivals.length).toBeGreaterThan(0);
    for (const [selector] of rivals) expect(weight(arm), selector).toBeGreaterThanOrEqual(weight(selector));
    expect(forced[forced.length - 1]?.[0]).toBe(arm);
  });

  it('keeps the unavailable card out of the focus arm', () => {
    expect(focusArm?.[0]).toContain(":not([data-state~='disabled'])");
  });

  it('still stamps the hooks the arm selects on', () => {
    const { container } = render(
      <ModernCard onClick={vi.fn()} title="Open record">
        Body
      </ModernCard>,
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.getAttribute('data-actionable')).toBe('true');
    expect(root.tabIndex).toBe(0);
    fireEvent.keyDown(document.body, { key: 'Tab' });
    fireEvent.focus(root);
    expect(root.getAttribute('data-state') ?? '').toContain('focus');
  });
});

describe('Card keyboard focus wears the tenant focus signature', () => {
  const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
  const skin = strip(readFileSync(modernSkinPath, 'utf-8'));
  const tokens = strip(readFileSync(cardTokensPath, 'utf-8'));
  const personality = strip(
    readFileSync(join(__dirname, '../../../../../foundation/tokens/css/runtime/personality/index.css'), 'utf-8'),
  );
  const normal = skin.slice(0, skin.indexOf('@media (forced-colors: active)'));
  const FOCUS = "[data-actionable='true'][data-state~='focus-visible']";
  const ROOT = ".ds-card.ds-card--modern[data-part='root']";
  const clean = (selector: string) => selector.replace(/\s+/g, ' ').trim();

  /** Every style rule of `css`, with the conditions it sits under. */
  function rulesOf(css: string): { selector: string; body: string; conditions: string[] }[] {
    const found: { selector: string; body: string; conditions: string[] }[] = [];
    const walk = (text: string, conditions: string[]) => {
      let at = 0;
      while (at < text.length) {
        const open = text.indexOf('{', at);
        if (open < 0) return;
        let close = open + 1;
        for (let depth = 1; depth > 0; close += 1) {
          if (text[close] === '{') depth += 1;
          else if (text[close] === '}') depth -= 1;
        }
        const head = clean(text.slice(at, open));
        const inner = text.slice(open + 1, close - 1);
        if (head.startsWith('@media') || head.startsWith('@container')) walk(inner, [...conditions, head]);
        else if (!head.startsWith('@')) found.push({ selector: head, body: inner, conditions });
        at = close;
      }
    };
    walk(css, []);
    return found;
  }

  const rules = rulesOf(normal);
  const paintsRootShadow = (rule: { selector: string; body: string }) =>
    /(^|;|\s)box-shadow:/.test(rule.body) &&
    rule.selector.includes(ROOT) &&
    !/[\s>]|::/.test(rule.selector.slice(rule.selector.lastIndexOf(ROOT)));
  const shadowOf = (body: string) => clean(/box-shadow:([^;]*);/.exec(body)?.[1] ?? '');
  const focusRules = rules.filter((rule) => rule.selector.includes(FOCUS) && paintsRootShadow(rule));
  const restingRules = rules.filter(
    (rule) => !rule.selector.includes(FOCUS) && paintsRootShadow(rule) && !/(?<!:not\()\[data-state~='disabled'\]/.test(rule.selector),
  );

  it('states the signature first in every shadow a focused card paints', () => {
    expect(focusRules.length).toBeGreaterThan(0);
    for (const rule of focusRules) {
      expect(shadowOf(rule.body), rule.selector).toMatch(/^var\(--ds-card-focus-ring, var\(--ds-focus-ring\)\)(,|$)/);
      expect(rule.selector, rule.selector).toContain(":not([data-state~='disabled'])");
    }
  });

  it('mirrors every resting, hovered, pressed and selected shadow, in the same order', () => {
    const base = (selector: string) =>
      clean(selector).replace(FOCUS, '').replace(/:not\(\[data-state~='disabled'\]\)/g, '');
    const mirrored = [...new Set(focusRules.map((rule) => base(rule.selector)))];
    const resting = [...new Set(restingRules.map((rule) => base(rule.selector)))];
    expect(resting).toHaveLength(14);
    expect(mirrored).toEqual(resting);
  });

  it('composes a shadow only behind a guard on the channel that could void the list', () => {
    for (const rule of focusRules) {
      const shadow = shadowOf(rule.body);
      const guard = rule.conditions.find((condition) => condition.startsWith('@container not style('));
      if (shadow === 'var(--ds-card-focus-ring, var(--ds-focus-ring))') {
        expect(guard, rule.selector).toBeUndefined();
        continue;
      }
      const channel = /@container not style\((--ds-card-[a-z-]+): none\)/.exec(guard ?? '')?.[1];
      expect(channel, rule.selector).toBeDefined();
      expect(shadow, rule.selector).toContain(`var(${channel}`);
      expect(focusRules.some((other) => other.selector === rule.selector && other.conditions.every((c) => !c.startsWith('@container'))), rule.selector).toBe(true);
    }
  });

  it('paints no solid outline from the width and colour operands', () => {
    const outlines = rules.filter((rule) => rule.selector.includes(FOCUS) && /outline:/.test(rule.body));
    expect(outlines).toHaveLength(1);
    expect(outlines[0]?.body).toMatch(
      /outline:\s*var\(--ds-card-focus-ring-width, var\(--ds-focus-ring-width\)\) solid var\(--ds-card-focus-ring-color, var\(--ds-border-color-transparent\)\);/,
    );
    expect(outlines[0]?.body).toMatch(/outline-offset:\s*var\(--ds-card-focus-ring-offset\);/);
    expect(normal).not.toMatch(/outline:[^;]*var\(--ds-focus-ring-color/);
    expect(tokens).toMatch(/--ds-card-focus-ring-color:\s*transparent;/);
  });

  it('rests the family ring on the signature and keeps every authored hook painting', () => {
    expect(tokens).toMatch(/--ds-card-focus-ring:\s*var\(--ds-material-card-focus-ring, var\(--ds-focus-ring\)\);/);
    expect(tokens).toMatch(/--ds-card-focus-ring-width:\s*var\(--ds-focus-ring-width\);/);
    expect(tokens).toMatch(/--ds-card-focus-ring-offset:\s*var\(--ds-focus-ring-offset, 2px\);/);
    const authored = chromeToVariables({
      cardComponent: {
        focusRing: '0 0 0 3px #B4232F',
        focusRingColor: '#B4232F',
        focusRingWidth: '3px',
        focusRingOffset: '4px',
      },
    });
    expect(authored['--ds-card-focus-ring']).toBe('0 0 0 3px #B4232F');
    expect(authored['--ds-card-focus-ring-color']).toBe('#B4232F');
    expect(authored['--ds-card-focus-ring-width']).toBe('3px');
    expect(authored['--ds-card-focus-ring-offset']).toBe('4px');
    const unauthored = chromeToVariables({ cardComponent: { radius: '12px' } });
    for (const [hook, read] of [
      ['--ds-card-focus-ring', 'var(--ds-card-focus-ring, var(--ds-focus-ring))'],
      ['--ds-card-focus-ring-color', 'var(--ds-card-focus-ring-color, var(--ds-border-color-transparent))'],
      ['--ds-card-focus-ring-width', 'var(--ds-card-focus-ring-width, var(--ds-focus-ring-width))'],
      ['--ds-card-focus-ring-offset', 'var(--ds-card-focus-ring-offset)'],
    ] as const) {
      expect(unauthored[hook], hook).toBeUndefined();
      expect(normal, hook).toContain(read);
    }
  });

  // The personality layer sits after the engine layer: a card shadow stated
  // there for a Modern card would outrank every rule of this skin.
  it('keeps the personality layer off the Modern card root', () => {
    const cardRules = rulesOf(personality).filter((rule) => /\.ds-card(?![\w-])/.test(rule.selector));
    expect(cardRules.length).toBeGreaterThan(0);
    for (const rule of cardRules) {
      for (const arm of rule.selector.split(',').map(clean).filter((part) => /\.ds-card(?![\w-])/.test(part))) {
        expect(arm, arm).toContain('.ds-card:not(.ds-card--modern)');
      }
    }
  });

  // Selection that rested on the focus ring made a selected card look focused
  // and left keyboard focus nothing to add.
  it('never lets a selected card fall back to the focus ring', () => {
    const selected = restingRules.filter((rule) => rule.selector.includes("[data-selected='true']"));
    expect(selected).toHaveLength(2);
    for (const rule of selected) expect(shadowOf(rule.body), rule.selector).toBe('var(--ds-card-shadow-selected, var(--ds-material-card-shadow-selected))');
    for (const rule of focusRules.filter((rule) => rule.selector.includes("[data-selected='true']"))) {
      expect(shadowOf(rule.body).match(/--ds-card-focus-ring/g), rule.selector).toHaveLength(1);
    }
    expect(tokens).toMatch(/--ds-card-shadow-selected:\s*var\(--ds-material-card-shadow-selected\);/);
  });

  it('reads a personality hover transform before the family default', () => {
    expect(normal).toMatch(/transform:\s*var\(--ds-card-hover-transform, var\(--ds-card-interactive-transform-hover\)\);/);
  });
});
