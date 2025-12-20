import React from 'react';
import { Search, Settings, LogOut, User } from 'lucide-react';

const Header = ({ searchTerm, setSearchTerm, user, setShowUserProfile, setShowSettings, onLogout }) => {
    return (
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search snippets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                        {user?.name}
                    </span>
                    <button
                        onClick={() => setShowUserProfile(true)}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all text-2xl"
                    >
                        {user?.avatar && user.avatar.startsWith('http') ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.avatar || user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </button>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>

                <button
                    onClick={onLogout}
                    className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Header;
