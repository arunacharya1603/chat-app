import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check");
            set({ authUser: response.data })

            get().connectSocket();
        } catch (error) {
            set({ authUser: null })
            console.log("error checking auth", error)
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        try {
            set({ isSigningUp: true })
            const response = await axiosInstance.post("/auth/signup", data);
            set({ authUser: response.data })
            toast.success("Account created successfully")

            get().connectSocket();
        } catch (error) {
            console.log("error signing up", error)
            toast.error(error.response.data.message)
        } finally {
            set({ isSigningUp: false })
        }
    },
    
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({ authUser: null })
            toast.success("Logged out successfully")

            get().disconnectSocket();
        } catch (error) {
            console.log("error logging out", error)
            toast.error(error.response.data.message)
        }
    },

    login: async (data) => {
        try {
            set({ isLoggingIn: true }) 
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data })
            toast.success("Logged in successfully")

            get().connectSocket();
        } catch (error) {
            console.log("error logging in", error)
            toast.error(error.response.data.message)
        } finally {
            set({ isLoggingIn: false })
        }
    },

    updateProfile: async (data) => {
        try {
            set({ isUpdatingProfile: true })
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data })
            toast.success("Profile updated successfully")
        } catch (error) {
            console.log("error updating profile", error)
            toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({ socket:socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        });
    },
    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    },

}))
