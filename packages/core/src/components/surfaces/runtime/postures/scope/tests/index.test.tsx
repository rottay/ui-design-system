import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SurfacePostureScope, SurfacePostureSlot } from "..";
import { ResponsiveContext } from "@/infrastructure/runtime/responsive";
import { RESOLVED_PHONE_TEST_CONTEXT } from "../../../../foundation/common/test-utils";
import type { SurfacePostures } from "../../../../foundation/contracts/postures";

afterEach(cleanup);

function renderSlot(
  postures: SurfacePostures | undefined,
  child: React.ReactElement,
  asChild = true
) {
  return render(
    <ResponsiveContext.Provider value={RESOLVED_PHONE_TEST_CONTEXT}>
      <SurfacePostureScope postures={postures}>
        <div data-testid="layout" style={{ display: "grid" }}>
          <SurfacePostureSlot name="preview" asChild={asChild}>
            {child}
          </SurfacePostureSlot>
        </div>
      </SurfacePostureScope>
    </ResponsiveContext.Provider>
  );
}

describe("surface posture layout slots", () => {
  it("annotates the existing direct layout child and preserves its semantics and behavior", () => {
    const onClick = vi.fn();
    const ref = React.createRef<HTMLElement>();
    const { getByTestId } = renderSlot(
      { phone: {} },
      <section
        ref={ref}
        className="preview-track"
        aria-label="Record preview"
        style={{ gridColumn: "2" }}
      >
        <button onClick={onClick}>Open preview</button>
      </section>
    );
    const layout = getByTestId("layout");
    expect(layout.children).toHaveLength(1);
    const preview = layout.firstElementChild as HTMLElement;
    expect(preview.tagName).toBe("SECTION");
    expect(preview).toHaveClass("preview-track");
    expect(preview).toHaveAttribute("aria-label", "Record preview");
    expect(preview).not.toHaveAttribute("role");
    expect(preview.style.gridColumn).toBe("2");
    expect(preview).toHaveAttribute("data-surface-region", "preview");
    expect(ref.current).toBe(preview);
    fireEvent.click(preview.querySelector("button")!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("retains an empty existing container with its geometry and landmark when collapsed", () => {
    const { getByTestId } = renderSlot(
      { phone: { regions: { preview: "collapse" } } },
      <aside
        aria-label="Record preview"
        className="preview-track"
        style={{ width: 320 }}
      >
        <button>Hidden control</button>
      </aside>
    );
    const preview = getByTestId("layout").firstElementChild as HTMLElement;
    expect(preview.tagName).toBe("ASIDE");
    expect(preview).toHaveAttribute("aria-label", "Record preview");
    expect(preview).toHaveAttribute("data-region-disposition", "collapse");
    expect(preview.style.width).toBe("320px");
    expect(preview).toBeEmptyDOMElement();
  });

  it("removes a hidden container and its controls entirely", () => {
    const { getByTestId } = renderSlot(
      { phone: { regions: { preview: "hide" } } },
      <aside>
        <button>Hidden control</button>
      </aside>
    );
    expect(getByTestId("layout")).toBeEmptyDOMElement();
  });

  it("adds no element or posture attributes when declarations are omitted", () => {
    const { getByTestId } = renderSlot(
      undefined,
      <aside className="original">Preview</aside>
    );
    const layout = getByTestId("layout");
    expect(layout.children).toHaveLength(1);
    expect(layout.firstElementChild).toHaveClass("original");
    expect(layout.firstElementChild).not.toHaveAttribute("data-surface-region");
  });

  it("keeps the named landmark wrapper for content slots", () => {
    const { getByTestId } = renderSlot(
      { phone: {} },
      <span>Preview</span>,
      false
    );
    const preview = getByTestId("layout").firstElementChild;
    expect(preview?.tagName).toBe("DIV");
    expect(preview).toHaveAttribute("role", "region");
    expect(preview).toHaveAttribute("aria-label", "preview");
  });
});
