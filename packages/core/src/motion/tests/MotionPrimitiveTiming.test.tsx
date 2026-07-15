import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FadeIn } from "../primitives/fade-in";
import { ScaleIn } from "../primitives/scale-in";
import { SlideIn } from "../primitives/slide-in";
import { StaggerChildren } from "../primitives/stagger-children";
import { TextReveal } from "../primitives/text-reveal";

interface MotionCall {
  tag: "div" | "span";
  props: Record<string, unknown>;
}

const motionCalls = vi.hoisted(() => [] as MotionCall[]);
const personality = vi.hoisted(() => ({
  shouldReduceMotion: false as boolean | null,
  entrance: "fade" as "none" | "fade" | "slideUp" | "spring" | "bounce",
  useSpring: false,
  durationSeconds: 0.2,
  delaySeconds: 0.04,
  offsetDistance: 18,
  initialScale: 0.94,
  springTension: 170,
  springFriction: 26,
  countUpEnabled: true,
}));

vi.mock("../hooks", () => ({
  useMotionPersonality: () => personality,
}));

vi.mock("motion/react", async () => {
  const ReactModule = await import("react");

  const makeMotionElement = (tag: MotionCall["tag"]) =>
    ReactModule.forwardRef<HTMLElement, Record<string, unknown>>(
      function MotionTestElement(props, ref) {
        motionCalls.push({ tag, props });
        const {
          animate: _animate,
          initial: _initial,
          transition: _transition,
          transformTemplate: _transformTemplate,
          variants: _variants,
          viewport: _viewport,
          whileInView: _whileInView,
          ...domProps
        } = props;
        return ReactModule.createElement(tag, { ...domProps, ref });
      }
    );

  return {
    motion: {
      div: makeMotionElement("div"),
      span: makeMotionElement("span"),
    },
  };
});

function lastCall(tag: MotionCall["tag"] = "div"): MotionCall {
  const call = [...motionCalls]
    .reverse()
    .find((candidate) => candidate.tag === tag);
  if (!call) throw new Error(`No motion.${tag} call captured`);
  return call;
}

beforeEach(() => {
  motionCalls.length = 0;
  Object.assign(personality, {
    shouldReduceMotion: false,
    entrance: "fade",
    useSpring: false,
    durationSeconds: 0.2,
    delaySeconds: 0.04,
  });
});

afterEach(() => cleanup());

