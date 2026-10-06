import ts from 'typescript';
import { report } from '../../resolve/findings/index.mjs';
import { memberSpellings, referencesOf, symbolKey, symbolSites } from '../../resolve/usages/index.mjs';

function membersOf(entry) {
  return entry.members ?? (entry.member ? [entry.member] : []);
}

function lineOf(analysis, node) {
  return analysis.position(node).line;
}

/** The nodes through which this site's binding is named in the file, or null when the site is not one the kit can follow. */
function namingNodes(analysis, site) {
  if (site.type === 'import') return referencesOf(analysis, site.node);
  if (site.type === 'member' || site.type === 'import-type') return [site.node];
  return null;
}

function typeNamesEntry(analysis, typeNode, entry) {
  if (!typeNode || !ts.isTypeReferenceNode(typeNode)) return false;
  const origin = analysis.originOfExpression(typeNode.typeName);
  return origin.kind === 'ds' && origin.subpath === entry.subpath && origin.members.length === 0 && origin.name === entry.symbol;
}

/**
 * How an object literal is stated to be the entry's type, if it is: `assertion` is the one no typecheck
 * sees, because `as` and `<T>` suppress the excess-property check a removed member would otherwise fail.
 */
function statedAs(analysis, literal, entry) {
  let node = literal;
  while (ts.isParenthesizedExpression(node.parent)) node = node.parent;
  const parent = node.parent;
  if ((ts.isAsExpression(parent) || ts.isTypeAssertionExpression(parent)) && typeNamesEntry(analysis, parent.type, entry)) return 'assertion';
  if (ts.isSatisfiesExpression(parent) && typeNamesEntry(analysis, parent.type, entry)) return 'satisfies';
  if (ts.isVariableDeclaration(parent) && parent.initializer === node && typeNamesEntry(analysis, parent.type, entry)) return 'annotation';
  return null;
}

/** What one spelling of a member name is, as far as syntax says. Every kind is reported; the kind is the reader's lead. */
function describeSpelling(analysis, node, entry) {
  const parent = node.parent;
  const name = `\`${node.text}\` L${lineOf(analysis, node)}`;
  if ((ts.isPropertyAssignment(parent) || ts.isShorthandPropertyAssignment(parent)) && parent.name === node
    && ts.isObjectLiteralExpression(parent.parent)) {
    const stated = statedAs(analysis, parent.parent, entry);
    if (stated === 'assertion') {
      return `${name} written in an object asserted as \`${entry.symbol}\` (an assertion hides the excess property from the typecheck)`;
    }
    return stated ? `${name} written in an object stated as \`${entry.symbol}\` by ${stated}` : `${name} written as an object key`;
  }
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return `${name} read as a property`;
  if (ts.isElementAccessExpression(parent) && parent.argumentExpression === node) return `${name} read by element access`;
  if (ts.isBindingElement(parent) && (parent.propertyName ?? parent.name) === node && ts.isObjectBindingPattern(parent.parent)) {
    return `${name} destructured`;
  }
  return `${name} named`;
}

/** Where the binding leaves the file under another name: a type built from it, or a local export of it. */
function republication(analysis, nodes) {
  for (const node of nodes) {
    for (let current = node.parent; current; current = current.parent) {
      if (ts.isTypeAliasDeclaration(current)) return `the type alias \`${current.name.text}\` (L${lineOf(analysis, current)}) is built from it`;
      if (ts.isHeritageClause(current)) return `a declaration extends it (L${lineOf(analysis, current)})`;
      if (ts.isExportSpecifier(current) || ts.isExportAssignment(current)) return `the file exports it (L${lineOf(analysis, current)})`;
    }
  }
  return null;
}

function bare(expression) {
  let node = expression;
  while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)
    || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node)) node = node.expression;
  return node;
}

/** An operand whose every key this file writes: an object literal, nothing at all, or a choice between those. */
function isWrittenHere(expression) {
  const node = bare(expression);
  if (ts.isObjectLiteralExpression(node) || node.kind === ts.SyntaxKind.NullKeyword) return true;
  if (ts.isIdentifier(node) && node.text === 'undefined') return true;
  if (ts.isConditionalExpression(node)) return isWrittenHere(node.whenTrue) && isWrittenHere(node.whenFalse);
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return isWrittenHere(node.right);
  return false;
}

function isObjectAssign(node) {
  return ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'assign'
    && ts.isIdentifier(node.expression.expression) && node.expression.expression.text === 'Object';
}

/**
 * Where a removed member can enter the file without being spelled and without the typecheck seeing it: a
 * value this file does not write, asserted or `satisfies`-checked as a type built on the entry, or spread
 * (`{ ...value }`, `Object.assign`) into an object. Neither form runs the excess-property check.
 */
