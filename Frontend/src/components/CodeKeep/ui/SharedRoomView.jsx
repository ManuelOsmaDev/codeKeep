import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, Code2, Key, Calendar, Eye, EyeOff, Copy, Check, AlertCircle, Shield, Plus, Share2, ArrowLeft, Lock, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import roomsApi from '../../../services/rooms';
import { highlightCode } from '../utils/codeHighlight';
import { getLanguageIcon } from '../utils/languageIcons';
import { languageColors } from '../constants/languages';
import ManageRoomModal from '../modals/ManageRoomModal';
import SnippetCard from './SnippetCard';
import EditSnippetModal from '../modals/EditSnippetModal';
import ConfirmModal from '../modals/ConfirmModal';
import { snippets as snippetsApi } from '../../../services/api';

const SharedRoomView = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [showPasswords, setShowPasswords] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => { },
        title: '',
        message: '',
        type: 'danger',
        confirmText: 'Confirm',
    });

    // State for editing shared passwords
    const [editPasswordModal, setEditPasswordModal] = useState({ isOpen: false, itemId: null, passwordName: '', currentPassword: '' });
    const [newPasswordValue, setNewPasswordValue] = useState('');

    useEffect(() => {
        if (token) {
            fetchRoom();
        }
    }, [token]);

    const fetchRoom = async () => {
        setLoading(true);
        try {
            const response = await roomsApi.getRoomByToken(token);
            setRoom(response.data);
        } catch (error) {
            console.error('Error fetching room:', error);
            setError('Room not found or access denied');
        } finally {
            setLoading(false);
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

    const handleUpdateSnippet = async (id, snippetData) => {
        try {
            const response = await snippetsApi.update(id, snippetData);
            setRoom(prev => ({
                ...prev,
                items: prev.items.map(item =>
                    item.itemType === 'snippet' && item.itemData.id === id
                        ? { ...item, itemData: response.data }
                        : item
                )
            }));
            setEditingSnippet(null);
            toast.success('Snippet updated!');
        } catch (error) {
            toast.error('Failed to update snippet');
        }
    };

    const handleDeleteSnippet = async (itemId) => {
        setConfirmModal({
            isOpen: true,
            onConfirm: async () => {
                try {
                    await roomsApi.removeItemFromRoom(room.id, itemId);
                    setRoom(prev => ({
                        ...prev,
                        items: prev.items.filter(item => item.id !== itemId)
                    }));
                    toast.success('Snippet removed from room');
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    toast.error('Failed to remove snippet');
                }
            },
            title: 'Remove Snippet',
            message: 'Are you sure you want to remove this snippet from the room?',
            type: 'danger',
            confirmText: 'Remove',
        });
    };

    const isPasswordProtected = (password) => {
        return !password || password === '[Protected - Contact owner for access]' || password.includes('[Protected');
    };

    const canEditPassword = () => {
        return permissions.isOwner || permissions.canUpdate;
    };

    const handleUpdatePassword = async () => {
        if (!newPasswordValue.trim()) {
            toast.error('Please enter a new password');
            return;
        }

        try {
            await roomsApi.updateSharedPassword(room.id, editPasswordModal.itemId, newPasswordValue);
            toast.success('Password updated successfully!');
            setEditPasswordModal({ isOpen: false, itemId: null, passwordName: '', currentPassword: '' });
            setNewPasswordValue('');
            fetchRoom();
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                        The link might be invalid, expired, or revoked by the owner.
                    </p>
                </div>
            </div>
        );
    }

    if (!room) return null;

    const permissions = room.currentUserPermissions || { canCreate: false, canUpdate: false, canDelete: false, canShare: false };
    const snippets = room.items.filter(item => item.itemType === 'snippet' && item.itemData);
    const passwords = room.items.filter(item => item.itemType === 'password' && item.itemData);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20">
            {/* Navigation Bar */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowPasswords(!showPasswords)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${showPasswords ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        >
                            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span>{showPasswords ? 'Hide Secrets' : 'Show Secrets'}</span>
                        </button>

                        {permissions.canShare && (
                            <button
                                onClick={() => setIsManageModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        )}

                        {permissions.canCreate && (
                            <button
                                onClick={() => setIsManageModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Classroom-style Header Banner */}
            <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
                <div className="relative h-48 md:h-64 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-end p-6 md:p-8">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Folder className="w-64 h-64 transform translate-x-1/4 -translate-y-1/4 text-white" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                {room.name}
                            </h1>
                            {!room.isPublic && (
                                <span className="bg-black/30 backdrop-blur-md text-white/90 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 border border-white/10">
                                    <Lock className="w-3 h-3" />
                                    Private
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-indigo-100 text-sm md:text-base">
                            {room.description && (
                                <p className="font-medium">{room.description}</p>
                            )}
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                                <span>Shared by {room.owner?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                {/* Empty State */}
                {snippets.length === 0 && passwords.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Folder className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No content yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            The owner hasn't shared any items in this room yet.
                        </p>
                        {permissions.canCreate && (
                            <button
                                onClick={() => setIsManageModalOpen(true)}
                                className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                                Add your first item
                            </button>
                        )}
                    </div>
                )}

                {/* Snippets Section */}
                {snippets.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Code2 className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                Code Snippets
                            </h2>
                            <span className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-sm font-medium">
                                {snippets.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {snippets.map(({ itemData: snippet, id: itemId }) => (
                                <SnippetCard
                                    key={itemId}
                                    snippet={snippet}
                                    canEdit={permissions.canUpdate}
                                    canDelete={permissions.canDelete}
                                    onEdit={() => setEditingSnippet(snippet)}
                                    onDelete={() => handleDeleteSnippet(itemId)}
                                    onCopy={() => copyToClipboard(snippet.code, snippet.id)}
                                    isFavorite={false}
                                    isBookmarked={false}
                                    onToggleFavorite={() => { }}
                                    onToggleBookmark={() => { }}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Passwords Section */}
                {passwords.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                <Key className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                Credentials
                            </h2>
                            <span className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-sm font-medium">
                                {passwords.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {passwords.map(({ itemData: password, id }) => (
                                <div key={id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-500 dark:text-slate-400">
                                            Password
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">
                                        {password.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate">
                                        {password.username}
                                    </p>

                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between mb-4">
                                        <div className="font-mono text-sm text-slate-600 dark:text-slate-300 truncate mr-2">
                                            {isPasswordProtected(password.password) ? (
                                                <span className="text-amber-600 dark:text-amber-400 italic text-xs">
                                                    🔒 Contact owner to re-share
                                                </span>
                                            ) : (
                                                showPasswords ? password.password : '••••••••••••••••'
                                            )}
                                        </div>
                                        {!isPasswordProtected(password.password) && (
                                            <button
                                                onClick={() => copyToClipboard(password.password, `pass-${id}`)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                                                title="Copy Password"
                                            >
                                                {copiedId === `pass-${id}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                            {isPasswordProtected(password.password) ? 'Needs re-share' : 'Securely shared'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {!isPasswordProtected(password.password) && canEditPassword() && (
                                                <button
                                                    onClick={() => {
                                                        setEditPasswordModal({
                                                            isOpen: true,
                                                            itemId: id,
                                                            passwordName: password.name,
                                                            currentPassword: password.password
                                                        });
                                                        setNewPasswordValue(password.password);
                                                    }}
                                                    className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
                                                    title="Edit Password"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    copyToClipboard(password.username, `user-${id}`);
                                                }}
                                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                                            >
                                                {copiedId === `user-${id}` ? (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                        Copy User
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <ManageRoomModal
                isOpen={isManageModalOpen}
                onClose={() => {
                    setIsManageModalOpen(false);
                    fetchRoom();
                }}
                room={room}
                userPermissions={permissions}
            />

            {editingSnippet && (
                <EditSnippetModal
                    isOpen={true}
                    onClose={() => setEditingSnippet(null)}
                    onSave={(data) => handleUpdateSnippet(editingSnippet.id, data)}
                    snippet={editingSnippet}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />

            {/* Edit Password Modal */}
            {editPasswordModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50" onClick={() => setEditPasswordModal({ isOpen: false, itemId: null, passwordName: '', currentPassword: '' })}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-amber-500" />
                                Edit Password
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Update the password for "{editPasswordModal.passwordName}"
                            </p>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                New Password
                            </label>
                            <input
                                type="text"
                                value={newPasswordValue}
                                onChange={(e) => setNewPasswordValue(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white font-mono"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleUpdatePassword();
                                    }
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setEditPasswordModal({ isOpen: false, itemId: null, passwordName: '', currentPassword: '' });
                                    setNewPasswordValue('');
                                }}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePassword}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedRoomView;

