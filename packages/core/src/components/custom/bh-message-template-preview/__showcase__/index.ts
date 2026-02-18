/**
 * bh-message-template-preview - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */


export const DEFAULT_SAMPLE: Record<string, string> = {
  firstName: 'Alex',
  company: 'TechCorp',
  position: 'Senior Frontend Engineer',
  recruiterName: 'Sarah',
};

export const DEFAULT_SAMPLE_DATA: Record<string, string> = {
  firstName: 'Alex',
  lastName: 'Rivera',
  company: 'TechCorp',
  position: 'Senior Frontend Engineer',
  recruiterName: 'Sarah Johnson',
};

/** Template metadata mock data */
export const MOCK_TEMPLATE_TYPE = 'email' as const;
export const MOCK_TARGET_AUDIENCE = 'Senior Engineers';
export const MOCK_USE_CASE = 'Initial Outreach';
export const MOCK_LANGUAGE = 'en';
export const MOCK_VERSION = 2;
export const MOCK_PLAIN_TEXT_BODY = 'Hi Alex,\n\nI came across your profile and was impressed by your experience. We have an exciting Senior Frontend Engineer role at TechCorp that I think would be a great fit.\n\nWould you be open to a brief conversation?\n\nBest regards,\nSarah Johnson';
