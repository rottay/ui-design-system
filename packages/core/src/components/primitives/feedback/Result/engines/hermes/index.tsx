'use client';

/**
 * Result - Hermes Engine (DaisyUI/Tailwind)
 */
import React from 'react';
import type { ResultProps, ResultStatus } from '../../types';
import { RESULT_DEFAULTS } from '../../types';

const statusIcons: Record<ResultStatus, React.ReactNode> = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  '404': (
    <div className="text-8xl font-bold text-primary">404</div>
  ),
  '403': (
    <div className="text-8xl font-bold text-warning">403</div>
  ),
  '500': (
    <div className="text-8xl font-bold text-error">500</div>
  ),
};

export const Result = React.forwardRef<HTMLDivElement, ResultProps>(
  (props, ref) => {
    const {
      status = RESULT_DEFAULTS.status,
      icon,
      title,
      subTitle,
      extra,
      children,
      className = '',
      style,
    } = props;

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
        style={style}
      >
        {/* Icon */}
        <div className="mb-6">
          {icon || statusIcons[status!]}
        </div>

        {/* Title */}
        {title && (
          <h2 className="text-2xl font-bold mb-2 text-base-content">
            {title}
          </h2>
        )}

        {/* Subtitle */}
        {subTitle && (
          <p className="text-base-content/70 mb-6 max-w-md">
            {subTitle}
          </p>
        )}

        {/* Extra (buttons) */}
        {extra && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {extra}
          </div>
        )}

        {/* Children */}
        {children && (
          <div className="w-full max-w-lg">
            {children}
          </div>
        )}
      </div>
    );
  }
);

Result.displayName = 'Result.Hermes';

export default Result;
