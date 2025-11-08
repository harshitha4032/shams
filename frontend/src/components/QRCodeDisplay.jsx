import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QRCodeDisplay = ({ user }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Generate QR code URL using the QR server API
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostelId: user.hostelId || null
      };
      
      const qrData = encodeURIComponent(JSON.stringify(userData));
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
      setQrCodeUrl(url);
    }
  }, [user]);

  const handleContinue = () => {
    switch (user.role) {
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
  };

  if (!user) {
    return null;
  }

  return (
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
      <div className="card" style={{ maxWidth: '500px', width: '100%', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Registration Successful!</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Smart Hostel & Accommodation Management System</p>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <h3>Welcome, {user.name}!</h3>
          <p>Your account has been created successfully.</p>
          
          {user.role === 'student' && user.hostelId && (
            <div style={{ background: '#e8f4fd', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Your Hostel ID:</p>
              <p style={{ fontSize: '24px', fontFamily: 'monospace', margin: '0', color: '#2c3e50' }}>
                {user.hostelId}
              </p>
              <p style={{ fontSize: '12px', margin: '10px 0 0 0', color: '#666' }}>
                Save this ID for future logins
              </p>
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>Your QR Code:</p>
          {qrCodeUrl ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}
              />
            </div>
          ) : (
            <p>Generating QR code...</p>
          )}
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            This QR code contains your account information and can be used for quick access
          </p>
        </div>
        
        <button 
          onClick={handleContinue}
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '10px' }}
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;