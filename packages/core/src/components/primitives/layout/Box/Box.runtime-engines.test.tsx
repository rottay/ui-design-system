import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { BoxProps } from './Box.types';
import { RADIUS_MAP, SHADOW_MAP, SPACING_MAP } from './Box.types';
import ClassicBox from './engines/classic';
import ModernBox from './engines/modern';
import RusticBox from './engines/rustic';

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
        // Modern maps spacing/radius/shadow/display/position/overflow to utility classes.
        expect(element.className).toContain('p-6');
        expect(element.className).toContain('px-2');
        expect(element.className).toContain('py-8');
        expect(element.className).toContain('pt-1');
        expect(element.className).toContain('pr-4');
        expect(element.className).toContain('pb-10');
        expect(element.className).toContain('pl-12');
        expect(element.className).toContain('m-4');
        expect(element.className).toContain('mx-6');
        expect(element.className).toContain('my-2');
        expect(element.className).toContain('mt-1');
        expect(element.className).toContain('mr-8');
        expect(element.className).toContain('mb-10');
        expect(element.className).toContain('ml-12');
        expect(element.className).toContain('rounded-xl');
        expect(element.className).toContain('shadow-lg');
        expect(element.className).toContain('grid');
        expect(element.className).toContain('absolute');
        expect(element.className).toContain('overflow-hidden');
        expect(element.className).toContain('overflow-x-auto');
        expect(element.className).toContain('overflow-y-scroll');
      } else {
        // Classic and Rustic resolve spacing/shadow/radius directly into inline styles,
        // but the browser serializes the mixed shorthand/edge overrides into compact values.
        expect(element).toHaveStyle({
          padding: `${SPACING_MAP.xs} ${SPACING_MAP.md} ${SPACING_MAP['2xl']} ${SPACING_MAP['3xl']}`,
          margin: `${SPACING_MAP.xs} ${SPACING_MAP.xl} ${SPACING_MAP['2xl']} ${SPACING_MAP['3xl']}`,
          borderRadius: RADIUS_MAP.xl,
          boxShadow: SHADOW_MAP.lg,
        });
      }

      if (engine === 'modern') {
        expect(element.className).toContain('grid');
        expect(element.className).toContain('absolute');
        expect(element.className).toContain('overflow-hidden');
        expect(element.className).toContain('overflow-x-auto');
        expect(element.className).toContain('overflow-y-scroll');
        expect(element).toHaveStyle({
          width: '50%',
          height: '20rem',
          minWidth: '120px',
          maxWidth: '90vw',
          minHeight: '10rem',
          maxHeight: '640px',
          background: 'linear-gradient(135deg, red, blue)',
          backgroundColor: 'rgb(10, 20, 30)',
          border: '2px dashed',
          borderColor: 'blue',
          bottom: '0px',
          color: 'rebeccapurple',
          cursor: 'pointer',
          flex: '1 0 30%',
          gridArea: 'hero',
          gridColumn: 'span 2',
          gridRow: '1 / 3',
          left: '1rem',
          opacity: '0.75',
          outline: '1px solid black',
          right: '2rem',
          top: '10px',
          transform: 'translateX(10px)',
          transition: 'opacity 120ms ease',
          visibility: 'visible',
        });
      } else {
        expect(element).toHaveStyle({
          width: '50%',
          height: '20rem',
          minWidth: '120px',
          maxWidth: '90vw',
          minHeight: '10rem',
          maxHeight: '640px',
          background: 'linear-gradient(135deg, red, blue)',
          backgroundColor: 'rgb(10, 20, 30)',
          border: '2px dashed',
          borderColor: 'blue',
          borderStyle: 'dashed',
          borderWidth: '2px',
          display: 'grid',
          position: 'absolute',
          top: '10px',
          right: '2rem',
          bottom: '0px',
          left: '1rem',
          zIndex: '9',
          overflow: 'hidden',
          overflowX: 'auto',
          overflowY: 'scroll',
          opacity: '0.75',
          transform: 'translateX(10px)',
          transition: 'opacity 120ms ease',
          cursor: 'pointer',
          visibility: 'visible',
          pointerEvents: 'auto',
          userSelect: 'none',
          flex: '1 0 30%',
          flexGrow: '1',
          flexShrink: '0',
          flexBasis: '30%',
          gridColumn: 'span 2',
          gridRow: '1 / 3',
          gridArea: 'hero',
          textAlign: 'center',
          color: 'rebeccapurple',
          outline: '1px solid black',
        });
      }
    }
  );

  it.each(Object.entries(ENGINE_COMPONENTS))(
    'does not emit spacing or radius styles when the %s engine receives none values',
    (engine, Component) => {
      render(
        <Component
          data-testid={`box-none-${engine}`}
          padding="none"
          margin="none"
          rounded="none"
          shadow="none"
        >
          None values
        </Component>
      );

      const box = screen.getByTestId(`box-none-${engine}`);

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
