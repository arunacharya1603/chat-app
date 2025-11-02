import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import passport from "passport";
import { verifyGoogleToken } from "../lib/googleAuth.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../lib/email.js";

export const signup = async (req, res, next) => {
    const { email, fullName, password } = req.body;
    try {
        if (!email || !fullName || !password) return res.status(400).json({ message: "All fields are required" });
        if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters long" });

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already in use" });

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = new User({ 
            email, 
            fullName, 
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry
        });
        
        if (newUser) {
            await newUser.save();
            
            // Send verification email
            const emailSent = await sendVerificationEmail(email, fullName, verificationToken);
            
            if (!emailSent) {
                console.log("Failed to send verification email, but user was created");
            }
            
            res.status(201).json({
                message: "User created successfully. Please check your email to verify your account.",
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
                isVerified: newUser.isVerified
            });
        } else {
            console.log("Error in sign up controller", error);
            res.status(500).json({ message: "Internal server error" });
        }

    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

        // Check if email is verified
        if (!user.isVerified && !user.isGoogleUser) {
            return res.status(403).json({ 
                message: "Please verify your email before logging in.",
                isVerified: false,
                email: user.email
            });
        }

        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
            isVerified: user.isVerified
        });

    } catch (error) {
        next(error);
        console.log("Error in login controller", error.message);
    }
};

export const logout = (req, res, next) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        next("Internal server error", error);
        console.log("Error in logout controller", error.message);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { profilePic } = req.body;
        const userId = await User.findById(req.user._id);
        if (!userId) return res.status(404).json({ message: "User not found" });
        if (!profilePic) return res.status(400).json({ message: "Profile picture is required" });

        const uploadedResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadedResponse.secure_url,
        }, { new: true });

        res.status(200).json({
            _id: updatedUser._id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            profilePic: updatedUser.profilePic,
            createdAt: updatedUser.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.log("Error in update profile controller", error.message);
    }
}

export const checkAuth = (req, res, next) => {
    try {
        res.status(200).json({
            _id: req.user._id,
            email: req.user.email,
            fullName: req.user.fullName,
            profilePic: req.user.profilePic,
            createdAt: req.user.createdAt,
        });
    } catch (error) {
        next(error);
        console.log("Error in check auth controller", error.message);
    }
}

// Google OAuth handlers
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err || !user) {
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
        }
        
        // Generate JWT token for the user
        generateToken(res, user._id);
        
        // Redirect to frontend with success
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/`);
    })(req, res, next);
};

// Verify email endpoint
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }
        
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }
        
        // Update user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();
        
        // Send welcome email
        await sendWelcomeEmail(user.email, user.fullName);
        
        // Generate token and log the user in
        generateToken(res, user._id);
        
        res.status(200).json({
            message: "Email verified successfully!",
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
            isVerified: user.isVerified
        });
    } catch (error) {
        console.log("Error in verify email:", error);
        res.status(500).json({ message: "Failed to verify email" });
    }
};

// Resend verification email endpoint
export const resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }
        
        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = verificationTokenExpiry;
        await user.save();
        
        // Send verification email
        const emailSent = await sendVerificationEmail(email, user.fullName, verificationToken);
        
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send verification email" });
        }
        
        res.status(200).json({ message: "Verification email sent successfully" });
    } catch (error) {
        console.log("Error in resend verification email:", error);
        res.status(500).json({ message: "Failed to resend verification email" });
    }
};

// Request password reset endpoint
export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({ message: "If an account exists with this email, you will receive a password reset link" });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiry = resetTokenExpiry;
        await user.save();
        
        // Send password reset email
        await sendPasswordResetEmail(email, user.fullName, resetToken);
        
        res.status(200).json({ message: "If an account exists with this email, you will receive a password reset link" });
    } catch (error) {
        console.log("Error in request password reset:", error);
        res.status(500).json({ message: "Failed to process password reset request" });
    }
};

// Reset password endpoint
export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;
        await user.save();
        
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.log("Error in reset password:", error);
        res.status(500).json({ message: "Failed to reset password" });
    }
};

// New endpoint to handle Google login from frontend
export const googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        // Decode the Google JWT token
        const ticket = await verifyGoogleToken(credential);
        const payload = ticket.getPayload();
        
        // Check if user exists
        let user = await User.findOne({ 
            $or: [
                { googleId: payload.sub },
                { email: payload.email }
            ]
        });

        if (!user) {
            // Create new user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                googleId: payload.sub,
                email: payload.email,
                fullName: payload.name,
                profilePic: payload.picture || "",
                password: hashedPassword,
                isGoogleUser: true,
                isVerified: true, // Google users are automatically verified
            });
            await user.save();
        } else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = payload.sub;
            user.profilePic = user.profilePic || payload.picture || "";
            user.isGoogleUser = true;
            await user.save();
        }

        // Generate JWT token
        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
            isGoogleUser: user.isGoogleUser,
        });
    } catch (error) {
        console.log("Error in Google login:", error);
        res.status(500).json({ message: "Google authentication failed" });
    }
};
