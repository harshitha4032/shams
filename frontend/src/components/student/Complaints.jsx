import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'plumbing',
    description: '',
    image: null
  });
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Listen for real-time complaint updates
  useEffect(() => {
    if (socket) {
      socket.on('complaint-updated', (data) => {
        console.log('📡 Real-time update received:', data);
        
        // Update the complaint in the list
        setComplaints(prev => 
          prev.map(c => 
            c._id === data.complaintId 
              ? { ...c, status: data.status, remarks: data.remarks }
              : c
          )
        );
        
        // Show notification
        if (Notification.permission === 'granted') {
          new Notification('Complaint Updated', {
            body: `Your complaint status changed to: ${data.status}`,
            icon: '/favicon.ico'
          });
        }
      });

      return () => {
        socket.off('complaint-updated');
      };
    }
  }, [socket]);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/student/complaints');
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('type', formData.type);
    form.append('description', formData.description);
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      await api.post('/student/complaints', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowForm(false);
      setFormData({ type: 'plumbing', description: '', image: null });
      fetchComplaints();
    } catch (error) {
      console.error('Error creating complaint:', error);
      alert('Failed to create complaint');
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>My Complaints</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Track and manage maintenance requests in real-time</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {connected && (
            <span style={{ 
              padding: '5px 10px', 
              background: '#28a745', 
              color: 'white', 
              borderRadius: '4px', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
              Live Updates
            </span>
          )}
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : '🔧 New Complaint'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3>File a Complaint</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="plumbing">Plumbing</option>
                <option value="electricity">Electricity</option>
                <option value="cleaning">Cleaning</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe the issue..."
              />
            </div>

            <div className="form-group">
              <label>Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              />
            </div>

            <button type="submit" className="btn btn-primary">Submit Complaint</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No complaints found</td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td style={{ textTransform: 'capitalize' }}>{complaint.type}</td>
                  <td>{complaint.description}</td>
                  <td>{getStatusBadge(complaint.status)}</td>
                  <td>{complaint.remarks || '-'}</td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaints;
