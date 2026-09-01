/**
 * Compatibility surface for DatePicker calendar utilities.
 *
 * Calendar math is owned by the primitive foundation because it is shared by
 * more than one primitive category. Keep this path as a re-export so existing
 * DatePicker engines and focused tests retain their public runtime contract.
 */

export * from '../../../../foundation/calendar';
