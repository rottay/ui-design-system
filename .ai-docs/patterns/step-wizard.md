# PatternStepWizard

**Source**: `ui-design-system/packages/core/src/components/patterns/step-wizard/`
**Component**: `PatternStepWizard`
**Export**: `import { PatternStepWizard } from '@rottay/design-system'`

## Purpose

Multi-step wizard with an ordered sequence of steps, navigation buttons (next/prev/skip/complete), a progress indicator, per-step async validation gates, horizontal or vertical orientation, and customizable labels. Supports both controlled (`currentStep` + `onStepChange`) and uncontrolled usage.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

All three engines are independently implemented.

## Props Interface

```typescript
interface StepWizardProps extends PatternBaseProps {
  /** Ordered list of wizard steps to render. */
  steps: WizardStep[];

  /** Current active step index (zero-based). Controlled mode. */
  currentStep?: number;

  /** Callback fired when the active step index changes. */
  onStepChange?: (step: number) => void;

  /** Callback fired when the user clicks the final completion button. */
  onComplete?: () => void;

  /** Disables all navigation actions (next, prev, skip, complete). */
  actionsDisabled?: boolean;

  /** Disables only the final completion action. */
  completeDisabled?: boolean;

  /** Whether to render the final completion action button. */
  showCompleteAction?: boolean;

  /** Enables skip button for steps marked as optional. */
  allowSkip?: boolean;

  /** Whether to render a progress bar or step counter. */
  showProgress?: boolean;

  /** Step indicator orientation. Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';

  /** Custom label for the "Next" button. */
  nextLabel?: string;

  /** Custom label for the "Previous" button. */
  prevLabel?: string;

  /** Custom label for the "Complete" button. */
  completeLabel?: string;

  /** Custom label for the "Skip" button. */
  skipLabel?: string;

  /** Extra content rendered in the footer below navigation buttons. */
  footer?: ReactNode;
}
```

## WizardStep Type

```typescript
interface WizardStep {
  /** Unique key identifying this step. */
  key: string;

  /** Title displayed in the step indicator. */
  title: string;

  /** Optional description below the title in the step indicator. */
  description?: string;

  /** The renderable body of this step (displayed when active). */
  content: ReactNode;

  /** Optional icon alongside the step title. */
  icon?: ReactNode;

  /** Whether this step can be skipped (requires allowSkip on parent). */
  optional?: boolean;

  /** Validation gate before navigating away from this step.
   *  Return true to allow, or a string error message to block. */
  validate?: () => boolean | string | Promise<boolean | string>;
}
```

## Usage Example

```tsx
import { PatternStepWizard } from '@rottay/design-system';

<PatternStepWizard
  steps={[
    {
      key: 'info',
      title: 'Basic Info',
      description: 'Enter your details',
      content: <BasicInfoForm />,
      validate: async () => {
        const valid = await validateBasicInfo();
        return valid || 'Please fill all required fields';
      },
    },
    {
      key: 'preferences',
      title: 'Preferences',
      content: <PreferencesForm />,
      optional: true,
    },
    {
      key: 'review',
      title: 'Review',
      description: 'Confirm your choices',
      content: <ReviewStep />,
    },
  ]}
  currentStep={step}
  onStepChange={setStep}
  onComplete={handleSubmit}
  showProgress
  orientation="horizontal"
  allowSkip
  completeLabel="Submit"
/>
```

## Related Patterns

- **FormBuilder** -- Has a built-in `"steps"` layout mode for basic wizard forms. StepWizard is the standalone, full-featured wizard pattern.
- **ApprovalWorkflow** -- Visually similar sequential flow, but for approval chains rather than user data entry.
