/**
 * @fileoverview Path matching and TERRITORY algebra for lane control.
 *
 * WHY THIS IS NOT A GLOB LIBRARY. A lane checker that only intersects the
 * files that exist TODAY proves nothing about tomorrow: two lanes rooted at
 * `scripts/*-gate.mjs` and `scripts/build-*.mjs` have an empty file-level
 * intersection right now and will collide the first time somebody writes
 * `build-token-gate.mjs`. So every pattern is reduced to a TERRITORY — the
 * region of the path space it claims — and territories are intersected
 * symbolically. Where two filename globs land in the same directory, the
 * emptiness question is decided exactly, by a product search that returns a
 * WITNESS path both patterns match. A collision reported with a witness is a
 * fact; a collision reported without one is an opinion.
 *
 * DIRECTION OF ERROR, DELIBERATE. Where the reduction cannot decide, it
 * over-approximates the territory and reports the pair as colliding. A false
 * positive blocks a lane and costs a conversation; a false negative licenses
 * two agents to write the same file in a shared tree. The blocking direction
 * is the safe one, and every approximated verdict says so in its finding.
 *
 * SUPPORTED SYNTAX: `**` (zero or more path segments), `*` and `?` (within a
 * segment), `{a,b}` alternation (expanded before matching). Negation (`!`) is
 * deliberately NOT supported: exclusion is a declared field
 * (`writeExcludes`), not a punctuation mark buried in a pattern, because the
 * checker has to reason about exclusions and cannot reason about a `!` it
 * merely passes through to a matcher.
 */

/** A pattern claiming the whole path space is never admissible. */
const UNIVERSAL_PATTERNS = new Set(['**', '**/*', '.', './**', '/']);

/**
 * Expand `{a,b}` alternation into brace-free patterns.
 * Nested braces are supported; unbalanced braces throw, because a pattern
 * nobody can parse must not be silently treated as a literal.
 */
