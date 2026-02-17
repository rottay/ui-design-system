/**
 * fix-null-array-guards.mjs
 *
 * Scans all preset files and adds Array.isArray guards for array-like props
 * that are destructured with defaults from `props`.
 *
 * The bug: default values in destructuring only trigger on `undefined`, not `null`.
 * When useServerAction returns `data: null`, pages pass `null` to these components,
 * and they crash with "X is not iterable" or "X.filter is not a function".
 *
 * Usage: node scripts/fix-null-array-guards.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/custom';

// Already fixed presets - skip these
const SKIP_COMPONENTS = new Set(['bh-position-list', 'bh-position-sla']);

// Known array-like prop names (will also match partial patterns)
const ARRAY_PROP_PATTERNS = [
  // Exact matches
  'positions', 'interviews', 'candidates', 'jobs', 'offers', 'teams', 'clients',
  'items', 'data', 'applications', 'entries', 'columns', 'rows', 'records',
  'sources', 'recruiters', 'analytics', 'metrics', 'stages', 'filters',
  'members', 'users', 'roles', 'permissions', 'notifications', 'messages',
  'comments', 'tags', 'categories', 'options', 'features', 'integrations',
  'events', 'tasks', 'steps', 'sections', 'tabs', 'panels', 'cards',
  'badges', 'avatars', 'files', 'uploads', 'downloads', 'exports', 'imports',
  'logs', 'alerts', 'rules', 'conditions', 'actions', 'triggers',
  'workflows', 'approvals', 'reviews', 'feedbacks', 'ratings',
  'plans', 'subscriptions', 'invoices', 'payments', 'transactions',
  'products', 'orders', 'receipts', 'refunds', 'coupons',
  'templates', 'designs', 'themes', 'colors', 'palettes',
  'connections', 'endpoints', 'webhooks', 'apis', 'keys',
  'departments', 'organizations', 'tenants', 'companies',
  'skills', 'qualifications', 'certifications', 'experiences',
  'questions', 'answers', 'responses', 'results', 'scores',
  'kpis', 'stats', 'summaries', 'reports', 'charts',
  'nodes', 'edges', 'links', 'dependencies', 'graphs',
  'activities', 'statuses', 'priorities', 'labels',
  'channels', 'conversations', 'threads',
  'images', 'media', 'gallery', 'attachments',
  'providers', 'services', 'plugins', 'extensions',
  'navigation', 'breadcrumbs', 'menus', 'routes',
  'credentials', 'secrets', 'tokens', 'sessions',
  'zones', 'regions', 'locations', 'addresses',
  'schedules', 'shifts', 'timeslots', 'bookings', 'reservations',
  'recipes', 'ingredients', 'inventory', 'stock',
  'suppliers', 'vendors', 'contacts', 'leads', 'deals',
  'campaigns', 'audiences', 'segments',
  'tickets', 'passes', 'seats', 'tables',
  'sponsors', 'partnerships', 'exhibitors',
  'performers', 'artists', 'lineup',
  'announcements', 'banners', 'notices',
  // BH-specific
  'comparisonRows', 'dimensionScores', 'strengthWeaknesses',
  'decisions', 'scorecards', 'rubrics', 'criteria',
  'pipelines', 'funnels', 'bottlenecks',
  'appeals', 'calibrations', 'proctoring',
  'transcripts', 'segments', 'markers',
  'sprints', 'retrospectives', 'velocities',
  'outreach', 'sequences',
  // Data/analytics
  'levelDistribution', 'heatmapData', 'knockoutStats', 'trendData',
  'cohortComparisons', 'skillGaps', 'distributionData',
  'benchmarks', 'dataPoints', 'series', 'datasets',
  // Generic collections
  'list', 'collection', 'set', 'group', 'batch',
  'selectedJobs', 'selectedCandidates', 'selectedItems',
  'bulkSelection', 'selection',
  // Specific found in codebase
  'shortcuts', 'recentCommands', 'suggestedCommands',
  'statusConfig', 'urgencyConfig',
];

// Build a set for O(1) lookup
const ARRAY_PROP_SET = new Set(ARRAY_PROP_PATTERNS);

// Suffixes that strongly indicate arrays
const ARRAY_SUFFIXES = [
  'List', 'Items', 'Data', 'Entries', 'Records', 'Rows', 'Columns',
  'Options', 'Results', 'Scores', 'Stats', 'Kpis', 'Metrics',
  'Events', 'Nodes', 'Edges', 'Steps', 'Stages', 'Rules',
  'Actions', 'Conditions', 'Filters', 'Tags', 'Labels',
  'Members', 'Users', 'Teams', 'Groups', 'Roles',
  'Cards', 'Badges', 'Tabs', 'Panels', 'Sections',
  'Messages', 'Comments', 'Threads', 'Channels',
  'Files', 'Images', 'Media', 'Attachments',
  'Logs', 'Alerts', 'Notifications',
  'Templates', 'Workflows', 'Integrations',
  'Payments', 'Transactions', 'Orders', 'Invoices',
  'Products', 'Plans', 'Subscriptions',
  'Keys', 'Tokens', 'Sessions', 'Secrets',
  'Sources', 'Providers', 'Services',
  'Shifts', 'Schedules', 'Slots', 'Bookings',
  'Routes', 'Endpoints', 'Apis',
  'Vendors', 'Suppliers', 'Contacts',
  'Tickets', 'Passes', 'Seats',
  'Zones', 'Regions', 'Locations',
  'Tasks', 'Activities',
  'Reviews', 'Feedbacks', 'Ratings',
  'Campaigns', 'Segments', 'Audiences',
  'Colors', 'Palettes', 'Themes',
  'Dependencies', 'Connections', 'Links',
  'Candidates', 'Positions', 'Jobs', 'Offers',
  'Interviews', 'Applications', 'Pipelines',
  'Appeals', 'Approvals', 'Decisions',
  'Gaps', 'Comparisons', 'Cohorts',
  'Distribution', 'Knockouts',
];

function isArrayLikePropName(propName) {
  // Direct match
  if (ARRAY_PROP_SET.has(propName)) return true;

  // Check suffixes
  for (const suffix of ARRAY_SUFFIXES) {
    if (propName.endsWith(suffix) || propName.endsWith(suffix.toLowerCase())) return true;
  }

  // Check if it ends with 's' and the singular is in the set
  // This catches plurals we might have missed
  if (propName.endsWith('s') && propName.length > 3) return true; // very broad, but combined with default check, should be safe

  return false;
}

function isDefaultArrayValue(defaultVal) {
  const trimmed = defaultVal.trim();
  if (trimmed === '[]') return true;
  if (trimmed.startsWith('MOCK_')) return true;
  if (trimmed.startsWith('DEFAULT_')) return true;
  if (trimmed.startsWith('INITIAL_')) return true;
  if (trimmed.startsWith('EMPTY_')) return true;
  return false;
}

// Non-array prop names to explicitly exclude
const NON_ARRAY_PROPS = new Set([
  'loading', 'className', 'style', 'onPositionClick', 'onCandidateClick',
  'onJobClick', 'onFilterChange', 'onViewModeChange', 'onCreateJob',
  'onSortChange', 'onSearchChange', 'onSelectionChange', 'searchQuery',
  'selectedPositionId', 'selectedCandidateId', 'emptyText', 'title',
  'subtitle', 'description', 'sortBy', 'sortDirection', 'viewMode',
  'jobName', 'totalCandidates', 'highlightBest', 'showRadar',
  'isOpen', 'onClose', 'onOpen', 'onSubmit', 'onCancel', 'onSave',
  'onDelete', 'onEdit', 'onAdd', 'onRemove', 'onToggle', 'onSelect',
  'disabled', 'readOnly', 'required', 'placeholder', 'label', 'name',
  'value', 'defaultValue', 'error', 'helperText', 'maxLength', 'min', 'max',
  'variant', 'size', 'color', 'fullWidth', 'compact', 'dense',
  'layout', 'orientation', 'alignment', 'direction', 'spacing', 'gap',
]);

function isNonArrayProp(propName) {
  if (NON_ARRAY_PROPS.has(propName)) return true;
  // Callback props
  if (propName.startsWith('on') && propName[2] && propName[2] === propName[2].toUpperCase()) return true;
  // Boolean-like
  if (propName.startsWith('is') || propName.startsWith('has') || propName.startsWith('show') || propName.startsWith('hide') || propName.startsWith('enable') || propName.startsWith('disable')) return true;
  return false;
}

/**
 * Parse the destructuring block from `} = props;` backwards to find the opening `{`
 * Returns { startIdx, endIdx, content } where content is the destructuring body
 */
