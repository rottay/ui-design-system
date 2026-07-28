import { loadSource, CORE_ROOT } from '../source-loader.mjs';
const gate = await import(`${CORE_ROOT}/scripts/tenant-channel-consumer-gate.mjs`);
const m = await loadSource({ chrome: '/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts' });
const names = gate.collectEmittedChannelNames(m.chrome.chromeToVariables);
console.log('total', names.length);
const junk = names.filter(n => !/^--ds-[a-z0-9-]+$/.test(n));
console.log('non-conforming names:', junk.length);
console.log(junk.slice(0, 30).join('\n'));
