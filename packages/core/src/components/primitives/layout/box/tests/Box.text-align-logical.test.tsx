/**
 * The public alignment vocabulary is logical: `textAlign` takes
 * `start | center | end | justify`, which follow the reading direction, and
 * the physical `left` / `right` spellings are not part of the contract.
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernBox from "../engines/modern";
import type { BoxProps } from "../contracts";

type Accepts<T> = T extends NonNullable<BoxProps["textAlign"]> ? true : false;

describe("Box logical text alignment", () => {
  it("refuses the physical spellings at the type level", () => {
    const refusesLeft: Accepts<"left"> = false;
    const refusesRight: Accepts<"right"> = false;
    const acceptsStart: Accepts<"start"> = true;

    expect([refusesLeft, refusesRight, acceptsStart]).toEqual([false, false, true]);
  });

  it("passes the logical vocabulary through unchanged", () => {
    for (const logical of ["start", "center", "end", "justify"] as const) {
      const { getByRole, unmount } = render(
        <ModernBox role="region" aria-label={`Logical ${logical}`} textAlign={logical} />
      );

      expect(getByRole("region").style.textAlign).toBe(logical);
      unmount();
    }
  });

  it("emits no alignment at all when the prop is absent", () => {
    const { getByRole } = render(<ModernBox role="region" aria-label="Unset" />);

    expect(getByRole("region").style.textAlign).toBe("");
  });
});
