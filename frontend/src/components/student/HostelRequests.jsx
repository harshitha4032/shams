import { useState, useEffect } from 'react';
import api from '../../utils/api';

const HostelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostelRequests();
  }, []);

  const fetchHostelRequests = async () => {
    try {
      const { data } = await api.get('/student/hostel-requests');
      setRequests(data);
    } catch (error) {
      console.error('Error fetching hostel requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span style={{ padding: '4px 8px', background: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '12px' }}>Approved</span>;
      case 'rejected':
        return <span style={{ padding: '4px 8px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', fontSize: '12px' }}>Rejected</span>;
      default:
        return <span style={{ padding: '4px 8px', background: '#fff3cd', color: '#856404', borderRadius: '4px', fontSize: '12px' }}>Pending</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>My Hostel Requests</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>View status of your hostel accommodation requests</p>
      </div>

      <div className="card">
        <h3>Hostel Requests ({requests.length})</h3>
        {loading ? (
          <p>Loading hostel requests...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>📝 No hostel requests found</p>
            <p style={{ color: '#999', fontSize: '14px' }}>Submit a hostel application to get started</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Submitted On</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Preferences</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Assigned Room</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Processed By</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>
                      {new Date(request.createdAt).toLocaleDateString()}<br />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '12px' }}>
                        <strong>Hostel:</strong> {request.hostelPreference}<br />
                        <strong>Room:</strong> {request.roomType} ({request.acPreference})<br />
                        <strong>Year:</strong> {request.year}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getStatusBadge(request.status)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {request.assignedRoom ? (
                        <div>
                          <strong>{request.assignedRoom.hostel}</strong><br />
                          Room {request.assignedRoom.number}<br />
                          Floor {request.assignedRoom.floor}
                        </div>
                      ) : (
                        'Not assigned'
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {request.approvedBy ? request.approvedBy.name : 'Pending'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {request.remarks || 'No remarks'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelRequests;