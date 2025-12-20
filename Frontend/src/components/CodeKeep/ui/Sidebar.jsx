import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Settings, HelpCircle, User, Tag, ChevronDown, Key, Share2, Shield, LayoutGrid } from 'lucide-react';

const Sidebar = ({
    currentView,
    setCurrentView,
    activeTab,
    setActiveTab,
    selectedLanguage,
    setSelectedLanguage,
    selectedTags,
    setSelectedTags,
    favorites,
    bookmarks,
    allTags,
    setShowUserProfile,
    setShowSettings,
    languages,
    languagesExpanded,
    setLanguagesExpanded,
    tagsExpanded,
    setTagsExpanded,
    driveExpanded,
    setDriveExpanded,
    user
}) => {
    const navigate = useNavigate();

    return (
        <div className="w-72 lg:w-80 xl:w-96 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="text-indigo-600 dark:text-indigo-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CodeKeep</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <button
                    onClick={() => {
                        setCurrentView('all');
                        setActiveTab('snippets');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-2 ${currentView === 'all' && activeTab === 'snippets'
                        ? 'bg-indigo-50 dark:bg-slate-700/50 text-indigo-600 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                >
                    <div className="grid grid-cols-2 gap-1">
                        <div className={`w-2 h-2 rounded-sm ${currentView === 'all' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                        <div className={`w-2 h-2 rounded-sm ${currentView === 'all' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                        <div className={`w-2 h-2 rounded-sm ${currentView === 'all' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                        <div className={`w-2 h-2 rounded-sm ${currentView === 'all' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                    </div>
                    <span className="font-medium">All Snippets</span>
                </button>

                <button
                    onClick={() => {
                        setCurrentView('favorites');
                        setActiveTab('snippets');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-2 ${currentView === 'favorites'
                        ? 'bg-red-50 dark:bg-slate-700/50 text-red-600 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${favorites.size > 0 ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : ''}`} />
                    <span className="font-medium">Favorites</span>
                    {favorites.size > 0 && (
                        <span className="ml-auto bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                            {favorites.size}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => {
                        setCurrentView('bookmarks');
                        setActiveTab('snippets');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-6 ${currentView === 'bookmarks'
                        ? 'bg-blue-50 dark:bg-slate-700/50 text-blue-600 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                >
                    <Bookmark className={`w-5 h-5 ${bookmarks.size > 0 ? 'fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400' : ''}`} />
                    <span className="font-medium">Bookmarks</span>
                    {bookmarks.size > 0 && (
                        <span className="ml-auto bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                            {bookmarks.size}
                        </span>
                    )}
                </button>

                <div className="mb-6">
                    <button
                        onClick={() => setLanguagesExpanded(!languagesExpanded)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <span className="font-semibold uppercase tracking-wider text-xs">Languages</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${languagesExpanded ? '' : '-rotate-90'}`} />
                    </button>
                    {languagesExpanded && (
                        <div className="mt-2 space-y-1">
                            <button
                                onClick={() => setSelectedLanguage('all')}
                                className={`w-full text-left px-4 py-2 text-sm rounded transition-colors ${selectedLanguage === 'all' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                All Languages
                            </button>
                            {languages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={`w-full text-left px-4 py-2 text-sm rounded capitalize transition-colors ${selectedLanguage === lang ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <button
                        onClick={() => setTagsExpanded(!tagsExpanded)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            <span className="font-semibold uppercase tracking-wider text-xs">Tags</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${tagsExpanded ? '' : '-rotate-90'}`} />
                    </button>
                    {tagsExpanded && allTags?.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {allTags?.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag)
                                                ? prev.filter(t => t !== tag)
                                                : [...prev, tag]
                                        );
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm rounded transition-colors ${selectedTags?.includes(tag) ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* FILES & INTEGRATIONS */}
                {user?.googleId && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-500 tracking-wider">
                            FILES & INTEGRATIONS
                        </div>

                        <div>
                            <button
                                onClick={() => setDriveExpanded(!driveExpanded)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white dark:bg-cyan-500/10 border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:bg-cyan-500/20 transition-colors mb-2"
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M7.71 3.5L1.15 15h3l6.55-11.5z" />
                                        <path fill="#FBBC04" d="M7.71 3.5L14.26 15H21l-6.55-11.5z" />
                                        <path fill="#34A853" d="M1.15 15l3.27 5.68L14.26 15z" />
                                    </svg>
                                    <span className="font-medium text-slate-700 dark:text-white">Google Drive</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${driveExpanded ? '' : '-rotate-90'}`} />
                            </button>

                            {driveExpanded && (
                                <div className="ml-4 space-y-1">
                                    <button
                                        onClick={() => setActiveTab('drive')}
                                        className="w-full text-left px-4 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-300"
                                    >
                                        My Drive
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-300">
                                        Shared with me
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-300">
                                        Recent
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PASSWORD MANAGER - Available for all users */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                    <button
                        onClick={() => setActiveTab('passwords')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-amber-500/10 border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:bg-amber-500/20 transition-colors mb-2"
                    >
                        <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <span className="font-medium text-slate-700 dark:text-white">Password Manager</span>
                    </button>

                    {/* ROOMS */}
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-2 ${activeTab === 'rooms'
                            ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                            : 'bg-white dark:bg-indigo-500/10 border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:bg-indigo-500/20 text-slate-700 dark:text-white'
                            }`}
                    >
                        <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium">Shared Rooms</span>
                    </button>

                    {/* SCRUM MODULE */}
                    <button
                        onClick={() => navigate('/scrum')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-green-500/10 border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:bg-green-500/20 transition-colors"
                    >
                        <LayoutGrid className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-slate-700 dark:text-white">Scrum Manager</span>
                    </button>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-2">
                <button
                    onClick={() => setShowUserProfile(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-300"
                >
                    <User className="w-5 h-5" />
                    <span>User profile</span>
                </button>
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-300"
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-300">
                    <HelpCircle className="w-5 h-5" />
                    <span>Help</span>
                </button>
                {user?.isAdmin && (
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'admin'
                            ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                            }`}
                    >
                        <Shield className="w-5 h-5" />
                        <span>Admin Panel</span>
                    </button>
                )}
            </div>
        </div >
    );
};

export default Sidebar;
