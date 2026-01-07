import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Copy, Heart, Edit2, Trash2 } from 'lucide-react';
import { languageColors } from '../constants/languages';
import { getLanguageIcon } from '../utils/languageIcons';
import { highlightCode } from '../utils/codeHighlight';
import AddToRoomDropdown from './AddToRoomDropdown';

const SnippetCard = ({
    snippet,
    isFavorite,
    onToggleFavorite,
    onEdit,
    onDelete,
    onView,
    onCopy,
    canEdit: explicitCanEdit,
    canDelete: explicitCanDelete,
    compact = false,
    addedBy = null,
    addedAt = null,
    showAddToRoom = true
}) => {
    const { user } = useAuth();
    const isOwner = user && snippet.userId === user.id;
    const defaultPermission = user?.canManageSnippets || user?.isAdmin;
    const canEdit = explicitCanEdit !== undefined ? explicitCanEdit : (defaultPermission || isOwner);
    const canDelete = explicitCanDelete !== undefined ? explicitCanDelete : (defaultPermission || isOwner);

    return (
        <div
            className="rounded-xl transition-all"
            style={{ backgroundColor: '#fff', border: '1px solid #eaebed' }}
        >
            <div
                className={`flex items-start justify-between rounded-t-xl ${compact ? 'p-3 pb-2' : 'p-4 pb-3'}`}
                style={{ borderBottom: '1px solid #eaebed' }}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} ${languageColors[snippet.language]} rounded-lg flex items-center justify-center flex-shrink-0 text-white`}>
                        {getLanguageIcon(snippet.language)}
                    </div>
                    <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-base'} truncate`} style={{ color: '#2e3549' }}>{snippet.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopy();
                        }}
                        className="transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        style={{ color: '#808099' }}
                        title="Copiar código"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(e);
                        }}
                        className="transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        style={{ color: isFavorite ? '#ef4444' : '#808099' }}
                        title="Agregar a favoritos"
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    {showAddToRoom && (
                        <AddToRoomDropdown
                            itemType="snippet"
                            itemId={snippet.id}
                        />
                    )}
                </div>
            </div>

            {/* Code Preview */}
            <div
                className="p-4 font-mono text-xs leading-relaxed overflow-x-auto"
                style={{ backgroundColor: '#f4f3f3' }}
            >
                <pre className="whitespace-pre-wrap break-words max-h-40 overflow-y-auto" style={{ color: '#2e3549' }}>
                    <code dangerouslySetInnerHTML={{
                        __html: highlightCode(
                            snippet.code.length > 400 ? snippet.code.substring(0, 400) + '...' : snippet.code,
                            snippet.language
                        )
                    }}></code>
                </pre>
            </div>

            {/* Card Footer */}
            <div className={`p-4 pt-3 ${!addedBy ? 'rounded-b-xl' : ''}`}>
                <div className={`flex flex-wrap gap-2 ${compact ? 'mb-2' : 'mb-3'} min-h-[28px]`}>
                    {snippet.tags && snippet.tags.slice(0, compact ? 2 : 3).map(tag => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-medium"
                            style={{ backgroundColor: '#ffcd00', color: '#2e3549' }}
                        >
                            #{tag}
                        </span>
                    ))}
                    {snippet.tags && snippet.tags.length > 3 && (
                        <span
                            className="px-2.5 py-1 rounded-lg text-xs"
                            style={{ backgroundColor: '#f4f3f3', color: '#808099' }}
                        >
                            +{snippet.tags.length - 3}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && onEdit && (
                        <button
                            onClick={() => onEdit()}
                            className={`${compact ? 'text-xs' : 'flex-1 text-sm'} flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-colors font-medium`}
                            style={compact ? { color: '#2e3549' } : { backgroundColor: '#2e3549', color: '#fff' }}
                        >
                            <Edit2 className="w-4 h-4" />
                            Editar
                        </button>
                    )}
                    {canDelete && onDelete && (
                        <button
                            onClick={() => onDelete()}
                            className={`flex items-center justify-center ${compact ? 'p-1.5' : 'p-2'} rounded-lg transition-colors ml-auto`}
                            style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                            title="Eliminar snippet"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            {addedBy && (
                <div className="px-4 py-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 bg-slate-50/50 rounded-b-xl">
                    <div className="flex items-center gap-1.5 truncate">
                        <span className="font-medium">Agregado por:</span>
                        <span className="truncate text-indigo-500 font-semibold">{addedBy.name || addedBy.email}</span>
                    </div>
                    {addedAt && (
                        <span className="flex-shrink-0 text-slate-400">{new Date(addedAt).toLocaleDateString()}</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SnippetCard;
