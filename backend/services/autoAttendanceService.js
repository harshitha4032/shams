import LeaveRequest from '../models/leaveRequestModel.js';
import Attendance from '../models/attendanceModel.js';
import User from '../models/userModel.js';

// Auto-mark attendance for students on approved leave
export const autoMarkLeaveAttendance = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all approved leaves that are active today and student hasn't returned
    const activeLeaves = await LeaveRequest.find({
      status: 'approved',
      hasReturned: false,
      fromDate: { $lte: today },
      toDate: { $gte: today },
      autoAttendanceEnabled: true
    }).populate('student', 'name hostelId');

    console.log(`📅 Auto-attendance: Found ${activeLeaves.length} students on leave today`);

    for (const leave of activeLeaves) {
      if (!leave.student) continue;

      // Check if attendance already marked for today
      const existingAttendance = await Attendance.findOne({
        user: leave.student._id,
        date: today
      });

      if (!existingAttendance) {
        // Auto-mark as "leave"
        await Attendance.create({
          user: leave.student._id,
          date: today,
          status: 'leave',
          markedBy: leave.approver || leave.student._id,
          remarks: `Auto-marked: On approved leave (${leave.reason})`
        });

        console.log(`✅ Auto-marked ${leave.student.name} (${leave.student.hostelId}) as ON LEAVE`);
      }
    }

    return { success: true, count: activeLeaves.length };
  } catch (error) {
    console.error('❌ Error in auto-attendance service:', error);
    return { success: false, error: error.message };
  }
};

// Mark student as returned from leave
export const markStudentReturned = async (leaveRequestId, returnDate) => {
  try {
    const leave = await LeaveRequest.findById(leaveRequestId);
    
    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'approved') {
      throw new Error('Leave is not approved');
    }

    leave.hasReturned = true;
    leave.returnedDate = returnDate || new Date();
    await leave.save();

    console.log(`🏠 Student returned from leave: Leave ID ${leaveRequestId}`);
    
    return { success: true, leave };
  } catch (error) {
    console.error('❌ Error marking student as returned:', error);
    throw error;
  }
};
