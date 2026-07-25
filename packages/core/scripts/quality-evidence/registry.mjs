/**
 * Wave 0 quality-evidence registry.
 *
 * This registry is tooling-only. It is not imported by the runtime package and
 * does not make a visual-quality claim. It describes the evidence every public
 * Modern primitive must eventually provide in two independent passes:
 *
 * - Pass 1: executable product contract.
 * - Pass 2: sighted, adversarial craft approval.
 */

export const QUALITY_EVIDENCE_SCHEMA_VERSION = 1;

export const DENSITIES = Object.freeze(["compact", "comfortable", "spacious"]);
export const BRAND_FIXTURES = Object.freeze([
  "bithire-static",
  "themanagementmiami-db",
]);
export const BRAND_FIXTURE_CONTRACTS = Object.freeze({
  "bithire-static": Object.freeze({
    source: "static-vertical-artifact",
    intent: "soft-high-legibility-recruiting",
    applicationImprint: "composition-and-ds-recipes-only",
  }),
  "themanagementmiami-db": Object.freeze({
    source: "runtime-db-tenant",
    fixture: "themanagementmiamiBrandTheme",
    intent: "warm-editorial-art-deco-contrast",
    bundled: false,
    applicationImprint: "composition-and-ds-recipes-only",
  }),
});
export const RESPONSIVE_CONTEXTS = Object.freeze([
  "desktop",
  "narrow-container",
  "mobile",
]);
export const DIRECTIONS = Object.freeze(["ltr", "rtl"]);
export const LOCALES = Object.freeze(["en", "es", "ar"]);
export const MOTION_PREFERENCES = Object.freeze(["normal", "reduced"]);
export const CANVASES = Object.freeze(["light", "dark", "high-contrast"]);
export const CONTENT_PROFILES = Object.freeze([
  "short",
  "long",
  "pathological",
]);

const MATRIX_GROUPS = Object.freeze([
  Object.freeze(["density", "brand", "canvas", "locale"]),
  Object.freeze(["responsive", "direction"]),
  Object.freeze(["motion", "input"]),
]);

const PROFILE_CONTRACTS = Object.freeze({
  static: Object.freeze({
    risk: "low",
    budget: 12,
    states: Object.freeze(["default"]),
    inputs: Object.freeze(["none"]),
  }),
  layout: Object.freeze({
    risk: "standard",
    budget: 12,
    states: Object.freeze(["default", "narrow", "overflow"]),
    inputs: Object.freeze(["none"]),
  }),
  interactive: Object.freeze({
    risk: "high",
    budget: 12,
    states: Object.freeze([
      "default",
      "hover",
      "focus-visible",
      "pressed",
      "disabled",
    ]),
    inputs: Object.freeze(["pointer", "keyboard", "touch"]),
  }),
  control: Object.freeze({
    risk: "high",
    budget: 12,
    states: Object.freeze([
      "default",
      "hover",
      "focus-visible",
      "pressed",
      "disabled",
      "loading",
      "error",
    ]),
    inputs: Object.freeze(["pointer", "keyboard", "touch"]),
  }),
  data: Object.freeze({
    risk: "high",
    budget: 12,
    states: Object.freeze([
      "default",
      "hover",
      "focus-visible",
      "selected",
      "disabled",
      "loading",
      "success",
      "warning",
      "error",
      "empty",
      "partial-data",
    ]),
    inputs: Object.freeze(["pointer", "keyboard", "touch"]),
  }),
  overlay: Object.freeze({
    risk: "critical",
    budget: 12,
    states: Object.freeze([
      "closed",
      "opening",
      "open",
      "focus-trapped",
      "closing",
      "disabled",
      "loading",
      "error",
    ]),
    inputs: Object.freeze(["pointer", "keyboard", "touch"]),
  }),
});

const STATE_OVERRIDES = Object.freeze({
  "display/Avatar": Object.freeze(["default", "loading", "error"]),
  "display/Badge": Object.freeze([
    "default",
    "success",
    "warning",
    "error",
    "disabled",
  ]),
  "display/Callout": Object.freeze(["default", "success", "warning", "error"]),
  "display/Descriptions": Object.freeze([
    "default",
    "loading",
    "empty",
    "error",
    "partial-data",
  ]),
  "display/Empty": Object.freeze(["default"]),
  "display/Image": Object.freeze(["default", "loading", "error"]),
  "display/QRCode": Object.freeze(["default", "loading", "error"]),
  "display/Statistic": Object.freeze(["default", "loading", "empty", "error"]),
  "display/Tag": Object.freeze(["default", "selected", "disabled"]),
  "feedback/Alert": Object.freeze(["default", "success", "warning", "error"]),
  "feedback/Message": Object.freeze([
    "default",
    "loading",
    "success",
    "warning",
    "error",
  ]),
  "feedback/Progress": Object.freeze([
    "default",
    "loading",
    "success",
    "error",
  ]),
  "feedback/Result": Object.freeze(["default", "success", "warning", "error"]),
  "feedback/Skeleton": Object.freeze(["default", "loading"]),
  "feedback/Spinner": Object.freeze(["default", "loading"]),
});

