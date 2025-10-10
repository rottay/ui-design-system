import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IconProps extends Omit<LucideProps, 'size'> {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Predefined size or custom number */
  size?: IconSize | number;
  /** Rotate icon continuously (for loading states) */
  spin?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
};

/**
 * Icon Component
 *
 * Wrapper around Lucide icons with consistent sizing and theming
 *
 * @example
 * ```tsx
 * import { Icon } from '@es-rottay/designsystem-core';
 * import { Home, Settings, Search } from '@es-rottay/designsystem-core/icons';
 *
 * // With preset sizes
 * <Icon icon={Home} size="sm" />
 * <Icon icon={Settings} size="md" />
 * <Icon icon={Search} size="lg" />
 *
 * // Custom size
 * <Icon icon={Home} size={28} />
 *
 * // With color (inherits from parent)
 * <div style={{ color: 'red' }}>
 *   <Icon icon={Home} size="md" />
 * </div>
 *
 * // Loading/spin state
 * <Icon icon={Loader} size="md" spin />
 *
 * // With custom props
 * <Icon
 *   icon={Home}
 *   size="lg"
 *   strokeWidth={1.5}
 *   className="custom-icon"
 * />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  spin = false,
  className = '',
  style = {},
  ...props
}) => {
  const iconSize = typeof size === 'number' ? size : sizeMap[size];

  const spinAnimation = spin
    ? {
        animation: 'spin 1s linear infinite',
      }
    : {};

  return (
    <>
      {spin && (
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      )}
      <IconComponent
        size={iconSize}
        className={className}
        style={{
          ...spinAnimation,
          ...style,
        }}
        {...props}
      />
    </>
  );
};

Icon.displayName = 'Icon';
