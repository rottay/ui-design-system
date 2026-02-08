/**
 * Phase 3H: Add useMemo to style computations
 *
 * Targets files that call createCardStyle, createSurfaceStyle, createInteractiveCardStyle,
 * createBadgeStyle, createListItemStyle, createPanelHeaderStyle, etc. at the top of
 * render without memoization.
 *
 * Wraps: const xStyle = createXStyle(tokens, ...)
 * Into:  const xStyle = useMemo(() => createXStyle(tokens, ...), [tokens, ...deps])
 *
 * Also adds useMemo import if needed.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
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

// Helper style creators we want to memoize
const STYLE_CREATORS = [
  'createCardStyle',
  'createSurfaceStyle',
  'createInteractiveCardStyle',
  'createBadgeStyle',
  'createListItemStyle',
  'createPanelHeaderStyle',
  'createSectionHeaderStyle',
  'createEmptyStateStyle',
  'createSkeletonStyle',
  'createFilterPillStyle',
  'createProgressBarStyle',
  'createStatusDotStyle',
  'createHoverStyle',
  'createAccentBarStyle',
];

const CREATOR_PATTERN = new RegExp(
  `^(\\s*)(const\\s+\\w+\\s*=\\s*)(${STYLE_CREATORS.join('|')})\\(([^)]*?)\\);?\\s*$`
);

let modifiedCount = 0;
let skippedCount = 0;

const files = walkPresets(PRESETS_ROOT);
console.log(`Found ${files.length} preset files\n`);

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf8');
  const rel = relative(process.cwd(), filePath);

  // Skip files that already use useMemo
  if (content.includes('useMemo')) {
    skippedCount++;
    continue;
  }

  // Check if file has any style creator calls as standalone const declarations
  let hasCreatorCalls = false;
  for (const creator of STYLE_CREATORS) {
    // Match: const varName = createXStyle(tokens, ...) — on its own line, not inside JSX
    const pattern = new RegExp(`^\\s*const\\s+\\w+\\s*=\\s*${creator}\\(`, 'm');
    if (pattern.test(content)) {
      hasCreatorCalls = true;
      break;
    }
  }

  if (!hasCreatorCalls) continue;

  const lines = content.split('\n');
  let modified = false;
  const wrappedVars = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(CREATOR_PATTERN);
    if (!match) continue;

    const [, indent, constPart, creator, args] = match;

    // Extract dependency variables from args (tokens is always a dep)
    const deps = ['tokens'];
    // Look for other variable references in args (not string literals)
    const argParts = args.split(',').map(a => a.trim());
    for (const arg of argParts.slice(1)) { // Skip first arg (tokens)
      // If it's an object literal { ... }, extract variable references inside
      const varRefs = arg.match(/\b(?!elevation|padding|glass|interactive|active|color|position|percent)\w+(?=\s*[,})\]])/g);
      if (varRefs) {
        for (const ref of varRefs) {
          if (!['true', 'false', 'undefined', 'null', 'sm', 'md', 'lg', 'xl'].includes(ref) && !ref.startsWith("'")) {
            // Check if it's a real variable (not a property key)
            if (/^[a-z]/.test(ref) && !deps.includes(ref)) {
              deps.push(ref);
            }
          }
        }
      }
    }

    // Wrap in useMemo
    const memoLine = `${indent}${constPart}useMemo(() => ${creator}(${args}), [${deps.join(', ')}]);`;
    lines[i] = memoLine;
    modified = true;
    wrappedVars.push(creator);
  }

  if (modified) {
    content = lines.join('\n');

    // Add useMemo to React import
    // Check for existing React import patterns
    const reactImportPatterns = [
      // import React, { useState, useCallback } from 'react';
      /import\s+React,?\s*\{([^}]+)\}\s*from\s*['"]react['"]/,
      // import { useState, useCallback } from 'react';
      /import\s*\{([^}]+)\}\s*from\s*['"]react['"]/,
    ];

    let importAdded = false;

    for (const pattern of reactImportPatterns) {
      const importMatch = content.match(pattern);
      if (importMatch && !importMatch[1].includes('useMemo')) {
        const existingImports = importMatch[1];
        const newImports = existingImports.trim() + ', useMemo';
        content = content.replace(importMatch[0], importMatch[0].replace(existingImports, newImports));
        importAdded = true;
        break;
      }
    }

    if (!importAdded) {
      // Check if there's a simple "import { useState } from 'react';" or similar
      if (content.includes("from 'react'") && !content.includes('useMemo')) {
        // Add useMemo to the first react import
        content = content.replace(
          /import\s*\{([^}]+)\}\s*from\s*['"]react['"]/,
          (match, imports) => {
            if (imports.includes('useMemo')) return match;
            return match.replace(imports, imports.trim() + ', useMemo');
          }
        );
      } else if (!content.includes('useMemo')) {
        // No react import with destructuring found, add new import
        const firstImportIdx = content.indexOf('import ');
        if (firstImportIdx !== -1) {
          content = content.slice(0, firstImportIdx) +
            "import { useMemo } from 'react';\n" +
            content.slice(firstImportIdx);
        }
      }
    }

    writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${rel} (${wrappedVars.join(', ')})`);
    modifiedCount++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Modified: ${modifiedCount} files`);
console.log(`Already had useMemo: ${skippedCount} files`);
