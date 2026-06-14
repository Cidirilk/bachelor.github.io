/**
 * Normalize a Cyprus mobile number to 8 digits.
 * Mirrors frontend logic — keep in sync with frontend/src/utils/phone.js
 */
export function normalizePhone(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('00357')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('357') && digits.length >= 11) {
    digits = digits.slice(3);
  }

  return digits;
}

export function isValidCyprusMobile(normalized: string): boolean {
  return /^\d{8}$/.test(normalized);
}

/** CORS headers for all edge function responses */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}
