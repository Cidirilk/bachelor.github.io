import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, jsonResponse } from '../_shared/phone.ts';

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
    const { adminSecret } = await req.json();
    const expectedSecret = Deno.env.get('ADMIN_SECRET');

    if (!expectedSecret || adminSecret !== expectedSecret) {
      return errorResponse('Μη εξουσιοδοτημένη πρόσβαση.', 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch all guests with their RSVPs
    const { data: guests, error: guestsError } = await supabase
      .from('allowed_guests')
      .select(`
        id,
        name,
        rsvps (
          friday_dinner,
          friday_sleep,
          saturday_breakfast,
          saturday_lunch,
          saturday_dinner,
          saturday_sleep,
          sunday_breakfast,
          allergies,
          notes,
          updated_at
        )
      `)
      .order('name');

    if (guestsError) {
      console.error('Admin fetch error:', guestsError);
      return errorResponse('Σφάλμα φόρτωσης δεδομένων.', 500);
    }

    // Compute totals per RSVP option
    const totals: Record<string, number> = {};
    for (const field of RSVP_FIELDS) {
      totals[field] = 0;
    }

    let respondedCount = 0;

    const formattedGuests = (guests || []).map((g) => {
      // Supabase returns rsvps as array for one-to-one via FK
      const rsvp = Array.isArray(g.rsvps) ? g.rsvps[0] : g.rsvps;

      if (rsvp) {
        respondedCount++;
        for (const field of RSVP_FIELDS) {
          if (rsvp[field]) totals[field]++;
        }
      }

      return {
        id: g.id,
        name: g.name,
        rsvp: rsvp || null,
      };
    });

    return jsonResponse({
      guests: formattedGuests,
      totals,
      respondedCount,
      totalGuests: formattedGuests.length,
    });
  } catch (err) {
    console.error('admin-data error:', err);
    return errorResponse('Σφάλμα φόρτωσης δεδομένων.', 500);
  }
});
