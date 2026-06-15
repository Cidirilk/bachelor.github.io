import { useState } from 'react';
import { normalizePhone, isValidCyprusMobile } from '../utils/phone';
import { validatePhone } from '../api';
import './PhoneGate.css';

export default function PhoneGate({ onValidated }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const normalized = normalizePhone(phone);
    if (!isValidCyprusMobile(normalized)) {
      setError('Παρακαλώ εισάγετε έγκυρο κυπριακό κινητό (8 ψηφία).');
      return;
    }

    setLoading(true);
    try {
      const result = await validatePhone(normalized);
      onValidated({
        guestId: result.guestId,
        name: result.name,
        phone: normalized,
        existingRsvp: result.existingRsvp || null,
        overnightAvailable: result.overnightAvailable,
        overnightLimit: result.overnightLimit,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="phone-gate card">
      <div className="phone-gate__icon" aria-hidden="true">
        📱
      </div>
      <h2>Καλώς ήρθες!</h2>
      <p className="phone-gate__hint">
        Για να συνεχίσεις, βάλε το κινητό σου. Μόνο μέλη της παρέας μπορούν να
        απαντήσουν.
      </p>

      <form onSubmit={handleSubmit} className="phone-gate__form">
        <label htmlFor="phone" className="sr-only">
          Αριθμός κινητού
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="π.χ. 99 123456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Έλεγχος…' : 'Συνέχεια'}
        </button>
      </form>

      {error && (
        <p className="message message--error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
