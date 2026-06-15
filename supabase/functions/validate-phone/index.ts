import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  errorResponse,
  jsonResponse,
  normalizePhone,
  isValidCyprusMobile,
} from '../_shared/phone.ts';

const OVERNIGHT_LIMIT = 12;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    const normalized = normalizePhone(phone);

    if (!isValidCyprusMobile(normalized)) {
      return errorResponse('Παρακαλώ εισάγετε έγκυρο κυπριακό κινητό (8 ψηφία).');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: guest, error: guestError } = await supabase
      .from('allowed_guests')
      .select('id, name')
      .eq('phone_normalized', normalized)
      .maybeSingle();

    if (guestError) {
      console.error('Guest lookup error:', guestError);
      return errorResponse('Σφάλμα ελέγχου. Δοκιμάστε ξανά.', 500);
    }

    if (!guest) {
      return errorResponse(
        'Δεν βρέθηκε αυτός ο αριθμός στη λίστα. Αν νομίζεις ότι είναι λάθος, στείλε μήνυμα στους κουμπάρους.'
      );
    }

    const { data: existingRsvp } = await supabase
      .from('rsvps')
      .select('*')
      .eq('guest_id', guest.id)
      .maybeSingle();

    // Count current overnight bookings (exclude this guest if they already have one)
    const { count: overnightCount } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('saturday_sleep', true);

    const guestHasOvernight = existingRsvp?.saturday_sleep === true;
    const overnightTaken = overnightCount ?? 0;
    const overnightAvailable = OVERNIGHT_LIMIT - overnightTaken + (guestHasOvernight ? 1 : 0);

    return jsonResponse({
      guestId: guest.id,
      name: guest.name,
      existingRsvp: existingRsvp || null,
      overnightAvailable,
      overnightLimit: OVERNIGHT_LIMIT,
    });
  } catch (err) {
    console.error('validate-phone error:', err);
    return errorResponse('Σφάλμα ελέγχου. Δοκιμάστε ξανά.', 500);
  }
});
