import asyncHandler from "express-async-handler";
import Complaint from "../models/complaintModel.js";
import LeaveRequest from "../models/leaveRequestModel.js";
import Room from "../models/roomModel.js";
import User from "../models/userModel.js";
import Attendance from "../models/attendanceModel.js";
import HealthIssue from "../models/healthIssueModel.js";
import HostelRequest from "../models/hostelRequestModel.js";
import { markStudentReturned } from "../services/autoAttendanceService.js";

export const listComplaints = asyncHandler(async (req, res) => {
  const items = await Complaint.find().populate("student", "name email");
  res.json(items);
});

export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const c = await Complaint.findByIdAndUpdate(id, { status, remarks }, { new: true }).populate('student', 'name email');
  
  // Emit real-time update via Socket.io
  const io = req.app.get('io');
  if (io && c) {
    io.emit('complaint-updated', {
      complaintId: c._id,
      studentId: c.student._id,
      status: c.status,
      remarks: c.remarks,
      timestamp: new Date()
    });
    console.log(`📡 Real-time update sent: Complaint ${id} -> ${status}`);
  }
  
  res.json(c);
});

export const approveLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const l = await LeaveRequest.findByIdAndUpdate(
    id,
    { status, approver: req.user._id },
    { new: true }
  ).populate('student', 'name email');
  
  // Emit real-time update via Socket.io
  const io = req.app.get('io');
  if (io && l) {
    io.emit('leave-updated', {
      leaveId: l._id,
      studentId: l.student._id,
      status: l.status,
      timestamp: new Date()
    });
    console.log(`📡 Real-time update sent: Leave ${id} -> ${status}`);
  }
  
  res.json(l);
});

export const listLeaves = asyncHandler(async (req, res) => {
  const items = await LeaveRequest.find().populate("student", "name email");
  res.json(items);
});

export const allocateRoom = asyncHandler(async (req, res) => {
  const { userId, roomId } = req.body;
  
  // Find the room
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: "Room not found" });
  
  // Check room capacity
  if (room.occupants.length >= room.capacity)
    return res.status(400).json({ message: "Room full" });
  
  // Find the student
  const student = await User.findById(userId);
  if (!student) return res.status(404).json({ message: "Student not found" });
  
  // Check gender compatibility
  if (room.gender !== student.gender) {
    return res.status(400).json({ message: "Gender mismatch between student and room" });
  }
  
  // Add student to room if not already added
  if (!room.occupants.includes(userId)) room.occupants.push(userId);
  await room.save();
  
  // Update student with room assignment
  student.room = roomId;
  await student.save();
  
  // Populate room details for response
  await room.populate('occupants', 'name email');
  
  res.json({
    message: "Room allocated successfully",
    room
  });
});

// Mark student attendance (Warden only)
export const markStudentAttendance = asyncHandler(async (req, res) => {
  const { userId, date, status, remarks } = req.body;
  
  // Prepare attendance data
  const attendanceData = {
    user: userId,
    date: new Date(date),
    status,
    markedBy: req.user._id,
    remarks
  };
  
  const attendance = await Attendance.findOneAndUpdate(
    { user: userId, date: new Date(date) },
    attendanceData,
    { upsert: true, new: true }
  ).populate('user', 'name email role hostelId');
  
  res.json(attendance);
});

// Get student attendance
export const getStudentAttendance = asyncHandler(async (req, res) => {
  const { date, userId } = req.query;
  const query = {};
  
  if (date) query.date = new Date(date);
  if (userId) query.user = userId;
  
  const attendance = await Attendance.find(query)
    .populate('user', 'name email role hostelId year')
    .populate('markedBy', 'name')
    .sort({ date: -1 });
  
  // Filter for students only
  const studentAttendance = attendance.filter(a => a.user && a.user.role === 'student');
  res.json(studentAttendance);
});

// Get all students for attendance
export const getStudentsList = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('name email hostelId year room')
    .populate('room', 'number hostel');
  res.json(students);
});

