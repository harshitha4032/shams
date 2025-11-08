import asyncHandler from 'express-async-handler';
import MessApplication from '../models/messApplicationModel.js';
import Mess from '../models/messModel.js';
import User from '../models/userModel.js';
import Hostel from '../models/hostelModel.js';

// @desc    Apply for mess
// @route   POST /api/mess/apply
// @access  Private/Student
export const applyForMess = asyncHandler(async (req, res) => {
  const { hostel, mess, preference } = req.body;

  // Check if student already has an active application
  const existingApplication = await MessApplication.findOne({
    student: req.user._id,
    status: 'pending'
  });

  if (existingApplication) {
    return res.status(400).json({ 
      message: 'You already have a pending mess application' 
    });
  }

  // Check if student is already assigned to a mess
  const student = await User.findById(req.user._id);
  if (student.mess) {
    return res.status(400).json({ 
      message: 'You are already assigned to a mess' 
    });
  }

  // Create new application
  const application = new MessApplication({
    student: req.user._id,
    hostel,
    mess,
    preference
  });

  const createdApplication = await application.save();
  
  // Populate references for response
  await createdApplication.populate([
    { path: 'student', select: 'name email hostelId' },
    { path: 'hostel', select: 'name block' },
    { path: 'mess', select: 'name capacity menuType' }
  ]);

  res.status(201).json(createdApplication);
});

// @desc    Get student's mess applications
// @route   GET /api/mess/applications
// @access  Private/Student
export const getStudentMessApplications = asyncHandler(async (req, res) => {
  const applications = await MessApplication.find({ student: req.user._id })
    .populate([
      { path: 'hostel', select: 'name block' },
      { path: 'mess', select: 'name capacity menuType' },
      { path: 'approvedBy', select: 'name' }
    ])
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Get mess applications for warden (for their hostel)
// @route   GET /api/mess/applications/warden
// @access  Private/Warden
export const getWardenMessApplications = asyncHandler(async (req, res) => {
  // Get the hostel assigned to this warden
  const warden = await User.findById(req.user._id);
  if (!warden.assignedHostel) {
    return res.status(400).json({ 
      message: 'You are not assigned to any hostel' 
    });
  }

  // Find messes for this hostel
  const hostelMesses = await Mess.find({ 
    hostel: warden.assignedHostel,
    isActive: true 
  });

  const messIds = hostelMesses.map(mess => mess._id);

  const applications = await MessApplication.find({ 
    mess: { $in: messIds }
  })
    .populate([
      { path: 'student', select: 'name email hostelId year' },
      { path: 'hostel', select: 'name block' },
      { path: 'mess', select: 'name capacity menuType' }
    ])
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Approve/reject mess application
// @route   PUT /api/mess/applications/:id
// @access  Private/Warden
export const updateMessApplication = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const application = await MessApplication.findById(req.params.id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  // Check if warden is authorized to approve this application
  const warden = await User.findById(req.user._id);
  const mess = await Mess.findById(application.mess);
  
  if (!mess || mess.hostel.toString() !== warden.assignedHostel.toString()) {
    return res.status(403).json({ 
      message: 'You are not authorized to approve this application' 
    });
  }

  // Update application
  application.status = status;
  application.remarks = remarks;
  application.approvedBy = req.user._id;
  application.approvedAt = Date.now();

  const updatedApplication = await application.save();

  // If approved, assign mess to student
  if (status === 'approved') {
    const student = await User.findById(application.student);
    student.mess = application.mess;
    await student.save();
  }

  // Populate references for response
  await updatedApplication.populate([
    { path: 'student', select: 'name email hostelId' },
    { path: 'hostel', select: 'name block' },
    { path: 'mess', select: 'name capacity menuType' },
    { path: 'approvedBy', select: 'name' }
  ]);

  res.json(updatedApplication);
});

// @desc    Get mess analytics
// @route   GET /api/mess/analytics
// @access  Private/Warden/Admin
export const analytics = asyncHandler(async (req, res) => {
  const match = {};
  
  if (req.user.role === 'warden') {
    // Wardens can only see analytics for their assigned hostel
    const warden = await User.findById(req.user._id);
    if (warden.assignedHostel) {
      match.hostel = warden.assignedHostel;
    } else {
      return res.json({
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        messDistribution: []
      });
    }
  }

  const applications = await MessApplication.find(match);
  
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const approvedApplications = applications.filter(a => a.status === 'approved').length;
  const rejectedApplications = applications.filter(a => a.status === 'rejected').length;
  
  // Get mess distribution
  const messDistribution = await MessApplication.aggregate([
    { $match: match },
    { $group: { 
        _id: '$mess', 
        count: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
      } 
    },
    { $lookup: {
        from: 'messes',
        localField: '_id',
        foreignField: '_id',
        as: 'messDetails'
      }
    },
    { $unwind: '$messDetails' },
    { $project: {
        name: '$messDetails.name',
        total: '$count',
        approved: 1
      }
    }
  ]);

  res.json({
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    messDistribution
  });
});

// @desc    Add feedback to mess
// @route   POST /api/mess/feedback
// @access  Private/Student/Warden
export const addFeedback = asyncHandler(async (req, res) => {
  // This is already implemented in the existing messController
  // Keeping this as a placeholder for consistency
  res.status(501).json({ message: 'Not implemented in this controller' });
});