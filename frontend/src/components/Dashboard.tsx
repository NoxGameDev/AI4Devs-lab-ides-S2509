import React, { useState } from 'react';
import CandidateForm from './CandidateForm';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>LTI - Talent Tracking System</h1>
        <p className="dashboard-subtitle">Recruiter Dashboard</p>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-actions">
          <button
            className="btn-add-candidate"
            onClick={() => setShowForm(true)}
            aria-label="Add new candidate"
          >
            ➕ Add Candidate
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <CandidateForm 
              onSuccess={() => {
                setShowForm(false);
                // Could show a success notification here
              }}
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

