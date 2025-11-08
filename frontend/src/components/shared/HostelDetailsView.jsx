import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const HostelDetailsView = ({ userRole = 'student' }) => {
  const { id } = useParams();
  const [hostelDetails, setHostelDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostelDetails();
  }, [id]);

  const fetchHostelDetails = async () => {
    try {
      // First try to get detailed information from admin endpoint
      try {
        const { data } = await api.get(`/admin/hostels/${id}/details`);
        setHostelDetails(data);
      } catch (adminError) {
        // If admin endpoint fails, try to get basic information from public endpoint
        console.log('Admin endpoint failed, trying public endpoint');
        const { data: hostels } = await api.get('/public/hostels');
        const hostel = hostels.find(h => h._id === id);
        
        if (hostel) {
          // Create a simplified hostel details object
          setHostelDetails({
            hostel: hostel,
            rooms: {
              total: hostel.totalRooms || 0,
              totalCapacity: hostel.totalCapacity || 0,
              occupiedCapacity: 0,
              availableCapacity: hostel.totalCapacity || 0,
              roomTypeBreakdown: {},
              list: []
            },
            messes: []
          });
        } else {
          throw new Error('Hostel not found');
        }
      }
    } catch (error) {
      console.error('Error fetching hostel details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading hostel details...</div>;
  }

  if (!hostelDetails) {
    return <div>Hostel not found</div>;
  }

  const { hostel, rooms, messes } = hostelDetails;

  return (
    <div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>{hostel.name} Details</h2>
          {userRole === 'admin' && (
            <Link to={`/admin/hostels`} className="btn btn-primary">
              ← Back to Hostels
            </Link>
          )}
          {userRole === 'warden' && (
            <Link to={`/warden/hostel-list`} className="btn btn-primary">
              ← Back to Hostels
            </Link>
          )}
        </div>
        
        <div className="grid grid-3">
          <div>
            <h4>Hostel Information</h4>
            <p><strong>Block:</strong> {hostel.block}</p>
            <p><strong>Gender:</strong> {hostel.gender}</p>
            <p><strong>Address:</strong> {hostel.address || 'Not specified'}</p>
            <p><strong>Status:</strong> 
              <span style={{ 
                padding: '4px 8px', 
                background: hostel.isActive ? '#d4edda' : '#f8d7da',
                color: hostel.isActive ? '#155724' : '#721c24',
                borderRadius: '4px',
                marginLeft: '8px'
              }}>
                {hostel.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
            <p><strong>Warden:</strong> {hostel.warden?.name || 'Not assigned'}</p>
          </div>
          
          <div>
            <h4>Room Statistics</h4>
            <p><strong>Total Rooms:</strong> {rooms.total || hostel.totalRooms || 0}</p>
            <p><strong>Total Capacity:</strong> {rooms.totalCapacity || hostel.totalCapacity || 0} beds</p>
            <p><strong>Occupied:</strong> {rooms.occupiedCapacity || 0} beds</p>
            <p><strong>Available:</strong> {rooms.availableCapacity || hostel.totalCapacity || 0} beds</p>
            <p><strong>Occupancy Rate:</strong> 
              <span style={{ 
                padding: '4px 8px', 
                background: '#e3f2fd',
                color: '#1565c0',
                borderRadius: '4px',
                marginLeft: '8px'
              }}>
                {rooms.totalCapacity > 0 ? ((rooms.occupiedCapacity / rooms.totalCapacity * 100).toFixed(1)) : 0}%
              </span>
            </p>
          </div>
          
          <div>
            <h4>Mess Information</h4>
            <p><strong>Total Messes:</strong> {messes.length}</p>
            <p><strong>Mess Capacity:</strong> {messes.reduce((sum, mess) => sum + (mess.capacity || 0), 0)} students</p>
            <p><strong>Menu Types:</strong> 
              {[...new Set(messes.map(m => m.menuType))].join(', ')}
            </p>
          </div>
        </div>
        
        {hostel.facilities && hostel.facilities.length > 0 && (
          <div>
            <h4>Facilities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {hostel.facilities.map((facility, index) => (
                <span 
                  key={index}
                  style={{ 
                    padding: '4px 8px', 
                    background: '#e3f2fd',
                    color: '#1565c0',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Only show detailed room information if we have it from admin endpoint */}
      {rooms.list && rooms.list.length > 0 && (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Room Type Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Room Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Count</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Total Capacity</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Occupied</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Available</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rooms.roomTypeBreakdown).map(([type, stats]) => (
                    <tr key={type} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{type}</td>
                      <td style={{ padding: '12px' }}>{stats.count}</td>
                      <td style={{ padding: '12px' }}>{stats.totalCapacity}</td>
                      <td style={{ padding: '12px' }}>{stats.occupiedCapacity}</td>
                      <td style={{ padding: '12px' }}>{stats.availableCapacity}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: '#e3f2fd',
                          color: '#1565c0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {stats.totalCapacity > 0 ? ((stats.occupiedCapacity / stats.totalCapacity * 100).toFixed(1)) : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Fee Structure</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Room Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>AC/Non-AC</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Fee (₹/year)</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Available Rooms</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Vacancy Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.list.map(room => (
                    <tr key={room._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{room.roomType}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: room.hasAC ? '#e1f5fe' : '#f5f5f5',
                          color: room.hasAC ? '#01579b' : '#666',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {room.hasAC ? '❄️ AC' : 'Non-AC'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>₹{room.feePerYear?.toLocaleString() || 0}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: (room.capacity - room.occupants.length) > 0 ? '#d4edda' : '#f8d7da',
                          color: (room.capacity - room.occupants.length) > 0 ? '#155724' : '#721c24',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {room.capacity - room.occupants.length} beds
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: '#e3f2fd',
                          color: '#1565c0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {room.capacity > 0 ? (((room.capacity - room.occupants.length) / room.capacity * 100).toFixed(1)) : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Only show mess information if we have it from admin endpoint */}
      {messes && messes.length > 0 && (
        <div className="card">
          <h3>Messes</h3>
          {messes.length === 0 ? (
            <p>No messes assigned to this hostel</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Capacity</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Menu Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Facilities</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messes.map(mess => (
                    <tr key={mess._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}><strong>{mess.name}</strong></td>
                      <td style={{ padding: '12px' }}>{mess.capacity} students</td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{mess.menuType}</td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>
                        {mess.facilities && mess.facilities.length > 0 
                          ? mess.facilities.join(', ') 
                          : 'Basic'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '5px 10px', 
                          background: mess.isActive ? '#d4edda' : '#f8d7da',
                          color: mess.isActive ? '#155724' : '#721c24',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {mess.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostelDetailsView;