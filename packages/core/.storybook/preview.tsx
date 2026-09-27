import type { Preview } from "@storybook/react-vite";
import type { EngineName } from "../src/foundation/contracts";
import type { FirstPartyVerticalId } from "../src/foundation/contracts/kernel/verticals";
import { DesignSystemProvider } from "../src/infrastructure/runtime/bootstrap";
import { getKnownTenantConfig } from "../src/entrypoints/public/runtime/tenant";
import {
  claimRootAttribute,
  composeRootAttributeReleases,
} from "../src/entrypoints/public/runtime/root-attributes";
import React from "react";

// Exercise the same public source facade used by symlinked consumers. Importing
// token fragments here hid missing skins and made Storybook diverge from apps.
// `base` is the one authored entrypoint; the vertical font packs below are what
// the retired per-vertical entrypoints used to add on top of it.
import "../src/foundation/tokens/css/facade/entrypoints/base/index.css";
// The story matrices render Classic and Rustic too; their CSS is the frozen-engine mount.
import "../src/foundation/tokens/css/runtime/engines/frozen/index.css";
import "../src/foundation/tokens/css/foundation/typography/font-packs/humanist-text/index.css";
import "../src/foundation/tokens/css/foundation/typography/font-packs/grotesk-display/index.css";
import "../src/foundation/tokens/css/foundation/typography/font-packs/plex-mono/index.css";
// A static vertical mounts no style element: its artifact is expected in the bundle, scoped to
// the root attributes the loader below stamps. One per toolbar tenant.
import "../src/foundation/tokens/css/facade/artifacts/rottay/index.css";
import "../src/foundation/tokens/css/facade/artifacts/bithire/index.css";

// Storybook preview styles
import "./styles/index.css";

const STORYBOOK_TENANTS: readonly FirstPartyVerticalId[] = ["rottay", "bithire"];

let releaseRootStamp: (() => void) | null = null;

/**
 * The mount law for a static vertical, before the story renders: its engine and root attributes
 * come from `mountTenantTheme`, claimed on <html> through the DS's own root registry.
 */
async function mountStorybookTenant(tenant: string, owned: boolean) {
  releaseRootStamp?.();
  releaseRootStamp = null;
  if (!owned) return { engine: null };
  if (!(STORYBOOK_TENANTS as readonly string[]).includes(tenant)) {
    throw new Error(`Storybook tenant "${tenant}" is not a first-party vertical.`);
  }
  // Loaded on demand: the mount module carries the theme compiler, which stays out of the entry chunk.
  const [{ mountTenantTheme }, { staticThemeIntent }] = await Promise.all([
    import("../src/infrastructure/runtime/theming/composition/mount"),
    import("../src/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/static"),
  ]);
  const mounted = await mountTenantTheme(staticThemeIntent(tenant as FirstPartyVerticalId), {
    themeMode: "light",
    locale: "en",
  });
  const root = document.documentElement;
  releaseRootStamp = composeRootAttributeReleases(
    Object.entries(mounted.rootAttributes)
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => claimRootAttribute(root, name, String(value)))
  );
  return { engine: mounted.rootAttributes["data-engine"] as EngineName };
}

const preview: Preview = {
  globalTypes: {
    tenant: {
      name: "Tenant",
      description: "Visual theme tenant",
      defaultValue: "rottay",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "rottay", title: "Rottay (Default)" },
          { value: "bithire", title: "BitHire" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: "requiredFirst",
    },

    actions: {
      argTypesRegex: "^on[A-Z].*",
    },

    a11y: {
      config: {
        rules: [
          {
            id: "region",
            enabled: false,
          },
        ],
      },
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa"],
        },
      },
    },

    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1f1f1f" },
        { name: "gray", value: "#f5f5f5" },
      ],
    },

    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: { width: "375px", height: "667px" },
        },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1440px", height: "900px" },
        },
        wide: {
          name: "Wide Screen",
          styles: { width: "1920px", height: "1080px" },
        },
      },
    },

    docs: {
      toc: true,
    },

    layout: "padded",

    options: {
      storySort: {
        order: [
          "Introduction",
          "System",
          "Primitives",
          ["Display", "Inputs", "Feedback", "Layout", "Navigation", "Overlay"],
          "Custom",
        ],
      },
    },
  },

  loaders: [
    async (context) => ({
      ground: await mountStorybookTenant(
        (context.parameters.tenant || context.globals.tenant || "rottay") as string,
        context.parameters.skipGlobalDesignSystemProvider !== true
      ),
    }),
  ],

  decorators: [
    (Story, context) => {
      // Provider-matrix stories need to own the complete runtime boundary.
      // Nesting the global provider outside those stories would overwrite
      // document-scoped tenant and locale attributes, producing a convincing
      // visual preview with incorrect <html lang/dir/data-*> evidence.
      if (context.parameters.skipGlobalDesignSystemProvider === true) {
        return (
          <div className="storybook-canvas">
            <Story />
          </div>
        );
      }

      const selectedTenant = (context.parameters.tenant ||
        context.globals.tenant ||
        "rottay") as string;
      const tenantConfig = getKnownTenantConfig(selectedTenant);
      if (!tenantConfig) {
        throw new Error(`Storybook tenant "${selectedTenant}" is not a first-party vertical.`);
      }
      const engine = (context.loaded.ground?.engine ?? "modern") as EngineName;

      return (
        <DesignSystemProvider
          tenantConfig={tenantConfig}
          forceEngine={engine}
          forceTheme="light"
          locale="en"
          skipCssLoading
        >
          <div className="storybook-canvas">
            <Story />
          </div>
        </DesignSystemProvider>
      );
    },
  ],
};

export default preview;
