import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  errorResponse,
  jsonResponse,
  normalizePhone,
  isValidCyprusMobile,
} from '../_shared/phone.ts';

const RSVP_FIELDS = [
  'friday_dinner',
  'friday_sleep',
  'saturday_breakfast',
  'saturday_lunch',
  'saturday_dinner',
  'saturday_sleep',
  'sunday_breakfast',
] as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, guestId, rsvp } = await req.json();
    const normalized = normalizePhone(phone);

    if (!isValidCyprusMobile(normalized)) {
      return errorResponse('Μη έγκυρος αριθμός κινητού.');
    }

    if (!guestId || !rsvp) {
      return errorResponse('Λείπουν απαραίτητα στοιχεία.');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Re-verify phone matches guestId (prevents spoofing)
    const { data: guest, error: guestError } = await supabase
      .from('allowed_guests')
      .select('id, name')
      .eq('id', guestId)
      .eq('phone_normalized', normalized)
      .maybeSingle();

    if (guestError || !guest) {
      return errorResponse('Μη εξουσιοδοτημένη υποβολή.');
    }

    // Build RSVP record with boolean fields
    const record: Record<string, unknown> = {
      guest_id: guest.id,
      allergies: String(rsvp.allergies || '').slice(0, 500),
      notes: String(rsvp.notes || '').slice(0, 500),
    };

    for (const field of RSVP_FIELDS) {
      record[field] = Boolean(rsvp[field]);
    }

    // Upsert — guest_id is unique key, allows updates
    const { error: upsertError } = await supabase
      .from('rsvps')
      .upsert(record, { onConflict: 'guest_id' });

    if (upsertError) {
      console.error('RSVP upsert error:', upsertError);
      return errorResponse('Αποτυχία αποθήκευσης. Δοκιμάστε ξανά.', 500);
    }

    return jsonResponse({ success: true, name: guest.name });
  } catch (err) {
    console.error('submit-rsvp error:', err);
    return errorResponse('Σφάλμα αποθήκευσης. Δοκιμάστε ξανά.', 500);
  }
});
