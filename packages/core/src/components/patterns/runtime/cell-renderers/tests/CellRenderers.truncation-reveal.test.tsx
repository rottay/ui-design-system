import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { cellRenderers } from "..";

// Every renderer here that clips text with a CSS ellipsis must keep a reveal
// path, so the full string is never unreachable.

const LONG_NAME = "Alexandra Konstantinopoulos-Vasquez";
const LONG_EMAIL = "alexandra.konstantinopoulos@enterprise-subsidiary.example";

function DotIcon(): React.ReactElement {
  return React.createElement("span", { "data-part": "icon" });
}

describe("cellRenderers truncation reveal", () => {
  afterEach(cleanup);

  it("gives the avatarName primary name the same title reveal as its subtitle", () => {
    const { container } = render(
      cellRenderers.avatarName(LONG_NAME, LONG_EMAIL),
    );

    const name = container.querySelector('[data-part="name"]');
    const subtitle = container.querySelector('[data-part="subtitle"]');

    // Both clip with text-overflow: ellipsis, so both need the reveal.
    expect(subtitle?.getAttribute("title")).toBe(LONG_EMAIL);
    expect(name?.getAttribute("title")).toBe(LONG_NAME);
  });

  it("gives the iconText value a title reveal and omits it for the placeholder", () => {
    const { container: withValue } = render(
      cellRenderers.iconText(DotIcon, LONG_EMAIL),
    );
    expect(
      withValue.querySelector('[data-part="value"]')?.getAttribute("title"),
    ).toBe(LONG_EMAIL);

    // The '--' / placeholder fallback is not truncated content, so it must not
    // acquire a tooltip that repeats a non-value.
    const { container: empty } = render(
      cellRenderers.iconText(DotIcon, null, { placeholder: "Not provided" }),
    );
    const emptyValue = empty.querySelector('[data-part="value"]');
    expect(emptyValue?.textContent).toBe("Not provided");
    expect(emptyValue?.getAttribute("title")).toBeNull();
  });
});
