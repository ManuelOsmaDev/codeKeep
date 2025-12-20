import React, { useState } from 'react';
import { User, Bell, Palette, Code, Database, Shield, Trash2, Download, Upload } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, user, setUser, saveUser, clearAllSnippets }) => {
    const [activeSection, setActiveSection] = useState('profile');

    if (!isOpen || !user) return null;

    const sections = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'appearance', name: 'Appearance', icon: Palette },
        { id: 'editor', name: 'Editor', icon: Code },
        { id: 'data', name: 'Data & Storage', icon: Database },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] border border-slate-200 dark:border-slate-700 flex overflow-hidden shadow-xl transition-colors duration-300">
                {/* Sidebar de secciones */}
                <div className="w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === section.id
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{section.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Contenido de la sección */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 transition-colors duration-300">
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Profile Section */}
                        {activeSection === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Profile Settings</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your personal information</p>
                                </div>

                                <div className="flex items-center gap-6 bg-slate-100 dark:bg-slate-700/30 rounded-lg p-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl shadow-lg overflow-hidden">
                                        {user.avatar && user.avatar.startsWith('http') ? (
                                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.avatar
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg text-slate-900 dark:text-white">{user.name}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Display Name</label>
                                    <input
                                        type="text"
                                        value={user.name}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Avatar</label>
                                    {user.avatar && user.avatar.startsWith('http') ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3">
                                                <img src={user.avatar} alt="Google Avatar" className="w-10 h-10 rounded-full" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Google Profile Picture</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">From your Google account</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setUser({ ...user, avatar: '👤' })}
                                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                Switch to emoji instead
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={user.avatar}
                                                onChange={(e) => setUser({ ...user, avatar: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-2xl transition-colors"
                                                maxLength={2}
                                                placeholder="😀"
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose an emoji to represent you</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Appearance Section */}
                        {activeSection === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Appearance</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Customize how CodeKeep looks</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Theme</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['dark', 'light', 'auto'].map((theme) => (
                                            <button
                                                key={theme}
                                                onClick={() => setUser({ ...user, theme })}
                                                className={`p-4 rounded-lg border-2 transition-all ${user.theme === theme
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">
                                                        {theme === 'dark' && '🌙'}
                                                        {theme === 'light' && '☀️'}
                                                        {theme === 'auto' && '🔄'}
                                                    </div>
                                                    <div className="font-medium capitalize">{theme}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white">Compact Mode</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">Show more snippets on screen</div>
                                        </div>
                                        <button
                                            onClick={() => setUser({ ...user, compactMode: !user.compactMode })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${user.compactMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                                }`}
                                        >
                                            <div
                                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.compactMode ? 'translate-x-6' : ''
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Editor Section */}
                        {activeSection === 'editor' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Editor Preferences</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Configure code editor settings</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Default Language</label>
                                    <select
                                        value={user.defaultLanguage || 'javascript'}
                                        onChange={(e) => setUser({ ...user, defaultLanguage: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 capitalize text-slate-900 dark:text-white transition-colors"
                                    >
                                        <option value="javascript">JavaScript</option>
                                        <option value="typescript">TypeScript</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="csharp">C#</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white">Line Numbers</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Show line numbers in code</div>
                                            </div>
                                            <button
                                                onClick={() => setUser({ ...user, lineNumbers: !user.lineNumbers })}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${user.lineNumbers ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                                    }`}
                                            >
                                                <div
                                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.lineNumbers ? 'translate-x-6' : ''
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white">Auto-Save</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Automatically save changes</div>
                                            </div>
                                            <button
                                                onClick={() => setUser({ ...user, autoSave: !user.autoSave })}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${user.autoSave ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                                    }`}
                                            >
                                                <div
                                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.autoSave ? 'translate-x-6' : ''
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data & Storage Section */}
                        {activeSection === 'data' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Data & Storage</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your snippets and data</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 p-4 rounded-lg transition-colors">
                                        <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        <div className="text-left">
                                            <div className="font-semibold text-slate-900 dark:text-white">Export Data</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Download all snippets</div>
                                        </div>
                                    </button>

                                    <button className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 p-4 rounded-lg transition-colors">
                                        <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        <div className="text-left">
                                            <div className="font-semibold text-slate-900 dark:text-white">Import Data</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Upload snippets</div>
                                        </div>
                                    </button>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-red-600 dark:text-red-400">Danger Zone</div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Permanently delete all your snippets. This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={clearAllSnippets}
                                        className="w-full bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg transition-colors font-semibold"
                                    >
                                        Delete All Snippets
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Notifications</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Control how you receive updates</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white">Enable Notifications</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Get notified about updates</div>
                                            </div>
                                            <button
                                                onClick={() => setUser({ ...user, notifications: !user.notifications })}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${user.notifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                                    }`}
                                            >
                                                <div
                                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.notifications ? 'translate-x-6' : ''
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white">Email Notifications</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Receive updates via email</div>
                                            </div>
                                            <button
                                                onClick={() => setUser({ ...user, emailNotifications: !user.emailNotifications })}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${user.emailNotifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                                    }`}
                                            >
                                                <div
                                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${user.emailNotifications ? 'translate-x-6' : ''
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Section */}
                        {activeSection === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Security & Privacy</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Protect your account and data</p>
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-700/30 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</div>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">
                                            Coming Soon
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <button className="w-full bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-left px-4 py-3 rounded-lg transition-colors">
                                        <div className="font-semibold text-slate-900 dark:text-white">Change Password</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Update your password</div>
                                    </button>
                                </div>

                                <div>
                                    <button className="w-full bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-left px-4 py-3 rounded-lg transition-colors">
                                        <div className="font-semibold text-slate-900 dark:text-white">Active Sessions</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Manage your logged-in devices</div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer con botones */}
                    <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    await saveUser(user);
                                    onClose();
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
