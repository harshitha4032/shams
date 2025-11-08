import mongoose from 'mongoose';

const studentReturnSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  leaveRequest: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LeaveRequest' 
  },
  reportedDate: { 
    type: Date, 
    required: true 
  },
  expectedReturnDate: { 
    type: Date 
  },
  actualReturnDate: { 
    type: Date 
  },
  hostelAccessPermission: { 
    type: String, 
    enum: ['pending', 'approved', 'denied'], 
    default: 'pending' 
  },
  permissionGrantedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  permissionGrantedAt: { 
    type: Date 
  },
  remarks: { 
    type: String 
  },
  // GPS Location Tracking
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    accuracy: Number, // in meters
    timestamp: Date
  }
}, { 
  timestamps: true 
});

export default mongoose.model('StudentReturn', studentReturnSchema);
