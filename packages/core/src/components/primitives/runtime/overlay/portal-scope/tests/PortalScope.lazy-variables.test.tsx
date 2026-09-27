/**
 * The `--ds-*` walk covers every computed custom property on the anchor, so a closed overlay
 * must not pay it for a lineage mutation: the walk runs on mount, lazily on the next read, and
 * eagerly only while a `<PortalScope>` renders the snapshot. What a reader sees never changes.
 */
import React, { useState } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import * as theme from "../../foundation/portal-theme";
import { PortalScope, usePortalScope, type PortalScopeSnapshot } from "..";

vi.mock("../../foundation/portal-theme", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../foundation/portal-theme")>();
  return { ...actual, readDsPortalVariables: vi.fn(actual.readDsPortalVariables) };
});

const walks = () => vi.mocked(theme.readDsPortalVariables).mock.calls.length;
// MutationObserver callbacks are microtasks: one flush delivers them, no timer involved.
const flushMutations = () => act(async () => {
  await Promise.resolve();
});

let latest: PortalScopeSnapshot | null = null;

function Probe({ open }: { open: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const snapshot = usePortalScope(anchor);
  latest = snapshot;
  return (
    <div data-testid="shell" data-ds-root="" data-tenant="acme">
      <div data-testid="cell">
        <span ref={setAnchor}>anchor</span>
      </div>
      {open ? (
        <PortalScope snapshot={snapshot}>
          <span>content</span>
        </PortalScope>
      ) : null}
    </div>
  );
}

describe("usePortalScope -- the variables walk follows its readers", () => {
  it("a closed overlay does not re-walk on an ancestor style mutation, and the next read is fresh", async () => {
    vi.mocked(theme.readDsPortalVariables).mockClear();
    const { getByTestId } = render(<Probe open={false} />);
    const afterMount = walks();
    expect(afterMount).toBeGreaterThan(0);

    getByTestId("cell").setAttribute("style", "--ds-probe-channel: 7px");
    await flushMutations();
    getByTestId("cell").setAttribute("style", "--ds-probe-channel: 9px");
    await flushMutations();
    expect(walks()).toBe(afterMount);

    expect((latest!.variables as Record<string, string>)["--ds-probe-channel"]).toBe("9px");
    expect(walks()).toBe(afterMount + 1);
    expect((latest!.variables as Record<string, string>)["--ds-probe-channel"]).toBe("9px");
    expect(walks()).toBe(afterMount + 1);
  });

  it("a mutation that changes no --ds value re-walks nothing while closed", async () => {
    vi.mocked(theme.readDsPortalVariables).mockClear();
    const { getByTestId } = render(<Probe open={false} />);
    const afterMount = walks();
    getByTestId("cell").setAttribute("style", "width: 10px");
    getByTestId("cell").setAttribute("class", "moved");
    await flushMutations();
    expect(walks()).toBe(afterMount);
  });

  it("while a PortalScope renders the snapshot, a mutation re-walks and re-stamps the wrapper", async () => {
    vi.mocked(theme.readDsPortalVariables).mockClear();
    const { getByTestId, container } = render(<Probe open />);
    const wrapper = () => container.querySelector<HTMLElement>('[data-portal-scope="true"]')!;
    const afterMount = walks();

    getByTestId("cell").setAttribute("style", "--ds-probe-channel: 3px");
    await flushMutations();
    expect(walks()).toBeGreaterThan(afterMount);
    expect(wrapper().style.getPropertyValue("--ds-probe-channel")).toBe("3px");
  });

  it("a scope change still re-publishes while closed (locale and tenant stay eager)", async () => {
    const { getByTestId } = render(<Probe open={false} />);
    expect(latest!.scope["data-tenant"]).toBe("acme");
    getByTestId("shell").setAttribute("data-tenant", "globex");
    await flushMutations();
    expect(latest!.scope["data-tenant"]).toBe("globex");
  });
});
