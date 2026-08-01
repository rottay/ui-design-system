import ts from 'typescript';

function scriptKindFor(fileName) {
  if (/\.[cm]?tsx$/i.test(fileName)) return ts.ScriptKind.TSX;
  if (/\.[cm]?ts$/i.test(fileName)) return ts.ScriptKind.TS;
  if (/\.[cm]?jsx$/i.test(fileName)) return ts.ScriptKind.JSX;
  if (/\.[cm]?js$/i.test(fileName)) return ts.ScriptKind.JS;
  return ts.ScriptKind.Unknown;
}

/**
 * Removes JavaScript/TypeScript comments without corrupting strings, regular
 * expressions, template literals, JSX, or URLs. Trivia other than comments is
 * retained so token boundaries remain faithful to the authored source.
 */
export function stripScriptComments(text, fileName = 'source.tsx') {
  const source = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(fileName),
  );
  const ranges = new Map();
  const jsxTextRanges = [];
  const collectAt = (position) => {
    for (const range of ts.getLeadingCommentRanges(text, position) ?? []) {
      ranges.set(`${range.pos}:${range.end}`, range);
    }
    for (const range of ts.getTrailingCommentRanges(text, position) ?? []) {
      ranges.set(`${range.pos}:${range.end}`, range);
    }
  };
  const visit = (node) => {
    if (ts.isJsxText(node)) jsxTextRanges.push([node.getStart(source, false), node.getEnd()]);
    collectAt(node.getFullStart());
    collectAt(node.getStart(source, false));
    collectAt(node.getEnd());
    ts.forEachChild(node, visit);
  };
  visit(source);

  const output = [...text];
  for (const range of ranges.values()) {
    if (jsxTextRanges.some(([start, end]) => range.pos >= start && range.end <= end)) {
      continue;
    }
    for (let index = range.pos; index < range.end; index += 1) {
      if (output[index] !== '\n' && output[index] !== '\r') output[index] = ' ';
    }
  }
  return output.join('');
}
