import api from './api';

const sharingApi = {
    // Generar enlace compartible para un item
    generateShareLink: async (itemType, itemId) => {
        return api.post('/sharing/generate', {
            itemType,
            itemId,
        });
    },

    // Acceder a item compartido por token (público)
    getByToken: async (token) => {
        return api.get(`/sharing/access/${token}`);
    },

    // Obtener items que yo compartí
    getMySharedItems: async () => {
        return api.get('/sharing/my-shared-items');
    },

    // Verificar si un item específico está compartido
    checkIfShared: async (itemType, itemId) => {
        return api.get('/sharing/check', {
            params: { itemType, itemId },
        });
    },

    // Revocar enlace compartido
    revokeShare: async (sharedItemId) => {
        return api.delete(`/sharing/${sharedItemId}`);
    },
};

export default sharingApi;
