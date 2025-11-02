import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import passport from "passport";
import { verifyGoogleToken } from "../lib/googleAuth.js";

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

        const newUser = new User({ email, fullName, password: hashedPassword });
        if (newUser) {
            // generate token
            generateToken(res, newUser._id);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
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

        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
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
