import mongoose from 'mongoose';

const hostelRequestSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  hostelPreference: { 
    type: String, 
    required: true 
  },
  roomType: { 
    type: String, 
    enum: ['single', 'double', 'triple', 'quad'], 
    required: true 
  },
  acPreference: { 
    type: String, 
    enum: ['ac', 'non-ac'], 
    required: true 
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'], 
    required: true 
  },
  year: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  assignedRoom: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room' 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  remarks: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

hostelRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('HostelRequest', hostelRequestSchema);