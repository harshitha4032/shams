import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, gender, year } = req.body;
  
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ 
    name, 
    email, 
    password, 
    role, 
    gender, 
    year
    // hostelId will be auto-generated for students in pre-save hook
  });
  
  const token = generateToken(user._id, user.role);
  
  res.status(201).json({
    message: role === 'student' ? `Registration successful! Your Hostel ID is: ${user.hostelId}` : 'Registration successful!',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      year: user.year,
      hostelId: user.hostelId,
      profilePhoto: user.profilePhoto,
      faceDescriptor: user.faceDescriptor
    },
    token
  });
});

// Login (accept email or hostel ID)
export const login = asyncHandler(async (req, res) => {
  const { emailOrHostelId, password } = req.body;
  
  // Find user by email or hostel ID
  const user = await User.findOne({
    $or: [
      { email: emailOrHostelId },
      { hostelId: emailOrHostelId }
    ]
  });
  
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  const token = generateToken(user._id, user.role);
  
  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      year: user.year,
      hostelId: user.hostelId,
      room: user.room,
      profilePhoto: user.profilePhoto,
      faceDescriptor: user.faceDescriptor
    },
    token
  });
});

// Upload profile photo after registration
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const { userId, profilePhoto } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.profilePhoto = profilePhoto;
  await user.save();
  
  res.json({ message: 'Profile photo uploaded successfully' });
});
