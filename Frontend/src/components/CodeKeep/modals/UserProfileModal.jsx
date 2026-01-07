import React from 'react';

const UserProfileModal = ({ isOpen, onClose, user, snippetsCount, favoritesCount }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg">
                        {user.avatar}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Total Snippets</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{snippetsCount}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Favorites</span>
                            <span className="text-lg font-bold text-red-500 dark:text-red-400">{favoritesCount}</span>
                        </div>

                    </div>

                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Account Info</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Theme:</span>
                                <span className="capitalize text-slate-900 dark:text-white">{user.theme}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Notifications:</span>
                                <span className="text-slate-900 dark:text-white">{user.notifications ? 'Enabled' : 'Disabled'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default UserProfileModal;
