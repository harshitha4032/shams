import { useState, useEffect } from 'react';
import api from '../../utils/api';

const MessApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/mess/applications');
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
      approved: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
      rejected: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
    };

    return (
      <span style={{
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        ...statusStyles[status]
      }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>My Mess Applications</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>View status of your mess applications</p>
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>📋 No mess applications found</p>
          <p style={{ color: '#999', fontSize: '14px' }}>You haven't applied for any mess yet</p>
        </div>
      ) : (
        <div className="card">
          <h3>Applications ({applications.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Mess</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Hostel</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Preference</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Applied On</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(application => (
                  <tr key={application._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{application.mess?.name || 'N/A'}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {application.mess?.menuType || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {application.hostel?.name || 'N/A'} - Block {application.hostel?.block || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                      {application.preference}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getStatusBadge(application.status)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {new Date(application.createdAt).toLocaleDateString()}
                      <br />
                      <span style={{ color: '#666' }}>
                        {new Date(application.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {application.remarks || 'No remarks'}
                      {application.approvedBy && (
                        <div style={{ marginTop: '5px', color: '#666' }}>
                          Approved by: {application.approvedBy?.name || 'Warden'}
                        </div>
                      )}
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

export default MessApplications;