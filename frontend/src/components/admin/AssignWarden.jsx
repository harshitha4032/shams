import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

const AssignWarden = () => {
  const [wardens, setWardens] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [formData, setFormData] = useState({
    wardenId: '',
    hostel: '',
    floor: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWardens();
    fetchHostelsWithFloorInfo();
  }, []);

  const fetchWardens = async () => {
    try {
      const { data } = await api.get('/admin/wardens');
      setWardens(data);
    } catch (error) {
      console.error('Error fetching wardens:', error);
    }
  };

  const fetchHostelsWithFloorInfo = async () => {
    try {
      // Fetch basic hostel list
      const { data: basicHostels } = await api.get('/admin/hostels');
      
      // Fetch detailed information for each hostel to get floor data
      const detailedHostels = await Promise.all(basicHostels.map(async (hostel) => {
        try {
          const { data: detailedData } = await api.get(`/admin/hostels/${hostel._id}/details`);
          const floors = [...new Set(detailedData.rooms.list.map(room => room.floor))].sort((a, b) => a - b);
          return {
            ...hostel,
            floors: floors,
            totalFloors: floors.length
          };
        } catch (error) {
          console.error(`Error fetching details for hostel ${hostel._id}:`, error);
          return {
            ...hostel,
            floors: [],
            totalFloors: 0
          };
        }
      }));
      
      setHostels(detailedHostels);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      await api.post('/admin/assign-warden', formData);
      setSuccess('Warden assigned successfully!');
      setFormData({ wardenId: '', hostel: '', floor: '' });
      fetchWardens();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign warden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Assign Warden to Hostel</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Assign wardens to specific hostels and floors</p>
        </div>
        <Link to="/admin/warden-floor-assignments" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          View Assignments
        </Link>
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <h3>Assign Warden</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Warden</label>
              <select
                value={formData.wardenId}
                onChange={(e) => setFormData({ ...formData, wardenId: e.target.value })}
                required
              >
                <option value="">Choose a warden</option>
                {wardens.map(warden => (
                  <option key={warden._id} value={warden._id}>
                    {warden.name} - {warden.email}
                    {warden.assignedHostel && ` (Currently: ${warden.assignedHostel} Floor ${warden.assignedFloor})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Hostel Name</label>
              <select
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value, floor: '' })}
                required
              >
                <option value="">Choose a hostel</option>
                {hostels.map(hostel => (
                  <option key={hostel._id} value={hostel.name}>
                    {hostel.name} - Block {hostel.block} ({hostel.gender})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Floor Number</label>
              <select
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                required
                disabled={!formData.hostel}
              >
                <option value="">Select floor</option>
                {formData.hostel && hostels
                  .find(h => h.name === formData.hostel)
                  ?.floors.map(floor => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
              </select>
              {!formData.hostel && (
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Please select a hostel first
                </small>
              )}
            </div>

            {success && <div className="success">{success}</div>}
            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Warden'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Hostel Information</h3>
          <div style={{ marginTop: '15px' }}>
            {hostels.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center' }}>Loading hostel information...</p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {hostels.map(hostel => (
                  <div key={hostel._id} style={{ 
                    padding: '15px', 
                    background: '#f8f9fa', 
                    borderRadius: '4px', 
                    marginBottom: '10px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 5px 0' }}>{hostel.name}</h4>
                      <span style={{ 
                        padding: '2px 8px', 
                        background: hostel.isActive ? '#d4edda' : '#f8d7da',
                        color: hostel.isActive ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {hostel.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>
                      Block {hostel.block} • {hostel.gender} • {hostel.totalRooms} rooms
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>
                      <strong>Floors:</strong> {hostel.totalFloors > 0 ? (
                        <span>{hostel.totalFloors} ({hostel.floors.join(', ')})</span>
                      ) : (
                        <span>None assigned</span>
                      )}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                      <strong>Capacity:</strong> {hostel.totalCapacity} beds
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <h3 style={{ marginTop: '20px' }}>Current Warden Assignments</h3>
          <div style={{ marginTop: '15px' }}>
            {wardens.filter(w => w.assignedHostel).length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center' }}>No wardens assigned yet</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {wardens
                  .filter(w => w.assignedHostel)
                  .sort((a, b) => {
                    // Sort by hostel name first, then by floor number
                    if (a.assignedHostel !== b.assignedHostel) {
                      return a.assignedHostel.localeCompare(b.assignedHostel);
                    }
                    return a.assignedFloor - b.assignedFloor;
                  })
                  .map(warden => (
                    <div key={warden._id} style={{ 
                      padding: '10px', 
                      background: '#e3f2fd', 
                      borderRadius: '4px', 
                      marginBottom: '10px' 
                    }}>
                      <p style={{ margin: '0 0 5px 0' }}><strong>{warden.name}</strong></p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#1565c0' }}>
                        {warden.assignedHostel} - Floor {warden.assignedFloor}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#1565c0' }}>{warden.email}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignWarden;