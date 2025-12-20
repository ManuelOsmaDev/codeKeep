import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { drive } from '../../../services/api';
import { File, Folder, Download, Trash2, Search, ArrowLeft, Plus, ExternalLink, Edit, FileText, X, Save, HardDrive, Users, Clock, Star } from 'lucide-react';

const DriveView = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folderHistory, setFolderHistory] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [newFileType, setNewFileType] = useState('doc');
    const [saving, setSaving] = useState(false);
    const [currentView, setCurrentView] = useState('my-drive');

    // Ref for debouncing
    const searchTimeout = useRef(null);

    useEffect(() => {
        fetchFiles();
    }, [currentFolder]);

    // Debounced search effect
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        // If search term is empty, just fetch regular files
        if (!searchTerm.trim()) {
            if (searching) setSearching(false);
            fetchFiles();
            return;
        }

        // Set searching state
        setSearching(true);

        // Set new timeout for search
        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await drive.searchFiles(searchTerm);
                setFiles(response.data || []);
            } catch (error) {
                console.error('Search error:', error);
                toast.error('Search failed');
            } finally {
                setSearching(false);
            }
        }, 300); // 300ms debounce

        // Cleanup
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchTerm]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const params = {
                orderBy: 'folder,modifiedTime desc',
                pageSize: 50,
            };

            if (currentFolder) {
                params.folderId = currentFolder.id;
            }

            const response = await drive.listFiles(params);
            setFiles(response.data.files || []);
        } catch (error) {
            console.error('Error fetching Drive files:', error);
            toast.error('Failed to load Google Drive files');
        } finally {
            setLoading(false);
        }
    };



    // Helper function to check if file can be edited
    const isEditableFile = (file) => {
        // Google Docs can be exported and edited
        if (file.mimeType === 'application/vnd.google-apps.document') {
            return true;
        }

        // Text-based files
        if (file.mimeType === 'text/plain' || file.mimeType.includes('text/')) {
            return true;
        }

        // Common code file extensions
        const editableExtensions = [
            '.js', '.jsx', '.ts', '.tsx',
            '.php', '.py', '.rb', '.java', '.c', '.cpp', '.h', '.cs',
            '.html', '.htm', '.css', '.scss', '.sass', '.less',
            '.json', '.xml', '.yaml', '.yml', '.toml', '.ini',
            '.md', '.markdown', '.txt', '.log',
            '.sh', '.bash', '.zsh', '.bat', '.cmd', '.ps1',
            '.sql', '.graphql', '.vue', '.svelte',
            '.env', '.gitignore', '.htaccess'
        ];

        return editableExtensions.some(ext => file.name?.toLowerCase().endsWith(ext));
    };

    const handleFileClick = async (file) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            setFolderHistory([...folderHistory, currentFolder]);
            setCurrentFolder(file);
        } else if (isEditableFile(file)) {
            await openFileInEditor(file);
        } else {
            // For non-editable files, open in Drive
            window.open(file.webViewLink, '_blank');
        }
    };

    const handleGoBack = () => {
        const previousFolder = folderHistory[folderHistory.length - 1];
        setFolderHistory(folderHistory.slice(0, -1));
        setCurrentFolder(previousFolder);
    };

    const handleDownload = async (e, file) => {
        e.stopPropagation();
        try {
            if (file.mimeType.startsWith('application/vnd.google-apps.')) {
                window.open(file.webViewLink, '_blank');
                return;
            }

            const response = await drive.downloadFile(file.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Download failed');
        }
    };

    const handleDelete = async (e, fileId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await drive.deleteFile(fileId);
            setFiles(files.filter(f => f.id !== fileId));
            toast.success('File deleted');
        } catch (error) {
            toast.error('Failed to delete file');
        }
    };

    const openFileInEditor = async (file) => {
        setLoading(true);
        try {
            let content = '';

            if (file.mimeType === 'application/vnd.google-apps.document') {
                // Exportar Google Doc como texto plano
                const response = await drive.exportFile(file.id, 'text/plain');
                content = response.data;
            } else {
                // Descargar cualquier archivo de texto/código
                const response = await drive.downloadFile(file.id);
                // Si response.data es un Blob, convertirlo a texto
                if (response.data instanceof Blob) {
                    content = await response.data.text();
                } else {
                    content = response.data;
                }
            }

            setEditingFile(file);
            setFileContent(content || '');
            setShowEditor(true);
        } catch (error) {
            console.error('Error loading file:', error);
            toast.error('Failed to load file content');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFile = async () => {
        if (!newFileName.trim()) {
            toast.error('Please enter a file name');
            return;
        }

        setSaving(true);
        try {
            const mimeTypes = {
                'doc': 'application/vnd.google-apps.document',
                'sheet': 'application/vnd.google-apps.spreadsheet',
                'slide': 'application/vnd.google-apps.presentation',
                'folder': 'application/vnd.google-apps.folder',
                'text': 'text/plain',
                'js': 'text/plain',
                'php': 'text/plain',
                'py': 'text/plain',
                'html': 'text/html',
                'css': 'text/css',
                'json': 'application/json'
            };

            const createFileDto = {
                name: newFileName,
                mimeType: mimeTypes[newFileType] || 'text/plain',
                parentId: currentFolder ? currentFolder.id : null
            };

            // Solo agregar content para archivos que no sean de Google Apps
            const isGoogleApp = mimeTypes[newFileType]?.startsWith('application/vnd.google-apps.');
            if (!isGoogleApp && newFileType !== 'folder') {
                createFileDto.content = ''; // Contenido inicial vacío solo para archivos normales
            }

            const response = await drive.createFile(createFileDto);

            setFiles([response.data, ...files]);
            toast.success('File created successfully');
            setShowCreateModal(false);
            setNewFileName('');

            // Abrir en editor si es editable
            if (newFileType !== 'folder' && newFileType !== 'sheet' && newFileType !== 'slide') {
                await openFileInEditor(response.data);
            }
        } catch (error) {
            console.error('Error creating file:', error);
            toast.error('Failed to create file: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleSaveFile = async () => {
        if (!editingFile) return;

        setSaving(true);
        try {
            const updateData = {
                content: fileContent,
                mimeType: editingFile.mimeType === 'application/vnd.google-apps.document'
                    ? 'text/plain'
                    : editingFile.mimeType
            };

            await drive.updateFile(editingFile.id, updateData);

            toast.success('File saved successfully');
            fetchFiles();
        } catch (error) {
            console.error('Error saving file:', error);
            toast.error('Failed to save file');
        } finally {
            setSaving(false);
        }
    };

    const closeEditor = () => {
        setShowEditor(false);
        setEditingFile(null);
        setFileContent('');
    };

    const formatSize = (bytes) => {
        if (!bytes) return '—';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (mimeType) => {
        if (mimeType === 'application/vnd.google-apps.folder') return <Folder className="w-6 h-6 text-yellow-400" />;
        if (mimeType.includes('image')) return <File className="w-6 h-6 text-green-400" />;
        if (mimeType.includes('pdf')) return <File className="w-6 h-6 text-red-400" />;
        return <File className="w-6 h-6 text-blue-400" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M7.71 3.5L1.15 15h3l6.55-11.5z" />
                            <path fill="#FBBC04" d="M7.71 3.5L14.26 15H21l-6.55-11.5z" />
                            <path fill="#34A853" d="M1.15 15l3.27 5.68L14.26 15z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Google Drive</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {currentFolder ? currentFolder.name : 'My Drive'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${searching ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="Search Drive... (instant search)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-72 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Clear search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                        title="Create new file"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            {(currentFolder || folderHistory.length > 0) && (
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">No files found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modified</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {files.map((file) => (
                                    <tr
                                        key={file.id}
                                        onClick={() => handleFileClick(file)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(file.mimeType)}
                                                <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-xs">
                                                    {file.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {formatDate(file.modifiedTime)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                                            {formatSize(file.size)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(file.mimeType === 'application/vnd.google-apps.document' ||
                                                    file.mimeType === 'text/plain' ||
                                                    file.mimeType.includes('text')) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openFileInEditor(file);
                                                            }}
                                                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                                            title="Edit in app"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(file.webViewLink, '_blank');
                                                    }}
                                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500 hover:text-indigo-600 transition-colors"
                                                    title="Open in Drive"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                {file.mimeType !== 'application/vnd.google-apps.folder' && (
                                                    <button
                                                        onClick={(e) => handleDownload(e, file)}
                                                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500 hover:text-green-600 transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(e, file.id)}
                                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create File Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    File Type
                                </label>
                                <select
                                    value={newFileType}
                                    onChange={(e) => setNewFileType(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="doc">Google Document</option>
                                    <option value="sheet">Google Sheet</option>
                                    <option value="slide">Google Slides</option>
                                    <option value="text">Text File</option>
                                    <option value="folder">Folder</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    placeholder="Enter file name"
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-indigo-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateFile}
                                    disabled={saving || !newFileName.trim()}
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
                                >
                                    {saving ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Editor */}
            {showEditor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    {/* Editor Header */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
                        {/* Editor Header */}
                        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {editingFile?.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {editingFile?.mimeType.includes('google-apps') ? 'Google Document' : 'Text File'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSaveFile}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={closeEditor}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 overflow-hidden">
                            <textarea
                                value={fileContent}
                                onChange={(e) => setFileContent(e.target.value)}
                                className="w-full h-full px-6 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-mono text-sm"
                                placeholder="Start typing..."
                            />
                        </div>

                        {/* Editor Footer */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 px-6 py-3 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center shrink-0">
                            <span>{fileContent.length} characters</span>
                            <span>Lines: {fileContent.split('\n').length}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriveView;