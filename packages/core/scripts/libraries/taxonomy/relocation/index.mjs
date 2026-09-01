/**
 * Source-owner relocation adapter: maps the inventory's recorded owner
 * directories onto the physical tree, or refuses to map at all.
 *
 * WHY THIS EXISTS. The family inventory records `sourceOwner` under one
 * physical prefix while the tree it describes lives under another. Every
 * consumer that tests containment -- does this terminal file sit inside that
 * owner? -- silently answers "no" for every row when the prefixes disagree,
 * and a containment check that matches nothing does not fail. It reports a
 * clean tree in which every component is unowned. That is the false green
 * this module removes: owners resolve once, up front, and a row that cannot
 * resolve is an error rather than an empty answer.
 *
 * WHY A CLOSED OVERRIDE TABLE. Most rows relocate by a literal prefix swap.
 * A hundred and one do not: their leaf directories were also re-cased or
 * renamed, and two moved between groups. Those thirty-one are recorded here as closed triples --
 * row id, the historical path, the exact destination -- because the transform
 * that produced them is not a rule. Inferring it (case folding, kebab-casing,
 * nearest match) would let a genuinely stale row resolve to a plausible
 * neighbour, converting the defect this gate exists to surface into a pass.
 * The table is data; there is no algorithm to drift.
 *
 * WHY FAIL-CLOSED. Every way of not knowing is its own named state and none
 * is a silent skip. A row is `missing` when its directory is not on disk,
 * `ambiguous` when it exists under both prefixes so the inventory cannot say
 * which it meant, and `colliding` when two rows claim one directory and
 * ownership stops being one-to-one. An override entry is `unknown` when it
 * binds no row, `duplicate` when two entries bind one row, `mismatch` when
 * the historical path it records is not the row's, and `unused` when the row
 * it names already resolves by prefix swap. That last one matters most: an
 * override nobody needs is how a table starts describing a tree that has
 * moved on. Every rejection is collected and reported together, because a
 * caller repairing an inventory needs the whole list.
 *
 * WHY EXISTENCE IS CASE-EXACT. `fs.existsSync` answers yes for `.../Badge`
 * when the directory is really `.../badge`, because macOS and Windows compare
 * case-insensitively. Consumers then take the recorded spelling and test
 * containment against real file paths with a case-SENSITIVE string compare,
 * which never matches -- every component under that owner reads as unowned,
 * and nothing failed. So existence here means a path whose every segment
 * matches a real directory entry byte for byte, and the answer does not
 * change with the host filesystem.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Physical prefix the inventory records. */
export const DEFAULT_FROM_PREFIX = 'packages/core/src/ui/';

/** Physical prefix the tree actually uses. */
export const DEFAULT_TO_PREFIX = 'packages/core/src/components/';

/**
 * The rows whose relocation is not a prefix swap, as closed triples.
 *
 * Each entry binds a row id to the historical path the inventory records and
 * the exact directory that replaced it. An entry is consumed only when the
 * row's literal swap target is absent, so the table cannot mask a row that
 * relocated normally after all.
 */
export const OWNER_RELOCATION_OVERRIDES = Object.freeze([
  {
    id: 'primitive/display/avatar',
    sourceOwner: 'packages/core/src/ui/primitives/display/Avatar',
    destination: 'packages/core/src/components/primitives/display/avatar',
  },
  {
    id: 'primitive/display/badge',
    sourceOwner: 'packages/core/src/ui/primitives/display/Badge',
    destination: 'packages/core/src/components/primitives/display/badge',
  },
  {
    id: 'primitive/display/calendar',
    sourceOwner: 'packages/core/src/ui/primitives/display/Calendar',
    destination: 'packages/core/src/components/primitives/display/calendar',
  },
  {
    id: 'primitive/display/callout',
    sourceOwner: 'packages/core/src/ui/primitives/display/Callout',
    destination: 'packages/core/src/components/primitives/display/callout',
  },
  {
    id: 'primitive/display/card',
    sourceOwner: 'packages/core/src/ui/primitives/display/Card',
    destination: 'packages/core/src/components/primitives/display/card',
  },
  {
    id: 'primitive/display/carousel',
    sourceOwner: 'packages/core/src/ui/primitives/display/Carousel',
    destination: 'packages/core/src/components/primitives/display/carousel',
  },
  {
    id: 'primitive/display/code-block',
    sourceOwner: 'packages/core/src/ui/primitives/display/CodeBlock',
    destination: 'packages/core/src/components/primitives/display/code-block',
  },
  {
    id: 'primitive/display/crop-marks',
    sourceOwner: 'packages/core/src/ui/primitives/display/CropMarks',
    destination: 'packages/core/src/components/primitives/display/crop-marks',
  },
  {
    id: 'primitive/display/descriptions',
    sourceOwner: 'packages/core/src/ui/primitives/display/Descriptions',
    destination: 'packages/core/src/components/primitives/display/descriptions',
  },
  {
    id: 'primitive/display/empty',
    sourceOwner: 'packages/core/src/ui/primitives/display/Empty',
    destination: 'packages/core/src/components/primitives/display/empty',
  },
  {
    id: 'primitive/display/image',
    sourceOwner: 'packages/core/src/ui/primitives/display/Image',
    destination: 'packages/core/src/components/primitives/display/image',
  },
  {
    id: 'primitive/display/kbd',
    sourceOwner: 'packages/core/src/ui/primitives/display/Kbd',
    destination: 'packages/core/src/components/primitives/display/kbd',
  },
  {
    id: 'primitive/display/list',
    sourceOwner: 'packages/core/src/ui/primitives/display/List',
    destination: 'packages/core/src/components/primitives/display/list',
  },
  {
    id: 'primitive/display/markdown-view',
    sourceOwner: 'packages/core/src/ui/primitives/display/MarkdownView',
    destination: 'packages/core/src/components/primitives/display/markdown-view',
  },
  {
    id: 'primitive/display/qr-code',
    sourceOwner: 'packages/core/src/ui/primitives/display/QRCode',
    destination: 'packages/core/src/components/primitives/display/qr-code',
  },
  {
    id: 'primitive/display/statistic',
    sourceOwner: 'packages/core/src/ui/primitives/display/Statistic',
    destination: 'packages/core/src/components/primitives/display/statistic',
  },
  {
    id: 'primitive/display/table',
    sourceOwner: 'packages/core/src/ui/primitives/display/Table',
    destination: 'packages/core/src/components/primitives/display/table',
  },
  {
    id: 'primitive/display/tag',
    sourceOwner: 'packages/core/src/ui/primitives/display/Tag',
    destination: 'packages/core/src/components/primitives/display/tag',
  },
  {
    id: 'primitive/display/texture-backdrop',
    sourceOwner: 'packages/core/src/ui/primitives/display/TextureBackdrop',
    destination: 'packages/core/src/components/primitives/display/texture-backdrop',
  },
  {
    id: 'primitive/display/timeline',
    sourceOwner: 'packages/core/src/ui/primitives/display/Timeline',
    destination: 'packages/core/src/components/primitives/display/timeline',
  },
  {
    id: 'primitive/display/tooltip',
    sourceOwner: 'packages/core/src/ui/primitives/display/Tooltip',
    destination: 'packages/core/src/components/primitives/display/tooltip',
  },
  {
    id: 'primitive/display/tree',
    sourceOwner: 'packages/core/src/ui/primitives/display/Tree',
    destination: 'packages/core/src/components/primitives/display/tree',
  },
  {
    id: 'primitive/display/typewriter',
    sourceOwner: 'packages/core/src/ui/primitives/display/Typewriter',
    destination: 'packages/core/src/components/primitives/display/typewriter',
  },
  {
    id: 'primitive/display/typography',
    sourceOwner: 'packages/core/src/ui/primitives/display/Typography',
    destination: 'packages/core/src/components/primitives/display/typography',
  },
  {
    id: 'primitive/feedback/alert',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Alert',
    destination: 'packages/core/src/components/primitives/feedback/alert',
  },
  {
    id: 'primitive/feedback/drawer',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Drawer',
    destination: 'packages/core/src/components/primitives/feedback/drawer',
  },
  {
    id: 'primitive/feedback/message',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Message',
    destination: 'packages/core/src/components/primitives/feedback/message',
  },
  {
    id: 'primitive/feedback/modal',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Modal',
    destination: 'packages/core/src/components/primitives/feedback/modal',
  },
  {
    id: 'primitive/feedback/notification',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Notification',
    destination: 'packages/core/src/components/primitives/feedback/notification',
  },
  {
    id: 'primitive/feedback/progress',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Progress',
    destination: 'packages/core/src/components/primitives/feedback/progress',
  },
  {
    id: 'primitive/feedback/rate',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Rate',
    destination: 'packages/core/src/components/primitives/feedback/rate',
  },
  {
    id: 'primitive/feedback/result',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Result',
    destination: 'packages/core/src/components/primitives/feedback/result',
  },
  {
    id: 'primitive/feedback/skeleton',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Skeleton',
    destination: 'packages/core/src/components/primitives/feedback/skeleton',
  },
  {
    id: 'primitive/feedback/spinner',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Spinner',
    destination: 'packages/core/src/components/primitives/feedback/spinner',
  },
  {
    id: 'primitive/feedback/toast',
    sourceOwner: 'packages/core/src/ui/primitives/feedback/Toast',
    destination: 'packages/core/src/components/primitives/feedback/toast',
  },
  {
    id: 'primitive/display/icon-frame',
    sourceOwner: 'packages/core/src/ui/primitives/foundation/IconFrame',
    destination: 'packages/core/src/components/primitives/foundation/icon-frame',
  },
  {
    id: 'primitive/display/meter',
    sourceOwner: 'packages/core/src/ui/primitives/foundation/Meter',
    destination: 'packages/core/src/components/primitives/foundation/meter',
  },
  {
    id: 'primitive/layout/resize-handle',
    sourceOwner: 'packages/core/src/ui/primitives/foundation/ResizeHandle',
    destination: 'packages/core/src/components/primitives/foundation/resize-handle',
  },
  {
    id: 'primitive/layout/visually-hidden',
    sourceOwner: 'packages/core/src/ui/primitives/foundation/VisuallyHidden',
    destination: 'packages/core/src/components/primitives/foundation/visually-hidden',
  },
  {
    id: 'primitive/inputs/auto-complete',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/AutoComplete',
    destination: 'packages/core/src/components/primitives/inputs/auto-complete',
  },
  {
    id: 'primitive/inputs/button',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Button',
    destination: 'packages/core/src/components/primitives/inputs/button',
  },
  {
    id: 'primitive/inputs/cascader',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Cascader',
    destination: 'packages/core/src/components/primitives/inputs/cascader',
  },
  {
    id: 'primitive/inputs/checkbox',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Checkbox',
    destination: 'packages/core/src/components/primitives/inputs/checkbox',
  },
  {
    id: 'primitive/inputs/color-picker',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/ColorPicker',
    destination: 'packages/core/src/components/primitives/inputs/color-picker',
  },
  {
    id: 'primitive/inputs/date-picker',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/DatePicker',
    destination: 'packages/core/src/components/primitives/inputs/date-picker',
  },
  {
    id: 'primitive/inputs/form',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Form',
    destination: 'packages/core/src/components/primitives/inputs/form',
  },
  {
    id: 'primitive/inputs/form-field',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/FormField',
    destination: 'packages/core/src/components/primitives/inputs/form-field',
  },
  {
    id: 'primitive/inputs/input',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Input',
    destination: 'packages/core/src/components/primitives/inputs/input',
  },
  {
    id: 'primitive/inputs/input-number',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/InputNumber',
    destination: 'packages/core/src/components/primitives/inputs/input-number',
  },
  {
    id: 'primitive/inputs/mentions',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Mentions',
    destination: 'packages/core/src/components/primitives/inputs/mentions',
  },
  {
    id: 'primitive/inputs/otp-input',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/OTPInput',
    destination: 'packages/core/src/components/primitives/inputs/otp-input',
  },
  {
    id: 'primitive/inputs/password-input',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/PasswordInput',
    destination: 'packages/core/src/components/primitives/inputs/password-input',
  },
  {
    id: 'primitive/inputs/radio',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Radio',
    destination: 'packages/core/src/components/primitives/inputs/radio',
  },
  {
    id: 'primitive/inputs/select',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Select',
    destination: 'packages/core/src/components/primitives/inputs/select',
  },
  {
    id: 'primitive/inputs/slider',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Slider',
    destination: 'packages/core/src/components/primitives/inputs/slider',
  },
  {
    id: 'primitive/inputs/switch',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Switch',
    destination: 'packages/core/src/components/primitives/inputs/switch',
  },
  {
    id: 'primitive/inputs/tag-input',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/TagInput',
    destination: 'packages/core/src/components/primitives/inputs/tag-input',
  },
  {
    id: 'primitive/inputs/textarea',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Textarea',
    destination: 'packages/core/src/components/primitives/inputs/textarea',
  },
  {
    id: 'primitive/inputs/time-picker',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/TimePicker',
    destination: 'packages/core/src/components/primitives/inputs/time-picker',
  },
  {
    id: 'primitive/inputs/toggle',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Toggle',
    destination: 'packages/core/src/components/primitives/inputs/toggle',
  },
  {
    id: 'primitive/inputs/transfer',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Transfer',
    destination: 'packages/core/src/components/primitives/inputs/transfer',
  },
  {
    id: 'primitive/inputs/tree-select',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/TreeSelect',
    destination: 'packages/core/src/components/primitives/inputs/tree-select',
  },
  {
    id: 'primitive/inputs/upload',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/Upload',
    destination: 'packages/core/src/components/primitives/inputs/upload',
  },
  {
    id: 'primitive/inputs/voice-input-button',
    sourceOwner: 'packages/core/src/ui/primitives/inputs/VoiceInputButton',
    destination: 'packages/core/src/components/primitives/inputs/voice-input-button',
  },
  {
    id: 'primitive/layout/ascii-frame',
    sourceOwner: 'packages/core/src/ui/primitives/layout/AsciiFrame',
    destination: 'packages/core/src/components/primitives/layout/ascii-frame',
  },
  {
    id: 'primitive/layout/aspect-ratio',
    sourceOwner: 'packages/core/src/ui/primitives/layout/AspectRatio',
    destination: 'packages/core/src/components/primitives/layout/aspect-ratio',
  },
  {
    id: 'primitive/layout/box',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Box',
    destination: 'packages/core/src/components/primitives/layout/box',
  },
  {
    id: 'primitive/layout/collapse',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Collapse',
    destination: 'packages/core/src/components/primitives/layout/collapse',
  },
  {
    id: 'primitive/layout/container',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Container',
    destination: 'packages/core/src/components/primitives/layout/container',
  },
  {
    id: 'primitive/layout/divider',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Divider',
    destination: 'packages/core/src/components/primitives/layout/divider',
  },
  {
    id: 'primitive/layout/flex',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Flex',
    destination: 'packages/core/src/components/primitives/layout/flex',
  },
  {
    id: 'primitive/layout/grid',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Grid',
    destination: 'packages/core/src/components/primitives/layout/grid',
  },
  {
    id: 'primitive/layout/invert-section',
    sourceOwner: 'packages/core/src/ui/primitives/layout/InvertSection',
    destination: 'packages/core/src/components/primitives/layout/invert-section',
  },
  {
    id: 'primitive/layout/layout',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Layout',
    destination: 'packages/core/src/components/primitives/layout/system',
  },
  {
    id: 'primitive/layout/scroll-area',
    sourceOwner: 'packages/core/src/ui/primitives/layout/ScrollArea',
    destination: 'packages/core/src/components/primitives/layout/scroll-area',
  },
  {
    id: 'primitive/layout/semantic-surface',
    sourceOwner: 'packages/core/src/ui/primitives/layout/SemanticSurface',
    destination: 'packages/core/src/components/primitives/layout/semantic-surface',
  },
  {
    id: 'primitive/layout/space',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Space',
    destination: 'packages/core/src/components/primitives/layout/space',
  },
  {
    id: 'primitive/layout/splitter',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Splitter',
    destination: 'packages/core/src/components/primitives/layout/splitter',
  },
  {
    id: 'primitive/layout/stack',
    sourceOwner: 'packages/core/src/ui/primitives/layout/Stack',
    destination: 'packages/core/src/components/primitives/layout/stack',
  },
  {
    id: 'primitive/navigation/affix',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Affix',
    destination: 'packages/core/src/components/primitives/navigation/affix',
  },
  {
    id: 'primitive/navigation/anchor',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Anchor',
    destination: 'packages/core/src/components/primitives/navigation/anchor',
  },
  {
    id: 'primitive/navigation/back-top',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/BackTop',
    destination: 'packages/core/src/components/primitives/navigation/back-top',
  },
  {
    id: 'primitive/navigation/breadcrumb',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Breadcrumb',
    destination: 'packages/core/src/components/primitives/navigation/breadcrumb',
  },
  {
    id: 'primitive/navigation/float-button',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/FloatButton',
    destination: 'packages/core/src/components/primitives/navigation/float-button',
  },
  {
    id: 'primitive/navigation/link',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Link',
    destination: 'packages/core/src/components/primitives/navigation/link',
  },
  {
    id: 'primitive/navigation/menu',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Menu',
    destination: 'packages/core/src/components/primitives/navigation/menu',
  },
  {
    id: 'primitive/navigation/pagination',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Pagination',
    destination: 'packages/core/src/components/primitives/navigation/pagination',
  },
  {
    id: 'primitive/navigation/segmented',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Segmented',
    destination: 'packages/core/src/components/primitives/navigation/segmented',
  },
  {
    id: 'primitive/navigation/stepper',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Stepper',
    destination: 'packages/core/src/components/primitives/navigation/stepper',
  },
  {
    id: 'primitive/navigation/steps',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Steps',
    destination: 'packages/core/src/components/primitives/navigation/steps',
  },
  {
    id: 'primitive/navigation/tabs',
    sourceOwner: 'packages/core/src/ui/primitives/navigation/Tabs',
    destination: 'packages/core/src/components/primitives/navigation/tabs',
  },
  {
    id: 'primitive/overlay/alert-dialog',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/AlertDialog',
    destination: 'packages/core/src/components/primitives/overlay/alert-dialog',
  },
  {
    id: 'primitive/overlay/confirm-dialog',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/ConfirmDialog',
    destination: 'packages/core/src/components/primitives/overlay/confirm-dialog',
  },
  {
    id: 'primitive/overlay/context-menu',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/ContextMenu',
    destination: 'packages/core/src/components/primitives/overlay/context-menu',
  },
  {
    id: 'primitive/overlay/dropdown',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/Dropdown',
    destination: 'packages/core/src/components/primitives/overlay/dropdown',
  },
  {
    id: 'primitive/overlay/hover-card',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/HoverCard',
    destination: 'packages/core/src/components/primitives/overlay/hover-card',
  },
  {
    id: 'primitive/overlay/popconfirm',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/Popconfirm',
    destination: 'packages/core/src/components/primitives/overlay/popconfirm',
  },
  {
    id: 'primitive/overlay/popover',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/Popover',
    destination: 'packages/core/src/components/primitives/overlay/popover',
  },
  {
    id: 'primitive/overlay/sheet',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/Sheet',
    destination: 'packages/core/src/components/primitives/overlay/sheet',
  },
  {
    id: 'primitive/overlay/tour',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/Tour',
    destination: 'packages/core/src/components/primitives/overlay/tour',
  },
  {
    id: 'primitive/overlay/watermark',
    sourceOwner: 'packages/core/src/ui/primitives/overlay/Watermark',
    destination: 'packages/core/src/components/primitives/overlay/watermark',
  },
]);

/**
 * Thrown once, after every entry and row has been examined, when anything
 * failed to resolve. `rejections` carries the full list so a caller can
 * report or assert on it without re-parsing the message.
 */
export class RelocationError extends Error {
  /** @param {Array<{ id: string, sourceOwner: string, reason: string }>} rejections */
  constructor(rejections) {
    const lines = rejections.map(
      ({ id, sourceOwner, reason }) => `  - ${id}: ${sourceOwner} (${reason})`,
    );
    super(`relocateSourceOwners rejected ${rejections.length} entr(y/ies) or row(s):\n${lines.join('\n')}`);
    this.name = 'RelocationError';
    this.rejections = rejections;
  }
}

/**
 * Case-exact directory existence.
 *
 * Every segment is matched against a `readdir` listing of its parent, walked
 * from the filesystem root, and must be present byte for byte. `fs.existsSync`
 * and `realpath` are deliberately unused: both answer yes for `.../Badge` when
 * the directory is really `.../badge` on a case-insensitive volume, and that
 * yes is what lets a wrongly-cased owner travel downstream into a
 * case-sensitive containment test that can never match.
 *
 * @param {string} absoluteDir Absolute directory to test.
 * @param {{ readdir?: (dir: string) => string[] }} [options] `readdir` is
 *   injectable so drills need no filesystem.
 * @returns {boolean}
 */
