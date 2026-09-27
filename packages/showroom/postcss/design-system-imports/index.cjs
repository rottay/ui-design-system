/* eslint-disable @typescript-eslint/no-require-imports -- Next loads PostCSS plugins with require() */
const { readFileSync, realpathSync } = require('node:fs');
const { dirname, join, sep } = require('node:path');

// Next's css-loader reads `layer(...)` on an @import as a media query that never matches, so the
// design system's layered imports (antd's reset in `rottay-reset`) are inlined into their layer here.
const DS_ROOT = packageRoot(realpathSync(require.resolve('@rottay/design-system/styles.css'))) + sep;

function packageRoot(file) {
  for (let dir = dirname(file); dir !== dirname(dir); dir = dirname(dir)) {
    try {
      if (JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name === '@rottay/design-system') return dir;
    } catch {
      // no package.json at this level
    }
  }
  throw new Error('showroom-design-system-imports: @rottay/design-system package root not found');
}

function ownedByDesignSystem(file) {
  if (!file) return false;
  try {
    return realpathSync(file).startsWith(DS_ROOT);
  } catch {
    return false;
  }
}

const LAYERED_IMPORT = /^(['"])([^'"]+)\1\s+layer\(([\w-]+)\)$/;

function designSystemImports() {
  return {
    postcssPlugin: 'showroom-design-system-imports',
    Once(root, { result, postcss }) {
      const from = result.opts.from;
      if (!ownedByDesignSystem(from)) return;
      root.walkAtRules('import', (rule) => {
        const match = LAYERED_IMPORT.exec(rule.params.trim());
        if (!match) throw rule.error(`showroom-design-system-imports: unsupported @import in design-system CSS: ${rule.params}`);
        const file = require.resolve(match[2], { paths: [dirname(from)] });
        const layer = postcss.atRule({ name: 'layer', params: match[3], source: rule.source });
        layer.append(postcss.parse(readFileSync(file, 'utf8'), { from: file }).nodes);
        rule.replaceWith(layer);
        result.messages.push({ type: 'dependency', plugin: 'showroom-design-system-imports', file, parent: from });
      });
    },
  };
}

designSystemImports.postcss = true;
module.exports = designSystemImports;
