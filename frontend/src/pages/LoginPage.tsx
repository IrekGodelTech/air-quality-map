import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '30px', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>
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
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', marginBottom: '10px', backgroundColor: '#007bff', color: 'white', fontWeight: '500' }}>
            Login
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/register')}
            style={{ width: '100%', padding: '12px', backgroundColor: '#6c757d', color: 'white', fontWeight: '500' }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
