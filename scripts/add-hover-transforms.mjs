/**
 * Phase 2B: Add hover transforms to interactive preset elements
 *
 * B1: Files with isHovered/hoveredKey/hoveredIndex state but no motion.transform
 *     → Add transform: isHovered ? tokens.motion.transform : 'none' to hovered element style
 *
 * B2: Files with e.currentTarget.style hover handlers but no .transform
 *     → Append e.currentTarget.style.transform = tokens.motion.transform to onMouseEnter
 *     → Append e.currentTarget.style.transform = 'none' to onMouseLeave
 *
 * Excludes: navigation-editor/
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const PRESETS_ROOT = join(
  process.cwd(),
  'packages/core/src/components/custom'
);

const EXCLUDE_DIRS = ['navigation-editor'];

function walkPresets(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      results.push(...walkPresets(fullPath));
    } else if (entry.name === 'index.tsx' && fullPath.includes('/presets/')) {
      results.push(fullPath);
    }
  }
  return results;
}

let b1Count = 0;
let b2Count = 0;
let skippedAlready = 0;

const files = walkPresets(PRESETS_ROOT);
console.log(`Found ${files.length} preset files\n`);

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf8');
  const rel = relative(process.cwd(), filePath);
  let modified = false;

  // Skip files that already use motion.transform
  if (content.includes('motion.transform')) {
    skippedAlready++;
    continue;
  }

  // ===== B1: State-based hover (isHovered / hoveredCard / hoveredKey / hoveredIndex) =====
  const hasHoverState = /\b(isHovered|hoveredCard|hoveredKey|hoveredIndex|hoveredId|hoveredItem|hoveredRow)\b/.test(content);

  if (hasHoverState) {
    // Find patterns like: boxShadow: isHovered ? tokens.shadows.md : 'none',
    // or: boxShadow: hoveredCard === id ? tokens.shadows.md : tokens.shadows.sm,
    // Add transform line after the boxShadow line
    const boxShadowHoverPattern = /(boxShadow:\s*(?:isHovered|hoveredCard|hoveredKey|hoveredIndex|hoveredId|hoveredItem|hoveredRow)\b[^,}]*,?\n)/g;
    if (boxShadowHoverPattern.test(content)) {
      content = content.replace(
        /(boxShadow:\s*(?:isHovered|hoveredCard|hoveredKey|hoveredIndex|hoveredId|hoveredItem|hoveredRow)\b[^,}]*,?)(\n)/g,
        (match, shadowLine, newline) => {
          // Get indentation from the shadow line
          const indent = shadowLine.match(/^(\s*)/)?.[1] || '                ';
          const needsComma = !shadowLine.trimEnd().endsWith(',');
          const fixedShadow = needsComma ? shadowLine + ',' : shadowLine;
          // Determine the hover variable name used
          const varMatch = shadowLine.match(/(isHovered|hoveredCard|hoveredKey|hoveredIndex|hoveredId|hoveredItem|hoveredRow)\s*(===\s*\S+\s*)?/);
          const condition = varMatch ? varMatch[0].trim() : 'isHovered';
          return `${fixedShadow}\n${indent}transform: ${condition} ? tokens.motion.transform : 'none',${newline}`;
        }
      );
      modified = true;
      b1Count++;
    } else {
      // Alternative: find the style object of the hovered element and add transform
      // Look for patterns like: onMouseEnter={() => setHoveredCard(id)} ... style={{ ... }}
      // Find style objects that have transition with motion.hover but no transform
      const transitionHoverPattern = /(transition:\s*`[^`]*\$\{tokens\.motion\.hover\}[^`]*`,?)(\n)/g;
      if (transitionHoverPattern.test(content)) {
        // Only add once per block - find the nearest hovered element
        const lines = content.split('\n');
        let added = false;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('transition:') && lines[i].includes('tokens.motion.hover')) {
            // Check if within 5 lines of a hover-related setX call (onMouseEnter/Leave)
            const context5 = lines.slice(Math.max(0, i - 10), i + 10).join('\n');
            if (/setHovered|onMouseEnter|onMouseLeave/.test(context5) && !added) {
              const indent = lines[i].match(/^(\s*)/)?.[1] || '';
              // Determine which hover variable this element uses
              const hoverVarLine = lines.slice(Math.max(0, i - 20), i + 5).join('\n');
              const hoverVarMatch = hoverVarLine.match(/(isHovered|hoveredCard|hoveredKey|hoveredIndex|hoveredId|hoveredItem|hoveredRow)\s*(===\s*\S+)?/);
              const condition = hoverVarMatch ? hoverVarMatch[0].trim() : 'isHovered';
              // Ensure the transition line ends with comma
              if (!lines[i].trimEnd().endsWith(',')) {
                lines[i] = lines[i].replace(/(\s*)$/, ',$1');
              }
              lines.splice(i + 1, 0, `${indent}transform: ${condition} ? tokens.motion.transform : 'none',`);
              added = true;
              modified = true;
              b1Count++;
              break;
            }
          }
        }
        if (added) {
          content = lines.join('\n');
        }
      }
    }
  }

  // ===== B2: Direct style manipulation hover handlers =====
  if (!modified) {
    const hasCurrentTargetStyle = content.includes('e.currentTarget.style');
    const hasOnMouseEnter = content.includes('onMouseEnter');

    if (hasCurrentTargetStyle && hasOnMouseEnter) {
      // Find onMouseEnter handlers with e.currentTarget.style but no .transform
      // Pattern: onMouseEnter={(e) => { ... e.currentTarget.style.X = ...; ... }}
      const enterPattern = /(onMouseEnter=\{[^}]*\(e\)\s*(?:=>)?\s*\{[^}]*)(e\.currentTarget\.style\.\w+\s*=\s*[^;]+;)([^}]*\})/g;
      let enterMatch;
      let newContent = content;
      let replaced = false;

      // Multi-line approach: find onMouseEnter blocks
      const enterBlockPattern = /onMouseEnter=\{\s*\(e\)\s*=>\s*\{([^}]+)\}/g;
      while ((enterMatch = enterBlockPattern.exec(content)) !== null) {
        const block = enterMatch[1];
        if (block.includes('e.currentTarget.style') && !block.includes('.transform')) {
          // Add transform at the end of the block
          const lastStyleAssign = block.lastIndexOf('e.currentTarget.style');
          const lineEnd = block.indexOf(';', lastStyleAssign);
          if (lineEnd !== -1) {
            const indent = block.match(/\n(\s+)e\.currentTarget\.style/)?.[1] || '          ';
            const newBlock = block.slice(0, lineEnd + 1) +
              `\n${indent}e.currentTarget.style.transform = tokens.motion.transform;` +
              block.slice(lineEnd + 1);
            newContent = newContent.replace(block, newBlock);
            replaced = true;
          }
        }
      }

      if (replaced) {
        // Now handle onMouseLeave
        const leaveBlockPattern = /onMouseLeave=\{\s*\(e\)\s*=>\s*\{([^}]+)\}/g;
        let leaveMatch;
        while ((leaveMatch = leaveBlockPattern.exec(newContent)) !== null) {
          const block = leaveMatch[1];
          if (block.includes('e.currentTarget.style') && !block.includes('.transform')) {
            const lastStyleAssign = block.lastIndexOf('e.currentTarget.style');
            const lineEnd = block.indexOf(';', lastStyleAssign);
            if (lineEnd !== -1) {
              const indent = block.match(/\n(\s+)e\.currentTarget\.style/)?.[1] || '          ';
              const newBlock = block.slice(0, lineEnd + 1) +
                `\n${indent}e.currentTarget.style.transform = 'none';` +
                block.slice(lineEnd + 1);
              newContent = newContent.replace(block, newBlock);
            }
          }
        }
        content = newContent;
        modified = true;
        b2Count++;
      } else {
        // Simpler single-line arrow handlers:
        // onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ... }}
        const singleLineEnter = /onMouseEnter=\{\s*\(e\)\s*=>\s*\{\s*((?:e\.currentTarget\.style\.\w+\s*=\s*[^;]+;\s*)+)\}/g;
        let singleMatch;
        let newContent2 = content;
        let replaced2 = false;

        while ((singleMatch = singleLineEnter.exec(content)) !== null) {
          const innerBlock = singleMatch[1];
          if (!innerBlock.includes('.transform')) {
            const newInner = innerBlock.trimEnd() + '\n          e.currentTarget.style.transform = tokens.motion.transform;\n        ';
            newContent2 = newContent2.replace(innerBlock, newInner);
            replaced2 = true;
          }
        }

        if (replaced2) {
          // Handle matching onMouseLeave
          const singleLineLeave = /onMouseLeave=\{\s*\(e\)\s*=>\s*\{\s*((?:e\.currentTarget\.style\.\w+\s*=\s*[^;]+;\s*)+)\}/g;
          let leaveMatch2;
          while ((leaveMatch2 = singleLineLeave.exec(newContent2)) !== null) {
            const innerBlock = leaveMatch2[1];
            if (!innerBlock.includes('.transform')) {
              const newInner = innerBlock.trimEnd() + "\n          e.currentTarget.style.transform = 'none';\n        ";
              newContent2 = newContent2.replace(innerBlock, newInner);
            }
          }
          content = newContent2;
          modified = true;
          b2Count++;
        }
      }
    }
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${rel}`);
  }
}

console.log(`\n=== Summary ===`);
console.log(`B1 (state-based hover transform): ${b1Count} files`);
console.log(`B2 (currentTarget.style transform): ${b2Count} files`);
console.log(`Already had motion.transform: ${skippedAlready} files`);
console.log(`Total modified: ${b1Count + b2Count} files`);
