import React, { useState, useEffect } from 'react';
import { db, doc, setDoc, getDoc } from './firebase/firebase';

function App() {
  const [email, setEmail] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState('');

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
      // Redirecionar para a página de candidatos
      window.location.href = `http://localhost:3000/people/candidates`;
    } catch (error) {
      console.error('Error validating email:', error);
      setError('Error validating email. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f6f8' }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center' }}>
        <h2>Validate Your Email</h2>
        {isValidated ? (
          <div>
            <p>Email <strong>{email}</strong> has been validated.</p>
            <p>Click below to schedule your interview:</p>
            <a
              href="http://localhost:3000/people/candidates"
              style={{
                display: 'inline-block',
                background: '#2c3e50',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = '#34495e'}
              onMouseLeave={(e) => e.target.style.background = '#2c3e50'}
            >
              Go to Scheduling
            </a>
          </div>
        ) : (
          <div>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;