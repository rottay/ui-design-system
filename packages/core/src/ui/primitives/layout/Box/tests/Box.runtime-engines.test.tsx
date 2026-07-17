import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { BoxProps } from '../contracts';
import { RADIUS_MAP, SHADOW_MAP, SPACING_MAP } from '../contracts';
import ClassicBox from '../engines/classic';
import ModernBox from '../engines/modern';
import RusticBox from '../engines/rustic';

const ENGINE_COMPONENTS = {
  classic: ClassicBox,
  modern: ModernBox,
  rustic: RusticBox,
} as const;

function renderMaximalBox(Component: React.ComponentType<BoxProps>, testId: string) {
  const ref = createRef<HTMLElement>();

  render(
    <Component
      ref={ref}
      as="section"
      data-testid={testId}
      padding="lg"
      px="sm"
      py="xl"
      pt="xs"
      pr="md"
      pb="2xl"
      pl="3xl"
      margin="md"
      mx="lg"
      my="sm"
      mt="xs"
      mr="xl"
      mb="2xl"
      ml="3xl"
      width="50%"
      height="20rem"
      minWidth={120}
      maxWidth="90vw"
      minHeight="10rem"
      maxHeight={640}
      background="linear-gradient(135deg, red, blue)"
      bgColor="rgb(10, 20, 30)"
      border="1px solid red"
      borderWidth={2}
      borderColor="blue"
      borderStyle="dashed"
      rounded="xl"
      shadow="lg"
      display="grid"
      position="absolute"
      top={10}
      right="2rem"
      bottom={0}
      left="1rem"
      zIndex={9}
      overflow="hidden"
      overflowX="auto"
      overflowY="scroll"
      opacity={0.75}
      transform="translateX(10px)"
      transition="opacity 120ms ease"
      cursor="pointer"
      visibility="visible"
      pointerEvents="auto"
      userSelect="none"
      flex="1 1 auto"
      flexGrow={1}
      flexShrink={0}
      flexBasis="30%"
      gridColumn="span 2"
      gridRow="1 / 3"
      gridArea="hero"
      textAlign="center"
      color="rebeccapurple"
      className="custom-box"
      style={{ outline: '1px solid black' }}
    >
      Engine box
    </Component>
  );

  return {
    element: screen.getByTestId(testId),
    ref,
  };
}

