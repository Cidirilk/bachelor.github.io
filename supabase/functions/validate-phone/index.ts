import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  corsHeaders,
  errorResponse,
  jsonResponse,
  normalizePhone,
  isValidCyprusMobile,
} from '../_shared/phone.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Look up guest by normalized phone (list never exposed to client)
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

    // Fetch existing RSVP if any (for update flow)
    const { data: existingRsvp } = await supabase
      .from('rsvps')
      .select('*')
      .eq('guest_id', guest.id)
      .maybeSingle();

    return jsonResponse({
      guestId: guest.id,
      name: guest.name,
      existingRsvp: existingRsvp || null,
    });
  } catch (err) {
    console.error('validate-phone error:', err);
    return errorResponse('Σφάλμα ελέγχου. Δοκιμάστε ξανά.', 500);
  }
});
