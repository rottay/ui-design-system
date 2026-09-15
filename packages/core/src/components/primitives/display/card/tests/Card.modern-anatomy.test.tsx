/**
 * The Modern card's anatomy contract, executed: one `ds-card` namespace on the
 * engine tree and the four compounds, the interaction kernel deciding the
 * root's state once, the resolved posture stamped, the loading state a
 * reserved anatomy under the spinner scrim with no hand-made skeleton, nothing
 * painted inline but runtime channels, and a tree axe accepts in every material
 * and tone.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';

import ModernCard from '../engines/modern';
import { CardHeader, CardBody, CardFooter, CardImage } from '../compound';

const STRUCTURE_RULES = ['nested-interactive', 'aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-allowed-attr', 'button-name'];

async function violationIds(container: HTMLElement, values: string[]): Promise<string[]> {
  const results = await axe.run(container, { runOnly: { type: 'rule', values } });
  return results.violations.map((v) => v.id);
}

const root = (container: HTMLElement) => container.querySelector('.ds-card--modern[data-part="root"]') as HTMLElement;

function ownClasses(container: HTMLElement): string[] {
  const classes = new Set(Array.from(container.querySelectorAll('[class]')).flatMap((el) => Array.from(el.classList)));
  return [...classes].filter((token) => /(^|-)card(-|$)/.test(token));
}

describe('one namespace', () => {
  it('emits ds-card classes only, on the engine tree and on every compound', () => {
    const { container } = render(
      <ModernCard title="Namespace" description="One vocabulary" colorVariant="success" actions={[<button key="a" type="button">Act</button>]}>
        <CardHeader eyebrow="Eyebrow" icon={<span>i</span>} avatar={<span>A</span>} title="Compound" subtitle="Sub" extra={<span>x</span>} />
        <CardBody>Body</CardBody>
        <CardImage src="/a.jpg" alt="Alt" aspectRatio="16 / 9" objectFit="contain" radius="sm" gradient overlay={<span>o</span>} />
        <CardFooter actions={[<button key="b" type="button">B</button>]} />
      </ModernCard>,
    );
    const own = ownClasses(container);
    expect(own.length).toBeGreaterThan(0);
    expect(own.every((token) => token.startsWith('ds-card'))).toBe(true);
    expect(container.querySelector('[class*="rottay-card"]')).toBeNull();
    expect(root(container)).toHaveAttribute('data-variant', 'elevated');
    expect(root(container)).toHaveAttribute('data-tone', 'success');
  });

  it('maps the compounds inner anatomy as data-part, never as classes', () => {
    const { container } = render(
      <CardHeader eyebrow="Eyebrow" icon={<span>i</span>} avatar={<span>A</span>} title="Compound" subtitle="Sub" extra={<span>x</span>} />,
    );
    const header = container.querySelector('.ds-card-header') as HTMLElement;
    expect(header).toHaveAttribute('data-part', 'header');
    for (const part of ['content', 'icon', 'avatar', 'header-main', 'eyebrow', 'title', 'subtitle', 'extra']) {
      expect(header.querySelector(`[data-part="${part}"]`), part).not.toBeNull();
    }
    expect(header.querySelectorAll('[class]').length).toBe(0);
  });
});

describe('kernel state and posture', () => {
  it('stamps hover, press, focus and disabled on the root as data-state', () => {
    const { container, rerender } = render(<ModernCard onClick={vi.fn()}>Body</ModernCard>);
    const card = root(container);
    expect(card).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(card);
    expect(card.getAttribute('data-state')).toContain('hovered');
    fireEvent.pointerDown(card);
    expect(card.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(card);
    fireEvent.pointerLeave(card);
    fireEvent.focus(card);
    expect(card.getAttribute('data-state')).toContain('focused');
    rerender(<ModernCard onClick={vi.fn()} disabled>Body</ModernCard>);
    expect(root(container).getAttribute('data-state')).toContain('disabled');
    expect(root(container)).not.toHaveAttribute('data-disabled');
  });

  it('stamps the resolved posture on the root', () => {
    const { container } = render(<ModernCard>Body</ModernCard>);
    expect(root(container).getAttribute('data-posture')).toMatch(/^(phone|tablet|desktop)( (compact|regular|expanded))?$/);
  });

  it('paints nothing inline but the caller style and the responsive channel', () => {
    const { container } = render(
      <ModernCard title="T" padding={{ xs: 'sm', lg: 'lg' }} cover="/c.jpg" actions={[<button key="a" type="button">A</button>]}>
        <CardHeader title="H" icon={<span>i</span>} />
        <CardImage src="/i.jpg" alt="I" height={120} objectFit="cover" />
        <CardFooter actions={[<button key="b" type="button">B</button>]} />
      </ModernCard>,
    );
    for (const el of Array.from(container.querySelectorAll<HTMLElement>('[style]'))) {
      const declared = Array.from(el.style).filter((name) => !name.startsWith('--ds-') && !name.startsWith('--_ds-'));
      expect(declared, `${el.getAttribute('data-part')} paints ${declared.join(',')} inline`).toEqual([]);
    }
    const image = container.querySelector('.ds-card-image') as HTMLElement;
    expect(image.style.getPropertyValue('--ds-card-image-block-size')).toBe('120px');
    expect(image).toHaveAttribute('data-fit', 'cover');
    expect(image).toHaveAttribute('data-radius', 'inherit');
    expect(image).not.toHaveAttribute('data-sizing');
  });

  it('marks an aspect-ratio image as aspect sized and carries the ratio as a channel', () => {
    const { container } = render(<CardImage src="/i.jpg" alt="I" aspectRatio="4 / 3" />);
    const image = container.querySelector('.ds-card-image') as HTMLElement;
    expect(image).toHaveAttribute('data-sizing', 'aspect');
    expect(image.style.getPropertyValue('--ds-card-image-aspect-ratio')).toBe('4 / 3');
    expect(image.style.getPropertyValue('--ds-card-image-block-size')).toBe('');
  });
});

describe('loading', () => {
  it('reserves the anatomy under the spinner scrim and renders no hand-made skeleton', () => {
    const { container } = render(
      <ModernCard loading title="Loading" description="Soon" cover="/c.jpg" actions={[<button key="a" type="button">A</button>]}>
        Body
      </ModernCard>,
    );
    const card = root(container);
    expect(card).toHaveAttribute('data-loading', 'true');
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(card.getAttribute('data-state')).toContain('disabled');
    expect(card.querySelector('[data-part="cover"]')).not.toBeNull();
    expect(card.querySelector('[data-part="cover-image"]')).toBeNull();
    expect(card.querySelector('[data-part="loading-content"] > [data-part="loading-overlay"] > [data-part="spinner"]')).not.toBeNull();
    expect(card.querySelector('[data-part="body"]')).toBeNull();
    expect(container.querySelector('[data-part^="skeleton"]')).toBeNull();
    expect(Array.from(card.querySelectorAll('[style]'))).toEqual([]);
  });
});

describe('accessibility structure', () => {
  it('reports no structural violation across materials, tones and the actionable card', async () => {
    const { container } = render(
      <>
        <ModernCard title="Elevated" description="D" colorVariant="error">Body</ModernCard>
        <ModernCard variant="outlined" selectable selected onSelect={vi.fn()} aria-label="Selectable">Body</ModernCard>
        <ModernCard variant="ghost" disabled onClick={vi.fn()} title="Disabled">Body</ModernCard>
        <ModernCard variant="filled" title="Compound" colorVariant="success">
          <CardHeader eyebrow="E" title="H" subtitle="S" icon={<span>i</span>} />
          <CardFooter actions={[<button key="b" type="button">B</button>]} />
        </ModernCard>
      </>,
    );
    expect(await violationIds(container, STRUCTURE_RULES)).toEqual([]);
  });

  it('non-vacuity guard: a control nested in an actionable card trips the same rules', async () => {
    const { container } = render(
      <ModernCard onClick={vi.fn()} aria-label="Nested">
        <button type="button">Inner</button>
      </ModernCard>,
    );
    expect(await violationIds(container, STRUCTURE_RULES)).toContain('nested-interactive');
  });

  it('keeps an Arabic title as the accessible name of the actionable card', () => {
    render(
      <ModernCard onClick={vi.fn()} title="بطاقة المرشح">
        Body
      </ModernCard>,
    );
    expect(screen.getByRole('button', { name: /بطاقة المرشح/ })).toBeInTheDocument();
  });
});
