import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    console.warn('Role mismatch:', { userRole: user.role, requiredRole: role });
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    switch (user.role) {
      case 'student': return <Navigate to="/student" />;
      case 'warden': return <Navigate to="/warden" />;
      case 'admin': return <Navigate to="/admin" />;
      default: return <Navigate to="/login" />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={getDashboard()} />
      
      <Route
        path="/student/*"
        element={
          <PrivateRoute role="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/warden/*"
        element={
          <PrivateRoute role="warden">
            <WardenDashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/admin/*"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      
      {/* Catch-all route for debugging */}
      <Route path="*" element={
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>404 - Page Not Found</h2>
          <p>User: {user ? user.name : 'Not logged in'}</p>
          <a href="/">Go Home</a>
        </div>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;