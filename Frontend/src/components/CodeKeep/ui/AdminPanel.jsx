import React, { useState, useEffect } from 'react';
import { users as usersAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { Shield, Check, X, Search } from 'lucide-react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await usersAPI.getAll();
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = async (userId, permission, value) => {
        try {
            await usersAPI.updatePermissions(userId, { [permission]: value });
            setUsers(users.map(user =>
                user.id === userId ? { ...user, [permission]: value } : user
            ));
            toast.success('Permissions updated');
        } catch (error) {
            toast.error('Failed to update permissions');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-6 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
                            <p className="text-slate-500 dark:text-slate-400">Manage user permissions and access control</p>
                        </div>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Admin</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Password Manager</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Code Snippets</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                                                {user.avatar && user.avatar.startsWith('http') ? (
                                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.avatar || user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handlePermissionChange(user.id, 'isAdmin', !user.isAdmin)}
                                            className={`p-2 rounded-lg transition-colors ${user.isAdmin
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {user.isAdmin ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handlePermissionChange(user.id, 'canManagePasswords', !user.canManagePasswords)}
                                            className={`p-2 rounded-lg transition-colors ${user.canManagePasswords
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {user.canManagePasswords ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handlePermissionChange(user.id, 'canManageSnippets', !user.canManageSnippets)}
                                            className={`p-2 rounded-lg transition-colors ${user.canManageSnippets
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {user.canManageSnippets ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
