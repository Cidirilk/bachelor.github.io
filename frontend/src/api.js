/**
 * API client for Supabase Edge Functions.
 * Phone numbers are only sent to the server — never stored in frontend.
 */

const API_URL = import.meta.env.VITE_API_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function request(endpoint, body) {
  if (!API_URL || !ANON_KEY) {
    throw new Error('Το API δεν έχει ρυθμιστεί. Επικοινωνήστε με τους διοργανωτές.');
  }

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.');
  }

  return data;
}

/** Validate phone against server-side allowed list. Returns guest info + existing RSVP. */
export async function validatePhone(phone) {
  return request('validate-phone', { phone });
}

/** Submit or update RSVP for a validated guest. */
export async function submitRsvp(phone, guestId, rsvp) {
  return request('submit-rsvp', { phone, guestId, rsvp });
}

/** Fetch admin dashboard data (requires admin secret). */
export async function fetchAdminData(adminSecret) {
  return request('admin-data', { adminSecret });
}
