# Ticket 2: Backend - Candidate Registration Processing

## Description
Develop the backend to process and store candidate information submitted from the registration form.

## Requirements

### API Endpoint
- Create endpoint to receive candidate registration data
- Accept the following fields:
  * First name
  * Last name
  * Email
  * Phone
  * Address
  * Education
  * Work experience
  * Resume file (PDF or DOCX)

### Data Processing
- Validate the submitted information:
  * Email format validation
  * Required fields validation
- Store candidate information in the database
- Store uploaded resume file

### Response Handling
- Return success response when candidate is added successfully
- Return error response with informative message when errors occur

## Acceptance Criteria
- [ ] API endpoint receives all required candidate fields
- [ ] Email format is validated on the backend
- [ ] Required fields are validated on the backend
- [ ] Candidate data is stored in the database
- [ ] Resume file is stored in the system
- [ ] Success response is returned upon successful registration
- [ ] Clear error messages are returned when validation fails or errors occur
