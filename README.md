# SHAMS - Student Hostel and Mess Management System

A comprehensive full-stack web application for managing hostel operations, including room allocation, complaint management, leave requests, and mess feedback.

## Project Structure

```
shams/
├── backend/          # Node.js/Express backend
│   ├── config/       # Database configuration
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Auth & error handling
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── utils/        # Helper functions
└── frontend/         # React frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # Context providers
    │   ├── pages/       # Page components
    │   └── utils/       # Utilities
    └── public/
```

## Features

### Student Features
- User registration and authentication
- Apply for hostel accommodation
- File maintenance complaints (plumbing, electricity, cleaning, etc.)
- Request leave with date ranges
- View hostel notices
- Submit mess feedback and ratings

### Warden Features
- View and manage all complaints
- Update complaint status (pending, in-progress, resolved)
- Review and approve/reject leave requests
- Allocate rooms to students
- View mess feedback analytics

### Admin Features
- Dashboard with system statistics
- Create and manage hostel rooms
- Post notices to students and wardens
- View comprehensive mess analytics
- Monitor overall system usage

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads

### Frontend
- React 18
- React Router DOM v6
- Axios for API calls
- Context API for state management
- Vite as build tool

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

4. Seed admin user:
```bash
npm run seed:admin
```

5. Start backend server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Student Routes
- `POST /api/student/apply-hostel` - Apply for hostel
- `GET /api/student/complaints` - Get my complaints
- `POST /api/student/complaints` - File new complaint
- `GET /api/student/leaves` - Get my leave requests
- `POST /api/student/leaves` - Request leave
- `GET /api/student/notices` - Get notices
- `POST /api/mess/feedback` - Submit mess feedback

### Warden Routes
- `GET /api/warden/complaints` - Get all complaints
- `PATCH /api/warden/complaints/:id` - Update complaint status
- `GET /api/warden/leaves` - Get all leave requests
- `PATCH /api/warden/leaves/:id` - Approve/reject leave
- `POST /api/warden/rooms/allocate` - Allocate room to student
- `GET /api/mess/analytics` - View mess analytics

### Admin Routes
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/rooms` - Get all rooms
- `POST /api/admin/rooms` - Create new room
- `POST /api/admin/notices` - Create notice
- `GET /api/mess/analytics` - View mess analytics

## User Roles

1. **Student**: Can apply for hostel, file complaints, request leaves, view notices, give mess feedback
2. **Warden**: Can manage complaints, approve leaves, allocate rooms, view analytics
3. **Admin**: Full system access, manage rooms, post notices, view all statistics

## Default Admin Credentials

After running the seed script, use these credentials to login as admin:
- Email: admin@shams.com
- Password: admin123

(Check seedAdmin.js for actual credentials)

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

## Project Highlights

- Role-based authentication and authorization
- RESTful API design
- Responsive UI design
- Real-time data updates
- File upload support for complaints
- Comprehensive error handling
- Protected routes on both frontend and backend

## Future Enhancements

- Real-time notifications using Socket.io
- Email notifications for leave approvals
- Room availability calendar
- Mess menu management
- Payment integration for mess fees
- Mobile app support
- Image gallery for complaints
- Advanced analytics and reporting

## License

MIT

## Author

SHAMS Development Team