// Get students with face data for recognition
export const getStudentsWithFaceData = asyncHandler(async (req, res) => {
  const students = await User.find({ 
    role: 'student',
    faceDescriptor: { $exists: true, $ne: [] }
  }).select('_id name hostelId email year faceDescriptor profilePhoto');
  
  res.json(students);
});

// Mark attendance via face recognition
export const markAttendanceByFace = asyncHandler(async (req, res) => {
  const { studentId, date, status } = req.body;
  console.log('Marking attendance by face with data:', { studentId, date, status });
  
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
  
  // Check if attendance already exists for this student and date
  const existingAttendance = await Attendance.findOne({
    user: studentId,
    date: new Date(date)
  });
  
  let attendance;
  
  if (existingAttendance) {
    // Update existing attendance
    attendance = await Attendance.findByIdAndUpdate(
      existingAttendance._id,
      {
        status,
        markedBy: req.user._id,
        remarks: 'Face Recognition (Updated)'
      },
      { new: true }
    ).populate('user', 'name email role hostelId');
  } else {
    // Prepare attendance data
    const attendanceData = {
      user: studentId,
      date: new Date(date),
      status,
      markedBy: req.user._id,
      remarks: 'Face Recognition'
    };
    
    // Create new attendance record
    attendance = await Attendance.create(attendanceData);
    attendance = await attendance.populate('user', 'name email role hostelId');
  }
  
  res.json(attendance);
});

// Get all health issues reported by students
export const getAllHealthIssues = asyncHandler(async (req, res) => {
  const healthIssues = await HealthIssue.find()
    .populate('student', 'name email hostelId')
    .populate('handledBy', 'name role')
    .sort({ createdAt: -1 });
  res.json(healthIssues);
});

// Update health issue status
export const updateHealthIssueStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const healthIssue = await HealthIssue.findByIdAndUpdate(
    id,
    { 
      ...updateData,
      handledBy: req.user._id 
    },
    { new: true }
  )
    .populate('student', 'name email hostelId')
    .populate('handledBy', 'name role');
  
  if (!healthIssue) {
    return res.status(404).json({ message: 'Health issue not found' });
  }
  
  res.json(healthIssue);
});

// Mark student as returned from leave
export const markStudentReturnedFromLeave = asyncHandler(async (req, res) => {
  const { leaveId } = req.params;
  const { returnDate } = req.body;
  
  const result = await markStudentReturned(leaveId, returnDate);
  
  res.json({
    message: 'Student marked as returned from leave',
    leave: result.leave
  });
});

// List all hostel requests
export const listHostelRequests = asyncHandler(async (req, res) => {
  const requests = await HostelRequest.find()
    .populate('student', 'name email hostelId year')
    .populate('assignedRoom', 'number hostel floor')
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 });
  
  res.json(requests);
});

// Approve or reject hostel request
export const processHostelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, roomId, remarks } = req.body;
  
  // Validate status
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
  }
  
  // Find the hostel request
  const hostelRequest = await HostelRequest.findById(id).populate('student');
  if (!hostelRequest) {
    return res.status(404).json({ message: 'Hostel request not found' });
  }
  
  // If already processed, return error
  if (hostelRequest.status !== 'pending') {
    return res.status(400).json({ message: 'Hostel request already processed' });
  }
  
  // Update the hostel request
  hostelRequest.status = status;
  hostelRequest.approvedBy = req.user._id;
  hostelRequest.remarks = remarks;
  
  // If approved, assign room
  if (status === 'approved' && roomId) {
    hostelRequest.assignedRoom = roomId;
    
    // Update room with student
    const room = await Room.findById(roomId);
    if (room && !room.occupants.includes(hostelRequest.student._id)) {
      room.occupants.push(hostelRequest.student._id);
      await room.save();
    }
    
    // Update student with room assignment
    hostelRequest.student.room = roomId;
    await hostelRequest.student.save();
  }
  
  const updatedRequest = await hostelRequest.save();
  
  // Populate for response
  await updatedRequest.populate([
    { path: 'student', select: 'name email hostelId' },
    { path: 'assignedRoom', select: 'number hostel floor' },
    { path: 'approvedBy', select: 'name' }
  ]);
  
  res.json(updatedRequest);
});