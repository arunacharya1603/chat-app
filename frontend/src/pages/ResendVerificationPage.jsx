import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { Mail, Send, ArrowLeft, Loader } from "lucide-react";

const ResendVerificationPage = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setIsLoading(true);
        try {
            await axiosInstance.post("/auth/resend-verification", { email });
            setIsSuccess(true);
            toast.success("Verification email sent! Please check your inbox.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send verification email");
        } finally {
            setIsLoading(false);
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
                        <h2 className="text-2xl font-bold">Resend Verification Email</h2>
                        <p className="text-base-content/60 mt-2">
                            Enter your email to receive a new verification link
                        </p>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Email</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type="email"
                                        className="input input-bordered w-full pl-10"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Send Verification Email
                                    </>
                                )}
                            </button>

                            {/* Back to Login Link */}
                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="link link-primary text-sm inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-success/10 rounded-lg p-4">
                                <p className="text-success font-medium">
                                    Verification email sent successfully!
                                </p>
                                <p className="text-sm text-base-content/70 mt-2">
                                    Please check your email inbox and click the verification link.
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setEmail("");
                                    }}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Send to different email
                                </button>
                                
                                <Link
                                    to="/login"
                                    className="btn btn-primary btn-sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResendVerificationPage;
