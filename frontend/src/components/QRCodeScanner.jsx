import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';

const QRCodeScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isScanning && videoRef.current) {
      // Initialize QR scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => {
          try {
            const userData = JSON.parse(result);
            setScannedData(userData);
            setIsScanning(false);
            qrScannerRef.current?.stop();
          } catch (err) {
            setError('Invalid QR code data');
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current.start().catch(err => {
        setError('Failed to access camera: ' + err.message);
        setIsScanning(false);
      });
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [isScanning]);

  const startScanning = () => {
    setError('');
    setScannedData(null);
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
  };

  const handleLogin = () => {
    if (scannedData) {
      // In a real implementation, you would send this data to your backend
      // to authenticate the user. For now, we'll just show an alert.
      alert(`User scanned: ${scannedData.name}\nEmail: ${scannedData.email}\nRole: ${scannedData.role}`);
      
      // Redirect based on role
      switch (scannedData.role) {
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
      backgroundRepeat: 'no-repeat',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>QR Code Scanner</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Scan your QR code to login</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        {isScanning ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '300px', 
              margin: '0 auto 20px',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <video 
                ref={videoRef} 
                style={{ width: '100%', display: 'block' }}
              />
            </div>
            <p>Point your camera at a QR code</p>
            <button 
              onClick={stopScanning}
              className="btn" 
              style={{ marginTop: '15px' }}
            >
              Stop Scanning
            </button>
          </div>
        ) : scannedData ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: '#d4edda', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #c3e6cb'
            }}>
              <h3 style={{ color: '#155724', marginBottom: '15px' }}>QR Code Scanned Successfully!</h3>
              <div style={{ textAlign: 'left', background: 'white', padding: '15px', borderRadius: '5px' }}>
                <p><strong>Name:</strong> {scannedData.name}</p>
                <p><strong>Email:</strong> {scannedData.email}</p>
                <p><strong>Role:</strong> {scannedData.role}</p>
                {scannedData.hostelId && (
                  <p><strong>Hostel ID:</strong> {scannedData.hostelId}</p>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleLogin}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px' }}
            >
              Login as {scannedData.name}
            </button>
            
            <button 
              onClick={() => setScannedData(null)}
              className="btn" 
              style={{ width: '100%', marginTop: '10px' }}
            >
              Scan Another Code
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '40px 20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '2px dashed #ddd'
            }}>
              <p style={{ fontSize: '48px', margin: '0 0 20px 0' }}>📷</p>
              <p>Click below to start scanning QR codes</p>
            </div>
            
            <button 
              onClick={startScanning}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px' }}
            >
              Start Scanning
            </button>
            
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
              <a href="/login" style={{ color: '#667eea' }}>Or login with email/password</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;