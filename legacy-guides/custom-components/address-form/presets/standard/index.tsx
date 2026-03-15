'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { AddressFormProps, AddressData } from '../../core';
import { ADDRESS_FORM_DEFAULTS } from '../../core';

export const StandardPreset = createPreset<AddressFormProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Input, Button, Select } = primitives;
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
        boxShadow: tokens.shadows.md, display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        <Box>
          <Text
                       style={{
              marginBottom: tokens.spacing[1],
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
            }}
          >
            Street Address {required && <span style={{ color: tokens.colors.errorScale[600] }}>*</span>}
          </Text>
          <Input
            value={formData.street}
            onChange={(value: string) => handleChange('street', value)}
            placeholder="123 Main St"
            required={required}
          />
        </Box>

        <Box>
          <Text
                       style={{
              marginBottom: tokens.spacing[1],
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
            }}
          >
            City {required && <span style={{ color: tokens.colors.errorScale[600] }}>*</span>}
          </Text>
          <Input
            value={formData.city}
            onChange={(value: string) => handleChange('city', value)}
            placeholder="San Francisco"
            required={required}
          />
        </Box>

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          <Box>
            <Text
                           style={{
                marginBottom: tokens.spacing[1],
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
              }}
            >
              State/Province
            </Text>
            <Input
              value={formData.state || ''}
              onChange={(value: string) => handleChange('state', value)}
              placeholder="CA"
            />
          </Box>

          <Box>
            <Text
                           style={{
                marginBottom: tokens.spacing[1],
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
              }}
            >
              Postal Code {required && <span style={{ color: tokens.colors.errorScale[600] }}>*</span>}
            </Text>
            <Input
              value={formData.postalCode}
              onChange={(value: string) => handleChange('postalCode', value)}
              placeholder="94102"
              required={required}
            />
          </Box>
        </Box>

        <Box>
          <Text
                       style={{
              marginBottom: tokens.spacing[1],
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
            }}
          >
            Country {required && <span style={{ color: tokens.colors.errorScale[600] }}>*</span>}
          </Text>
          <Select
            value={formData.country}
            onChange={(value: string | number | (string | number)[]) => handleChange('country', String(value))}
            required={required}
          >
            {countries?.map((country: { code: string; name: string }) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
        </Box>

        {onSubmit && (
          <Button htmlType="submit" variant="primary" style={{ marginTop: tokens.spacing[2] }}>
            Save Address
          </Button>
        )}
      </Box>
    </form>
  );
});

StandardPreset.displayName = 'AddressFormStandardPreset';
