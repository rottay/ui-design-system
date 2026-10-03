import { describe, expect, it } from "vitest";

import {
  motionMillisecondsToSeconds,
  resolveMotionMilliseconds,
} from "..";

describe("motion timing", () => {
  it.each([
    [80, 0.08],
    [120, 0.12],
    [200, 0.2],
    [320, 0.32],
    [500, 0.5],
    [900, 0.9],
  ])("maps canonical %dms to %ss exactly", (milliseconds, seconds) => {
    const resolved = resolveMotionMilliseconds({
      milliseconds,
      fallbackMilliseconds: 320,
    });

    expect(resolved).toBe(milliseconds);
    expect(motionMillisecondsToSeconds(resolved)).toBe(seconds);
  });

  it.each([0.08, 0.5, 1, 2, 10])(
    "reads %d as milliseconds, never as seconds",
    (milliseconds) => {
      expect(
        resolveMotionMilliseconds({ milliseconds, fallbackMilliseconds: 320 })
      ).toBe(milliseconds);
    }
  );

  it("keeps zero intentional and falls back when no value is supplied", () => {
    expect(
      resolveMotionMilliseconds({
        milliseconds: 120,
        fallbackMilliseconds: 320,
      })
    ).toBe(120);
    expect(
      resolveMotionMilliseconds({
        milliseconds: 0,
        fallbackMilliseconds: 320,
      })
    ).toBe(0);
    expect(resolveMotionMilliseconds({ fallbackMilliseconds: 320 })).toBe(320);
  });

  it("clamps negatives and falls back from non-finite inputs", () => {
    expect(
      resolveMotionMilliseconds({
        milliseconds: -120,
        fallbackMilliseconds: 320,
      })
    ).toBe(0);
    expect(
      resolveMotionMilliseconds({
        milliseconds: Number.NaN,
        fallbackMilliseconds: 320,
      })
    ).toBe(320);
    expect(
      resolveMotionMilliseconds({
        milliseconds: Number.POSITIVE_INFINITY,
        fallbackMilliseconds: 500,
      })
    ).toBe(500);
  });
});
