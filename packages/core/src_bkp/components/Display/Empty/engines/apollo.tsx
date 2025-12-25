/**
 * Apollo Empty Engine
 *
 * Native HTML + Tailwind CSS empty state implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import type { EmptyProps } from '../../../../types/components/empty';
import { cn } from '../../../../utils/cn';

// Default empty SVG icon
const DefaultEmptyIcon = () => (
  <svg
    className="w-16 h-16 text-gray-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

/**
 * Apollo Empty - Native HTML + Tailwind implementation
 */
function ApolloEmpty({
  image,
  imageStyle,
  description = 'No Data',
  children,
  className,
  style,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4',
        'text-center',
        className
      )}
      style={style}
    >
      {/* Image/Icon */}
      <div className="mb-4" style={imageStyle}>
        {image ?? <DefaultEmptyIcon />}
      </div>

      {/* Description */}
      {description && (
        <div className="text-gray-500 text-sm mb-4">
          {description}
        </div>
      )}

      {/* Action buttons or custom content */}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
}

ApolloEmpty.displayName = 'ApolloEmpty';

export default ApolloEmpty;
