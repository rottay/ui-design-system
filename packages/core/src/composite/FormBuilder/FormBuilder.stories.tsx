import type { Meta, StoryObj } from '@storybook/react';
import { FormBuilder } from './FormBuilder';
import type { FormField } from './types';

const meta = {
  title: 'Composite/FormBuilder',
  component: FormBuilder,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple login form
const loginFields: FormField[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
  },
  {
    name: 'remember',
    label: 'Remember me',
    type: 'switch',
    defaultValue: false,
  },
];

// User registration form
const registerFields: FormField[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'John',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Doe',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    required: true,
    rules: [
      { type: 'email', message: 'Please enter a valid email' },
    ],
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'At least 8 characters',
    required: true,
    rules: [
      { min: 8, message: 'Password must be at least 8 characters' },
    ],
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Re-enter your password',
    required: true,
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    placeholder: '18',
  },
  {
    name: 'terms',
    label: 'I agree to the terms and conditions',
    type: 'switch',
    required: true,
  },
];

// Contact form
const contactFields: FormField[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Your name',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'your@email.com',
    required: true,
  },
  {
    name: 'subject',
    label: 'Subject',
    type: 'select',
    placeholder: 'Select a subject',
    required: true,
    options: [
      { label: 'General Inquiry', value: 'general' },
      { label: 'Technical Support', value: 'support' },
      { label: 'Sales', value: 'sales' },
      { label: 'Feedback', value: 'feedback' },
    ],
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    placeholder: 'Type your message here...',
    required: true,
  },
];

// Survey form
const surveyFields: FormField[] = [
  {
    name: 'satisfaction',
    label: 'How satisfied are you with our service?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Very Satisfied', value: '5' },
      { label: 'Satisfied', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'Dissatisfied', value: '2' },
      { label: 'Very Dissatisfied', value: '1' },
    ],
  },
  {
    name: 'features',
    label: 'Which features do you use? (Select all that apply)',
    type: 'checkbox',
    options: [
      { label: 'Dashboard', value: 'dashboard' },
      { label: 'Reports', value: 'reports' },
      { label: 'Analytics', value: 'analytics' },
      { label: 'Integrations', value: 'integrations' },
      { label: 'API', value: 'api' },
    ],
  },
  {
    name: 'recommendation',
    label: 'Would you recommend us to others?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Maybe', value: 'maybe' },
    ],
  },
  {
    name: 'comments',
    label: 'Additional Comments',
    type: 'textarea',
    placeholder: 'Any feedback or suggestions?',
  },
];

// All field types demo
const allFieldTypes: FormField[] = [
  {
    name: 'text',
    label: 'Text Input',
    type: 'text',
    placeholder: 'Enter text',
    tooltip: 'This is a text input field',
  },
  {
    name: 'email',
    label: 'Email Input',
    type: 'email',
    placeholder: 'email@example.com',
  },
  {
    name: 'password',
    label: 'Password Input',
    type: 'password',
    placeholder: 'Enter password',
  },
  {
    name: 'number',
    label: 'Number Input',
    type: 'number',
    placeholder: '0',
  },
  {
    name: 'textarea',
    label: 'Text Area',
    type: 'textarea',
    placeholder: 'Enter long text...',
  },
  {
    name: 'select',
    label: 'Select',
    type: 'select',
    placeholder: 'Choose an option',
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ],
  },
  {
    name: 'radio',
    label: 'Radio Group',
    type: 'radio',
    options: [
      { label: 'Choice A', value: 'a' },
      { label: 'Choice B', value: 'b' },
      { label: 'Choice C', value: 'c' },
    ],
  },
  {
    name: 'checkbox',
    label: 'Checkbox Group',
    type: 'checkbox',
    options: [
      { label: 'Item 1', value: '1' },
      { label: 'Item 2', value: '2' },
      { label: 'Item 3', value: '3' },
    ],
  },
  {
    name: 'date',
    label: 'Date Picker',
    type: 'date',
    placeholder: 'Select date',
  },
  {
    name: 'switch',
    label: 'Switch',
    type: 'switch',
  },
];

export const LoginForm: Story = {
  args: {
    fields: loginFields,
    onSubmit: (values) => console.log('Login:', values),
  },
};

export const RegisterForm: Story = {
  args: {
    fields: registerFields,
    onSubmit: (values) => console.log('Register:', values),
    showReset: true,
  },
};

export const ContactForm: Story = {
  args: {
    fields: contactFields,
    submitText: 'Send Message',
    onSubmit: (values) => console.log('Contact:', values),
  },
};

export const SurveyForm: Story = {
  args: {
    fields: surveyFields,
    submitText: 'Submit Survey',
    onSubmit: (values) => console.log('Survey:', values),
  },
};

export const AllFieldTypes: Story = {
  args: {
    fields: allFieldTypes,
    onSubmit: (values) => console.log('Values:', values),
    showReset: true,
  },
};

export const HorizontalLayout: Story = {
  args: {
    fields: loginFields,
    layout: 'horizontal',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    onSubmit: (values) => console.log('Values:', values),
  },
};

export const Loading: Story = {
  args: {
    fields: loginFields,
    loading: true,
    onSubmit: (values) => console.log('Values:', values),
  },
};
