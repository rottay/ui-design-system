'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { AddressFormProps, AddressData } from '../../core';
import { ADDRESS_FORM_DEFAULTS } from '../../core';

export const CompactPreset = createPreset<AddressFormProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Input, Button, Select } = primitives;
  const {
    value,
    onChange,
    onSubmit,
    countries = ADDRESS_FORM_DEFAULTS.countries,
    required = false,
    className,
    style,
  } = props;

  const [formData, setFormData] = useState<AddressData>(
    value || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: countries?.[0]?.code || 'US',
    }
  );

  const handleChange = (field: keyof AddressData, val: string) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    onChange?.(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={style}
    >
      <Box style={{
        boxShadow: tokens.shadows.md, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
        <Input
          value={formData.street}
          onChange={(value: string) => handleChange('street', value)}
          placeholder="Street Address"
          required={required}
          size="sm"
        />

        <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[2] }}>
          <Input
            value={formData.city}
            onChange={(value: string) => handleChange('city', value)}
            placeholder="City"
            required={required}
            size="sm"
          />

          <Input
            value={formData.state || ''}
            onChange={(value: string) => handleChange('state', value)}
            placeholder="State"
            size="sm"
          />
        </Box>

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[2] }}>
          <Input
            value={formData.postalCode}
            onChange={(value: string) => handleChange('postalCode', value)}
            placeholder="Postal Code"
            required={required}
            size="sm"
          />

          <Select
            value={formData.country}
            onChange={(value: string | number | (string | number)[]) => handleChange('country', String(value))}
            required={required}
            size="sm"
          >
            {countries?.map((country: { code: string; name: string }) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
        </Box>

        {onSubmit && (
          <Button htmlType="submit" variant="primary" size="sm">
            Save
          </Button>
        )}
      </Box>
    </form>
  );
});

CompactPreset.displayName = 'AddressFormCompactPreset';