function carriers(analysis, names) {
  const found = [];
  const namesEntry = (typeNode) => names.some((name) => name.pos >= typeNode.pos && name.end <= typeNode.end);
  analysis.walk((node) => {
    if ((ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node))
      && namesEntry(node.type) && !isWrittenHere(node.expression)) {
      found.push(`L${lineOf(analysis, node)} ${ts.isSatisfiesExpression(node) ? 'checks' : 'asserts'} a value this file does not write`);
    } else if (ts.isSpreadAssignment(node) && !isWrittenHere(node.expression)) {
      found.push(`L${lineOf(analysis, node)} spreads a value this file does not write`);
    } else if (isObjectAssign(node) && node.arguments.some((argument) => ts.isSpreadElement(argument) || !isWrittenHere(argument))) {
      found.push(`L${lineOf(analysis, node)} assigns a value this file does not write`);
    }
  });
  return [...new Set(found)];
}

/**
 * `memberProof: "spelling"`. The entry's members are removed, renamed or retyped, never newly required, so a
 * file that spells none of them (identifier, property name or string literal) cannot read or write one and
 * is not reported. Any spelling is reported, whatever it is bound to: the kit infers no types. A re-export,
 * a destructured or element-accessed namespace member, a binding that leaves the file under another name
 * and a value carried in by an assertion or a spread are reported regardless, because the member is then
 * somewhere this file's spellings do not cover.
 */
function spellingVerdict(analysis, entry, site, names) {
  const nodes = namingNodes(analysis, site);
  if (!nodes) return { text: 'the kit does not follow this kind of site, so it proves nothing about it.' };
  const spellings = memberSpellings(analysis, membersOf(entry));
  if (spellings.length > 0) {
    const shown = spellings.slice(0, 6).map((node) => describeSpelling(analysis, node, entry));
    const more = spellings.length > shown.length ? `, and ${spellings.length - shown.length} more` : '';
    return { proof: 'spelled', text: `this file spells a changed member: ${shown.join('; ')}${more}.` };
  }
  const left = republication(analysis, nodes);
  if (left) return { proof: 'escapes', text: `this file spells none of the changed members, but ${left}, so its uses are not all in this file.` };
  const carried = carriers(analysis, names);
  if (carried.length === 0) return null;
  const more = carried.length > 6 ? `, and ${carried.length - 6} more` : '';
  return {
    proof: 'carrier',
    text: `this file spells none of the changed members, but ${carried.slice(0, 6).join('; ')}${more}, so a removed member can arrive unspelled and unseen by the typecheck.`,
  };
}

function isCallWithin(node, max) {
  const call = node.parent;
  return ts.isCallExpression(call) && call.expression === node && call.arguments.length <= max
    && !call.arguments.some((argument) => ts.isSpreadElement(argument));
}

/**
 * `maxArguments: N`. The change is the loss of the parameters after the Nth, so a direct call that passes
 * at most N arguments and spreads none is not a use of what changed. Every other reference (a longer call,
 * a spread argument, the function passed, aliased, exported or named in a type) is reported.
 */
function arityVerdict(analysis, entry, site) {
  const nodes = namingNodes(analysis, site);
  if (!nodes) return { text: 'the kit does not follow this kind of site, so it proves nothing about it.' };
  const unproven = nodes.filter((node) => !isCallWithin(node, entry.maxArguments));
  if (unproven.length > 0) {
    const lines = [...new Set(unproven.map((node) => lineOf(analysis, node)))].slice(0, 6).map((line) => `L${line}`).join(', ');
    return { text: `not a direct call with at most ${entry.maxArguments} argument(s) and no spread at ${lines}.` };
  }
  return null;
}

/**
 * A member of a published type or value changed (removed, renamed, narrowed). Finding the member's uses needs
 * type inference the kit does not do, so every design-system-resolved use of the owning export is reported,
 * unless the entry states a proof the kit can run on syntax alone (`memberProof`, `maxArguments`) and the
 * file passes it. A report carries `proof`: `import` when the entry states no proof, otherwise what the
 * spelling proof found (`spelled`, `escapes`, `carrier`); a failed arity proof or an unfollowed site has none.
 */
export const transform = {
  class: 'member-changed',
  reportOnly: true,
  run(context, analysis, entries) {
    const findings = [];
    const sites = symbolSites(analysis, context.map.memberRoots);
    for (const entry of entries) {
      const members = membersOf(entry);
      const subject = members.length > 0
        ? `\`${entry.symbol}\` (${members.map((member) => `\`${member}\``).join(', ')})`
        : `\`${entry.symbol}\``;
      const entrySites = sites.get(symbolKey(entry.subpath, entry.symbol)) ?? [];
      const names = entry.memberProof === 'spelling' ? entrySites.flatMap((site) => namingNodes(analysis, site) ?? []) : [];
      for (const site of entrySites) {
        let verdict = { proof: 'import' };
        if (entry.memberProof === 'spelling') verdict = spellingVerdict(analysis, entry, site, names);
        else if (entry.maxArguments !== undefined) verdict = arityVerdict(analysis, entry, site);
        if (verdict === null) continue;
        const uses = site.type === 'import' ? `; ${referencesOf(analysis, site.node).length} reference(s) in this file` : '';
        const finding = report(analysis, entry, site.node, 'member-changed',
          `${subject} changed on \`${entry.subpath}\`${uses}. ${entry.change} ${entry.guidance}${verdict.text ? ` Reported because ${verdict.text}` : ''}`);
        if (verdict.proof) finding.proof = verdict.proof;
        findings.push(finding);
      }
    }
    return findings;
  },
};
