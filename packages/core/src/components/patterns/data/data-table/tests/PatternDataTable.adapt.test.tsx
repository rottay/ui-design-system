import React, { Suspense } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockMatchMedia } from "@tests/support/browser/match-media";
import { DesignSystemProvider } from "@/infrastructure/runtime/bootstrap";
import { firstPartyEngineVisual } from "@/infrastructure/compilers/runtime/theme";
import { resetResponsiveMediaStore } from "@/infrastructure/runtime/responsive/runtime/media-snapshot";
import type { TenantConfig } from "@/foundation/contracts";
import type { ColumnDef } from "@/foundation/contracts/runtime/components/patterns/core";
import { PatternDataTable } from "..";
import type { DataTablePatternProps } from "../contracts";

interface Role {
  id: string;
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
  location: string;
}

const rows: Role[] = [
  { id: "r1", name: "Staff engineer", status: "Screening", owner: "Ada", updatedAt: "2026-09-01", location: "Remote" },
  { id: "r2", name: "Product designer", status: "Offer", owner: "Grace", updatedAt: "2026-09-02", location: "Lisbon" },
];

const columns: ColumnDef<Role>[] = [
  { key: "name", header: "Role", accessorKey: "name", width: 240 },
  { key: "status", header: "Status", accessorKey: "status", width: 160, minWidth: 120 },
  { key: "owner", header: "Owner", accessorKey: "owner" },
  { key: "updatedAt", header: "Updated", accessorKey: "updatedAt" },
  { key: "location", header: "Location", accessorKey: "location" },
];

const TENANT: TenantConfig = {
  slug: "adapt-test",
  name: "Adapt Test",
  theme: "base",
  locale: "en",
  fallbackLocale: "en",
  plan: "enterprise",
  features: ["testing"],
  branding: { companyName: "Adapt Test" },
};

function Table(props: Partial<DataTablePatternProps<Role>>) {
  return (
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual("rottay", "modern")}
      skipCssLoading
    >
      <Suspense fallback={<div>Loading...</div>}>
        <PatternDataTable<Role>
          engine="modern"
          data={rows}
          rowKey="id"
          columns={columns}
          actions={(row) => <button type="button">{`Open ${row.name}`}</button>}
          {...props}
        />
      </Suspense>
    </DesignSystemProvider>
  );
}

type ObserverEntry = { target: Element; contentRect: { width: number; height: number } };

const observers: Array<{ callback: (entries: ObserverEntry[]) => void; targets: Element[] }> = [];

class StubResizeObserver {
  private record: { callback: (entries: ObserverEntry[]) => void; targets: Element[] };
  constructor(callback: (entries: ObserverEntry[]) => void) {
    this.record = { callback, targets: [] };
    observers.push(this.record);
  }
  observe(target: Element): void {
    this.record.targets.push(target);
  }
  unobserve(): void {}
  disconnect(): void {}
}

/** Deliver a width to every observer watching the table's own box. */
async function resizeBox(box: Element, width: number): Promise<void> {
  await act(async () => {
    for (const observer of observers) {
      if (observer.targets.includes(box)) {
        observer.callback([{ target: box, contentRect: { width, height: 400 } }]);
      }
    }
  });
}

beforeEach(() => {
  observers.length = 0;
  resetResponsiveMediaStore();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  resetResponsiveMediaStore();
});

describe("PatternDataTable adapt — container posture", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", StubResizeObserver);
  });

  it("flips data-posture to compact when its box is 320px wide, with no viewport change", async () => {
    mockMatchMedia(1440);
    const matchMedia = window.matchMedia;
    const { container } = render(<Table adapt={{ compact: { columns: { keep: ["name", "status", "owner"] } } }} />);

    const box = await waitFor(() => {
      const root = container.querySelector('[data-part="responsive-root"]');
      expect(root).not.toBeNull();
      return root as Element;
    });
    expect(box).toHaveAttribute("data-posture", "desktop");
    expect(box).toHaveAttribute("data-presentation", "table");

    await resizeBox(box, 320);

    expect(window.matchMedia).toBe(matchMedia);
    expect(box).toHaveAttribute("data-posture", "desktop compact");
    expect(container.querySelector('[data-posture~="compact"]')).toBe(box);
    expect(box).toHaveAttribute("data-presentation", "cards");
    expect(await screen.findByText("Staff engineer")).toBeInTheDocument();
    expect(screen.queryByText("Remote")).not.toBeInTheDocument();

    await resizeBox(box, 1200);
    expect(box).toHaveAttribute("data-posture", "desktop expanded");
    expect(box).toHaveAttribute("data-presentation", "table");
  });

  it("keeps the table on a compact box when the standalone defaults are off", async () => {
    mockMatchMedia(1440);
    const { container } = render(<Table autoMobileCards={false} />);
    const box = await waitFor(() => {
      const root = container.querySelector('[data-part="responsive-root"]');
      expect(root).not.toBeNull();
      return root as Element;
    });
    await resizeBox(box, 320);
    expect(box).toHaveAttribute("data-posture", "desktop compact");
    expect(box).toHaveAttribute("data-presentation", "table");
  });
});

