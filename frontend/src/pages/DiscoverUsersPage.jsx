import { useEffect, useState } from 'react';
import { useConnectionStore } from '../store/useConnectionStore';
import { useAuthStore } from '../store/useAuthStore';
import { UserPlus, Check, Clock, Users, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiscoverUsersPage = () => {
    const { users, getAllUsers, sendConnectionRequest, isLoading, isRequesting } = useConnectionStore();
    const { onlineUsers } = useAuthStore();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    const handleSendRequest = async (userId) => {
        await sendConnectionRequest(userId);
    };

    const getButtonContent = (user) => {
        switch (user.connectionStatus) {
            case 'connected':
                return {
                    icon: <Check className="size-4" />,
                    text: 'Connected',
                    className: 'btn-sm btn-success btn-outline',
                    disabled: true
                };
            case 'request_sent':
                return {
                    icon: <Clock className="size-4" />,
                    text: 'Request Sent',
                    className: 'btn-sm btn-warning btn-outline',
                    disabled: true
                };
            case 'request_received':
                return {
                    icon: <UserPlus className="size-4" />,
                    text: 'Respond',
                    className: 'btn-sm btn-primary',
                    link: '/connections/requests'
                };
            default:
                return {
                    icon: <UserPlus className="size-4" />,
                    text: 'Connect',
                    className: 'btn-sm btn-primary'
                };
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        if (filter === 'none') return user.connectionStatus === 'none';
        if (filter === 'connected') return user.connectionStatus === 'connected';
        if (filter === 'pending') return user.connectionStatus === 'request_sent' || user.connectionStatus === 'request_received';
        return true;
    });

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
                <div className="flex items-center gap-2 mb-4">
                    <Users className="size-6" />
                    <h1 className="text-2xl font-bold">Discover Users</h1>
                </div>
                
                <div className="flex gap-2">
                    {['all', 'none', 'pending', 'connected'].map((filterType) => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`btn btn-sm ${
                                filter === filterType ? 'btn-primary' : 'btn-ghost'
                            } capitalize`}
                        >
                            {filterType === 'none' ? 'Not Connected' : filterType}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {filteredUsers.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8">
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filteredUsers.map((user) => {
                            const buttonContent = getButtonContent(user);
                            const isOnline = onlineUsers.includes(user._id);
                            
                            return (
                                <div
                                    key={user._id}
                                    className="card bg-base-200 border border-base-300 hover:border-primary/50 transition-colors"
                                >
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
                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                    isOnline ? 'bg-green-500/20 text-green-500' : 'bg-zinc-500/20 text-zinc-500'
                                                }`}>
                                                    {isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>

                                            <div className="flex-shrink-0">
                                                {buttonContent.link ? (
                                                    <Link to={buttonContent.link} className={buttonContent.className}>
                                                        {buttonContent.icon}
                                                        <span className="hidden sm:inline">{buttonContent.text}</span>
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSendRequest(user._id)}
                                                        disabled={buttonContent.disabled || isRequesting}
                                                        className={buttonContent.className}
                                                    >
                                                        {buttonContent.icon}
                                                        <span className="hidden sm:inline">{buttonContent.text}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscoverUsersPage;

