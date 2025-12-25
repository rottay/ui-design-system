/**
 * Athena Engine
 *
 * Extensible, bring-your-own-library engine.
 * Allows clients to plug in custom UI library implementations.
 *
 * STATUS: TODO - Not fully implemented
 *
 * See README.md for implementation plan and proposed libraries.
 */

import React, { type ComponentType, type ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

/**
 * List of all components that can be customized via Athena
 */
export type AthenaComponentName =
  | 'Button'
  | 'Input'
  | 'Select'
  | 'Card'
  | 'Modal'
  | 'Table'
  | 'Checkbox'
  | 'Radio'
  | 'Switch'
  | 'Tabs'
  | 'Menu'
  | 'Dropdown'
  | 'Tooltip'
  | 'Popover'
  | 'Alert'
  | 'Badge'
  | 'Avatar'
  | 'Progress'
  | 'Spinner'
  | 'Skeleton';

/**
 * Registry of custom component implementations
 */
export type AthenaRegistry = Partial<Record<AthenaComponentName, ComponentType<any>>>;

/**
 * Configuration for Athena engine
 */
export interface AthenaConfig {
  /** Custom component implementations */
  implementations: AthenaRegistry;
  /** Engine to fall back to for unimplemented components */
  fallbackEngine?: 'titan' | 'hermes' | 'apollo';
}

// ============================================
// COMPONENT INTERFACES
// ============================================

/**
 * Base props that all Button implementations must support
 */
export interface AthenaButtonProps {
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

/**
 * Base props that all Input implementations must support
 */
export interface AthenaInputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  size?: 'small' | 'medium' | 'large';
  status?: 'error' | 'warning';
  className?: string;
}

/**
 * Base props that all Select implementations must support
 */
export interface AthenaSelectProps {
  value?: string | number;
  defaultValue?: string | number;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string | number) => void;
  size?: 'small' | 'medium' | 'large';
  status?: 'error' | 'warning';
  className?: string;
}

/**
 * Base props that all Card implementations must support
 */
export interface AthenaCardProps {
  title?: ReactNode;
  children?: ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Base props that all Modal implementations must support
 */
export interface AthenaModalProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  footer?: ReactNode | null;
  className?: string;
}

// ============================================
// REGISTRY
// ============================================

let athenaRegistry: AthenaRegistry = {};

/**
 * Register a custom component implementation
 *
 * @example
 * ```tsx
 * import { Button as RadixButton } from '@radix-ui/themes';
 *
 * registerAthenaComponent('Button', RadixButton);
 * ```
 */
export function registerAthenaComponent<N extends AthenaComponentName>(
  name: N,
  component: ComponentType<any>
): void {
  athenaRegistry[name] = component;
}

/**
 * Register multiple components at once
 *
 * @example
 * ```tsx
 * registerAthenaComponents({
 *   Button: RadixButton,
 *   Input: RadixInput,
 *   Select: RadixSelect,
 * });
 * ```
 */
export function registerAthenaComponents(components: AthenaRegistry): void {
  athenaRegistry = { ...athenaRegistry, ...components };
}

/**
 * Get a registered component
 */
export function getAthenaComponent<N extends AthenaComponentName>(
  name: N
): ComponentType<any> | undefined {
  return athenaRegistry[name];
}

/**
 * Clear all registered components
 */
export function clearAthenaRegistry(): void {
  athenaRegistry = {};
}

/**
 * Get current registry state
 */
export function getAthenaRegistry(): AthenaRegistry {
  return { ...athenaRegistry };
}

// ============================================
// PLACEHOLDER COMPONENTS
// ============================================

/**
 * Placeholder component shown when Athena implementation is not registered
 */
export function AthenaPlaceholder({ componentName }: { componentName: string }): React.ReactElement {
  return React.createElement(
    'div',
    {
      style: {
        padding: '16px',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666',
      },
    },
    React.createElement('strong', null, `Athena: ${componentName}`),
    React.createElement('br'),
    React.createElement('small', null, 'No implementation registered. Use registerAthenaComponent().')
  );
}

// ============================================
// EXPORTS
// ============================================

export const ATHENA_PROPOSED_LIBRARIES = {
  tier1: [
    { name: 'Radix UI', package: '@radix-ui/themes', bundleSize: '~50kb' },
    { name: 'Headless UI', package: '@headlessui/react', bundleSize: '~20kb' },
    { name: 'React Aria', package: 'react-aria-components', bundleSize: '~60kb' },
    { name: 'Shadcn/ui', package: 'shadcn-ui', bundleSize: 'varies' },
  ],
  tier2: [
    { name: 'Chakra UI', package: '@chakra-ui/react', bundleSize: '~100kb' },
    { name: 'Mantine', package: '@mantine/core', bundleSize: '~120kb' },
    { name: 'MUI', package: '@mui/material', bundleSize: '~150kb' },
    { name: 'NextUI', package: '@nextui-org/react', bundleSize: '~80kb' },
  ],
  tier3: [
    { name: 'Ark UI', package: '@ark-ui/react', bundleSize: '~40kb' },
    { name: 'Park UI', package: '@park-ui/react', bundleSize: '~30kb' },
    { name: 'Catalyst', package: '@tailwindlabs/catalyst', bundleSize: '~25kb' },
    { name: 'Tremor', package: '@tremor/react', bundleSize: '~50kb' },
  ],
} as const;
