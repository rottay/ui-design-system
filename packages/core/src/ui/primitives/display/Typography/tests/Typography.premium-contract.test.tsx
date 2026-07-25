import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ModernHeading, ModernLink, ModernParagraph, ModernText } from '../engines/modern';
import { ClassicHeading } from '../engines/classic';

const typographyCss = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/foundation/base/typography.css'),
  'utf8',
);
const modernTypographyCss = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/typography.css'),
  'utf8',
);

describe('Typography premium contract — pass 1 semantics and resilience', () => {
  it('keeps semantic HTML independent from the visual type style', () => {
    render(
      <ModernHeading level="h3" textStyle="display">
        Decision evidence
      </ModernHeading>,
    );

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.tagName).toBe('H3');
    expect(heading).toHaveAttribute('data-text-style', 'display');
    expect(heading.getAttribute('style')).toContain('--ds-type-display-font-family');
  });

  it('preserves h6 semantics in the classic engine despite Ant Design supporting only five title levels', () => {
    render(<ClassicHeading level="h6">Supporting section</ClassicHeading>);

    expect(screen.getByRole('heading', { level: 6 }).tagName).toBe('H6');
  });

  it('forwards locale metadata and uses logical alignment in RTL', () => {
    render(
      <ModernParagraph lang="ar" dir="rtl" align="start" hyphenate>
        القرار التالي جاهز للمراجعة
      </ModernParagraph>,
    );

    const paragraph = screen.getByText('القرار التالي جاهز للمراجعة');
    expect(paragraph).toHaveAttribute('lang', 'ar');
    expect(paragraph).toHaveAttribute('dir', 'rtl');
    expect(paragraph).toHaveStyle({ textAlign: 'start', hyphens: 'auto' });
  });

  it('supports meaningful inline elements and native label association', () => {
    render(
      <ModernText as="label" htmlFor="candidate-search" textStyle="label">
        Candidate search
      </ModernText>,
    );

    const label = screen.getByText('Candidate search');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'candidate-search');
  });

  it('clamps deterministically and exposes the full copy through title', () => {
    render(
      <ModernParagraph lineClamp={2.8} title="Complete localized description">
        A localized description that may need more than two lines in a narrow surface.
      </ModernParagraph>,
    );

    const paragraph = screen.getByTitle('Complete localized description');
    expect(paragraph).toHaveAttribute('data-line-clamp', '2');
    expect(paragraph.getAttribute('style')).toContain('--ds-type-line-clamp: 2');
    expect(modernTypographyCss).toContain('-webkit-line-clamp: var(--ds-type-line-clamp');
    expect(paragraph.style.overflow).toBe('hidden');
  });

  it('keeps long user-authored values inside their available width', () => {
    render(
      <ModernText>candidate-with-a-very-long-unbroken-identifier@example.enterprise</ModernText>,
    );

    expect(screen.getByText(/candidate-with/)).toHaveStyle({ overflowWrap: 'anywhere' });
  });

  it('keeps the legacy default size until a semantic role is selected explicitly', () => {
    render(
      <>
        <ModernText>Legacy default</ModernText>
        <ModernText textStyle="body">Semantic body</ModernText>
      </>,
    );

    expect(screen.getByText('Legacy default')).not.toHaveAttribute('data-text-style');
    expect(screen.getByText('Legacy default')).toHaveAttribute('data-size', 'md');
    expect(screen.getByText('Semantic body')).toHaveAttribute(
      'data-text-style',
      'body',
    );
    expect(screen.getByText('Semantic body').getAttribute('style')).toContain(
      '--ds-type-body-font-size',
    );
  });

  it('makes a disabled link non-navigable and correctly announced', () => {
    render(
      <ModernLink href="https://example.com" target="_blank" disabled>
        External profile
      </ModernLink>,
    );

    const link = screen.getByText('External profile');
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('Typography premium contract — pass 2 tokenized craft', () => {
  it('resolves family, leading, tracking and contrast through public tokens', () => {
    render(
      <ModernText
        family="display"
        leading="snug"
        tracking="tight"
        contrast="strong"
      >
        Premium hierarchy
      </ModernText>,
    );

    const text = screen.getByText('Premium hierarchy');
    const inlineStyle = text.getAttribute('style') ?? '';
    expect(inlineStyle).toContain('--ds-font-family-display');
    expect(inlineStyle).toContain('--ds-line-height-snug');
    expect(inlineStyle).toContain('--ds-letter-spacing-tight');
    expect(text).toHaveAttribute('data-contrast', 'strong');
    expect(modernTypographyCss).toContain('--ds-type-color-strong');
  });

  it('uses bounded fluid tokens without introducing a tenant-specific value', () => {
    render(
      <ModernHeading level="h1" size="3xl" fluid>
        Fluid display
      </ModernHeading>,
    );

    expect(screen.getByRole('heading')).toHaveAttribute('data-fluid', 'true');
    expect(screen.getByRole('heading')).toHaveAttribute('data-size', '3xl');
    expect(modernTypographyCss).toContain('--ds-font-size-fluid-5xl');
  });

  it('marks opt-in motion while static typography remains motion-free', () => {
    render(
      <>
        <ModernHeading motion="enter">Animated once</ModernHeading>
        <ModernText>Static by default</ModernText>
      </>,
    );

    expect(screen.getByText('Animated once')).toHaveAttribute('data-motion', 'enter');
    expect(screen.getByText('Static by default')).not.toHaveAttribute('data-motion');
  });

  it('preserves identical component markup across tenant token overrides', () => {
    const Specimen = () => (
      <article>
        <ModernHeading level="h2" textStyle="pageTitle">Candidate evidence</ModernHeading>
        <ModernParagraph textStyle="body" contrast="muted">Ready to decide</ModernParagraph>
        <ModernText textStyle="numeric" numeric="tabular">92.4%</ModernText>
      </article>
    );

    const { container } = render(
      <>
        <section data-testid="tenant-a" style={{ '--ds-font-family-heading': 'Inter' } as React.CSSProperties}>
          <Specimen />
        </section>
        <section data-testid="tenant-b" style={{ '--ds-font-family-heading': 'Georgia' } as React.CSSProperties}>
          <Specimen />
        </section>
      </>,
    );

    const [tenantA, tenantB] = Array.from(container.querySelectorAll('section'));
    expect(tenantA?.firstElementChild?.outerHTML).toBe(tenantB?.firstElementChild?.outerHTML);
  });

  it('lets explicit consumer style win without removing the token contract', () => {
    render(
      <ModernText textStyle="caption" style={{ letterSpacing: '0.2em' }}>
        Override point
      </ModernText>,
    );

    const text = screen.getByText('Override point');
    expect(text).toHaveStyle({ letterSpacing: '0.2em' });
    expect(text).toHaveAttribute('data-text-style', 'caption');
  });

  it('ships reduced-motion-safe craft and public customization channels', () => {
    expect(typographyCss).toContain('--ds-type-optical-sizing');
    expect(typographyCss).toContain('--ds-type-color-strong');
    expect(typographyCss).toContain('--ds-type-decoration-thickness');
    expect(typographyCss).toContain('"Noto Sans Arabic"');
    expect(typographyCss).toContain('@keyframes ds-typography-enter');

    const reducedMotion = typographyCss.slice(
      typographyCss.indexOf('@media (prefers-reduced-motion: reduce)'),
    );
    expect(reducedMotion).toContain('animation: none !important');
    expect(reducedMotion).toContain('transition-duration: 0.01ms !important');
  });
});
