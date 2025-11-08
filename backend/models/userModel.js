// backend/models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "warden", "admin"], default: "student" },
    gender: { type: String, enum: ["male", "female", "other"] },
    year: { type: Number },
    hostelId: { type: String, unique: true, sparse: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    assignedHostel: { type: String },
    assignedFloor: { type: Number },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Generate hostel ID for students if not exists
  if (this.role === "student" && !this.hostelId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.hostelId = `SHAMS${year}${randomNum}`;
  }
  
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export default mongoose.model("User", userSchema);
