import asyncHandler from "express-async-handler";
import Room from "../models/roomModel.js";
import Notice from "../models/noticeModel.js";
import Complaint from "../models/complaintModel.js";
import LeaveRequest from "../models/leaveRequestModel.js";
import User from "../models/userModel.js";
import Hostel from "../models/hostelModel.js";
import MessMenu from "../models/messMenuModel.js";
import Attendance from "../models/attendanceModel.js";

export const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json(room);
});

export const listRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find().populate('occupants', 'name email').populate('assignedWarden', 'name email');
  res.json(rooms);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const room = await Room.findByIdAndUpdate(id, req.body, { new: true });
  res.json(room);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Room.findByIdAndDelete(id);
  res.json({ message: 'Room deleted successfully' });
});

export const createNotice = asyncHandler(async (req, res) => {
  const n = await Notice.create(req.body);
  res.status(201).json(n);
});

export const dashboardStats = asyncHandler(async (req, res) => {
  const [rooms, students, wardens, complaints, leaves, pendingComplaints] = await Promise.all([
    Room.find(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'warden' }),
    Complaint.countDocuments(),
    LeaveRequest.countDocuments(),
    Complaint.countDocuments({ status: 'pending' })
  ]);
  
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.occupants.length > 0).length;
  const totalStudents = students;
  const totalComplaints = complaints;
  const totalLeaves = leaves;
  
  res.json({ 
    totalStudents,
    totalRooms, 
    occupiedRooms, 
    totalComplaints,
    pendingComplaints,
    totalLeaves,
    totalWardens: wardens
  });
});

// Assign warden to hostel/floor
export const assignWarden = asyncHandler(async (req, res) => {
  const { wardenId, hostel, floor } = req.body;
  
  const warden = await User.findById(wardenId);
  if (!warden || warden.role !== 'warden') {
    return res.status(400).json({ message: 'Invalid warden ID' });
  }
  
  warden.assignedHostel = hostel;
  warden.assignedFloor = floor;
  await warden.save();
  
  // Update rooms with assigned warden
  await Room.updateMany(
    { hostel, floor },
    { assignedWarden: wardenId }
  );
  
  res.json({ message: 'Warden assigned successfully', warden });
});

// List all wardens
export const listWardens = asyncHandler(async (req, res) => {
  const wardens = await User.find({ role: 'warden' }).select('-password');
  res.json(wardens);
});

// Get warden leave requests
export const getWardenLeaves = asyncHandler(async (req, res) => {
  const leaves = await LeaveRequest.find()
    .populate('student', 'name email role')
    .sort({ createdAt: -1 });
  
  // Filter for warden leaves
  const wardenLeaves = [];
  for (let leave of leaves) {
    if (leave.student && leave.student.role === 'warden') {
      wardenLeaves.push(leave);
    }
  }
  
  res.json(wardenLeaves);
});

// Approve/Reject warden leave
export const approveWardenLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const leave = await LeaveRequest.findByIdAndUpdate(
    id,
    { status, approver: req.user._id },
    { new: true }
  ).populate('student', 'name email role');
  
  res.json(leave);
});

// Get maintenance reports
export const getMaintenanceReports = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ maintenanceStatus: { $ne: 'good' } })
    .populate('assignedWarden', 'name email');
  
  const complaints = await Complaint.find({ type: { $in: ['plumbing', 'electricity'] } })
    .populate('student', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);
  
  res.json({ rooms, complaints });
});

// Create hostel
export const createHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.create(req.body);
  res.status(201).json(hostel);
});

// List all hostels
export const listHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find().populate('warden', 'name email');
  res.json(hostels);
});

// Update hostel
export const updateHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hostel = await Hostel.findByIdAndUpdate(id, req.body, { new: true });
  res.json(hostel);
});

// Delete hostel
export const deleteHostel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Hostel.findByIdAndDelete(id);
  res.json({ message: 'Hostel deleted successfully' });
});

// Create mess menu
export const createMessMenu = asyncHandler(async (req, res) => {
  const menu = await MessMenu.create(req.body);
  res.status(201).json(menu);
});

// Get mess menus (with date filter)
export const getMessMenus = asyncHandler(async (req, res) => {
  const { date, startDate, endDate } = req.query;
  const query = { isActive: true };
  
  if (date) {
    query.date = new Date(date);
  } else if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const menus = await MessMenu.find(query).sort({ date: 1, mealType: 1 });
  res.json(menus);
});

// Update mess menu
export const updateMessMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menu = await MessMenu.findByIdAndUpdate(id, req.body, { new: true });
  res.json(menu);
});

// Delete mess menu
export const deleteMessMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await MessMenu.findByIdAndDelete(id);
  res.json({ message: 'Menu deleted successfully' });
});

// Mark warden attendance (Admin only)
export const markWardenAttendance = asyncHandler(async (req, res) => {
  const { userId, date, status, remarks } = req.body;
  
  const attendance = await Attendance.findOneAndUpdate(
    { user: userId, date: new Date(date) },
    { user: userId, date: new Date(date), status, markedBy: req.user._id, remarks },
    { upsert: true, new: true }
  ).populate('user', 'name email role');
  
  res.json(attendance);
});

// Get warden attendance
export const getWardenAttendance = asyncHandler(async (req, res) => {
  const { date, userId } = req.query;
  const query = { 'user.role': 'warden' };
  
  if (date) query.date = new Date(date);
  if (userId) query.user = userId;
  
  const attendance = await Attendance.find(query)
    .populate('user', 'name email role')
    .populate('markedBy', 'name')
    .sort({ date: -1 });
  
  // Filter for wardens only
  const wardenAttendance = attendance.filter(a => a.user && a.user.role === 'warden');
  res.json(wardenAttendance);
});

// Update student hostel assignment
export const updateStudentHostel = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { hostelId, roomId } = req.body;
  
  // Find the student
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  // Find the hostel
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    return res.status(404).json({ message: 'Hostel not found' });
  }
  
  // Update student's hostel assignment
  student.assignedHostel = hostel.name;
  
  // If a room is provided, update the room assignment
  if (roomId) {
    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Remove student from previous room if exists
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { occupants: studentId }
      });
    }
    
    // Add student to new room
    room.occupants.push(studentId);
    await room.save();
    
    // Update student's room
    student.room = roomId;
  } else {
    // If no room is provided, remove student from current room if exists
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { occupants: studentId }
      });
      student.room = null;
    }
  }
  
  await student.save();
  
  res.json({ 
    message: 'Student hostel assignment updated successfully',
    student: {
      _id: student._id,
      name: student.name,
      assignedHostel: student.assignedHostel,
      room: student.room
    }
  });
});
