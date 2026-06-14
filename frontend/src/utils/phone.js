/**
 * Normalize a Cyprus mobile number to 8 digits.
 * Accepts: 99949434, +357 99949434, 00357 99949434, 99 949434
 */
export function normalizePhone(input) {
  if (!input || typeof input !== 'string') return '';

  // Remove all non-digit characters
  let digits = input.replace(/\D/g, '');

  // Strip Cyprus country code prefixes
  if (digits.startsWith('00357')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('357') && digits.length >= 11) {
    digits = digits.slice(3);
  }

  return digits;
}

/** Validate that normalized phone is exactly 8 digits (Cyprus mobile). */
export function isValidCyprusMobile(normalized) {
  return /^\d{8}$/.test(normalized);
}

/** Format 8-digit number for display: 99 949434 */
export function formatPhoneDisplay(normalized) {
  if (!normalized || normalized.length !== 8) return normalized;
  return `${normalized.slice(0, 2)} ${normalized.slice(2)}`;
}
