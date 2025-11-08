import { useState, useEffect } from 'react';
import api from '../../utils/api';

const WardenLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/admin/warden-leaves');
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching warden leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await api.patch(`/admin/warden-leaves/${id}`, { status });
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update leave status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Warden Leave Requests</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Approve or reject leave requests from wardens</p>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : leaves.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No warden leave requests found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Warden Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>From Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>To Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Days</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => {
                  const fromDate = new Date(leave.fromDate);
                  const toDate = new Date(leave.toDate);
                  const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={leave._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{leave.student?.name || 'N/A'}</strong>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>
                        {leave.student?.email || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {fromDate.toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {toDate.toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: '#e3f2fd',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {days} days
                        </span>
                      </td>
                      <td style={{ padding: '12px', maxWidth: '200px' }}>
                        {leave.reason}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '5px 10px', 
                          background: getStatusColor(leave.status),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textTransform: 'capitalize'
                        }}>
                          {leave.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {leave.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                              onClick={() => handleApprove(leave._id, 'approved')}
                              className="btn"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '12px',
                                background: '#28a745',
                                color: 'white'
                              }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleApprove(leave._id, 'rejected')}
                              className="btn"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '12px',
                                background: '#dc3545',
                                color: 'white'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenLeaves;
