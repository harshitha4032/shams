import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageReturns = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReturnReports();
  }, [filter]);

  const fetchReturnReports = async () => {
    try {
      const { data } = await api.get('/student-return/warden/all-reports');
      setReports(data);
    } catch (error) {
      console.error('Error fetching return reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermission = async (id, status) => {
    const action = status === 'approved' ? 'grant' : 'deny';
    const confirmAction = window.confirm(
      `Are you sure you want to ${action} hostel access for this student?`
    );
    
    if (!confirmAction) return;

    try {
      await api.patch(`/student-return/warden/grant-access/${id}`, { status });
      alert(`✅ Hostel access ${action}ed successfully!`);
      fetchReturnReports();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} access`);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { backgroundColor: '#fff3cd', color: '#856404' },
      approved: { backgroundColor: '#d4edda', color: '#155724' },
      denied: { backgroundColor: '#f8d7da', color: '#721c24' }
    };

    return (
      <span 
        className="badge" 
        style={{ 
          ...statusStyles[status] || statusStyles.pending,
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '12px'
        }}
      >
        {status?.toUpperCase() || 'PENDING'}
      </span>
    );
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.hostelAccessPermission === filter);

  if (loading) return <div className="loading">Loading return reports...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>HomeAsylum Return Management</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>
          Manage student return reports and grant hostel access permissions
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reports ({reports.length})
          </button>
          <button 
            className={`btn ${filter === 'pending' ? 'btn-warning' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({reports.filter(r => r.hostelAccessPermission === 'pending').length})
          </button>
          <button 
            className={`btn ${filter === 'approved' ? 'btn-success' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({reports.filter(r => r.hostelAccessPermission === 'approved').length})
          </button>
          <button 
            className={`btn ${filter === 'denied' ? 'btn-danger' : ''}`}
            onClick={() => setFilter('denied')}
          >
            Denied ({reports.filter(r => r.hostelAccessPermission === 'denied').length})
          </button>
        </div>
      </div>

      {/* Return Reports Table */}
      <div className="card">
        <h3>Student Return Reports</h3>
        
        {filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>📭 No return reports found</p>
            <p style={{ fontSize: '14px' }}>
              {filter === 'all' 
                ? 'No students have reported their return yet' 
                : `No reports with status: ${filter}`}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Leave Period</th>
                  <th>Reported Date</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr key={report._id}>
                    <td>
                      <div>
                        <strong>{report.student?.name || 'N/A'}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {report.student?.hostelId || 'No ID'}
                        </div>
                      </div>
                    </td>
                    <td>
                      {report.leaveRequest ? (
                        <>
                          {new Date(report.leaveRequest.fromDate).toLocaleDateString()}<br/>
                          {new Date(report.leaveRequest.toDate).toLocaleDateString()}
                        </>
                      ) : 'N/A'}
                    </td>
                    <td>{new Date(report.reportedDate).toLocaleDateString()}</td>
                    <td>
                      {report.expectedReturnDate 
                        ? new Date(report.expectedReturnDate).toLocaleDateString()
                        : 'Not specified'}
                    </td>
                    <td>
                      {report.actualReturnDate 
                        ? new Date(report.actualReturnDate).toLocaleDateString()
                        : 'Not returned'}
                    </td>
                    <td>{getStatusBadge(report.hostelAccessPermission)}</td>
                    <td>
                      {report.remarks ? (
                        <div style={{ maxWidth: '200px' }}>
                          {report.remarks}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {report.hostelAccessPermission === 'pending' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <button 
                            onClick={() => handlePermission(report._id, 'approved')}
                            className="btn btn-success"
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                          >
                            Grant Access
                          </button>
                          <button 
                            onClick={() => handlePermission(report._id, 'denied')}
                            className="btn btn-danger"
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                          >
                            Deny Access
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {report.hostelAccessPermission === 'approved' ? 'Access Granted' : 'Access Denied'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Cards */}
      <div className="grid grid-2" style={{ gap: '15px', marginTop: '20px' }}>
        <div className="card" style={{ background: '#e3f2fd' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📋 Process</h4>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', margin: 0 }}>
            <li>Student reports return from leave</li>
            <li>Review return report details</li>
            <li>Verify student's actual return</li>
            <li>Grant or deny hostel access</li>
          </ol>
        </div>

        <div className="card" style={{ background: '#e8f5e9' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>✅ Benefits</h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', margin: 0 }}>
            <li>Digital return tracking</li>
            <li>Controlled hostel access</li>
            <li>Clear audit trail</li>
            <li>Automated leave updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageReturns;
