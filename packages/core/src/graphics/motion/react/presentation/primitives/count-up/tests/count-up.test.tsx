import React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CountUp } from "..";
import { I18nProvider } from "@/infrastructure/runtime/i18n";

const personality = vi.hoisted(() => ({
  shouldReduceMotion: false as boolean | null,
  countUpEnabled: true,
}));
const inView = vi.hoisted(() => ({ current: true }));

vi.mock("@/graphics/motion/react/runtime", () => ({
  useMotionPersonality: () => personality,
}));

vi.mock("motion/react", () => ({
  useInView: () => inView.current,
}));

let nextFrameId = 1;
let frames: Array<{ id: number; callback: FrameRequestCallback }> = [];

function flushNextFrame(timestamp: number): void {
  const frame = frames.shift();
  if (!frame) throw new Error("No animation frame is scheduled");
  act(() => frame.callback(timestamp));
}

beforeEach(() => {
  frames = [];
  nextFrameId = 1;
  Object.assign(personality, {
    shouldReduceMotion: false,
    countUpEnabled: true,
  });
  inView.current = true;
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      const id = nextFrameId++;
      frames.push({ id, callback });
      return id;
    })
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => {
      frames = frames.filter((frame) => frame.id !== id);
    })
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CountUp final-first rendering", () => {
  it("renders the final value as the SSR/no-JS baseline and keeps tabular numerals", () => {
    inView.current = false;
    const { container } = render(
      <CountUp from={0} to={1250} prefix="$" suffix="+" />
    );

    expect(screen.getByText("$1,250+")).toHaveClass("ds-nums-tabular");
    expect(
      container.querySelector('[data-ds-motion-primitive="count-up"]')
    ).not.toBeNull();
    expect(frames).toHaveLength(0);
  });

  it("preserves fixed decimal precision in the final baseline and animation", () => {
    const { rerender } = render(
      <CountUp from={0} to={12.345} decimals={2} durationMs={200} />
    );

    expect(screen.getByText("0.00")).toBeInTheDocument();
    flushNextFrame(1000);
    flushNextFrame(1200);
    expect(screen.getByText("12.35")).toBeInTheDocument();

    personality.shouldReduceMotion = true;
    rerender(<CountUp from={0} to={7.5} decimals={2} durationMs={200} />);
    expect(screen.getByText("7.50")).toBeInTheDocument();
  });

  it("uses an explicit deterministic locale and falls back to standalone en-US", () => {
    inView.current = false;
    const { rerender } = render(
      <CountUp to={1234.5} decimals={1} locale="de-DE" />
    );
    expect(screen.getByText("1.234,5")).toBeInTheDocument();

    rerender(<CountUp to={1234.5} decimals={1} />);
    expect(screen.getByText("1,234.5")).toBeInTheDocument();
  });

  it("inherits the active I18nContext locale when no explicit locale is provided", () => {
    inView.current = false;
    const localeSpy = vi.spyOn(Number.prototype, "toLocaleString");

    render(
      <I18nProvider locale="fr">
        <CountUp to={1234.5} decimals={1} />
      </I18nProvider>
    );

    expect(localeSpy).toHaveBeenCalledWith(
      "fr",
      expect.objectContaining({
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    );
  });

  it("shows the final value immediately and schedules no work under reduced motion", () => {
    personality.shouldReduceMotion = true;
    render(<CountUp from={0} to={500} durationMs={900} />);

    expect(screen.getByText("500")).toBeInTheDocument();
    expect(frames).toHaveLength(0);
  });

  it("also stays final when the tenant disables count-up motion", () => {
    personality.countUpEnabled = false;
    render(<CountUp from={0} to={500} durationMs={900} />);

    expect(screen.getByText("500")).toBeInTheDocument();
    expect(frames).toHaveLength(0);
  });
});

describe("CountUp duration and cancellation", () => {
  it("honors canonical milliseconds and lands exactly on the target", () => {
    render(<CountUp from={0} to={100} durationMs={200} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    flushNextFrame(1000);
    flushNextFrame(1100);
    const halfway = Number(
      screen.getByText(/\d+/).textContent?.split(",").join("")
    );
    expect(halfway).toBeGreaterThan(50);
    expect(halfway).toBeLessThan(100);
    flushNextFrame(1200);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("preserves legacy seconds for one minor", () => {
    render(<CountUp from={0} to={100} duration={0.2} />);

    flushNextFrame(1000);
    flushNextFrame(1200);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("uses canonical timing when both canonical and deprecated props are supplied", () => {
    render(<CountUp from={0} to={100} durationMs={80} duration={2} />);

    flushNextFrame(1000);
    flushNextFrame(1080);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("cancels the scheduled frame when unmounted", () => {
    const { unmount } = render(<CountUp from={0} to={100} durationMs={900} />);
    const pendingFrameId = frames[0]?.id;

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(pendingFrameId);
    expect(frames).toHaveLength(0);
  });

  it("cancels a pending frame and jumps to the target when reduced motion turns on live", () => {
    const { rerender } = render(<CountUp from={0} to={100} durationMs={900} />);
    const pendingFrameId = frames[0]?.id;
    expect(screen.getByText("0")).toBeInTheDocument();

    personality.shouldReduceMotion = true;
    rerender(<CountUp from={0} to={100} durationMs={900} />);

    expect(cancelAnimationFrame).toHaveBeenCalledWith(pendingFrameId);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(frames).toHaveLength(0);

    personality.shouldReduceMotion = false;
    rerender(<CountUp from={0} to={100} durationMs={900} />);

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(frames).toHaveLength(0);
  });

  it("retargets a live value change from the last painted value instead of restarting at from", () => {
    const { rerender } = render(
      <CountUp from={0} to={100} durationMs={200} />
    );

    flushNextFrame(1000);
    flushNextFrame(1100);
    const beforeRetarget = Number(
      screen.getByText(/\d+/).textContent?.split(",").join("")
    );
    expect(beforeRetarget).toBeGreaterThan(0);
    expect(beforeRetarget).toBeLessThan(100);

    rerender(<CountUp from={0} to={200} durationMs={200} />);
    const afterRetarget = Number(
      screen.getByText(/\d+/).textContent?.split(",").join("")
    );
    expect(afterRetarget).toBe(beforeRetarget);
    expect(afterRetarget).not.toBe(0);

    flushNextFrame(1200);
    flushNextFrame(1300);
    const retargetedProgress = Number(
      screen.getByText(/\d+/).textContent?.split(",").join("")
    );
    expect(retargetedProgress).toBeGreaterThan(afterRetarget);
    expect(retargetedProgress).toBeLessThan(200);
  });

  it("honors delayMs using a cancelable timer", () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        const id = nextFrameId++;
        frames.push({ id, callback });
        return id;
      })
    );
    render(<CountUp from={0} to={100} durationMs={200} delayMs={120} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(frames).toHaveLength(0);
    act(() => vi.advanceTimersByTime(119));
    expect(frames).toHaveLength(0);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(frames).toHaveLength(1);
  });
});
