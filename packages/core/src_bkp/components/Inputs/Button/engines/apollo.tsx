/**
 * Apollo Button (Native HTML + Tailwind)
 *
 * Native HTML + Tailwind CSS button implementation.
 * Zero external dependencies, minimal bundle size.
 */

import type { ButtonProps } from '../types';
import { cn } from '../../../../utils/cn';

/**
 * Base button styles using Tailwind CSS
 */
const baseStyles = `
  inline-flex items-center justify-center gap-2
  font-medium transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;

/**
 * Type/variant styles
 */
const typeStyles: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
  dashed: 'bg-white text-gray-700 border border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-500',
  text: 'bg-transparent text-gray-700 hover:bg-gray-100',
  link: 'bg-transparent text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline',
};

/**
 * Size styles
 */
const sizeStyles: Record<string, string> = {
  small: 'px-3 py-1 text-sm rounded',
  middle: 'px-4 py-2 text-base rounded-md',
  large: 'px-6 py-3 text-lg rounded-lg',
};

/**
 * Shape styles
 */
const shapeStyles: Record<string, string> = {
  default: '',
  circle: 'rounded-full aspect-square p-2',
  round: 'rounded-full',
};

/**
 * Apollo Button - Native HTML + Tailwind implementation
 */
export function ApolloButton({
  type = 'default',
  size = 'middle',
  loading,
  disabled,
  danger,
  ghost,
  block,
  fullWidth,
  shape = 'default',
  icon,
  children,
  onClick,
  className,
  style,
  htmlType = 'button',
}: ButtonProps) {
  const isLoading = typeof loading === 'boolean' ? loading : !!loading;
  const isDisabled = disabled || isLoading;
  const isBlock = block || fullWidth;

  // Determine styles based on props
  let variantStyle = typeStyles[type || 'default'] || typeStyles.default;

  // Danger override
  if (danger) {
    variantStyle = ghost
      ? 'bg-transparent text-red-600 border border-red-600 hover:bg-red-50'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
  }

  // Ghost override
  if (ghost && !danger) {
    variantStyle = 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50';
  }

  const buttonClasses = cn(
    baseStyles,
    variantStyle,
    sizeStyles[size || 'middle'],
    shapeStyles[shape || 'default'],
    isBlock && 'w-full',
    className
  );

  return (
    <button
      type={htmlType}
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled}
      style={style}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon}
      {children}
    </button>
  );
}

ApolloButton.displayName = 'ApolloButton';
export default ApolloButton;