function findPropsDestructuring(fileContent) {
  const results = [];
  // Find all `} = props;` or `} = props,` or similar
  const propsEndRegex = /\}\s*=\s*props\s*[;,]/g;
  let match;

  while ((match = propsEndRegex.exec(fileContent)) !== null) {
    const closingBraceIdx = match.index;

    // Walk backwards to find the matching opening brace
    let depth = 0;
    let openBraceIdx = -1;
    for (let i = closingBraceIdx; i >= 0; i--) {
      if (fileContent[i] === '}') depth++;
      if (fileContent[i] === '{') {
        depth--;
        if (depth === 0) {
          openBraceIdx = i;
          break;
        }
      }
    }

    if (openBraceIdx === -1) continue;

    // Find the `const` or `let` before the opening brace
    const beforeBrace = fileContent.substring(Math.max(0, openBraceIdx - 50), openBraceIdx).trimEnd();
    if (!beforeBrace.endsWith('const') && !beforeBrace.endsWith('let')) continue;

    const destructContent = fileContent.substring(openBraceIdx + 1, closingBraceIdx);
    const fullStatementEnd = match.index + match[0].length;

    // Find the start of the const/let statement
    const constIdx = fileContent.lastIndexOf('const', openBraceIdx);
    const letIdx = fileContent.lastIndexOf('let', openBraceIdx);
    const statementStart = Math.max(constIdx, letIdx);

    results.push({
      statementStart,
      openBraceIdx,
      closingBraceIdx,
      fullStatementEnd,
      destructContent,
      fullStatement: fileContent.substring(statementStart, fullStatementEnd),
    });
  }

  return results;
}