describe('Box runtime engines', () => {
  it.each(Object.entries(ENGINE_COMPONENTS))(
    'renders a minimal %s box with the engine base class and forwards refs',
    (engine, Component) => {
      const ref = createRef<HTMLElement>();

      render(
        <Component ref={ref} as="article" data-testid={`box-${engine}`}>
          Minimal
        </Component>
      );

      const box = screen.getByTestId(`box-${engine}`);
      expect(box.tagName).toBe('ARTICLE');
      expect(box).toHaveClass('rottay-box');
      expect(box).toHaveClass(`rottay-box--${engine}`);
      expect(ref.current).toBe(box);
    }
  );

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'maps the full prop surface into the live %s engine',
    (engine, Component) => {
      const { element, ref } = renderMaximalBox(Component, `box-full-${engine}`);

      expect(element.tagName).toBe('SECTION');
      expect(element).toHaveClass('rottay-box');
      expect(element).toHaveClass(`rottay-box--${engine}`);
      expect(element).toHaveClass('custom-box');
      expect(ref.current).toBe(element);
      expect(element).toHaveTextContent('Engine box');

      if (engine === 'modern') {
        // Modern resolves spacing through DS token inline styles and selects
        // radius/shadow in the unlayered skin via attributes.
        expect(element).toHaveAttribute('data-radius', 'xl');
        expect(element).toHaveAttribute('data-shadow', 'lg');
        expect(element.style.borderRadius).toBe('');
        expect(element.style.boxShadow).toBe('');
        expect(element.className).toContain('grid');
        expect(element.className).toContain('absolute');
        expect(element.className).toContain('overflow-hidden');
        expect(element.className).toContain('overflow-x-auto');
        expect(element.className).toContain('overflow-y-scroll');
      } else if (engine === 'rustic') {
        // Rustic keeps spacing inline but shares the skin-selected radius/shadow contract.
        expect(element).toHaveStyle({
          padding: `${SPACING_MAP.xs} ${SPACING_MAP.md} ${SPACING_MAP['2xl']} ${SPACING_MAP['3xl']}`,
          margin: `${SPACING_MAP.xs} ${SPACING_MAP.xl} ${SPACING_MAP['2xl']} ${SPACING_MAP['3xl']}`,
        });
        expect(element).toHaveAttribute('data-radius', 'xl');
        expect(element).toHaveAttribute('data-shadow', 'lg');
        expect(element.style.borderRadius).toBe('');
        expect(element.style.boxShadow).toBe('');
      } else {
        // Classic remains Ant-owned and resolves the token values inline.
        expect(element).toHaveStyle({
          padding: `${SPACING_MAP.xs} ${SPACING_MAP.md} ${SPACING_MAP['2xl']} ${SPACING_MAP['3xl']}`,
          margin: `${SPACING_MAP.xs} ${SPACING_MAP.xl} ${SPACING_MAP['2xl']} ${SPACING_MAP['3xl']}`,
          borderRadius: RADIUS_MAP.xl,
          boxShadow: SHADOW_MAP.lg,
        });
      }

      // Verify style attribute contains all expected declarations.
      // We use getAttribute('style') instead of toHaveStyle() because
      // happy-dom doesn't resolve CSS shorthand conflicts (border + borderWidth,
      // flex + flexGrow, background + backgroundColor) the same way browsers do.
      const styleAttr = element.getAttribute('style') || '';

      if (engine === 'modern') {
        expect(element.className).toContain('grid');
        expect(element.className).toContain('absolute');
        expect(element.className).toContain('overflow-hidden');
        expect(element.className).toContain('overflow-x-auto');
        expect(element.className).toContain('overflow-y-scroll');
      } else {
        expect(element).toHaveStyle({ display: 'grid', position: 'absolute' });
      }

      // Properties that both classic/rustic and modern set as inline styles
      for (const expected of [
        'width: 50%',
        'height: 20rem',
        'color: rebeccapurple',
        'cursor: pointer',
        'opacity: 0.75',
        'transform: translateX(10px)',
        'transition: opacity 120ms ease',
      ]) {
        expect(styleAttr).toContain(expected);
      }

      // Dimension constraints
      expect(styleAttr).toContain('min-width: 120px');
      expect(styleAttr).toContain('max-width: 90vw');
      expect(styleAttr).toContain('min-height: 10rem');
      expect(styleAttr).toContain('max-height: 640px');

      // Position offsets
      expect(styleAttr).toContain('top: 10px');
      expect(styleAttr).toContain('right: 2rem');
      expect(styleAttr).toContain('bottom: 0px');
      expect(styleAttr).toContain('left: 1rem');

      // Background (shorthand merged by happy-dom)
      expect(styleAttr).toContain('linear-gradient(135deg, red, blue)');
      expect(styleAttr).toContain('rgb(10, 20, 30)');

      // Border (shorthand + individual props resolved by happy-dom)
      expect(styleAttr).toMatch(/border/);
      expect(styleAttr).toContain('blue');

      // Flex child
      expect(styleAttr).toMatch(/flex/);
      expect(styleAttr).toContain('30%');

      // Grid child
      expect(styleAttr).toContain('grid-column: span 2');
      expect(styleAttr).toContain('grid-area: hero');

      // Interaction / visual
      expect(styleAttr).toContain('pointer-events: auto');
      expect(styleAttr).toContain('user-select: none');
      expect(styleAttr).toContain('visibility: visible');
      expect(styleAttr).toContain('text-align: center');

      // Merged user style
      expect(styleAttr).toContain('outline');
    }
  );

  // Regression: RT-ERR-01 / RT-ERR-02 (WO-CNF-01). ModernBox passed
  // `React.Children.toArray(children)` — which is `[]` for undefined children —
  // as the createElement children argument. React-DOM rejects any children
  // argument on a void element ("<input> is a void element tag and must neither
  // have children…"), so every void `Box` (input, img, hr, br, …) crashed under
  // the modern engine and was replaced by the EngineErrorBoundary. All three
  // engines must now render void elements with their full attribute set and no
  // children argument.
  const VOID_CASES = [
    {
      as: 'input',
      tag: 'INPUT',
      attrs: { type: 'hidden', name: 'jobIdentifier', value: 'job-123' },
    },
    {
      as: 'img',
      tag: 'IMG',
      attrs: { src: 'https://example.com/a.png', alt: 'a' },
    },
    { as: 'hr', tag: 'HR', attrs: {} },
    { as: 'br', tag: 'BR', attrs: {} },
  ] as const;

  describe.each(Object.entries(ENGINE_COMPONENTS))('void elements render under the %s engine', (engine, Component) => {
    it.each(VOID_CASES)('renders <$as> with attributes and no children argument', ({ as, tag, attrs }) => {
      const ref = createRef<HTMLElement>();
      expect(() =>
        render(
          <Component
            ref={ref}
            as={as as any}
            data-testid={`void-${engine}-${as}`}
            {...(attrs as Record<string, unknown>)}
          />
        )
      ).not.toThrow();

      const el = screen.getByTestId(`void-${engine}-${as}`);
      expect(el.tagName).toBe(tag);
      expect(el).toHaveClass('rottay-box');
      expect(el).toHaveClass(`rottay-box--${engine}`);
      expect(ref.current).toBe(el);
      // Void elements never have child nodes.
      expect(el.childNodes.length).toBe(0);
      for (const [key, val] of Object.entries(attrs)) {
        if (key === 'value') {
          expect((el as HTMLInputElement).value).toBe(val);
        } else {
          expect(el.getAttribute(key)).toBe(val);
        }
      }
    });
  });

  // The hidden job-identifier input on the public apply page is the exact
  // RT-ERR-01 repro: a void Box that MUST reach the DOM so the server action can
  // resolve the job from FormData.
  it.each(Object.entries(ENGINE_COMPONENTS))(
    'keeps a hidden job-identifier input in the DOM under the %s engine',
    (engine, Component) => {
      render(
        <Component
          as="input"
          type="hidden"
          name="jobIdentifier"
          value="acme-senior-eng"
          data-testid={`hidden-${engine}`}
        />
      );
      const el = screen.getByTestId(`hidden-${engine}`) as HTMLInputElement;
      expect(el.tagName).toBe('INPUT');
      expect(el.getAttribute('type')).toBe('hidden');
      expect(el.getAttribute('name')).toBe('jobIdentifier');
      expect(el.value).toBe('acme-senior-eng');
    }
  );

  it.each([
    ['modern', ModernBox],
    ['rustic', RusticBox],
  ] as const)('preserves caller-owned radius/shadow precedence in the %s skin contract', (engine, Component) => {
    render(
      <>
        <Component
          data-testid={`box-caller-${engine}`}
          rounded="xl"
          shadow="lg"
          style={{ borderRadius: '3px', boxShadow: 'none' }}
        />
        <Component
          data-testid={`box-caller-undefined-${engine}`}
          rounded="xl"
          shadow="lg"
          style={{ borderRadius: undefined, boxShadow: undefined }}
        />
      </>
    );

    const caller = screen.getByTestId(`box-caller-${engine}`);
    expect(caller).not.toHaveAttribute('data-radius');
    expect(caller).not.toHaveAttribute('data-shadow');
    expect(caller.style.borderRadius).toBe('3px');
    expect(caller.style.boxShadow).toBe('none');

    const suppressed = screen.getByTestId(`box-caller-undefined-${engine}`);
    expect(suppressed).not.toHaveAttribute('data-radius');
    expect(suppressed).not.toHaveAttribute('data-shadow');
    expect(suppressed.style.borderRadius).toBe('');
    expect(suppressed.style.boxShadow).toBe('');
  });

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'does not emit spacing or radius styles when the %s engine receives none values',
    (engine, Component) => {
      render(
        <Component data-testid={`box-none-${engine}`} padding="none" margin="none" rounded="none" shadow="none">
          None values
        </Component>
      );

      const box = screen.getByTestId(`box-none-${engine}`);
      expect(box).not.toHaveAttribute('data-radius');
      expect(box).not.toHaveAttribute('data-shadow');

      if (engine === 'modern') {
        expect(box.className).not.toContain('p-');
        expect(box.className).not.toContain('m-');
        expect(box.className).not.toContain('rounded-');
        expect(box.className).not.toContain('shadow-');
      } else {
        expect(box.style.padding).toBe('');
        expect(box.style.margin).toBe('');
        expect(box.style.borderRadius).toBe('');
        expect(box.style.boxShadow).toBe('');
      }
    }
  );
});
