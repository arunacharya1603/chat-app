import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axios';

const GoogleLoginButton = ({ mode = "login" }) => {
    const { setAuthUser, connectSocket } = useAuthStore();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axiosInstance.post('/auth/google/login', {
                credential: credentialResponse.credential
            });

            if (response.data) {
                setAuthUser(response.data);
                toast.success(`${mode === 'login' ? 'Logged in' : 'Signed up'} with Google successfully!`);
                connectSocket();
            }
        } catch (error) {
            console.error('Google login error:', error);
            toast.error(error.response?.data?.message || 'Google authentication failed');
        }
    };

    const handleGoogleError = () => {
        toast.error('Google login failed');
    };

    // Get Google Client ID from environment variable
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        console.warn('Google Client ID not configured');
        return null;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <div className="w-full">
                <div className="divider">OR</div>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    width="100%"
                    text={mode === 'login' ? 'signin_with' : 'signup_with'}
                    shape="rectangular"
                />
            </div>
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginButton;
