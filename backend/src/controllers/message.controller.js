import Message from "../models/messages.model.js";
import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res, next) => {
    try {
        const loggedInUserId = req.user._id;
        
        // Get all accepted connections
        const connections = await Connection.find({
            $or: [
                { requester: loggedInUserId },
                { recipient: loggedInUserId }
            ],
            status: 'accepted'
        });
        
        // Get IDs of connected users
        const connectedUserIds = connections.map(conn => {
            return conn.requester.toString() === loggedInUserId.toString() 
                ? conn.recipient 
                : conn.requester;
        });
        
        // Return only connected users
        const filteredUsers = await User.find({ 
            _id: { $in: connectedUserIds }
        }).select("-password");
        
        res.status(200).json(filteredUsers);
    } catch (error) {
        next(error);
        console.log("Error in get users for sidebar controller", error.message);
    }
}

export const getMessages = async (req, res, next) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });

        res.status(200).json(messages);
    } catch (error) {
        next(error);
        console.log("Error in get messages controller", error.message);
    }
}

export const sendMessage = async (req, res, next) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Check if users are connected
        const connection = await Connection.findOne({
            $or: [
                { requester: senderId, recipient: receiverId },
                { requester: receiverId, recipient: senderId }
            ],
            status: 'accepted'
        });

        if (!connection) {
            return res.status(403).json({ 
                message: "You can only message connected users" 
            });
        }

        let imageUrl;
        if (image) {
            const uploadedResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadedResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
        await newMessage.save();
        // todo: realtime functionality goes here - socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        next(error);
        console.log("Error in send message controller", error.message);
    }
}