describe("PatternDataTable adapt — one column model, three presentations", () => {
  it("projects shrink columns beside the title and priority columns first", async () => {
    mockMatchMedia(390);
    const { container } = render(
      <Table
        adapt={{
          phone: {
            columns: { keep: ["name", "status", "owner"], priority: ["owner"], shrink: ["status"] },
          },
        }}
      />,
    );
    const titles = await waitFor(() => {
      const found = container.querySelectorAll('[data-part="mobile-card-title"]');
      expect(found.length).toBe(rows.length);
      return found;
    });
    expect(titles[0]).toHaveTextContent("Ada");
    expect(container.querySelector('[data-part="record-meta-value"]')).toHaveTextContent("Screening");
    const labels = [...container.querySelectorAll('[data-part="mobile-card-summary-label"]')].map(
      (node) => node.textContent,
    );
    expect(labels).toEqual(["Role", "Role"]);
  });

  it("renders the list presentation as a list of records", async () => {
    mockMatchMedia(390);
    render(<Table adapt={{ phone: { presentation: "list", columns: { keep: ["name", "owner"] } } }} />);
    const list = await screen.findByRole("list");
    expect(screen.getAllByRole("listitem")).toHaveLength(rows.length);
    expect(list).toHaveTextContent("Staff engineer");
    expect(list).toHaveTextContent("Grace");
    expect(list).not.toHaveTextContent("Offer");
  });

  it("puts row actions behind a menu trigger", async () => {
    mockMatchMedia(390);
    render(<Table adapt={{ phone: { rowActions: "menu" } }} messages={{ rowActions: "More for row" }} />);
    const triggers = await screen.findAllByRole("button", { name: "More for row" });
    expect(triggers).toHaveLength(rows.length);
    expect(screen.queryByRole("button", { name: "Open Staff engineer" })).not.toBeInTheDocument();
  });

  it("reveals swipe actions by gesture and by the disclosure button", async () => {
    mockMatchMedia(390);
    const { container } = render(<Table adapt={{ phone: { rowActions: "swipe" } }} />);
    const toggles = await screen.findAllByRole("button", { name: "Row actions" });
    expect(toggles[0]).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Open Staff engineer" })).not.toBeInTheDocument();

    const record = container.querySelectorAll('[data-part="swipe-record"]')[0] as HTMLElement;
    fireEvent.pointerDown(record, { pointerType: "touch", clientX: 300 });
    fireEvent.pointerUp(record, { pointerType: "touch", clientX: 200 });
    expect(toggles[0]).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Open Staff engineer" })).toBeInTheDocument();

    // A later, deliberate tap is not the click that ended the gesture.
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    fireEvent.click(toggles[0]);
    expect(toggles[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps kept columns, lowers unlisted priority and drops shrunk widths in the table", async () => {
    mockMatchMedia(1440);
    const { container } = render(
      <Table
        adapt={{
          desktop: {
            columns: { keep: ["name", "status", "location"], priority: ["name"], shrink: ["status"] },
          },
        }}
      />,
    );
    await waitFor(() => {
      expect(container.querySelector('th[data-col-key="name"]')).not.toBeNull();
    });
    const headers = [...container.querySelectorAll("th[data-col-key]")].map((th) =>
      th.getAttribute("data-col-key"),
    );
    expect(headers).toEqual(["name", "status", "location"]);
    expect(container.querySelector('th[data-col-key="name"]')).not.toHaveAttribute("data-col-priority");
    expect(container.querySelector('th[data-col-key="location"]')).toHaveAttribute("data-col-priority", "low");
    const status = container.querySelector('th[data-col-key="status"]') as HTMLElement;
    expect(status.style.width).toBe("");
    expect(status.style.minWidth).toBe("");
  });
});
