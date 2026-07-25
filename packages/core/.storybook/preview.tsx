import type { Preview } from "@storybook/react-vite";
import type { EngineName } from "../src/contracts/engine";
import type { TenantConfig } from "../src/foundation/contracts";
import { DesignSystemProvider } from "../src/infrastructure/runtime/bootstrap";
import React from "react";

// Exercise the same public source facade used by symlinked consumers. Importing
// token fragments here hid missing skins and made Storybook diverge from apps.
import "../src/foundation/tokens/css/facade/entrypoints/styles.css";
import "../src/foundation/tokens/css/foundation/typography/font-packs/humanist-text/index.css";
import "../src/foundation/tokens/css/foundation/typography/font-packs/grotesk-display/index.css";
import "../src/foundation/tokens/css/foundation/typography/font-packs/plex-mono/index.css";

// Storybook preview styles
import "./preview-styles.css";

const preview: Preview = {
  globalTypes: {
    engine: {
      name: "Engine",
      description: "Rendering engine for components",
      defaultValue: "modern",
      toolbar: {
        icon: "wrench",
        items: [
          { value: "modern", title: "Modern" },
          { value: "classic", title: "Classic" },
          { value: "rustic", title: "Rustic" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
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
      const selectedEngine = (context.parameters.engine ||
        context.globals.engine ||
        "modern") as EngineName;
      const tenantConfig: TenantConfig = {
        slug: selectedTenant,
        name: selectedTenant === "bithire" ? "BitHire" : "Rottay",
        engine: selectedEngine,
        theme: "light",
        plan: "enterprise",
        features: ["all"],
        branding: {
          companyName: selectedTenant === "bithire" ? "BitHire" : "Rottay",
        },
      };

      return (
        <DesignSystemProvider
          tenantConfig={tenantConfig}
          forceEngine={selectedEngine}
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
