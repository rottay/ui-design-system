'use client';

/**
 * SchedulePicker - Compact Preset
 * Week strip with time slots
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SchedulePickerProps } from '../../core';
import { groupSlotsByPeriod, getSlotColors } from '../../core';
import {
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

export const CompactSchedulePicker = createPreset<SchedulePickerProps>({
  name: 'SchedulePicker.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<SchedulePickerProps>) => {
    const { Box, Stack } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const slotColors = getSlotColors(tokens);

    const now = new Date();
    const {
      availability,
      selectedDate: selectedDateProp,
      selectedSlot: selectedSlotProp,
      onDateSelect,
      onSlotSelect,
      onConfirm,
      durations = [
        { label: '25 min', minutes: 25 },
        { label: '50 min', minutes: 50 },
      ],
      selectedDuration: selectedDurationProp,
      onDurationChange,
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
      title = 'Pick a time',
      confirmLabel = 'Confirm booking',
      loading,
      className,
      style,
    } = props;

    const [internalDate, setInternalDate] = useState(selectedDateProp ?? '');
    const [internalSlot, setInternalSlot] = useState(selectedSlotProp ?? '');
    const [internalDuration, setInternalDuration] = useState(selectedDurationProp ?? durations[0]?.minutes ?? 25);
    const [weekOffset, setWeekOffset] = useState(0);

    const selectedDate = selectedDateProp ?? internalDate;
    const selectedSlot = selectedSlotProp ?? internalSlot;
    const selectedDuration = selectedDurationProp ?? internalDuration;

    // Generate 7 days starting from today + weekOffset
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + weekOffset * 7 + i);
      return {
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        dayName: date.toLocaleDateString([], { weekday: 'short' }),
        dayNum: date.getDate(),
        isToday: date.toDateString() === now.toDateString(),
      };
    });

    const handleDateClick = (dateStr: string) => {
      setInternalDate(dateStr);
      setInternalSlot('');
      onDateSelect?.(dateStr);
    };

    const handleSlotClick = (time: string) => {
      setInternalSlot(time);
      onSlotSelect?.(time);
    };

    const selectedDayAvailability = availability.find(a => a.date === selectedDate);
    const groupedSlots = selectedDayAvailability ? groupSlotsByPeriod(selectedDayAvailability.slots) : null;
    const periodLabels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' } as const;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
          <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title}</h3>
          <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
            {durations.map((d) => (
              <button key={d.minutes} onClick={() => { setInternalDuration(d.minutes); onDurationChange?.(d.minutes); }} style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selectedDuration === d.minutes ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: selectedDuration === d.minutes ? tokens.colors.primaryScale[50] : 'transparent',
                color: selectedDuration === d.minutes ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                {d.label}
              </button>
            ))}
          </Box>
        </Box>

        {/* Week strip */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[4] }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400], fontFamily: 'inherit', padding: tokens.spacing[1] }}>‹</button>
          <Box style={{ display: 'flex', flex: 1, gap: tokens.spacing[1] }}>
            {weekDays.map((day) => {
              const isSelected = day.date === selectedDate;
              const hasSlots = availability.some(a => a.date === day.date && a.slots.some(s => s.available));
              return (
                <button key={day.date} onClick={() => handleDateClick(day.date)} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: isSelected ? `2px solid ${tokens.colors.primaryScale[500]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500] }}>{day.dayName}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[800] }}>{day.dayNum}</span>
                  {hasSlots && (
                    <Box style={{ width: tokens.spacing[1], height: tokens.spacing[1], borderRadius: tokens.borderRadius.full, backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.primaryScale[300] }} />
                  )}
                </button>
              );
            })}
          </Box>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400], fontFamily: 'inherit', padding: tokens.spacing[1] }}>›</button>
        </Box>

        {/* Time slots */}
        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[6], color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : !selectedDate ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[6], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Select a date</Box>
        ) : !groupedSlots ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[6], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>No availability</Box>
        ) : (
          <Stack direction="vertical" spacing="sm">
            {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((period) => {
              const slots = groupedSlots[period];
              if (!slots || slots.length === 0) return null;
              return (
                <Box key={period}>
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>{periodLabels[period]}</Box>
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                    {slots.map((slot) => {
                      const isSlotSelected = slot.time === selectedSlot;
                      const colors = !slot.available ? slotColors.unavailable : isSlotSelected ? slotColors.selected : slotColors.available;
                      return (
                        <button key={slot.time} onClick={() => slot.available && handleSlotClick(slot.time)} disabled={!slot.available} style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                          backgroundColor: colors.bgColor, color: colors.color,
                          fontSize: tokens.typography.fontSize.xs, cursor: slot.available ? 'pointer' : 'default', fontFamily: 'inherit',
                        }}>
                          {slot.time}
                        </button>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}

        {/* Footer */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[4], paddingTop: tokens.spacing[3], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{timezone}</span>
          {selectedSlot && (
            <button onClick={onConfirm} style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md, border: 'none',
              backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
            }}>
              {confirmLabel}
            </button>
          )}
        </Box>
      </Box>
    );
  },
});
