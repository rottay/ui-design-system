/**
 * The modern Input skin must key its paint on the CLASS, never on `data-part`.
 *
 * Under P-79 a caller replaced the anatomy part (`data-part={caller ?? 'root'}`),
 * so a `[data-part='root']` predicate silently dropped the whole skin for every
 * composer that labelled the field for its own selectors. Six families did
 * exactly that and painted nothing from this file. Under P-88 the shell always
 * keeps its own `root` part and a caller part never lands, so a rule keyed on
 * the CALLER's part is the one that would paint nothing.
 *
 * The contract is stated as an EQUALITY rather than as a match count: labelling
 * a field must not change which rules reach it. That is robust to the rules a
 * single fixture legitimately cannot satisfy (other sizes, variants, states,
 * at-rule conditions), which a raw "everything reaches" assertion would report
 * as dead paint.
 *
 * Every fixture is measured on a CLEAN document. The suite's `cleanup` runs
 * afterEach TEST, not after each render, so two renders in one test both sit in
 * `document` — and a document-scoped reading of the second would then be
 * satisfied by the first. That makes the equality below vacuous, and it is not
 * hypothetical: it silently inflated this lane's own first measurement.
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { cleanup, waitFor } from "@testing-library/react";

import { Input } from "..";
import {
  readSkinRules,
  unreachableSelectors,
  STATE_DEPENDENT,
  type SkinRule,
} from "@tests/support/skin-reachability";
import { renderWithEngine } from "@tests/support/engine";

const MODERN_SKIN_ROOT = "src/foundation/tokens/css/runtime/engines/modern/skin";
const RULES = readSkinRules("input", MODERN_SKIN_ROOT);

/** The shell is the paint owner; these are the rules keyed on it. */
const SHELL_ANCHOR = /^(input)?\.ds-input-shell\.ds-input-shell--modern/;
const shellRules = RULES.filter((rule) => SHELL_ANCHOR.test(rule.selector));

/** `unreachableSelectors` never judges a state-dependent selector, so this is
 *  the real denominator for any "how many reach" claim about a static fixture. */
const evaluable = shellRules.filter((rule) => !STATE_DEPENDENT.test(rule.selector));

/** The same rules as they were written before the fix, for the control. */
const rootKeyed: SkinRule[] = shellRules.map((rule) => ({
  ...rule,
  selector: rule.selector.replace(SHELL_ANCHOR, "$&[data-part='root']"),
}));

/** The same rules keyed on a caller's own part: the P-88 negative control. */
const callerKeyed: SkinRule[] = shellRules.map((rule) => ({
  ...rule,
  selector: rule.selector.replace(SHELL_ANCHOR, "$&[data-part='search-input']"),
}));

/** Renders onto an empty document so `document` holds this fixture alone. */
async function renderField(props: Record<string, unknown>) {
  cleanup();
  const { container } = renderWithEngine(
    <Input clearable value="x" onChange={() => undefined} {...props} />,
    "modern"
  );
  await waitFor(() => expect(container.querySelector("input")).not.toBeNull());
  return container;
}

describe("modern Input skin reachability", () => {
  it("declares no root-part predicate in any selector", () => {
    // Parsed, never grepped: this file's own prose names the predicate, and a
    // text scan cannot tell a comment from a selector.
    expect(RULES.filter((r) => r.selector.includes("[data-part='root']"))).toEqual([]);
    expect(shellRules.length).toBeGreaterThan(50);
  });

  it("reaches a caller-labelled field exactly as it reaches an unlabelled one", async () => {
    const labelled = await renderField({
      "data-part": "search-input",
      className: "ds-consumer__field",
    });
    const shell = labelled.querySelector(".ds-input-shell.ds-input-shell--modern");
    // P-88: the shell keeps its own part; the caller part never lands.
    expect(shell?.getAttribute("data-part")).toBe("root");
    const labelledDead = unreachableSelectors({ rules: shellRules, scopes: [labelled] });
    // So a root-keyed skin reaches a labelled field exactly as the class-keyed one does.
    expect(
      unreachableSelectors({ rules: rootKeyed, scopes: [labelled] }).map((s) =>
        s.replace("[data-part='root']", "")
      )
    ).toEqual(labelledDead);

    const plain = await renderField({});
    const plainDead = unreachableSelectors({ rules: shellRules, scopes: [plain] });

    expect(labelledDead).toEqual(plainDead);
    expect(labelledDead.length).toBeLessThan(evaluable.length);
  });

  it("goes wholly unreachable again if the predicate ever returns", async () => {
    // The control for the assertion above: without it, that equality would also
    // hold on a skin that had silently gone back to being part-keyed. Under P-88
    // the predicate that drops the skin is the CALLER's part, which never lands.
    const labelled = await renderField({ "data-part": "search-input" });
    const dead = unreachableSelectors({ rules: callerKeyed, scopes: [labelled] });
    expect(dead.length).toBe(evaluable.length);
  });

  it("mounts its shell inside the render container, not through a portal", async () => {
    // The portal law, asserted rather than assumed: Input is composed inside
    // portalled families, and a container-only scope would undercount if any
    // instance mounted outside it. On a clean document these two readings are
    // the same reading, which is what licenses this lane's reachability numbers
    // as measurements rather than floors.
    const container = await renderField({ "data-part": "search-input" });
    expect(container.querySelectorAll(".ds-input-shell.ds-input-shell--modern")).toHaveLength(
      document.querySelectorAll(".ds-input-shell.ds-input-shell--modern").length
    );
    expect(unreachableSelectors({ rules: shellRules, scopes: [container] })).toEqual(
      unreachableSelectors({ rules: shellRules, scopes: [container, document] })
    );
  });
});
