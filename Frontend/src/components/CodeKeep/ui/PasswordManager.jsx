import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { passwords } from '../../../services/api';
import { Key, Plus, Eye, EyeOff, Copy, Edit, Trash2, Lock, Unlock, Search, X, Save, ExternalLink } from 'lucide-react';

const PasswordManager = () => {
    const { user } = useAuth();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [hasMasterPassword, setHasMasterPassword] = useState(false);
    const [passwordList, setPasswordList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMasterModal, setShowMasterModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editingPassword, setEditingPassword] = useState(null);
    const [decryptedPasswords, setDecryptedPasswords] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
    const [isCreatingMaster, setIsCreatingMaster] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);



    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        title: '',
        url: '',
        username: '',
        password: '',
        notes: '',
        masterPassword: ''
    });

    useEffect(() => {
        checkMasterPassword();
    }, []);

    const checkMasterPassword = async () => {
        try {
            const response = await passwords.hasMaster();
            setHasMasterPassword(response.data.hasMasterPassword);
            if (response.data.hasMasterPassword) {
                setShowMasterModal(true);
            } else {
                setIsCreatingMaster(true);
                setShowMasterModal(true);
            }
        } catch (error) {
            console.error('Error checking master password:', error);
            toast.error('Error al verificar la clave maestra');
        } finally {
            setLoading(false);
        }
    };

    const handleSetMasterPassword = async () => {
        if (masterPassword.length < 8) {
            toast.error('La clave maestra debe tener al menos 8 caracteres');
            return;
        }
        if (masterPassword !== confirmMasterPassword) {
            toast.error('Las claves no coinciden');
            return;
        }

        try {
            await passwords.setMaster({ masterPassword });
            toast.success('¡Clave maestra establecida con éxito!');
            setHasMasterPassword(true);
            setIsUnlocked(true);
            setShowMasterModal(false);
            setIsCreatingMaster(false);
            // NO limpiar masterPassword - la necesitamos para operaciones
            setConfirmMasterPassword('');
            fetchPasswords();
        } catch (error) {
            toast.error('Error al establecer la clave maestra');
        }
    };

    const handleVerifyMasterPassword = async () => {
        if (isLocked) {
            toast.error('Cuenta bloqueada. Contacta a codekeep@ayuda.co');
            return;
        }

        try {
            // Usar el nuevo endpoint unlock que devuelve todas las contraseñas descifradas
            const response = await passwords.unlock({ masterPassword });

            // La respuesta es un array de contraseñas descifradas
            const unlockedPasswords = response.data;

            // Crear mapa de contraseñas descifradas
            const decryptedMap = {};
            unlockedPasswords.forEach(p => {
                if (!p.error) {
                    decryptedMap[p.id] = p;
                }
            });

            setDecryptedPasswords(decryptedMap);
            setPasswordList(unlockedPasswords); // Actualizar lista con datos completos si es necesario, o mantener sincronizado

            setIsUnlocked(true);
            setShowMasterModal(false);
            setFailedAttempts(0);
            toast.success('Desbloqueado');
            // NO limpiar masterPassword - la necesitamos para operaciones CRUD
        } catch (error) {
            console.error(error);
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);
            setMasterPassword('');

            if (newAttempts >= 3) {
                setIsLocked(true);
                toast.error('Tu cuenta está bloqueada. Contacta a codekeep@ayuda.co');
            } else {
                const remainingAttempts = 3 - newAttempts;
                const attemptMessage = remainingAttempts === 1
                    ? 'Te queda 1 intento más'
                    : `Te quedan ${remainingAttempts} intentos más`;
                toast.error(`Clave maestra incorrecta. ${attemptMessage}`);
            }
        }
    };

    const fetchPasswords = async () => {
        try {
            // Si ya tenemos la master password (está desbloqueado), usamos unlock para refrescar todo
            if (isUnlocked && masterPassword) {
                const response = await passwords.unlock({ masterPassword });
                const unlockedPasswords = response.data;

                const decryptedMap = {};
                unlockedPasswords.forEach(p => {
                    if (!p.error) {
                        decryptedMap[p.id] = p;
                    }
                });
                setDecryptedPasswords(decryptedMap);
                setPasswordList(unlockedPasswords);
            } else {
                // Si no, carga normal (solo IDs)
                const response = await passwords.list();
                setPasswordList(response.data);
            }
        } catch (error) {
            toast.error('Error al cargar contraseñas');
        }
    };

    const handleDecryptPassword = async (id) => {
        if (!masterPassword) {
            toast.error('Ingresa tu clave maestra primero');
            return;
        }

        try {
            const response = await passwords.decrypt(id, { masterPassword });
            setDecryptedPasswords(prev => ({ ...prev, [id]: response.data }));
        } catch (error) {
            toast.error('Error al descifrar contraseña');
        }
    };

    const handleCreatePassword = async () => {
        if (!passwordForm.title || !passwordForm.password) {
            toast.error('Título y contraseña son obligatorios');
            return;
        }

        try {
            const dataToSend = { ...passwordForm, masterPassword };
            await passwords.create(dataToSend);
            toast.success('Contraseña guardada');
            setShowPasswordModal(false);
            resetPasswordForm();
            fetchPasswords();
        } catch (error) {
            toast.error('Error al guardar contraseña');
        }
    };

    const handleUpdatePassword = async () => {
        if (!editingPassword) return;

        try {
            const dataToSend = { ...passwordForm, masterPassword };
            await passwords.update(editingPassword.id, dataToSend);
            toast.success('Contraseña actualizada');
            setShowPasswordModal(false);
            setEditingPassword(null);
            resetPasswordForm();
            fetchPasswords();
        } catch (error) {
            toast.error('Error al actualizar contraseña');
        }
    };

    const handleDeletePassword = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta contraseña?')) return;

        try {
            await passwords.delete(id);
            toast.success('Contraseña eliminada');
            setPasswordList(prev => prev.filter(p => p.id !== id));
            setDecryptedPasswords(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } catch (error) {
            toast.error('Error al eliminar contraseña');
        }
    };

    const handleCopyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado al portapapeles`);
    };

    const resetPasswordForm = () => {
        setPasswordForm({
            title: '',
            url: '',
            username: '',
            password: '',
            notes: '',
            masterPassword: ''
        });
    };

    const openEditModal = async (password) => {
        // Si ya está descifrada en el mapa global, usarla
        let decrypted = decryptedPasswords[password.id];

        if (!decrypted) {
            await handleDecryptPassword(password.id);
            decrypted = decryptedPasswords[password.id];
        }

        if (decrypted) {
            setPasswordForm({
                title: decrypted.title,
                url: decrypted.url || '',
                username: decrypted.username || '',
                password: decrypted.password,
                notes: decrypted.notes || '',
                masterPassword: ''
            });
            setEditingPassword(password);
            setShowPasswordModal(true);
        }
    };

    const generatePassword = () => {
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let newPassword = '';
        for (let i = 0; i < length; i++) {
            newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPasswordForm(prev => ({ ...prev, password: newPassword }));
        toast.success('Contraseña generada');
    };

    // Filter passwords based on search term
    const filteredPasswords = passwordList.filter(pwd => {
        if (!searchTerm) return true;
        const decrypted = decryptedPasswords[pwd.id];
        if (!decrypted) return false; // Si no está descifrada, no se puede buscar (o se muestra si searchTerm es vacío)

        const term = searchTerm.toLowerCase();
        return (
            decrypted.title?.toLowerCase().includes(term) ||
            decrypted.username?.toLowerCase().includes(term) ||
            decrypted.url?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Lock className="w-16 h-16 text-slate-400" />
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                    Password Manager Bloqueado
                </h2>
                <button
                    onClick={() => setShowMasterModal(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Unlock className="w-5 h-5 inline mr-2" />
                    Desbloquear
                </button>

                {/* Master Password Modal */}
                {showMasterModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {isCreatingMaster ? '🔐 Crear Clave Maestra' : isLocked ? '🔒 Cuenta Bloqueada' : '🔓 Ingresar Clave Maestra'}
                                </h3>
                                {!isCreatingMaster && (
                                    <button
                                        onClick={() => setShowMasterModal(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Cerrar"
                                    >
                                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {isLocked ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                                            Tu cuenta ha sido bloqueada por seguridad
                                        </p>
                                        <p className="text-red-600 dark:text-red-300 text-sm">
                                            Has excedido el número máximo de intentos. Por favor, contacta a:
                                        </p>
                                        <p className="text-red-900 dark:text-red-100 font-bold text-lg mt-2">
                                            codekeep@ayuda.co
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Clave Maestra
                                        </label>
                                        <input
                                            type="password"
                                            value={masterPassword}
                                            onChange={(e) => setMasterPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Ingresa tu clave maestra"
                                            onKeyPress={(e) => e.key === 'Enter' && !isCreatingMaster && handleVerifyMasterPassword()}
                                        />
                                    </div>

                                    {isCreatingMaster && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Confirmar Clave Maestra
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmMasterPassword}
                                                onChange={(e) => setConfirmMasterPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Confirma tu clave maestra"
                                            />
                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                ⚠️ Si olvidas esta clave, NO podrás recuperar tus contraseñas.
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={isCreatingMaster ? handleSetMasterPassword : handleVerifyMasterPassword}
                                        className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {isCreatingMaster ? 'Crear Clave Maestra' : 'Desbloquear'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <Key className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Password Manager</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filteredPasswords.length} contraseña{filteredPasswords.length !== 1 ? 's' : ''} guardada{filteredPasswords.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetPasswordForm();
                            setEditingPassword(null);
                            setShowPasswordModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Contraseña
                    </button>
                </div>
            </div>

            {/* Password List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPasswords.map((pwd) => {
                    const decrypted = decryptedPasswords[pwd.id];
                    const isDecrypted = !!decrypted;

                    return (
                        <div
                            key={pwd.id}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            {isDecrypted ? decrypted.title : (pwd.title || '🔒 Bloqueado')}
                                        </h3>
                                        {isDecrypted && decrypted.url && (
                                            <a
                                                href={decrypted.url.startsWith('http') ? decrypted.url : `https://${decrypted.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded transition-colors group relative"
                                                title={decrypted.url}
                                            >
                                                <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                    {decrypted.url}
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeletePassword(pwd.id)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {!isDecrypted ? (
                                <button
                                    onClick={() => handleDecryptPassword(pwd.id)}
                                    className="w-full px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    Ver Contraseña
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    {decrypted.username && (
                                        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                                            <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                                {decrypted.username}
                                            </span>
                                            <button
                                                onClick={() => handleCopyToClipboard(decrypted.username, 'Usuario')}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                                        <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                                            ••••••••
                                        </span>
                                        <button
                                            onClick={() => handleCopyToClipboard(decrypted.password, 'Contraseña')}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => openEditModal(pwd)}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Password Form Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {editingPassword ? 'Editar Contraseña' : 'Nueva Contraseña'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setEditingPassword(null);
                                    resetPasswordForm();
                                }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={passwordForm.title}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej: Gmail, Facebook, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    value={passwordForm.url}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, url: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://ejemplo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    value={passwordForm.username}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, username: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Contraseña *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={passwordForm.password}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        placeholder="Contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                    >
                                        Generar
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Notas
                                </label>
                                <textarea
                                    value={passwordForm.notes}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    rows="3"
                                    placeholder="Notas adicionales..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setEditingPassword(null);
                                        resetPasswordForm();
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={editingPassword ? handleUpdatePassword : handleCreatePassword}
                                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                >
                                    {editingPassword ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PasswordManager;
