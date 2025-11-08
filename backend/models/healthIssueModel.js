import mongoose from 'mongoose';

const healthIssueSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueType: { 
    type: String, 
    enum: ['illness', 'injury', 'allergy', 'chronic', 'emergency', 'mental_health', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  symptoms: [{ type: String }],
  dateReported: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['reported', 'under_treatment', 'referred', 'resolved', 'closed'], 
    default: 'reported' 
  },
  actionTaken: { type: String },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referredTo: { type: String }, // Hospital/Doctor name
  followUpDate: { type: Date },
  remarks: { type: String }
}, { timestamps: true });

export default mongoose.model('HealthIssue', healthIssueSchema);
