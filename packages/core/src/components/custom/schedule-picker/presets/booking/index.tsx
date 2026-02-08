'use client';

/**
 * SchedulePicker - Booking Preset
 * Full calendar with time slot selection
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SchedulePickerProps } from '../../core';
import { groupSlotsByPeriod, getSlotColors, getCalendarDayColors, getDaysInMonth, getFirstDayOfMonth } from '../../core';
import {
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

export const BookingSchedulePicker = createPreset<SchedulePickerProps>({
  name: 'SchedulePicker.Booking',
  render: ({ primitives, props, tokens, engine }: PresetContext<SchedulePickerProps>) => {
    const { Box, Stack } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const slotColors = getSlotColors(tokens);
    const dayColors = getCalendarDayColors(tokens);

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
      month: monthProp,
      year: yearProp,
      onMonthChange,
      title = 'Schedule a session',
      subtitle,
      confirmLabel = 'Confirm booking',
      loading,
      className,
      style,
    } = props;

    const [internalMonth, setInternalMonth] = useState(monthProp ?? now.getMonth());
    const [internalYear, setInternalYear] = useState(yearProp ?? now.getFullYear());
    const [internalDate, setInternalDate] = useState(selectedDateProp ?? '');
    const [internalSlot, setInternalSlot] = useState(selectedSlotProp ?? '');
    const [internalDuration, setInternalDuration] = useState(selectedDurationProp ?? durations[0]?.minutes ?? 25);

    const currentMonth = monthProp ?? internalMonth;
    const currentYear = yearProp ?? internalYear;
    const selectedDate = selectedDateProp ?? internalDate;
    const selectedSlot = selectedSlotProp ?? internalSlot;
    const selectedDuration = selectedDurationProp ?? internalDuration;

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const handlePrevMonth = () => {
      const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      setInternalMonth(newMonth);
      setInternalYear(newYear);
      onMonthChange?.(newMonth, newYear);
    };

    const handleNextMonth = () => {
      const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      setInternalMonth(newMonth);
      setInternalYear(newYear);
      onMonthChange?.(newMonth, newYear);
    };

    const handleDateClick = (day: number) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setInternalDate(dateStr);
      setInternalSlot('');
      onDateSelect?.(dateStr);
    };

    const handleSlotClick = (time: string) => {
      setInternalSlot(time);
      onSlotSelect?.(time);
    };

    const hasAvailability = (day: number) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return availability.some(a => a.date === dateStr && a.slots.some(s => s.available));
    };

    const selectedDayAvailability = availability.find(a => a.date === selectedDate);
    const groupedSlots = selectedDayAvailability ? groupSlotsByPeriod(selectedDayAvailability.slots) : null;

    const periodLabels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' } as const;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), ...style, padding: tokens.spacing[5] }}>
        {/* Left: Calendar */}
        <Box style={{ flex: 1, minWidth: 300 }}>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{title}</h2>
          {subtitle && <p style={{ margin: `${tokens.spacing[1]}px 0 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{subtitle}</p>}

          {/* Duration toggle */}
          <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
            {durations.map((d) => {
              const isDurationSelected = selectedDuration === d.minutes;
              const durationBgColor = isDurationSelected ? tokens.colors.primaryScale[50] : 'transparent';
              return (
                <button
                  key={d.minutes}
                  onClick={() => { setInternalDuration(d.minutes); onDurationChange?.(d.minutes); }}
                  onMouseEnter={(e) => {
                    if (!isDurationSelected) {
                      e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                      e.currentTarget.style.transform = tokens.motion.transform;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = durationBgColor;
                    e.currentTarget.style.transform = 'none';
                  }}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.full,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isDurationSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200]}`,
                    backgroundColor: durationBgColor,
                    color: isDurationSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: isDurationSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </Box>

          {/* Calendar header */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <button onClick={handlePrevMonth} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], fontFamily: 'inherit' }}>&#8249;</button>
            <span style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[900] }}>
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button onClick={handleNextMonth} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], fontFamily: 'inherit' }}>&#8250;</button>
          </Box>

          {/* Day names */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: tokens.spacing[1], textAlign: 'center', marginBottom: tokens.spacing[1] }}>
            {dayNames.map((d) => (
              <Box key={d} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontWeight: tokens.typography.fontWeight.medium, padding: tokens.spacing[1] }}>{d}</Box>
            ))}
          </Box>

          {/* Calendar days */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: tokens.spacing[1] }}>
            {Array.from({ length: firstDay }).map((_, i) => <Box key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDate;
              const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
              const hasSlots = hasAvailability(day);
              const isPast = new Date(currentYear, currentMonth, day) < new Date(now.getFullYear(), now.getMonth(), now.getDate());

              const colors = isSelected ? dayColors.selected : isToday ? dayColors.today : isPast ? dayColors.disabled : dayColors.default;
              const canHover = !isPast && !isSelected;

              return (
                <button
                  key={day}
                  onClick={() => !isPast && handleDateClick(day)}
                  disabled={isPast}
                  onMouseEnter={(e) => {
                    if (canHover) {
                      e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
                      e.currentTarget.style.transform = tokens.motion.transform;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canHover) {
                      e.currentTarget.style.backgroundColor = colors.bgColor;
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                  style={{
                    width: tokens.spacing[8], height: tokens.spacing[8], borderRadius: tokens.borderRadius.full,
                    border: 'none', backgroundColor: colors.bgColor, color: colors.color,
                    fontSize: tokens.typography.fontSize.sm, cursor: isPast ? 'default' : 'pointer',
                    fontFamily: 'inherit', fontWeight: isSelected || isToday ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', margin: '0 auto',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {day}
                  {hasSlots && !isSelected && (
                    <Box style={{ position: 'absolute', bottom: tokens.spacing[1], left: '50%', transform: 'translateX(-50%)', width: tokens.spacing[1], height: tokens.spacing[1], borderRadius: tokens.borderRadius.full, backgroundColor: dayColors.hasSlots.dot }} />
                  )}
                </button>
              );
            })}
          </Box>

          {/* Timezone */}
          <Box style={{ marginTop: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            Timezone: {timezone}
          </Box>
        </Box>

        {/* Right: Time slots */}
        <Box style={{ width: 220, borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, paddingLeft: tokens.spacing[5] }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : !selectedDate ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              Select a date
            </Box>
          ) : !groupedSlots ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No availability
            </Box>
          ) : (
            <Stack direction="vertical" spacing="md">
              {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((period) => {
                const slots = groupedSlots[period];
                if (!slots || slots.length === 0) return null;
                return (
                  <Box key={period}>
                    <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', marginBottom: tokens.spacing[2], letterSpacing: '0.5px' }}>
                      {periodLabels[period]}
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                      {slots.map((slot) => {
                        const isSlotSelected = slot.time === selectedSlot;
                        const colors = !slot.available ? slotColors.unavailable : isSlotSelected ? slotColors.selected : slotColors.available;
                        const canSlotHover = slot.available && !isSlotSelected;
                        return (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && handleSlotClick(slot.time)}
                            disabled={!slot.available}
                            onMouseEnter={(e) => {
                              if (canSlotHover) {
                                e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50];
                                e.currentTarget.style.borderColor = tokens.colors.primaryScale[300];
                                e.currentTarget.style.transform = tokens.motion.transform;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (canSlotHover) {
                                e.currentTarget.style.backgroundColor = colors.bgColor;
                                e.currentTarget.style.borderColor = colors.border;
                                e.currentTarget.style.transform = 'none';
                              }
                            }}
                            style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
                              backgroundColor: colors.bgColor, color: colors.color,
                              fontSize: tokens.typography.fontSize.sm, cursor: slot.available ? 'pointer' : 'default',
                              fontFamily: 'inherit', textAlign: 'center',
                              fontWeight: isSlotSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                              transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}

              {selectedSlot && (
                <button
                  onClick={onConfirm}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600];
                    e.currentTarget.style.transform = tokens.motion.transform;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[500];
                    e.currentTarget.style.transform = 'none';
                  }}
                  style={{
                    marginTop: tokens.spacing[4], width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md, border: 'none',
                    backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {confirmLabel}
                </button>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    );
  },
});
