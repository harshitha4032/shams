import { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const FaceRegistration = () => {
  const { user } = useAuth();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceImageData, setFaceImageData] = useState(null);
  const [registered, setRegistered] = useState(false);
  
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      setModelsLoaded(true);
      console.log('✅ Face recognition models loaded');
    } catch (error) {
      console.error('Error loading models:', error);
      alert('Failed to load face recognition models. Please ensure models are in /public/models/');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const captureFace = async () => {
    if (!modelsLoaded || !videoRef.current) {
      alert('Models not loaded or camera not started');
      return;
    }

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        setFaceDescriptor(Array.from(detections.descriptor));
        
        // Capture image from video
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setFaceImageData(imageData);
        
        alert('✅ Face captured successfully! You can now register.');
      } else {
        alert('❌ No face detected. Please position your face clearly in the camera and try again.');
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      alert('Error during face capture. Please try again.');
    }
  };

  const registerFace = async () => {
    if (!faceDescriptor) {
      alert('Please capture your face first');
      return;
    }

    try {
      // Determine API endpoint based on user role
      const endpoint = user.role === 'warden' ? '/warden/upload-face-data' : '/student/upload-face-data';
      
      await api.post(endpoint, { 
        faceDescriptor,
        faceImage: faceImageData,
        profilePhoto: faceImageData // Also save as profile photo
      });
      
      // Update user data in localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.profilePhoto = faceImageData;
        userData.faceDescriptor = faceDescriptor;
        userData.faceImageUrl = faceImageData;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setRegistered(true);
      stopCamera();
      alert('✅ Face registered successfully! Your photo is now in your profile.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to register face');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>📸 Face Registration</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Register your face for attendance and profile photo</p>
      </div>

      {registered ? (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '40px'
        }}>
          <h1 style={{ fontSize: '64px', margin: 0 }}>✅</h1>
          <h2 style={{ margin: '20px 0 10px 0' }}>Face Registered Successfully!</h2>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Your face data has been registered. {user.role === 'student' ? 'Wardens can now use face recognition to mark your attendance.' : 'You can now use face recognition for attendance.'}
          </p>
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px'
          }}>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>✅ Face descriptor saved</p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>✅ Face photo saved for recognition</p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>✅ Profile photo updated in dashboard</p>
          </div>
          <p style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>
            👉 Check your profile dashboard to see your photo!
          </p>
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: '20px' }}>
          {/* Camera Section */}
          <div className="card">
            <h3>Camera Feed</h3>
            
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '640px',
              margin: '15px auto',
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{ width: '100%', display: cameraActive ? 'block' : 'none' }}
              />
              <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
              
              {!cameraActive && (
                <div style={{ 
                  padding: '80px 20px', 
                  textAlign: 'center', 
                  color: '#666',
                  background: '#f8f9fa'
                }}>
                  <p style={{ fontSize: '48px', margin: 0 }}>📷</p>
                  <p>Camera not started</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {!cameraActive ? (
                <button 
                  onClick={startCamera} 
                  className="btn btn-primary"
                  disabled={!modelsLoaded}
                >
                  {modelsLoaded ? '📹 Start Camera' : '⏳ Loading Models...'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={captureFace} 
                    className="btn btn-primary"
                    disabled={!modelsLoaded}
                  >
                    📸 Capture Face
                  </button>
                  <button 
                    onClick={stopCamera} 
                    className="btn" 
                    style={{ background: '#dc3545', color: 'white' }}
                  >
                    ⏹️ Stop Camera
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preview & Register */}
          <div className="card">
            <h3>Captured Face</h3>
            
            {faceImageData ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <img 
                    src={faceImageData} 
                    alt="Captured Face" 
                    style={{
                      width: '300px',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '4px solid #667eea'
                    }}
                  />
                </div>
                
                <button 
                  onClick={registerFace} 
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '10px' }}
                >
                  ✓ Register Face Data
                </button>
                
                <button 
                  onClick={() => {
                    setFaceDescriptor(null);
                    setFaceImageData(null);
                  }} 
                  className="btn"
                  style={{ width: '100%' }}
                >
                  🔄 Capture Again
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <p style={{ fontSize: '64px', margin: 0 }}>👤</p>
                <p>No face captured yet</p>
                <p style={{ fontSize: '14px' }}>Start camera and click "Capture Face"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>📋 Instructions</h3>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Click "Start Camera" to begin</li>
          <li>Position your face clearly in the camera frame</li>
          <li>Click "Capture Face" to take a snapshot</li>
          <li>Review the captured image</li>
          <li>Click "Register Face Data" to save</li>
          <li>Your photo will be saved as your profile picture</li>
        </ol>

        <div style={{ 
          marginTop: '15px',
          padding: '15px', 
          background: '#e3f2fd',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>💡 Tips for Better Recognition</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#0d47a1' }}>
            <li>Ensure good lighting - avoid shadows on face</li>
            <li>Face should be clearly visible and centered</li>
            <li>Remove glasses, masks, or head coverings if possible</li>
            <li>Look directly at the camera</li>
            <li>Keep a neutral expression</li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '10px',
          padding: '15px', 
          background: '#fff3cd',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#856404'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>⚠️ Important:</p>
          <p style={{ margin: 0 }}>
            This face data will be used for attendance verification. 
            Make sure to capture a clear photo for accurate recognition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;
