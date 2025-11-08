import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ManageComplaints from '../components/warden/ManageComplaints';
import ManageLeaves from '../components/warden/ManageLeaves';
import RoomAllocation from '../components/warden/RoomAllocation';
import ManageHostelRequests from '../components/warden/ManageHostelRequests';
import MessAnalytics from '../components/warden/MessAnalytics';
import StudentAttendance from '../components/warden/StudentAttendance';
import FaceAttendance from '../components/warden/FaceAttendance';
import ManageHealthIssues from '../components/warden/ManageHealthIssues';
import ManageReturns from '../components/warden/ManageReturns';
import WardenMessFeedback from '../components/warden/MessFeedback';
import WardenFaceAttendance from '../components/warden/FaceAttendanceSelf';
import HostelDetails from '../components/warden/HostelDetails';
import HostelList from '../components/warden/HostelList';
import Leaves from '../components/student/Leaves';
import FaceRegistration from '../components/student/FaceRegistration';
import MessMenu from '../components/warden/MessMenu';

const WardenDashboard = () => {
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
          <h1 style={{ marginBottom: '2px' }}>SHAMS - Warden Portal</h1>
          <p style={{ fontSize: '12px', opacity: '0.9', margin: 0 }}>Smart Hostel & Accommodation Management</p>
        </div>
        <div className="navbar-links">
          <span>Welcome, {user?.name}</span>
          <Link to="/warden" onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}>
            Home
          </Link>
          <Link to="/warden/complaints" onClick={() => setActiveTab('complaints')} className={activeTab === 'complaints' ? 'active' : ''}>
            Complaints
          </Link>
          <Link to="/warden/leaves" onClick={() => setActiveTab('leaves')} className={activeTab === 'leaves' ? 'active' : ''}>
            Student Leaves
          </Link>
          <Link to="/warden/attendance" onClick={() => setActiveTab('attendance')} className={activeTab === 'attendance' ? 'active' : ''}>
            Attendance
          </Link>
          <Link to="/warden/face-attendance" onClick={() => setActiveTab('face-attendance')} className={activeTab === 'face-attendance' ? 'active' : ''}>
            Face Recognition
          </Link>
          <Link to="/warden/face-register" onClick={() => setActiveTab('face-register')} className={activeTab === 'face-register' ? 'active' : ''}>
            Face Register
          </Link>

          <Link to="/warden/health-issues" onClick={() => setActiveTab('health')} className={activeTab === 'health' ? 'active' : ''}>
            Health Issues
          </Link>
          <Link to="/warden/my-leaves" onClick={() => setActiveTab('my-leaves')} className={activeTab === 'my-leaves' ? 'active' : ''}>
            My Leaves
          </Link>
          <Link to="/warden/hostel-list" onClick={() => setActiveTab('hostel-list')} className={activeTab === 'hostel-list' ? 'active' : ''}>
            Hostel List
          </Link>
          <Link to="/warden/rooms" onClick={() => setActiveTab('rooms')} className={activeTab === 'rooms' ? 'active' : ''}>
            Room Allocation
          </Link>
          <Link to="/warden/hostel-requests" onClick={() => setActiveTab('hostel-requests')} className={activeTab === 'hostel-requests' ? 'active' : ''}>
            Hostel Requests
          </Link>
          <Link to="/warden/mess-analytics" onClick={() => setActiveTab('mess')} className={activeTab === 'mess' ? 'active' : ''}>
            Mess Analytics
          </Link>
          <Link to="/warden/mess-feedback" onClick={() => setActiveTab('mess-feedback')} className={activeTab === 'mess-feedback' ? 'active' : ''}>
            Mess Feedback
          </Link>
          <Link to="/warden/mess-menu" onClick={() => setActiveTab('mess-menu')} className={activeTab === 'mess-menu' ? 'active' : ''}>
            Mess Menu
          </Link>
          <Link to="/warden/face-attendance-self" onClick={() => setActiveTab('face-attendance-self')} className={activeTab === 'face-attendance-self' ? 'active' : ''}>
            Face Attendance
          </Link>
          <Link to="/warden/returns" onClick={() => setActiveTab('returns')} className={activeTab === 'returns' ? 'active' : ''}>
            Return Reports
          </Link>
          <button onClick={handleLogout} className="btn btn-danger" style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<WardenHome />} />
          <Route path="/complaints" element={<ManageComplaints />} />
          <Route path="/leaves" element={<ManageLeaves />} />
          <Route path="/attendance" element={<StudentAttendance />} />
          <Route path="/face-attendance" element={<FaceAttendance />} />
          <Route path="/face-register" element={<FaceRegistration />} />
          <Route path="/health-issues" element={<ManageHealthIssues />} />
          <Route path="/my-leaves" element={<Leaves />} />
          <Route path="/hostel-list" element={<HostelList />} />
          <Route path="/rooms" element={<RoomAllocation />} />
          <Route path="/hostel-requests" element={<ManageHostelRequests />} />
          <Route path="/hostel-details/:id" element={<HostelDetails />} />
          <Route path="/mess-analytics" element={<MessAnalytics />} />
          <Route path="/mess-feedback" element={<WardenMessFeedback />} />
          <Route path="/mess-menu" element={<MessMenu />} />
          <Route path="/face-attendance-self" element={<WardenFaceAttendance />} />
          <Route path="/returns" element={<ManageReturns />} />
        </Routes>
      </div>
    </div>
  );
};

