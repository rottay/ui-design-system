import React from 'react';
import { Form, message } from 'antd';
import { FormBuilder } from './FormBuilder';
import type { FormField } from './types';

/**
 * Advanced FormBuilder Examples
 *
 * This file demonstrates all the advanced features of the FormBuilder component:
 * 1. Conditional Fields (show/hide based on other field values)
 * 2. Multi-Column Layouts (2, 3, 4 column grids)
 * 3. Field Groups/Sections (visual organization)
 * 4. Custom Validation Rules (async validation)
 * 5. Field Dependencies (dependent field updates)
 */

// ============================================================================
// EXAMPLE 1: Conditional Fields with dependsOn
// ============================================================================

export const ConditionalFieldsExample: React.FC = () => {
  const fields: FormField[] = [
    {
      name: 'accountType',
      label: 'Account Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      placeholder: 'Select account type',
    },
    // This field only shows when accountType is 'business' or 'enterprise'
    {
      name: 'companyName',
      label: 'Company Name',
      type: 'text',
      required: true,
      placeholder: 'Enter company name',
      visibleWhen: (values) =>
        values.accountType === 'business' || values.accountType === 'enterprise',
    },
    // This field only shows when accountType is 'enterprise'
    {
      name: 'employeeCount',
      label: 'Number of Employees',
      type: 'number',
      placeholder: 'Enter employee count',
      dependsOn: {
        field: 'accountType',
        value: 'enterprise',
        condition: 'equals',
      },
    },
    // Always visible
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter email',
    },
  ];

  return (
    <FormBuilder
      fields={fields}
      onSubmit={(values) => {
        message.success('Form submitted!');
        console.log('Form values:', values);
      }}
      submitText="Create Account"
    />
  );
};

// ============================================================================
// EXAMPLE 2: Multi-Column Layout (2 columns)
// ============================================================================

export const MultiColumnLayoutExample: React.FC = () => {
  const fields: FormField[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'John',
      colSpan: 1, // Takes 1 column
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Doe',
      colSpan: 1, // Takes 1 column
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'john.doe@example.com',
      colSpan: 2, // Takes full width (2 columns)
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: '+1 234 567 8900',
      colSpan: 1,
    },
    {
      name: 'birthDate',
      label: 'Birth Date',
      type: 'date',
      colSpan: 1,
    },
    {
      name: 'address',
      label: 'Full Address',
      type: 'textarea',
      placeholder: 'Enter your full address',
      colSpan: 2, // Full width
    },
  ];

  return (
    <FormBuilder
      fields={fields}
      columns={2} // 2 column layout
      columnGap={24}
      rowGap={8}
      onSubmit={(values) => {
        message.success('Profile saved!');
        console.log('Profile:', values);
      }}
      submitText="Save Profile"
    />
  );
};

// ============================================================================
// EXAMPLE 3: Field Groups/Sections
// ============================================================================

export const FieldGroupsExample: React.FC = () => {
  const fields: FormField[] = [
    // Section 1: Personal Information
    {
      name: 'section_personal',
      label: 'Personal Information',
      type: 'section',
      title: 'Personal Information',
      description: 'Please provide your personal details',
    },
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'your.email@example.com',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: '+1 234 567 8900',
    },

    // Section 2: Account Settings
    {
      name: 'section_account',
      label: 'Account Settings',
      type: 'section',
      title: 'Account Settings',
      description: 'Configure your account preferences',
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      required: true,
      placeholder: 'Choose a username',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Create a strong password',
    },
    {
      name: 'notifications',
      label: 'Enable Notifications',
      type: 'switch',
      defaultValue: true,
    },

    // Section 3: Preferences
    {
      name: 'section_preferences',
      label: 'Preferences',
      type: 'section',
      title: 'Preferences',
      description: 'Customize your experience',
    },
    {
      name: 'theme',
      label: 'Theme',
      type: 'radio',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto', value: 'auto' },
      ],
      defaultValue: 'auto',
    },
    {
      name: 'language',
      label: 'Language',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
      ],
      defaultValue: 'en',
    },
  ];

  return (
    <FormBuilder
      fields={fields}
      onSubmit={(values) => {
        message.success('Settings saved!');
        console.log('Settings:', values);
      }}
      submitText="Save Settings"
      showReset
    />
  );
};

// ============================================================================
// EXAMPLE 4: Custom Validation with Async
// ============================================================================

