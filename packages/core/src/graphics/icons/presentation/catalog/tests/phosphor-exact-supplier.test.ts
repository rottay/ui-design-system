/**
 * @fileoverview Regression guard for compatibility-catalog supplier migrations.
 *
 * Every stable catalog name must use one reviewed pinned Phosphor SSR glyph
 * through the DS compatibility adapter. Public legacy names remain stable;
 * supplier names stay private to this exact mapping contract.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { DSIconComponent } from "../../../foundation/contracts";
import {
  AccessibilityIcon,
  ActivityIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  EditIcon,
  EyeOffIcon,
  FileSearchIcon,
  LayoutGridIcon,
  MailIcon,
  UserCogIcon,
} from "..";

const CATALOG_ROOT = join(
  process.cwd(),
  "src/graphics/icons/presentation/catalog"
);
const PHOSPHOR_SSR_ROOT = join(
  process.cwd(),
  "node_modules/@phosphor-icons/react/dist/ssr"
);
const PHOSPHOR_COMPATIBILITY_FACTORY = "createPhosphorCompatibilityIcon";

type NamedImport = Readonly<{
  imported: string;
  local: string;
}>;

const REVIEWED_PHOSPHOR_ALIASES: Readonly<Record<string, string>> = {
  Building2: "Buildings",
  Loader2: "CircleNotch",
  GripVertical: "DotsSixVertical",
  Pin: "PushPin",
  PinOff: "PushPinSlash",
  GitCompare: "GitDiff",
  AudioWaveform: "Waveform",
  Award: "Medal",
  BadgeCheck: "SealCheck",
  BadgeDollarSign: "CurrencyCircleDollar",
  Bot: "Robot",
  Boxes: "Cube",
  BriefcaseBusiness: "Briefcase",
  CircuitBoard: "Circuitry",
  Code2: "Code",
  DollarSign: "CurrencyDollar",
  Drama: "MaskHappy",
  FlaskConical: "Flask",
  Gem: "Diamond",
  Github: "GithubLogo",
  Grid: "GridNine",
  HeartHandshake: "HandHeart",
  History: "ClockCounterClockwise",
  Instagram: "InstagramLogo",
  Landmark: "Bank",
  Languages: "Translate",
  LayoutDashboard: "SquaresFour",
  LayoutList: "ListBullets",
  Link2: "LinkSimple",
  Linkedin: "LinkedinLogo",
  LockKeyhole: "LockKey",
  MonitorSmartphone: "Devices",
  Move: "ArrowsOutCardinal",
  Palmtree: "TreePalm",
  PieChart: "ChartPieSlice",
  Plane: "Airplane",
  Quote: "Quotes",
  Radar: "ChartPolar",
  RadioTower: "CellTower",
  ReceiptText: "Receipt",
  Route: "Path",
  ScanFace: "ScanSmiley",
  SignalHigh: "CellSignalHigh",
  StickyNote: "Note",
  Store: "Storefront",
  Table2: "Table",
  Tags: "Tag",
  Undo2: "ArrowUUpLeft",
  UsersRound: "Users",
  Variable: "Function",
  WalletCards: "Cards",
  Wand2: "MagicWand",
  Webhook: "WebhooksLogo",
  Wifi: "WifiHigh",
  WifiOff: "WifiSlash",
  Workflow: "FlowArrow",
  BrainCircuit: "HeadCircuit",
  Chrome: "GoogleChromeLogo",
  Clock3: "Clock",
  Edit2: "Pen",
  Edit3: "PencilLine",
  Layers3: "Stack",
  Scale: "Scales",
  Tablet: "DeviceTablet",
  Unplug: "Plugs",
  Twitter: "TwitterLogo",
  UtensilsCrossed: "ForkKnife",
  Edit: "PencilSimple",
  Trash2: "Trash",
  Save: "FloppyDisk",
  ClipboardCheck: "ClipboardText",
  ClipboardCopy: "CopySimple",
  RefreshCcw: "ArrowsCounterClockwise",
  RefreshCw: "ArrowsClockwise",
  RotateCcw: "ArrowCounterClockwise",
  RotateCw: "ArrowClockwise",
  Send: "PaperPlaneTilt",
  Share2: "ShareNetwork",
  PowerOff: "Power",
  CheckCheck: "Checks",
  Repeat2: "RepeatOnce",
  Reply: "ArrowBendUpLeft",
  Mail: "Envelope",
  MailOpen: "EnvelopeOpen",
  MessageSquare: "ChatCentered",
  MessageSquarePlus: "Chats",
  MessageSquareQuote: "Quotes",
  MessageSquareText: "ChatCenteredText",
  MessageSquareWarning: "ChatCenteredDots",
  BellOff: "BellSlash",
  PhoneOff: "PhoneDisconnect",
  Inbox: "Tray",
  MessageCircle: "ChatCircle",
  Smartphone: "DeviceMobile",
  Accessibility: "PersonArmsSpread",
  PackageCheck: "Package",
  PackageSearch: "CubeFocus",
  TimerReset: "ClockCounterClockwise",
  Vote: "CheckSquareOffset",
  FileDown: "FileArrowDown",
  Braces: "BracketsCurly",
  BookmarkPlus: "Bookmarks",
  FileCheck: "File",
  FileCheck2: "FileText",
  FileEdit: "NotePencil",
  FilePenLine: "NotePencil",
  FilePlus2: "FilePlus",
  FileQuestion: "FileDashed",
  FileSearch: "FileMagnifyingGlass",
  FileSignature: "Signature",
  FileStack: "Files",
  FileType: "FileText",
  FileWarning: "FileX",
  ClipboardList: "ClipboardText",
  FolderTree: "Folders",
  ImageOff: "ImageBroken",
  ScanLine: "Scan",
  BarChart3: "ChartBar",
  TrendingUp: "TrendUp",
  TrendingDown: "TrendDown",
  Activity: "Pulse",
  Search: "MagnifyingGlass",
  Filter: "Funnel",
  ListFilter: "FunnelSimple",
  Layers: "Stack",
  Globe2: "GlobeHemisphereWest",
  ChartNoAxesColumn: "ChartBar",
  LineChart: "ChartLine",
  Server: "HardDrive",
  LayoutGrid: "GridFour",
  Grid3x3: "GridNine",
  Columns3: "Columns",
  CalendarClock: "CalendarDots",
  CalendarDays: "CalendarBlank",
  AlignJustify: "TextAlignJustify",
  AlignCenter: "TextAlignCenter",
  LayoutTemplate: "Layout",
  EyeOff: "EyeSlash",
  Zap: "Lightning",
  Sparkles: "Sparkle",
  Mic: "Microphone",
  Mic2: "MicrophoneStage",
  MicVocal: "MicrophoneStage",
  MicOff: "MicrophoneSlash",
  AudioLines: "Waveform",
  Volume2: "SpeakerHigh",
  VolumeX: "SpeakerX",
  Music: "MusicNotes",
  ArrowLeftRight: "ArrowsLeftRight",
  ArrowUpDown: "ArrowsDownUp",
  ChevronDown: "CaretDown",
  ChevronUp: "CaretUp",
  ChevronLeft: "CaretLeft",
  ChevronRight: "CaretRight",
  Home: "House",
  ExternalLink: "ArrowSquareOut",
  Menu: "List",
  MoreHorizontal: "DotsThree",
  MoreVertical: "DotsThreeVertical",
  PanelLeftClose: "SidebarSimple",
  PanelRightClose: "SidebarSimple",
  ScanSearch: "Scan",
  PanelLeftOpen: "Sidebar",
  Maximize2: "CornersOut",
  Minimize2: "CornersIn",
  Navigation: "NavigationArrow",
  CheckCircle2: "CheckCircle",
  AlertCircle: "WarningCircle",
  AlertTriangle: "Warning",
  AlertOctagon: "WarningOctagon",
  Ban: "Prohibit",
  HelpCircle: "Question",
  LoaderCircle: "CircleNotch",
  CircleAlert: "WarningCircle",
  CircleDollarSign: "CurrencyCircleDollar",
  SearchX: "MagnifyingGlassMinus",
  ShieldAlert: "ShieldWarning",
  ShieldOff: "ShieldSlash",
  ShieldX: "ShieldSlash",
  CircleDot: "DotOutline",
  UserCog: "UserGear",
  UserRound: "UserCircle",
  UserRoundCheck: "UserCircleCheck",
  UserX: "UserMinus",
  Settings: "Gear",
  Settings2: "GearSix",
  Unlock: "LockOpen",
  KeyRound: "Key",
  LogOut: "SignOut",
};

/**
 * Every other count in this file is derived at runtime from the catalog
 * scan itself or from REVIEWED_PHOSPHOR_ALIASES, so catalog growth cannot
 * silently drift the guard: adding, removing, or renaming a catalog icon
 * changes both sides of each relationship assertion together. This is the
 * one deliberate exception -- a decrease-only floor on the catalog's total
 * migrated-icon count. Without it, a bulk deletion of catalog files would
 * make every relationship assertion below vacuously true (0 imports, 0
 * factory calls, 0 aliases all still agree with each other) and the
 * regression would pass silently. Seeded at the count measured when the
 * Lucide -> Phosphor migration completed; raise it when the catalog grows,
 * never lower it just to make a shrinking catalog pass.
 */
