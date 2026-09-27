/* eslint-disable @typescript-eslint/no-require-imports -- Next loads PostCSS plugins with require() */
const { readFileSync, realpathSync } = require('node:fs');
const { dirname, join, sep } = require('node:path');
const tailwind = require('@tailwindcss/postcss');

// The design system ships finished CSS; Tailwind's polyfill pass splits its unlayered tenant
// blocks into thousands of per-declaration rules, so it compiles only the showroom's own CSS.
const DS_ROOT = packageRoot(realpathSync(require.resolve('@rottay/design-system/styles.css'))) + sep;

function packageRoot(file) {
  for (let dir = dirname(file); dir !== dirname(dir); dir = dirname(dir)) {
    try {
      if (JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name === '@rottay/design-system') return dir;
    } catch {
      // no package.json at this level
    }
  }
  throw new Error('showroom-tailwind-scope: @rottay/design-system package root not found');
}

function ownedByDesignSystem(file) {
  if (!file) return false;
  try {
    return realpathSync(file).startsWith(DS_ROOT);
  } catch {
    return false;
  }
}

// Next's css-loader reads `layer(...)` on an @import as a media query that never matches.
const LAYERED_IMPORT = /^(['"])([^'"]+)\1\s+layer\(([\w-]+)\)$/;

const designSystemImports = {
  postcssPlugin: 'showroom-tailwind-scope-ds-imports',
  Once(root, { result, postcss }) {
    const from = result.opts.from;
    if (!ownedByDesignSystem(from)) return;
    root.walkAtRules('import', (rule) => {
      const match = LAYERED_IMPORT.exec(rule.params.trim());
      if (!match) throw rule.error(`showroom-tailwind-scope: unsupported @import in design-system CSS: ${rule.params}`);
      const file = require.resolve(match[2], { paths: [dirname(from)] });
      const layer = postcss.atRule({ name: 'layer', params: match[3], source: rule.source });
      layer.append(postcss.parse(readFileSync(file, 'utf8'), { from: file }).nodes);
      rule.replaceWith(layer);
      result.messages.push({ type: 'dependency', plugin: 'showroom-tailwind-scope', file, parent: from });
    });
  },
};

function tailwindScope(options = {}) {
  const pack = tailwind(options);
  return {
    postcssPlugin: 'showroom-tailwind-scope',
    plugins: [designSystemImports, ...pack.plugins.map((plugin) => {
      const listeners = Object.keys(plugin).filter((key) => key !== 'postcssPlugin');
      if (listeners.length !== 1 || listeners[0] !== 'Once') {
        throw new Error(`showroom-tailwind-scope: unexpected ${plugin.postcssPlugin} listeners [${listeners}]`);
      }
      return {
        postcssPlugin: plugin.postcssPlugin,
        Once(root, helpers) {
          if (ownedByDesignSystem(helpers.result.opts.from)) return undefined;
          return plugin.Once(root, helpers);
        },
      };
    })],
  };
}

tailwindScope.postcss = true;
module.exports = tailwindScope;
