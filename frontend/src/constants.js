/**
 * RSVP option definitions — shared between form and display.
 */
export const RSVP_OPTIONS = [
  { key: 'friday_dinner', label: 'Παρασκευή βραδινό', day: 'Παρασκευή 28 Αυγούστου' },
  { key: 'friday_sleep', label: 'Παρασκευή διανυκτέρευση', day: 'Παρασκευή 28 Αυγούστου' },
  { key: 'saturday_breakfast', label: 'Σάββατο πρωινό', day: 'Σάββατο 29 Αυγούστου' },
  { key: 'saturday_lunch', label: 'Σάββατο μεσημεριανό', day: 'Σάββατο 29 Αυγούστου' },
  { key: 'saturday_dinner', label: 'Σάββατο βραδινό', day: 'Σάββατο 29 Αυγούστου' },
  { key: 'saturday_sleep', label: 'Σάββατο διανυκτέρευση', day: 'Σάββατο 29 Αυγούστου' },
  { key: 'sunday_breakfast', label: 'Κυριακή πρωινό', day: 'Κυριακή 30 Αυγούστου (πρωί)' },
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
