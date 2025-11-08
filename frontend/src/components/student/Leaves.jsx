import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const { socket } = useSocket();

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Listen for real-time leave updates
  useEffect(() => {
    if (socket) {
      socket.on('leave-updated', (data) => {
        console.log('📡 Leave update received:', data);
        
        setLeaves(prev => 
          prev.map(l => 
            l._id === data.leaveId 
              ? { ...l, status: data.status }
              : l
          )
        );
        
        if (Notification.permission === 'granted') {
          new Notification('Leave Request Updated', {
            body: `Your leave request status: ${data.status}`,
            icon: '/favicon.ico'
          });
        }
      });

      return () => {
        socket.off('leave-updated');
      };
    }
  }, [socket]);

  const fetchLeaves = async () => {
    try {
      const endpoint = user?.role === 'warden' ? '/warden/my-leaves' : '/student/leaves';
      const { data } = await api.get(endpoint);
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = user?.role === 'warden' ? '/warden/request-leave' : '/student/leaves';
      await api.post(endpoint, formData);
      setShowForm(false);
      setFormData({ fromDate: '', toDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      console.error('Error requesting leave:', error);
      alert('Failed to request leave');
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>{user?.role === 'warden' ? 'My Leave Requests' : 'Leave Requests'}</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            {user?.role === 'warden' 
              ? 'Request leave from admin - digital approval workflow' 
              : 'Digital leave approval workflow - No paper forms!'}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '📅 Request Leave'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Request Leave</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                placeholder="Enter reason for leave..."
              />
            </div>

            <button type="submit" className="btn btn-primary">Submit Request</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Requested On</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No leave requests found</td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                  <td>{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>{new Date(leave.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaves;
