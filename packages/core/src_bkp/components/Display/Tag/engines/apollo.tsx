/**
 * Apollo Tag Engine
 *
 * Native HTML + Tailwind CSS tag implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import type { TagProps } from '../../../../types/components/tag';
import { cn } from '../../../../utils/cn';

// Color mapping for predefined colors
const colorStyles: Record<string, string> = {
  default: 'bg-gray-100 text-gray-800 border-gray-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  pink: 'bg-pink-100 text-pink-800 border-pink-300',
  magenta: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
  geekblue: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  lime: 'bg-lime-100 text-lime-800 border-lime-300',
  gold: 'bg-amber-100 text-amber-800 border-amber-300',
  volcano: 'bg-orange-100 text-orange-900 border-orange-400',
};

/**
 * Apollo Tag - Native HTML + Tailwind implementation
 */
function ApolloTag({
  children,
  className,
  style,
  color = 'default',
  closable,
  onClose,
  icon,
  bordered = true,
  id,
  'aria-label': ariaLabel,
}: TagProps) {
  // Get color styles or use default
  const colorClass = colorStyles[color] || colorStyles.default;

  // Handle custom hex colors
  const customColorStyle =
    color && !colorStyles[color] && color.startsWith('#')
      ? {
          backgroundColor: `${color}20`,
          color: color,
          borderColor: `${color}60`,
        }
      : undefined;

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose?.(e);
  };

  return (
    <span
      id={id}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded',
        bordered && 'border',
        !customColorStyle && colorClass,
        className
      )}
      style={customColorStyle ? { ...customColorStyle, ...style } : style}
      aria-label={ariaLabel}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center justify-center w-3 h-3 ml-0.5 -mr-0.5 rounded-sm hover:bg-black/10 transition-colors"
          aria-label="Close tag"
        >
          <svg
            viewBox="0 0 1024 1024"
            fill="currentColor"
            width="1em"
            height="1em"
          >
            <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
          </svg>
        </button>
      )}
    </span>
  );
}

ApolloTag.displayName = 'ApolloTag';

export default ApolloTag;