describe("public motion primitive timing", () => {
  it("maps canonical FadeIn timing exactly once from ms to seconds", () => {
    const { container } = render(
      <FadeIn durationMs={200} delayMs={80}>
        content
      </FadeIn>
    );
    const transition = lastCall().props.transition as Record<string, unknown>;

    expect(transition).toMatchObject({ duration: 0.2, delay: 0.08 });
    expect(
      container.querySelector('[data-ds-motion-primitive="fade-in"]')
    ).not.toBeNull();
    expect(lastCall().props["data-ds-motion-state"]).toBe("entrance");
  });

  it("keeps legacy seconds and legacy millisecond values compatible", () => {
    const { rerender } = render(
      <SlideIn duration={0.32} delay={0.12}>
        legacy seconds
      </SlideIn>
    );
    expect(lastCall().props.transition).toMatchObject({
      duration: 0.32,
      delay: 0.12,
    });

    motionCalls.length = 0;
    rerender(
      <ScaleIn duration={500} delay={80}>
        legacy milliseconds
      </ScaleIn>
    );
    expect(lastCall().props.transition).toMatchObject({
      duration: 0.5,
      delay: 0.08,
    });
  });

  it("uses a duration-based spring without competing physics when timing is explicit", () => {
    Object.assign(personality, { entrance: "spring", useSpring: true });
    render(<FadeIn durationMs={320}>spring</FadeIn>);

    const transition = lastCall().props.transition as Record<string, unknown>;
    expect(transition).toMatchObject({ type: "spring", duration: 0.32 });
    expect(transition).not.toHaveProperty("stiffness");
    expect(transition).not.toHaveProperty("damping");
  });

  it("keeps personality spring physics when no duration override exists", () => {
    Object.assign(personality, { entrance: "spring", useSpring: true });
    render(<ScaleIn>spring</ScaleIn>);

    const transition = lastCall().props.transition as Record<string, unknown>;
    expect(transition).toMatchObject({
      type: "spring",
      stiffness: 170,
      damping: 26,
    });
    expect(transition).not.toHaveProperty("duration");
  });

  it("consumes StaggerChildren duration, delay, child timing and once", () => {
    render(
      <StaggerChildren
        durationMs={320}
        delayMs={80}
        staggerDelayMs={120}
        delayChildrenMs={200}
        once={false}
      >
        <div>one</div>
      </StaggerChildren>
    );

    const call = lastCall();
    const variants = call.props.variants as {
      visible: { transition: Record<string, unknown> };
    };
    expect(variants.visible.transition).toMatchObject({
      duration: 0.32,
      delay: 0.08,
      staggerChildren: 0.12,
      delayChildren: 0.2,
    });
    expect(call.props.viewport).toMatchObject({ once: false });
  });

  it.each([
    ["fade-in", <FadeIn style={{ color: "red", transform: "rotate(8deg)" }}>fade</FadeIn>],
    ["slide-in", <SlideIn style={{ color: "red", transform: "rotate(8deg)" }}>slide</SlideIn>],
    ["scale-in", <ScaleIn style={{ color: "red", transform: "rotate(8deg)" }}>scale</ScaleIn>],
    [
      "stagger-children",
      <StaggerChildren style={{ color: "red", transform: "rotate(8deg)" }}>
        stagger
      </StaggerChildren>,
    ],
  ])("composes caller transforms with %s Motion transforms", (primitive, node) => {
    render(node);
    const call = motionCalls.find(
      (candidate) => candidate.props["data-ds-motion-primitive"] === primitive
    );
    const transformTemplate = call?.props.transformTemplate as
      | ((latest: Record<string, unknown>, generated: string) => string)
      | undefined;

    expect(call?.props.style).toEqual({ color: "red" });
    expect(transformTemplate?.({}, "translateY(18px)")).toBe(
      "translateY(18px) rotate(8deg)"
    );
    expect(transformTemplate?.({}, "none")).toBe("rotate(8deg)");
  });

  it("makes TextReveal duration the total segment choreography time", () => {
    render(<TextReveal text="abc" durationMs={300} delayMs={80} />);

    const container = motionCalls.find((call) => call.tag === "div");
    const containerVariants = container?.props.variants as {
      visible: { transition: Record<string, unknown> };
    };
    const segment = motionCalls.find((call) => call.tag === "span");
    expect(containerVariants.visible.transition).toMatchObject({
      delayChildren: 0.08,
      staggerChildren: 0.1,
    });
    expect(segment?.props.transition).toMatchObject({ duration: 0.1 });
  });

  it.each([
    ["fade-in", <FadeIn>fade</FadeIn>],
    ["slide-in", <SlideIn>slide</SlideIn>],
    ["scale-in", <ScaleIn>scale</ScaleIn>],
    [
      "stagger-children",
      <StaggerChildren>
        <div>stagger</div>
      </StaggerChildren>,
    ],
    ["text-reveal", <TextReveal text="text" />],
  ])(
    "renders %s in its final state immediately under reduced motion",
    (primitive, node) => {
      personality.shouldReduceMotion = true;
      const { container } = render(node);
      const call = motionCalls.find(
        (candidate) => candidate.props["data-ds-motion-primitive"] === primitive
      );

      expect(call?.props.initial).toBe(false);
      expect(call?.props["data-ds-motion-state"]).toBe("static");
      expect(
        container.querySelector(`[data-ds-motion-primitive="${primitive}"]`)
      ).not.toBeNull();
    }
  );
});
