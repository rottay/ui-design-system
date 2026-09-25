import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import postcss from 'postcss';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const skinPath = join(
  __dirname,
  '../../../../../foundation/tokens/css/presentation/components/skin/code-block/index.css',
);

/** Every `--ds-*` name a paint value reads, in order, fallbacks included. */
export function channelReads(value: string): string[] {
  return [...value.matchAll(/var\(\s*(--ds-[\w-]+)/g)].map((match) => match[1]);
}

/** The value the family skin declares for `property` on the rule whose selector contains `selector`, outside any at-rule. */
export function skinDeclaration(selector: string, property: string): string {
  const values: string[] = [];
  postcss.parse(readFileSync(skinPath, 'utf8')).walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && (rule.parent as postcss.AtRule).name === 'media') {
      const params = (rule.parent as postcss.AtRule).params;
      if (params !== '(hover: hover)') return;
    }
    if (!rule.selector.includes(selector)) return;
    rule.walkDecls(property, (decl) => {
      values.push(decl.value.replace(/\s+/g, ' ').trim());
    });
  });
  if (values.length !== 1) {
    throw new Error(`expected one ${property} for ${selector} in the code-block skin, found ${values.length}`);
  }
  return values[0];
}

/** The inline style a rendered part carries, as React serializes it (happy-dom drops color-mix). */
export function renderedStyle(element: ReactElement, part: string, property: string): string {
  const tag = new RegExp(`<[^>]*\\bdata-part="${part}"[^>]*>`).exec(renderToStaticMarkup(element))?.[0] ?? '';
  const style = /\bstyle="([^"]*)"/.exec(tag)?.[1] ?? '';
  const match = new RegExp(`(?:^|;)${property}:([^;]*)`).exec(style);
  if (!match) throw new Error(`the ${part} part renders no ${property}`);
  return match[1].trim();
}
