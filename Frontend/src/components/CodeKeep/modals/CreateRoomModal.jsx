import React, { useState } from 'react';
import { X, FolderPlus, Lock, Globe, Mail, Plus, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import roomsApi from '../../../services/rooms';

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [emailInput, setEmailInput] = useState('');
    const [allowedEmails, setAllowedEmails] = useState([]);
    const [loading, setLoading] = useState(false);

    // Early return si el modal no está abierto
    if (!isOpen) return null;

    const handleAddEmail = (e) => {
        e.preventDefault();
        const email = emailInput.trim().toLowerCase();

        if (!email) return;

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Invalid email format');
            return;
        }

        if (allowedEmails.includes(email)) {
            toast.error('Email already added');
            return;
        }

        setAllowedEmails([...allowedEmails, email]);
        setEmailInput('');
    };

    const handleRemoveEmail = (emailToRemove) => {
        setAllowedEmails(allowedEmails.filter(email => email !== emailToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Si es privada, debe tener al menos un email
        if (!isPublic && allowedEmails.length === 0) {
            toast.error('Private rooms must have at least one authorized email');
            return;
        }

        setLoading(true);
        try {
            const response = await roomsApi.createRoom(name, description, isPublic, allowedEmails);
            toast.success('Room created successfully!');
            onRoomCreated(response.data);
            onClose();
            // Reset state
            setName('');
            setDescription('');
            setIsPublic(true);
            setAllowedEmails([]);
            setEmailInput('');
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error(error.response?.data?.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <FolderPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Shared Room</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Group snippets and passwords</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Room Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Project Alpha Resources"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's in this room?"
                            rows={2}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white resize-none"
                        />
                    </div>

                    {/* Privacy Settings */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Privacy
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-start gap-3 p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <input
                                    type="radio"
                                    name="privacy"
                                    checked={isPublic}
                                    onChange={() => setIsPublic(true)}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-slate-900 dark:text-white">Public</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Anyone with the link can access
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <input
                                    type="radio"
                                    name="privacy"
                                    checked={!isPublic}
                                    onChange={() => setIsPublic(false)}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="font-medium text-slate-900 dark:text-white">Private</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Only authorized users can access
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Whitelist - Only show if private */}
                    {!isPublic && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Authorized Users
                            </label>

                            {/* Add email input */}
                            <div className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="user@example.com"
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddEmail(e);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddEmail}
                                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Email chips */}
                            {allowedEmails.length > 0 ? (
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 max-h-32 overflow-y-auto">
                                    {allowedEmails.map((email) => (
                                        <div
                                            key={email}
                                            className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm"
                                        >
                                            <span className="text-slate-700 dark:text-slate-300">{email}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEmail(email)}
                                                className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        Add at least one email address to create a private room
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim() || (!isPublic && allowedEmails.length === 0)}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FolderPlus className="w-4 h-4" />
                                    Create Room
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
