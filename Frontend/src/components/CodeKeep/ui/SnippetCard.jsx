import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Copy, Heart, Bookmark, Edit2, Trash2, Share2 } from 'lucide-react';
import { languageColors } from '../constants/languages';
import { getLanguageIcon } from '../utils/languageIcons';
import { highlightCode } from '../utils/codeHighlight';

const SnippetCard = ({
    snippet,
    isFavorite,
    isBookmarked,
    onToggleFavorite,
    onToggleBookmark,
    onEdit,
    onDelete,
    onView,
    onCopy,
    canEdit: explicitCanEdit,
    canDelete: explicitCanDelete
}) => {
    const { user } = useAuth();
    const defaultPermission = user?.canManageSnippets || user?.isAdmin;
    const canEdit = explicitCanEdit !== undefined ? explicitCanEdit : defaultPermission;
    const canDelete = explicitCanDelete !== undefined ? explicitCanDelete : defaultPermission;

    return (
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all group shadow-sm hover:shadow-md">
            {/* Card Header */}
            <div className="flex items-start justify-between p-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 ${languageColors[snippet.language]} rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                        {getLanguageIcon(snippet.language)}
                    </div>
                    <h3 className="font-semibold text-base truncate text-slate-900 dark:text-white">{snippet.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopy();
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded"
                        title="Copy code"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(e);
                        }}
                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded"
                        title="Add to favorites"
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : ''}`} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(e);
                        }}
                        className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded"
                        title="Add to bookmarks"
                    >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Code Preview */}
            <div className="bg-slate-50 dark:bg-[#1e1e1e] p-4 font-mono text-xs leading-relaxed overflow-x-auto border-y border-slate-100 dark:border-slate-800">
                <pre className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                    <code dangerouslySetInnerHTML={{
                        __html: highlightCode(
                            snippet.code.length > 400 ? snippet.code.substring(0, 400) + '...' : snippet.code,
                            snippet.language
                        )
                    }}></code>
                </pre>
            </div>

            {/* Card Footer */}
            <div className="p-4 pt-3">
                <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                    {snippet.tags && snippet.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-700/50 rounded-md text-xs font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                    {snippet.tags && snippet.tags.length > 3 && (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-md text-xs">
                            +{snippet.tags.length - 3}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        {canEdit && onEdit && (
                            <button
                                onClick={() => onEdit()}
                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition-colors font-medium shadow-sm"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                        )}
                        {canDelete && onDelete && (
                            <button
                                onClick={() => onDelete()}
                                className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 p-2 rounded-lg transition-colors"
                                title="Delete snippet"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnippetCard;
