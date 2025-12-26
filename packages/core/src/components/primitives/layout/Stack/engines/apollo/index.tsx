/**
 * Stack - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { StackProps } from '../../types';
import {
  STACK_DEFAULTS,
  SPACING_MAP,
  ALIGN_MAP,
  JUSTIFY_MAP,
} from '../../types';

export default function ApolloStack(props: StackProps): React.ReactElement {
  const {
    children,
    direction = STACK_DEFAULTS.direction,
    align = STACK_DEFAULTS.align,
    justify = STACK_DEFAULTS.justify,
    spacing = STACK_DEFAULTS.spacing,
    wrap = STACK_DEFAULTS.wrap,
    divider,
    className,
    style,
  } = props;

  const combinedStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    alignItems: ALIGN_MAP[align!],
    justifyContent: JUSTIFY_MAP[justify!],
    gap: SPACING_MAP[spacing!],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };

  const childArray = React.Children.toArray(children);

  if (divider && childArray.length > 1) {
    const withDividers: React.ReactNode[] = [];
    childArray.forEach((child, index) => {
      withDividers.push(child);
      if (index < childArray.length - 1) {
        withDividers.push(
          <div
            key={`divider-${index}`}
            style={{
              [direction === 'vertical' ? 'width' : 'height']: '100%',
              [direction === 'vertical' ? 'height' : 'width']: '1px',
              backgroundColor: '#e0e0e0',
            }}
          />
        );
      }
    });
    return (
      <div className={className} style={combinedStyle}>
        {withDividers}
      </div>
    );
  }

  return (
    <div className={className} style={combinedStyle}>
      {children}
    </div>
  );
}
