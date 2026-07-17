export interface TerminalBlockLine {
  /** Renders a `$ ` mono prompt prefix before the text. The prefix is aria-hidden decoration. */
  prompt?: boolean;
  /** The real line text. Always present in the DOM regardless of streaming state. */
  text: string;
}

export interface TerminalBlockProps {
  /** Lines to render, top to bottom. */
  lines: TerminalBlockLine[];
  /** Optional mono caption shown in the panel's title bar. */
  title?: string;
  /**
   * Types the lines in sequence once the panel scrolls into view (spec sections 3 and 6).
   * Defaults to `true`. When `false`, all lines render statically with no animation.
   */
  streaming?: boolean;
  /** Extra class names on the panel container. */
  className?: string;
}
