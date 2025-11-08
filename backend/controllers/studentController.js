import asyncHandler from "express-async-handler";
import Hostel from '../models/hostelModel.js';
import Room from '../models/roomModel.js';
import Mess from '../models/messModel.js';
import Complaint from "../models/complaintModel.js";
import LeaveRequest from "../models/leaveRequestModel.js";
import Notice from "../models/noticeModel.js";
import HealthIssue from "../models/healthIssueModel.js";
import User from "../models/userModel.js";
import Attendance from "../models/attendanceModel.js";
import HostelRequest from "../models/hostelRequestModel.js";

// Submit hostel request for warden approval
export const applyHostel = asyncHandler(async (req, res) => {
  const { hostelPreference, roomType, acPreference, gender, year } = req.body;
  
  // Check if student already has a pending request
  const existingRequest = await HostelRequest.findOne({
    student: req.user._id,
    status: 'pending'
  });
  
  if (existingRequest) {
    return res.status(400).json({ 
      message: "You already have a pending hostel request. Please wait for warden approval." 
    });
  }
  
  // Create hostel request
  const hostelRequest = new HostelRequest({
    student: req.user._id,
    hostelPreference,
    roomType,
    acPreference,
    gender,
    year
  });
  
  const createdRequest = await hostelRequest.save();
  
  res.status(201).json({
    message: "Hostel request submitted successfully! Wait for warden approval.",
    request: createdRequest
  });
});

// Complaint
export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.create({
    student: req.user._id,
    type: req.body.type,
    description: req.body.description,
    imageUrl: req.file?.path,
  });
  res.status(201).json(complaint);
});

export const myComplaints = asyncHandler(async (req, res) => {
  const list = await Complaint.find({ student: req.user._id }).sort("-createdAt");
  res.json(list);
});

// Leave
export const requestLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.create({ ...req.body, student: req.user._id });
  res.status(201).json(leave);
});

export const myLeaves = asyncHandler(async (req, res) => {
  const list = await LeaveRequest.find({ student: req.user._id }).sort("-createdAt");
  res.json(list);
});

// Notices
export const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({
    $or: [{ audience: "all" }, { audience: "students" }],
  }).sort("-createdAt");
  res.json(notices);
});

// Report health issue
export const reportHealthIssue = asyncHandler(async (req, res) => {
  const healthIssue = await HealthIssue.create({
    ...req.body,
    student: req.user._id
  });
  res.status(201).json(healthIssue);
});

// Get my health issues
export const myHealthIssues = asyncHandler(async (req, res) => {
  const healthIssues = await HealthIssue.find({ student: req.user._id })
    .populate('handledBy', 'name role')
    .sort({ createdAt: -1 });
  res.json(healthIssues);
});

// Upload face descriptor and profile photo for recognition
export const uploadFaceData = asyncHandler(async (req, res) => {
  const { faceDescriptor, faceImage, profilePhoto } = req.body;
  const user = await User.findById(req.user._id);
  
  user.faceDescriptor = faceDescriptor;
  
  if (faceImage) {
    user.faceImageUrl = faceImage;
  }
  
  // Save as profile photo
  if (profilePhoto) {
    user.profilePhoto = profilePhoto;
  } else if (faceImage && !user.profilePhoto) {
    user.profilePhoto = faceImage;
  }
  
  await user.save();
  
  res.json({ 
    message: 'Face data uploaded successfully',
    user: {
      _id: user._id,
      profilePhoto: user.profilePhoto,
      faceDescriptor: user.faceDescriptor
    }
  });
});

export const markOwnAttendance = asyncHandler(async (req, res) => {
  const { date, status } = req.body;
  console.log('Marking attendance with data:', { date, status });
  
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
  
  // Prepare attendance data
  const attendanceData = {
    user: req.user._id,
    date: new Date(date),
    status: status || 'present',
    markedBy: req.user._id,
    remarks: 'Self Attendance - Face Recognition'
  };
  
  const existingAttendance = await Attendance.findOne({
    user: req.user._id,
    date: new Date(date)
  });
  
  if (existingAttendance) {
    return res.status(400).json({ message: 'Attendance already marked for this date' });
  }
  
  const attendance = await Attendance.create(attendanceData);
  res.status(201).json(attendance);
});

// Get my face data for recognition
export const getMyFaceData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('name hostelId faceDescriptor profilePhoto');
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json(user);
});

// Get my attendance records
export const getMyAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const query = { user: req.user._id };
  
  if (date) {
    query.date = new Date(date);
  }
  
  const attendance = await Attendance.find(query)
    .populate('markedBy', 'name role')
    .sort({ date: -1 });
  
  res.json(attendance);
});

// Get my hostel requests
export const getMyHostelRequests = asyncHandler(async (req, res) => {
  const requests = await HostelRequest.find({ student: req.user._id })
    .populate('assignedRoom', 'number hostel floor')
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 });
  
  res.json(requests);
});

// Get available rooms for hostel application
export const getAvailableRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({})
    .populate('assignedWarden', 'name email')
    .populate('occupants', 'name email hostelId');
  
  // Filter rooms with vacancies
  const roomsWithVacancy = rooms.filter(room => room.occupants.length < room.capacity);
  
  res.json(roomsWithVacancy);
});

// Get hostel details including messes for student
export const getHostelDetails = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id).populate('warden', 'name email');
  
  if (hostel) {
    // Get messes for this hostel
    const messes = await Mess.find({ hostel: hostel._id });
    
    res.json({
      hostel,
      messes
    });
  } else {
    res.status(404).json({ message: 'Hostel not found' });
  }
});

// Get warden details for student's assigned hostel
export const getWardenDetails = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id);
  
  if (!student || student.role !== 'student') {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  if (!student.assignedHostel) {
    return res.status(404).json({ message: 'Student not assigned to a hostel' });
  }
  
  // Find the warden assigned to the student's hostel
  const warden = await User.findOne({
    role: 'warden',
    assignedHostel: student.assignedHostel
  }).select('name email assignedHostel assignedFloor');
  
  if (!warden) {
    return res.status(404).json({ message: 'No warden assigned to this hostel' });
  }
  
  res.json(warden);
});
