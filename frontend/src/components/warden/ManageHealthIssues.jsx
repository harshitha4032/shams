import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageHealthIssues = () => {
  const [healthIssues, setHealthIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    actionTaken: '',
    referredTo: '',
    followUpDate: '',
    remarks: ''
  });

  useEffect(() => {
    fetchHealthIssues();
  }, []);

  const fetchHealthIssues = async () => {
    try {
      const { data } = await api.get('/warden/health-issues');
      setHealthIssues(data);
    } catch (error) {
      console.error('Error fetching health issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/warden/health-issues/${selectedIssue._id}`, updateData);
      fetchHealthIssues();
      setSelectedIssue(null);
      resetUpdateForm();
      alert('✅ Health issue updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update health issue');
    }
  };

  const openUpdateModal = (issue) => {
    setSelectedIssue(issue);
    setUpdateData({
      status: issue.status,
      actionTaken: issue.actionTaken || '',
      referredTo: issue.referredTo || '',
      followUpDate: issue.followUpDate ? new Date(issue.followUpDate).toISOString().split('T')[0] : '',
      remarks: issue.remarks || ''
    });
  };

  const resetUpdateForm = () => {
    setUpdateData({
      status: '',
      actionTaken: '',
      referredTo: '',
      followUpDate: '',
      remarks: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: '#ffc107',
      under_treatment: '#17a2b8',
      referred: '#fd7e14',
      resolved: '#28a745',
      closed: '#6c757d'
    };
    return colors[status] || '#007bff';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[severity] || '#6c757d';
  };

  const stats = {
    total: healthIssues.length,
    reported: healthIssues.filter(h => h.status === 'reported').length,
    underTreatment: healthIssues.filter(h => h.status === 'under_treatment').length,
    critical: healthIssues.filter(h => h.severity === 'critical').length
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>🏥 Student Health Issues</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Monitor and manage student health reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{stats.total}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Total Reports</p>
        </div>
        <div style={{ padding: '15px', background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{stats.reported}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>New Reports</p>
        </div>
        <div style={{ padding: '15px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{stats.underTreatment}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Under Treatment</p>
        </div>
        <div style={{ padding: '15px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{stats.critical}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Critical Cases</p>
        </div>
      </div>

      <div className="card">
        <h3>All Health Reports</h3>
        {loading ? (
          <p>Loading...</p>
        ) : healthIssues.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No health issues reported</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Issue Type</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {healthIssues.map(issue => (
                  <tr key={issue._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <strong>{issue.student.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>{issue.student.hostelId}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                      {issue.issueType.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: getSeverityColor(issue.severity),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {issue.severity}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: getStatusColor(issue.status),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {new Date(issue.dateReported).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => openUpdateModal(issue)}
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedIssue && (
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
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3>Manage Health Issue</h3>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p><strong>Student:</strong> {selectedIssue.student.name} ({selectedIssue.student.hostelId})</p>
              <p><strong>Issue:</strong> {selectedIssue.issueType.replace('_', ' ')}</p>
              <p><strong>Description:</strong> {selectedIssue.description}</p>
              {selectedIssue.symptoms && selectedIssue.symptoms.length > 0 && (
                <p><strong>Symptoms:</strong> {selectedIssue.symptoms.join(', ')}</p>
              )}
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  required
                >
                  <option value="reported">Reported</option>
                  <option value="under_treatment">Under Treatment</option>
                  <option value="referred">Referred</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Action Taken</label>
                <textarea
                  value={updateData.actionTaken}
                  onChange={(e) => setUpdateData({ ...updateData, actionTaken: e.target.value })}
                  rows="3"
                  placeholder="Describe the action taken..."
                />
              </div>

              <div className="form-group">
                <label>Referred To (Hospital/Doctor)</label>
                <input
                  type="text"
                  value={updateData.referredTo}
                  onChange={(e) => setUpdateData({ ...updateData, referredTo: e.target.value })}
                  placeholder="e.g., City Hospital, Dr. Smith"
                />
              </div>

              <div className="form-group">
                <label>Follow-up Date</label>
                <input
                  type="date"
                  value={updateData.followUpDate}
                  onChange={(e) => setUpdateData({ ...updateData, followUpDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={updateData.remarks}
                  onChange={(e) => setUpdateData({ ...updateData, remarks: e.target.value })}
                  rows="2"
                  placeholder="Additional remarks..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Update</button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIssue(null);
                    resetUpdateForm();
                  }}
                  className="btn"
                  style={{ background: '#6c757d', color: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHealthIssues;
