import React, { useState, useEffect } from 'react';
import { Plus, Folder, Share2, Eye, Calendar, Trash2, Copy, Check, Link as LinkIcon, ExternalLink, Lock, Globe, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import roomsApi from '../../../services/rooms';
import CreateRoomModal from '../modals/CreateRoomModal';
import ManageRoomModal from '../modals/ManageRoomModal';
import ConfirmModal from '../modals/ConfirmModal';

const RoomsView = () => {
    const [rooms, setRooms] = useState([]);
    const [sharedRooms, setSharedRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-rooms'); // 'my-rooms' or 'shared'
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        roomId: null,
        roomName: '',
    });

    useEffect(() => {
        fetchRooms();
        fetchSharedRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await roomsApi.getMyRooms();
            setRooms(response.data || []);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    const fetchSharedRooms = async () => {
        try {
            const response = await roomsApi.getSharedWithMe();
            setSharedRooms(response.data || []);
        } catch (error) {
            console.error('Error fetching shared rooms:', error);
        }
    };

    const handleDeleteRoom = async () => {
        try {
            await roomsApi.deleteRoom(confirmModal.roomId);
            toast.success('Room deleted successfully');
            setConfirmModal({ isOpen: false, roomId: null, roomName: '' });
            fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
            toast.error('Failed to delete room');
        }
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderRoomCard = (room, isShared = false) => (
        <div
            key={room.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        {!room.isPublic ? <Lock className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                {room.name}
                            </h3>
                            {!room.isPublic && (
                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">
                                    Private
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(isShared ? room.sharedAt : room.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {room.viewCount} views
                            </span>
                            {isShared && room.owner && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        by {room.owner.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {!isShared ? (
                    <div className="flex items-center gap-1">
                        <a
                            href={room.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Open room view"
                        >
                            <Eye className="w-4 h-4" />
                        </a>
                        <button
                            onClick={() => setSelectedRoom(room)}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Manage room"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() =>
                                setConfirmModal({
                                    isOpen: true,
                                    roomId: room.id,
                                    roomName: room.name,
                                })
                            }
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete room"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <a
                        href={room.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open
                    </a>
                )}
            </div>

            {room.description && (
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                    {room.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-md">
                    {room.itemCount} {room.itemCount === 1 ? 'item' : 'items'}
                </span>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600/50 max-w-[180px]">
                        <LinkIcon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                            {room.shareUrl}
                        </span>
                    </div>
                    <button
                        onClick={() => copyToClipboard(room.shareUrl, room.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Copy link"
                    >
                        {copiedId === room.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    const displayRooms = activeTab === 'my-rooms' ? rooms : sharedRooms;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Shared Rooms</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Create collections of snippets and passwords to share
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Create Room
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('my-rooms')}
                        className={`pb-3 px-1 border-b-2 transition-colors font-medium ${activeTab === 'my-rooms'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        My Rooms ({rooms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('shared')}
                        className={`pb-3 px-1 border-b-2 transition-colors font-medium ${activeTab === 'shared'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Shared with Me ({sharedRooms.length})
                    </button>
                </div>
            </div>

            {/* Content */}
            {displayRooms.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <Folder className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {activeTab === 'my-rooms' ? 'No rooms created yet' : 'No rooms shared with you yet'}
                    </p>
                    {activeTab === 'my-rooms' && (
                        <>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 mb-6">
                                Create a room to start sharing collections of items
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-200"
                            >
                                <Plus className="w-4 h-4" />
                                Create your first room
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayRooms.map((room) => renderRoomCard(room, activeTab === 'shared'))}
                </div>
            )}

            {/* Modals */}
            <CreateRoomModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onRoomCreated={(newRoom) => {
                    setRooms([newRoom, ...rooms]);
                    setSelectedRoom(newRoom);
                }}
            />

            {selectedRoom && (
                <ManageRoomModal
                    isOpen={true}
                    onClose={() => {
                        setSelectedRoom(null);
                        fetchRooms();
                    }}
                    room={selectedRoom}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, roomId: null, roomName: '' })}
                onConfirm={handleDeleteRoom}
                title="Delete Room"
                message={`Are you sure you want to delete "${confirmModal.roomName}"? This will revoke the share link and no one will be able to access it anymore.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default RoomsView;
