import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', remarks: '' });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/warden/complaints');
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.patch(`/warden/complaints/${id}`, updateData);
      setSelectedComplaint(null);
      setUpdateData({ status: '', remarks: '' });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint');
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Manage Complaints</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Quick resolution system - Update status and add remarks in real-time</p>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No complaints found</td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td>{complaint.student?.name || 'N/A'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{complaint.type}</td>
                  <td>{complaint.description}</td>
                  <td>{getStatusBadge(complaint.status)}</td>
                  <td>{complaint.remarks || '-'}</td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => {
                        setSelectedComplaint(complaint._id);
                        setUpdateData({ status: complaint.status, remarks: complaint.remarks || '' });
                      }}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedComplaint && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', margin: '20px' }}>
            <h3>Update Complaint</h3>
            
            <div className="form-group">
              <label>Status</label>
              <select 
                value={updateData.status} 
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                value={updateData.remarks}
                onChange={(e) => setUpdateData({ ...updateData, remarks: e.target.value })}
                placeholder="Add remarks..."
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleUpdate(selectedComplaint)} 
                className="btn btn-success"
              >
                Update
              </button>
              <button 
                onClick={() => setSelectedComplaint(null)} 
                className="btn btn-danger"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageComplaints;
