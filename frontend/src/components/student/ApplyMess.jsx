import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ApplyMess = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [messes, setMesses] = useState([]);
  const [formData, setFormData] = useState({
    hostel: '',
    mess: '',
    preference: 'veg'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/public/hostels');
      setHostels(data);
    } catch (err) {
      console.error('Error fetching hostels:', err);
    }
  };

  const fetchMesses = async (hostelId) => {
    try {
      // Use the new student endpoint for hostel details
      const { data } = await api.get(`/student/hostels/${hostelId}/details`);
      setMesses(data.messes || []);
    } catch (err) {
      console.error('Error fetching messes:', err);
    }
  };

  const handleHostelChange = (e) => {
    const hostelId = e.target.value;
    setFormData({ ...formData, hostel: hostelId, mess: '' });
    if (hostelId) {
      fetchMesses(hostelId);
    } else {
      setMesses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/mess/apply', formData);
      setSuccess('Mess application submitted successfully!');
      setFormData({ hostel: '', mess: '', preference: 'veg' });
      // Redirect to mess applications page after 2 seconds
      setTimeout(() => {
        navigate('/student/mess-applications');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit application';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Apply for Mess</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Select your preferred mess and food preference</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h3>Mess Application Form</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hostel</label>
            <select
              value={formData.hostel}
              onChange={handleHostelChange}
              required
            >
              <option value="">Select Hostel</option>
              {hostels.map(hostel => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name} - Block {hostel.block} ({hostel.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mess</label>
            <select
              value={formData.mess}
              onChange={(e) => setFormData({ ...formData, mess: e.target.value })}
              required
              disabled={!formData.hostel}
            >
              <option value="">Select Mess</option>
              {messes.map(mess => (
                <option key={mess._id} value={mess._id}>
                  {mess.name} ({mess.menuType}) - Capacity: {mess.capacity}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Food Preference</label>
            <select
              value={formData.preference}
              onChange={(e) => setFormData({ ...formData, preference: e.target.value })}
            >
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>

          {success && <div className="success">{success}</div>}
          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !formData.hostel || !formData.mess}
          >
            {loading ? 'Submitting...' : 'Apply for Mess'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Instructions</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Select your hostel from the dropdown list</li>
          <li>Select an available mess from your hostel</li>
          <li>Choose your food preference (Vegetarian or Non-Vegetarian)</li>
          <li>Your application will be reviewed by the hostel warden</li>
          <li>You will receive a notification once your application is approved or rejected</li>
        </ul>
      </div>
    </div>
  );
};

export default ApplyMess;