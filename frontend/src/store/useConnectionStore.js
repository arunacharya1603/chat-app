import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';

export const useConnectionStore = create((set, get) => ({
    users: [],
    connections: [],
    pendingRequests: [],
    sentRequests: [],
    isLoading: false,
    isRequesting: false,

    // Get all users with connection status
    getAllUsers: async () => {
        try {
            set({ isLoading: true });
            const response = await axiosInstance.get('/connections/users');
            set({ users: response.data.users || [], isLoading: false });
        } catch (error) {
            console.error('Error getting users:', error);
            toast.error(error.response?.data?.message || 'Failed to load users');
            set({ isLoading: false });
        }
    },

    // Get connections
    getConnections: async () => {
        try {
            set({ isLoading: true });
            const response = await axiosInstance.get('/connections');
            set({ connections: response.data.connections || [], isLoading: false });
        } catch (error) {
            console.error('Error getting connections:', error);
            set({ isLoading: false });
        }
    },

    // Get pending requests
    getPendingRequests: async () => {
        try {
            set({ isLoading: true });
            const response = await axiosInstance.get('/connections/requests/pending');
            set({ pendingRequests: response.data.requests || [], isLoading: false });
        } catch (error) {
            console.error('Error getting pending requests:', error);
            set({ isLoading: false });
        }
    },

    // Get sent requests
    getSentRequests: async () => {
        try {
            set({ isLoading: true });
            const response = await axiosInstance.get('/connections/requests/sent');
            set({ sentRequests: response.data.requests || [], isLoading: false });
        } catch (error) {
            console.error('Error getting sent requests:', error);
            set({ isLoading: false });
        }
    },

    // Send connection request
    sendConnectionRequest: async (recipientId) => {
        try {
            set({ isRequesting: true });
            await axiosInstance.post('/connections/request', { recipientId });
            toast.success('Connection request sent!');
            
            // Update user status
            const { users } = get();
            const updatedUsers = users.map(user => 
                user._id === recipientId 
                    ? { ...user, connectionStatus: 'request_sent' }
                    : user
            );
            set({ users: updatedUsers, isRequesting: false });
        } catch (error) {
            console.error('Error sending connection request:', error);
            toast.error(error.response?.data?.message || 'Failed to send request');
            set({ isRequesting: false });
        }
    },

    // Accept connection request
    acceptRequest: async (requestId) => {
        try {
            set({ isRequesting: true });
            await axiosInstance.post('/connections/accept', { requestId });
            toast.success('Connection accepted!');
            
            // Refresh lists
            await Promise.all([
                get().getPendingRequests(),
                get().getConnections(),
                get().getAllUsers()
            ]);
            
            set({ isRequesting: false });
        } catch (error) {
            console.error('Error accepting request:', error);
            toast.error(error.response?.data?.message || 'Failed to accept');
            set({ isRequesting: false });
        }
    },

    // Reject connection request
    rejectRequest: async (requestId) => {
        try {
            set({ isRequesting: true });
            await axiosInstance.post('/connections/reject', { requestId });
            toast.success('Connection rejected');
            await get().getPendingRequests();
            set({ isRequesting: false });
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error(error.response?.data?.message || 'Failed to reject');
            set({ isRequesting: false });
        }
    },

    // Remove connection
    removeConnection: async (connectionId) => {
        try {
            set({ isRequesting: true });
            await axiosInstance.delete(`/connections/${connectionId}`);
            toast.success('Connection removed');
            
            await Promise.all([
                get().getConnections(),
                get().getAllUsers()
            ]);
            
            set({ isRequesting: false });
        } catch (error) {
            console.error('Error removing connection:', error);
            toast.error(error.response?.data?.message || 'Failed to remove');
            set({ isRequesting: false });
        }
    },
}));

