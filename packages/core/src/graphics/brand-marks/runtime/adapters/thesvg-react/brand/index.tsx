import React, { forwardRef } from 'react';
import Openai, { type OpenaiVariant } from '@thesvg/react/openai';
import Anthropic, { type AnthropicVariant } from '@thesvg/react/anthropic';
import Github, { type GithubVariant } from '@thesvg/react/github';
import Google, { type GoogleVariant } from '@thesvg/react/google';
import Linkedin, { type LinkedinVariant } from '@thesvg/react/linkedin';
import Instagram, { type InstagramVariant } from '@thesvg/react/instagram';
import X, { type XVariant } from '@thesvg/react/x';
import GoogleChrome, { type GoogleChromeVariant } from '@thesvg/react/google-chrome';

import type {
  BrandMarkName,
  BrandSourceVariant,
  MarkVariant,
} from '../../../../foundation/catalog';
import {
  sharedSvgProps,
  type SharedMarkAdapterProps,
} from '..';

interface BrandMarkAdapterProps extends SharedMarkAdapterProps {
  name: BrandMarkName;
  resolvedVariant: MarkVariant;
  sourceVariant: BrandSourceVariant;
}

/** The sole module that translates DS brand names into renderer components. */
export const TheSvgBrandMarkAdapter = forwardRef<SVGSVGElement, BrandMarkAdapterProps>(
  function TheSvgBrandMarkAdapter(props, ref) {
    const { name, resolvedVariant, sourceVariant } = props;
    const svgProps = {
      ...sharedSvgProps(props),
      ref,
      'data-mark-kind': 'brand',
      'data-mark-name': name,
      'data-mark-variant': resolvedVariant,
      'data-mark-source-variant': sourceVariant,
    } as const;

    switch (name) {
      case 'openai':
        return <Openai {...svgProps} variant={sourceVariant as OpenaiVariant} />;
      case 'anthropic':
        return <Anthropic {...svgProps} variant={sourceVariant as AnthropicVariant} />;
      case 'github':
        return <Github {...svgProps} variant={sourceVariant as GithubVariant} />;
      case 'google':
        return <Google {...svgProps} variant={sourceVariant as GoogleVariant} />;
      case 'linkedin':
        return <Linkedin {...svgProps} variant={sourceVariant as LinkedinVariant} />;
      case 'instagram':
        return <Instagram {...svgProps} variant={sourceVariant as InstagramVariant} />;
      case 'x':
        return <X {...svgProps} variant={sourceVariant as XVariant} />;
      case 'chrome':
        return <GoogleChrome {...svgProps} variant={sourceVariant as GoogleChromeVariant} />;
      default:
        return null;
    }
  },
);

TheSvgBrandMarkAdapter.displayName = 'TheSvgBrandMarkAdapter';
