import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const HostelListView = ({ userRole = 'student' }) => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/admin/hostels');
      setHostels(data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Hostel List</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>
          {userRole === 'student' 
            ? 'Browse available hostels and apply for accommodation' 
            : 'View all hostel blocks under your management'}
        </p>
      </div>

      {loading ? (
        <p>Loading hostels...</p>
      ) : hostels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>🏨 No hostels available at the moment</p>
          <p style={{ color: '#999', fontSize: '14px' }}>
            {userRole === 'student' 
              ? 'Please check back later or contact admin' 
              : 'Create your first hostel block'}
          </p>
        </div>
      ) : (
        <div className="card">
          <h3>All Hostels ({hostels.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Block</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Gender</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Total Rooms</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Capacity</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Facilities</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map(hostel => (
                  <tr key={hostel._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}><strong>{hostel.name}</strong></td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        background: '#e3f2fd',
                        color: '#1565c0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        Block {hostel.block}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{hostel.gender}</td>
                    <td style={{ padding: '12px' }}>{hostel.totalRooms}</td>
                    <td style={{ padding: '12px' }}>{hostel.totalCapacity} beds</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {hostel.facilities && hostel.facilities.length > 0 
                        ? hostel.facilities.join(', ') 
                        : 'Basic'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '5px 10px', 
                        background: hostel.isActive ? '#d4edda' : '#f8d7da',
                        color: hostel.isActive ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {hostel.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link 
                        to={userRole === 'student' 
                          ? `/student/hostel-details/${hostel._id}`
                          : `/warden/hostel-details/${hostel._id}`}
                        className="btn"
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '12px', 
                          background: '#28a745',
                          color: 'white',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelListView;