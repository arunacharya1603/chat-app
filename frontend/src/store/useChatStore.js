import { create } from "zustand";
import axiosInstance  from "../lib/axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data });
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error fetching users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Error fetching messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages} = get();
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, response.data] });
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Error sending message");
        } 
    },

    subscribeToMessages: () => {
      const { selectedUser } = get();
      if(!selectedUser) return;

      const socket = useAuthStore.getState().socket;

      socket.on("newMessage", (newMessage) => {
        const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
        if(!isMessageSentFromSelectedUser) return;

        set({
          messages: [...get().messages, newMessage],
        });
      });
    },

    unsubscribeToMessages: () => {
      const socket = useAuthStore.getState().socket;
      if(!socket) return;

      socket.off("newMessage");
    },
    
    
    // todo: optimize this one later
    setSelectedUser: (selectedUser) => set({ selectedUser }),    
}));
