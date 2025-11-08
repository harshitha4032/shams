import { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const FaceAttendance = () => {
  const { user } = useAuth();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedStudent, setRecognizedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  
  const videoRef = useRef();
  const canvasRef = useRef();
  const intervalRef = useRef();

  useEffect(() => {
    loadModels();
    loadStudentsWithFaceData();
    
    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
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
      setError('Failed to load face recognition models. Please ensure models are in /public/models/');
    }
  };

  const loadStudentsWithFaceData = async () => {
    try {
      // For students, we only need to verify their own face
      const { data } = await api.get('/student/my-face-data');
      setStudents([data]);
    } catch (error) {
      console.error('Error loading student face data:', error);
      setError('Failed to load face data');
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
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
    stopRecognizing();
  };

  const startRecognizing = () => {
    if (!modelsLoaded || !videoRef.current || students.length === 0) {
      alert('Models not loaded or no face data available');
      return;
    }

    setRecognizing(true);
    
    // Start continuous recognition
    intervalRef.current = setInterval(() => {
      recognizeFace();
    }, 3000); // Check every 3 seconds for better performance
  };

  const stopRecognizing = () => {
    setRecognizing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const recognizeFace = async () => {
    if (!modelsLoaded || !videoRef.current || students.length === 0) {
      return;
    }

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        return;
      }

      // Compare with the current student's face data
      const student = students[0]; // Only the current student
      if (student && student.faceDescriptor && student.faceDescriptor.length > 0) {
        const descriptor = new Float32Array(student.faceDescriptor);
        const distance = faceapi.euclideanDistance(detections.descriptor, descriptor);
        
        // Threshold for matching
        if (distance < 0.6) {
          // Verify with profile photo - ONLY mark attendance if both match
          if (student.profilePhoto) {
            try {
              const img = await faceapi.fetchImage(student.profilePhoto);
              const profileDetection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor();

              if (profileDetection) {
                const profileDistance = faceapi.euclideanDistance(
                  detections.descriptor,
                  profileDetection.descriptor
                );

                if (profileDistance < 0.5) {
                  // BOTH face descriptor and profile photo match - mark attendance
                  setRecognizedStudent(student);
                  stopRecognizing();
                  markAttendance(student);
                } else {
                  // Profile photo doesn't match - show alert and DON'T mark attendance
                  alert('❌ Face verification failed! Profile photo does not match the captured face. Please try again.');
                  setRecognizedStudent(null);
                  stopRecognizing();
                }
              } else {
                // Couldn't detect face in profile photo - show alert and DON'T mark attendance
                alert('❌ Face verification failed! Could not detect face in profile photo. Please try again.');
                setRecognizedStudent(null);
                stopRecognizing();
              }
            } catch (profileError) {
              console.warn('Profile photo verification failed:', profileError);
              // Profile photo verification failed - show alert and DON'T mark attendance
              alert('❌ Face verification failed! Could not verify with profile photo. Please try again.');
              setRecognizedStudent(null);
              stopRecognizing();
            }
          } else {
            // No profile photo - show alert and DON'T mark attendance
            alert('❌ Face verification failed! No profile photo available for verification. Please contact administrator.');
            setRecognizedStudent(null);
            stopRecognizing();
          }
        }
      }
    } catch (error) {
      console.error('Error recognizing face:', error);
      alert('Error recognizing face. Please try again.');
    }
  };

  const markAttendance = async (student) => {
    try {
      await api.post('/student/mark-attendance', {
        date: selectedDate,
        status: 'present'
      });

      alert(`✅ Attendance Marked Successfully!
      
Date: ${new Date(selectedDate).toLocaleDateString()}
Status: PRESENT`);
      
    } catch (error) {
      if (error.response?.status === 400) {
        alert(`⚠️ Your attendance is already marked for ${new Date(selectedDate).toLocaleDateString()}`);
      } else {
        alert(error.response?.data?.message || 'Failed to mark attendance. Please try again.');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>📸 Face Recognition Attendance</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Use AI-powered face recognition to mark your attendance</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Date Selector */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <label><strong>Date:</strong></label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          max={new Date().toISOString().split('T')[0]}
          style={{ marginLeft: '10px', padding: '8px' }}
          disabled
        />
        <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
          * Attendance can only be marked for today
        </p>
      </div>

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
              <button onClick={startCamera} className="btn btn-primary">
                Start Camera
              </button>
            ) : (
              <>
                <button onClick={stopCamera} className="btn btn-danger">
                  Stop Camera
                </button>
                {!recognizing ? (
                  <button onClick={startRecognizing} className="btn btn-success" disabled={!modelsLoaded}>
                    Start Recognition
                  </button>
                ) : (
                  <button onClick={stopRecognizing} className="btn btn-warning">
                    Stop Recognition
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recognition Status */}
        <div className="card">
          <h3>Recognition Status</h3>
          
          {recognizing ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>🔍</p>
              <p>Recognizing face...</p>
              <div className="loading-spinner"></div>
            </div>
          ) : recognizedStudent ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>✅</p>
              <p><strong>Face Recognized!</strong></p>
              <p>{recognizedStudent.name}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Attendance has been automatically marked
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>💤</p>
              <p>Waiting for recognition...</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Start camera and recognition to begin
              </p>
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
            <h4>How it works:</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Position your face clearly in the camera</li>
              <li>System will verify both your face descriptor and profile photo</li>
              <li>Attendance will ONLY be marked when BOTH match</li>
              <li>If verification fails, you'll see an alert message</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceAttendance;