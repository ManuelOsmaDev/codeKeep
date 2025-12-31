import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Code2, Key, Search, Check, Copy, Link as LinkIcon, Mail, XCircle, Users, Lock, Globe, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import roomsApi from '../../../services/rooms';
import { snippets as snippetsApi, passwords as passwordsApi } from '../../../services/api';

const ManageRoomModal = ({ isOpen, onClose, room, userPermissions }) => {
    const [activeTab, setActiveTab] = useState('current'); // 'current', 'add', or 'access'
    const [roomItems, setRoomItems] = useState([]);
    const [availableSnippets, setAvailableSnippets] = useState([]);
    const [availablePasswords, setAvailablePasswords] = useState([]);
    const [accessList, setAccessList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [permissions, setPermissions] = useState({
        canCreate: true,
        canUpdate: true,
        canDelete: false,
        canShare: false,
        canViewPasswords: false
    });
    const [copied, setCopied] = useState(false);
    const [itemToAdd, setItemToAdd] = useState(null); // {type, id, title}
    const [itemPermissions, setItemPermissions] = useState({}); // {userEmail: {canView: bool, canEdit: bool}}

    // State for master password modal when adding passwords
    const [masterPasswordModal, setMasterPasswordModal] = useState({ isOpen: false, passwordItem: null });
    const [masterPasswordInput, setMasterPasswordInput] = useState('');

    // State for editing user permissions
    const [editingUserPermissions, setEditingUserPermissions] = useState(null); // { email, permissions }

    // Determine permissions (default to true if not provided - i.e., owner)
    const canCreate = userPermissions ? userPermissions.canCreate : true;
    const canDelete = userPermissions ? userPermissions.canDelete : true;
    const canShare = userPermissions ? userPermissions.canShare : true;

    useEffect(() => {
        if (isOpen && room) {
            fetchRoomData();
            if (!room.isPublic) {
                fetchAccessList();
            }
        }
    }, [isOpen, room]);

    const fetchRoomData = async () => {
        setLoading(true);
        try {
            // Fetch items currently in the room
            let itemsResponse = { data: [] };
            try {
                itemsResponse = await roomsApi.getRoomItems(room.id);
            } catch (e) {
                console.error('Error fetching room items:', e);
            }
            setRoomItems(itemsResponse.data || []);

            // Fetch all user snippets and passwords for the "Add" tab
            try {
                const [snippetsRes, passwordsRes] = await Promise.all([
                    snippetsApi.getAll().catch(e => ({ data: [] })),
                    passwordsApi.list().catch(e => ({ data: [] }))
                ]);
                setAvailableSnippets(snippetsRes?.data || []);
                setAvailablePasswords(passwordsRes?.data || []);
            } catch (e) {
                console.error('Error fetching available items:', e);
                setAvailableSnippets([]);
                setAvailablePasswords([]);
            }
        } catch (error) {
            console.error('Error loading room data:', error);
            toast.error('Failed to load room data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAccessList = async () => {
        try {
            const response = await roomsApi.getRoomAccessList(room.id);
            setAccessList(response.data || []);
        } catch (error) {
            console.error('Error loading access list:', error);
        }
    };

    const handleAddItem = (itemType, itemId, title) => {
        // For passwords, we need to ask for the master password first
        if (itemType === 'password') {
            setMasterPasswordModal({ isOpen: true, passwordItem: { id: itemId, title } });
            setMasterPasswordInput('');
            return;
        }

        // Si la sala es privada y tiene usuarios, mostrar selector de permisos
        if (!room.isPublic && accessList.length > 0) {
            setItemToAdd({ type: itemType, id: itemId, title });
            // Inicializar permisos: todos pueden ver por defecto
            const initialPerms = {};
            accessList.forEach(access => {
                initialPerms[access.email] = { canView: true, canEdit: false };
            });
            setItemPermissions(initialPerms);
        } else {
            // Si es pública o no tiene usuarios, agregar directamente
            confirmAddItem(itemType, itemId, null);
        }
    };

    const handleAddPasswordWithMasterPassword = async () => {
        if (!masterPasswordInput.trim()) {
            toast.error('Please enter your master password');
            return;
        }

        const { passwordItem } = masterPasswordModal;

        try {
            // Si la sala es privada y tiene usuarios, mostrar selector de permisos
            if (!room.isPublic && accessList.length > 0) {
                setItemToAdd({
                    type: 'password',
                    id: passwordItem.id,
                    title: passwordItem.title,
                    masterPassword: masterPasswordInput
                });
                // Inicializar permisos: todos pueden ver por defecto
                const initialPerms = {};
                accessList.forEach(access => {
                    initialPerms[access.email] = { canView: true, canEdit: false };
                });
                setItemPermissions(initialPerms);
                setMasterPasswordModal({ isOpen: false, passwordItem: null });
            } else {
                // Agregar directamente con master password
                await roomsApi.addItemToRoom(room.id, 'password', passwordItem.id, null, masterPasswordInput);
                toast.success('Password added to room');
                setMasterPasswordModal({ isOpen: false, passwordItem: null });
                setMasterPasswordInput('');
                fetchRoomData();
            }
        } catch (error) {
            console.error('Error adding password:', error);
            toast.error(error.response?.data?.message || 'Failed to add password. Check your master password.');
        }
    };

    const confirmAddItem = async (itemType, itemId, permissions) => {
        try {
            if (itemToAdd?.isEdit) {
                // Editar permisos
                await roomsApi.updateItemPermissions(room.id, itemId, permissions);
                toast.success('Permisssions updated');
            } else {
                // Agregar nuevo - include masterPassword for password items
                const masterPassword = itemToAdd?.masterPassword || null;
                await roomsApi.addItemToRoom(room.id, itemType, itemId, permissions, masterPassword);
                toast.success('Item added to room');
            }
            setItemToAdd(null);
            setItemPermissions({});
            setMasterPasswordInput('');
            fetchRoomData();
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Failed to update');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await roomsApi.removeItemFromRoom(room.id, itemId);
            toast.success('Item removed from room');
            fetchRoomData();
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        }
    };

    const handleUpdateUserPermissions = async () => {
        if (!editingUserPermissions) return;

        try {
            await roomsApi.updateUserPermissions(room.id, editingUserPermissions.email, editingUserPermissions.permissions);
            toast.success('Permissions updated successfully');
            setEditingUserPermissions(null);
            fetchAccessList();
        } catch (error) {
            console.error('Error updating permissions:', error);
            toast.error(error.response?.data?.message || 'Failed to update permissions');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        const email = emailInput.trim().toLowerCase();

        if (!email) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Invalid email format');
            return;
        }

        try {
            await roomsApi.addUserToRoom(room.id, email, permissions);
            toast.success('User added to room');
            setEmailInput('');
            // Reset permissions to default
            setPermissions({
                canCreate: true,
                canUpdate: true,
                canDelete: false,
                canShare: false,
                canViewPasswords: false
            });
            fetchAccessList();
        } catch (error) {
            console.error('Error adding user:', error);
            toast.error(error.response?.data?.message || 'Failed to add user');
        }
    };

    const handleRemoveUser = async (email) => {
        try {
            await roomsApi.removeUserFromRoom(room.id, email);
            toast.success('User removed from room');
            fetchAccessList();
        } catch (error) {
            console.error('Error removing user:', error);
            toast.error('Failed to remove user');
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(room.shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Link copied!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    if (!isOpen || !room) return null;

    // Create a set of item IDs that are already in the room
    const roomSnippetIds = new Set(
        roomItems
            .filter(item => item.itemType === 'snippet')
            .map(item => item.itemId || item.itemData?.id)
            .filter(Boolean)
    );

    const roomPasswordIds = new Set(
        roomItems
            .filter(item => item.itemType === 'password')
            .map(item => item.itemId || item.itemData?.id)
            .filter(Boolean)
    );

    const filteredSnippets = availableSnippets.filter(s => {
        const isInRoom = roomSnippetIds.has(s.id);
        const matchesSearch = (s.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return !isInRoom && matchesSearch;
    });

    const filteredPasswords = availablePasswords.filter(p => {
        const isInRoom = roomPasswordIds.has(p.id);
        const matchesSearch = (p.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return !isInRoom && matchesSearch;
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {room.name}
                            </h2>
                            {!room.isPublic && (
                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Private
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-500 dark:text-slate-400 font-mono">
                                <LinkIcon className="w-3 h-3" />
                                {room.shareUrl}
                            </div>
                            <button
                                onClick={copyLink}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-medium"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                < div className="flex border-b border-slate-200 dark:border-slate-700" >
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'current'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Items ({roomItems.length})
                    </button>
                    {
                        canCreate && (
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'add'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                Add Items
                            </button>
                        )
                    }
                    {
                        !room.isPublic && canShare && (
                            <button
                                onClick={() => setActiveTab('access')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'access'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    <Users className="w-4 h-4" />
                                    Access ({accessList.length})
                                </div>
                            </button>
                        )
                    }
                </div >

                {/* Content */}
                < div className="flex-1 overflow-y-auto p-6" >
                    {loading && activeTab !== 'access' ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                        </div>
                    ) : activeTab === 'current' ? (
                        <div className="space-y-2">
                            {roomItems.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <p>This room is empty.</p>
                                    {canCreate && (
                                        <button
                                            onClick={() => setActiveTab('add')}
                                            className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 text-sm"
                                        >
                                            Add your first item
                                        </button>
                                    )}
                                </div>
                            ) : (
                                roomItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.itemType === 'snippet'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                }`}>
                                                {item.itemType === 'snippet' ? <Code2 className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {item.itemData?.title || 'Unknown Item'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                                    {item.itemType}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!room.isPublic && accessList.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        setItemToAdd({
                                                            type: item.itemType,
                                                            id: item.id,
                                                            title: item.itemData?.title || 'Unknown',
                                                            isEdit: true
                                                        });
                                                        // Cargar permisos existentes (por ahora vacío, luego implementar)
                                                        const initialPerms = {};
                                                        accessList.forEach(access => {
                                                            initialPerms[access.email] = { canView: true, canEdit: false };
                                                        });
                                                        setItemPermissions(initialPerms);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                    title="Manage permissions"
                                                >
                                                    <Users className="w-4 h-4" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Remove from room"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : activeTab === 'add' ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search snippets and passwords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Snippets ({filteredSnippets.filter(s => !roomItems.some(item => item.itemType === 'snippet' && item.itemId === s.id)).length})
                                </h3>
                                {filteredSnippets
                                    .filter(snippet => !roomItems.some(item => item.itemType === 'snippet' && item.itemId === snippet.id))
                                    .map(snippet => (
                                        <div key={snippet.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                                    <Code2 className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{snippet.title}</span>
                                            </div>
                                            <button
                                                onClick={() => handleAddItem('snippet', snippet.id, snippet.title)}
                                                className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                }

                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-6">
                                    Passwords ({filteredPasswords.filter(p => !roomItems.some(item => item.itemType === 'password' && item.itemId === p.id)).length})
                                </h3>
                                {filteredPasswords
                                    .filter(password => !roomItems.some(item => item.itemType === 'password' && item.itemId === password.id))
                                    .map(password => (
                                        <div key={password.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
                                                        <Key className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">{password.title}</div>
                                                        {password.username && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">{password.username}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddItem('password', password.id, password.title)}
                                                className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                {filteredSnippets.length === 0 && filteredPasswords.length === 0 && (
                                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                                        No items found matching your search.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Access Control Tab
                        <div className="space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                                            Private Room
                                        </h3>
                                        <p className="text-sm text-indigo-800 dark:text-indigo-200">
                                            Only users in the list below can access this room.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Add user form */}
                            <form onSubmit={handleAddUser} className="space-y-3">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            placeholder="user@example.com"
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>

                                {/* Permissions Checkboxes */}
                                <div className="flex flex-wrap gap-4 px-1">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.canCreate}
                                            onChange={(e) => setPermissions({ ...permissions, canCreate: e.target.checked })}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Create
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.canUpdate}
                                            onChange={(e) => setPermissions({ ...permissions, canUpdate: e.target.checked })}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Edit
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.canDelete}
                                            onChange={(e) => setPermissions({ ...permissions, canDelete: e.target.checked })}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Delete
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.canShare}
                                            onChange={(e) => setPermissions({ ...permissions, canShare: e.target.checked })}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Share
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.canViewPasswords}
                                            onChange={(e) => setPermissions({ ...permissions, canViewPasswords: e.target.checked })}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        View Passwords
                                    </label>
                                </div>
                            </form>

                            {/* Access list */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Authorized Users ({accessList.length})
                                </h3>
                                {accessList.length === 0 ? (
                                    <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                                        No users have been granted access yet
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {accessList.map((access) => (
                                            <div
                                                key={access.id}
                                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer group"
                                                onClick={() => setEditingUserPermissions({
                                                    email: access.email,
                                                    permissions: {
                                                        canCreate: access.canCreate,
                                                        canUpdate: access.canUpdate,
                                                        canDelete: access.canDelete,
                                                        canShare: access.canShare,
                                                        canViewPasswords: access.canViewPasswords
                                                    }
                                                })}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                                                        <Mail className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {access.email}
                                                        </p>
                                                        <div className="flex gap-2 mt-1 flex-wrap">
                                                            {access.canCreate && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">Create</span>}
                                                            {access.canUpdate && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">Edit</span>}
                                                            {access.canDelete && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">Delete</span>}
                                                            {access.canShare && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">Share</span>}
                                                            {access.canViewPasswords && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">View Passwords</span>}
                                                            {!access.canCreate && !access.canUpdate && !access.canDelete && !access.canShare && !access.canViewPasswords && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded">View Only</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 items-center">
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Click to edit
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveUser(access.email);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Remove access"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div >

                {/* Footer */}
                < div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end" >
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Done
                    </button>
                </div >
            </div >

            {/* Permission Selector Modal */}
            {
                itemToAdd && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[60]" onClick={() => setItemToAdd(null)}>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {itemToAdd.isEdit ? 'Manage Permissions' : 'Select Permissions'}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{itemToAdd.title}</p>
                            </div>

                            <div className="p-6 max-h-96 overflow-y-auto">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Choose who can view or edit this item:</p>
                                <div className="space-y-3">
                                    {accessList.map((access) => (
                                        <div key={access.email} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{access.email}</span>
                                            <div className="flex gap-3">
                                                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={itemPermissions[access.email]?.canView || false}
                                                        onChange={(e) => setItemPermissions({
                                                            ...itemPermissions,
                                                            [access.email]: {
                                                                ...itemPermissions[access.email],
                                                                canView: e.target.checked,
                                                                canEdit: e.target.checked ? itemPermissions[access.email]?.canEdit : false
                                                            }
                                                        })}
                                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    View
                                                </label>
                                                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={itemPermissions[access.email]?.canEdit || false}
                                                        disabled={!itemPermissions[access.email]?.canView}
                                                        onChange={(e) => setItemPermissions({
                                                            ...itemPermissions,
                                                            [access.email]: {
                                                                ...itemPermissions[access.email],
                                                                canEdit: e.target.checked
                                                            }
                                                        })}
                                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                                    />
                                                    Edit
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end">
                                <button
                                    onClick={() => setItemToAdd(null)}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const perms = Object.entries(itemPermissions)
                                            .filter(([_, p]) => p.canView)
                                            .map(([email, p]) => ({
                                                userEmail: email,
                                                canView: p.canView,
                                                canEdit: p.canEdit
                                            }));
                                        confirmAddItem(itemToAdd.type, itemToAdd.id, perms.length > 0 ? perms : null);
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    {itemToAdd.isEdit ? 'Update Permissions' : 'Add Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Master Password Modal for sharing passwords */}
            {masterPasswordModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[70]" onClick={() => setMasterPasswordModal({ isOpen: false, passwordItem: null })}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-500" />
                                Master Password Required
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                To share "{masterPasswordModal.passwordItem?.title}", enter your master password to decrypt it.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>⚠️ Security Notice:</strong> Once shared, the password will be visible to all users with access to this room.
                                </p>
                            </div>

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Master Password
                            </label>
                            <input
                                type="password"
                                value={masterPasswordInput}
                                onChange={(e) => setMasterPasswordInput(e.target.value)}
                                placeholder="Enter your master password"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddPasswordWithMasterPassword();
                                    }
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setMasterPasswordModal({ isOpen: false, passwordItem: null });
                                    setMasterPasswordInput('');
                                }}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPasswordWithMasterPassword}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Share Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Permissions Modal */}
            {editingUserPermissions && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[70]" onClick={() => setEditingUserPermissions(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-500" />
                                Edit Permissions
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {editingUserPermissions.email}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <div>
                                    <span className="font-medium text-slate-900 dark:text-white">Create</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Can add items to the room</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={editingUserPermissions.permissions.canCreate}
                                    onChange={(e) => setEditingUserPermissions({
                                        ...editingUserPermissions,
                                        permissions: { ...editingUserPermissions.permissions, canCreate: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <div>
                                    <span className="font-medium text-slate-900 dark:text-white">Edit</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Can modify items and passwords</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={editingUserPermissions.permissions.canUpdate}
                                    onChange={(e) => setEditingUserPermissions({
                                        ...editingUserPermissions,
                                        permissions: { ...editingUserPermissions.permissions, canUpdate: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <div>
                                    <span className="font-medium text-slate-900 dark:text-white">Delete</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Can remove items from the room</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={editingUserPermissions.permissions.canDelete}
                                    onChange={(e) => setEditingUserPermissions({
                                        ...editingUserPermissions,
                                        permissions: { ...editingUserPermissions.permissions, canDelete: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <div>
                                    <span className="font-medium text-slate-900 dark:text-white">Share</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Can manage access list</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={editingUserPermissions.permissions.canShare}
                                    onChange={(e) => setEditingUserPermissions({
                                        ...editingUserPermissions,
                                        permissions: { ...editingUserPermissions.permissions, canShare: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <div>
                                    <span className="font-medium text-slate-900 dark:text-white">View Passwords</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Can see shared passwords</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={editingUserPermissions.permissions.canViewPasswords}
                                    onChange={(e) => setEditingUserPermissions({
                                        ...editingUserPermissions,
                                        permissions: { ...editingUserPermissions.permissions, canViewPasswords: e.target.checked }
                                    })}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </label>
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end">
                            <button
                                onClick={() => setEditingUserPermissions(null)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateUserPermissions}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ManageRoomModal;
