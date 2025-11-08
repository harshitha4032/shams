import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Complaints from '../components/student/Complaints';
import Leaves from '../components/student/Leaves';
import Notices from '../components/student/Notices';
import MessFeedback from '../components/student/MessFeedback';
import HostelApplication from '../components/student/HostelApplication';
import HostelRequests from '../components/student/HostelRequests';
import HostelDetails from '../components/student/HostelDetails';
import ApplyMess from '../components/student/ApplyMess';
import MessApplications from '../components/student/MessApplications';
import FaceRegistration from '../components/student/FaceRegistration';
import MarkAttendance from '../components/student/MarkAttendance';
import FaceAttendance from '../components/student/FaceAttendance';
import HealthIssues from '../components/student/HealthIssues';
import ReportReturn from '../components/student/ReportReturn';
import MessMenu from '../components/student/MessMenu';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  if (!user) {
    return <div className="loading">Loading user data...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <div>
          <h1 style={{ marginBottom: '2px' }}>SHAMS - Student Portal</h1>
          <p style={{ fontSize: '12px', opacity: '0.9', margin: 0 }}>Smart Hostel & Accommodation Management</p>
        </div>
        <div className="navbar-links">
          <span>Welcome, {user?.name}</span>
          <Link to="/student" onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}>
            Home
          </Link>
          <Link to="/student/apply-hostel" onClick={() => setActiveTab('apply')} className={activeTab === 'apply' ? 'active' : ''}>
            Apply Hostel
          </Link>
          <Link to="/student/hostel-requests" onClick={() => setActiveTab('requests')} className={activeTab === 'requests' ? 'active' : ''}>
            My Requests
          </Link>
          <Link to="/student/complaints" onClick={() => setActiveTab('complaints')} className={activeTab === 'complaints' ? 'active' : ''}>
            Complaints
          </Link>
          <Link to="/student/leaves" onClick={() => setActiveTab('leaves')} className={activeTab === 'leaves' ? 'active' : ''}>
            Leave Requests
          </Link>
          <Link to="/student/notices" onClick={() => setActiveTab('notices')} className={activeTab === 'notices' ? 'active' : ''}>
            Notices
          </Link>
          <Link to="/student/mess-feedback" onClick={() => setActiveTab('mess')} className={activeTab === 'mess' ? 'active' : ''}>
            Mess Feedback
          </Link>
          <Link to="/student/apply-mess" onClick={() => setActiveTab('apply-mess')} className={activeTab === 'apply-mess' ? 'active' : ''}>
            Apply for Mess
          </Link>
          <Link to="/student/mess-applications" onClick={() => setActiveTab('mess-applications')} className={activeTab === 'mess-applications' ? 'active' : ''}>
            My Mess Applications
          </Link>
          <Link to="/student/mess-menu" onClick={() => setActiveTab('mess-menu')} className={activeTab === 'mess-menu' ? 'active' : ''}>
            Mess Menu
          </Link>
          <Link to="/student/face-register" onClick={() => setActiveTab('face')} className={activeTab === 'face' ? 'active' : ''}>
            Face Register
          </Link>
          <Link to="/student/face-attendance" onClick={() => setActiveTab('face-attendance')} className={activeTab === 'face-attendance' ? 'active' : ''}>
            Face Attendance
          </Link>
          <Link to="/student/health" onClick={() => setActiveTab('health')} className={activeTab === 'health' ? 'active' : ''}>
            Health
          </Link>
          <Link to="/student/report-return" onClick={() => setActiveTab('return')} className={activeTab === 'return' ? 'active' : ''}>
            Report Return
          </Link>
          <button onClick={handleLogout} className="btn btn-danger" style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<StudentHome user={user} />} />
          <Route path="/apply-hostel" element={<HostelApplication />} />
          <Route path="/hostel-requests" element={<HostelRequests />} />
          <Route path="/hostel-details/:id" element={<HostelDetails />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/mess-feedback" element={<MessFeedback />} />
          <Route path="/face-register" element={<FaceRegistration />} />
          <Route path="/face-attendance" element={<FaceAttendance />} />
          <Route path="/health" element={<HealthIssues />} />
          <Route path="/report-return" element={<ReportReturn />} />
          <Route path="/apply-mess" element={<ApplyMess />} />
          <Route path="/mess-applications" element={<MessApplications />} />
          <Route path="/mess-menu" element={<MessMenu />} />
        </Routes>
      </div>
    </div>
  );
};

