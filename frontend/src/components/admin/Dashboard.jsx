import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Complete hostel analytics and system-wide management</p>

      {/* Admin Profile Card */}
      {user && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              {user?.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt="Profile" 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #667eea',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: 'white'
                }}>
                  👤
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0' }}>👤 {user.name}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Email:</strong> {user.email}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Role:</strong> <span style={{ 
                  padding: '4px 12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>🛡️ Administrator</span>
              </p>
              {user?.gender && (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Gender:</strong> <span style={{ textTransform: 'capitalize' }}>{user.gender}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {stats ? (
        <div>
          <div className="grid grid-3" style={{ marginTop: '30px' }}>
            <div className="stat-card">
              <h3>{stats.totalStudents || 0}</h3>
              <p>🎓 Total Students</p>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <h3>{stats.totalRooms || 0}</h3>
              <p>🏠 Total Rooms</p>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <h3>{stats.occupiedRooms || 0}</h3>
              <p>🚪 Occupied Rooms</p>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)' }}>
              <h3>{stats.totalWardens || 0}</h3>
              <p>👔 Wardens</p>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <h3>{stats.totalComplaints || 0}</h3>
              <p>🔧 Total Complaints</p>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <h3>{stats.pendingComplaints || 0}</h3>
              <p>⏳ Pending Complaints</p>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
              <h3>{stats.totalLeaves || 0}</h3>
              <p>📅 Leave Requests</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>📊 Hostel Occupancy</h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  background: '#e0e0e0', 
                  height: '30px', 
                  borderRadius: '15px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', 
                    height: '100%', 
                    width: `${stats.totalRooms > 0 ? (stats.occupiedRooms / stats.totalRooms * 100) : 0}%`,
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
              <div style={{ minWidth: '100px', textAlign: 'right' }}>
                <strong style={{ fontSize: '20px' }}>
                  {stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms * 100).toFixed(1)) : 0}%
                </strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Occupancy Rate</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '20px' }}>
          <p style={{ textAlign: 'center', color: '#666' }}>No statistics available</p>
        </div>
      )}

      <div className="grid grid-2" style={{ marginTop: '30px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>⚙️ Admin Actions</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
            <li>Create and manage hostel rooms with full details</li>
            <li>Assign wardens to specific hostels and floors</li>
            <li>Approve/reject warden leave requests</li>
            <li>Monitor maintenance status of all rooms</li>
            <li>Post notices for students and wardens</li>
            <li>View system-wide statistics and analytics</li>
            <li>Track complaints and maintenance issues</li>
            <li>Monitor mess feedback and quality metrics</li>
          </ul>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
          <h3 style={{ color: '#2e7d32', marginBottom: '15px' }}>🎯 Real-World Impact</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '2', color: '#1b5e20' }}>
            <li>Reduces admin workload by 60%</li>
            <li>Improves transparency in operations</li>
            <li>Provides valuable hostel analytics</li>
            <li>Enhances student satisfaction</li>
            <li>Enables data-driven decisions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