/**
 * Parse individual props from destructuring content.
 * Handles patterns like:
 *   propName = defaultValue
 *   propName: alias = defaultValue
 *   propName
 *   propName: alias
 */
function parseDestructuredProps(destructContent) {
  const props = [];
  // Remove nested destructuring to avoid confusion
  let cleaned = destructContent;

  // Split by comma, handling nested structures
  const parts = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    if (ch === '}' || ch === ']' || ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  for (const part of parts) {
    if (!part) continue;

    // Pattern: propName: alias = defaultValue
    const aliasDefaultMatch = part.match(/^(\w+)\s*:\s*(\w+)\s*=\s*(.+)$/s);
    if (aliasDefaultMatch) {
      props.push({
        originalName: aliasDefaultMatch[1].trim(),
        alias: aliasDefaultMatch[2].trim(),
        defaultValue: aliasDefaultMatch[3].trim(),
        raw: part,
      });
      continue;
    }

    // Pattern: propName = defaultValue
    const defaultMatch = part.match(/^(\w+)\s*=\s*(.+)$/s);
    if (defaultMatch) {
      props.push({
        originalName: defaultMatch[1].trim(),
        alias: null,
        defaultValue: defaultMatch[2].trim(),
        raw: part,
      });
      continue;
    }

    // Pattern: propName: alias (no default)
    const aliasMatch = part.match(/^(\w+)\s*:\s*(\w+)$/);
    if (aliasMatch) {
      props.push({
        originalName: aliasMatch[1].trim(),
        alias: aliasMatch[2].trim(),
        defaultValue: null,
        raw: part,
      });
      continue;
    }

    // Pattern: just propName
    const simpleMatch = part.match(/^(\w+)$/);
    if (simpleMatch) {
      props.push({
        originalName: simpleMatch[1].trim(),
        alias: null,
        defaultValue: null,
        raw: part,
      });
      continue;
    }

    // Skip complex destructuring patterns (rest, nested objects, etc.)
  }

  return props;
}

function generateRawName(name) {
  return 'raw' + name.charAt(0).toUpperCase() + name.slice(1);
}

function findAllPresetFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findAllPresetFiles(fullPath));
    } else if (entry.name === 'index.tsx' && fullPath.includes('/presets/')) {
      results.push(fullPath);
    }
  }
  return results;
}

