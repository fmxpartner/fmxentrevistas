import React, { useState, useEffect } from 'react';
import { db, doc, setDoc, getDoc, collection, getDocs } from './firebase/firebase';

function App() {
  const [email, setEmail] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Extrair parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setCandidateId(id);

    // Verificar se o e-mail já foi validado
    const checkValidation = async () => {
      if (id) {
        const validatedRef = doc(db, 'validatedEmails', id);
        const validatedDoc = await getDoc(validatedRef);
        if (validatedDoc.exists()) {
          setIsValidated(true);
          setEmail(validatedDoc.data().email);

          // Buscar as datas disponíveis
          const slotsSnapshot = await getDocs(collection(db, 'interviewSlots'));
          const slotsList = slotsSnapshot.docs.map((doc) => doc.data());
          setAvailableSlots(slotsList);

          // Verificar se o candidato já escolheu uma data
          const scheduledRef = doc(db, 'scheduledInterviews', id);
          const scheduledDoc = await getDoc(scheduledRef);
          if (scheduledDoc.exists()) {
            setSelectedDate(scheduledDoc.data().start);
          }
        }
      }
    };
    checkValidation();
  }, []);

  const handleValidateEmail = async () => {
    if (!email || !candidateId) {
      setError('Please provide a valid email and candidate ID.');
      return;
    }

    try {
      // Validar e-mail (simples validação de formato)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Invalid email format.');
        return;
      }

      // Salvar e-mail validado no Firestore
      await setDoc(doc(db, 'validatedEmails', candidateId), { email });
      setIsValidated(true);
      setError('');

      // Buscar as datas disponíveis após a validação
      const slotsSnapshot = await getDocs(collection(db, 'interviewSlots'));
      const slotsList = slotsSnapshot.docs.map((doc) => doc.data());
      setAvailableSlots(slotsList);
    } catch (error) {
      console.error('Error validating email:', error);
      setError('Error validating email. Please try again.');
    }
  };

  const handleDateSelection = async (slot) => {
    try {
      const interview = {
        candidateId,
        candidateName: email, // Podemos ajustar isso se você tiver o nome do candidato
        start: slot.start,
        end: slot.end,
        type: slot.type,
      };
      await setDoc(doc(db, 'scheduledInterviews', candidateId), interview);
      setSelectedDate(slot.start);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError('Error scheduling interview. Please try again.');
    }
  };

  const handleEditDate = async () => {
    try {
      await setDoc(doc(db, 'scheduledInterviews', candidateId), {});
      setSelectedDate(null);
    } catch (error) {
      console.error('Error clearing interview date:', error);
      setError('Error clearing interview date. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f6f8' }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center' }}>
        {!isValidated ? (
          <>
            <h2>Validate Your Email</h2>
            <p>Please enter your email to validate and proceed to scheduling:</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button
              onClick={handleValidateEmail}
              style={{
                background: '#2c3e50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = '#34495e'}
              onMouseLeave={(e) => e.target.style.background = '#2c3e50'}
            >
              Validate Email
            </button>
          </>
        ) : (
          <>
            <h2>FMX Consultoria</h2>
            {availableSlots.length > 0 ? (
              <div>
                <p>Select a date for your interview:</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {availableSlots.map((slot, index) => (
                    <li key={index} style={{ margin: '10px 0' }}>
                      <input
                        type="checkbox"
                        checked={selectedDate === slot.start}
                        onChange={() => handleDateSelection(slot)}
                        disabled={selectedDate && selectedDate !== slot.start}
                      />
                      {slot.type === 'online' ? 'Online' : 'In-Person'}: {new Date(slot.start).toLocaleString()} - {new Date(slot.end).toLocaleString()}
                      {selectedDate === slot.start && (
                        <button onClick={handleEditDate} style={{ marginLeft: '10px', background: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
                          Edit
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {selectedDate && (
                  <p style={{ color: '#0FBC49' }}>Interview scheduled successfully!</p>
                )}
              </div>
            ) : (
              <p>No interview slots available at the moment.</p>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default App; /* alterado */