export function expandBraces(pattern) {
  const open = pattern.indexOf('{');
  if (open === -1) return [pattern];

  let depth = 0;
  let close = -1;
  for (let i = open; i < pattern.length; i += 1) {
    if (pattern[i] === '{') depth += 1;
    else if (pattern[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close === -1) throw new Error(`lane-control: unbalanced brace in pattern: ${pattern}`);

  const head = pattern.slice(0, open);
  const body = pattern.slice(open + 1, close);
  const tail = pattern.slice(close + 1);

  const alternatives = [];
  let buffer = '';
  let nesting = 0;
  for (const ch of body) {
    if (ch === '{') nesting += 1;
    if (ch === '}') nesting -= 1;
    if (ch === ',' && nesting === 0) {
      alternatives.push(buffer);
      buffer = '';
      continue;
    }
    buffer += ch;
  }
  alternatives.push(buffer);

  return alternatives.flatMap((alt) => expandBraces(`${head}${alt}${tail}`));
}

function escapeLiteral(ch) {
  return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function segmentSource(segment) {
  let source = '';
  for (const ch of segment) {
    if (ch === '*') source += '[^/]*';
    else if (ch === '?') source += '[^/]';
    else source += escapeLiteral(ch);
  }
  return source;
}

/**
 * Compile ONE brace-free pattern to an anchored RegExp over repo-relative,
 * forward-slash paths.
 *
 * `a/**` matches `a` itself and everything beneath it — that is the
 * `writeRoot` reading, where naming a directory claims the directory.
 */
export function globToRegExp(pattern) {
  const segments = pattern.split('/');
  let source = '^';
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;
    if (segment === '**') {
      if (isLast) {
        if (source.endsWith('/')) source = source.slice(0, -1);
        source += '(?:/.*)?';
      } else {
        source += '(?:[^/]+/)*';
      }
      continue;
    }
    source += segmentSource(segment);
    if (!isLast) source += '/';
  }
  return new RegExp(`${source}$`);
}

/** Normalize a declared path: strip `./`, collapse `//`, drop a trailing `/`. */
export function normalizePath(input) {
  let value = String(input).trim().replace(/\\/g, '/');
  while (value.startsWith('./')) value = value.slice(2);
  value = value.replace(/\/{2,}/g, '/');
  if (value.length > 1 && value.endsWith('/')) value = value.slice(0, -1);
  return value;
}

/**
 * A compiled pattern: every brace expansion, each with its RegExp.
 * Rejects negation and universal claims at compile time, fail-closed.
 */
export function compilePattern(pattern) {
  const normalized = normalizePath(pattern);
  if (normalized.startsWith('!')) {
    throw new Error(
      `lane-control: negation is not supported in a writeSet (${pattern}). Declare it in writeExcludes.`,
    );
  }
  if (normalized.startsWith('/') || normalized.includes('../')) {
    throw new Error(`lane-control: pattern must be repo-relative and may not escape upward: ${pattern}`);
  }
  if (UNIVERSAL_PATTERNS.has(normalized)) {
    throw new Error(`lane-control: pattern claims the entire repository: ${pattern}`);
  }
  const expansions = expandBraces(normalized);
  return {
    source: normalized,
    expansions: expansions.map((expansion) => ({ pattern: expansion, regexp: globToRegExp(expansion) })),
  };
}

export function compilePatterns(patterns) {
  return (patterns ?? []).map((pattern) => compilePattern(pattern));
}

/** Does `path` match this compiled pattern? */
export function matchesCompiled(path, compiled) {
  const normalized = normalizePath(path);
  return compiled.expansions.some((expansion) => expansion.regexp.test(normalized));
}

/** Does `path` match ANY of these compiled patterns? */
export function matchesAny(path, compiledList) {
  return compiledList.some((compiled) => matchesCompiled(path, compiled));
}

const MAGIC = /[*?[\]{}]/;

export function hasMagic(value) {
  return MAGIC.test(value);
}

/**
 * TERRITORY REDUCTION.
 *
 * Reduce one brace-free pattern to the region of path space it claims:
 *
 *   { kind: 'file',    path }                       exactly one path
 *   { kind: 'subtree', dir, filter, approximated }  dir itself and everything under it,
 *                                                   optionally filtered by a filename glob
 *   { kind: 'shallow', dir, filter }                only entries directly inside dir
 *
 * `approximated: true` marks a shape the reduction could not express exactly
 * and therefore WIDENED. A widened territory can only ever produce extra
 * collisions, never miss one.
 */
export function territoryOf(pattern, { isDirectory } = {}) {
  const segments = normalizePath(pattern).split('/');
  const staticSegments = [];
  let index = 0;
  while (index < segments.length && !hasMagic(segments[index])) {
    staticSegments.push(segments[index]);
    index += 1;
  }
  const dir = staticSegments.join('/');
  const rest = segments.slice(index);

  if (rest.length === 0) {
    const directory = typeof isDirectory === 'function' ? isDirectory(dir) : null;
    // A path with no magic is a file when the filesystem says so, and a
    // subtree when it says directory. When the filesystem cannot say (the
    // path does not exist yet) the extension decides, and a bare name with
    // no extension is read as a directory — the widening direction.
    const looksLikeFile = directory === null ? /\.[A-Za-z0-9]+$/.test(dir) : directory === false;
    if (looksLikeFile) return { kind: 'file', path: dir, source: pattern };
    return { kind: 'subtree', dir, filter: null, approximated: false, source: pattern };
  }

  if (rest.length === 1 && rest[0] === '**') {
    return { kind: 'subtree', dir, filter: null, approximated: false, source: pattern };
  }
  if (rest.length === 2 && rest[0] === '**' && !rest[1].includes('**')) {
    return { kind: 'subtree', dir, filter: rest[1], approximated: false, source: pattern };
  }
  if (rest.length === 1) {
    return { kind: 'shallow', dir, filter: rest[0], source: pattern };
  }
  // Anything more elaborate (magic in the middle, several `**`) is widened to
  // the whole subtree under the static prefix.
  return { kind: 'subtree', dir, filter: null, approximated: true, source: pattern };
}

function isUnderOrEqual(child, parent) {
  if (parent === '') return true;
  return child === parent || child.startsWith(`${parent}/`);
}

export { isUnderOrEqual };

/** Positions a glob can occupy after consuming one character. */
function advanceGlob(tokens, position, ch) {
  const out = new Set();
  const stack = [position];
  const seen = new Set();
  while (stack.length > 0) {
    const at = stack.pop();
    if (seen.has(at)) continue;
    seen.add(at);
    if (at >= tokens.length) continue;
    const token = tokens[at];
    if (token === '*') {
      out.add(at);
      stack.push(at + 1);
    } else if (token === '?') {
      out.add(at + 1);
    } else if (token === ch) {
      out.add(at + 1);
    }
  }
  return out;
}

function globAccepts(tokens, position) {
  let at = position;
  while (at < tokens.length && tokens[at] === '*') at += 1;
  return at === tokens.length;
}

function advanceSet(tokens, positions, ch) {
  const out = new Set();
  for (const position of positions) {
    for (const next of advanceGlob(tokens, position, ch)) out.add(next);
  }
  return out;
}

function setAccepts(tokens, positions) {
  for (const position of positions) {
    if (globAccepts(tokens, position)) return true;
  }
  return false;
}

const WITNESS_STATE_CAP = 50000;
const WITNESS_LENGTH_CAP = 48;

/**
 * SINGLE-SEGMENT GLOB DECISION PROCEDURE.
 *
 * Returns the shortest filename matching EVERY positive glob and NO negative
 * glob — or null when no such name exists, which is a PROOF of disjointness
 * rather than a failure to find one.
 *
 * Method: breadth-first search over the product of all the patterns. The
 * positives are tracked as position sets and the negatives are determinized
 * the same way, so "this name is not excluded" is decided rather than
 * sampled. The alphabet is every literal character in any pattern plus one
 * character in none of them; characters absent from all patterns are
 * interchangeable, so that alphabet is sufficient.
 *
 * WHY NEGATIVES BELONG IN HERE and not in a post-filter: a post-filter can
 * only test the ONE witness the search happened to return. Two lanes whose
 * overlap is `*-gate.mjs` × `build-*.mjs` are genuinely disjoint once each
 * excludes the other's shape — but only a search that carries the exclusions
 * can tell that from a search that got unlucky on its first witness.
 *
 * Returns `{ undecided: true }` when the product exceeds its cap; the caller
 * must then report a collision, because an undecided boundary is not a
 * disjoint one.
 */
export function segmentWitness(positives, negatives = []) {
  const pos = positives.map((pattern) => [...pattern]);
  const neg = negatives.map((pattern) => [...pattern]);

  const literals = new Set();
  for (const tokens of [...pos, ...neg]) {
    for (const ch of tokens) {
      if (ch !== '*' && ch !== '?') literals.add(ch);
    }
  }
  const fresh = ['x', 'q', 'z', '0', '_', 'w'].find((candidate) => !literals.has(candidate)) ?? '·';
  const alphabet = [...literals, fresh];

  const startPositive = pos.map(() => new Set([0]));
  const startNegative = neg.map(() => new Set([0]));

  const accepted = (positiveStates, negativeStates) =>
    positiveStates.every((state, index) => setAccepts(pos[index], state)) &&
    negativeStates.every((state, index) => !setAccepts(neg[index], state));

  if (accepted(startPositive, startNegative)) return '';

  const key = (positiveStates, negativeStates) =>
    [...positiveStates, ...negativeStates].map((state) => [...state].sort((a, b) => a - b).join(',')).join('|');

  const seen = new Set([key(startPositive, startNegative)]);
  let frontier = [{ positiveStates: startPositive, negativeStates: startNegative, text: '' }];

  for (let depth = 0; depth < WITNESS_LENGTH_CAP && frontier.length > 0; depth += 1) {
    const next = [];
    for (const state of frontier) {
      for (const ch of alphabet) {
        const positiveStates = state.positiveStates.map((set, index) => advanceSet(pos[index], set, ch));
        if (positiveStates.some((set) => set.size === 0)) continue;
        const negativeStates = state.negativeStates.map((set, index) => advanceSet(neg[index], set, ch));
        const stateKey = key(positiveStates, negativeStates);
        if (seen.has(stateKey)) continue;
        seen.add(stateKey);
        if (seen.size > WITNESS_STATE_CAP) return { undecided: true };
        const text = state.text + ch;
        if (accepted(positiveStates, negativeStates)) return text;
        next.push({ positiveStates, negativeStates, text });
      }
    }
    frontier = next;
  }
  return null;
}

export function dirnameOf(path) {
  const at = path.lastIndexOf('/');
  return at === -1 ? '' : path.slice(0, at);
}

export function basenameOf(path) {
  return path.slice(path.lastIndexOf('/') + 1);
}

/**
 * Do two territories share any path, once BOTH lanes' exclusions are taken
 * out? Returns null when they are provably disjoint, otherwise a description
 * carrying a WITNESS — a concrete path both lanes claim.
 *
 * `excludeTerritories` are the reduced territories of every exclusion on
 * either side. An exclusion that swallows the whole overlap region proves
 * disjointness outright (this is what resolves the three nested `writeRoot`
 * pairs the ledger already carries). An exclusion that removes only a
 * filename shape becomes a negative in the witness search. An exclusion that
 * removes a strict sub-slice of the region is IGNORED, because the rest of
 * the region still overlaps — the conservative reading.
 */
export function territoryOverlap(left, right, excludeTerritories = []) {
  if (left.kind === 'file' && right.kind === 'file') {
    if (left.path !== right.path) return null;
    const swallowed = excludeTerritories.some((exclude) => coversPath(exclude, left.path));
    return swallowed ? null : { witness: left.path, exact: true };
  }

  const fileVsRegion = (file, region) => {
    if (region.kind === 'subtree') {
      if (!isUnderOrEqual(file.path, region.dir)) return null;
    } else if (dirnameOf(file.path) !== region.dir) {
      return null;
    }
    if (region.filter && !globToRegExp(region.filter).test(basenameOf(file.path))) return null;
    if (excludeTerritories.some((exclude) => coversPath(exclude, file.path))) return null;
    return { witness: file.path, exact: true };
  };

  if (left.kind === 'file') return fileVsRegion(left, right);
  if (right.kind === 'file') return fileVsRegion(right, left);

  const [outer, inner] = isUnderOrEqual(right.dir, left.dir)
    ? [left, right]
    : isUnderOrEqual(left.dir, right.dir)
      ? [right, left]
      : [null, null];
  if (outer === null) return null;
  if (outer.kind === 'shallow' && inner.dir !== outer.dir) return null;

  const overlapDir = inner.dir;

  const negatives = [];
  for (const exclude of excludeTerritories) {
    if (exclude.kind === 'file') {
      if (dirnameOf(exclude.path) === overlapDir) negatives.push(basenameOf(exclude.path));
      continue;
    }
    const contains = isUnderOrEqual(overlapDir, exclude.dir);
    if (!contains) continue;
    if (!exclude.filter) return null; // the whole region is excluded — proof of disjointness
    if (exclude.kind === 'shallow' && exclude.dir !== overlapDir) continue;
    negatives.push(exclude.filter);
  }

  const positives = [left.filter, right.filter].filter(Boolean);
  const witness = segmentWitness(positives.length > 0 ? positives : ['*'], negatives);
  if (witness === null) return null;
  if (typeof witness === 'object' && witness.undecided) {
    return {
      witness: `${overlapDir}/<undecided>`,
      exact: false,
      approximated: true,
      undecided: true,
    };
  }

  return {
    witness: `${overlapDir}/${witness}`,
    exact: false,
    approximated: Boolean(left.approximated || right.approximated),
  };
}

/** Does an exclusion territory cover this exact path? */
export function coversPath(territory, path) {
  if (territory.kind === 'file') return territory.path === path;
  if (territory.kind === 'subtree') {
    if (!isUnderOrEqual(path, territory.dir)) return false;
    return territory.filter ? globToRegExp(territory.filter).test(basenameOf(path)) : true;
  }
  if (dirnameOf(path) !== territory.dir) return false;
  return territory.filter ? globToRegExp(territory.filter).test(basenameOf(path)) : true;
}
