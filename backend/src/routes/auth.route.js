import express from "express";
import { 
    signup, 
    login, 
    logout, 
    updateProfile, 
    checkAuth, 
    googleAuth, 
    googleCallback, 
    googleLogin,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.all("/signup", (req, res) => {
    res.status(405).json({ message: "Method not allowed" });
});

router.post("/login", login);
router.all("/login", (req, res) => {
    res.status(405).json({ message: "Method not allowed" });
});

router.post("/logout", logout);
router.all("/logout", (req, res) => {
    res.status(405).json({ message: "Method not allowed" });
});

router.put("/update-profile", protectRoute, updateProfile);
router.all("/update-profile", (req, res) => {
    res.status(405).json({ message: "Method not allowed" });
});

router.get("/check", protectRoute, checkAuth);
router.all("/check", (req, res) => {
    res.status(405).json({ message: "Method not allowed" });
});

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.post("/google/login", googleLogin);

// Email verification routes
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Password reset routes
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Test email configuration (remove in production)
router.get("/test-email", async (req, res) => {
    const { sendVerificationEmail } = await import("../lib/email.js");
    // Use query parameter for recipient email, or default to sender's email
    const testEmail = req.query.to || process.env.EMAIL_USER || "test@example.com";
    const testToken = "test-token-123";
    
    console.log("=== Email Test Started ===");
    console.log("Testing email configuration...");
    console.log("Recipient email:", testEmail);
    console.log("Sender email:", process.env.EMAIL_USER);
    
    const result = await sendVerificationEmail(testEmail, "Test User", testToken);
    
    if (result) {
        console.log("=== Email Test Success ===");
        res.json({ 
            success: true, 
            message: "Test email sent successfully! Check your inbox.",
            sentTo: testEmail 
        });
    } else {
        console.log("=== Email Test Failed ===");
        res.status(500).json({ 
            success: false, 
            message: "Failed to send test email. Check server logs for details.",
            hint: "Make sure EMAIL_USER and EMAIL_APP_PASSWORD are set in .env file",
            config: {
                EMAIL_SERVICE: process.env.EMAIL_SERVICE || "not set",
                EMAIL_USER: process.env.EMAIL_USER ? "configured" : "not set",
                EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD ? "configured" : "not set"
            }
        });
    }
});

export default router;