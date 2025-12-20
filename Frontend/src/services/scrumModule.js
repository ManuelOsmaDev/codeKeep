import api from './api';

const scrumApi = {
    // ==================== TASK STATES ====================
    getTaskStates: () => api.get('/scrum/states'),
    createTaskState: (data) => api.post('/scrum/states', data),

    // ==================== USERS ====================
    getUsers: () => api.get('/scrum/users'),

    // ==================== APPLICATIONS ====================
    getApplications: () => api.get('/scrum/applications'),
    getApplication: (id) => api.get(`/scrum/applications/${id}`),
    createApplication: (data) => api.post('/scrum/applications', data),
    updateApplication: (id, data) => api.patch(`/scrum/applications/${id}`, data),
    deleteApplication: (id) => api.delete(`/scrum/applications/${id}`),

    // ==================== VERSIONS ====================
    getVersions: (applicationId) => api.get(`/scrum/applications/${applicationId}/versions`),
    createVersion: (data) => api.post('/scrum/versions', data),
    updateVersion: (id, data) => api.patch(`/scrum/versions/${id}`, data),
    deleteVersion: (id) => api.delete(`/scrum/versions/${id}`),

    // ==================== PROJECTS ====================
    getProjects: (versionId) => api.get(`/scrum/versions/${versionId}/projects`),
    getProject: (id) => api.get(`/scrum/projects/${id}`),
    createProject: (data) => api.post('/scrum/projects', data),
    updateProject: (id, data) => api.patch(`/scrum/projects/${id}`, data),
    deleteProject: (id) => api.delete(`/scrum/projects/${id}`),

    // ==================== ACTIVITIES ====================
    getActivities: (projectId) => api.get(`/scrum/projects/${projectId}/activities`),
    createActivity: (data) => api.post('/scrum/activities', data),
    updateActivity: (id, data) => api.patch(`/scrum/activities/${id}`, data),
    moveActivity: (id, data) => api.patch(`/scrum/activities/${id}/move`, data),
    deleteActivity: (id) => api.delete(`/scrum/activities/${id}`),

    // ==================== SPRINT BACKLOGS ====================
    getSprintBacklogs: (projectId) => api.get(`/scrum/projects/${projectId}/sprints`),
    createSprintBacklog: (data) => api.post('/scrum/sprints', data),
    updateSprintBacklog: (id, data) => api.patch(`/scrum/sprints/${id}`, data),
    deleteSprintBacklog: (id) => api.delete(`/scrum/sprints/${id}`),
    assignActivityToSprint: (data) => api.post('/scrum/sprints/assign', data),
    removeActivityFromSprint: (id) => api.delete(`/scrum/sprints/assignments/${id}`),

    // ==================== COMMENTS ====================
    getComments: (activityId) => api.get(`/scrum/activities/${activityId}/comments`),
    createComment: (data) => api.post('/scrum/comments', data),
    deleteComment: (id) => api.delete(`/scrum/comments/${id}`),
};

export default scrumApi;
