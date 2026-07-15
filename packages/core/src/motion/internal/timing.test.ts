import { describe, expect, it } from "vitest";

import {
  motionMillisecondsToSeconds,
  resolveMotionMilliseconds,
} from "./timing";

describe("motion timing compatibility", () => {
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
      legacy: 2,
      fallbackMilliseconds: 320,
    });

    expect(resolved).toBe(milliseconds);
    expect(motionMillisecondsToSeconds(resolved)).toBe(seconds);
  });

  it.each([
    [0.08, 80],
    [0.12, 120],
    [0.2, 200],
    [0.32, 320],
    [0.5, 500],
    [0.9, 900],
    [2, 2000],
  ])(
    "preserves the legacy %ss compatibility mapping as %dms",
    (legacy, milliseconds) => {
      expect(
        resolveMotionMilliseconds({ legacy, fallbackMilliseconds: 320 })
      ).toBe(milliseconds);
    }
  );

  it("treats legacy values above the compatibility window as milliseconds", () => {
    expect(
      resolveMotionMilliseconds({ legacy: 80, fallbackMilliseconds: 320 })
    ).toBe(80);
    expect(
      resolveMotionMilliseconds({ legacy: 900, fallbackMilliseconds: 320 })
    ).toBe(900);
  });

  it("lets explicit canonical timing win and keeps zero intentional", () => {
    expect(
      resolveMotionMilliseconds({
        milliseconds: 120,
        legacy: 2,
        fallbackMilliseconds: 320,
      })
    ).toBe(120);
    expect(
      resolveMotionMilliseconds({
        milliseconds: 0,
        legacy: 2,
        fallbackMilliseconds: 320,
      })
    ).toBe(0);
    expect(
      resolveMotionMilliseconds({ legacy: 0, fallbackMilliseconds: 320 })
    ).toBe(0);
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
        legacy: Number.NaN,
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
