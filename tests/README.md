# Playwright E2E Tests

This directory contains comprehensive end-to-end tests for the SACCO ERP system using Playwright.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
npm run test:install
\`\`\`

2. Setup test environment:
\`\`\`bash
npm run setup
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Running Tests

### All tests
\`\`\`bash
npm run test:e2e
\`\`\`

### With UI mode
\`\`\`bash
npm run test:e2e:ui
\`\`\`

### Headed mode (see browser)
\`\`\`bash
npm run test:e2e:headed
\`\`\`

### Debug mode
\`\`\`bash
npm run test:e2e:debug
\`\`\`

### View test report
\`\`\`bash
npm run test:e2e:report
\`\`\`

## Test Structure

- `tests/e2e/` - End-to-end test files
- `tests/page-objects/` - Page Object Model classes
- `tests/utils/` - Test utilities and helpers
- `tests/fixtures/` - Test data fixtures
- `tests/setup/` - Global setup and teardown

## Test Coverage

### Authentication
- Login with valid/invalid credentials
- Logout functionality
- Session management
- Protected route access

### Members Management
- View members list
- Add new members
- Search and filter members
- Member profile management
- Contribution recording

### Loan Management
- Loan application process
- Loan approval workflow
- Loan disbursement
- Repayment tracking
- Loan calculations

### Contributions
- Manual contribution recording
- M-Pesa payment integration
- Contribution history
- Payment validation

### Dashboard
- Statistics display
- Recent activities
- Navigation
- Mobile responsiveness

### Reports
- Balance sheet generation
- Profit & loss reports
- PDF export functionality
- Date range filtering

## Best Practices

1. **Page Object Model**: Use page objects for better maintainability
2. **Test Data**: Use fixtures for consistent test data
3. **Authentication**: Use auth helpers for login/logout
4. **Database**: Clean setup and teardown for each test
5. **Assertions**: Use meaningful assertions with proper waits
6. **Mobile Testing**: Include mobile viewport testing
7. **CI/CD**: Automated testing in GitHub Actions

## Debugging

1. Use `--debug` flag to step through tests
2. Use `--headed` to see browser actions
3. Check screenshots and videos in `test-results/`
4. Use `page.pause()` to pause execution
5. Enable trace viewer for detailed debugging
