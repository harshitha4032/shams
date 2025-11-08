import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/warden/leaves');
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await api.patch(`/warden/leaves/${id}`, { status });
      fetchLeaves();
      
      if (status === 'approved') {
        alert('✅ Leave approved! Attendance will be auto-marked as "LEAVE" daily until student returns.');
      }
    } catch (error) {
      console.error('Error updating leave:', error);
      alert('Failed to update leave request');
    }
  };

  const handleMarkReturned = async (leaveId) => {
    const confirmReturn = window.confirm('Mark this student as returned to hostel?\n\nThis will stop auto-marking leave attendance.');
    
    if (!confirmReturn) return;
    
    try {
      await api.post(`/warden/leaves/${leaveId}/return`, {
        returnDate: new Date()
      });
      
      alert('✅ Student marked as returned! Auto-leave attendance stopped.');
      fetchLeaves();
    } catch (error) {
      console.error('Error marking return:', error);
      alert(error.response?.data?.message || 'Failed to mark student as returned');
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Manage Leave Requests</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Approve or reject leave requests digitally - No paperwork needed</p>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Return Status</th>
              <th>Requested On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No leave requests found</td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.student?.name || 'N/A'}</td>
                  <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                  <td>{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>
                    {leave.status === 'approved' && (
                      <span className={leave.hasReturned ? 'badge badge-success' : 'badge badge-warning'}>
                        {leave.hasReturned ? 'Returned' : 'On Leave'}
                      </span>
                    )}
                    {leave.status !== 'approved' && '-'}
                  </td>
                  <td>{new Date(leave.createdAt).toLocaleDateString()}</td>
                  <td>
                    {leave.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => handleApprove(leave._id, 'approved')}
                          className="btn btn-success"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleApprove(leave._id, 'rejected')}
                          className="btn btn-danger"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {leave.status === 'approved' && !leave.hasReturned && (
                      <button 
                        onClick={() => handleMarkReturned(leave._id)}
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        Mark Returned
                      </button>
                    )}
                    {leave.status !== 'pending' && (leave.hasReturned || leave.status === 'rejected') && '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageLeaves;
