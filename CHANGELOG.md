# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-03-19

### Added
- Initial project setup with Create React App and TypeScript
- Installed core dependencies:
  - @react-google-maps/api for Google Maps integration
  - @mui/material and related packages for UI components
  - react-router-dom for routing
  - axios for API calls
  - formik and yup for form handling and validation
  - @mui/x-date-pickers for date selection
  - date-fns for date manipulation
- Created basic project structure with directories for components, pages, services, utils, types, assets, hooks, and context
- Implemented theme configuration with Material-UI
- Created Layout component with navigation bar and footer
- Implemented basic routing setup
- Created Dashboard page with:
  - Welcome message
  - Action cards for main features
  - Responsive grid layout
  - Navigation to key sections
- Implemented Login page with:
  - Form validation using Formik and Yup
  - Material-UI components
  - Error handling
  - Navigation to signup page
  - Responsive design
- Implemented SignUp page with:
  - Form validation using Formik and Yup
  - Password strength requirements
  - Password confirmation
  - Material-UI components
  - Error handling
  - Navigation to login page
  - Responsive design
- Implemented Trip Planner page with:
  - Destination input
  - Multiple interests selection
  - Budget slider
  - Date range picker
  - Form validation
  - Responsive layout
  - Navigation to map view

### Project Structure
- Created basic React application structure
- Set up TypeScript configuration
- Prepared for implementation of authentication and main features
- Implemented responsive layout with Material-UI components
- Added form validation setup with Formik and Yup
- Implemented authentication flow between login and signup pages
- Added date handling with @mui/x-date-pickers and date-fns
