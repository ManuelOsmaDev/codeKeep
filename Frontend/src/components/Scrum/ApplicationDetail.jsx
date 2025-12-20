import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    GitBranch,
    FolderKanban,
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    Box,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import scrumApi from '../../services/scrumModule';

const ApplicationDetail = () => {
    const { appId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingVersion, setEditingVersion] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    const [versionForm, setVersionForm] = useState({ nombre: '', descripcion: '' });
    const [projectForm, setProjectForm] = useState({ nombre: '', descripcion: '' });

    useEffect(() => {
        fetchData();
    }, [appId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appRes, versRes] = await Promise.all([
                scrumApi.getApplication(appId),
                scrumApi.getVersions(appId),
            ]);
            setApplication(appRes.data);
            setVersions(versRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load application');
        } finally {
            setLoading(false);
        }
    };

    // Version handlers
    const handleVersionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVersion) {
                await scrumApi.updateVersion(editingVersion.id, versionForm);
                toast.success('Version updated');
            } else {
                await scrumApi.createVersion({ ...versionForm, applicationId: appId });
                toast.success('Version created');
            }
            setShowVersionModal(false);
            setEditingVersion(null);
            setVersionForm({ nombre: '', descripcion: '' });
            fetchData();
        } catch (error) {
            toast.error('Failed to save version');
        }
    };

    const handleVersionDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure? This will delete all projects in this version.')) return;
        try {
            await scrumApi.deleteVersion(id);
            toast.success('Version deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete version');
        }
    };

    // Project handlers
    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await scrumApi.updateProject(editingProject.id, projectForm);
                toast.success('Project updated');
            } else {
                await scrumApi.createProject({ ...projectForm, versionId: selectedVersionId });
                toast.success('Project created');
            }
            setShowProjectModal(false);
            setEditingProject(null);
            setProjectForm({ nombre: '', descripcion: '' });
            fetchData();
        } catch (error) {
            toast.error('Failed to save project');
        }
    };

    const handleProjectDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure? This will delete all activities in this project.')) return;
        try {
            await scrumApi.deleteProject(id);
            toast.success('Project deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <p className="text-slate-500">Application not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/scrum')}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold">{application.nombre}</h1>
                    </div>

                    <button
                        onClick={() => {
                            setEditingVersion(null);
                            setVersionForm({ nombre: '', descripcion: '' });
                            setShowVersionModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Version
                    </button>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {versions.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <GitBranch className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                            No versions yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Create your first version to organize your projects
                        </p>
                    </div>
                ) : (
                    versions.map((version) => (
                        <div
                            key={version.id}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        >
                            {/* Version Header */}
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                        <GitBranch className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {version.nombre}
                                        </h3>
                                        {version.descripcion && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {version.descripcion}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedVersionId(version.id);
                                            setEditingProject(null);
                                            setProjectForm({ nombre: '', descripcion: '' });
                                            setShowProjectModal(true);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Project
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingVersion(version);
                                            setVersionForm({
                                                nombre: version.nombre,
                                                descripcion: version.descripcion || '',
                                            });
                                            setShowVersionModal(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleVersionDelete(version.id, e)}
                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Projects Grid */}
                            <div className="p-6">
                                {version.projects?.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                        <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No projects in this version</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {version.projects?.map((project) => (
                                            <div
                                                key={project.id}
                                                onClick={() => navigate(`/scrum/project/${project.id}`)}
                                                className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                                        <FolderKanban className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedVersionId(version.id);
                                                                setEditingProject(project);
                                                                setProjectForm({
                                                                    nombre: project.nombre,
                                                                    descripcion: project.descripcion || '',
                                                                });
                                                                setShowProjectModal(true);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleProjectDelete(project.id, e)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                                                    {project.nombre}
                                                </h4>
                                                {project.descripcion && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                                        {project.descripcion}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between text-xs text-slate-400">
                                                    <span>{project.activities?.length || 0} activities</span>
                                                    <ChevronRight className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Version Modal */}
            {showVersionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            {editingVersion ? 'Edit Version' : 'New Version'}
                        </h2>

                        <form onSubmit={handleVersionSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={versionForm.nombre}
                                    onChange={(e) =>
                                        setVersionForm({ ...versionForm, nombre: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. v1.0.0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={versionForm.descripcion}
                                    onChange={(e) =>
                                        setVersionForm({ ...versionForm, descripcion: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowVersionModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                                >
                                    {editingVersion ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            {editingProject ? 'Edit Project' : 'New Project'}
                        </h2>

                        <form onSubmit={handleProjectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={projectForm.nombre}
                                    onChange={(e) =>
                                        setProjectForm({ ...projectForm, nombre: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Project name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={projectForm.descripcion}
                                    onChange={(e) =>
                                        setProjectForm({ ...projectForm, descripcion: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowProjectModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                                >
                                    {editingProject ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationDetail;
