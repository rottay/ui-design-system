/**
 * P0.1: Improved useMemo wrapping for style factory calls
 *
 * Handles:
 * - Files that already have useMemo for some calls but not all
 * - Multi-word dependency detection (isGlass, isModern, engine)
 * - Both single-line and multi-line createXStyle patterns
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

const CREATORS = [
  'createCardStyle', 'createSurfaceStyle', 'createInteractiveCardStyle',
  'createBadgeStyle', 'createListItemStyle', 'createPanelHeaderStyle',
  'createSectionHeaderStyle', 'createEmptyStateStyle', 'createSkeletonStyle',
  'createFilterPillStyle', 'createProgressBarStyle', 'createStatusDotStyle',
  'createHoverStyle', 'createAccentBarStyle',
];

// Known variable names that should be deps
const DEP_VARS = ['isGlass', 'isModern', 'engine', 'onClick', 'active', 'isActive', 'color', 'colorScale'];

let modified = 0;
let totalWrapped = 0;

for (const fp of walk(ROOT)) {
  let content = readFileSync(fp, 'utf8');
  const rel = relative(process.cwd(), fp);
  let fileModified = false;
  let wrappedCount = 0;

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip if already wrapped in useMemo
    if (line.includes('useMemo')) continue;

    // Match: const varName = createXStyle(...)
    for (const creator of CREATORS) {
      const pattern = new RegExp(`^(\\s*)(const\\s+\\w+\\s*=\\s*)(${creator}\\()(.*)$`);
      const m = line.match(pattern);
      if (!m) continue;

      const [, indent, constPart, funcCall, rest] = m;

      // Find the complete call (may span multiple lines)
      let fullCall = funcCall + rest;
      let endLine = i;
      let parenDepth = 0;
      for (let c = 0; c < fullCall.length; c++) {
        if (fullCall[c] === '(') parenDepth++;
        if (fullCall[c] === ')') parenDepth--;
      }
      while (parenDepth > 0 && endLine < lines.length - 1) {
        endLine++;
        fullCall += '\n' + lines[endLine];
        for (let c = 0; c < lines[endLine].length; c++) {
          if (lines[endLine][c] === '(') parenDepth++;
          if (lines[endLine][c] === ')') parenDepth--;
        }
      }

      // Strip trailing semicolon for wrapping
      let callBody = fullCall.replace(/;\s*$/, '');

      // Detect dependencies
      const deps = ['tokens'];
      for (const v of DEP_VARS) {
        if (callBody.includes(v) && !deps.includes(v)) deps.push(v);
      }

      // Check for engine !== 'classic' or similar
      if (callBody.includes('engine') && !deps.includes('engine')) deps.push('engine');

      // Build the memoized version
      if (endLine === i) {
        // Single line
        lines[i] = `${indent}${constPart}useMemo(() => ${callBody}, [${deps.join(', ')}]);`;
      } else {
        // Multi-line
        lines[i] = `${indent}${constPart}useMemo(() => ${funcCall}${rest}`;
        // Find the closing ) and add deps
        const lastLine = lines[endLine];
        lines[endLine] = lastLine.replace(/\);\s*$/, `), [${deps.join(', ')}]);`).replace(/\)\s*$/, `), [${deps.join(', ')}]);`);
      }

      fileModified = true;
      wrappedCount++;
      break; // One creator per line
    }
  }

  if (fileModified) {
    content = lines.join('\n');

    // Ensure useMemo is imported
    if (!content.includes('useMemo')) {
      // Try adding to existing react import
      if (content.match(/import\s+React,\s*\{([^}]+)\}\s*from\s*['"]react['"]/)) {
        content = content.replace(
          /import\s+React,\s*\{([^}]+)\}\s*from\s*['"]react['"]/,
          (m, imports) => imports.includes('useMemo') ? m : m.replace(imports, imports.trim() + ', useMemo')
        );
      } else if (content.match(/import\s*\{([^}]+)\}\s*from\s*['"]react['"]/)) {
        content = content.replace(
          /import\s*\{([^}]+)\}\s*from\s*['"]react['"]/,
          (m, imports) => imports.includes('useMemo') ? m : m.replace(imports, imports.trim() + ', useMemo')
        );
      } else if (content.includes("import React from 'react'")) {
        content = content.replace("import React from 'react'", "import React, { useMemo } from 'react'");
      } else {
        const idx = content.indexOf('import ');
        if (idx !== -1) {
          content = content.slice(0, idx) + "import { useMemo } from 'react';\n" + content.slice(idx);
        }
      }
    }

    writeFileSync(fp, content, 'utf8');
    console.log(`  ✓ ${rel} (${wrappedCount} calls)`);
    modified++;
    totalWrapped += wrappedCount;
  }
}

console.log(`\n=== useMemo v2 ===`);
console.log(`Files modified: ${modified}`);
console.log(`Total calls wrapped: ${totalWrapped}`);
