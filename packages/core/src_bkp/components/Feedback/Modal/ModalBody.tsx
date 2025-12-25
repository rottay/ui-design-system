import React from 'react';

export interface ModalBodyProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: number | string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  style,
  padding = 24,
}) => {
  return (
    <div
      className={className}
      style={{
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

ModalBody.displayName = 'ModalBody';
