import { useState } from 'react';
import { RSVP_OPTIONS, EMPTY_RSVP } from '../constants';
import { submitRsvp } from '../api';
import bachelorHero from '../assets/bachelor-hero.png';
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

export default function RsvpForm({ guest, onSubmitted, onBack }) {
  const isUpdate = Boolean(guest.existingRsvp);
  const [rsvp, setRsvp] = useState(() => buildInitialRsvp(guest.existingRsvp));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleOption(key) {
    setRsvp((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleFieldChange(field, value) {
    setRsvp((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
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

  // Group options by day for clearer layout
  const days = [...new Set(RSVP_OPTIONS.map((o) => o.day))];

  return (
    <section className="rsvp-form card">
      <header className="rsvp-form__header">
        <img
          src={bachelorHero}
          alt="Bachelor party"
          className="rsvp-form__hero"
        />
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
          <legend>Τι θα παρευρεθείς;</legend>

          {days.map((day) => (
            <div key={day} className="rsvp-form__day-group">
              <h3 className="rsvp-form__day">{day}</h3>
              {RSVP_OPTIONS.filter((o) => o.day === day).map((option) => (
                <label key={option.key} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={rsvp[option.key]}
                    onChange={() => toggleOption(option.key)}
                    disabled={loading}
                  />
                  <span className="checkbox-row__label">{option.label}</span>
                </label>
              ))}
            </div>
          ))}
        </fieldset>

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
