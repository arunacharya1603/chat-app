import express from "express";
import {
    getAllUsers,
    sendConnectionRequest,
    getPendingRequests,
    getSentRequests,
    acceptRequest,
    rejectRequest,
    getConnections,
    removeConnection
} from "../controllers/connection.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get all users with connection status
router.get("/users", getAllUsers);

// Get connections (accepted)
router.get("/", getConnections);

// Get pending requests
router.get("/requests/pending", getPendingRequests);

// Get sent requests
router.get("/requests/sent", getSentRequests);

// Send connection request
router.post("/request", sendConnectionRequest);

// Accept request
router.post("/accept", acceptRequest);

// Reject request
router.post("/reject", rejectRequest);

// Remove connection
router.delete("/:connectionId", removeConnection);

export default router;

