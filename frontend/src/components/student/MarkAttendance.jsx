import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const MarkAttendance = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMarkAttendance = async () => {
    setLoading(true);
    setMessage('');

    try {
      const requestData = {
        date,
        status: 'present'
      };
      
      await api.post('/student/mark-attendance', requestData);
      setMessage('✅ Attendance marked successfully!');
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || 'Failed to mark attendance'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Mark Attendance</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>
          Mark your daily attendance
        </p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label><strong>Date:</strong></label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={new Date().toISOString().split('T')[0]}
              style={{ marginLeft: '10px', padding: '8px' }}
              disabled
            />
          </div>
          <button 
            onClick={handleMarkAttendance}
            disabled={loading}
            className="btn btn-success"
            style={{ padding: '10px 20px' }}
          >
            {loading ? 'Marking...' : 'Mark Present'}
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          * Attendance can only be marked for today
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <h3>Attendance Guidelines</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Attendance can only be marked once per day</li>
          <li>Ensure you mark attendance during hostel hours</li>
          <li>Contact warden if you face any issues</li>
        </ul>
      </div>
    </div>
  );
};

export default MarkAttendance;
