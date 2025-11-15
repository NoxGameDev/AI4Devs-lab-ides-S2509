import React, { useState } from 'react';
import { login, register } from '../services/authService';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (isRegistering && !formData.name.trim()) {
      newErrors.name = 'Name is required for registration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await register(formData.email, formData.password, formData.name);
        setSubmitMessage({ type: 'success', text: 'Registration successful! Logging you in...' });
      } else {
        await login(formData.email, formData.password);
        setSubmitMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      }

      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (error: any) {
      setSubmitMessage({ 
        type: 'error', 
        text: error.message || (isRegistering ? 'Registration failed' : 'Login failed') 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>LTI - Talent Tracking System</h1>
        <h2>{isRegistering ? 'Create Account' : 'Recruiter Login'}</h2>
        <p className="login-subtitle">
          {isRegistering 
            ? 'Create a new recruiter account to access the ATS system'
            : 'Sign in to access the candidate management system'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {submitMessage && (
            <div className={`message ${submitMessage.type}`} role="alert">
              {submitMessage.text}
            </div>
          )}

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <span id="name-error" className="error-message" role="alert">
                  {errors.name}
                </span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isRegistering ? 'Registering...' : 'Logging in...')
              : (isRegistering ? 'Register' : 'Login')
            }
          </button>

          <button
            type="button"
            className="btn-toggle-mode"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrors({});
              setSubmitMessage(null);
            }}
            disabled={isSubmitting}
          >
            {isRegistering 
              ? 'Already have an account? Login'
              : "Don't have an account? Register"
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

