import React, { forwardRef } from 'react';
import Openai, { type OpenaiVariant } from '@thesvg/react/openai';
import Anthropic, { type AnthropicVariant } from '@thesvg/react/anthropic';
import Github, { type GithubVariant } from '@thesvg/react/github';
import Google, { type GoogleVariant } from '@thesvg/react/google';
import Linkedin, { type LinkedinVariant } from '@thesvg/react/linkedin';
import Instagram, { type InstagramVariant } from '@thesvg/react/instagram';
import X, { type XVariant } from '@thesvg/react/x';
import GoogleChrome, { type GoogleChromeVariant } from '@thesvg/react/google-chrome';
import Microsoft, { type MicrosoftVariant } from '@thesvg/react/microsoft';
import Greenhouse, { type GreenhouseVariant } from '@thesvg/react/greenhouse';
import Indeed, { type IndeedVariant } from '@thesvg/react/indeed';

import type {
  BrandMarkName,
  BrandSourceVariant,
  MarkVariant,
} from '../../../../foundation/catalog';
import {
  resolveMarkRendererDefault,
  sharedSvgProps,
  type SharedMarkAdapterProps,
} from '..';

const OpenaiRenderer = resolveMarkRendererDefault(Openai);
const AnthropicRenderer = resolveMarkRendererDefault(Anthropic);
const GithubRenderer = resolveMarkRendererDefault(Github);
const GoogleRenderer = resolveMarkRendererDefault(Google);
const LinkedinRenderer = resolveMarkRendererDefault(Linkedin);
const InstagramRenderer = resolveMarkRendererDefault(Instagram);
const XRenderer = resolveMarkRendererDefault(X);
const GoogleChromeRenderer = resolveMarkRendererDefault(GoogleChrome);
const MicrosoftRenderer = resolveMarkRendererDefault(Microsoft);
const GreenhouseRenderer = resolveMarkRendererDefault(Greenhouse);
const IndeedRenderer = resolveMarkRendererDefault(Indeed);

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
      'data-asset-class': 'brand-mark',
      'data-mark-kind': 'brand',
      'data-mark-name': name,
      'data-mark-variant': resolvedVariant,
      'data-mark-source-variant': sourceVariant,
    } as const;

    switch (name) {
      case 'openai':
        return <OpenaiRenderer {...svgProps} variant={sourceVariant as OpenaiVariant} />;
      case 'anthropic':
        return <AnthropicRenderer {...svgProps} variant={sourceVariant as AnthropicVariant} />;
      case 'github':
        return <GithubRenderer {...svgProps} variant={sourceVariant as GithubVariant} />;
      case 'google':
        return <GoogleRenderer {...svgProps} variant={sourceVariant as GoogleVariant} />;
      case 'linkedin':
        return <LinkedinRenderer {...svgProps} variant={sourceVariant as LinkedinVariant} />;
      case 'instagram':
        return <InstagramRenderer {...svgProps} variant={sourceVariant as InstagramVariant} />;
      case 'x':
        return <XRenderer {...svgProps} variant={sourceVariant as XVariant} />;
      case 'chrome':
        return <GoogleChromeRenderer {...svgProps} variant={sourceVariant as GoogleChromeVariant} />;
      case 'microsoft':
        return <MicrosoftRenderer {...svgProps} variant={sourceVariant as MicrosoftVariant} />;
      case 'greenhouse':
        return <GreenhouseRenderer {...svgProps} variant={sourceVariant as GreenhouseVariant} />;
      case 'indeed':
        return <IndeedRenderer {...svgProps} variant={sourceVariant as IndeedVariant} />;
      default:
        return null;
    }
  },
);

TheSvgBrandMarkAdapter.displayName = 'TheSvgBrandMarkAdapter';
