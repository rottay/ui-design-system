import { describe, expect, it } from "vitest";

import {
  ReservedTenantIdentityError,
  assertTenantIdentityAllowed,
  classifyTenantIdentity,
  getFirstPartyIdentity,
  normalizeIdentityFingerprint,
} from "../ts/presentation/brand-themes";

describe("first-party tenant identity", () => {
  /* Every row here renders on screen as the reserved name: case, spacing and
     punctuation aside, what a human reads is "BitHire". The invisible rows are
     the interesting ones -- each is a different way to smuggle a no-width
     codepoint into the string, and each must fold away. */
  it.each([
    "BitHire",
    "bithire",
    "BITHIRE",
    "Bit Hire",
    "bit-hire",
    "bit.hire",
    "bit\u200dhire", // ZWJ
    "Bit\u200bHire", // zero-width space
    "Bit\u00adHire", // soft hyphen
    "Bit\u2060Hire", // word joiner
    "Bit\u034fHire", // combining grapheme joiner: a \p{M} mark that renders as nothing
    "Bit\ufe0fHire", // variation selector 16
    "Bit\u3164Hire", // Hangul filler; NFKC folds it to another invisible filler
    "Bit\u202EHire", // RLO
    "Bit\u2066Hire", // LRI
    "\uFF22\uFF49\uFF54\uFF28\uFF49\uFF52\uFF45", // full-width, folded by NFKC
  ])("rejects the reserved identity variant %j", (value) => {
    expect(classifyTenantIdentity({ name: value })).toMatchObject({
      kind: "reserved-identity-violation",
      field: "name",
    });
    expect(() => assertTenantIdentityAllowed({ slug: value })).toThrow(
      ReservedTenantIdentityError,
    );
  });

  /* The other half of the contract, and the half a blunt normalizer fails: a
     name a reader would NOT confuse with the reserved one has to get through.
     Erasing every `\p{M}` and `\p{S}` would reject all of these -- turning an
     impersonation gate into a refusal to sell to anyone whose brand carries an
     accent or a trademark sign. */
  it.each([
    "B\u0338itHire", // a visible slash struck through the B
    "B\u00eftHire", // precomposed i-diaeresis
    "Bi\u0301tHire", // combining acute, kept by NFKC on a letter that has no precomposed form
    "BitHire\u2122", // trademark sign: \p{S}, and part of the name
    "Bit+Hire",
    "R\u00f6ttay",
    "Evnto\u00ae",
  ])("admits the non-equivalent name %j", (value) => {
    expect(classifyTenantIdentity({ name: value })).toEqual({ kind: "customer" });
    expect(() =>
      assertTenantIdentityAllowed({ slug: "acme", name: value, companyName: value }),
    ).not.toThrow();
  });

  it("allows a customer to build on a first-party vertical", () => {
    expect(() =>
      assertTenantIdentityAllowed({
        slug: "acme",
        name: "BitHire Labs",
        companyName: "BitHire Labs",
        verticalKey: "bithire",
      }),
    ).not.toThrow();
  });

  it("keeps the code-owned tuple lookup exact", () => {
    expect(getFirstPartyIdentity("bithire")).toEqual({
      slug: "bithire",
      verticalKey: "bithire",
      name: "BitHire",
    });
    expect(getFirstPartyIdentity("BitHire")).toBeUndefined();
    expect(normalizeIdentityFingerprint(" Bit-\u200dHire ")).toBe("bithire");
    // Invisibles fold away wherever they sit -- including the combining
    // grapheme joiner, which is a mark but has no glyph.
    expect(normalizeIdentityFingerprint("Ro\u034Ftt\u2066ay")).toBe("rottay");
    // A visible mark survives, so the name stays its own. NFKC composes it
    // onto the letter; the point is only that it does not vanish.
    expect(normalizeIdentityFingerprint("R\u0307ottay")).not.toBe("rottay");
    expect(normalizeIdentityFingerprint("R\u0307ottay")).toBe(
      "R\u0307ottay".normalize("NFKC").toLowerCase(),
    );
  });
});
