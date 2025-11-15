import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { isAuthenticated } from './services/authService';
import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check authentication status on mount
    setAuthenticated(isAuthenticated());
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1a1a1a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard />;
}

export default App;
