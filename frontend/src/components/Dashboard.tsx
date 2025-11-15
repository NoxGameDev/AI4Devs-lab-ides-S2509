import React, { useState, useEffect } from 'react';
import CandidateForm from './CandidateForm';
import { getCurrentUser, logout } from '../services/authService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000); // Clear message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleCandidateAdded = () => {
    setSuccessMessage('Candidate added successfully!');
    setShowForm(false);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>LTI - Talent Tracking System</h1>
            <p className="dashboard-subtitle">Recruiter Dashboard</p>
          </div>
          {user && (
            <div className="user-info">
              <span className="user-name">{user.name || user.email}</span>
              <button onClick={handleLogout} className="btn-logout" aria-label="Logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-main">
        {successMessage && (
          <div className="dashboard-message success-message" role="alert">
            {successMessage}
          </div>
        )}
        
        <div className="dashboard-actions">
          <button
            className="btn-add-candidate"
            onClick={() => {
              setShowForm(true);
              setSuccessMessage(null); // Clear any existing message when opening form
            }}
            aria-label="Add new candidate"
          >
            ➕ Add Candidate
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <CandidateForm 
              onSuccess={handleCandidateAdded}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {!showForm && (
          <div className="dashboard-welcome">
            <p>Welcome to the ATS system. Click "Add Candidate" to register a new candidate.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