const CATALOG_PHOSPHOR_IMPORT_FLOOR = 330;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectCatalogEntries(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return collectCatalogEntries(path);
    return entry.isFile() && /^index\.tsx?$/u.test(entry.name) ? [path] : [];
  });
}

function namedImportsFrom(
  source: string,
  moduleSpecifier: string
): NamedImport[] {
  const expression = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${escapeRegExp(
      moduleSpecifier
    )}['"];?`,
    "gu"
  );
  return [...source.matchAll(expression)].flatMap((match) =>
    match[1]
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [imported, local = imported] = entry
          .split(/\s+as\s+/u)
          .map((part) => part.trim());
        return { imported, local };
      })
  );
}

function phosphorSsrImportsFrom(
  source: string
): ReadonlyArray<NamedImport & { moduleName: string }> {
  const expression =
    /import\s*\{([^}]*)\}\s*from\s*['"]@phosphor-icons\/react\/dist\/ssr\/([A-Z][A-Za-z0-9]*)['"];?/gu;

  return [...source.matchAll(expression)].flatMap((match) =>
    match[1]
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [imported, local = imported] = entry
          .split(/\s+as\s+/u)
          .map((part) => part.trim());
        return { imported, local, moduleName: match[2] };
      })
  );
}

function isExactPhosphorSsrName(name: string): boolean {
  const declaration = join(PHOSPHOR_SSR_ROOT, `${name}.d.ts`);
  return (
    existsSync(declaration) &&
    readFileSync(declaration, "utf8").includes(`as ${name}Icon`)
  );
}

