import { useState } from 'react';
import PhoneGate from './components/PhoneGate';
import RsvpForm from './components/RsvpForm';
import Confirmation from './components/Confirmation';
import Admin from './components/Admin';
import './App.css';

// Steps: phone → form → confirmation
const STEPS = { PHONE: 'phone', FORM: 'form', CONFIRM: 'confirm' };

export default function App() {
  const [step, setStep] = useState(STEPS.PHONE);
  const [guest, setGuest] = useState(null);
  const [submittedRsvp, setSubmittedRsvp] = useState(null);

  // Admin view via URL hash: #admin
  const isAdmin = window.location.hash === '#admin';

  function handleValidated(data) {
    setGuest(data);
    setStep(STEPS.FORM);
  }

  function handleSubmitted(rsvp) {
    setSubmittedRsvp(rsvp);
    setStep(STEPS.CONFIRM);
  }

  function handleEdit() {
    setStep(STEPS.FORM);
  }

  function handleBack() {
    setGuest(null);
    setSubmittedRsvp(null);
    setStep(STEPS.PHONE);
  }

  if (isAdmin) {
    return (
      <div className="app">
        <Admin />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="hero">
        <p className="hero__badge">Οι κουμπάροι σας καλούν</p>
        <h1 className="hero__title">Μάζωξη πριν τον γάμο</h1>
        <p className="hero__dates">
          Παρασκευή 28 · Σάββατο 29 · Κυριακή πρωί 30 Αυγούστου
        </p>
      </header>

      <main className="main">
        {step === STEPS.PHONE && <PhoneGate onValidated={handleValidated} />}
        {step === STEPS.FORM && guest && (
          <RsvpForm guest={guest} onSubmitted={handleSubmitted} onBack={handleBack} />
        )}
        {step === STEPS.CONFIRM && guest && submittedRsvp && (
          <Confirmation guest={guest} rsvp={submittedRsvp} onEdit={handleEdit} />
        )}
      </main>

      <footer className="footer">
        <p>Με αγάπη, οι κουμπάροι 💍</p>
      </footer>
    </div>
  );
}
