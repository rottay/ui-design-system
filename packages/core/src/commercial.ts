/**
 * `@rottay/design-system/commercial` — the shared commercial kit.
 *
 * A domain-agnostic, monochrome-only vocabulary for Rottay's commercial surfaces (Overview,
 * Docs, Showroom). Built once here; consumed by all three surfaces so the Monochrome Signature
 * is never re-hand-rolled per surface.
 *
 * Spec: docs-engineering/engineering/design-system/commercial-surfaces/README.md (section 8).
 * Consumers also import the ramp CSS once: `import "@rottay/design-system/commercial.css"`.
 *
 * This is a distinct subpath entry — it is intentionally NOT part of the root `.` barrel.
 */

// Tokens (TS mirror of the commercial ramp; the CSS ships via ./commercial.css).
export {
  COMMERCIAL_GRAY_HEX,
  COMMERCIAL_INK_HEX,
  COMMERCIAL_PAPER_HEX,
  commercialGray,
  commercialTokens,
} from "./commercial/tokens";
export type { CommercialGrayStep } from "./commercial/tokens";

// Framing + structure.
export { AsciiFrame } from "./commercial/AsciiFrame";
export type { AsciiFrameProps, AsciiFrameVariant } from "./commercial/AsciiFrame";

export { SectionFrame } from "./commercial/SectionFrame";
export type { SectionFrameProps } from "./commercial/SectionFrame";

export { CropMarks } from "./commercial/CropMarks";
export type { CropMarksProps } from "./commercial/CropMarks";

export { InvertSection } from "./commercial/InvertSection";
export type { InvertSectionProps, InvertSectionSurface } from "./commercial/InvertSection";

export { TextureBackdrop } from "./commercial/TextureBackdrop";
export type {
  TextureBackdropProps,
  TextureBackdropPattern,
} from "./commercial/TextureBackdrop";

// ASCII content devices.
export { TreeView } from "./commercial/TreeView";
export type { TreeViewProps, TreeNode } from "./commercial/TreeView";

export { AsciiDiagram } from "./commercial/AsciiDiagram";
export type {
  AsciiDiagramProps,
  AsciiDiagramReveal,
  DiagramNode,
  DiagramEdge,
} from "./commercial/AsciiDiagram";

// Animated text.
export { Typewriter } from "./commercial/Typewriter";
export type { TypewriterProps, TypewriterMode } from "./commercial/Typewriter";

export { TerminalBlock } from "./commercial/TerminalBlock";
export type { TerminalBlockProps, TerminalBlockLine } from "./commercial/TerminalBlock";

// Data + product framing.
export { MonoStat } from "./commercial/MonoStat";
export type { MonoStatProps } from "./commercial/MonoStat";

export { ProductWindow } from "./commercial/ProductWindow";
export type { ProductWindowProps } from "./commercial/ProductWindow";
