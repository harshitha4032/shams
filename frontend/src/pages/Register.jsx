import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QRCodeDisplay from '../components/QRCodeDisplay';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    gender: '',
    year: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register(formData);
      
      // Show QR code display instead of redirecting directly
      setRegisteredUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div>
      {registeredUser ? (
        <QRCodeDisplay user={registeredUser} />
      ) : (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzqHSxBjDLE0luA6D4MsbYub0vKMSbYmmKjg&s)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Register for SHAMS</h2>
              <p style={{ color: '#666', fontSize: '14px' }}>Smart Hostel & Accommodation Management System</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="warden">Warden</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required={formData.role !== 'admin'}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {formData.role === 'admin' && (
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Optional for admin
                  </small>
                )}
              </div>

              {formData.role === 'student' && (
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1"
                    max="5"
                    placeholder="Enter year (1-5)"
                  />
                </div>
              )}

              {error && <div className="error">{error}</div>}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
              Already have an account? <Link to="/login" style={{ color: '#667eea' }}>Login</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
