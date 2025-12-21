import React, { useState, useEffect } from 'react';
import { Mail, Check, X, Calendar, User, Loader2, Bell, Folder, GitBranch, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import scrumApi from '../../services/scrumModule';

const PendingInvitations = ({ onAccept }) => {
    const [invitations, setInvitations] = useState([]);
    const [unifiedInvitations, setUnifiedInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            // Fetch both old and unified invitations
            const [oldResponse, unifiedResponse] = await Promise.all([
                scrumApi.getPendingInvitations().catch(() => ({ data: [] })),
                scrumApi.getUnifiedPendingInvitations().catch(() => ({ data: [] })),
            ]);
            setInvitations(oldResponse.data || []);
            setUnifiedInvitations(unifiedResponse.data || []);
        } catch (error) {
            console.error('Error fetching invitations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOld = async (token) => {
        setProcessing(token);
        try {
            const response = await scrumApi.acceptInvitation(token);
            toast.success(`You've joined ${response.data.project?.nombre || 'the project'}!`);
            setInvitations(prev => prev.filter(inv => inv.token !== token));
            onAccept?.();
        } catch (error) {
            console.error('Error accepting invitation:', error);
            toast.error(error.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setProcessing(null);
        }
    };

    const handleAcceptUnified = async (token, resourceName) => {
        setProcessing(token);
        try {
            await scrumApi.acceptUnifiedInvitation(token);
            toast.success(`You've joined ${resourceName}!`);
            setUnifiedInvitations(prev => prev.filter(inv => inv.token !== token));
            onAccept?.();
        } catch (error) {
            console.error('Error accepting invitation:', error);
            toast.error(error.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setProcessing(null);
        }
    };

    const handleRejectOld = async (token) => {
        if (!confirm('Are you sure you want to reject this invitation?')) return;

        setProcessing(token);
        try {
            await scrumApi.rejectInvitation(token);
            toast.success('Invitation rejected');
            setInvitations(prev => prev.filter(inv => inv.token !== token));
        } catch (error) {
            console.error('Error rejecting invitation:', error);
            toast.error('Failed to reject invitation');
        } finally {
            setProcessing(null);
        }
    };

    const handleRejectUnified = async (token) => {
        if (!confirm('Are you sure you want to reject this invitation?')) return;

        setProcessing(token);
        try {
            await scrumApi.rejectUnifiedInvitation(token);
            toast.success('Invitation rejected');
            setUnifiedInvitations(prev => prev.filter(inv => inv.token !== token));
        } catch (error) {
            console.error('Error rejecting invitation:', error);
            toast.error('Failed to reject invitation');
        } finally {
            setProcessing(null);
        }
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'application':
                return <Folder className="w-4 h-4 text-amber-600" />;
            case 'version':
                return <GitBranch className="w-4 h-4 text-purple-600" />;
            case 'project':
                return <LayoutGrid className="w-4 h-4 text-indigo-600" />;
            default:
                return <LayoutGrid className="w-4 h-4 text-indigo-600" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'application': return 'Aplicación';
            case 'version': return 'Versión';
            case 'project': return 'Proyecto';
            default: return 'Proyecto';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
        );
    }

    const allInvitations = [...invitations, ...unifiedInvitations];
    if (allInvitations.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 mb-6 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    Invitaciones Pendientes ({allInvitations.length})
                </h3>
            </div>

            <div className="space-y-3">
                {/* Old invitations (project level) */}
                {invitations.map((invitation) => (
                    <div
                        key={invitation.id}
                        className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs text-indigo-600 font-medium">Proyecto</span>
                            </div>
                            <p className="font-medium text-slate-900 dark:text-white mt-1">
                                {invitation.project?.nombre || 'Unknown Project'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    {invitation.invitedBy?.name || 'Someone'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleRejectOld(invitation.token)}
                                disabled={processing === invitation.token}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleAcceptOld(invitation.token)}
                                disabled={processing === invitation.token}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing === invitation.token ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                Accept
                            </button>
                        </div>
                    </div>
                ))}

                {/* Unified invitations (app/version/project) */}
                {unifiedInvitations.map((invitation) => (
                    <div
                        key={invitation.id}
                        className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                {getResourceIcon(invitation.resourceType)}
                                <span className="text-xs text-indigo-600 font-medium">
                                    {getTypeLabel(invitation.resourceType)}
                                </span>
                            </div>
                            <p className="font-medium text-slate-900 dark:text-white mt-1">
                                {invitation.resourceName || 'Unknown'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    {invitation.invitedBy?.name || 'Someone'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleRejectUnified(invitation.token)}
                                disabled={processing === invitation.token}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleAcceptUnified(invitation.token, invitation.resourceName)}
                                disabled={processing === invitation.token}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing === invitation.token ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                Accept
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingInvitations;
