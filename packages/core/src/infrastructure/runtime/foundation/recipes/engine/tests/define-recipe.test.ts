import { describe, expect, it } from "vitest";

import { defineRecipe } from "../index";

describe("defineRecipe (DS-S001 engine)", () => {
  const button = defineRecipe({
    name: "button",
    slots: { root: ["rottay-button", "rottay-button--modern"] },
    axes: {
      variant: {
        primary: { root: "rottay-button--primary" },
        ghost: { root: "rottay-button--ghost" },
      },
      size: {
        sm: { root: "rottay-button--sm" },
        md: { root: "rottay-button--md" },
      },
      shape: {
        default: { root: "rottay-button--default" },
        pill: { root: "rottay-button--pill" },
      },
      block: { true: { root: "rottay-button--block" } },
      loading: { true: { root: "rottay-button--loading" } },
      disabled: { true: { root: "rottay-button--disabled" } },
    },
    defaults: { variant: "primary", size: "md", shape: "default" },
  });

  it("keeps the legacy class order: base, then axes in declaration order, then extras", () => {
    const legacy = [
      "rottay-button",
      "rottay-button--modern",
      "rottay-button--ghost",
      "rottay-button--sm",
      "rottay-button--pill",
      "rottay-button--block",
      "rottay-button--loading",
      "app-extra",
    ].join(" ");
    expect(
      button.resolve(
        { variant: "ghost", size: "sm", shape: "pill", block: true, loading: true },
        { root: "app-extra" }
      ).root
    ).toBe(legacy);
  });

  it("applies defaults and omits unset boolean axes", () => {
    expect(button.resolve().root).toBe(
      "rottay-button rottay-button--modern rottay-button--primary rottay-button--md rottay-button--default"
    );
  });

  it("supports the degenerate static recipe", () => {
    const tabs = defineRecipe({
      name: "tabs",
      slots: { root: ["rottay-tabs", "rottay-tabs--modern"] },
      axes: {},
      defaults: {},
    });
    expect(tabs.resolve(undefined, { root: "custom" }).root).toBe(
      "rottay-tabs rottay-tabs--modern custom"
    );
    expect(tabs.resolve().root).toBe("rottay-tabs rottay-tabs--modern");
  });

  it("applies compound rules only when every named axis matches", () => {
    const card = defineRecipe({
      name: "card",
      slots: { root: "ds-card", header: "ds-card__header" },
      axes: {
        variant: {
          outlined: { root: "ds-card--outlined" },
          soft: { root: "ds-card--soft" },
        },
        interactive: { true: { root: "ds-card--interactive" } },
      },
      defaults: { variant: "outlined" },
      compound: [
        {
          when: { variant: "soft", interactive: true },
          apply: { root: "ds-card--soft-interactive", header: "ds-card__header--tight" },
        },
      ],
    });
    expect(card.resolve({ variant: "soft", interactive: true })).toEqual({
      root: "ds-card ds-card--soft ds-card--interactive ds-card--soft-interactive",
      header: "ds-card__header ds-card__header--tight",
    });
    expect(card.resolve({ variant: "soft" }).root).toBe("ds-card ds-card--soft");
  });

  it("exposes bounded metadata without any supplier surface", () => {
    expect(button.name).toBe("button");
    expect(button.slotNames).toEqual(["root"]);
    expect(button.axisNames).toEqual([
      "variant",
      "size",
      "shape",
      "block",
      "loading",
      "disabled",
    ]);
    expect(Object.keys(button).sort()).toEqual([
      "axisNames",
      "axisValues",
      "name",
      "resolve",
      "slotNames",
    ]);
    expect(button.axisValues.shape).toEqual(["default", "pill"]);
  });

  it("keeps axis and value bounds in the public TypeScript contract", () => {
    const compileTimeOnly = (): void => {
      button.resolve({ variant: "ghost", block: false });

      // @ts-expect-error unknown value is outside the authored variant domain
      button.resolve({ variant: "dangerous" });
      // @ts-expect-error a string axis does not accept a boolean
      button.resolve({ size: true });
      // @ts-expect-error an undeclared axis cannot cross the Rottay facade
      button.resolve({ density: "compact" });

      const tabs = defineRecipe({
        name: "tabs-static",
        slots: { root: "rottay-tabs" },
        axes: {},
        defaults: {},
      });
      // @ts-expect-error static recipes reject every undeclared axis
      tabs.resolve({ variant: "underline" });
    };

    expect(compileTimeOnly).toBeTypeOf("function");
  });
});
