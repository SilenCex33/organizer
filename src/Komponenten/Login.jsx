import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [passwort, setPasswort] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authentifizierung des Benutzers
      const userCredential = await signInWithEmailAndPassword(auth, email, passwort);
      const user = userCredential.user;

      // Hole die Rolle des Benutzers aus Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userRole = userData.role ? userData.role.trim().toLowerCase() : '';

        // Rolle an App.jsx weitergeben
        onLogin(userRole);

        // Weiterleitung je nach Rolle
        if (userRole === 'admin') {
          navigate('/dashboards/admin-dashboard');
        } else if (userRole === 'editor') {
          navigate('/editor-dashboard');
        } else if (userRole === 'user') {
          navigate('/user-dashboard');
        } else {
          setError('Unbekannte Rolle');
        }
      } else {
        setError('Benutzerdaten nicht gefunden.');
      }
    } catch (err) {
      setError('Login fehlgeschlagen: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="w-80 p-6 bg-white rounded-xl shadow-md flex flex-col items-center space-y-4 border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800">Login</h1>
      <form className="w-full flex flex-col space-y-4" onSubmit={handleLogin}>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            placeholder="deine@mail.de"
            className="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Passwort</label>
          <input
            type="password"
            placeholder="••••••••"
            className="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={passwort}
            autoComplete="current-password"
            onChange={(e) => setPasswort(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-400 text-right cursor-not-allowed select-none">
          Passwort vergessen?
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Wird geladen…' : 'Einloggen'}
        </button>
      </form>
    </div>
  );
}

export default Login;
