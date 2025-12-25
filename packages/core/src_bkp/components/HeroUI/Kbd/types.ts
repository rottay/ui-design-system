export interface KbdProps {
  /**
   * The keyboard key(s) to display
   */
  children?: React.ReactNode;

  /**
   * Array of keys to display (alternative to children)
   * @example ['Ctrl', 'K'] or ['⌘', 'S']
   */
  keys?: string[];

  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Style variant
   * @default 'solid'
   */
  variant?: 'solid' | 'bordered' | 'flat' | 'shadow';

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * Abbr title attribute (accessibility)
   */
  abbr?: string;
}