/**
 * Tuple layout: [family, component name, execution wave, evidence profile].
 * IDs are positional and intentionally match COMPONENT-LEDGER.md.
 */
const PRIMITIVE_DEFINITIONS = Object.freeze([
  ["display", "Avatar", 1, "static"],
  ["display", "Badge", 1, "static"],
  ["display", "Calendar", 5, "interactive"],
  ["display", "Callout", 2, "static"],
  ["display", "Card", 2, "data"],
  ["display", "Carousel", 8, "interactive"],
  ["display", "Descriptions", 5, "data"],
  ["display", "Empty", 2, "static"],
  ["display", "Image", 8, "static"],
  ["display", "Kbd", 1, "static"],
  ["display", "List", 3, "data"],
  ["display", "QRCode", 8, "static"],
  ["display", "Statistic", 5, "static"],
  ["display", "Table", 3, "data"],
  ["display", "Tag", 1, "static"],
  ["display", "Timeline", 5, "data"],
  ["display", "Tooltip", 1, "overlay"],
  ["display", "Tree", 8, "interactive"],
  ["display", "Typography", 1, "static"],

  ["feedback", "Alert", 2, "static"],
  ["feedback", "Drawer", 4, "overlay"],
  ["feedback", "Message", 2, "static"],
  ["feedback", "Modal", 4, "overlay"],
  ["feedback", "Notification", 4, "overlay"],
  ["feedback", "Progress", 2, "static"],
  ["feedback", "Rate", 8, "interactive"],
  ["feedback", "Result", 4, "static"],
  ["feedback", "Skeleton", 2, "static"],
  ["feedback", "Spinner", 2, "static"],
  ["feedback", "Toast", 4, "overlay"],

  ["inputs", "AutoComplete", 2, "control"],
  ["inputs", "Button", 1, "control"],
  ["inputs", "Cascader", 8, "control"],
  ["inputs", "Checkbox", 2, "control"],
  ["inputs", "ColorPicker", 8, "control"],
  ["inputs", "DatePicker", 2, "control"],
  ["inputs", "Form", 2, "data"],
  ["inputs", "FormField", 2, "control"],
  ["inputs", "Input", 2, "control"],
  ["inputs", "InputNumber", 2, "control"],
  ["inputs", "Mentions", 8, "control"],
  ["inputs", "OTPInput", 8, "control"],
  ["inputs", "PasswordInput", 2, "control"],
  ["inputs", "Radio", 2, "control"],
  ["inputs", "Select", 2, "control"],
  ["inputs", "Slider", 2, "control"],
  ["inputs", "Switch", 2, "control"],
  ["inputs", "TagInput", 2, "control"],
  ["inputs", "Textarea", 2, "control"],
  ["inputs", "TimePicker", 2, "control"],
  ["inputs", "Toggle", 2, "control"],
  ["inputs", "Transfer", 8, "control"],
  ["inputs", "TreeSelect", 8, "control"],
  ["inputs", "Upload", 2, "control"],

  ["layout", "AspectRatio", 1, "layout"],
  ["layout", "Box", 1, "layout"],
  ["layout", "Collapse", 3, "interactive"],
  ["layout", "Container", 1, "layout"],
  ["layout", "Divider", 1, "layout"],
  ["layout", "Flex", 1, "layout"],
  ["layout", "Grid", 1, "layout"],
  ["layout", "Layout", 6, "layout"],
  ["layout", "ScrollArea", 4, "interactive"],
  ["layout", "Space", 1, "layout"],
  ["layout", "Splitter", 6, "interactive"],
  ["layout", "Stack", 1, "layout"],

  ["navigation", "Affix", 6, "layout"],
  ["navigation", "Anchor", 8, "interactive"],
  ["navigation", "BackTop", 8, "interactive"],
  ["navigation", "Breadcrumb", 3, "interactive"],
  ["navigation", "FloatButton", 6, "interactive"],
  ["navigation", "Link", 1, "interactive"],
  ["navigation", "Menu", 3, "interactive"],
  ["navigation", "Pagination", 3, "interactive"],
  ["navigation", "Segmented", 3, "interactive"],
  ["navigation", "Stepper", 5, "interactive"],
  ["navigation", "Steps", 5, "interactive"],
  ["navigation", "Tabs", 3, "interactive"],

  ["overlay", "AlertDialog", 4, "overlay"],
  ["overlay", "ConfirmDialog", 4, "overlay"],
  ["overlay", "ContextMenu", 4, "overlay"],
  ["overlay", "Dropdown", 4, "overlay"],
  ["overlay", "HoverCard", 4, "overlay"],
  ["overlay", "Modal", 4, "overlay"],
  ["overlay", "Popconfirm", 4, "overlay"],
  ["overlay", "Popover", 4, "overlay"],
  ["overlay", "Sheet", 4, "overlay"],
  ["overlay", "Tour", 8, "overlay"],
  ["overlay", "Watermark", 8, "static"],
]);

