/**
 * RSVP option definitions — shared between form and display.
 * Two options: attend with overnight stay, or attend without.
 */
export const RSVP_OPTIONS = [
  { key: 'saturday_sleep', label: 'Με διανυκτέρευση (29–30 Αυγούστου)' },
  { key: 'saturday_dinner', label: 'Χωρίς διανυκτέρευση (μόνο 29 Αυγούστου)' },
];

export const EMPTY_RSVP = {
  friday_dinner: false,
  friday_sleep: false,
  saturday_breakfast: false,
  saturday_lunch: false,
  saturday_dinner: false,
  saturday_sleep: false,
  sunday_breakfast: false,
  allergies: '',
  notes: '',
};
