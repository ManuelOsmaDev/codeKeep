import React from 'react';
import { Search, LogOut, Power } from 'lucide-react';

const Header = ({ searchTerm, setSearchTerm, user, setShowUserProfile, setShowSettings, onLogout, activeTab }) => {
    return (
        <div
            className="flex justify-between items-center px-6 py-4"
            style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaebed' }}
        >
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#808099' }} />
                <input
                    type="text"
                    placeholder={activeTab === 'passwords' ? "Buscar contraseñas..." : activeTab === 'rooms' ? "Buscar sala..." : "Buscar snippets..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{
                        backgroundColor: '#f4f3f3',
                        border: '1px solid #eaebed',
                        color: '#2e3549'
                    }}
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium" style={{ color: '#2e3549' }}>{user?.name}</p>
                        <p className="text-xs" style={{ color: '#808099' }}>{user?.email}</p>
                    </div>
                    <button
                        onClick={() => setShowUserProfile(true)}
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden transition-all"
                        style={{ backgroundColor: '#ffcd00', color: '#2e3549' }}
                    >
                        {user?.avatar && user.avatar.startsWith('http') ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </button>
                </div>

                <button
                    onClick={onLogout}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    style={{ color: '#808099' }}
                    title="Cerrar sesión"
                >
                    <Power className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Header;
