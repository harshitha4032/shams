import { useState, useEffect } from 'react';
import api from '../../utils/api';

const StudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/warden/students-list');
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get(`/warden/student-attendance?date=${selectedDate}`);
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      await api.post('/warden/student-attendance', {
        userId: studentId,
        date: selectedDate,
        status,
        remarks: ''
      });
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.user && a.user._id === studentId);
    return record ? record.status : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#28a745';
      case 'absent': return '#dc3545';
      case 'leave': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const stats = {
    total: students.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    leave: attendance.filter(a => a.status === 'leave').length
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Student Attendance Management</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Mark and track daily student attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{stats.total}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Total Students</p>
        </div>
        <div style={{ padding: '15px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{stats.present}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Present</p>
        </div>
        <div style={{ padding: '15px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{stats.absent}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Absent</p>
        </div>
        <div style={{ padding: '15px', background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{stats.leave}</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>On Leave</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Mark Attendance</h3>
          <div className="form-group" style={{ margin: 0, width: '200px' }}>
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No students found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Hostel ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Year</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Room</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const status = getAttendanceStatus(student._id);
                  return (
                    <tr key={student._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: '#e3f2fd',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          fontWeight: 'bold'
                        }}>
                          {student.hostelId}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}><strong>{student.name}</strong></td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{student.email}</td>
                      <td style={{ padding: '12px' }}>Year {student.year}</td>
                      <td style={{ padding: '12px' }}>
                        {student.room ? `${student.room.hostel} - ${student.room.number}` : 'Not assigned'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {status ? (
                          <span style={{ 
                            padding: '6px 12px', 
                            background: getStatusColor(status),
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px',
                            textTransform: 'capitalize',
                            fontWeight: 'bold'
                          }}>
                            {status}
                          </span>
                        ) : (
                          <span style={{ color: '#999', fontSize: '12px' }}>Not marked</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => markAttendance(student._id, 'present')}
                            style={{ 
                              padding: '5px 10px', 
                              fontSize: '12px',
                              background: status === 'present' ? '#28a745' : '#d4edda',
                              color: status === 'present' ? 'white' : '#155724',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: status === 'present' ? 'bold' : 'normal'
                            }}
                          >
                            ✓ Present
                          </button>
                          <button
                            onClick={() => markAttendance(student._id, 'absent')}
                            style={{ 
                              padding: '5px 10px', 
                              fontSize: '12px',
                              background: status === 'absent' ? '#dc3545' : '#f8d7da',
                              color: status === 'absent' ? 'white' : '#721c24',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: status === 'absent' ? 'bold' : 'normal'
                            }}
                          >
                            ✗ Absent
                          </button>
                          <button
                            onClick={() => markAttendance(student._id, 'leave')}
                            style={{ 
                              padding: '5px 10px', 
                              fontSize: '12px',
                              background: status === 'leave' ? '#ffc107' : '#fff3cd',
                              color: status === 'leave' ? 'white' : '#856404',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: status === 'leave' ? 'bold' : 'normal'
                            }}
                          >
                            ◷ Leave
                          </button>
                        </div>
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

export default StudentAttendance;
