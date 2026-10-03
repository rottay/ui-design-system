import { excerpt } from '../usages/index.mjs';

/**
 * One observation about one node. `rewrite` findings carry the text splices
 * that resolve them; `report` findings name why the kit will not edit.
 */
export function finding(analysis, entry, node, action, reason, message, edits = []) {
  const { line, column } = analysis.position(node);
  return {
    id: entry.id,
    class: entry.class,
    file: analysis.file,
    line,
    column,
    action,
    reason,
    message,
    excerpt: excerpt(node, analysis.sourceFile),
    edits,
  };
}

export function report(analysis, entry, node, reason, message) {
  return finding(analysis, entry, node, 'report', reason, message);
}

export function rewrite(analysis, entry, node, reason, message, edits) {
  return finding(analysis, entry, node, 'rewrite', reason, message, edits);
}

export function replaceNode(analysis, node, text) {
  return { start: node.getStart(analysis.sourceFile), end: node.end, text };
}
