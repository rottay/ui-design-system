import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { chromeToVariables } from '@/infrastructure/compilers/kernel/foundation/css/chrome-variables';
import { Card } from '..';
import ModernCard from '../engines/modern';

const modernSkinPath = join(
  __dirname,
  '../../../../../foundation/tokens/css/runtime/engines/modern/skin/card.css',
);
const cardTokensPath = join(
  __dirname,
  '../../../../../foundation/tokens/css/presentation/components/card.css',
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
    expect(container.querySelector('.rottay-card-image')).toHaveAttribute('data-error', 'true');
  });

  it('keeps one DS anatomy locale-agnostic across tenant language and direction', () => {
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

    let localeRoot = container.querySelector('section') as HTMLElement;
    expect(localeRoot).toHaveAttribute('lang', 'en');
    expect(localeRoot).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('Candidate ready for review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();

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
    expect(screen.getByText('Candidata lista para revisión')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();

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
    expect(screen.getByText('المرشحة جاهزة للمراجعة')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'متابعة' })).toBeInTheDocument();
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

    const style = container.querySelector('style')?.textContent ?? '';
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
    expect(skin).toContain('@container (max-width: 28rem)');
    expect(skin).toContain('@media (prefers-reduced-motion: reduce)');
    expect(skin).toContain('@media (forced-colors: active)');
    expect(skin).toContain('--ds-card-state-overlay-hover-opacity');
    expect(skin).toContain('@keyframes ds-card-skeleton-sweep');
    expect(tokens).toContain('.ds-card.ds-card--modern::before');
    expect(tokens).not.toMatch(/(^|\n)\.ds-card::before/);
    expect(skin.lastIndexOf("[data-disabled='true']")).toBeGreaterThan(
      skin.indexOf("[data-tone='primary']"),
    );
    expect(skin).not.toMatch(/border-(left|inline-start)\s*:/);
    expect(skin).not.toContain("[data-cover-position='left']");
    expect(skin).not.toContain("[data-cover-position='right']");
  });
});
