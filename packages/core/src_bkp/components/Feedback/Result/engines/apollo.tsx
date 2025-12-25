/**
 * Apollo Result Engine
 *
 * Native HTML + Tailwind CSS result implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import type { ResultProps, ResultStatus } from '../../../../types/components/result';
import { getStatusColor } from '../../../../types/components/result';
import { cn } from '../../../../utils/cn';

// Default icons for each status (using SVG)
const StatusIcons: Record<ResultStatus, JSX.Element> = {
  success: (
    <svg
      className="w-16 h-16"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-16 h-16"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-16 h-16"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-16 h-16"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  '404': (
    <svg
      className="w-16 h-16"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
  ),
  '403': (
    <svg
      className="w-16 h-16"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  '500': (
    <svg
      className="w-16 h-16"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/**
 * Apollo Result - Native HTML + Tailwind implementation
 */
function ApolloResult({
  status = 'info',
  title,
  subTitle,
  icon,
  extra,
  children,
  className,
  style,
  id,
}: ResultProps) {
  // Get status color for the icon
  const statusColor = getStatusColor(status);

  // Use custom icon if provided, otherwise use default status icon
  const displayIcon = icon ?? StatusIcons[status];

  return (
    <div
      id={id}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
      style={style}
    >
      {/* Icon */}
      <div className={cn('mb-6', statusColor)}>{displayIcon}</div>

      {/* Title */}
      {title && (
        <div className="mb-2 text-2xl font-semibold text-gray-900">{title}</div>
      )}

      {/* Subtitle */}
      {subTitle && <div className="mb-6 text-base text-gray-600">{subTitle}</div>}

      {/* Extra actions */}
      {extra && <div className="mb-4 flex gap-2">{extra}</div>}

      {/* Children content */}
      {children && <div className="mt-4 text-sm text-gray-500">{children}</div>}
    </div>
  );
}

ApolloResult.displayName = 'ApolloResult';

export default ApolloResult;
