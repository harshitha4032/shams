import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const HostelApplication = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    hostelPreference: '',
    roomType: '',
    acPreference: '',
    gender: '',
    year: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableRooms();
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/public/hostels');
      console.log('Hostels loaded:', data);
      setHostels(data.filter(h => h.isActive));
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const { data } = await api.get('/student/available-rooms');
      setAvailableRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      await api.post('/student/apply-hostel', formData);
      setSuccess('Hostel application submitted successfully! Wait for warden approval.');
      setFormData({ hostelPreference: '', roomType: '', acPreference: '', gender: '', year: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Apply for Hostel Room</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>View available rooms and apply for hostel accommodation</p>
      </div>

      {/* Available Rooms Display with Enhanced Details */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Available Rooms ({availableRooms.length})</h3>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <span style={{ marginRight: '15px' }}>🟢 AC Rooms</span>
            <span>⚪ Non-AC Rooms</span>
          </div>
        </div>
        {loading ? (
          <p>Loading available rooms...</p>
        ) : availableRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>🚫 No rooms available at the moment</p>
            <p style={{ color: '#999', fontSize: '14px' }}>Please check back later or contact admin</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-4" style={{ marginBottom: '20px' }}>
              <div style={{ 
                padding: '15px', 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#01579b', fontSize: '24px' }}>
                  {availableRooms.filter(r => r.roomType === 'single').length}
                </h4>
                <p style={{ margin: 0, color: '#0277bd', fontSize: '12px' }}>Single Rooms</p>
              </div>
              <div style={{ 
                padding: '15px', 
                background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#4a148c', fontSize: '24px' }}>
                  {availableRooms.filter(r => r.roomType === 'double').length}
                </h4>
                <p style={{ margin: 0, color: '#6a1b9a', fontSize: '12px' }}>Double Rooms</p>
              </div>
              <div style={{ 
                padding: '15px', 
                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#1b5e20', fontSize: '24px' }}>
                  {availableRooms.filter(r => r.hasAC).length}
                </h4>
                <p style={{ margin: 0, color: '#2e7d32', fontSize: '12px' }}>AC Rooms</p>
              </div>
              <div style={{ 
                padding: '15px', 
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#e65100', fontSize: '24px' }}>
                  {availableRooms.reduce((sum, r) => sum + (r.capacity - r.occupants.length), 0)}
                </h4>
                <p style={{ margin: 0, color: '#ef6c00', fontSize: '12px' }}>Total Vacancies</p>
              </div>
            </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Hostel</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Room</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Floor</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>AC</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Beds</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Vacancies</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Gender</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Annual Fee</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Facilities</th>
                </tr>
              </thead>
              <tbody>
                {availableRooms.map(room => {
                  const vacancy = room.capacity - room.occupants.length;
                  return (
                    <tr key={room._id} style={{ 
                      borderBottom: '1px solid #dee2e6',
                      background: room.hasAC ? '#f1f8ff' : '#ffffff'
                    }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <strong>{room.hostel}</strong>
                          <br />
                          <Link 
                            to={`/student/hostel-details/${hostels.find(h => h.name === room.hostel)?._id}`}
                            style={{ fontSize: '11px', color: '#1976d2', textDecoration: 'none' }}
                          >
                            View Details
                          </Link>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>{room.number}</td>
                      <td style={{ padding: '12px' }}>{room.floor}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          background: '#e3f2fd',
                          color: '#1565c0',
                          borderRadius: '4px',
                          fontSize: '13px',
                          textTransform: 'capitalize',
                          fontWeight: 'bold'
                        }}>
                          {room.roomType || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          background: room.hasAC ? '#e1f5fe' : '#f5f5f5',
                          color: room.hasAC ? '#01579b' : '#666',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {room.hasAC ? '❄️ AC' : '⚪ Non-AC'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{room.capacity}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          background: vacancy > 0 ? '#d4edda' : '#f8d7da',
                          color: vacancy > 0 ? '#155724' : '#721c24',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}>
                          {vacancy} bed{vacancy !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{room.gender}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ 
                            fontSize: '18px', 
                            fontWeight: 'bold', 
                            color: '#2e7d32'
                          }}>
                            ₹{room.feePerYear?.toLocaleString() || 0}
                          </span>
                          <span style={{ fontSize: '10px', color: '#666' }}>/year</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>
                        {room.facilities && room.facilities.length > 0 
                          ? room.facilities.join(', ') 
                          : 'Basic'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: '20px', maxWidth: '600px' }}>
        <h3>Hostel Application Form</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Fill in your preferences to apply for hostel accommodation
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hostel Preference</label>
            <select
              value={formData.hostelPreference}
              onChange={(e) => setFormData({ ...formData, hostelPreference: e.target.value })}
              required
            >
              <option value="">Select Hostel Block</option>
              {hostels.length === 0 ? (
                <option value="" disabled>No hostels available - Contact admin</option>
              ) : (
                hostels.map(hostel => (
                  <option key={hostel._id} value={hostel.name}>
                    {hostel.name} - Block {hostel.block} ({hostel.gender})
                  </option>
                ))
              )}
            </select>
            <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              {hostels.length > 0 
                ? `${hostels.length} hostel(s) available - Select your preferred block`
                : 'No hostels available yet. Please contact admin to create hostel blocks.'}
            </small>
          </div>

          <div className="form-group">
            <label>Room Type Preference</label>
            <select
              value={formData.roomType}
              onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
              required
            >
              <option value="">Select Room Type</option>
              <option value="single">Single (1 bed) - Premium</option>
              <option value="double">Double (2 beds) - Standard</option>
              <option value="triple">Triple (3 beds) - Economy</option>
              <option value="quad">Quad (4 beds) - Budget</option>
            </select>
          </div>

          <div className="form-group">
            <label>AC Preference</label>
            <select
              value={formData.acPreference}
              onChange={(e) => setFormData({ ...formData, acPreference: e.target.value })}
              required
            >
              <option value="">Select AC Preference</option>
              <option value="ac">AC (Higher Fee)</option>
              <option value="non-ac">Non-AC (Lower Fee)</option>
            </select>
            <small style={{ color: '#666', fontSize: '12px' }}>
              AC rooms cost approximately ₹10,000-20,000 more per year
            </small>
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
            <label>Year</label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
              placeholder="Enter your year (1-5)"
            />
          </div>

          {success && <div className="success">{success}</div>}
          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary">Submit Application</button>
        </form>

        <div style={{ marginTop: '30px', padding: '15px', background: '#e8f5e9', borderRadius: '4px', border: '1px solid #66bb6a' }}>
          <h4 style={{ marginBottom: '10px', color: '#2e7d32' }}>💰 Typical Fee Structure:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
            <div style={{ padding: '8px', background: '#fff', borderRadius: '4px' }}>
              <strong>Single AC:</strong> ₹60,000/year
            </div>
            <div style={{ padding: '8px', background: '#fff', borderRadius: '4px' }}>
              <strong>Single Non-AC:</strong> ₹40,000/year
            </div>
            <div style={{ padding: '8px', background: '#fff', borderRadius: '4px' }}>
              <strong>Double AC:</strong> ₹50,000/year
            </div>
            <div style={{ padding: '8px', background: '#fff', borderRadius: '4px' }}>
              <strong>Double Non-AC:</strong> ₹30,000/year
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '10px' }}>Instructions:</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Fill in all required details accurately</li>
            <li>Select your preferred hostel</li>
            <li>Wait for admin to allocate room</li>
            <li>You will be notified once room is allocated</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HostelApplication;
