import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [emailOrHostelId, setEmailOrHostelId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(emailOrHostelId, password);
      
      // Redirect based on role
      switch (data.user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'warden':
          navigate('/warden');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzqHSxBjDLE0luA6D4MsbYub0vKMSbYmmKjg&s)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '20px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>SHAMS</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Smart Hostel & Accommodation Management System</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Hostel ID</label>
            <input
              type="text"
              value={emailOrHostelId}
              onChange={(e) => setEmailOrHostelId(e.target.value)}
              required
              placeholder="Enter your email or hostel ID"
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              Students can use Hostel ID (e.g., SHAMS24123456)
            </small>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <p style={{ color: '#666' }}>
            Don't have an account? <Link to="/register" style={{ color: '#667eea' }}>Register</Link>
          </p>
          <p style={{ color: '#666' }}>
            <Link to="/forgot-password" style={{ color: '#667eea' }}>Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;