describe("catalog Phosphor supplier migration", () => {
  it("pins every catalog export to an exact Phosphor SSR module and the compatibility factory", () => {
    const entries = collectCatalogEntries(CATALOG_ROOT);
    const lucideImports: string[] = [];
    const phosphorMigrations: string[] = [];
    let compatibilityFactoryCallCount = 0;

    for (const entry of entries) {
      const source = readFileSync(entry, "utf8");
      const displayPath = relative(process.cwd(), entry);

      for (const { imported } of namedImportsFrom(source, "lucide-react")) {
        lucideImports.push(`${displayPath}:${imported}`);
      }

      compatibilityFactoryCallCount += (
        source.match(new RegExp(`${PHOSPHOR_COMPATIBILITY_FACTORY}\\(`, "gu")) ??
        []
      ).length;

      for (const { imported, local, moduleName } of phosphorSsrImportsFrom(
        source
      )) {
        expect(imported, `${displayPath}:${moduleName}`).toBe(
          `${moduleName}Icon`
        );
        expect(
          isExactPhosphorSsrName(moduleName),
          `${displayPath}:${moduleName}`
        ).toBe(true);
        const reviewedTarget = REVIEWED_PHOSPHOR_ALIASES[local];

        if (reviewedTarget) {
          expect(
            moduleName,
            `${displayPath}:${local} must use its reviewed Phosphor alias`
          ).toBe(reviewedTarget);
        } else {
          expect(
            local,
            `${displayPath}:${moduleName} must preserve its literal local name`
          ).toBe(moduleName);
        }
        expect(
          source,
          `${displayPath}:${local} must be wrapped through the DS compatibility factory`
        ).toMatch(
          new RegExp(
            `${PHOSPHOR_COMPATIBILITY_FACTORY}\\(\\s*${escapeRegExp(
              local
            )}\\s*,`,
            "u"
          )
        );
        phosphorMigrations.push(`${displayPath}:${local}`);
      }
    }

    expect(lucideImports).toEqual([]);
    // Every SSR import must be paired with exactly one compatibility-factory
    // call. This bijection holds regardless of catalog size, so it catches
    // an orphaned import or an orphaned factory call without a magic total
    // that has to be hand-bumped on every legitimate catalog addition.
    expect(phosphorMigrations).toHaveLength(compatibilityFactoryCallCount);
    expect(phosphorMigrations.length).toBeGreaterThanOrEqual(
      CATALOG_PHOSPHOR_IMPORT_FLOOR
    );
  });

  it("keeps every aliased catalog import one-to-one with a governed Phosphor rename", () => {
    const entries = collectCatalogEntries(CATALOG_ROOT);
    const aliasImports = entries.flatMap((entry) =>
      phosphorSsrImportsFrom(readFileSync(entry, "utf8")).filter(
        ({ local, moduleName }) => local !== moduleName
      )
    );
    const source = entries
      .map((entry) => readFileSync(entry, "utf8"))
      .join("\n");
    const importedAliases = new Set(aliasImports.map(({ local }) => local));
    const reviewedAliasNames = Object.keys(REVIEWED_PHOSPHOR_ALIASES);
    const reviewedAliasNameSet = new Set(reviewedAliasNames);

    // Bijection, both directions, derived from the catalog scan and the
    // registry object rather than a pinned count: every governed alias must
    // be used somewhere in the catalog (otherwise the registry carries a
    // dead entry), and every aliased catalog import must be governed
    // (otherwise a rename shipped without review). The previous test
    // already enforces the second direction per import site; asserted again
    // here as an aggregate so this test stays meaningful on its own.
    expect(
      reviewedAliasNames.every((name) => importedAliases.has(name))
    ).toBe(true);
    expect(
      [...importedAliases].every((name) => reviewedAliasNameSet.has(name))
    ).toBe(true);
    expect(importedAliases.size).toBe(reviewedAliasNames.length);

    expect(source).not.toMatch(/from\s*['"]lucide-react['"]/u);
    expect(source).not.toMatch(/\bcreateIcon\s*\(/u);
  });

  it("renders representative aliases from every catalog family with the DS accessibility contract", () => {
    const representatives: ReadonlyArray<readonly [string, DSIconComponent]> = [
      ["action", EditIcon],
      ["communication", MailIcon],
      ["compatibility", AccessibilityIcon],
      ["content", FileSearchIcon],
      ["data", ActivityIcon],
      ["layout", LayoutGridIcon],
      ["media", EyeOffIcon],
      ["navigation", ChevronDownIcon],
      ["status", AlertCircleIcon],
      ["user", UserCogIcon],
    ];

    for (const [family, Icon] of representatives) {
      const label = `${family} icon`;
      const markup = renderToStaticMarkup(
        createElement(Icon, { size: "sm", strokeWidth: 2, title: label })
      );

      expect(markup, family).toContain('width="var(--ds-icon-sm-size, 16px)"');
      expect(markup, family).toContain('class="rottay-icon"');
      expect(markup, family).toContain('role="img"');
      expect(markup, family).toContain(`aria-label="${label}"`);
      expect(markup, family).toContain(`<title>${label}</title>`);
    }
  });
});