export const CustomValidationExample: React.FC = () => {
  // Simulate async username check
  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const takenUsernames = ['admin', 'user', 'test', 'demo'];
    return !takenUsernames.includes(username.toLowerCase());
  };

  const fields: FormField[] = [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      required: true,
      placeholder: 'Choose a unique username',
      tooltip: 'Username must be unique and available',
      customValidator: async (value, allValues) => {
        if (!value) return;

        if (value.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }

        const isAvailable = await checkUsernameAvailable(value);
        if (!isAvailable) {
          throw new Error('This username is already taken');
        }
      },
      validateTrigger: 'onBlur', // Only validate when field loses focus
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      placeholder: 'Create a strong password',
      customValidator: (value) => {
        if (!value) return;

        if (value.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        if (!/[A-Z]/.test(value)) {
          throw new Error('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(value)) {
          throw new Error('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(value)) {
          throw new Error('Password must contain at least one number');
        }
      },
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      required: true,
      placeholder: 'Re-enter your password',
      dependencies: ['password'], // This field depends on password
      customValidator: (value, allValues) => {
        if (value && value !== allValues.password) {
          throw new Error('Passwords do not match');
        }
      },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'your.email@example.com',
      customValidator: (value) => {
        if (!value) return;

        // Custom email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Please enter a valid email address');
        }

        // Check for disposable email domains
        const disposableDomains = ['tempmail.com', '10minutemail.com'];
        const domain = value.split('@')[1];
        if (disposableDomains.includes(domain)) {
          throw new Error('Disposable email addresses are not allowed');
        }
      },
    },
  ];

  return (
    <FormBuilder
      fields={fields}
      onSubmit={(values) => {
        message.success('Account created successfully!');
        console.log('Account:', values);
      }}
      submitText="Create Account"
      loading={false}
    />
  );
};

// ============================================================================
// EXAMPLE 5: Field Dependencies and Dynamic Updates
// ============================================================================

export const FieldDependenciesExample: React.FC = () => {
  const [form] = Form.useForm();

  const fields: FormField[] = [
    {
      name: 'country',
      label: 'Country',
      type: 'select',
      required: true,
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' },
        { label: 'Australia', value: 'au' },
      ],
      placeholder: 'Select country',
    },
    {
      name: 'state',
      label: 'State/Province',
      type: 'select',
      required: true,
      placeholder: 'Select state',
      dependencies: ['country'], // This field depends on country
      // Options would be updated dynamically via onFieldChange
      options: [],
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      required: true,
      placeholder: 'Enter city',
      dependencies: ['state'],
    },
    {
      name: 'postalCode',
      label: 'Postal/ZIP Code',
      type: 'text',
      required: true,
      placeholder: 'Enter postal code',
      customValidator: (value, allValues) => {
        if (!value) return;

        // Different validation based on country
        const country = allValues.country;
        if (country === 'us' && !/^\d{5}(-\d{4})?$/.test(value)) {
          throw new Error('Invalid US ZIP code format (e.g., 12345 or 12345-6789)');
        }
        if (country === 'ca' && !/^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(value)) {
          throw new Error('Invalid Canadian postal code format (e.g., A1A 1A1)');
        }
        if (country === 'uk' && !/^[A-Z]{1,2}\d{1,2} \d[A-Z]{2}$/.test(value)) {
          throw new Error('Invalid UK postcode format');
        }
      },
    },
  ];

  const handleFieldChange = (
    changedField: string,
    value: any,
    allValues: Record<string, any>
  ) => {
    // Update state options when country changes
    if (changedField === 'country') {
      const stateOptions: Record<string, { label: string; value: string }[]> = {
        us: [
          { label: 'California', value: 'ca' },
          { label: 'New York', value: 'ny' },
          { label: 'Texas', value: 'tx' },
          { label: 'Florida', value: 'fl' },
        ],
        ca: [
          { label: 'Ontario', value: 'on' },
          { label: 'Quebec', value: 'qc' },
          { label: 'British Columbia', value: 'bc' },
          { label: 'Alberta', value: 'ab' },
        ],
        uk: [
          { label: 'England', value: 'eng' },
          { label: 'Scotland', value: 'sct' },
          { label: 'Wales', value: 'wal' },
          { label: 'Northern Ireland', value: 'nir' },
        ],
        au: [
          { label: 'New South Wales', value: 'nsw' },
          { label: 'Victoria', value: 'vic' },
          { label: 'Queensland', value: 'qld' },
          { label: 'Western Australia', value: 'wa' },
        ],
      };

      // Reset state and city when country changes
      form.setFieldsValue({ state: undefined, city: undefined });

      // Update state options dynamically
      const field = fields.find((f) => f.name === 'state');
      if (field) {
        field.options = stateOptions[value] || [];
      }
    }
  };

  return (
    <FormBuilder
      form={form}
      fields={fields}
      onFieldChange={handleFieldChange}
      onSubmit={(values) => {
        message.success('Address saved!');
        console.log('Address:', values);
      }}
      submitText="Save Address"
    />
  );
};