function processFile(filePath) {
  const relPath = relative(ROOT, filePath);

  // Check if this component should be skipped
  for (const skip of SKIP_COMPONENTS) {
    if (filePath.includes(`/${skip}/`)) {
      return { skipped: true, reason: 'already-fixed', path: relPath };
    }
  }

  let content = readFileSync(filePath, 'utf-8');

  // Check if already has Array.isArray guards (already fixed)
  if (content.includes('Array.isArray(raw')) {
    return { skipped: true, reason: 'already-has-guard', path: relPath };
  }

  const destructurings = findPropsDestructuring(content);
  if (destructurings.length === 0) {
    return { skipped: true, reason: 'no-props-destructuring', path: relPath };
  }

  let totalFixes = 0;
  const fixedProps = [];

  // Process each destructuring block (in reverse order to maintain indices)
  for (let di = destructurings.length - 1; di >= 0; di--) {
    const destr = destructurings[di];
    const parsedProps = parseDestructuredProps(destr.destructContent);

    // Find props that need fixing
    const propsToFix = [];
    for (const p of parsedProps) {
      if (!p.defaultValue) continue; // No default = no issue with this pattern
      if (!isDefaultArrayValue(p.defaultValue)) continue; // Default is not array-like
      const effectiveName = p.alias || p.originalName;
      if (isNonArrayProp(effectiveName)) continue; // Known non-array prop

      propsToFix.push(p);
    }

    if (propsToFix.length === 0) continue;

    // Build the replacement destructuring and guard lines
    let newDestructContent = destr.destructContent;
    const guardLines = [];

    for (const p of propsToFix) {
      const effectiveName = p.alias || p.originalName;
      const rawName = generateRawName(effectiveName);

      if (p.alias) {
        // Already has alias like `candidates: cp = []`
        // Change to `candidates: rawCp = []`
        const rawAlias = generateRawName(p.alias);
        const oldPattern = `${p.originalName}: ${p.alias} = ${p.defaultValue}`;
        const newPattern = `${p.originalName}: ${rawAlias} = ${p.defaultValue}`;

        if (newDestructContent.includes(oldPattern)) {
          newDestructContent = newDestructContent.replace(oldPattern, newPattern);
          guardLines.push(`    const ${p.alias} = Array.isArray(${rawAlias}) ? ${rawAlias} : ${p.defaultValue};`);
          fixedProps.push({ file: relPath, prop: `${p.originalName}: ${p.alias}`, default: p.defaultValue });
        }
      } else {
        // Simple prop like `jobs = []`
        // Change to `jobs: rawJobs = []`
        const oldPattern = `${p.originalName} = ${p.defaultValue}`;
        const newPattern = `${p.originalName}: ${rawName} = ${p.defaultValue}`;

        if (newDestructContent.includes(oldPattern)) {
          newDestructContent = newDestructContent.replace(oldPattern, newPattern);
          guardLines.push(`    const ${p.originalName} = Array.isArray(${rawName}) ? ${rawName} : ${p.defaultValue};`);
          fixedProps.push({ file: relPath, prop: p.originalName, default: p.defaultValue });
        }
      }
    }

    if (guardLines.length === 0) continue;

    // Replace the destructuring content
    const oldFull = content.substring(destr.openBraceIdx + 1, destr.closingBraceIdx);
    const newFull = newDestructContent;

    // Build the new content: replace destructuring + add guard lines after
    const beforeDestr = content.substring(0, destr.openBraceIdx + 1);
    const afterDestr = content.substring(destr.closingBraceIdx);

    content = beforeDestr + newFull + afterDestr;

    // Now find where the statement ends (after `= props;`) and insert guard lines
    // We need to re-find the end position since content changed
    const newPropsEnd = content.indexOf('} = props', destr.openBraceIdx);
    if (newPropsEnd === -1) continue;

    // Find the semicolon or end after `} = props`
    const afterProps = content.indexOf(';', newPropsEnd);
    if (afterProps === -1) continue;

    const insertPos = afterProps + 1;
    const guardBlock = '\n\n' + guardLines.join('\n');

    content = content.substring(0, insertPos) + guardBlock + content.substring(insertPos);

    totalFixes += guardLines.length;
  }

  if (totalFixes > 0) {
    writeFileSync(filePath, content, 'utf-8');
    return { fixed: true, count: totalFixes, props: fixedProps, path: relPath };
  }

  return { skipped: true, reason: 'no-array-props-with-defaults', path: relPath };
}

// Main
console.log('Scanning preset files...\n');

const allFiles = findAllPresetFiles(ROOT);
console.log(`Found ${allFiles.length} preset files.\n`);

let totalFixed = 0;
let totalFiles = 0;
let totalSkipped = 0;
const fixedFiles = [];
const errors = [];

for (const file of allFiles) {
  try {
    const result = processFile(file);
    if (result.fixed) {
      totalFixed += result.count;
      totalFiles++;
      fixedFiles.push(result);
    } else {
      totalSkipped++;
    }
  } catch (err) {
    errors.push({ file: relative(ROOT, file), error: err.message });
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`Files fixed: ${totalFiles}`);
console.log(`Total props guarded: ${totalFixed}`);
console.log(`Files skipped: ${totalSkipped}`);
console.log(`Errors: ${errors.length}`);

if (fixedFiles.length > 0) {
  console.log(`\n--- Fixed Files ---`);
  for (const f of fixedFiles) {
    console.log(`  ${f.path} (${f.count} props)`);
    for (const p of f.props) {
      console.log(`    - ${p.prop} = ${p.default}`);
    }
  }
}

if (errors.length > 0) {
  console.log(`\n--- Errors ---`);
  for (const e of errors) {
    console.log(`  ${e.file}: ${e.error}`);
  }
}
