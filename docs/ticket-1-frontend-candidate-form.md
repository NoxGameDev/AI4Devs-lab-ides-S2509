# Ticket 1: Frontend - Candidate Registration Form UI

## Description
Implement the user interface for adding new candidates to the ATS system with a registration form.

## Requirements

### UI Components
- Create a clearly visible "Add Candidate" button/link on the recruiter's main dashboard
- Implement a registration form with the following required fields:
  * First name
  * Last name
  * Email
  * Phone
  * Address
  * Education
  * Work experience

### Validation
- Implement client-side validation:
  * Email must have a valid format
  * Required fields must not be left empty

### Document Upload
- Add file upload component for candidate resume
- Accept PDF and DOCX formats

### User Feedback
- Show confirmation message when candidate is added successfully
- Display informative and clear error messages in case of errors (e.g., server connection failure)

### Design Requirements
- Create an intuitive and easy-to-use interface to reduce learning curve for new recruiters
- Implement autocomplete for education and work experience fields using pre-existing data in the system
- Ensure the functionality is usable from different devices and browsers
- Follow accessibility best practices

## Acceptance Criteria
- [ ] "Add Candidate" button is clearly visible on the main dashboard
- [ ] Form includes all required fields (first name, last name, email, phone, address, education, work experience)
- [ ] Email validation checks for valid format
- [ ] Required fields cannot be submitted empty
- [ ] Resume upload accepts PDF or DOCX formats
- [ ] Success message displays after successful submission
- [ ] Clear error messages display when errors occur
- [ ] Autocomplete works for education and work experience fields
- [ ] Form works on different devices and browsers
- [ ] Form follows accessibility best practices
