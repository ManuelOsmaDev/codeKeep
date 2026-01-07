import React from 'react';
import { Copy, Heart, Edit2, Trash2 } from 'lucide-react';
import { languageColors } from '../constants/languages';
import { getLanguageIcon } from '../utils/languageIcons';
import CodeEditor from '../ui/CodeEditor';
import AddToRoomDropdown from '../ui/AddToRoomDropdown';

const ViewSnippetModal = ({ snippet, onClose, favorites, toggleFavorite, copyToClipboard, setEditingSnippet, handleDelete, theme }) => {
    if (!snippet) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] border border-slate-200 dark:border-slate-700 flex flex-col shadow-xl transition-colors duration-300">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${languageColors[snippet.language]} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                            {getLanguageIcon(snippet.language)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{snippet.title}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm capitalize">{snippet.language}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                copyToClipboard(snippet.code);
                            }}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Code
                        </button>
                        <button
                            onClick={() => toggleFavorite(snippet.id)}
                            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-lg transition-colors"
                        >
                            <Heart className={`w-5 h-5 ${favorites.has(snippet.id) ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : 'text-slate-400'}`} />
                        </button>
                        <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors h-[40px] px-0.5">
                            <AddToRoomDropdown
                                itemType="snippet"
                                itemId={snippet.id}
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {snippet.tags.map(tag => (
                        <span
                            key={tag}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-full text-sm border border-slate-200 dark:border-transparent"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <CodeEditor
                        value={snippet.code}
                        language={snippet.language}
                        theme={theme}
                        readOnly={true}
                        height="100%"
                        minimap={false}
                    />
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => {
                            setEditingSnippet(snippet);
                            onClose();
                        }}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Snippet
                    </button>
                    <button
                        onClick={() => handleDelete(snippet.id)}
                        className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Snippet
                    </button>
                    <div className="flex-1"></div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Created: {new Date(snippet.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ViewSnippetModal;