export function caseExactDirExists(absoluteDir, { readdir = (dir) => fs.readdirSync(dir) } = {}) {
  const { root } = path.parse(absoluteDir);
  const relative = path.relative(root, absoluteDir);
  if (relative === '') return true;

  let current = root;
  for (const segment of relative.split(path.sep)) {
    let names;
    try {
      names = readdir(current);
    } catch {
      return false;
    }
    if (!names.includes(segment)) return false;
    current = path.join(current, segment);
  }
  return true;
}

/** A directory key that cannot prefix-match a sibling whose name extends it. */
function asOwnerDirectory(absolute) {
  return absolute.endsWith(path.sep) ? absolute : absolute + path.sep;
}

/**
 * Resolves each row's `sourceOwner` onto an absolute directory in the physical
 * tree.
 *
 * A row named by a consumed override resolves to that entry's destination; any
 * other row whose `sourceOwner` starts with `fromPrefix` resolves to the
 * literal swap onto `toPrefix`; anything else is taken as written.
 *
 * @param {Array<{ id: string, sourceOwner: string }>} rows Inventory rows.
 * @param {object} options
 * @param {string} options.repoRoot Absolute repository root.
 * @param {string} [options.fromPrefix] Prefix the inventory records.
 * @param {string} [options.toPrefix] Prefix the tree uses.
 * @param {Array<{ id: string, sourceOwner: string, destination: string }>} [options.overrides]
 * @param {(candidate: string) => boolean} [options.exists] Injected for hermetic drills.
 *   Defaults to `caseExactDirExists`.
 * @returns {Map<string, string>} Row id to absolute owner directory, trailing separator included.
 * @throws {RelocationError} If any entry or row fails to resolve.
 */
