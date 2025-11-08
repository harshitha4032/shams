import { useState, useEffect } from 'react';
import api from '../../utils/api';

const RoomAllocation = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hostelId: '',
    floor: '',
    roomId: '',
    userId: ''
  });

  useEffect(() => {
    fetchHostels();
    fetchStudents();
  }, []);

  const fetchHostels = async () => {
    try {
      // Use public endpoint for wardens instead of admin endpoint
      const { data } = await api.get('/public/hostels');
      setHostels(data);
    } catch (err) {
      console.error('Error fetching hostels:', err);
      setError('Failed to fetch hostels. Please try again.');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/warden/students-list');
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchFloorsByHostel = async (hostelId) => {
    try {
      // Use the new warden rooms endpoint
      const { data: roomsData } = await api.get('/warden/rooms');
      const hostelName = hostels.find(h => h._id === hostelId)?.name;
      if (hostelName) {
        const hostelRooms = roomsData.filter(room => room.hostel === hostelName);
        const uniqueFloors = [...new Set(hostelRooms.map(room => room.floor))];
        setFloors(uniqueFloors.sort((a, b) => a - b));
      }
    } catch (err) {
      console.error('Error fetching floors:', err);
      setError('Failed to fetch floor information. Please try again.');
    }
  };

  const fetchRoomsByHostelAndFloor = async (hostelId, floor) => {
    try {
      // Use the new warden rooms endpoint
      const { data: roomsData } = await api.get('/warden/rooms');
      const hostelName = hostels.find(h => h._id === hostelId)?.name;
      if (hostelName) {
        const filteredRooms = roomsData.filter(room => 
          room.hostel === hostelName && room.floor === parseInt(floor)
        );
        setRooms(filteredRooms);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to fetch room information. Please try again.');
    }
  };

  const handleHostelChange = (e) => {
    const hostelId = e.target.value;
    setFormData({
      ...formData,
      hostelId,
      floor: '',
      roomId: ''
    });
    setFloors([]);
    setRooms([]);
    
    if (hostelId) {
      fetchFloorsByHostel(hostelId);
    }
  };

  const handleFloorChange = (e) => {
    const floor = e.target.value;
    setFormData({
      ...formData,
      floor,
      roomId: ''
    });
    setRooms([]);
    
    if (floor && formData.hostelId) {
      fetchRoomsByHostelAndFloor(formData.hostelId, floor);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/warden/rooms/allocate', {
        userId: formData.userId,
        roomId: formData.roomId
      });
      
      setSuccess(response.data.message);
      setFormData({
        hostelId: '',
        floor: '',
        roomId: '',
        userId: ''
      });
      setFloors([]);
      setRooms([]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to allocate room';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Room Allocation</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Allocate rooms to students based on hostel and floor</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h3>Allocate Room to Student</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Hostel</label>
            <select
              value={formData.hostelId}
              onChange={handleHostelChange}
              required
            >
              <option value="">Choose a hostel</option>
              {hostels.map(hostel => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name} - Block {hostel.block} ({hostel.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Floor</label>
            <select
              value={formData.floor}
              onChange={handleFloorChange}
              required
              disabled={!formData.hostelId}
            >
              <option value="">Choose a floor</option>
              {floors.map(floor => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
            {!formData.hostelId && (
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Please select a hostel first
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Select Room</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              required
              disabled={!formData.floor}
            >
              <option value="">Choose a room</option>
              {rooms.map(room => {
                const vacancy = room.capacity - (room.occupants?.length || 0);
                const isAvailable = vacancy > 0;
                return (
                  <option 
                    key={room._id} 
                    value={room._id}
                    disabled={!isAvailable}
                  >
                    Room {room.number} - {room.roomType} ({room.hasAC ? 'AC' : 'Non-AC'}) - 
                    {vacancy} vacancy{vacancy !== 1 ? 's' : ''}
                  </option>
                );
              })}
            </select>
            {!formData.floor && (
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Please select a floor first
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Select Student</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              required
            >
              <option value="">Choose a student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email}) - {student.hostelId || 'No Hostel ID'}
                </option>
              ))}
            </select>
          </div>

          {success && <div className="success">{success}</div>}
          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!formData.hostelId || !formData.floor || !formData.roomId || !formData.userId || loading}
          >
            {loading ? 'Allocating...' : 'Allocate Room'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4 style={{ marginBottom: '10px' }}>Instructions:</h4>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Select a hostel from the dropdown list</li>
          <li>Select a floor from the available floors in the selected hostel</li>
          <li>Select an available room from the filtered list</li>
          <li>Select a student to assign to the room</li>
          <li>Disabled options indicate rooms that are full</li>
          <li>Gender compatibility is automatically checked</li>
        </ul>
      </div>
    </div>
  );
};

export default RoomAllocation;