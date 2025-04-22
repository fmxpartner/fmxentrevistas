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
        candidateName: email,
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

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f6f8 0%, #e0e0e0 100%)',
      fontFamily: "'Roboto', sans-serif",
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        width: '500px',
        maxWidth: '90%',
        textAlign: 'center',
        border: '1px solid #e0e0e0',
      }}>
        {!isValidated ? (
          <>
            <h2 style={{
              fontSize: '28px',
              color: '#2c3e50',
              marginBottom: '20px',
              fontWeight: '600',
            }}>
              Validate Your Email
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '20px',
            }}>
              Please enter your email to validate and proceed to scheduling:
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '20px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2c3e50'}
              onBlur={(e) => e.target.style.borderColor = '#ccc'}
            />
            {error && <p style={{ color: '#ff4d4f', marginBottom: '20px', fontSize: '14px' }}>{error}</p>}
            <button
              onClick={handleValidateEmail}
              style={{
                background: '#2c3e50',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background 0.3s ease, transform 0.1s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = '#34495e'}
              onMouseLeave={(e) => e.target.style.background = '#2c3e50'}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
              Validate Email
            </button>
          </>
        ) : (
          <>
            <h2 style={{
              fontSize: '28px',
              color: '#2c3e50',
              marginBottom: '20px',
              fontWeight: '600',
            }}>
              FMX Consultoria
            </h2>
            {availableSlots.length > 0 ? (
              <div>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '20px',
                }}>
                  Select a date for your interview:
                </p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {availableSlots.map((slot, index) => (
                    <li key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: selectedDate === slot.start ? '#e6f4ea' : '#f9f9f9',
                      padding: '15px',
                      margin: '10px 0',
                      borderRadius: '8px',
                      border: `1px solid ${selectedDate === slot.start ? '#0FBC49' : '#e0e0e0'}`,
                      transition: 'all 0.3s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedDate === slot.start}
                          onChange={() => handleDateSelection(slot)}
                          disabled={selectedDate && selectedDate !== slot.start}
                          style={{ marginRight: '15px', cursor: 'pointer' }}
                        />
                        <span style={{
                          fontSize: '16px',
                          color: '#333',
                          fontWeight: '500',
                        }}>
                          {formatDateTime(slot.start).split(',')[0]} - Das {formatDateTime(slot.start).split(',')[1]} às {formatDateTime(slot.end).split(',')[1]} ({slot.type === 'online' ? 'Online' : 'In-Person'})
                        </span>
                      </div>
                      {selectedDate === slot.start && (
                        <button onClick={handleEditDate} style={{
                          background: '#ff4d4f',
                          color: 'white',
                          border: 'none',
                          padding: '8px 15px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#e63946'}
                        onMouseLeave={(e) => e.target.style.background = '#ff4d4f'}
                        >
                          Edit
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {selectedDate && (
                  <p style={{ color: '#0FBC49', marginTop: '20px', fontSize: '16px', fontWeight: '500' }}>
                    Interview scheduled successfully!
                  </p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '16px', color: '#666' }}>No interview slots available at the moment.</p>
            )}
            {error && <p style={{ color: '#ff4d4f', marginTop: '20px', fontSize: '14px' }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default App;