export function relocateSourceOwners(
  rows,
  {
    repoRoot,
    fromPrefix = DEFAULT_FROM_PREFIX,
    toPrefix = DEFAULT_TO_PREFIX,
    overrides = OWNER_RELOCATION_OVERRIDES,
    exists = caseExactDirExists,
  } = {},
) {
  if (typeof repoRoot !== 'string' || repoRoot.length === 0) {
    throw new TypeError('relocateSourceOwners requires an absolute repoRoot');
  }

  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const swapTarget = (row) =>
    row.sourceOwner.startsWith(fromPrefix)
      ? toPrefix + row.sourceOwner.slice(fromPrefix.length)
      : row.sourceOwner;

  // Entry hygiene. Every defect is attributed to the entry, so a table that
  // has drifted from the inventory names itself rather than silently widening
  // what resolves.
  const rejections = [];
  const entriesById = new Map();
  for (const entry of overrides) {
    const list = entriesById.get(entry.id) ?? [];
    list.push(entry);
    entriesById.set(entry.id, list);
  }

  const usable = new Map();
  for (const [id, entries] of entriesById) {
    const row = rowsById.get(id);
    if (entries.length > 1) {
      for (const entry of entries) {
        rejections.push({ id, sourceOwner: entry.sourceOwner, reason: 'duplicate' });
      }
      continue;
    }
    const [entry] = entries;
    if (!row) {
      rejections.push({ id, sourceOwner: entry.sourceOwner, reason: 'unknown' });
      continue;
    }
    if (entry.sourceOwner !== row.sourceOwner) {
      rejections.push({ id, sourceOwner: entry.sourceOwner, reason: 'mismatch' });
      continue;
    }
    // An override is only legitimate while the ordinary swap fails. Computing
    // the swap first is what makes `unused` detectable at all.
    if (exists(path.resolve(repoRoot, swapTarget(row)))) {
      rejections.push({ id, sourceOwner: entry.sourceOwner, reason: 'unused' });
      continue;
    }
    usable.set(id, entry);
  }

  // First pass over rows. Collisions need every row's answer before they can
  // be seen, so they are deferred.
  const outcomes = [];
  for (const row of rows) {
    const { id, sourceOwner } = row;
    if (entriesById.has(id) && !usable.has(id)) continue; // its entry already rejected

    const entry = usable.get(id);
    const relative = entry ? entry.destination : swapTarget(row);
    const resolved = path.resolve(repoRoot, relative);

    // Ambiguity is a question about the prefix pair only; an override row has
    // already been proven to have no swap target.
    if (!entry) {
      const underFrom = sourceOwner.startsWith(fromPrefix);
      const underTo = sourceOwner.startsWith(toPrefix);
      if (underFrom || underTo) {
        const counterpart = underFrom
          ? sourceOwner
          : fromPrefix + sourceOwner.slice(toPrefix.length);
        if (exists(resolved) && exists(path.resolve(repoRoot, counterpart))) {
          outcomes.push({ id, sourceOwner, reason: 'ambiguous' });
          continue;
        }
      }
    }

    if (!exists(resolved)) {
      outcomes.push({ id, sourceOwner, reason: 'missing' });
      continue;
    }

    outcomes.push({ id, sourceOwner, directory: asOwnerDirectory(resolved) });
  }

  // Second pass: ownership is one-to-one, so a directory claimed by more than
  // one row rejects every row that claimed it. Keeping the first and dropping
  // the rest would be the silent skip this module exists to prevent.
  const claimants = new Map();
  for (const outcome of outcomes) {
    if (!outcome.directory) continue;
    const ids = claimants.get(outcome.directory) ?? [];
    ids.push(outcome.id);
    claimants.set(outcome.directory, ids);
  }

  const resolved = new Map();
  for (const outcome of outcomes) {
    if (outcome.reason) {
      rejections.push({ id: outcome.id, sourceOwner: outcome.sourceOwner, reason: outcome.reason });
      continue;
    }
    if (claimants.get(outcome.directory).length > 1) {
      rejections.push({ id: outcome.id, sourceOwner: outcome.sourceOwner, reason: 'colliding' });
      continue;
    }
    resolved.set(outcome.id, outcome.directory);
  }

  if (rejections.length > 0) throw new RelocationError(rejections);
  return resolved;
}
