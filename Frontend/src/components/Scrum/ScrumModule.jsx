import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    Plus,
    ChevronRight,
    Folder,
    GitBranch,
    Box,
    Edit2,
    Trash2,
    ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import scrumApi from '../../services/scrumModule';
import PendingInvitations from './PendingInvitations';
import ConfirmModal from '../CodeKeep/modals/ConfirmModal';
import { Users, ExternalLink } from 'lucide-react';

const ScrumModule = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [sharedResources, setSharedResources] = useState({ sharedApps: [], sharedVersions: [], sharedProjects: [] });

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        fetchApplications();
        fetchSharedResources();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await scrumApi.getApplications();
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Error al cargar aplicaciones');
        } finally {
            setLoading(false);
        }
    };

    const fetchSharedResources = async () => {
        try {
            const response = await scrumApi.getSharedResources();
            setSharedResources(response.data);
        } catch (error) {
            console.error('Error fetching shared resources:', error);
            // Fallback to old method
            try {
                const fallback = await scrumApi.getSharedProjects();
                setSharedResources({ sharedApps: [], sharedVersions: [], sharedProjects: fallback.data || [] });
            } catch (e) {
                console.error('Fallback failed:', e);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingApp) {
                await scrumApi.updateApplication(editingApp.id, formData);
                toast.success('Aplicación actualizada');
            } else {
                await scrumApi.createApplication(formData);
                toast.success('Aplicación creada');
            }
            setShowModal(false);
            setEditingApp(null);
            setFormData({ nombre: '', descripcion: '' });
            fetchApplications();
        } catch (error) {
            toast.error('Error al guardar aplicación');
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Aplicación',
            message: '¿Estás seguro de eliminar esta aplicación? Todos los proyectos y versiones asociados serán eliminados.',
            onConfirm: async () => {
                try {
                    await scrumApi.deleteApplication(id);
                    toast.success('Aplicación eliminada');
                    fetchApplications();
                } catch (error) {
                    toast.error('Error al eliminar aplicación');
                }
            }
        });
    };

    const handleEdit = (app, e) => {
        e.stopPropagation();
        setEditingApp(app);
        setFormData({ nombre: app.nombre, descripcion: app.descripcion || '' });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4f3f3' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#ffcd00', borderTopColor: 'transparent' }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: '#f4f3f3' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaebed' }} className="sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                            style={{ color: '#808099' }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#ffcd00' }}>
                            <LayoutGrid className="w-6 h-6" style={{ color: '#2e3549' }} />
                        </div>
                        <h1 className="text-xl font-bold" style={{ color: '#2e3549' }}>Scrum Manager</h1>
                    </div>

                    <button
                        onClick={() => {
                            setEditingApp(null);
                            setFormData({ nombre: '', descripcion: '' });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{ backgroundColor: '#ffcd00', color: '#2e3549' }}
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Aplicación
                    </button>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Pending Invitations */}
                <PendingInvitations onAccept={() => { fetchApplications(); fetchSharedResources(); }} />

                {/* Shared Applications */}
                {sharedResources.sharedApps?.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Folder className="w-5 h-5" style={{ color: '#f59e0b' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#2e3549' }}>
                                Aplicaciones Compartidas
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sharedResources.sharedApps.map((app) => (
                                <div
                                    key={app.id}
                                    onClick={() => navigate(`/scrum/app/${app.id}`)}
                                    className="rounded-xl p-5 transition-all cursor-pointer hover:shadow-md group"
                                    style={{ backgroundColor: '#fff', border: '1px solid #eaebed' }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                                            <Folder className="w-5 h-5" style={{ color: '#f59e0b' }} />
                                        </div>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                                            {app.role}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold mb-1" style={{ color: '#2e3549' }}>
                                        {app.nombre}
                                    </h3>
                                    <p className="text-sm" style={{ color: '#808099' }}>
                                        Compartido por: {app.ownerName}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shared Versions */}
                {sharedResources.sharedVersions?.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <GitBranch className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#2e3549' }}>
                                Versiones Compartidas
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sharedResources.sharedVersions.map((version) => (
                                <div
                                    key={version.id}
                                    onClick={() => navigate(`/scrum/version/${version.id}`)}
                                    className="rounded-xl p-5 transition-all cursor-pointer hover:shadow-md group"
                                    style={{ backgroundColor: '#fff', border: '1px solid #eaebed' }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#ede9fe' }}>
                                            <GitBranch className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                                        </div>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                                            {version.role}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold mb-1" style={{ color: '#2e3549' }}>
                                        {version.nombre}
                                    </h3>
                                    <p className="text-sm" style={{ color: '#808099' }}>
                                        Compartido por: {version.ownerName}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shared Projects */}
                {sharedResources.sharedProjects?.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5" style={{ color: '#808099' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#2e3549' }}>
                                Proyectos Compartidos
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sharedResources.sharedProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => navigate(`/scrum/project/${project.id}`)}
                                    className="rounded-xl p-5 transition-all cursor-pointer hover:shadow-md group"
                                    style={{ backgroundColor: '#fff', border: '1px solid #eaebed' }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                                            <ExternalLink className="w-5 h-5" style={{ color: '#0284c7' }} />
                                        </div>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                                            {project.role}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold mb-1" style={{ color: '#2e3549' }}>
                                        {project.nombre}
                                    </h3>
                                    <p className="text-sm" style={{ color: '#808099' }}>
                                        Compartido por: {project.ownerName}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {applications.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: '#fff', border: '2px dashed #eaebed' }}>
                        <Box className="w-16 h-16 mx-auto mb-4" style={{ color: '#808099' }} />
                        <h3 className="text-xl font-semibold" style={{ color: '#2e3549' }}>
                            Sin aplicaciones aún
                        </h3>
                        <p className="mt-2" style={{ color: '#808099' }}>
                            Crea tu primera aplicación para comenzar a gestionar proyectos
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-4 font-medium hover:underline"
                            style={{ color: '#ffcd00' }}
                        >
                            Crear aplicación
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <div
                                key={app.id}
                                onClick={() => navigate(`/scrum/app/${app.id}`)}
                                className="rounded-xl p-6 transition-all cursor-pointer group"
                                style={{ backgroundColor: '#fff', border: '1px solid #eaebed' }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#ffcd00' }}>
                                        <Folder className="w-6 h-6" style={{ color: '#2e3549' }} />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleEdit(app, e)}
                                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                            style={{ color: '#808099' }}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(app.id, e)}
                                            className="p-2 rounded-lg transition-colors hover:bg-red-50"
                                            style={{ color: '#dc2626' }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-2" style={{ color: '#2e3549' }}>
                                    {app.nombre}
                                </h3>
                                {app.descripcion && (
                                    <p className="text-sm mb-4 line-clamp-2" style={{ color: '#808099' }}>
                                        {app.descripcion}
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #eaebed' }}>
                                    <div className="flex items-center gap-2 text-sm" style={{ color: '#808099' }}>
                                        <GitBranch className="w-4 h-4" />
                                        <span>{app.versiones?.length || 0} versiones</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: '#808099' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: '#fff' }}>
                        <h2 className="text-xl font-bold mb-6" style={{ color: '#2e3549' }}>
                            {editingApp ? 'Editar Aplicación' : 'Nueva Aplicación'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#2e3549' }}>
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                    style={{ backgroundColor: '#f4f3f3', border: '1px solid #eaebed', color: '#2e3549' }}
                                    placeholder="Nombre de la aplicación"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#2e3549' }}>
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none"
                                    style={{ backgroundColor: '#f4f3f3', border: '1px solid #eaebed', color: '#2e3549' }}
                                    rows={3}
                                    placeholder="Descripción opcional"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingApp(null);
                                    }}
                                    className="flex-1 px-4 py-2 rounded-lg transition-colors"
                                    style={{ border: '1px solid #eaebed', color: '#808099' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                                    style={{ backgroundColor: '#ffcd00', color: '#2e3549' }}
                                >
                                    {editingApp ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type="danger"
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    );
};

export default ScrumModule;
