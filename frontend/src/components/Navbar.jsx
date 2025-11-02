import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { LogOut, MessageSquare, Settings, User, Users, UserPlus } from "lucide-react";
import { useEffect } from "react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const { pendingRequests, getPendingRequests } = useConnectionStore();

    useEffect(() => {
        if (authUser) {
            getPendingRequests();
        }
    }, [authUser, getPendingRequests]);

    return (
        <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold">Chatty</h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {authUser && (
                            <>
                                <Link to={"/discover"} className={`btn btn-sm gap-2`}>
                                    <Users className="w-4 h-4" />
                                    <span className="hidden sm:inline">Discover</span>
                                </Link>
                                
                                <Link to={"/connections/requests"} className={`btn btn-sm gap-2 relative`}>
                                    <UserPlus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Requests</span>
                                    {pendingRequests.length > 0 && (
                                        <span className="absolute -top-1 -right-1 size-5 bg-error text-error-content rounded-full text-xs flex items-center justify-center">
                                            {pendingRequests.length}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        <Link to={"/settings"} className={`btn btn-sm gap-2 transition-colors`}>
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>

                        {authUser && (
                            <>
                                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">Profile</span>
                                </Link>

                                <button className="flex gap-2 items-center" onClick={logout}>
                                    <LogOut className="size-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Navbar;