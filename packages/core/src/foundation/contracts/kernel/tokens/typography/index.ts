/** Semantic typography roles shared by every product and vertical. */
export const SEMANTIC_TYPOGRAPHY_ROLES = [
  "display",
  "pageTitle",
  "sectionTitle",
  "body",
  "supporting",
  "label",
  "caption",
  "code",
  "numeric",
] as const;

export type SemanticTypographyRole = (typeof SEMANTIC_TYPOGRAPHY_ROLES)[number];

export interface SemanticTypographyRoleTokens {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  fontVariantNumeric?: string;
}

export type SemanticTypographyTokens = Partial<
  Record<SemanticTypographyRole, SemanticTypographyRoleTokens>
>;
