import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { Mail, CheckCircle, XCircle, Loader, ArrowLeft, RefreshCw } from "lucide-react";

const EmailVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuthUser } = useAuthStore();
    const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error
    const [errorMessage, setErrorMessage] = useState("");
    
    const token = searchParams.get("token");

    useEffect(() => {
        if (token) {
            verifyEmail();
        } else {
            setVerificationStatus("error");
            setErrorMessage("No verification token provided");
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
            
            if (response.data) {
                setVerificationStatus("success");
                setAuthUser(response.data);
                toast.success("Email verified successfully!");
                
                // Redirect to home page after 3 seconds
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            }
        } catch (error) {
            setVerificationStatus("error");
            setErrorMessage(error.response?.data?.message || "Failed to verify email");
            toast.error(error.response?.data?.message || "Verification failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-base-100 rounded-xl shadow-xl p-8">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">Email Verification</h2>
                    </div>

                    {/* Verification Status */}
                    <div className="text-center">
                        {verificationStatus === "verifying" && (
                            <div className="space-y-4">
                                <Loader className="w-12 h-12 text-primary animate-spin mx-auto" />
                                <p className="text-base-content/70">
                                    Verifying your email address...
                                </p>
                            </div>
                        )}

                        {verificationStatus === "success" && (
                            <div className="space-y-4">
                                <CheckCircle className="w-12 h-12 text-success mx-auto" />
                                <div>
                                    <p className="text-lg font-semibold text-success mb-2">
                                        Email Verified Successfully!
                                    </p>
                                    <p className="text-base-content/70">
                                        Your email has been verified. Redirecting you to the app...
                                    </p>
                                </div>
                            </div>
                        )}

                        {verificationStatus === "error" && (
                            <div className="space-y-4">
                                <XCircle className="w-12 h-12 text-error mx-auto" />
                                <div>
                                    <p className="text-lg font-semibold text-error mb-2">
                                        Verification Failed
                                    </p>
                                    <p className="text-base-content/70 mb-4">
                                        {errorMessage}
                                    </p>
                                    
                                    {/* Action buttons */}
                                    <div className="space-y-3">
                                        {errorMessage.includes("expired") && (
                                            <Link
                                                to="/resend-verification"
                                                className="btn btn-primary btn-sm"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Resend Verification Email
                                            </Link>
                                        )}
                                        
                                        <Link
                                            to="/login"
                                            className="btn btn-ghost btn-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
