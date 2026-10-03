import { readFileSync } from "node:fs";
import { join } from "node:path";

import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernInput from "../engines/modern";
import { InputAddon } from "../compound/addon";
import { InputGroup } from "../compound/group";
import { InputTextArea } from "../compound/text-area";

const skin = readFileSync(
  join(
    __dirname,
    "../../../../../foundation/tokens/css/presentation/components/skin/input-compounds/index.css"
  ),
  "utf-8"
).replace(/\/\*[\s\S]*?\*\//g, "");

function rules(): Array<{ selector: string; body: string }> {
  const out: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(skin)) !== null) {
    out.push({ selector: match[1].trim(), body: match[2].trim() });
  }
  return out;
}

const INPUT_DIM = "opacity: var(--ds-input-disabled-opacity, var(--ds-state-disabled-opacity));";
const SELECT_DIM = "opacity: var(--ds-select-disabled-opacity, var(--ds-state-disabled-opacity));";

describe("Input compounds: disabled dimming follows the states dial", () => {
  it("a joined addon sits beside the disabled field the seam rule selects", () => {
    const { container } = render(
      <InputGroup compact>
        <InputAddon position="before">https://</InputAddon>
        <ModernInput disabled aria-label="Domain" />
        <InputAddon position="after">.com</InputAddon>
      </InputGroup>
    );

    const group = container.querySelector(".ds-input-group[data-part='group']");
    expect(group).toHaveAttribute("data-compact", "true");

    const children = Array.from(group?.children ?? []);
    expect(children).toHaveLength(3);
    const [before, field, after] = children;
    expect(before.matches(".ds-input-addon[data-part='root']")).toBe(true);
    expect(after.matches(".ds-input-addon[data-part='root']")).toBe(true);
    expect(field.matches(".ds-input-field")).toBe(true);
    expect(field.querySelector("[data-disabled='true']")).not.toBeNull();
    expect(field.querySelector("input")).toBeDisabled();
  });

  it("the addon dims with the disabled input it is joined to", () => {
    const seam = rules().filter(
      ({ selector }) =>
        selector.includes(".ds-input-addon[data-part='root']") &&
        selector.includes(".ds-input-field") &&
        selector.includes("[data-disabled='true']")
    );
    expect(seam).toHaveLength(1);
    expect(seam[0].selector).toContain(":has(+ .ds-input-field [data-disabled='true'])");
    expect(seam[0].selector).toContain(
      ".ds-input-field:has([data-disabled='true']) + .ds-input-addon[data-part='root']"
    );
    expect(seam[0].body).toContain(INPUT_DIM);
  });

  it("the addon dims with the disabled select it is joined to", () => {
    const seam = rules().filter(
      ({ selector }) =>
        selector.includes(".ds-input-addon[data-part='root']") &&
        selector.includes(".ds-select-shell[data-disabled='true']")
    );
    expect(seam).toHaveLength(1);
    expect(seam[0].body).toContain(SELECT_DIM);
  });

  it("a disabled TextArea stamps the anatomy its dimming rule selects", () => {
    const { container } = render(<InputTextArea disabled aria-label="Notes" />);

    const root = container.querySelector(".ds-input-textarea[data-part='root']");
    expect(root).toHaveAttribute("data-disabled", "true");
    const control = root?.querySelector("[data-part='control']");
    expect(control?.tagName).toBe("TEXTAREA");
    expect(control).toBeDisabled();

    const dim = rules().filter(
      ({ selector }) =>
        selector === ".ds-input-textarea[data-part='root'][data-disabled='true'] [data-part='control']"
    );
    expect(dim.some(({ body }) => body.includes(INPUT_DIM))).toBe(true);
  });

  it("no compound rule dims through a literal opacity", () => {
    const literal = rules().filter(({ body }) => /(^|;)\s*opacity:\s*[\d.]/.test(body));
    expect(literal).toEqual([]);
  });
});
