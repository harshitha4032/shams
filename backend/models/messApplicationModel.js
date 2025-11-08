import mongoose from 'mongoose';

const messApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: true
  },
  preference: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  remarks: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
messApplicationSchema.index({ student: 1 });
messApplicationSchema.index({ hostel: 1 });
messApplicationSchema.index({ status: 1 });

export default mongoose.model('MessApplication', messApplicationSchema);