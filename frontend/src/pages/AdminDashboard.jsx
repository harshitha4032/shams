import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/admin/Dashboard';
import ManageHostels from '../components/admin/ManageHostels';
import ManageRooms from '../components/admin/ManageRooms';
import ManageMesses from '../components/admin/ManageMesses';
import ManageMessMenu from '../components/admin/ManageMessMenu';
import WardenAttendance from '../components/admin/WardenAttendance';
import AssignWarden from '../components/admin/AssignWarden';
import WardenFloorAssignments from '../components/admin/WardenFloorAssignments';
import WardenLeaves from '../components/admin/WardenLeaves';
import MaintenanceReports from '../components/admin/MaintenanceReports';
import CreateNotice from '../components/admin/CreateNotice';
import MessAnalytics from '../components/admin/MessAnalytics';
import ManageStudentHostels from '../components/admin/ManageStudentHostels';
import HostelDetailsView from '../components/shared/HostelDetailsView';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <div>
          <h1 style={{ marginBottom: '2px' }}>SHAMS - Admin Portal</h1>
          <p style={{ fontSize: '12px', opacity: '0.9', margin: 0 }}>Smart Hostel & Accommodation Management</p>
        </div>
        <div className="navbar-links">
          <span>Welcome, {user?.name}</span>
          <Link to="/admin" onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/admin/hostels" onClick={() => setActiveTab('hostels')} className={activeTab === 'hostels' ? 'active' : ''}>
            Hostels
          </Link>
          <Link to="/admin/rooms" onClick={() => setActiveTab('rooms')} className={activeTab === 'rooms' ? 'active' : ''}>
            Rooms
          </Link>
          <Link to="/admin/student-hostels" onClick={() => setActiveTab('student-hostels')} className={activeTab === 'student-hostels' ? 'active' : ''}>
            Student Hostels
          </Link>
          <Link to="/admin/messes" onClick={() => setActiveTab('messes')} className={activeTab === 'messes' ? 'active' : ''}>
            Messes
          </Link>
          <Link to="/admin/mess-menu" onClick={() => setActiveTab('mess-menu')} className={activeTab === 'mess-menu' ? 'active' : ''}>
            Mess Menu
          </Link>
          <Link to="/admin/warden-attendance" onClick={() => setActiveTab('warden-attendance')} className={activeTab === 'warden-attendance' ? 'active' : ''}>
            Warden Attendance
          </Link>
          <Link to="/admin/warden-leaves" onClick={() => setActiveTab('leaves')} className={activeTab === 'leaves' ? 'active' : ''}>
            Warden Leaves
          </Link>
          <Link to="/admin/warden-floor-assignments" onClick={() => setActiveTab('warden-floor-assignments')} className={activeTab === 'warden-floor-assignments' ? 'active' : ''}>
            Floor Assignments
          </Link>
          <Link to="/admin/maintenance" onClick={() => setActiveTab('maintenance')} className={activeTab === 'maintenance' ? 'active' : ''}>
            Maintenance
          </Link>
          <Link to="/admin/notices" onClick={() => setActiveTab('notices')} className={activeTab === 'notices' ? 'active' : ''}>
            Notices
          </Link>
          <Link to="/admin/mess-analytics" onClick={() => setActiveTab('mess')} className={activeTab === 'mess' ? 'active' : ''}>
            Mess
          </Link>
          <button onClick={handleLogout} className="btn btn-danger" style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hostels" element={<ManageHostels />} />
          <Route path="/hostels/:id/details" element={<HostelDetailsView userRole="admin" />} />
          <Route path="/rooms" element={<ManageRooms />} />
          <Route path="/student-hostels" element={<ManageStudentHostels />} />
          <Route path="/messes" element={<ManageMesses />} />
          <Route path="/mess-menu" element={<ManageMessMenu />} />
          <Route path="/warden-attendance" element={<WardenAttendance />} />
          
          <Route path="/warden-leaves" element={<WardenLeaves />} />
          <Route path="/warden-floor-assignments" element={<WardenFloorAssignments />} />
          <Route path="/maintenance" element={<MaintenanceReports />} />
          <Route path="/notices" element={<CreateNotice />} />
          <Route path="/mess-analytics" element={<MessAnalytics />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;