import React from 'react';
import { Container } from '../Container';
import type { SectionProps } from './types';

const paddingSizes = {
  sm: '3rem',
  md: '4rem',
  lg: '6rem',
};

/**
 * Section component
 * Wrapper with vertical padding and optional background
 */
export const Section: React.FC<SectionProps> = ({
  children,
  size = 'md',
  background,
  contained = false,
  containerSize = 'lg',
  style,
  className,
  ...rest
}) => {
  const sectionStyle: React.CSSProperties = {
    paddingTop: paddingSizes[size],
    paddingBottom: paddingSizes[size],
    backgroundColor: background,
    ...style,
  };

  const content = contained ? (
    <Container size={containerSize}>{children}</Container>
  ) : (
    children
  );

  return (
    <section style={sectionStyle} className={className} {...rest}>
      {content}
    </section>
  );
};

Section.displayName = 'Section';
