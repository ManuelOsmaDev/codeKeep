import React, { useState } from 'react';
import { X, Mail, UserPlus, Loader2, Folder, GitBranch, LayoutGrid, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import scrumApi from '../../services/scrumModule';

const InviteMemberModal = ({ isOpen, onClose, resourceType, resourceId, resourceName, onInviteSent }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await scrumApi.sendInvitation({
                email: email.trim().toLowerCase(),
                resourceType,
                resourceId,
            });
            setShowSuccess(true);
            onInviteSent?.();
        } catch (error) {
            console.error('Error sending invitation:', error);
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowSuccess(false);
        setEmail('');
        onClose();
    };

    const getResourceIcon = () => {
        switch (resourceType) {
            case 'application':
                return <Folder className="w-5 h-5 text-amber-600" />;
            case 'version':
                return <GitBranch className="w-5 h-5 text-purple-600" />;
            case 'project':
                return <LayoutGrid className="w-5 h-5 text-indigo-600" />;
            default:
                return <UserPlus className="w-5 h-5 text-indigo-600" />;
        }
    };

    // ... (keep helper functions: getAccessDescription, getResourceLabel)

    const getAccessDescription = () => {
        switch (resourceType) {
            case 'application':
                return 'El usuario tendrá acceso a TODAS las versiones y proyectos de esta aplicación.';
            case 'version':
                return 'El usuario tendrá acceso a TODOS los proyectos de esta versión.';
            case 'project':
                return 'El usuario tendrá acceso solo a este proyecto.';
            default:
                return '';
        }
    };

    const getResourceLabel = () => {
        switch (resourceType) {
            case 'application': return 'Aplicación';
            case 'version': return 'Versión';
            case 'project': return 'Proyecto';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all`}>
                {showSuccess ? (
                    <div className="p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Invitation Sent!
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            We've sent an email to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span> with instructions to join <strong>{resourceName}</strong>.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                                    {getResourceIcon()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Invitar a {getResourceLabel()}
                                    </h2>
                                    <p className="text-sm text-slate-500">{resourceName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Access info */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                {getAccessDescription()}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Send Invitation
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default InviteMemberModal;
