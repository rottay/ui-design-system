import React from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { StableEngineName } from "@tests/support/engine";
import {
  STABLE_ENGINES,
  renderWithEngine,
} from "@tests/support/engine";
import { mockMatchMedia } from "@tests/support/browser/match-media";
import type { StatsGridProps } from "../contracts";
import ClassicStatsGrid from "../engines/classic";
import ModernStatsGrid from "../engines/modern";
import RusticStatsGrid from "../engines/rustic";
import { SKELETON_PART_ROLES } from "../../../../primitives/feedback/skeleton/runtime/anatomy-renderer";

const COMPONENTS: Record<
  StableEngineName,
  React.ComponentType<StatsGridProps>
> = {
  classic: ClassicStatsGrid,
  modern: ModernStatsGrid,
  rustic: RusticStatsGrid,
};

const stats = [
  {
    key: "revenue",
    label: "Revenue",
    value: 4200,
    prefix: "$",
    change: 12,
    changeType: "increase" as const,
    description: "Monthly recurring revenue",
    sparklineData: [12, 18, 22, 28, 34],
    color: "#2563eb",
  },
  {
    key: "churn",
    label: "Churn",
    value: "2.1%",
    change: -1.4,
    changeType: "decrease" as const,
    description: "Customer churn rate",
  },
  {
    key: "latency",
    label: "Latency",
    value: 182,
    suffix: "ms",
    icon: <span>⚡</span>,
  },
];

function createProps(overrides: Partial<StatsGridProps> = {}): StatsGridProps {
  return {
    stats,
    columns: 3,
    animate: false,
    ...overrides,
  };
}

