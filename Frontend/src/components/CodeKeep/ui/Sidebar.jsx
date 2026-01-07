import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Settings, User, Tag, ChevronDown, Key, Shield, LayoutGrid, Code, FolderPlus } from 'lucide-react';

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

    const activeStyle = { backgroundColor: '#2e3549', color: '#fff' };
    const inactiveStyle = { color: '#2e3549' };

    return (
        <div
            className="w-64 lg:w-72 flex flex-col min-h-screen"
            style={{ backgroundColor: '#fff', borderRight: '1px solid #eaebed' }}
        >
            {/* Logo Header */}
            <div className="p-4" style={{ borderBottom: '1px solid #eaebed' }}>
                <img src="/logo-codeya.png" alt="CodeYa" className="h-10" />
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                {/* Main Navigation */}
                <div className="px-3 space-y-1">
                    <button
                        onClick={() => {
                            setCurrentView('all');
                            setActiveTab('snippets');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                        style={currentView === 'all' && activeTab === 'snippets' ? activeStyle : inactiveStyle}
                    >
                        <Code className="w-5 h-5" />
                        <span>Snippets</span>
                    </button>

                    <button
                        onClick={() => {
                            setCurrentView('favorites');
                            setActiveTab('snippets');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                        style={currentView === 'favorites' ? activeStyle : inactiveStyle}
                    >
                        <Heart className={`w-5 h-5 ${favorites.size > 0 ? 'fill-current' : ''}`} />
                        <span>Favoritos</span>
                        {favorites.size > 0 && (
                            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#ffcd00', color: '#2e3549' }}>
                                {favorites.size}
                            </span>
                        )}
                    </button>


                </div>

                {/* Languages Section */}
                <div className="px-3 mt-6">
                    <button
                        onClick={() => setLanguagesExpanded(!languagesExpanded)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#808099' }}
                    >
                        <span>Lenguajes</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${languagesExpanded ? '' : '-rotate-90'}`} />
                    </button>
                    {languagesExpanded && (
                        <div className="mt-1 space-y-0.5">
                            <button
                                onClick={() => setSelectedLanguage('all')}
                                className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                                style={selectedLanguage === 'all' ? { backgroundColor: '#f4f3f3', color: '#2e3549', fontWeight: 500 } : { color: '#808099' }}
                            >
                                Todos
                            </button>
                            {languages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setSelectedLanguage(lang)}
                                    className="w-full text-left px-3 py-2 text-sm rounded-lg capitalize transition-colors"
                                    style={selectedLanguage === lang ? { backgroundColor: '#f4f3f3', color: '#2e3549', fontWeight: 500 } : { color: '#808099' }}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tags Section */}
                <div className="px-3 mt-4">
                    <button
                        onClick={() => setTagsExpanded(!tagsExpanded)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#808099' }}
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Tags</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${tagsExpanded ? '' : '-rotate-90'}`} />
                    </button>
                    {tagsExpanded && allTags?.length > 0 && (
                        <div className="mt-1 space-y-0.5">
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
                                    className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                                    style={selectedTags?.includes(tag) ? { backgroundColor: '#f4f3f3', color: '#2e3549', fontWeight: 500 } : { color: '#808099' }}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="my-4 mx-3" style={{ borderTop: '1px solid #eaebed' }}></div>

                {/* Tools Section */}
                <div className="px-3 space-y-1">
                    <button
                        onClick={() => setActiveTab('passwords')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                        style={activeTab === 'passwords' ? activeStyle : inactiveStyle}
                    >
                        <Key className="w-5 h-5" />
                        <span>Contraseñas</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('rooms')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                        style={activeTab === 'rooms' ? activeStyle : inactiveStyle}
                    >
                        <FolderPlus className="w-5 h-5" />
                        <span>Salas Compartidas</span>
                    </button>

                    <button
                        onClick={() => navigate('/scrum')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                        style={inactiveStyle}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        <span>Scrum Manager</span>
                    </button>

                    {/* Google Drive */}
                    {user?.googleId && (
                        <>
                            <button
                                onClick={() => setDriveExpanded(!driveExpanded)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                                style={inactiveStyle}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M7.71 3.5L1.15 15h3l6.55-11.5z" />
                                        <path fill="#FBBC04" d="M7.71 3.5L14.26 15H21l-6.55-11.5z" />
                                        <path fill="#34A853" d="M1.15 15l3.27 5.68L14.26 15z" />
                                    </svg>
                                    <span>Google Drive</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${driveExpanded ? '' : '-rotate-90'}`} />
                            </button>

                            {driveExpanded && (
                                <div className="ml-4 space-y-0.5">
                                    <button
                                        onClick={() => setActiveTab('drive')}
                                        className="w-full text-left px-3 py-2 text-sm rounded-lg"
                                        style={{ color: '#808099' }}
                                    >
                                        Mi Drive
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 space-y-1" style={{ borderTop: '1px solid #eaebed' }}>
                <button
                    onClick={() => setShowUserProfile(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={inactiveStyle}
                >
                    <User className="w-5 h-5" />
                    <span>Mi Perfil</span>
                </button>
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={inactiveStyle}
                >
                    <Settings className="w-5 h-5" />
                    <span>Configuración</span>
                </button>
                {user?.isAdmin && (
                    <button
                        onClick={() => setActiveTab('admin')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        style={activeTab === 'admin' ? activeStyle : inactiveStyle}
                    >
                        <Shield className="w-5 h-5" />
                        <span>Panel Admin</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
