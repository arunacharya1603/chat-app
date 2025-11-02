import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";

// Get all users with their connection status
export const getAllUsers = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        
        // Get all users except current user
        const allUsers = await User.find({ _id: { $ne: currentUserId } })
            .select('-password')
            .lean();
        
        // Get all connections involving current user
        const connections = await Connection.find({
            $or: [
                { requester: currentUserId },
                { recipient: currentUserId }
            ]
        }).lean();
        
        // Add connection status to each user
        const usersWithStatus = allUsers.map(user => {
            const connection = connections.find(conn => 
                (conn.requester.toString() === currentUserId.toString() && conn.recipient.toString() === user._id.toString()) ||
                (conn.recipient.toString() === currentUserId.toString() && conn.requester.toString() === user._id.toString())
            );
            
            let connectionStatus = 'none';
            if (connection) {
                if (connection.status === 'accepted') {
                    connectionStatus = 'connected';
                } else if (connection.status === 'pending') {
                    connectionStatus = connection.requester.toString() === currentUserId.toString() 
                        ? 'request_sent' 
                        : 'request_received';
                }
            }
            
            return { ...user, connectionStatus };
        });
        
        res.status(200).json({ users: usersWithStatus });
    } catch (error) {
        console.error("Error getting users:", error);
        next(error);
    }
};

// Send connection request
export const sendConnectionRequest = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { recipientId } = req.body;
        
        if (!recipientId) {
            return res.status(400).json({ message: "Recipient ID is required" });
        }
        
        if (currentUserId.toString() === recipientId) {
            return res.status(400).json({ message: "Cannot send request to yourself" });
        }
        
        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { requester: currentUserId, recipient: recipientId },
                { requester: recipientId, recipient: currentUserId }
            ]
        });
        
        if (existingConnection) {
            if (existingConnection.status === 'accepted') {
                return res.status(400).json({ message: "Already connected" });
            }
            return res.status(400).json({ message: "Connection request already exists" });
        }
        
        // Create new connection request
        const connection = new Connection({
            requester: currentUserId,
            recipient: recipientId,
            status: 'pending'
        });
        
        await connection.save();
        
        res.status(201).json({ 
            message: "Connection request sent",
            connection
        });
    } catch (error) {
        console.error("Error sending connection request:", error);
        next(error);
    }
};

// Get pending requests (received)
export const getPendingRequests = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        
        const requests = await Connection.find({
            recipient: currentUserId,
            status: 'pending'
        })
        .populate('requester', 'fullName email profilePic')
        .sort({ createdAt: -1 });
        
        res.status(200).json({ requests });
    } catch (error) {
        console.error("Error getting pending requests:", error);
        next(error);
    }
};

// Get sent requests
export const getSentRequests = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        
        const requests = await Connection.find({
            requester: currentUserId,
            status: 'pending'
        })
        .populate('recipient', 'fullName email profilePic')
        .sort({ createdAt: -1 });
        
        res.status(200).json({ requests });
    } catch (error) {
        console.error("Error getting sent requests:", error);
        next(error);
    }
};

// Accept connection request
export const acceptRequest = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { requestId } = req.body;
        
        if (!requestId) {
            return res.status(400).json({ message: "Request ID is required" });
        }
        
        const connection = await Connection.findOne({
            _id: requestId,
            recipient: currentUserId,
            status: 'pending'
        });
        
        if (!connection) {
            return res.status(404).json({ message: "Request not found" });
        }
        
        connection.status = 'accepted';
        await connection.save();
        
        res.status(200).json({ 
            message: "Connection accepted",
            connection
        });
    } catch (error) {
        console.error("Error accepting request:", error);
        next(error);
    }
};

// Reject connection request
export const rejectRequest = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { requestId } = req.body;
        
        if (!requestId) {
            return res.status(400).json({ message: "Request ID is required" });
        }
        
        const connection = await Connection.findOne({
            _id: requestId,
            recipient: currentUserId,
            status: 'pending'
        });
        
        if (!connection) {
            return res.status(404).json({ message: "Request not found" });
        }
        
        connection.status = 'rejected';
        await connection.save();
        
        res.status(200).json({ message: "Connection rejected" });
    } catch (error) {
        console.error("Error rejecting request:", error);
        next(error);
    }
};

// Get all connections (accepted only)
export const getConnections = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        
        const connections = await Connection.find({
            $or: [
                { requester: currentUserId },
                { recipient: currentUserId }
            ],
            status: 'accepted'
        })
        .populate('requester', 'fullName email profilePic')
        .populate('recipient', 'fullName email profilePic')
        .sort({ updatedAt: -1 });
        
        // Map to return only the other user
        const connectedUsers = connections.map(conn => {
            return conn.requester._id.toString() === currentUserId.toString() 
                ? conn.recipient 
                : conn.requester;
        });
        
        res.status(200).json({ connections: connectedUsers });
    } catch (error) {
        console.error("Error getting connections:", error);
        next(error);
    }
};

// Remove connection
export const removeConnection = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { connectionId } = req.params;
        
        const connection = await Connection.findOne({
            _id: connectionId,
            $or: [
                { requester: currentUserId },
                { recipient: currentUserId }
            ],
            status: 'accepted'
        });
        
        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }
        
        await Connection.deleteOne({ _id: connectionId });
        
        res.status(200).json({ message: "Connection removed" });
    } catch (error) {
        console.error("Error removing connection:", error);
        next(error);
    }
};

