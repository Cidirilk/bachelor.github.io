import { useState } from 'react';
import { fetchAdminData } from '../api';
import { RSVP_OPTIONS, DRINK_OPTIONS } from '../constants';
import './Admin.css';

function downloadCsv(rows, filename) {
  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getAttendanceLabel(rsvp) {
  if (!rsvp) return 'Δεν απάντησε';
  const opt = RSVP_OPTIONS.find((o) => rsvp[o.key]);
  return opt ? opt.label : 'Δεν επέλεξε';
}

function getDrinksLabel(rsvp) {
  if (!rsvp) return '—';
  const drinks = DRINK_OPTIONS.filter((d) => rsvp[d.key]).map((d) => d.label);
  return drinks.length > 0 ? drinks.join(', ') : '—';
}

function buildCsv(guests) {
  const headers = [
    'Όνομα',
    'Επιλογή',
    'Ποτά',
    'Αλλεργίες',
    'Σημειώσεις',
    'Ενημερώθηκε',
  ];

  const rows = guests.map((g) => {
    const r = g.rsvp || {};
    return [
      g.name,
      getAttendanceLabel(g.rsvp),
      getDrinksLabel(g.rsvp),
      r.allergies || '',
      r.notes || '',
      r.updated_at || '',
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}

export default function Admin() {
  const [secret, setSecret] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLoad(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await fetchAdminData(secret);
      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!data?.guests) return;
    downloadCsv(buildCsv(data.guests), 'rsvp-export.csv');
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <h1>Admin — RSVP</h1>
        <a href="#" className="admin__back" onClick={() => (window.location.hash = '')}>
          ← Πίσω στο RSVP
        </a>
      </header>

      {!data && (
        <section className="admin__login card">
          <p>Εισάγετε το admin secret για να δείτε τις απαντήσεις.</p>
          <form onSubmit={handleLoad}>
            <input
              type="password"
              placeholder="Admin secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Φόρτωση…' : 'Είσοδος'}
            </button>
          </form>
          {error && <p className="message message--error">{error}</p>}
        </section>
      )}

      {data && (
        <>
          <section className="admin__totals card">
            <h2>Σύνολα</h2>
            <ul className="admin__totals-list">
              {RSVP_OPTIONS.map((o) => (
                <li key={o.key}>
                  <span>{o.label}</span>
                  <strong>{data.totals[o.key] ?? 0}</strong>
                </li>
              ))}
            </ul>
            <h3 className="admin__drink-title">Ποτά</h3>
            <ul className="admin__totals-list">
              {DRINK_OPTIONS.map((d) => (
                <li key={d.key}>
                  <span>{d.label}</span>
                  <strong>{data.totals[d.key] ?? 0}</strong>
                </li>
              ))}
            </ul>
            <p className="admin__summary">
              Απάντησαν: <strong>{data.respondedCount}</strong> /{' '}
              <strong>{data.totalGuests}</strong>
            </p>
          </section>

          <section className="admin__guests card">
            <div className="admin__guests-header">
              <h2>Απαντήσεις ανά άτομο</h2>
              <button type="button" className="btn btn--secondary" onClick={handleExport}>
                Εξαγωγή CSV
              </button>
            </div>

            <div className="admin__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Όνομα</th>
                    <th>Επιλογή</th>
                    <th>Ποτά</th>
                    <th>Αλλεργίες</th>
                  </tr>
                </thead>
                <tbody>
                  {data.guests.map((g) => {
                    const r = g.rsvp || {};
                    return (
                      <tr key={g.id} className={!g.rsvp ? 'admin__no-response' : ''}>
                        <td>{g.name}</td>
                        <td>{getAttendanceLabel(g.rsvp)}</td>
                        <td>{getDrinksLabel(g.rsvp)}</td>
                        <td className="admin__allergies">{r.allergies || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <button
            type="button"
            className="btn btn--ghost admin__refresh"
            onClick={() => handleLoad({ preventDefault: () => {} })}
            disabled={loading}
          >
            Ανανέωση
          </button>
        </>
      )}
    </div>
  );
}
