import React, { useState, useEffect, useRef } from 'react';
import './CandidateForm.css';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  workExperience: string;
  resume: File | null;
}

interface FormErrors {
  [key: string]: string;
}

interface CandidateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    workExperience: '',
    resume: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Autocomplete state
  const [educationSuggestions, setEducationSuggestions] = useState<string[]>([]);
  const [experienceSuggestions, setExperienceSuggestions] = useState<string[]>([]);
  const [showEducationSuggestions, setShowEducationSuggestions] = useState(false);
  const [showExperienceSuggestions, setShowExperienceSuggestions] = useState(false);
  
  const educationInputRef = useRef<HTMLInputElement>(null);
  const experienceInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchEducationSuggestions = async () => {
      if (formData.education.trim().length > 0) {
        try {
          const { authenticatedFetch } = await import('../services/authService');
          const response = await authenticatedFetch(
            `http://localhost:3010/api/candidates/autocomplete/education?q=${encodeURIComponent(formData.education)}`
          );
          if (response.ok) {
            const data = await response.json();
            setEducationSuggestions(data.suggestions || []);
            setShowEducationSuggestions(data.suggestions?.length > 0);
          }
        } catch (error) {
          // Silently fail - autocomplete is optional
        }
      } else {
        setEducationSuggestions([]);
        setShowEducationSuggestions(false);
      }
    };

    const fetchExperienceSuggestions = async () => {
      if (formData.workExperience.trim().length > 0) {
        try {
          const { authenticatedFetch } = await import('../services/authService');
          const response = await authenticatedFetch(
            `http://localhost:3010/api/candidates/autocomplete/workExperience?q=${encodeURIComponent(formData.workExperience)}`
          );
          if (response.ok) {
            const data = await response.json();
            setExperienceSuggestions(data.suggestions || []);
            setShowExperienceSuggestions(data.suggestions?.length > 0);
          }
        } catch (error) {
          // Silently fail - autocomplete is optional
        }
      } else {
        setExperienceSuggestions([]);
        setShowExperienceSuggestions(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchEducationSuggestions();
      fetchExperienceSuggestions();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [formData.education, formData.workExperience]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.education.trim()) {
      newErrors.education = 'Education is required';
    }

    if (!formData.workExperience.trim()) {
      newErrors.workExperience = 'Work experience is required';
    }

    if (formData.resume) {
      const fileExtension = formData.resume.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'pdf' && fileExtension !== 'docx') {
        newErrors.resume = 'Resume must be a PDF or DOCX file';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, resume: file }));
    if (errors.resume) {
      setErrors((prev) => ({ ...prev, resume: '' }));
    }
  };

  const handleSuggestionClick = (field: 'education' | 'workExperience', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowEducationSuggestions(false);
    setShowExperienceSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send FormData with file upload support
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('workExperience', formData.workExperience);
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      const { authenticatedFetch } = await import('../services/authService');
      const response = await authenticatedFetch('http://localhost:3010/api/candidates', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        // Clear form data on success
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          education: '',
          workExperience: '',
          resume: null,
        });
        setErrors({});
        
        // Show success message briefly, then close form
        setSubmitMessage({ type: 'success', text: 'Candidate added successfully!' });
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        const errorData = await response.json();
        setSubmitMessage({ 
          type: 'error', 
          text: errorData.error || 'Failed to add candidate. Please try again.' 
        });
      }
    } catch (error) {
      setSubmitMessage({ 
        type: 'error', 
        text: 'Failed to connect to server. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="candidate-form-container">
      <h2>Add New Candidate</h2>
      <form onSubmit={handleSubmit} className="candidate-form" noValidate>
        {submitMessage && (
          <div className={`message ${submitMessage.type}`} role="alert">
            {submitMessage.text}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error' : ''}
              aria-required="true"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <span id="firstName-error" className="error-message" role="alert">
                {errors.firstName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              Last Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error' : ''}
              aria-required="true"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <span id="lastName-error" className="error-message" role="alert">
                {errors.lastName}
              </span>
            )}
          </div>
        </div>

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
          <label htmlFor="phone">
            Phone <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <span id="phone-error" className="error-message" role="alert">
              {errors.phone}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address">
            Address <span className="required">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={errors.address ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? 'address-error' : undefined}
          />
          {errors.address && (
            <span id="address-error" className="error-message" role="alert">
              {errors.address}
            </span>
          )}
        </div>

        <div className="form-group autocomplete-group">
          <label htmlFor="education">
            Education <span className="required">*</span>
          </label>
          <input
            ref={educationInputRef}
            type="text"
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className={errors.education ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.education}
            aria-describedby={errors.education ? 'education-error' : undefined}
            aria-autocomplete="list"
            aria-expanded={showEducationSuggestions}
          />
          {errors.education && (
            <span id="education-error" className="error-message" role="alert">
              {errors.education}
            </span>
          )}
          {showEducationSuggestions && educationSuggestions.length > 0 && (
            <ul className="suggestions-list" role="listbox">
              {educationSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  role="option"
                  onClick={() => handleSuggestionClick('education', suggestion)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSuggestionClick('education', suggestion);
                    }
                  }}
                  tabIndex={0}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group autocomplete-group">
          <label htmlFor="workExperience">
            Work Experience <span className="required">*</span>
          </label>
          <textarea
            ref={experienceInputRef}
            id="workExperience"
            name="workExperience"
            value={formData.workExperience}
            onChange={handleChange}
            rows={4}
            className={errors.workExperience ? 'error' : ''}
            aria-required="true"
            aria-invalid={!!errors.workExperience}
            aria-describedby={errors.workExperience ? 'workExperience-error' : undefined}
            aria-autocomplete="list"
            aria-expanded={showExperienceSuggestions}
          />
          {errors.workExperience && (
            <span id="workExperience-error" className="error-message" role="alert">
              {errors.workExperience}
            </span>
          )}
          {showExperienceSuggestions && experienceSuggestions.length > 0 && (
            <ul className="suggestions-list" role="listbox">
              {experienceSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  role="option"
                  onClick={() => handleSuggestionClick('workExperience', suggestion)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSuggestionClick('workExperience', suggestion);
                    }
                  }}
                  tabIndex={0}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="resume">
            Resume (PDF or DOCX)
          </label>
          <input
            type="file"
            id="resume"
            name="resume"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className={errors.resume ? 'error' : ''}
            aria-invalid={!!errors.resume}
            aria-describedby={errors.resume ? 'resume-error' : undefined}
          />
          {formData.resume && (
            <span className="file-name">{formData.resume.name}</span>
          )}
          {errors.resume && (
            <span id="resume-error" className="error-message" role="alert">
              {errors.resume}
            </span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Add Candidate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateForm;

