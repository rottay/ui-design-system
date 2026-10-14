import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DesignSystemProvider } from "@/infrastructure/runtime/bootstrap";
import { resetResponsiveMediaStore } from "@/infrastructure/runtime/responsive/viewport/media-snapshot";
import { mockMatchMedia } from "@tests/support/browser/match-media";

import PostureListPage, {
  POSTURE_LIST_POSTURES,
} from "./app/posture-list-page";

const ROWS = [
  { id: "1", label: "Senior designer" },
  { id: "2", label: "Platform engineer" },
] as const;

const TENANT = {
  slug: "surface-posture-test",
  name: "Surface posture test",
  theme: "light",
  plan: "enterprise" as const,
  features: ["all"],
  branding: { companyName: "Surface posture test" },
};

function renderPageClientSide(
  width: number,
  props: Partial<React.ComponentProps<typeof PostureListPage>> = {}
): ReturnType<typeof render> {
  mockMatchMedia(width);
  resetResponsiveMediaStore();
  return render(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      skipCssLoading
    >
      <PostureListPage rows={ROWS} {...props} />
    </DesignSystemProvider>
  );
}

afterEach(() => {
  cleanup();
  resetResponsiveMediaStore();
});

describe("WO-INV-06 client surface postures in the consumer fixture", () => {
  it("hides a region by name on the client paint and stamps the disposition", async () => {
    const { container } = renderPageClientSide(390);
    await waitFor(() =>
      expect(container.querySelector(".ds-list")).not.toBeNull()
    );

    expect(
      container.querySelector('[data-surface-region="preview-rail"]')
    ).toBeNull();
    const results = container.querySelector('[data-surface-region="results"]');
    expect(results).not.toBeNull();
    expect(results).toHaveAttribute("data-region-disposition", "render");
    expect(results).toHaveAttribute("data-posture", "phone");
    const bottomBar = container.querySelector(
      '[data-surface-region="bottom-bar"]'
    );
    expect(bottomBar).not.toBeNull();
    await waitFor(() =>
      expect(bottomBar?.textContent ?? "").toContain("New role")
    );
  });

  it("keeps the desktop chrome on the client paint for a desktop viewport", async () => {
    const { container } = renderPageClientSide(1440);
    await waitFor(() =>
      expect(container.querySelector(".ds-list")).not.toBeNull()
    );

    expect(
      container.querySelector('[data-surface-region="column-menu"]')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-surface-region="preview-rail"]')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-surface-region="bottom-bar"]')
    ).toBeNull();
  });

  it("moves exactly one working primary action from the page header to the phone dock", async () => {
    const onCreate = vi.fn();
    const { container } = renderPageClientSide(390, { onCreate });
    await waitFor(() =>
      expect(
        container.querySelector('[data-surface-region="bottom-bar"] button')
      ).not.toBeNull()
    );
    const actions = Array.from(container.querySelectorAll("button")).filter(
      (button) => button.textContent?.includes("New role")
    );
    expect(actions).toHaveLength(1);
    expect(
      actions[0].closest('[data-surface-region="bottom-bar"]')
    ).not.toBeNull();
    fireEvent.click(actions[0]);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("preserves disabled action semantics after relocation", async () => {
    const onCreate = vi.fn();
    const { container } = renderPageClientSide(390, {
      onCreate,
      actionDisabled: true,
    });
    await waitFor(() =>
      expect(
        container.querySelector('[data-surface-region="bottom-bar"] button')
      ).not.toBeNull()
    );
    const action = container.querySelector(
      '[data-surface-region="bottom-bar"] button'
    ) as HTMLButtonElement;
    expect(action).toBeDisabled();
    fireEvent.click(action);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("exposes the declaration as app-owned configuration: regions key by name", () => {
    expect(POSTURE_LIST_POSTURES.phone?.regions?.["preview-rail"]).toBe("hide");
    expect(POSTURE_LIST_POSTURES.phone?.regions?.["column-menu"]).toBe("hide");
    expect(POSTURE_LIST_POSTURES.phone?.primaryAction).toBe("bottom-bar");
  });
});
