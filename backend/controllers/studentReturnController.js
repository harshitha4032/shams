import asyncHandler from 'express-async-handler';
import StudentReturn from '../models/studentReturnModel.js';
import LeaveRequest from '../models/leaveRequestModel.js';
import User from '../models/userModel.js';

// Student reports return to college
export const reportReturn = asyncHandler(async (req, res) => {
  const { leaveRequestId, expectedReturnDate, remarks, location } = req.body;
  
  // Check if student already reported return for this leave
  const existingReport = await StudentReturn.findOne({
    student: req.user._id,
    leaveRequest: leaveRequestId
  });
  
  if (existingReport) {
    return res.status(400).json({ 
      message: 'Return already reported for this leave request' 
    });
  }
  
  // Create return report with GPS location
  const returnReportData = {
    student: req.user._id,
    leaveRequest: leaveRequestId,
    reportedDate: new Date(),
    expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
    remarks
  };
  
  // Add GPS location if provided
  if (location && location.coordinates && location.coordinates.length === 2) {
    returnReportData.location = {
      type: 'Point',
      coordinates: [
        parseFloat(location.coordinates[0]), // longitude
        parseFloat(location.coordinates[1])  // latitude
      ],
      accuracy: location.accuracy || null,
      timestamp: location.timestamp ? new Date(location.timestamp) : new Date()
    };
  }
  
  // Create return report
  const returnReport = await StudentReturn.create(returnReportData);
  
  // Populate student and leave details
  await returnReport.populate([
    { path: 'student', select: 'name email hostelId' },
    { path: 'leaveRequest' }
  ]);
  
  res.status(201).json({
    message: 'Return reported successfully. Waiting for warden approval.',
    returnReport
  });
});

// Get student's return reports
export const getMyReturnReports = asyncHandler(async (req, res) => {
  const reports = await StudentReturn.find({ student: req.user._id })
    .populate([
      { path: 'student', select: 'name hostelId' },
      { path: 'leaveRequest' },
      { path: 'permissionGrantedBy', select: 'name role' }
    ])
    .sort({ createdAt: -1 });
  
  res.json(reports);
});

// Warden gets all return reports
export const getAllReturnReports = asyncHandler(async (req, res) => {
  const reports = await StudentReturn.find()
    .populate([
      { path: 'student', select: 'name email hostelId year' },
      { path: 'leaveRequest' },
      { path: 'permissionGrantedBy', select: 'name role' }
    ])
    .sort({ createdAt: -1 });
  
  res.json(reports);
});

// Warden grants hostel access permission
export const grantHostelAccess = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  
  const returnReport = await StudentReturn.findById(id);
  
  if (!returnReport) {
    return res.status(404).json({ message: 'Return report not found' });
  }
  
  // Update return report
  returnReport.hostelAccessPermission = status;
  returnReport.permissionGrantedBy = req.user._id;
  returnReport.permissionGrantedAt = new Date();
  returnReport.remarks = remarks || returnReport.remarks;
  
  // If granting access, update actual return date
  if (status === 'approved') {
    returnReport.actualReturnDate = new Date();
    
    // Update leave request if exists
    if (returnReport.leaveRequest) {
      await LeaveRequest.findByIdAndUpdate(
        returnReport.leaveRequest,
        { 
          hasReturned: true,
          returnedDate: new Date()
        }
      );
    }
  }
  
  await returnReport.save();
  
  // Populate details
  await returnReport.populate([
    { path: 'student', select: 'name hostelId' },
    { path: 'leaveRequest' },
    { path: 'permissionGrantedBy', select: 'name role' }
  ]);
  
  const message = status === 'approved' 
    ? '✅ Hostel access permission granted!'
    : status === 'denied'
    ? '❌ Hostel access permission denied.'
    : 'Hostel access permission updated.';
  
  res.json({
    message,
    returnReport
  });
});
