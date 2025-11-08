import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hasReturned: { type: Boolean, default: false },
  returnedDate: { type: Date },
  autoAttendanceEnabled: { type: Boolean, default: true } // Auto-mark leave attendance
}, { timestamps: true });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
