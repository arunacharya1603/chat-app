import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessage, getUsersForSidebar, getMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.all("/users", (req, res) => {
    res.status(405).json({ message: "Method not allowed" });
});

router.get("/:id", protectRoute, getMessages);
router.all("/:id", (req, res) => {
    res.status(405).json({ message: "Method not allowed" });
});

router.post("/send/:id", protectRoute, sendMessage);
router.all("/send/:id", (req, res) => {
    res.status(405).json({ message: "Method not allowed" });
});


export default router;
