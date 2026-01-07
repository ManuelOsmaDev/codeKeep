import React, { useState, useEffect, useRef } from 'react';
import { Share2, Folder, Loader2, FolderPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import roomsApi from '../../../services/rooms';

const AddToRoomDropdown = ({ itemType, itemId, masterPassword }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [sharedRooms, setSharedRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingTo, setAddingTo] = useState(null);
    const dropdownRef = useRef(null);

    const toggleDropdown = async (e) => {
        e.stopPropagation();
        if (!isOpen) {
            setLoading(true);
            try {
                const [myRoomsRes, sharedRoomsRes] = await Promise.all([
                    roomsApi.getMyRooms(),
                    roomsApi.getSharedWithMe()
                ]);
                setRooms(myRoomsRes.data || []);
                setSharedRooms(sharedRoomsRes.data || []);
            } catch (error) {
                console.error('Error loading rooms:', error);
                toast.error('Error al cargar salas');
            } finally {
                setLoading(false);
            }
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddToRoom = async (roomId, roomName, canCreate = true) => {
        if (!canCreate) {
            toast.error(`No tienes permisos para agregar elementos a la sala "${roomName}"`);
            return;
        }

        setAddingTo(roomId);
        try {
            await roomsApi.addItemToRoom(roomId, itemType, itemId, null, masterPassword);
            toast.success(`Agregado a la sala "${roomName}"`);
            setIsOpen(false);
        } catch (error) {
            console.error('Error adding to room:', error);
            const errorMessage = Array.isArray(error.response?.data?.message)
                ? error.response.data.message[0]
                : (error.response?.data?.message || 'Error al agregar a la sala');
            toast.error(errorMessage);
        } finally {
            setAddingTo(null);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                style={{ color: '#808099' }}
                title="Agregar a sala"
            >
                <FolderPlus className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[60] overflow-hidden">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Agregar a Sala
                        </h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 flex justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                            </div>
                        ) : rooms.length === 0 && sharedRooms.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                                No tienes salas disponibles
                            </div>
                        ) : (
                            <>
                                {rooms.length > 0 && (
                                    <div className="p-2 space-y-1">
                                        <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">Mis Salas</p>
                                        {rooms.map(room => (
                                            <button
                                                key={room.id}
                                                disabled={addingTo === room.id}
                                                onClick={() => handleAddToRoom(room.id, room.name, true)}
                                                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-left"
                                            >
                                                <Folder className="w-4 h-4 text-indigo-500" />
                                                <span className="flex-1 truncate">{room.name}</span>
                                                {addingTo === room.id && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {sharedRooms.length > 0 && (
                                    <div className="p-2 space-y-1 border-t border-slate-100 dark:border-slate-700">
                                        <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">Compartidas conmigo</p>
                                        {sharedRooms.map(room => (
                                            <button
                                                key={room.id}
                                                disabled={addingTo === room.id || !room.permissions?.canCreate}
                                                onClick={() => handleAddToRoom(room.id, room.name, room.permissions?.canCreate)}
                                                className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors text-left ${!room.permissions?.canCreate
                                                    ? 'opacity-50 cursor-not-allowed text-slate-400'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                                                    }`}
                                            >
                                                <Folder className={`w-4 h-4 ${!room.permissions?.canCreate ? 'text-slate-400' : 'text-purple-500'}`} />
                                                <span className="flex-1 truncate">{room.name}</span>
                                                {!room.permissions?.canCreate && (
                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">
                                                        Lectura
                                                    </span>
                                                )}
                                                {addingTo === room.id && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddToRoomDropdown;
