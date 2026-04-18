/**
 * Lightweight ESLint rule type definitions.
 *
 * These are intentionally minimal to avoid a dependency on
 * @typescript-eslint/utils or eslint's own type package.
 * They cover the subset of the Rule API used by the governance rules.
 */

export interface RuleMeta {
  type: 'problem' | 'suggestion' | 'layout';
  docs?: {
    description?: string;
    recommended?: boolean | 'error' | 'warn';
    url?: string;
  };
  fixable?: 'code' | 'whitespace';
  schema?: any[];
  messages?: Record<string, string>;
}

export interface RuleContext {
  filename: string;
  getFilename?: () => string;
  options: any[];
  report: (descriptor: ReportDescriptor) => void;
}

export interface ReportDescriptor {
  node: any;
  message?: string;
  messageId?: string;
  data?: Record<string, string>;
  fix?: (fixer: any) => any;
}

export interface Rule {
  meta: RuleMeta;
  create: (context: RuleContext) => Record<string, (node: any) => void>;
}
