/**
 * RSVP option definitions — shared between form and display.
 * Two options: attend with overnight stay, or attend without.
 */
export const RSVP_OPTIONS = [
  { key: 'saturday_sleep', label: 'Με διανυκτέρευση — €100' },
  { key: 'saturday_dinner', label: 'Χωρίς διανυκτέρευση — €50' },
];

export const OVERNIGHT_LIMIT = 12;

/**
 * Drink preferences — mapped to repurposed boolean columns.
 */
export const DRINK_OPTIONS = [
  { key: 'friday_dinner', label: 'Beer' },
  { key: 'friday_sleep', label: 'Gin' },
  { key: 'saturday_breakfast', label: 'Rum' },
  { key: 'saturday_lunch', label: 'Vodka' },
  { key: 'sunday_breakfast', label: 'Tequila' },
  { key: 'whiskey', label: 'Whiskey' },
];

export const EMPTY_RSVP = {
  friday_dinner: false,
  friday_sleep: false,
  saturday_breakfast: false,
  saturday_lunch: false,
  saturday_dinner: false,
  saturday_sleep: false,
  sunday_breakfast: false,
  whiskey: false,
  allergies: '',
  notes: '',
};
