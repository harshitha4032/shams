import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    hostel: '',
    floor: '',
    number: '',
    roomType: 'double',
    capacity: 2,
    gender: '',
    facilities: '',
    hasAC: false,
    feePerYear: 0,
    maintenanceStatus: 'good'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/admin/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        floor: Number(formData.floor),
        feePerYear: Number(formData.feePerYear),
        hasAC: Boolean(formData.hasAC),
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingRoom) {
        await api.put(`/admin/rooms/${editingRoom._id}`, payload);
      } else {
        await api.post('/admin/rooms', payload);
      }
      
      fetchRooms();
      setShowForm(false);
      setEditingRoom(null);
      resetForm();
    } catch (error) {
      console.error('Error saving room:', error);
      alert(error.response?.data?.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      hostel: room.hostel,
      floor: room.floor,
      number: room.number,
      roomType: room.roomType || 'double',
      capacity: room.capacity,
      gender: room.gender,
      facilities: room.facilities?.join(', ') || '',
      hasAC: room.hasAC || false,
      feePerYear: room.feePerYear || 0,
      maintenanceStatus: room.maintenanceStatus || 'good'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await api.delete(`/admin/rooms/${id}`);
      fetchRooms();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const resetForm = () => {
    setFormData({
      hostel: '',
      floor: '',
      number: '',
      roomType: 'double',
      capacity: 2,
      gender: '',
      facilities: '',
      hasAC: false,
      feePerYear: 0,
      maintenanceStatus: 'good'
    });
  };

  const getVacancy = (room) => room.capacity - room.occupants.length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#28a745';
      case 'needs_repair': return '#ffc107';
      case 'under_maintenance': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Manage Hostel Rooms</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Create, update, and manage all hostel rooms</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingRoom(null);
            resetForm();
          }} 
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '🏠 Add New Room'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div className="form-group">
                <label>Hostel Name</label>
                <input
                  type="text"
                  value={formData.hostel}
                  onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                  required
                  placeholder="e.g., Hostel A"
                />
              </div>

              <div className="form-group">
                <label>Floor</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                  placeholder="e.g., 101"
                />
              </div>

              <div className="form-group">
                <label>Room Type</label>
                <select
                  value={formData.roomType}
                  onChange={(e) => {
                    const type = e.target.value;
                    let capacity = 2;
                    if (type === 'single') capacity = 1;
                    if (type === 'triple') capacity = 3;
                    if (type === 'quad') capacity = 4;
                    setFormData({ ...formData, roomType: type, capacity });
                  }}
                  required
                >
                  <option value="single">Single (1 bed)</option>
                  <option value="double">Double (2 beds)</option>
                  <option value="triple">Triple (3 beds)</option>
                  <option value="quad">Quad (4 beds)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Capacity (Beds)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Maintenance Status</label>
                <select
                  value={formData.maintenanceStatus}
                  onChange={(e) => setFormData({ ...formData, maintenanceStatus: e.target.value })}
                  required
                >
                  <option value="good">Good</option>
                  <option value="needs_repair">Needs Repair</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>AC Availability</label>
                <select
                  value={formData.hasAC}
                  onChange={(e) => setFormData({ ...formData, hasAC: e.target.value === 'true' })}
                  required
                >
                  <option value="false">Non-AC</option>
                  <option value="true">AC</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fee (₹/year)</label>
                <input
                  type="number"
                  value={formData.feePerYear}
                  onChange={(e) => setFormData({ ...formData, feePerYear: e.target.value })}
                  min="0"
                  placeholder="e.g., 50000 for AC, 30000 for Non-AC"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Suggested: Single AC: ₹60,000 | Double AC: ₹50,000 | Single Non-AC: ₹40,000 | Double Non-AC: ₹30,000
                </small>
              </div>

              <div className="form-group">
                <label>Facilities (comma-separated)</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="WiFi, AC, Study Table"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>All Rooms ({rooms.length})</h3>
        {loading ? (
          <p>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No rooms found. Create your first room!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Hostel</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Floor</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Room</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>AC</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Capacity</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Occupancy</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Vacancy</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Gender</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Fee/Year</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Warden</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{room.hostel}</td>
                    <td style={{ padding: '12px' }}>{room.floor}</td>
                    <td style={{ padding: '12px' }}><strong>{room.number}</strong></td>
                    <td style={{ padding: '12px' }}>{room.roomType || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: room.hasAC ? '#e1f5fe' : '#f5f5f5',
                        color: room.hasAC ? '#01579b' : '#666',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {room.hasAC ? '❄️ AC' : 'Non-AC'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{room.capacity}</td>
                    <td style={{ padding: '12px' }}>{room.occupants.length}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: getVacancy(room) > 0 ? '#d4edda' : '#f8d7da',
                        color: getVacancy(room) > 0 ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {getVacancy(room)} beds
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{room.gender}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: getStatusColor(room.maintenanceStatus),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {room.maintenanceStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>₹{room.feePerYear || 0}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {room.assignedWarden?.name || 'Not assigned'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => handleEdit(room)}
                        className="btn"
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '12px', 
                          marginRight: '5px',
                          background: '#007bff',
                          color: 'white'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(room._id)}
                        className="btn"
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '12px',
                          background: '#dc3545',
                          color: 'white'
                        }}
                      >
                        Delete
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

export default ManageRooms;
