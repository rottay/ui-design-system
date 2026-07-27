import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const coreRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const component = readFileSync(
  join(coreRoot, 'src/ui/surfaces/presentation/pages/workspace/collection-workspace/index.tsx'),
  'utf8'
);
const skin = readFileSync(
  join(coreRoot, 'src/foundation/tokens/css/presentation/components/skin/collection-workspace.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

function ruleFor(state) {
  const matches = [...skin.matchAll(
    new RegExp(
      `\\.ds-collection-workspace__stats-slot\\[data-part=["']stats-slot["']\\]\\[data-collapsed=["']${state}["']\\]\\s*\\{([\\s\\S]*?)\\}`,
      'g'
    )
  )];
  const match = matches.at(-1);
  assert.ok(match, `missing stats-slot data-collapsed=${state} rule`);
  return match[1];
}

test('stats-slot layout contract is CSS-owned and has no expanded height ceiling', () => {
  const openingTag = component.match(
    /<Box\s+className="ds-collection-workspace__stats-slot"[\s\S]*?data-collapsed=\{slotsCollapsed \? 'true' : 'false'\}[\s\S]*?>/
  )?.[0];

  assert.ok(openingTag, 'missing stats-slot anatomy');
  assert.doesNotMatch(openingTag, /\bstyle\s*=/);
  assert.doesNotMatch(component, /maxHeight:\s*slotsCollapsed\s*\?\s*0\s*:\s*400/);
  assert.doesNotMatch(skin, /max-height:\s*400px/);

  const baseRule = skin.match(
    /\.ds-surface\.ds-collection-workspace\s+\.ds-collection-workspace__stats-slot\[data-part=["']stats-slot["']\]\s*\{([\s\S]*?)\}/
  )?.[1] ?? '';
  assert.match(baseRule, /transition:\s*max-height 300ms/);

  const expanded = ruleFor('false');
  assert.match(expanded, /padding:\s*14px 16px 10px/);
  assert.match(expanded, /max-height:\s*none/);
  assert.match(expanded, /overflow:\s*visible/);
  assert.match(expanded, /pointer-events:\s*auto/);

  const collapsed = ruleFor('true');
  assert.match(collapsed, /padding:\s*0/);
  assert.match(collapsed, /max-height:\s*0/);
  assert.match(collapsed, /overflow:\s*hidden/);
  assert.match(collapsed, /pointer-events:\s*none/);
});