// ============================================================================
// EXAMPLE 6: Complex Form with All Features Combined
// ============================================================================

export const ComplexFormExample: React.FC = () => {
  const [form] = Form.useForm();

  const fields: FormField[] = [
    // Section 1: Account Type
    {
      name: 'section_account',
      label: 'Account Type',
      type: 'section',
      title: 'Account Type',
      description: 'Choose your account type and provide basic information',
    },
    {
      name: 'accountType',
      label: 'Account Type',
      type: 'radio',
      required: true,
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' },
      ],
      defaultValue: 'personal',
      colSpan: 2,
    },

    // Section 2: Personal Information
    {
      name: 'section_personal',
      label: 'Personal Information',
      type: 'section',
      title: 'Personal Information',
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'John',
      colSpan: 1,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Doe',
      colSpan: 1,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'john.doe@example.com',
      colSpan: 2,
      customValidator: (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('Invalid email format');
        }
      },
    },

    // Conditional: Business Information (only shows when accountType is 'business')
    {
      name: 'section_business',
      label: 'Business Information',
      type: 'section',
      title: 'Business Information',
      description: 'Additional information for business accounts',
      visibleWhen: (values) => values.accountType === 'business',
    },
    {
      name: 'companyName',
      label: 'Company Name',
      type: 'text',
      required: true,
      placeholder: 'Acme Inc.',
      colSpan: 1,
      dependsOn: {
        field: 'accountType',
        value: 'business',
      },
    },
    {
      name: 'taxId',
      label: 'Tax ID',
      type: 'text',
      placeholder: 'XX-XXXXXXX',
      colSpan: 1,
      dependsOn: {
        field: 'accountType',
        value: 'business',
      },
    },
    {
      name: 'industry',
      label: 'Industry',
      type: 'select',
      options: [
        { label: 'Technology', value: 'tech' },
        { label: 'Finance', value: 'finance' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Retail', value: 'retail' },
        { label: 'Other', value: 'other' },
      ],
      colSpan: 2,
      dependsOn: {
        field: 'accountType',
        value: 'business',
      },
    },

    // Section 3: Preferences
    {
      name: 'section_preferences',
      label: 'Preferences',
      type: 'section',
      title: 'Preferences',
    },
    {
      name: 'newsletter',
      label: 'Subscribe to Newsletter',
      type: 'switch',
      defaultValue: false,
      colSpan: 1,
    },
    {
      name: 'notifications',
      label: 'Enable Notifications',
      type: 'switch',
      defaultValue: true,
      colSpan: 1,
    },
  ];

  return (
    <FormBuilder
      form={form}
      fields={fields}
      columns={2}
      columnGap={24}
      rowGap={8}
      onSubmit={(values) => {
        message.success('Form submitted successfully!');
        console.log('Form values:', values);
      }}
      submitText="Submit"
      showReset
      resetText="Clear Form"
    />
  );
};

// ============================================================================
// EXAMPLE 7: Conditional with Greater Than / Less Than
// ============================================================================

export const ConditionalNumericExample: React.FC = () => {
  const fields: FormField[] = [
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      required: true,
      placeholder: 'Enter your age',
    },
    // Show only if age >= 18
    {
      name: 'driversLicense',
      label: 'Driver\'s License Number',
      type: 'text',
      placeholder: 'Enter license number',
      dependsOn: {
        field: 'age',
        value: 18,
        condition: 'greaterThan',
      },
    },
    // Show only if age < 18
    {
      name: 'guardianName',
      label: 'Parent/Guardian Name',
      type: 'text',
      required: true,
      placeholder: 'Enter guardian name',
      visibleWhen: (values) => values.age && Number(values.age) < 18,
    },
    {
      name: 'guardianPhone',
      label: 'Guardian Phone',
      type: 'text',
      placeholder: 'Enter guardian phone',
      visibleWhen: (values) => values.age && Number(values.age) < 18,
    },
  ];

  return (
    <FormBuilder
      fields={fields}
      onSubmit={(values) => {
        message.success('Registration complete!');
        console.log('Registration:', values);
      }}
      submitText="Register"
    />
  );
};

// ============================================================================
// Export all examples
// ============================================================================

export default {
  ConditionalFieldsExample,
  MultiColumnLayoutExample,
  FieldGroupsExample,
  CustomValidationExample,
  FieldDependenciesExample,
  ComplexFormExample,
  ConditionalNumericExample,
};
