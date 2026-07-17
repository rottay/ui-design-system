import type { CropMarksProps } from '../../../foundation/contracts/framing/crop-marks';

import "./CropMarks.css";

/**
 * `+`-style corner registration ticks around content (spec section 5): short perpendicular
 * hairlines at each of the four corners, marking a premium/framed zone the way a print crop
 * mark marks a trim edge.
 *
 * The ticks are pure chrome — each is an empty, `aria-hidden` element drawn with CSS hairlines,
 * never part of the document content — so `children` remains the sole content a screenreader
 * or text extraction encounters. Pure presentational markup: no state, no client-only APIs,
 * safe to render on the server.
 */
export function CropMarks({ children, as: As = "div", className }: CropMarksProps): React.JSX.Element {
  const classes = ["rt-crop-marks", className].filter(Boolean).join(" ");

  return (
    <As className={classes}>
      <span className="rt-crop-marks__tick rt-crop-marks__tick--tl" aria-hidden="true" />
      <span className="rt-crop-marks__tick rt-crop-marks__tick--tr" aria-hidden="true" />
      <span className="rt-crop-marks__tick rt-crop-marks__tick--bl" aria-hidden="true" />
      <span className="rt-crop-marks__tick rt-crop-marks__tick--br" aria-hidden="true" />
      <div className="rt-crop-marks__body">{children}</div>
    </As>
  );
}

export type { CropMarksProps } from '../../../foundation/contracts/framing/crop-marks';
