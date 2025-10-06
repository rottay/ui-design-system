import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container
   * @default 'lg'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | number;
}

const maxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

/**
 * Container component for centered, max-width layouts
 * This is a custom component not present in Ant Design
 */
export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'lg',
  style,
  children,
  ...props
}) => {
  const width = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidths[maxWidth];

  return (
    <div
      style={{
        maxWidth: width,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '16px',
        paddingRight: '16px',
        width: '100%',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

Container.displayName = 'Container';
