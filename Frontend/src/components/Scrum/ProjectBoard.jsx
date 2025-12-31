import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import {
    ArrowLeft,
    Plus,
    LayoutGrid,
    RefreshCw,
    Edit2,
    Trash2,
    MessageSquare,
    Calendar,
    User,
    Flag,
    X,
    Send,
    Clock,
    Target,
    Users,
    UserPlus,
    Search,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import scrumApi from '../../services/scrumModule';
import InviteMemberModal from './InviteMemberModal';
import ProjectMembersPanel from './ProjectMembersPanel';

// Activity Card with Comments
const ActivityCard = ({ activity, onEdit, onDelete, onOpenComments }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: activity.id,
        data: { activity },
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: isDragging ? 100 : 1,
        }
        : undefined;

    const priorityColors = {
        low: 'bg-green-100 text-green-700',
        medium: 'bg-yellow-100 text-yellow-700',
        high: 'bg-red-100 text-red-700',
    };

    const sprint = activity.sprintBacklogActivities?.[0]?.sprintBacklog;

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, backgroundColor: '#fff', border: '1px solid #eaebed' }}
            className={`rounded-xl p-4 transition-all group ${isDragging ? 'opacity-50 scale-105' : ''}`}
        >
            {/* Header with buttons - NOT draggable */}
            <div className="flex items-start justify-between mb-2">
                <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[activity.priority]}`}
                >
                    {activity.priority}
                </span>
                <div className="flex items-center gap-1">
                    {sprint && (
                        <div className="relative group/tooltip">
                            <div
                                className="p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                                style={{ color: '#a855f7' }}
                            >
                                <Target className="w-4 h-4" />
                            </div>
                            {/* Custom Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block z-[100] whitespace-nowrap">
                                <div className="bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-md shadow-xl font-medium relative">
                                    {sprint.nombre}
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => onOpenComments(activity)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: '#808099' }}
                        title="Comentarios"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(activity)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                        style={{ color: '#808099' }}
                        title="Editar"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(activity.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: '#dc2626' }}
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Draggable area */}
            <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
                <h4 className="font-medium mb-2 text-sm" style={{ color: '#2e3549' }}>
                    {activity.titulo}
                </h4>

                {activity.descriptor && (
                    <p className="text-xs line-clamp-2 mb-3" style={{ color: '#808099' }}>
                        {activity.descriptor}
                    </p>
                )}

                <div className="flex items-center justify-between text-xs" style={{ color: '#808099' }}>
                    <div className="flex items-center gap-3">
                        {activity.user && (
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {activity.user.name?.split(' ')[0]}
                            </span>
                        )}
                        {activity.dueDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {activity.dueDate.replace(/-/g, '/')}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {(activity.comments?.length || 0) > 0 && (
                            <span className="flex items-center gap-1" style={{ color: '#3b82f6' }}>
                                <MessageSquare className="w-3 h-3" />
                                {activity.comments?.length}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Droppable Column
const DroppableColumn = ({ state, activities, onAddActivity, onEditActivity, onDeleteActivity, onOpenComments }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: state.id,
        data: { state },
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-[280px] flex flex-col bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-all ${isOver ? 'ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : ''
                }`}
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: state.color }}
                        />
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                            {state.nombre}
                        </h3>
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
                            {activities.length}
                        </span>
                    </div>
                    <button
                        onClick={() => onAddActivity(state.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-350px)]">
                {activities.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onEdit={onEditActivity}
                        onDelete={onDeleteActivity}
                        onOpenComments={onOpenComments}
                    />
                ))}
                {activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 text-slate-400 dark:text-slate-500">
                        <p className="text-xs">No activities</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Comments Modal
const CommentsModal = ({ resource, type = 'activity', onClose, onRefresh }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [resource.id]);

    const fetchComments = async () => {
        try {
            const response = type === 'sprint'
                ? await scrumApi.getSprintComments(resource.id)
                : await scrumApi.getComments(resource.id);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const payload = {
                comment: newComment,
                [type === 'sprint' ? 'sprintId' : 'activityId']: resource.id
            };
            await scrumApi.createComment(payload);
            setNewComment('');
            fetchComments();
            onRefresh();
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await scrumApi.deleteComment(id);
            fetchComments();
            onRefresh();
            toast.success('Comment deleted');
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Comments</h2>
                        <p className="text-sm text-slate-500">{resource.titulo || resource.nombre}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No comments yet</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 group"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                            {comment.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {comment.user?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {comment.comment}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* New Comment Form */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Sprints Panel
const SprintsPanel = ({ projectId, states, activities = [], onClose, onUpdate, onOpenComments }) => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSprint, setEditingSprint] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        stateId: '',
        activityIds: [],
    });

    useEffect(() => {
        fetchSprints();
    }, [projectId]);

    const fetchSprints = async () => {
        try {
            const response = await scrumApi.getSprintBacklogs(projectId);
            setSprints(response.data);
        } catch (error) {
            console.error('Error fetching sprints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (sprint) => {
        setEditingSprint(sprint);
        setFormData({
            nombre: sprint.nombre,
            fechaInicio: new Date(sprint.fechaInicio).toISOString().split('T')[0],
            fechaFin: new Date(sprint.fechaFin).toISOString().split('T')[0],
            stateId: sprint.state?.id || '',
            activityIds: sprint.sprintBacklogActivities?.map(sba => sba.activityId) || [],
        });
        setShowForm(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSprint) {
                await scrumApi.updateSprintBacklog(editingSprint.id, formData);
                toast.success('Sprint updated');
            } else {
                await scrumApi.createSprintBacklog({
                    ...formData,
                    projectId,
                });
                toast.success('Sprint created');
            }
            setShowForm(false);
            setEditingSprint(null);
            setFormData({ nombre: '', fechaInicio: '', fechaFin: '', stateId: '', activityIds: [] });
            fetchSprints();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error(editingSprint ? 'Failed to update sprint' : 'Failed to create sprint');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this sprint?')) return;
        try {
            await scrumApi.deleteSprintBacklog(id);
            toast.success('Sprint deleted');
            fetchSprints();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to delete sprint');
        }
    };

    const availableActivities = useMemo(() => {
        // Get IDs of activities assigned to ANY sprint
        const assignedActivityIds = new Set();
        sprints.forEach(sprint => {
            // If we are editing a sprint, we still want to see ITS activities
            // so we can unchecked them (remove them).
            // So we only "hide" activities that belong to *other* sprints.
            if (!editingSprint || sprint.id !== editingSprint.id) {
                sprint.sprintBacklogActivities?.forEach(sba => {
                    assignedActivityIds.add(sba.activityId);
                });
            }
        });

        return activities.filter(activity => !assignedActivityIds.has(activity.id));
    }, [activities, sprints, editingSprint]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#ffcd00' }}>
                            <Target className="w-5 h-5" style={{ color: '#2e3549' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#2e3549' }}>Sprint Backlogs</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setEditingSprint(null);
                                setFormData({ nombre: '', fechaInicio: '', fechaFin: '', stateId: '', activityIds: [] });
                                setShowForm(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors font-medium"
                            style={{ backgroundColor: '#ffcd00', color: '#2e3549' }}
                        >
                            <Plus className="w-4 h-4" />
                            New Sprint
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                        </div>
                    ) : sprints.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No sprints yet</p>
                            <p className="text-sm">Create a sprint to organize your work</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sprints.map((sprint) => (
                                <div
                                    key={sprint.id}
                                    className="rounded-xl p-4"
                                    style={{ backgroundColor: '#f4f3f3', border: '1px solid #eaebed' }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold" style={{ color: '#2e3549' }}>
                                                {sprint.nombre}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm" style={{ color: '#808099' }}>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(sprint.fechaInicio).toISOString().split('T')[0].replace(/-/g, '/')} - {new Date(sprint.fechaFin).toISOString().split('T')[0].replace(/-/g, '/')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="px-2 py-1 text-xs font-medium rounded-full"
                                                style={{ backgroundColor: sprint.state?.color + '20', color: sprint.state?.color }}
                                            >
                                                {sprint.state?.nombre}
                                            </span>
                                            <button
                                                onClick={() => onOpenComments(sprint, fetchSprints)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-white/50"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(sprint)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sprint.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-sm" style={{ color: '#808099' }}>
                                            {sprint.sprintBacklogActivities?.length || 0} activities assigned
                                        </div>
                                        {(sprint.comments?.length || 0) > 0 && (
                                            <div className="flex items-center gap-1 text-xs font-medium" style={{ color: '#3b82f6' }}>
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                {sprint.comments.length}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* New Sprint Form */}
                {showForm && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Sprint Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Sprint 1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.stateId}
                                        onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Select status</option>
                                        {states
                                            .filter(state => state.nombre !== 'Backlog')
                                            .map((state) => (
                                                <option key={state.id} value={state.id}>
                                                    {state.nombre}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Assign Activities
                                    </label>
                                    <div className="border border-slate-200 dark:border-slate-600 rounded-lg max-h-48 overflow-y-auto bg-white dark:bg-slate-700 p-2">
                                        {availableActivities.length === 0 ? (
                                            <p className="text-sm text-slate-400 text-center py-2">No available activities</p>
                                        ) : (
                                            availableActivities.map((activity) => (
                                                <div key={activity.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-600 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        id={`activity-${activity.id}`}
                                                        checked={formData.activityIds.includes(activity.id)}
                                                        onChange={(e) => {
                                                            const ids = e.target.checked
                                                                ? [...formData.activityIds, activity.id]
                                                                : formData.activityIds.filter(id => id !== activity.id);
                                                            setFormData({ ...formData, activityIds: ids });
                                                        }}
                                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor={`activity-${activity.id}`} className="flex-1 text-sm cursor-pointer select-none flex items-center justify-between">
                                                        <span className="font-medium text-slate-700 dark:text-slate-200">{activity.titulo}</span>
                                                        <div className="flex items-center gap-2">
                                                            {activity.user && (
                                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium uppercase mr-2">
                                                                    <User className="w-3 h-3" />
                                                                    {activity.user.name}
                                                                </div>
                                                            )}
                                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                style={{
                                                                    backgroundColor: (states.find(s => s.id === activity.stateId)?.color || '#94a3b8') + '20',
                                                                    color: states.find(s => s.id === activity.stateId)?.color || '#94a3b8'
                                                                }}>
                                                                {states.find(s => s.id === activity.stateId)?.nombre}
                                                            </span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                                activity.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-emerald-100 text-emerald-600'
                                                                }`}>
                                                                {activity.priority}
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingSprint(null);
                                        setFormData({ nombre: '', fechaInicio: '', fechaFin: '', stateId: '', activityIds: [] });
                                    }}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                                >
                                    {editingSprint ? 'Update Sprint' : 'Create Sprint'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main ProjectBoard Component
const ProjectBoard = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [states, setStates] = useState([]);
    const [users, setUsers] = useState([]);
    const [activitiesByState, setActivitiesByState] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeActivity, setActiveActivity] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSprintsPanel, setShowSprintsPanel] = useState(false);
    const [commentsResource, setCommentsResource] = useState(null);
    const [editingActivity, setEditingActivity] = useState(null);
    const [targetStateId, setTargetStateId] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showMembersPanel, setShowMembersPanel] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        titulo: '',
        descriptor: '',
        priority: 'medium',
        dueDate: '',
        color: '#6366f1',
        userId: '',
    });

    useEffect(() => {
        fetchData();
        fetchUsers();
    }, [projectId]);

    const fetchUsers = async () => {
        try {
            const response = await scrumApi.getProjectUsers(projectId);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching project users:', error);
            // Fallback to old method if project members not available
            try {
                const fallbackResponse = await scrumApi.getUsers();
                setUsers(fallbackResponse.data);
            } catch (err) {
                console.error('Error with fallback users:', err);
            }
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await scrumApi.getActivities(projectId);
            setProject(response.data.project);
            setStates(response.data.states);
            setActivitiesByState(response.data.activitiesByState);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    const handleAddActivity = (stateId) => {
        setTargetStateId(stateId);
        setEditingActivity(null);
        setFormData({
            titulo: '',
            descriptor: '',
            priority: 'medium',
            dueDate: '',
            color: '#6366f1',
            userId: '',
        });
        setShowModal(true);
    };

    const handleEditActivity = (activity) => {
        setEditingActivity(activity);
        setFormData({
            titulo: activity.titulo,
            descriptor: activity.descriptor || '',
            priority: activity.priority,
            dueDate: activity.dueDate
                ? new Date(activity.dueDate).toISOString().split('T')[0]
                : '',
            color: activity.color || '#6366f1',
            userId: activity.userId || '',
        });
        setShowModal(true);
    };

    const handleDeleteActivity = async (id) => {
        if (!confirm('Are you sure you want to delete this activity?')) return;
        try {
            await scrumApi.deleteActivity(id);
            toast.success('Activity deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete activity');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingActivity) {
                await scrumApi.updateActivity(editingActivity.id, formData);
                toast.success('Activity updated');
            } else {
                await scrumApi.createActivity({
                    ...formData,
                    projectId,
                    stateId: targetStateId,
                });
                toast.success('Activity created');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save activity');
        }
    };

    const handleDragStart = (event) => {
        setActiveActivity(event.active.data.current?.activity);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveActivity(null);

        if (!over || !active.data.current?.activity) return;

        const activity = active.data.current.activity;
        const targetStateId = over.id;

        if (activity.stateId === targetStateId) return;

        // Optimistic update
        setActivitiesByState((prev) => {
            const newState = { ...prev };
            newState[activity.stateId] = newState[activity.stateId].filter(
                (a) => a.id !== activity.id
            );
            newState[targetStateId] = [
                ...(newState[targetStateId] || []),
                { ...activity, stateId: targetStateId },
            ];
            return newState;
        });

        try {
            await scrumApi.moveActivity(activity.id, {
                stateId: targetStateId,
                orden: activitiesByState[targetStateId]?.length || 0,
            });
        } catch (error) {
            console.error('Error moving activity:', error);
            toast.error('Failed to move activity');
            fetchData();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">{project?.nombre || 'Project'}</h1>
                            {project?.descripcion && (
                                <p className="text-xs text-slate-500">{project.descripcion}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 max-w-md mx-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search activities by name..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700/50 border-transparent focus:bg-white dark:focus:bg-slate-700 border focus:border-indigo-500 rounded-xl text-sm transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSprintsPanel(true)}
                            className="flex items-center gap-2 px-3 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                            <Target className="w-4 h-4" />
                            Sprints
                        </button>
                        <button
                            onClick={fetchData}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleAddActivity(states[0]?.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Activity
                        </button>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            Invite
                        </button>
                        <button
                            onClick={() => setShowMembersPanel(true)}
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{users.length}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Board */}
            <main className="p-6">
                <DndContext
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {states.map((state) => {
                            const filteredActivities = (activitiesByState[state.id] || []).filter(activity =>
                                activity.titulo.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            return (
                                <DroppableColumn
                                    key={state.id}
                                    state={state}
                                    activities={filteredActivities}
                                    onAddActivity={handleAddActivity}
                                    onEditActivity={handleEditActivity}
                                    onDeleteActivity={handleDeleteActivity}
                                    onOpenComments={(activity) => setCommentsResource({ resource: activity, type: 'activity' })}
                                />
                            );
                        })}
                    </div>

                    <DragOverlay>
                        {activeActivity ? (
                            <div className="opacity-90 rotate-2 scale-105">
                                <ActivityCard
                                    activity={activeActivity}
                                    onEdit={() => { }}
                                    onDelete={() => { }}
                                    onOpenComments={() => { }}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </main>

            {/* Activity Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            {editingActivity ? 'Edit Activity' : 'New Activity'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, titulo: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Activity title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.descriptor}
                                    onChange={(e) =>
                                        setFormData({ ...formData, descriptor: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) =>
                                            setFormData({ ...formData, priority: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dueDate: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Assign To
                                </label>
                                <select
                                    value={formData.userId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, userId: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                                >
                                    {editingActivity ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Comments Modal */}
            {commentsResource && (
                <CommentsModal
                    resource={commentsResource.resource}
                    type={commentsResource.type}
                    onClose={() => setCommentsResource(null)}
                    onRefresh={commentsResource.onRefresh || fetchData}
                />
            )}

            {/* Sprints Panel */}
            {showSprintsPanel && (
                <SprintsPanel
                    projectId={projectId}
                    states={states}
                    activities={Object.values(activitiesByState).flat()}
                    onClose={() => setShowSprintsPanel(false)}
                    onUpdate={fetchData}
                    onOpenComments={(sprint, refreshSprints) => setCommentsResource({
                        resource: sprint,
                        type: 'sprint',
                        onRefresh: () => {
                            refreshSprints();
                            fetchData(); // Also refresh board in case sprint status/counts changed
                        }
                    })}
                />
            )}

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                resourceType="project"
                resourceId={projectId}
                resourceName={project?.nombre || 'Project'}
                onInviteSent={fetchUsers}
            />

            {/* Project Members Panel */}
            <ProjectMembersPanel
                isOpen={showMembersPanel}
                onClose={() => setShowMembersPanel(false)}
                projectId={projectId}
                onMembersChange={fetchUsers}
            />
        </div>
    );
};

export default ProjectBoard;
