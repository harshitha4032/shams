import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { listComplaints, updateComplaintStatus, approveLeave, listLeaves, allocateRoom, markStudentAttendance, getStudentAttendance, getStudentsList, getStudentsWithFaceData, markAttendanceByFace, getAllHealthIssues, updateHealthIssueStatus, markStudentReturnedFromLeave, listHostelRequests, processHostelRequest } from '../controllers/wardenController.js';
import { requestLeave, myLeaves } from '../controllers/studentController.js';
import { getRooms } from '../controllers/adminHostelController.js';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Attendance from '../models/attendanceModel.js';

const router = Router();
router.use(protect, authorize('warden'));

router.get('/complaints', listComplaints);
router.patch('/complaints/:id', updateComplaintStatus);
router.get('/leaves', listLeaves);
router.patch('/leaves/:id', approveLeave);
router.post('/rooms/allocate', allocateRoom);
router.get('/rooms', getRooms);
router.get('/hostel-requests', listHostelRequests);
router.patch('/hostel-requests/:id', processHostelRequest);

// Warden can also request leave
router.post('/request-leave', requestLeave);
router.get('/my-leaves', myLeaves);

// Student Attendance routes
router.post('/student-attendance', markStudentAttendance);
router.get('/student-attendance', getStudentAttendance);
router.get('/students-list', getStudentsList);

// Face recognition attendance
router.get('/students-face-data', getStudentsWithFaceData);
router.post('/attendance-face-recognition', markAttendanceByFace);

// Health issues
router.get('/health-issues', getAllHealthIssues);
router.put('/health-issues/:id', updateHealthIssueStatus);

// Mark student returned from leave
router.post('/leaves/:leaveId/return', markStudentReturnedFromLeave);

// Warden face registration (same as student)
router.post('/upload-face-data', asyncHandler(async (req, res) => {
  const { faceDescriptor, faceImage, profilePhoto } = req.body;
  const user = await User.findById(req.user._id);
  
  user.faceDescriptor = faceDescriptor;
  if (faceImage) user.faceImageUrl = faceImage;
  if (profilePhoto) user.profilePhoto = profilePhoto;
  else if (faceImage && !user.profilePhoto) user.profilePhoto = faceImage;
  
  await user.save();
  res.json({ 
    message: 'Face data uploaded successfully',
    user: { _id: user._id, profilePhoto: user.profilePhoto, faceDescriptor: user.faceDescriptor }
  });
}));

// Check if location is in Vadlamudi using Google Maps Geocoding
const isLocationInVadlamudi = async (coords) => {
  try {
    const [longitude, latitude] = coords;
    console.log('Checking location:', { longitude, latitude });
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyC5j0VtXrK2GlXt7pLj8wD5d34f2x8n9k0'}&language=en`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    console.log('Geocoding response:', data);
    
    if (data.results && data.results.length > 0) {
      // Check if any of the address components contain Vadlamudi
      for (const result of data.results) {
        const address = result.formatted_address.toLowerCase();
        console.log('Checking address:', address);
        if ((address.includes('vadlamudi') || address.includes('vignan') || address.includes('university')) && address.includes('guntur')) {
          console.log('Location verified by address:', address);
          return true;
        }
        
        // Check address components
        for (const component of result.address_components) {
          const name = component.long_name.toLowerCase();
          console.log('Checking component:', name);
          if (name.includes('vadlamudi') || name.includes('vignan') || name.includes('university') || name.includes('గుంటూరు')) { // Guntur in Telugu
            console.log('Location verified by component:', name);
            return true;
          }
        }
      }
    }
    
    console.log('Location not verified');
    return false;
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // If it's a timeout or network error, try fallback
    if (error.name === 'AbortError' || error instanceof TypeError) {
      console.log('Using fallback bounding box check due to timeout/network error');
      return fallbackBoundingBoxCheck(coords);
    }
    
    // Fallback to bounding box if API fails
    console.log('Using fallback bounding box check due to API error');
    return fallbackBoundingBoxCheck(coords);
  }
};

// Fallback bounding box check with extended range
const fallbackBoundingBoxCheck = (coords) => {
  const [longitude, latitude] = coords;
  const isInBounds = (
    longitude >= 80.35 && longitude <= 80.75 &&
    latitude >= 16.25 && latitude <= 16.65
  );
  
  return isInBounds;
};

// Warden self-attendance
router.post('/mark-attendance', asyncHandler(async (req, res) => {
  const { date, status, location } = req.body;
  console.log('Marking warden self-attendance with data:', { date, status, location });
  
  // Validate date - only allow current date
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  
  if (selectedDate.getTime() !== today.getTime()) {
    return res.status(400).json({ 
      message: 'Attendance can only be marked for the current date.'
    });
  }
  
  // Verify location if provided
  if (location && location.coordinates && location.coordinates.length === 2) {
    const locationVerified = await isLocationInVadlamudi(location.coordinates);
    console.log('Location verification result:', locationVerified);
    
    // If location is not verified, don't mark attendance
    if (!locationVerified) {
      console.log('Rejecting attendance due to location verification failure');
      return res.status(400).json({ 
        message: 'Location verification failed. You must be in Vadlamudi, Guntur District, Andhra Pradesh, India to mark attendance.',
        locationVerified: false
      });
    }
  }
  
  const existingAttendance = await Attendance.findOne({
    user: req.user._id,
    date: new Date(date)
  });
  
  if (existingAttendance) {
    return res.status(400).json({ message: 'Attendance already marked for this date' });
  }
  
  // Prepare attendance data
  const attendanceData = {
    user: req.user._id,
    date: new Date(date),
    status: status || 'present',
    markedBy: req.user._id,
    remarks: 'Self Attendance - Face Recognition (Warden)'
  };
  
  // Add GPS location if provided
  if (location && location.coordinates && location.coordinates.length === 2) {
    attendanceData.location = {
      type: 'Point',
      coordinates: [
        parseFloat(location.coordinates[0]), // longitude
        parseFloat(location.coordinates[1])  // latitude
      ],
      accuracy: location.accuracy || null,
      timestamp: location.timestamp ? new Date(location.timestamp) : new Date()
    };
  }
  
  const attendance = await Attendance.create(attendanceData);
  
  res.status(201).json(attendance);
}));

router.get('/my-attendance', asyncHandler(async (req, res) => {
  const { date } = req.query;
  const query = { user: req.user._id };
  
  if (date) query.date = new Date(date);
  
  const attendance = await Attendance.find(query)
    .populate('markedBy', 'name role')
    .sort({ date: -1 });
  
  res.json(attendance);
}));

export default router;
