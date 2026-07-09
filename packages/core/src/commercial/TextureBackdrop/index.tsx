import type { TextureBackdropProps } from "./TextureBackdrop.types";

import "./TextureBackdrop.css";

/**
 * TextureBackdrop — whisper-contrast texture layer behind content (spec section 5).
 *
 * Paints a decorative, CSS-generated pattern (grain, dot grid, diagonal hatch, graph paper, or
 * halftone) on an `aria-hidden` layer positioned behind `children`, so large flat commercial
 * zones get life without ever introducing hue. The layer paints in `currentColor`, resolved from
 * `--ds-commercial-texture-ink` by default and switched to `--ds-commercial-texture-paper`
 * automatically under a `[data-surface="paper"]` ancestor (e.g. an `InvertSection
 * surface="paper"`) — the same ink/paper pairing the rest of the kit uses, applied to texture
 * instead of text. The texture never carries information: it is `aria-hidden` and stays at
 * whisper contrast. Server-safe presentational.
 */
export function TextureBackdrop({
  children,
  pattern,
  opacity,
  as: As = "div",
  className,
}: TextureBackdropProps): React.JSX.Element {
  const classes = ["rt-texture-backdrop", className].filter(Boolean).join(" ");
  const layerStyle =
    opacity != null ? ({ "--rt-texture-opacity": opacity } as React.CSSProperties) : undefined;

  return (
    <As className={classes}>
      <div
        className="rt-texture-backdrop__layer"
        data-pattern={pattern}
        style={layerStyle}
        aria-hidden="true"
      />
      {children}
    </As>
  );
}

export type { TextureBackdropProps, TextureBackdropPattern } from "./TextureBackdrop.types";
