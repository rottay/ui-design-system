import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const SP='/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad';
const m = require(SP+'/P5-bundle2.cjs');
const mk = (bg) => ({
  schemaVersion: 1, mode: 'simple', tenantId: 'tnt_probe', slug: 'probe-tenant', verticalKey: 'bithire', rowVersion: 1,
  appearance: {
    palette: {
      primary: '#0F766E', secondary: '#8C6D46', accent: '#E2725B',
      background: bg === 'dark' ? '#0B0F14' : '#FFFFFF',
      foreground: bg === 'dark'
        ? { primary: '#F2F5F8', secondary: '#C9D3DD', muted: '#8FA0AF', disabled: '#5D6C79' }
        : { primary: '#101418', secondary: '#3A444E', muted: '#6B7580', disabled: '#98A2AC' },
      border: { primary: '#2A3440', secondary: '#1B222B' },
      backgroundMode: bg,
      dark: {
        primary: '#123456', secondary: '#654321', accent: '#ABCDEF', background: '#000000',
        foreground: { primary: '#FFFFFF', secondary: '#EEEEEE', muted: '#CCCCCC', disabled: '#999999' },
        border: { primary: '#333333', secondary: '#222222' },
      },
    },
  },
});
console.log('validateTenantThemeConfig.length =', m.validateTenantThemeConfig.length);
for (const bg of ['light', 'dark', 'auto']) {
  let r;
  try { r = m.validateTenantThemeConfig(mk(bg)); }
  catch (e) { console.log(bg, 'THROW', e.message); continue; }
  console.log('backgroundMode=' + bg, '->', JSON.stringify(r).slice(0, 600));
}
// positive control: an unknown key MUST produce an issue
const bad = mk('dark'); bad.appearance.palette.notAKey = '#000000';
try { console.log('POSITIVE CONTROL unknown key ->', JSON.stringify(m.validateTenantThemeConfig(bad)).slice(0,400)); }
catch (e) { console.log('POSITIVE CONTROL THROW', e.message); }
// positive control 2: bad color
const bad2 = mk('dark'); bad2.appearance.palette.primary = 'not-a-color';
try { console.log('POSITIVE CONTROL bad color ->', JSON.stringify(m.validateTenantThemeConfig(bad2)).slice(0,400)); }
catch (e) { console.log('POSITIVE CONTROL2 THROW', e.message); }