const StudentHome = ({ user }) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [wardenDetails, setWardenDetails] = useState(null);
  const [currentWeekMenu, setCurrentWeekMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wardenLoading, setWardenLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);

  useEffect(() => {
    if (user?.room) {
      fetchRoomDetails();
    } else {
      setLoading(false);
    }
    
    // Fetch warden details
    fetchWardenDetails();
    
    // Fetch current week's mess menu
    fetchCurrentWeekMenu();
  }, [user]);

  const fetchRoomDetails = async () => {
    try {
      const { data } = await api.get(`/admin/rooms`);
      const myRoom = data.find(room => room._id === user.room);
      setRoomDetails(myRoom);
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchWardenDetails = async () => {
    try {
      const { data } = await api.get(`/student/warden-details`);
      setWardenDetails(data);
    } catch (error) {
      console.error('Error fetching warden details:', error);
      // It's okay if there's no warden assigned yet
      setWardenDetails(null);
    } finally {
      setWardenLoading(false);
    }
  };
  
  const fetchCurrentWeekMenu = async () => {
    try {
      setMenuLoading(true);
      // Get start and end dates for current week
      const startDate = new Date();
      const endDate = new Date();
      
      // Adjust dates to get Monday to Sunday of current week
      const daysToMonday = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
      startDate.setDate(startDate.getDate() - daysToMonday);
      endDate.setDate(startDate.getDate() + 6);
      
      // Format dates for API
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const { data } = await api.get(`/public/mess-menus?startDate=${startStr}&endDate=${endStr}`);
      setCurrentWeekMenu(data);
    } catch (error) {
      console.error('Error fetching current week menu:', error);
    } finally {
      setMenuLoading(false);
    }
  };

  // Group menus by day for current week display
  const groupMenusByDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    
    // Initialize all days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      const daysToMonday = date.getDay() === 0 ? 6 : date.getDay() - 1;
      date.setDate(date.getDate() - daysToMonday + i);
      const dateStr = date.toISOString().split('T')[0];
      grouped[dateStr] = { date: dateStr, day: days[date.getDay()], meals: {} };
    }
    
    // Populate with actual menu data
    currentWeekMenu.forEach(menu => {
      const dateStr = new Date(menu.date).toISOString().split('T')[0];
      if (grouped[dateStr]) {
        if (!grouped[dateStr].meals[menu.mealType]) {
          grouped[dateStr].meals[menu.mealType] = [];
        }
        grouped[dateStr].meals[menu.mealType].push(menu);
      }
    });
    
    return Object.values(grouped);
  };

  const groupedMenus = groupMenusByDay();

  return (
    <div>
      <h2>Student Dashboard</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Welcome to SHAMS - Your complete hostel management solution</p>
      
      <div className="grid grid-3" style={{ marginTop: '30px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <h3>🏠</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Hostel Management</p>
          <p style={{ fontSize: '12px', opacity: '0.9' }}>Apply & Track Room Allocation</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <h3>🔧</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Maintenance</p>
          <p style={{ fontSize: '12px', opacity: '0.9' }}>Quick Complaint Resolution</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <h3>🍽️</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Mess Feedback</p>
          <p style={{ fontSize: '12px', opacity: '0.9' }}>Rate & Improve Food Quality</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px' }}>
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
            
            {user?.hostelId && (
              <div style={{ 
                margin: '15px 0',
                padding: '15px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                border: '2px solid #5a67d8'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '12px', fontWeight: '500' }}>
                  🎓 Your Hostel ID
                </p>
                <p style={{ 
                  margin: 0, 
                  color: '#fff', 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  fontFamily: 'monospace'
                }}>
                  {user.hostelId}
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#e0e7ff', fontSize: '11px' }}>
                  Use this ID to login
                </p>
              </div>
            )}
            
            <p><strong>Gender:</strong> <span style={{ textTransform: 'capitalize' }}>{user?.gender}</span></p>
            <p><strong>Year:</strong> {user?.year}</p>
            
            {loading ? (
              <p><strong>Room:</strong> Loading...</p>
            ) : user?.room && roomDetails ? (
              <div style={{ 
                marginTop: '15px', 
                padding: '15px', 
                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                borderRadius: '8px',
                border: '2px solid #66bb6a'
              }}>
                <p style={{ margin: '5px 0', color: '#2e7d32' }}>
                  <strong>🏠 Room Allocated:</strong> <span className="badge badge-approved">Yes</span>
                </p>
                <p style={{ margin: '5px 0', color: '#1b5e20' }}>
                  <strong>Hostel:</strong> {roomDetails.hostel}
                </p>
                <p style={{ margin: '5px 0', color: '#1b5e20' }}>
                  <strong>Room No:</strong> {roomDetails.number} (Floor {roomDetails.floor})
                </p>
                <p style={{ margin: '5px 0', color: '#1b5e20' }}>
                  <strong>Room Type:</strong> 
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '4px 10px', 
                    background: '#fff',
                    color: '#2e7d32',
                    borderRadius: '4px',
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    fontWeight: 'bold'
                  }}>
                    {roomDetails.roomType || 'Standard'}
                  </span>
                </p>
                <p style={{ margin: '5px 0', color: '#1b5e20' }}>
                  <strong>AC Status:</strong>
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '4px 10px', 
                    background: roomDetails.hasAC ? '#e1f5fe' : '#f5f5f5',
                    color: roomDetails.hasAC ? '#01579b' : '#666',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {roomDetails.hasAC ? '❄️ AC' : 'Non-AC'}
                  </span>
                </p>
                <p style={{ margin: '5px 0', color: '#1b5e20' }}>
                  <strong>Capacity:</strong> {roomDetails.capacity} beds
                </p>
                <p style={{ margin: '5px 0', color: '#1b5e20' }}>
                  <strong>Current Occupancy:</strong> {roomDetails.occupants?.length || 0}/{roomDetails.capacity}
                </p>
                <p style={{ margin: '5px 0', color: '#1b5e20' }}>
                  <strong>Fee:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹{roomDetails.feePerYear || 0}/year</span>
                </p>
                {roomDetails.facilities && roomDetails.facilities.length > 0 && (
                  <p style={{ margin: '5px 0', color: '#1b5e20' }}>
                    <strong>Facilities:</strong> {roomDetails.facilities.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ 
                marginTop: '15px', 
                padding: '15px', 
                background: '#fff3e0',
                borderRadius: '8px',
                border: '2px solid #ffb74d'
              }}>
                <p style={{ margin: '5px 0', color: '#e65100' }}>
                  <strong>Room:</strong> <span className="badge badge-pending">Not Allocated</span>
                </p>
                <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#ef6c00' }}>
                  📌 Please apply for hostel accommodation to get a room assigned.
                </p>
              </div>
            )}
            
            {/* Warden Details Section */}
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              borderRadius: '8px',
              border: '2px solid #ffcc80'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#e65100' }}>🏢 Warden Details</h4>
              
              {wardenLoading ? (
                <p style={{ margin: '5px 0', color: '#ef6c00' }}>Loading warden information...</p>
              ) : wardenDetails ? (
                <div>
                  <p style={{ margin: '5px 0', color: '#e65100' }}>
                    <strong>Name:</strong> {wardenDetails.name}
                  </p>
                  <p style={{ margin: '5px 0', color: '#e65100' }}>
                    <strong>Email:</strong> {wardenDetails.email}
                  </p>
                  <p style={{ margin: '5px 0', color: '#e65100' }}>
                    <strong>Assigned Hostel:</strong> {wardenDetails.assignedHostel}
                  </p>
                  <p style={{ margin: '5px 0', color: '#e65100' }}>
                    <strong>Floor:</strong> {wardenDetails.assignedFloor || 'All Floors'}
                  </p>
                </div>
              ) : (
                <p style={{ margin: '5px 0', color: '#ef6c00' }}>
                  No warden assigned to your hostel yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#e91e63' }}>🍽️ This Week's Mess Menu</h3>
          
          {menuLoading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading current week's menu...</p>
          ) : currentWeekMenu.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Day</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Breakfast</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Lunch</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedMenus.map((dayMenu, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '8px' }}>
                        <div>
                          <strong>{dayMenu.day.substring(0, 3)}</strong>
                          <br />
                          <span style={{ fontSize: '11px', color: '#666' }}>
                            {new Date(dayMenu.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        {dayMenu.meals.breakfast ? (
                          <ul style={{ margin: 0, paddingLeft: '15px' }}>
                            {dayMenu.meals.breakfast.map((menu, idx) => (
                              <li key={idx} style={{ marginBottom: '3px' }}>
                                {menu.items.map((item, itemIdx) => (
                                  <div key={itemIdx}>{item.name}</div>
                                ))}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        {dayMenu.meals.lunch ? (
                          <ul style={{ margin: 0, paddingLeft: '15px' }}>
                            {dayMenu.meals.lunch.map((menu, idx) => (
                              <li key={idx} style={{ marginBottom: '3px' }}>
                                {menu.items.map((item, itemIdx) => (
                                  <div key={itemIdx}>
                                    {item.name} {item.isNonVeg && <span style={{ color: 'red', fontSize: '10px' }}>(Non-Veg)</span>}
                                  </div>
                                ))}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        {dayMenu.meals.dinner ? (
                          <ul style={{ margin: 0, paddingLeft: '15px' }}>
                            {dayMenu.meals.dinner.map((menu, idx) => (
                              <li key={idx} style={{ marginBottom: '3px' }}>
                                {menu.items.map((item, itemIdx) => (
                                  <div key={itemIdx}>
                                    {item.name} {item.isNonVeg && <span style={{ color: 'red', fontSize: '10px' }}>(Non-Veg)</span>}
                                  </div>
                                ))}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/student/mess-menu" className="btn btn-primary" style={{ fontSize: '12px' }}>
                  View Full Menu
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#666' }}>No menu available for this week.</p>
              <Link to="/student/mess-menu" className="btn btn-primary" style={{ fontSize: '12px' }}>
                View Menu Details
              </Link>
            </div>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>⚡ Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/student/apply-hostel" className="btn btn-primary" style={{ fontSize: '13px' }}>🏠 Apply for Hostel</Link>
              <Link to="/student/complaints" className="btn btn-primary" style={{ fontSize: '13px' }}>🔧 File Complaint</Link>
              <Link to="/student/leaves" className="btn btn-primary" style={{ fontSize: '13px' }}>📅 Request Leave</Link>
              <Link to="/student/mess-feedback" className="btn btn-primary" style={{ fontSize: '13px' }}>⭐ Give Mess Feedback</Link>
              <Link to="/student/notices" className="btn btn-primary" style={{ fontSize: '13px' }}>📢 View Announcements</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)' }}>
        <h3 style={{ color: '#00695c', marginBottom: '10px' }}>💡 About SHAMS</h3>
        <p style={{ color: '#004d40', lineHeight: '1.6' }}>
          Smart Hostel & Accommodation Management System is designed to streamline hostel operations, 
          improve transparency, and enhance student welfare. Manage everything from room allocation to 
          mess feedback in one centralized portal.
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;