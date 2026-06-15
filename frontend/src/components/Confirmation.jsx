import { RSVP_OPTIONS } from '../constants';
import './Confirmation.css';

export default function Confirmation({ guest, rsvp, onEdit }) {
  const selected = RSVP_OPTIONS.find((o) => rsvp[o.key]);

  return (
    <section className="confirmation card">
      <div className="confirmation__icon" aria-hidden="true">
        ✅
      </div>
      <h2>Ευχαριστούμε, {guest.name}!</h2>
      <p className="confirmation__subtitle">
        Η απάντησή σου καταχωρήθηκε. Μπορείς να την αλλάξεις οποιαδήποτε στιγμή.
      </p>

      {selected ? (
        <p className="confirmation__choice">
          📋 <strong>{selected.label}</strong>
        </p>
      ) : (
        <p className="confirmation__none">
          Δεν επέλεξες κάποια επιλογή — αν αλλάξει κάτι, ξαναμπες να
          ενημερώσεις!
        </p>
      )}

      {(rsvp.allergies || rsvp.notes) && (
        <div className="confirmation__extras">
          {rsvp.allergies && (
            <p>
              <strong>Αλλεργίες:</strong> {rsvp.allergies}
            </p>
          )}
          {rsvp.notes && (
            <p>
              <strong>Σημειώσεις:</strong> {rsvp.notes}
            </p>
          )}
        </div>
      )}

      <button type="button" className="btn btn--secondary" onClick={onEdit}>
        Επεξεργασία απάντησης
      </button>
    </section>
  );
}
