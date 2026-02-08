/**
 * P0.3: Second pass hover transforms for remaining 47 files
 *
 * Improved logic:
 * - Handles multi-line onMouseEnter handlers
 * - Handles handlers inside .map() callbacks
 * - Handles both arrow function styles: (e) => { } and (e) => expr
 * - Detects the right hover variable from context
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(process.cwd(), 'packages/core/src/components/custom');
const EXCLUDE = ['navigation-editor'];

function walk(dir) {
  const results = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!EXCLUDE.includes(e.name)) results.push(...walk(p)); }
    else if (e.name === 'index.tsx' && p.includes('/presets/')) results.push(p);
  }
  return results;
}

let modified = 0;

for (const fp of walk(ROOT)) {
  let content = readFileSync(fp, 'utf8');
  if (content.includes('motion.transform')) continue;

  // Must have hover interaction
  const hasHoverInteraction = content.includes('onMouseEnter') ||
    /\b(isHovered|hoveredCard|hoveredKey|hoveredIndex|hoveredId|hoveredItem|hoveredRow)\b/.test(content);
  if (!hasHoverInteraction) continue;

  const rel = relative(process.cwd(), fp);
  const lines = content.split('\n');
  let fileModified = false;

  // Strategy: find ALL onMouseEnter handlers and add transform
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('onMouseEnter')) continue;

    // Check if this handler or nearby already has .transform
    const contextEnd = Math.min(lines.length, i + 15);
    const contextLines = lines.slice(i, contextEnd).join('\n');
    if (contextLines.includes('.transform') || contextLines.includes('motion.transform')) continue;

    // Pattern 1: onMouseEnter={(e) => { ...multi-line... }}
    if (line.includes('(e)') && line.includes('{')) {
      // Find the closing } by counting braces
      let braceDepth = 0;
      let foundOpen = false;
      let closeLineIdx = -1;

      for (let j = i; j < Math.min(lines.length, i + 20); j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { braceDepth++; foundOpen = true; }
          if (ch === '}') { braceDepth--; }
          if (foundOpen && braceDepth === 0) { closeLineIdx = j; break; }
        }
        if (closeLineIdx !== -1) break;
      }

      if (closeLineIdx !== -1 && closeLineIdx > i) {
        // Multi-line handler: insert transform before closing }
        const closeLine = lines[closeLineIdx];
        const indent = closeLine.match(/^(\s*)/)?.[1] || '              ';
        // Find indent of statements inside the handler
        const innerIndent = indent + '  ';

        // Insert before closing brace
        const braceIdx = closeLine.lastIndexOf('}');
        const before = closeLine.slice(0, braceIdx);
        const after = closeLine.slice(braceIdx);

        // Check if the handler uses (e) or (e) with cast
        const usesECast = contextLines.includes('as HTMLElement');
        const target = usesECast
          ? '(e.currentTarget as HTMLElement).style.transform'
          : 'e.currentTarget.style.transform';

        lines[closeLineIdx] = `${before}${innerIndent}${target} = tokens.motion.transform;\n${indent}${after}`;
        fileModified = true;
      } else if (closeLineIdx === i) {
        // Single-line block handler: onMouseEnter={(e) => { e.currentTarget.style... }}
        // Insert before the closing }}
        const match = line.match(/(.*)(}\s*}\s*)$/);
        if (match) {
          const usesECast = line.includes('as HTMLElement');
          const target = usesECast
            ? '(e.currentTarget as HTMLElement).style.transform'
            : 'e.currentTarget.style.transform';
          lines[i] = `${match[1]} ${target} = tokens.motion.transform; ${match[2]}`;
          fileModified = true;
        }
      }
    }
    // Pattern 2: onMouseEnter={() => setSomething(val)} (no e param, state-based)
    else if (line.includes('onMouseEnter') && !line.includes('(e)')) {
      // State-based hover — skip, the transform should be in the style object
      // We'll handle this separately
    }
  }

  // Now handle onMouseLeave similarly
  if (fileModified) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes('onMouseLeave')) continue;

      const contextEnd = Math.min(lines.length, i + 15);
      const contextLines = lines.slice(i, contextEnd).join('\n');
      if (contextLines.includes("transform = 'none'") || contextLines.includes('transform = `none`')) continue;

      if (line.includes('(e)') && line.includes('{')) {
        let braceDepth = 0;
        let foundOpen = false;
        let closeLineIdx = -1;

        for (let j = i; j < Math.min(lines.length, i + 20); j++) {
          for (const ch of lines[j]) {
            if (ch === '{') { braceDepth++; foundOpen = true; }
            if (ch === '}') { braceDepth--; }
            if (foundOpen && braceDepth === 0) { closeLineIdx = j; break; }
          }
          if (closeLineIdx !== -1) break;
        }

        if (closeLineIdx !== -1 && closeLineIdx > i) {
          const closeLine = lines[closeLineIdx];
          const indent = closeLine.match(/^(\s*)/)?.[1] || '              ';
          const innerIndent = indent + '  ';
          const braceIdx = closeLine.lastIndexOf('}');
          const before = closeLine.slice(0, braceIdx);
          const after = closeLine.slice(braceIdx);

          const usesECast = contextLines.includes('as HTMLElement');
          const target = usesECast
            ? "(e.currentTarget as HTMLElement).style.transform"
            : "e.currentTarget.style.transform";

          lines[closeLineIdx] = `${before}${innerIndent}${target} = 'none';\n${indent}${after}`;
        } else if (closeLineIdx === i) {
          const match = line.match(/(.*)(}\s*}\s*)$/);
          if (match) {
            const usesECast = line.includes('as HTMLElement');
            const target = usesECast
              ? "(e.currentTarget as HTMLElement).style.transform"
              : "e.currentTarget.style.transform";
            lines[i] = `${match[1]} ${target} = 'none'; ${match[2]}`;
          }
        }
      }
    }
  }

  // For state-based hover files: add transform to the style object
  if (!fileModified) {
    const hoverVarMatch = content.match(/\bconst\s+\[(\w*[Hh]overed\w*),/);
    if (hoverVarMatch) {
      const hoverVar = hoverVarMatch[1];
      // Find style objects that use the hover var for boxShadow or backgroundColor
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(hoverVar) &&
            (lines[i].includes('boxShadow') || lines[i].includes('backgroundColor')) &&
            !lines[i].includes('transform')) {
          // Add transform on next line
          const indent = lines[i].match(/^(\s*)/)?.[1] || '';
          const condition = lines[i].match(new RegExp(`(${hoverVar}\\s*(?:===\\s*\\S+)?\\s*(?:\\?|&&))`))?.[0]?.replace(/\s*[\?&].*/, '') || hoverVar;
          const transformLine = `${indent}transform: ${condition} ? tokens.motion.transform : 'none',`;

          // Ensure current line ends with comma
          if (!lines[i].trimEnd().endsWith(',')) {
            lines[i] = lines[i].replace(/(\s*)$/, ',$1');
          }
          lines.splice(i + 1, 0, transformLine);
          fileModified = true;
          break;
        }
      }
    }
  }

  if (fileModified) {
    writeFileSync(fp, lines.join('\n'), 'utf8');
    console.log(`  ✓ ${rel}`);
    modified++;
  }
}

console.log(`\n=== Hover Transforms v2 ===`);
console.log(`Files modified: ${modified}`);
