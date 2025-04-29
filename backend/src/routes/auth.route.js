import express from "express";
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js";
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

export default router;