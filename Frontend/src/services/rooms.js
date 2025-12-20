import api from './api';

const roomsApi = {
    // Crear una nueva room (ahora soporta isPublic y allowedEmails)
    createRoom: async (name, description, isPublic = true, allowedEmails = []) => {
        return api.post('/rooms', {
            name,
            description,
            isPublic,
            allowedEmails,
        });
    },

    // Obtener mis rooms
    getMyRooms: async () => {
        return api.get('/rooms/my-rooms');
    },

    // Obtener rooms compartidas conmigo
    getSharedWithMe: async () => {
        return api.get('/rooms/shared/with-me');
    },

    // Acceder a room por token (público o privado)
    getRoomByToken: async (token) => {
        return api.get(`/rooms/${token}`);
    },

    // Obtener items de una room específica
    getRoomItems: async (roomId) => {
        return api.get(`/rooms/${roomId}/items`);
    },

    // Agregar item a room
    addItemToRoom: async (roomId, itemType, itemId, permissions) => {
        return api.post(`/rooms/${roomId}/items`, {
            itemType,
            itemId,
            permissions,
        });
    },

    // Quitar item de room
    removeItemFromRoom: async (roomId, itemId) => {
        return api.delete(`/rooms/${roomId}/items/${itemId}`);
    },

    // Eliminar room
    deleteRoom: async (roomId) => {
        return api.delete(`/rooms/${roomId}`);
    },

    // Obtener lista de acceso de una room
    getRoomAccessList: async (roomId) => {
        return api.get(`/rooms/${roomId}/access-list`);
    },

    // Agregar usuario a la whitelist
    addUserToRoom: async (roomId, email, permissions = {}) => {
        return api.post(`/rooms/${roomId}/users`, { userEmail: email, ...permissions });
    },

    // Quitar usuario de la whitelist
    removeUserFromRoom: async (roomId, userEmail) => {
        return api.delete(`/rooms/${roomId}/users/${encodeURIComponent(userEmail)}`);
    },

    // Actualizar permisos de un ítem
    updateItemPermissions: async (roomId, itemId, permissions) => {
        return api.patch(`/rooms/${roomId}/items/${itemId}/permissions`, { permissions });
    },
};

export default roomsApi;
