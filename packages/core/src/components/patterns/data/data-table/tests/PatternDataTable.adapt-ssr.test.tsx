/**
 * The viewport posture is resolved on the server: a phone REQUEST renders the
 * cards presentation in the server markup itself, from the request's viewport
 * hint, while the live media of the rendering machine says desktop.
 */
import React, { Suspense } from "react";
import { Writable } from "node:stream";
import { prerenderToNodeStream } from "react-dom/static";
import { afterEach, describe, expect, it } from "vitest";

import { mockMatchMedia } from "@tests/support/browser/match-media";
import { DesignSystemProvider } from "@/infrastructure/runtime/bootstrap";
import { firstPartyEngineVisual } from "@/infrastructure/compilers/runtime/theme";
import { resetResponsiveMediaStore } from "@/infrastructure/runtime/responsive/runtime/media-snapshot";
import type { DocumentViewportHint } from "@/infrastructure/runtime/foundation/root-attributes/ssr";
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
  { key: "name", header: "Role", accessorKey: "name" },
  { key: "status", header: "Status", accessorKey: "status" },
  { key: "owner", header: "Owner", accessorKey: "owner" },
  { key: "updatedAt", header: "Updated", accessorKey: "updatedAt" },
  { key: "location", header: "Location", accessorKey: "location" },
];

const adapt: DataTablePatternProps<Role>["adapt"] = {
  phone: { columns: { keep: ["name", "status", "owner"] }, presentation: "cards" },
};

const TENANT: TenantConfig = {
  slug: "adapt-ssr-test",
  name: "Adapt SSR Test",
  theme: "base",
  locale: "en",
  fallbackLocale: "en",
  plan: "enterprise",
  features: ["testing"],
  branding: { companyName: "Adapt SSR Test" },
};

async function serverMarkup(ssrViewport: DocumentViewportHint): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual("rottay", "modern")}
      skipCssLoading
      ssrViewport={ssrViewport}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <PatternDataTable<Role> engine="modern" data={rows} rowKey="id" columns={columns} adapt={adapt} />
      </Suspense>
    </DesignSystemProvider>,
  );
  let html = "";
  await new Promise<void>((resolve, reject) => {
    prelude
      .pipe(
        new Writable({
          write(chunk, _encoding, done) {
            html += chunk.toString();
            done();
          },
        }),
      )
      .on("finish", resolve)
      .on("error", reject);
  });
  return html;
}

afterEach(() => {
  resetResponsiveMediaStore();
});

describe("PatternDataTable adapt — server-resolved viewport posture", () => {
  it("renders a phone request as cards with exactly the three declared columns", async () => {
    mockMatchMedia(1440);
    const html = await serverMarkup("phone");

    expect(html).toContain('data-presentation="cards"');
    expect(html).toContain('data-posture="phone"');
    expect(html).not.toContain("<table");
    for (const row of rows) {
      expect(html).toContain(row.name);
      expect(html).toContain(row.status);
      expect(html).toContain(row.owner);
      expect(html).not.toContain(row.updatedAt);
      expect(html).not.toContain(row.location);
    }
  });

  it("renders the same declaration as a table for a desktop request", async () => {
    mockMatchMedia(390);
    const html = await serverMarkup("desktop");

    expect(html).toContain('data-presentation="table"');
    expect(html).toContain('data-posture="desktop"');
    expect(html).toContain("<table");
    expect(html).toContain(rows[0].location);
  });
});
