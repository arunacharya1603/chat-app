import { useEffect, useState } from 'react';
import { useConnectionStore } from '../store/useConnectionStore';
import { useAuthStore } from '../store/useAuthStore';
import { Check, X, UserPlus, Send, Loader } from 'lucide-react';

const ConnectionRequestsPage = () => {
    const { 
        pendingRequests, 
        sentRequests, 
        getPendingRequests, 
        getSentRequests,
        acceptRequest,
        rejectRequest,
        isLoading 
    } = useConnectionStore();
    const { onlineUsers } = useAuthStore();
    const [activeTab, setActiveTab] = useState('received');

    useEffect(() => {
        getPendingRequests();
        getSentRequests();
    }, [getPendingRequests, getSentRequests]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-base-300 p-5">
                <h1 className="text-2xl font-bold mb-4">Connection Requests</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`btn btn-sm ${activeTab === 'received' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        <UserPlus className="size-4" />
                        Received ({pendingRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`btn btn-sm ${activeTab === 'sent' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        <Send className="size-4" />
                        Sent ({sentRequests.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {activeTab === 'received' ? (
                    pendingRequests.length === 0 ? (
                        <div className="text-center text-zinc-500 py-8">
                            <UserPlus className="size-12 mx-auto mb-4 opacity-50" />
                            <p>No pending requests</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {pendingRequests.map((request) => {
                                const user = request.requester;
                                const isOnline = onlineUsers.includes(user._id);

                                return (
                                    <div key={request._id} className="card bg-base-200 border border-base-300">
                                        <div className="card-body p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={user.profilePic || "/avatar.png"}
                                                        alt={user.fullName}
                                                        className="size-14 object-cover rounded-full"
                                                    />
                                                    {isOnline && (
                                                        <span className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full ring-2 ring-base-200" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{user.fullName}</h3>
                                                    <p className="text-sm text-zinc-400 truncate">{user.email}</p>
                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => acceptRequest(request._id)}
                                                        className="btn btn-sm btn-success"
                                                    >
                                                        <Check className="size-4" />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => rejectRequest(request._id)}
                                                        className="btn btn-sm btn-error btn-outline"
                                                    >
                                                        <X className="size-4" />
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    sentRequests.length === 0 ? (
                        <div className="text-center text-zinc-500 py-8">
                            <Send className="size-12 mx-auto mb-4 opacity-50" />
                            <p>No sent requests</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {sentRequests.map((request) => {
                                const user = request.recipient;
                                const isOnline = onlineUsers.includes(user._id);

                                return (
                                    <div key={request._id} className="card bg-base-200 border border-base-300">
                                        <div className="card-body p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={user.profilePic || "/avatar.png"}
                                                        alt={user.fullName}
                                                        className="size-14 object-cover rounded-full"
                                                    />
                                                    {isOnline && (
                                                        <span className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full ring-2 ring-base-200" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{user.fullName}</h3>
                                                    <p className="text-sm text-zinc-400 truncate">{user.email}</p>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">
                                                        Pending - {new Date(request.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ConnectionRequestsPage;

