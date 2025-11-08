import { useState, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProfilePhotoCapture = ({ userId, userRole, onComplete, onSkip }) => {
  const { setUser } = useAuth();
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. You can skip and add photo later.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoData);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const uploadPhoto = async () => {
    setUploading(true);
    try {
      await api.post('/auth/upload-profile-photo', {
        userId,
        profilePhoto: capturedPhoto
      });
      
      // Update user data in localStorage and context
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.profilePhoto = capturedPhoto;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      
      alert('✅ Profile photo uploaded successfully!');
      onComplete();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '10px' }}>📸 Add Profile Photo</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Take a photo for your profile. This helps with identification.
        </p>

        {!cameraActive && !capturedPhoto && (
          <div>
            <div style={{
              padding: '60px',
              background: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '64px', margin: 0 }}>📷</p>
              <p style={{ color: '#666' }}>Click start to capture your photo</p>
            </div>
            <button onClick={startCamera} className="btn btn-primary" style={{ marginRight: '10px' }}>
              📹 Start Camera
            </button>
            <button onClick={onSkip} className="btn" style={{ background: '#6c757d', color: 'white' }}>
              Skip for Now
            </button>
          </div>
        )}

        {cameraActive && (
          <div>
            <div style={{
              position: 'relative',
              marginBottom: '20px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#000'
            }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{ width: '100%', maxHeight: '400px', display: 'block' }}
              />
            </div>
            <button onClick={capturePhoto} className="btn btn-primary" style={{ marginRight: '10px' }}>
              📸 Capture Photo
            </button>
            <button onClick={() => { stopCamera(); onSkip(); }} className="btn" style={{ background: '#6c757d', color: 'white' }}>
              Cancel
            </button>
          </div>
        )}

        {capturedPhoto && (
          <div>
            <div style={{
              marginBottom: '20px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '3px solid #28a745'
            }}>
              <img src={capturedPhoto} alt="Captured" style={{ width: '100%', maxHeight: '400px', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={uploadPhoto} 
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? '⏳ Uploading...' : '✓ Use This Photo'}
              </button>
              <button onClick={retakePhoto} className="btn" style={{ background: '#ffc107', color: 'white' }}>
                🔄 Retake
              </button>
              <button onClick={onSkip} className="btn" style={{ background: '#6c757d', color: 'white' }}>
                Skip
              </button>
            </div>
          </div>
        )}

        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          You can add or change your profile photo later from settings
        </p>
      </div>
    </div>
  );
};

export default ProfilePhotoCapture;
