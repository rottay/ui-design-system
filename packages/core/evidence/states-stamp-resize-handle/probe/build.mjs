import { build } from '/Users/daniel/Developer/Rottay/ui-design-system/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/lib/main.js';
import { resolve } from 'node:path';
const CORE = process.env.CORE_SRC;
await build({
  entryPoints: ['/Users/daniel/Developer/Rottay/ui-design-system/packages/core/.rhprobe/entry.tsx'],
  bundle: true,
  outfile: process.env.OUT,
  format: 'iife',
  jsx: 'automatic',
  loader: { '.tsx': 'tsx', '.ts': 'ts', '.css': 'empty', '.svg': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [{
    name: 'alias',
    setup(b) {
      b.onResolve({ filter: /^@\// }, (a) => b.resolve(a.path.replace(/^@\//, CORE + '/'), { resolveDir: CORE, kind: 'import-statement' }));
      b.onResolve({ filter: /^@ui\// }, (a) => b.resolve(a.path.replace(/^@ui\//, CORE + '/components/'), { resolveDir: CORE, kind: 'import-statement' }));
      b.onResolve({ filter: /^@types\// }, (a) => b.resolve(a.path.replace(/^@types\//, CORE + '/foundation/contracts/'), { resolveDir: CORE, kind: 'import-statement' }));
    },
  }],
});
console.log('built', process.env.OUT);
