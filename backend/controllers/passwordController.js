import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// @desc    Forgot password
// @route   POST /api/password/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No user found with that email address" });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
    <h2>Password Reset Request</h2>
    <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
    <p>Please click on the following link to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    <p>This link will expire in 10 minutes.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ message: "Email could not be sent" });
  }
});

// @desc    Reset password
// @route   POST /api/password/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});