import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, match: [/.+@.+\..+/, "Please enter a valid email address"] },
    fullName: { type: String, required: true, minlength: 3, maxlength: 30, trim: true },
    password: { type: String, required: function() { return !this.isGoogleUser; }, minlength: 6 },
    profilePic: { type: String, default: "" },
    googleId: { type: String, unique: true, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiry: { type: Date },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
