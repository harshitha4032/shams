# SHAMS Frontend

React frontend for the Student Hostel and Mess Management System.

## Features

### Student Portal
- Register and login
- Apply for hostel accommodation
- File complaints (plumbing, electricity, cleaning, etc.)
- Request leave
- View notices
- Submit mess feedback

### Warden Portal
- Manage student complaints
- Approve/reject leave requests
- Allocate rooms to students
- View mess feedback analytics

### Admin Portal
- View dashboard statistics
- Create and manage rooms
- Post notices
- View mess analytics

## Tech Stack
- React 18
- React Router DOM
- Axios
- Vite

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Variables
The frontend connects to the backend at `http://localhost:5000` via proxy configuration in vite.config.js.

## Default Credentials
Use the credentials created via backend seedAdmin.js for admin login.
