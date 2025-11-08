import { useState, useEffect } from 'react';
import api from '../../utils/api';

const HealthIssues = () => {
  const [healthIssues, setHealthIssues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    issueType: 'illness',
    description: '',
    severity: 'medium',
    symptoms: ''
  });

  useEffect(() => {
    fetchHealthIssues();
  }, []);

  const fetchHealthIssues = async () => {
    try {
      const { data } = await api.get('/student/health-issues');
      setHealthIssues(data);
    } catch (error) {
      console.error('Error fetching health issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const symptoms = formData.symptoms.split(',').map(s => s.trim()).filter(s => s);
      await api.post('/student/health-issues', {
        ...formData,
        symptoms
      });
      fetchHealthIssues();
      setShowForm(false);
      resetForm();
      alert('✅ Health issue reported successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to report health issue');
    }
  };

  const resetForm = () => {
    setFormData({
      issueType: 'illness',
      description: '',
      severity: 'medium',
      symptoms: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return '#ffc107';
      case 'under_treatment': return '#17a2b8';
      case 'referred': return '#fd7e14';
      case 'resolved': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2>🏥 Health Issues</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Report and track your health concerns</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '➕ Report Health Issue'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Report Health Issue</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Issue Type</label>
                <select
                  value={formData.issueType}
                  onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                  required
                >
                  <option value="illness">Illness</option>
                  <option value="injury">Injury</option>
                  <option value="allergy">Allergy</option>
                  <option value="chronic">Chronic Condition</option>
                  <option value="emergency">Emergency</option>
                  <option value="mental_health">Mental Health</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical (Emergency)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                required
                placeholder="Describe your health issue in detail..."
              />
            </div>

            <div className="form-group">
              <label>Symptoms (comma-separated)</label>
              <input
                type="text"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="e.g., fever, headache, cough"
              />
              <small style={{ color: '#666' }}>Enter symptoms separated by commas</small>
            </div>

            <button type="submit" className="btn btn-primary">Submit Report</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>My Health Reports ({healthIssues.length})</h3>
        {loading ? (
          <p>Loading...</p>
        ) : healthIssues.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No health issues reported yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {healthIssues.map(issue => (
              <div
                key={issue._id}
                style={{
                  padding: '20px',
                  border: '1px solid #dee2e6',
                  borderLeft: `4px solid ${getSeverityColor(issue.severity)}`,
                  borderRadius: '8px',
                  background: '#f8f9fa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', textTransform: 'capitalize' }}>
                      {issue.issueType.replace('_', ' ')}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                      Reported on {new Date(issue.dateReported).toLocaleDateString()} at {new Date(issue.dateReported).toLocaleTimeString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      background: getSeverityColor(issue.severity),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {issue.severity}
                    </span>
                    <span style={{
                      padding: '6px 12px',
                      background: getStatusColor(issue.status),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong>Description:</strong>
                  <p style={{ margin: '5px 0', lineHeight: '1.6' }}>{issue.description}</p>
                </div>

                {issue.symptoms && issue.symptoms.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Symptoms:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                      {issue.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '4px 8px',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {issue.actionTaken && (
                  <div style={{ marginTop: '15px', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
                    <strong style={{ color: '#155724' }}>Action Taken:</strong>
                    <p style={{ margin: '5px 0 0 0', color: '#155724' }}>{issue.actionTaken}</p>
                  </div>
                )}

                {issue.referredTo && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Referred To:</strong> <span style={{ color: '#007bff' }}>{issue.referredTo}</span>
                  </div>
                )}

                {issue.followUpDate && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Follow-up Date:</strong> {new Date(issue.followUpDate).toLocaleDateString()}
                  </div>
                )}

                {issue.handledBy && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Handled by: {issue.handledBy.name} ({issue.handledBy.role})
                  </div>
                )}

                {issue.remarks && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
                    <strong style={{ color: '#856404' }}>Remarks:</strong>
                    <p style={{ margin: '5px 0 0 0', color: '#856404' }}>{issue.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthIssues;
