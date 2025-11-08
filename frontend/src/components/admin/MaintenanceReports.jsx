import { useState, useEffect } from 'react';
import api from '../../utils/api';

const MaintenanceReports = () => {
  const [data, setData] = useState({ rooms: [], complaints: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const fetchMaintenanceData = async () => {
    try {
      const { data } = await api.get('/admin/maintenance');
      setData(data);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#28a745';
      case 'needs_repair': return '#ffc107';
      case 'under_maintenance': return '#dc3545';
      case 'pending': return '#ffc107';
      case 'in-progress': return '#007bff';
      case 'resolved': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Maintenance Reports</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>View all maintenance issues and room status</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {/* Rooms Needing Maintenance */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Rooms Requiring Maintenance ({data.rooms.length})</h3>
            {data.rooms.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>All rooms are in good condition! 🎉</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Hostel</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Room</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Floor</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Last Maintenance</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Assigned Warden</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rooms.map(room => (
                      <tr key={room._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>{room.hostel}</td>
                        <td style={{ padding: '12px' }}><strong>{room.number}</strong></td>
                        <td style={{ padding: '12px' }}>{room.floor}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '5px 10px', 
                            background: getStatusColor(room.maintenanceStatus),
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {room.maintenanceStatus?.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {room.lastMaintenance 
                            ? new Date(room.lastMaintenance).toLocaleDateString() 
                            : 'Never'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {room.assignedWarden?.name || 'Not assigned'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Maintenance Complaints */}
          <div className="card">
            <h3>Recent Maintenance Complaints ({data.complaints.length})</h3>
            {data.complaints.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No maintenance complaints found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.complaints.map(complaint => (
                      <tr key={complaint._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            background: '#e3f2fd',
                            borderRadius: '4px',
                            fontSize: '12px',
                            textTransform: 'capitalize'
                          }}>
                            {complaint.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {complaint.student?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', maxWidth: '200px' }}>
                          {complaint.description}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '5px 10px', 
                            background: getStatusColor(complaint.status),
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px',
                            textTransform: 'capitalize'
                          }}>
                            {complaint.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          {complaint.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceReports;
