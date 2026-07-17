import type {
  BrandMarkName,
  BrandMarkProvenance,
  CloudService,
  CloudServiceMarkProvenance,
  MarkLicense,
} from '../../foundation/catalog';

export const MARK_TRADEMARK_NOTICE =
  'Marks remain subject to their owners\' trademark guidelines; inclusion and asset licensing do not grant trademark permission.';

export const MARK_CATALOG_SOURCE = Object.freeze({
  packageName: 'thesvg',
  version: '3.2.6',
});

export const MARK_RENDERER_SOURCE = Object.freeze({
  packageName: '@thesvg/react',
  version: '3.2.7',
});

function brand(
  name: BrandMarkName,
  slug: string,
  title: string,
  license: MarkLicense,
  url: string,
): BrandMarkProvenance {
  return Object.freeze({
    kind: 'brand',
    name,
    slug,
    title,
    license,
    url,
    catalog: MARK_CATALOG_SOURCE,
    renderer: MARK_RENDERER_SOURCE,
    trademarkNotice: MARK_TRADEMARK_NOTICE,
  });
}

function cloud(
  service: CloudService,
  slug: string,
  title: string,
  url: string,
): CloudServiceMarkProvenance {
  return Object.freeze({
    kind: 'cloud-service',
    provider: 'aws',
    service,
    slug,
    title,
    license: 'CC-BY-ND-2.0',
    url,
    catalog: MARK_CATALOG_SOURCE,
    renderer: MARK_RENDERER_SOURCE,
    trademarkNotice: MARK_TRADEMARK_NOTICE,
  });
}

/** Audited metadata snapshot from the pinned catalog; contains no SVG payloads. */
export const BRAND_MARK_PROVENANCE: Readonly<Record<BrandMarkName, BrandMarkProvenance>> =
  Object.freeze({
    openai: brand('openai', 'openai', 'OpenAI', 'MIT', 'https://openai.com/'),
    anthropic: brand(
      'anthropic',
      'anthropic',
      'Anthropic',
      'CC0-1.0',
      'https://www.anthropic.com/',
    ),
    github: brand('github', 'github', 'GitHub', 'CC0-1.0', 'https://github.com/'),
    google: brand('google', 'google', 'Google', 'CC0-1.0', 'https://www.google.com/'),
    linkedin: brand('linkedin', 'linkedin', 'LinkedIn', 'MIT', 'https://www.linkedin.com/'),
    instagram: brand(
      'instagram',
      'instagram',
      'Instagram',
      'CC0-1.0',
      'https://www.instagram.com/',
    ),
    x: brand('x', 'x', 'X', 'CC0-1.0', 'https://x.com'),
    chrome: brand(
      'chrome',
      'google-chrome',
      'Google Chrome',
      'CC0-1.0',
      'https://www.google.com/chrome',
    ),
  });

export const CLOUD_SERVICE_MARK_PROVENANCE: Readonly<
  Record<CloudService, CloudServiceMarkProvenance>
> = Object.freeze({
  lambda: cloud('lambda', 'aws-aws-lambda', 'AWS Lambda', 'https://aws.amazon.com/lambda/'),
  bedrock: cloud(
    'bedrock',
    'aws-amazon-bedrock',
    'Amazon Bedrock',
    'https://aws.amazon.com/bedrock/',
  ),
  s3: cloud(
    's3',
    'aws-amazon-simple-storage-service',
    'Amazon Simple Storage Service',
    'https://aws.amazon.com/simple-storage-service/',
  ),
  rds: cloud('rds', 'aws-amazon-rds', 'Amazon RDS', 'https://aws.amazon.com/rds/'),
});