describe("PatternStatsGrid advanced engine coverage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(STABLE_ENGINES)(
    "covers loading states through the %s engine",
    async (engine) => {
      const Component = COMPONENTS[engine];
      const { container } = renderWithEngine(
        <Component {...createProps()} loading />,
        engine
      );

      expect(screen.queryByText("Revenue")).not.toBeInTheDocument();

      if (engine === "classic") {
        expect(container.querySelector(".ant-card-loading")).not.toBeNull();
      } else if (engine === "modern") {
        // Built by the shared anatomy renderer from the grid's own parts: the
        // hand-made skeleton is gone, and every placeholder card reads as the
        // loaded card's title, value and trend.
        expect(container.querySelector(".ds-stats-grid-skeleton")).toBeNull();
        const renderer = container.querySelector(".ds-skeleton-anatomy");
        expect(renderer).not.toBeNull();
        expect(renderer).toHaveAttribute("aria-busy", "true");
        const root = await waitFor(() => {
          const found = renderer?.querySelector(
            '.ds-pattern-stats-grid.ds-engine-modern[data-part="root"]'
          );
          expect(found).not.toBeNull();
          return found;
        });
        expect(root).toHaveAttribute("data-loading", "true");
        expect(root).toHaveAttribute("data-auto-fit", "true");
        expect(root?.querySelectorAll('[data-part="card"]')).toHaveLength(3);
        const bones = () =>
          Array.from(
            container.querySelectorAll<HTMLElement>("[data-part='bone']")
          ).map((bone) => `${bone.dataset.sourcePart}:${bone.dataset.bone}`);
        await waitFor(() => expect(bones().length).toBeGreaterThan(1));
        // Every placeholder part is adjudicated, none is read by fall-through.
        const parts = new Set(
          Array.from(root!.querySelectorAll<HTMLElement>("[data-part]")).map(
            (node) => node.dataset.part!
          )
        );
        expect([...parts].filter((part) => !(part in SKELETON_PART_ROLES))).toEqual([]);
        expect(bones()).toEqual([
          "root:frame",
          ...Array.from({ length: 3 }, () => [
            "title:line",
            "value:line",
            "trend:block",
          ]).flat(),
        ]);
      } else {
        const root = container.querySelector(
          ".ds-pattern-stats-grid.ds-engine-rustic"
        );
        expect(root).toHaveAttribute("data-loading", "true");
        expect(root?.getAttribute("data-skeleton-animation")).toMatch(
          /^(pulse|wave)$/
        );
        expect(
          root?.querySelector('[data-part="skeleton-bar"]')
        ).not.toBeNull();
        expect(container.querySelector("style")).toBeNull();
      }
    }
  );

  // The viewport ladder is the frozen engines' layout; Modern lays out with
  // the adaptive layout kit's auto-fit recipe (next test).
  it.each(["classic", "rustic"] as const)(
    "renders the shared phone/tablet/desktop column progression through the %s engine",
    async (engine) => {
      const Component = COMPONENTS[engine];
      const cases = [
        { width: 390, columns: 4, expected: "repeat(1, minmax(0, 1fr))" },
        { width: 800, columns: 4, expected: "repeat(2, minmax(0, 1fr))" },
        { width: 1280, columns: 3, expected: "repeat(3, minmax(0, 1fr))" },
      ] as const;

      for (const responsiveCase of cases) {
        mockMatchMedia(responsiveCase.width);
        const result = renderWithEngine(
          <Component {...createProps({ columns: responsiveCase.columns })} />,
          engine
        );
        const root = result.container.firstElementChild as HTMLElement;

        await waitFor(() => {
          expect(root.style.gridTemplateColumns).toBe(responsiveCase.expected);
        });
        expect(root.style.width).toBe("100%");
        expect(root.style.minWidth).toBe("0");
        result.unmount();
      }
    }
  );

  it("lays the modern root out with the auto-fit recipe, with no viewport ladder of its own", async () => {
    for (const width of [390, 800, 1280]) {
      mockMatchMedia(width);
      const result = renderWithEngine(
        <ModernStatsGrid {...createProps({ columns: 4 })} />,
        "modern"
      );
      const root = result.container.firstElementChild as HTMLElement;

      expect(root).toHaveAttribute("data-component", "grid");
      expect(root).toHaveAttribute("data-auto-fit", "true");
      expect(root).toHaveAttribute("data-part", "root");
      await waitFor(() => {
        expect(root.getAttribute("data-posture")).toBeTruthy();
      });
      // The tracks are the grid skin's: no inline template, at any width.
      expect(root.style.gridTemplateColumns).toBe("");
      result.unmount();
    }
  });

  it("threads minItem and a posture-declared delta into the modern grid", async () => {
    mockMatchMedia(1280);
    const result = renderWithEngine(
      <ModernStatsGrid
        {...createProps({ minItem: "lg", adapt: { compact: { minItem: "sm" } } })}
      />,
      "modern"
    );
    const root = result.container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-min-item", "lg");
    result.unmount();
  });

  it.each(STABLE_ENGINES)(
    "preserves an explicit gridTemplateColumns style override through the %s engine",
    (engine) => {
      mockMatchMedia(390);
      const Component = COMPONENTS[engine];
      const explicitColumns = "repeat(3, minmax(12rem, 1fr))";
      const { container } = renderWithEngine(
        <Component
          {...createProps({
            columns: 6,
            style: { gridTemplateColumns: explicitColumns },
          })}
        />,
        engine
      );

      expect(
        (container.firstElementChild as HTMLElement).style.gridTemplateColumns
      ).toBe(explicitColumns);
    }
  );

  it.each(STABLE_ENGINES)(
    "covers variants, sparklines, render overrides, click handling and animation branches through the %s engine",
    async (engine) => {
      const Component = COMPONENTS[engine];
      const onStatClick = vi.fn();
      const nowSpy = vi.spyOn(performance, "now").mockReturnValue(0);
      const requestAnimationFrameSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((callback: FrameRequestCallback) => {
          callback(1000);
          return 1;
        });

      const { rerender, container } = renderWithEngine(
        <Component
          {...createProps({
            animate: true,
            sparkline: true,
            variant: "outlined",
            onStatClick,
            renderStat: (stat, defaultRender) =>
              stat.key === "revenue" ? (
                <div data-testid="custom-stat" data-part="value">
                  {defaultRender}
                </div>
              ) : (
                defaultRender
              ),
          })}
        />,
        engine
      );

      expect(await screen.findByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("Churn")).toBeInTheDocument();
      expect(screen.getByTestId("custom-stat")).toBeInTheDocument();
      expect(container.querySelector("polyline")).not.toBeNull();

      if (engine === "modern") {
        // The metric anatomy composes the certified Statistic primitive: the
        // value part is primitive-owned (its composed root carries the
        // primitive scope class; the retired pattern class is gone). The
        // trend pill stays pattern-owned.
        expect(screen.getByTestId("custom-stat")).not.toHaveClass(
          "ds-stats-grid__value"
        );
        const valuePart = container.querySelector(
          '.ds-stats-grid__card [data-part="value"]'
        );
        expect(valuePart).not.toBeNull();
        expect(valuePart).not.toHaveClass("ds-stats-grid__value");
        expect(valuePart?.closest('[data-part="root"]')).toHaveClass(
          "rottay-statistic--modern"
        );
        expect(
          container.querySelector('.ds-stats-grid__card [data-part="trend"]')
        ).toHaveClass("ds-stats-grid__trend");
      } else if (engine !== "classic") {
        expect(screen.getByTestId("custom-stat")).not.toHaveClass(
          "ds-stats-grid__value"
        );
        expect(
          container.querySelector('.ds-stats-grid__card [data-part="value"]')
        ).toHaveClass("ds-stats-grid__value");
        expect(
          container.querySelector('.ds-stats-grid__card [data-part="trend"]')
        ).toHaveClass("ds-stats-grid__trend");
      }

      fireEvent.click(screen.getByText("Revenue"));
      expect(onStatClick).toHaveBeenCalledWith(
        expect.objectContaining({ key: "revenue" })
      );

      const keyboardTargets = screen.queryAllByRole("button");
      if (keyboardTargets[0]) {
        fireEvent.keyDown(keyboardTargets[0], { key: "Enter" });
        expect(onStatClick).toHaveBeenCalled();
      }

      act(() => {
        rerender(
          <Component
            {...createProps({ animate: true, variant: "filled", onStatClick })}
          />
        );
      });
      expect(await screen.findByText("Latency")).toBeInTheDocument();

      act(() => {
        rerender(
          <Component
            {...createProps({ animate: true, variant: "glass", onStatClick })}
          />
        );
      });
      expect(
        await screen.findByText("Monthly recurring revenue")
      ).toBeInTheDocument();

      if (engine === "modern") {
        // The count-up is delegated to the certified CountUp motion
        // primitive, which is viewport-gated (IntersectionObserver): in this
        // environment no frame is scheduled, so the animation branch is
        // pinned by the primitive's presence instead of a raw rAF call.
        expect(
          container.querySelectorAll('[data-ds-motion-primitive="count-up"]')
            .length
        ).toBeGreaterThan(0);
      } else {
        expect(requestAnimationFrameSpy).toHaveBeenCalled();
      }

      requestAnimationFrameSpy.mockRestore();
      nowSpy.mockRestore();
    }
  );

  it("preserves rustic last-event-wins hover/focus behavior without imperative paint", () => {
    const { container } = renderWithEngine(
      <RusticStatsGrid {...createProps({ onStatClick: vi.fn() })} />,
      "rustic"
    );
    const card = container.querySelector<HTMLElement>(".ds-stats-grid__card");

    expect(card).not.toBeNull();
    expect(card).not.toHaveAttribute("data-shadow-state");
    expect(card).not.toHaveAttribute("data-transform-state");

    fireEvent.focus(card!);
    expect(card).toHaveAttribute("data-shadow-state", "focus");
    expect(card).not.toHaveAttribute("data-transform-state");

    fireEvent.mouseEnter(card!);
    expect(card).toHaveAttribute("data-shadow-state", "hover");
    expect(card).toHaveAttribute("data-transform-state", "hover");

    fireEvent.blur(card!);
    expect(card).toHaveAttribute("data-shadow-state", "rest");
    expect(card).toHaveAttribute("data-transform-state", "hover");

    fireEvent.mouseLeave(card!);
    expect(card).toHaveAttribute("data-shadow-state", "rest");
    expect(card).toHaveAttribute("data-transform-state", "rest");

    fireEvent.focus(card!);
    fireEvent.mouseLeave(card!);
    expect(card).toHaveAttribute("data-shadow-state", "rest");
    expect(card).toHaveAttribute("data-transform-state", "rest");
  });
});
