import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageStudentHostels = () => {
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateData, setUpdateData] = useState({
    hostelId: '',
    room: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchHostels();
  }, []);

  const fetchStudents = async () => {
    try {
      // Get all students
      const { data } = await api.get('/warden/students-list');
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/admin/hostels');
      setHostels(data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const fetchRoomsForHostel = async (hostelId) => {
    try {
      const { data } = await api.get('/admin/rooms');
      // Filter rooms for the selected hostel
      const hostelRooms = data.filter(room => room.hostel === hostelId);
      setRooms(hostelRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const handleHostelChange = (hostelId) => {
    setUpdateData({ ...updateData, hostelId, room: '' });
    if (hostelId) {
      fetchRoomsForHostel(hostelId);
    } else {
      setRooms([]);
    }
  };

  const handleUpdateStudentHostel = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      // Update student's hostel assignment
      await api.put(`/admin/students/${selectedStudent._id}/hostel`, {
        hostelId: updateData.hostelId,
        roomId: updateData.room || null
      });
      
      // Refresh student list
      await fetchStudents();
      
      // Reset form
      setShowUpdateForm(false);
      setSelectedStudent(null);
      setUpdateData({ hostelId: '', room: '' });
      setRooms([]);
      
      alert('✅ Student hostel assignment updated successfully!');
    } catch (error) {
      console.error('Error updating student hostel:', error);
      alert(error.response?.data?.message || 'Failed to update student hostel assignment');
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateForm = (student) => {
    setSelectedStudent(student);
    setUpdateData({
      hostelId: student.assignedHostel || '',
      room: student.room?._id || ''
    });
    
    // Fetch rooms for the current hostel if already assigned
    if (student.assignedHostel) {
      const hostel = hostels.find(h => h.name === student.assignedHostel);
      if (hostel) {
        fetchRoomsForHostel(hostel._id);
      }
    }
    
    setShowUpdateForm(true);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.hostelId && student.hostelId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Manage Student Hostels</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Update hostel assignments for students</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Search Students</label>
          <input
            type="text"
            placeholder="Search by name, email, or hostel ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {showUpdateForm && selectedStudent && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Update Hostel for {selectedStudent.name}</h3>
          <form onSubmit={handleUpdateStudentHostel}>
            <div className="form-group">
              <label>Current Hostel</label>
              <input
                type="text"
                value={selectedStudent.assignedHostel || 'Not assigned'}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label>New Hostel</label>
              <select
                value={updateData.hostelId}
                onChange={(e) => handleHostelChange(e.target.value)}
                required
              >
                <option value="">Select Hostel</option>
                {hostels.map(hostel => (
                  <option key={hostel._id} value={hostel._id}>
                    {hostel.name} (Block {hostel.block})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Room (Optional)</label>
              <select
                value={updateData.room}
                onChange={(e) => setUpdateData({ ...updateData, room: e.target.value })}
              >
                <option value="">Select Room (Optional)</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.number} (Floor {room.floor}) - {room.occupants?.length || 0}/{room.capacity} occupied
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Hostel'}
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => {
                  setShowUpdateForm(false);
                  setSelectedStudent(null);
                  setRooms([]);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>All Students ({filteredStudents.length})</h3>
        {loading ? (
          <p>Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No students found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Hostel ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Current Hostel</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Room</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
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
                        {student.hostelId || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}><strong>{student.name}</strong></td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>{student.email}</td>
                    <td style={{ padding: '12px' }}>
                      {student.assignedHostel || 'Not assigned'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {student.room ? `${student.room.hostel} - ${student.room.number}` : 'Not assigned'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => openUpdateForm(student)}
                        className="btn"
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '12px', 
                          background: '#007bff',
                          color: 'white'
                        }}
                      >
                        Update Hostel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudentHostels;