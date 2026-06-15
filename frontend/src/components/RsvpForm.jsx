import { useState } from 'react';
import { RSVP_OPTIONS, EMPTY_RSVP } from '../constants';
import { submitRsvp } from '../api';
import './RsvpForm.css';

function buildInitialRsvp(existing) {
  if (!existing) return { ...EMPTY_RSVP };
  return {
    friday_dinner: existing.friday_dinner ?? false,
    friday_sleep: existing.friday_sleep ?? false,
    saturday_breakfast: existing.saturday_breakfast ?? false,
    saturday_lunch: existing.saturday_lunch ?? false,
    saturday_dinner: existing.saturday_dinner ?? false,
    saturday_sleep: existing.saturday_sleep ?? false,
    sunday_breakfast: existing.sunday_breakfast ?? false,
    allergies: existing.allergies ?? '',
    notes: existing.notes ?? '',
  };
}

function getSelectedOption(rsvp) {
  if (rsvp.saturday_sleep) return 'saturday_sleep';
  if (rsvp.saturday_dinner) return 'saturday_dinner';
  return '';
}

export default function RsvpForm({ guest, onSubmitted, onBack }) {
  const isUpdate = Boolean(guest.existingRsvp);
  const [rsvp, setRsvp] = useState(() => buildInitialRsvp(guest.existingRsvp));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const overnightAvailable = guest.overnightAvailable ?? 0;
  const overnightFull = overnightAvailable <= 0;
  const guestHasOvernight = guest.existingRsvp?.saturday_sleep === true;

  function handleOptionChange(key) {
    if (key === 'saturday_sleep' && overnightFull && !guestHasOvernight) return;
    setRsvp((prev) => {
      const next = { ...prev };
      for (const opt of RSVP_OPTIONS) {
        next[opt.key] = opt.key === key;
      }
      return next;
    });
  }

  function handleFieldChange(field, value) {
    setRsvp((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const selected = getSelectedOption(rsvp);
    if (!selected) {
      setError('Παρακαλώ επέλεξε μία από τις δύο επιλογές.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await submitRsvp(guest.phone, guest.guestId, rsvp);
      onSubmitted(rsvp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedOption = getSelectedOption(rsvp);

  return (
    <section className="rsvp-form card">
      <header className="rsvp-form__header">
        <p className="rsvp-form__greeting">
          Γεια σου, <strong>{guest.name}</strong>! 👋
        </p>
        {isUpdate && (
          <p className="message message--info">
            Έχεις ήδη απαντήσει — μπορείς να ενημερώσεις την απάντησή σου.
          </p>
        )}
      </header>

      <form onSubmit={handleSubmit}>
        <fieldset className="rsvp-form__options">
          <legend>Πώς θα έρθεις;</legend>

          {RSVP_OPTIONS.map((option) => {
            const isOvernight = option.key === 'saturday_sleep';
            const disabled = loading || (isOvernight && overnightFull && !guestHasOvernight);

            return (
              <label
                key={option.key}
                className={`radio-row${disabled ? ' radio-row--disabled' : ''}`}
              >
                <input
                  type="radio"
                  name="attendance"
                  checked={selectedOption === option.key}
                  onChange={() => handleOptionChange(option.key)}
                  disabled={disabled}
                />
                <span className="radio-row__label">
                  {option.label}
                  {isOvernight && overnightFull && !guestHasOvernight && (
                    <span className="radio-row__full"> — Πλήρες</span>
                  )}
                  {isOvernight && !overnightFull && (
                    <span className="radio-row__spots">
                      {' '}({overnightAvailable} {overnightAvailable === 1 ? 'θέση' : 'θέσεις'} απομένουν)
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </fieldset>

        <p className="rsvp-form__price-note">
          * Οι τιμές ενδέχεται να αλλάξουν ανάλογα με το ενδιαφέρον.
        </p>

        <div className="rsvp-form__field">
          <label htmlFor="allergies">Αλλεργίες / διατροφικές προτιμήσεις</label>
          <textarea
            id="allergies"
            rows={2}
            placeholder="π.χ. χωρίς γλουτένη, χορτοφαγικός…"
            value={rsvp.allergies}
            onChange={(e) => handleFieldChange('allergies', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="rsvp-form__field">
          <label htmlFor="notes">Σημειώσεις (προαιρετικά)</label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Οτιδήποτε άλλο θέλεις να μας πεις…"
            value={rsvp.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <p className="message message--error" role="alert">
            {error}
          </p>
        )}

        <div className="rsvp-form__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onBack}
            disabled={loading}
          >
            Πίσω
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Αποστολή…' : isUpdate ? 'Ενημέρωση' : 'Υποβολή'}
          </button>
        </div>
      </form>
    </section>
  );
}
