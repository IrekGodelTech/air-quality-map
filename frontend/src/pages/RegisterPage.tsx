import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await register({ username, email, password });
      navigate('/');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '30px', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Register</h2>
        {error && <div style={{ color: '#dc3545', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', marginBottom: '10px', backgroundColor: '#007bff', color: 'white', fontWeight: '500' }}>
            Register
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '12px', backgroundColor: '#6c757d', color: 'white', fontWeight: '500' }}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