const FLAGSHIP_IDS = new Set([
  "DS-P002", // Badge
  "DS-P005", // Card
  "DS-P014", // Table
  "DS-P023", // feedback/Modal
  "DS-P032", // Button
  "DS-P039", // Input
  "DS-P045", // Select
  "DS-P078", // Tabs
]);

function componentId(index) {
  return `DS-P${String(index + 1).padStart(3, "0")}`;
}

function buildComponent(definition, index) {
  const [family, name, wave, profileName] = definition;
  const profile = PROFILE_CONTRACTS[profileName];
  const id = componentId(index);
  const publicName = `${family}/${name}`;

  return Object.freeze({
    id,
    tier: "primitive",
    family,
    name,
    publicName,
    wave,
    profile: profileName,
    risk: profile.risk,
    flagship: FLAGSHIP_IDS.has(id),
    acceptanceThreshold: FLAGSHIP_IDS.has(id) ? 95 : 90,
    renderedStates: STATE_OVERRIDES[publicName] ?? profile.states,
    renderedContentProfiles: CONTENT_PROFILES,
    axes: Object.freeze({
      density: DENSITIES,
      brand: BRAND_FIXTURES,
      responsive: RESPONSIVE_CONTEXTS,
      direction: DIRECTIONS,
      locale: LOCALES,
      motion: MOTION_PREFERENCES,
      input: profile.inputs,
      canvas: CANVASES,
    }),
    pairwiseGroups: MATRIX_GROUPS,
    matrixBudget: profile.budget,
    pass1: Object.freeze({
      approval: "automated-contract",
      requiredEvidence: Object.freeze([
        "anatomy-semantics",
        "variants-recipes",
        "state-completeness",
        "token-whitelabel-contract",
        "responsive-content",
        "input-parity",
        "accessibility-i18n",
        "behavioral-evidence",
      ]),
    }),
    pass2: Object.freeze({
      approval: "human-sighted-review",
      exemplar: FLAGSHIP_IDS.has(id) ? "candidates" : "showroom",
      requiredEvidence: Object.freeze([
        "contact-sheet",
        "contrasting-brand-comparison",
        "cross-brand-locale-comparison",
        "narrow-rtl-content-stress",
        "live-exemplar",
        ...(profileName === "static" || profileName === "layout"
          ? []
          : ["normal-motion-recording"]),
      ]),
    }),
  });
}

export const COMPONENT_EVIDENCE_REGISTRY = Object.freeze(
  PRIMITIVE_DEFINITIONS.map(buildComponent)
);

export const COMPONENT_EVIDENCE_BY_ID = Object.freeze(
  Object.fromEntries(
    COMPONENT_EVIDENCE_REGISTRY.map((component) => [component.id, component])
  )
);

export const COMPONENT_EVIDENCE_MANIFEST = Object.freeze({
  schemaVersion: QUALITY_EVIDENCE_SCHEMA_VERSION,
  scope: "public-modern-primitives",
  componentCount: COMPONENT_EVIDENCE_REGISTRY.length,
  completionPolicy: Object.freeze({
    standardThreshold: 90,
    flagshipThreshold: 95,
    pass1: "automated-contract",
    pass2: "human-sighted-review",
  }),
  brandFixtures: BRAND_FIXTURE_CONTRACTS,
  components: COMPONENT_EVIDENCE_REGISTRY,
});

export function getComponentEvidenceContract(id) {
  return COMPONENT_EVIDENCE_BY_ID[id] ?? null;
}
