import { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import api from '../../utils/api';

const FaceAttendance = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [students, setStudents] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedStudent, setRecognizedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const videoRef = useRef();
  const canvasRef = useRef();
  const intervalRef = useRef();

  useEffect(() => {
    loadModels();
    fetchStudents();
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

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/warden/students-face-data');
      setStudents(data);
      console.log(`Loaded ${data.length} students with face data`);
    } catch (error) {
      console.error('Error fetching students:', error);
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const recognizeFace = async () => {
    if (!modelsLoaded || !videoRef.current || students.length === 0) {
      alert('Models not loaded or no students with face data available');
      return;
    }

    setRecognizing(true);

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        alert('❌ No face detected. Please position face clearly in the camera.');
        setRecognizing(false);
        return;
      }

      // Compare with all students
      let bestMatch = null;
      let bestDistance = 0.6; // Threshold

      students.forEach(student => {
        if (student.faceDescriptor && student.faceDescriptor.length > 0) {
          const descriptor = new Float32Array(student.faceDescriptor);
          const distance = faceapi.euclideanDistance(detections.descriptor, descriptor);
          
          if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = student;
          }
        }
      });

      if (bestMatch) {
        // Verify with profile photo - ONLY mark attendance if both match
        if (bestMatch.profilePhoto) {
          try {
            const img = await faceapi.fetchImage(bestMatch.profilePhoto);
            const profileDetection = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (profileDetection) {
              const profileDistance = faceapi.euclideanDistance(
                detections.descriptor,
                profileDetection.descriptor
              );

              console.log(`Match: ${bestMatch.name} - Descriptor: ${bestDistance.toFixed(3)}, Profile: ${profileDistance.toFixed(3)}`);

              if (profileDistance < 0.5) {
                // BOTH face descriptor and profile photo match - Auto-mark as PRESENT
                await markAttendanceAuto(bestMatch, 'present');
              } else {
                // Profile photo doesn't match - show alert and DON'T mark attendance
                alert(`❌ Face verification failed for ${bestMatch.name}! Profile photo does not match the captured face. Please try again.`);
                setRecognizedStudent(null);
                stopRecognizing();
              }
            } else {
              // Couldn't detect face in profile photo - show alert and DON'T mark attendance
              alert(`❌ Face verification failed for ${bestMatch.name}! Could not detect face in profile photo. Please try again.`);
              setRecognizedStudent(null);
              stopRecognizing();
            }
          } catch (profileError) {
            console.warn('Profile photo verification failed:', profileError);
            // Profile photo verification failed - show alert and DON'T mark attendance
            alert(`❌ Face verification failed for ${bestMatch.name}! Could not verify with profile photo. Please try again.`);
            setRecognizedStudent(null);
            stopRecognizing();
          }
        } else {
          // No profile photo - show alert and DON'T mark attendance
          alert(`❌ Face verification failed for ${bestMatch.name}! No profile photo available for verification. Please contact administrator.`);
          setRecognizedStudent(null);
          stopRecognizing();
        }
      } else {
        alert('❌ No matching student found. Please ensure student has registered their face.');
        stopRecognizing();
      }
    } catch (error) {
      console.error('Error recognizing face:', error);
      alert('Error during face recognition. Please try again.');
    } finally {
      setRecognizing(false);
    }
  };

  const startRecognizing = () => {
    setRecognizing(true);
    intervalRef.current = setInterval(recognizeFace, 3000); // Recognize every 3 seconds for better performance
  };

  const stopRecognizing = () => {
    setRecognizing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const markAttendanceAuto = async (student, status) => {
    try {
      await api.post('/warden/attendance-face-recognition', {
        studentId: student._id,
        date: selectedDate,
        status
      });

      // Show success and student info
      setRecognizedStudent(student);
      stopRecognizing();
      
      alert(`✅ Attendance Marked Successfully!

Student: ${student.name}
Hostel ID: ${student.hostelId}
Status: PRESENT
Date: ${new Date(selectedDate).toLocaleDateString()}`);
      
      // Auto-clear after 3 seconds
      setTimeout(() => {
        setRecognizedStudent(null);
      }, 3000);
    } catch (error) {
      if (error.response?.status === 400) {
        alert(`⚠️ ${student.name}'s attendance already marked for ${new Date(selectedDate).toLocaleDateString()}`);
      } else {
        alert(error.response?.data?.message || 'Failed to mark attendance');
      }
    }
  };

  const markAttendance = async (status) => {
    if (!recognizedStudent) return;

    try {
      await api.post('/warden/attendance-face-recognition', {
        studentId: recognizedStudent._id,
        date: selectedDate,
        status
      });

      alert(`✅ Attendance marked as "${status.toUpperCase()}" for ${recognizedStudent.name}\n\nDate: ${new Date(selectedDate).toLocaleDateString()}`);
      setRecognizedStudent(null);
      stopCamera();
    } catch (error) {
      if (error.response?.status === 400) {
        alert(`⚠️ ${recognizedStudent.name}'s attendance is already marked for ${new Date(selectedDate).toLocaleDateString()}`);
      } else {
        alert(error.response?.data?.message || 'Failed to mark attendance. Please try again.');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>📸 Face Recognition Attendance</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Automatically mark student attendance using AI-powered face recognition</p>
      </div>

      {/* Date Selector */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
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
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            * Attendance can only be marked for today
          </div>
        </div>
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

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '15px' }}>
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
              <p><strong>Student Recognized!</strong></p>
              <p>{recognizedStudent.name}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Hostel ID: {recognizedStudent.hostelId}
              </p>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button 
                  onClick={() => markAttendance('present')} 
                  className="btn btn-success"
                  style={{ padding: '8px 16px' }}
                >
                  ✓ Mark Present
                </button>
                <button 
                  onClick={() => markAttendance('absent')} 
                  className="btn btn-danger"
                  style={{ padding: '8px 16px' }}
                >
                  ✗ Mark Absent
                </button>
                <button 
                  onClick={() => setRecognizedStudent(null)} 
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Clear
                </button>
              </div>
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
            <h4>Instructions:</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Position student's face clearly in the camera</li>
              <li>System will verify BOTH face descriptor and profile photo</li>
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