const WardenHome = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h2>Warden Dashboard</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Manage hostel operations efficiently with real-time insights</p>
      
      <div className="grid grid-2" style={{ marginBottom: '20px', gap: '20px' }}>
        {/* Profile Card */}
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>👤 Your Profile</h3>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {user?.profilePhoto ? (
              <>
                <img 
                  src={user.profilePhoto} 
                  alt="Profile" 
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #667eea',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>📸 Profile Photo</p>
              </>
            ) : (
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: '64px',
                color: 'white'
              }}>
                👤
              </div>
            )}
          </div>
          
          <div style={{ lineHeight: '1.8' }}>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <span style={{ 
              padding: '4px 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>Warden</span></p>
            {user?.gender && (
              <p><strong>Gender:</strong> <span style={{ textTransform: 'capitalize' }}>{user.gender}</span></p>
            )}
            {user?.assignedHostel && (
              <p><strong>Assigned Hostel:</strong> {user.assignedHostel}</p>
            )}
            {user?.assignedFloor && (
              <p><strong>Assigned Floor:</strong> Floor {user.assignedFloor}</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>📊 Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ 
              padding: '15px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', opacity: 0.9 }}>Your Role</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Warden</p>
            </div>
            
            <div style={{ 
              padding: '15px', 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', opacity: 0.9 }}>Responsibilities</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Hostel Management</p>
            </div>
            
            <div style={{ 
              padding: '15px', 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', opacity: 0.9 }}>Access Level</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Full Control</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-3" style={{ marginTop: '30px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <h3>📋</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Complaint Management</p>
          <p style={{ fontSize: '12px', opacity: '0.9' }}>Track & Resolve Issues</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <h3>✅</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Leave Approvals</p>
          <p style={{ fontSize: '12px', opacity: '0.9' }}>Digital Workflow</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <h3>🏠</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Room Allocation</p>
          <p style={{ fontSize: '12px', opacity: '0.9' }}>Smart Assignment</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/warden/complaints" className="btn btn-primary">🔧 Manage Complaints</Link>
            <Link to="/warden/leaves" className="btn btn-primary">📅 Review Student Leaves</Link>
            <Link to="/warden/my-leaves" className="btn btn-primary">🏝️ Request My Leave</Link>
            <Link to="/warden/rooms" className="btn btn-primary">🏠 Allocate Rooms</Link>
            <Link to="/warden/mess-analytics" className="btn btn-primary">📊 View Mess Analytics</Link>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>📝 Responsibilities</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Review and update complaint status</li>
            <li>Approve/reject leave requests digitally</li>
            <li>Allocate rooms based on capacity & gender</li>
            <li>Monitor mess feedback and quality</li>
            <li>Generate hostel attendance reports</li>
            <li>Send notifications to students</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)' }}>
        <h3 style={{ color: '#f57f17', marginBottom: '10px' }}>🎯 Warden Dashboard Benefits</h3>
        <p style={{ color: '#f57f17', lineHeight: '1.6' }}>
          Streamline daily operations, reduce manual paperwork by 60%, and improve student satisfaction 
          with transparent complaint tracking and instant leave approvals.
        </p>
      </div>
    </div>
  );
};

export default WardenDashboard;
