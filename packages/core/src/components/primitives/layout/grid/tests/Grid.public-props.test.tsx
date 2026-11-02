import React from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Grid } from "@/components/primitives/layout/grid";

describe("Grid public props", () => {
  // Omit over the engine props (ComponentPropsWithoutRef) lets the data-*/aria-* index
  // signatures absorb these four literal members; typecheck:tests pins it.
  it("keeps the literal members apart from the data-*/aria-* index signatures", () => {
    type PublicProps = React.ComponentProps<typeof Grid>;
    expectTypeOf<PublicProps["aria-label"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<PublicProps["aria-describedby"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<PublicProps["data-part"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<PublicProps["data-testid"]>().toEqualTypeOf<string | undefined>();

    // @ts-expect-error `aria-label` takes a string
    const label = <Grid aria-label={5} />;
    // @ts-expect-error `aria-describedby` takes a string
    const description = <Grid aria-describedby={5} />;
    // @ts-expect-error `data-part` takes a string
    const part = <Grid data-part={5} />;
    // @ts-expect-error `data-testid` takes a string
    const testId = <Grid data-testid={5} />;
    const indexed: PublicProps = { "data-count": 5, "aria-expanded": true };

    expect([label, description, part, testId, <Grid {...indexed} />].every(React.isValidElement)).toBe(true);
  });
});
