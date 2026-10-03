import { readFileSync } from "node:fs";
import { join } from "node:path";

import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import ModernButton from "../engines/modern";

const CSS_ROOT = join(__dirname, "../../../../../foundation/tokens/css");
const read = (path: string) => readFileSync(join(CSS_ROOT, path), "utf-8").replace(/\/\*[\s\S]*?\*\//g, "");

const channels = read("presentation/components/button/index.css");
const skin = read("runtime/engines/modern/skin/button/index.css");

const CHANNEL = "--ds-button-disabled-opacity";

function rules(css: string): Array<{ selector: string; body: string }> {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] as string).trim(),
    body: (match[2] as string).trim(),
  }));
}

describe("Button: disabled dimming follows the states dial", () => {
  it("the channel is declared once, at the root, as the dial itself", () => {
    const declaring = rules(channels).filter(({ body }) => new RegExp(`(^|[;\\s])${CHANNEL}\\s*:`).test(body));
    expect(declaring.map(({ selector }) => selector)).toEqual([":root"]);
    const values = [...channels.matchAll(new RegExp(`${CHANNEL}\\s*:\\s*([^;]+);`, "g"))].map((match) =>
      (match[1] as string).trim()
    );
    expect(values).toEqual(["var(--ds-state-disabled-opacity)"]);
  });

  it("the skin dims the disabled control through that channel and nowhere else", () => {
    const readers = rules(skin).filter(({ body }) => body.includes(`var(${CHANNEL}`));
    expect(readers.map(({ selector }) => selector)).toEqual([".ds-button.ds-button--modern[data-disabled='true']"]);
    expect(readers[0]?.body).toContain(`opacity: var(${CHANNEL});`);
  });

  it("a disabled Button stamps the anatomy the dimming rule selects", () => {
    render(<ModernButton disabled>Save</ModernButton>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button.matches(".ds-button.ds-button--modern[data-disabled='true']")).toBe(true);
  });

  it("an enabled or busy Button is not selected by the disabled dimming rule", () => {
    render(
      <>
        <ModernButton>Open</ModernButton>
        <ModernButton pending>Send</ModernButton>
      </>
    );
    for (const button of screen.getAllByRole("button")) {
      expect(button.matches("[data-disabled='true']")).toBe(false);
    }
  });
});
