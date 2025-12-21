import React, { useState, useEffect } from 'react';
import { X, Users, Crown, Shield, User, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import scrumApi from '../../services/scrumModule';

const ProjectMembersPanel = ({ isOpen, onClose, projectId, onMembersChange }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && projectId) {
            fetchMembers();
        }
    }, [isOpen, projectId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await scrumApi.getProjectMembers(projectId);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId, userName) => {
        if (!confirm(`Are you sure you want to remove ${userName} from this project?`)) return;

        try {
            await scrumApi.removeMember(projectId, userId);
            toast.success('Member removed successfully');
            fetchMembers();
            onMembersChange?.();
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error(error.response?.data?.message || 'Failed to remove member');
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'owner':
                return <Crown className="w-4 h-4 text-amber-500" />;
            case 'admin':
                return <Shield className="w-4 h-4 text-blue-500" />;
            default:
                return <User className="w-4 h-4 text-slate-400" />;
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
            admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
            member: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
        };
        return colors[role] || colors.member;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Project Members
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {members.length} member{members.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            No members found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                            {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {member.user?.name || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {member.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getRoleBadge(member.role)}`}>
                                            {getRoleIcon(member.role)}
                                            {member.role}
                                        </span>
                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => handleRemoveMember(member.userId, member.user?.name)}
                                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectMembersPanel;
