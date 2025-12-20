import React, { useState, useEffect } from 'react';
import { Plus, LogOut } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { snippets as snippetsAPI, favorites as favoritesAPI, bookmarks as bookmarksAPI, users } from '../services/api';

// Components
import Sidebar from './CodeKeep/ui/Sidebar';
import Header from './CodeKeep/ui/Header';
import SnippetCard from './CodeKeep/ui/SnippetCard';
import DriveView from './CodeKeep/ui/DriveView';
import PasswordManager from './CodeKeep/ui/PasswordManager';
import RoomsView from './CodeKeep/ui/RoomsView';
import AdminPanel from './CodeKeep/ui/AdminPanel';

// Modals
import NewSnippetModal from './CodeKeep/modals/NewSnippetModal';
import EditSnippetModal from './CodeKeep/modals/EditSnippetModal';
import ViewSnippetModal from './CodeKeep/modals/ViewSnippetModal';
import UserProfileModal from './CodeKeep/modals/UserProfileModal';
import SettingsModal from './CodeKeep/modals/SettingsModal';
import ConfirmModal from './CodeKeep/modals/ConfirmModal';

// Utils
import { copyToClipboard } from './CodeKeep/utils/clipboard';

// Constants
import { languages } from './CodeKeep/constants/languages';

const CodeKeep = () => {
  const { user, logout, setUser } = useAuth();

  // State
  const [snippets, setSnippets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showNewSnippet, setShowNewSnippet] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [viewingSnippet, setViewingSnippet] = useState(null);
  const [activeTab, setActiveTab] = useState('snippets');
  const [languagesExpanded, setLanguagesExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [driveExpanded, setDriveExpanded] = useState(true);
  const [currentView, setCurrentView] = useState('all');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: () => { },
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Confirm',
  });

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const response = await snippetsAPI.getAll();
      setSnippets(response.data);

      const favResponse = await favoritesAPI.getAll();
      setFavorites(new Set(favResponse.data.map(f => f.id)));

      const bookmarkResponse = await bookmarksAPI.getAll();
      setBookmarks(new Set(bookmarkResponse.data.map(b => b.id)));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnippet = async (snippetData) => {
    try {
      const response = await snippetsAPI.create(snippetData);
      setSnippets([...snippets, response.data]);
      setShowNewSnippet(false);
      toast.success('Snippet created!');
    } catch (error) {
      toast.error('Failed to create snippet: ' + error.response?.data?.message);
    }
  };

  const handleUpdateSnippet = async (id, snippetData) => {
    try {
      const response = await snippetsAPI.update(id, snippetData);
      setSnippets(snippets.map(s => s.id === id ? response.data : s));
      setEditingSnippet(null);
      toast.success('Snippet updated!');
    } catch (error) {
      toast.error('Failed to update snippet');
    }
  };

  const handleDeleteSnippet = async (id) => {
    setConfirmModal({
      isOpen: true,
      onConfirm: async () => {
        try {
          await snippetsAPI.delete(id);
          setSnippets(snippets.filter(s => s.id !== id));
          toast.success('Snippet deleted');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          toast.error('Failed to delete snippet');
        }
      },
      title: 'Delete Snippet',
      message: 'Are you sure you want to delete this snippet? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
    });
  };

  const handleToggleFavorite = async (id) => {
    try {
      if (favorites.has(id)) {
        await favoritesAPI.remove(id);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(id);
          return newFavorites;
        });
      } else {
        await favoritesAPI.add(id);
        setFavorites(prev => new Set([...prev, id]));
      }
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleToggleBookmark = async (id) => {
    try {
      if (bookmarks.has(id)) {
        await bookmarksAPI.remove(id);
        setBookmarks(prev => {
          const newBookmarks = new Set(prev);
          newBookmarks.delete(id);
          return newBookmarks;
        });
      } else {
        await bookmarksAPI.add(id);
        setBookmarks(prev => new Set([...prev, id]));
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleSaveSettings = async (updatedUser) => {
    try {
      // Only send fields that are allowed by the UpdateUserDto
      const allowedFields = {
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        theme: updatedUser.theme,
        notifications: updatedUser.notifications,
        compactMode: updatedUser.compactMode,
        defaultLanguage: updatedUser.defaultLanguage,
        lineNumbers: updatedUser.lineNumbers,
        autoSave: updatedUser.autoSave,
        emailNotifications: updatedUser.emailNotifications,
      };
      const response = await users.updateProfile(allowedFields);
      setUser(response.data);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      throw error;
    }
  };

  const handleClearAllSnippets = async () => {
    setConfirmModal({
      isOpen: true,
      onConfirm: async () => {
        try {
          await Promise.all(snippets.map(s => snippetsAPI.delete(s.id)));
          setSnippets([]);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          toast.success('All snippets deleted');
        } catch (error) {
          toast.error('Failed to delete snippets');
        }
      },
      title: 'Delete All Snippets',
      message: 'Are you absolutely sure? This will permanently delete all your snippets. This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete All',
    });
  };

  const getAllTags = () => {
    const tagsSet = new Set();
    snippets.forEach(snippet => {
      snippet.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = !searchTerm || snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => snippet.tags?.includes(tag));

    let matchesView = true;
    if (currentView === 'favorites') {
      matchesView = favorites.has(snippet.id);
    } else if (currentView === 'bookmarks') {
      matchesView = bookmarks.has(snippet.id);
    }

    return matchesSearch && matchesLanguage && matchesTags && matchesView;
  });

  const getLanguageStats = (lang) => {
    return snippets.filter(s => s.language === lang).length;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 2000,
            icon: '✅',
          },
          error: {
            duration: 3000,
            icon: '❌',
          }
        }}
      />

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favorites={favorites}
        bookmarks={bookmarks}
        languagesExpanded={languagesExpanded}
        setLanguagesExpanded={setLanguagesExpanded}
        tagsExpanded={tagsExpanded}
        setTagsExpanded={setTagsExpanded}
        driveExpanded={driveExpanded}
        setDriveExpanded={setDriveExpanded}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        getLanguageStats={getLanguageStats}
        allTags={getAllTags()}
        languages={languages}
        setShowUserProfile={setShowUserProfile}
        setShowSettings={setShowSettings}
        user={user}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          user={user}
          setShowUserProfile={setShowUserProfile}
          setShowSettings={setShowSettings}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'drive' ? (
            <DriveView />
          ) : activeTab === 'passwords' ? (
            <PasswordManager />
          ) : activeTab === 'rooms' ? (
            <RoomsView />
          ) : activeTab === 'admin' ? (
            <AdminPanel />
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {currentView === 'all' ? 'All Snippets' :
                      currentView === 'favorites' ? 'Favorites' : 'Bookmarks'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    {filteredSnippets.length} snippets found
                  </p>
                </div>
                {(user?.canManageSnippets || user?.isAdmin) && (
                  <button
                    onClick={() => setShowNewSnippet(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    New Snippet
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : filteredSnippets.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">No snippets found</p>
                  {(user?.canManageSnippets || user?.isAdmin) && (
                    <button
                      onClick={() => setShowNewSnippet(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Create your first snippet
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSnippets.map(snippet => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onEdit={() => setEditingSnippet(snippet)}
                      onDelete={() => handleDeleteSnippet(snippet.id)}
                      onCopy={() => copyToClipboard(snippet.code)}
                      onToggleFavorite={() => handleToggleFavorite(snippet.id)}
                      onToggleBookmark={() => handleToggleBookmark(snippet.id)}
                      onView={() => setViewingSnippet(snippet)}
                      isFavorite={favorites.has(snippet.id)}
                      isBookmarked={bookmarks.has(snippet.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <NewSnippetModal
        isOpen={showNewSnippet}
        onClose={() => setShowNewSnippet(false)}
        onSave={handleCreateSnippet}
      />

      {editingSnippet && (
        <EditSnippetModal
          isOpen={true}
          onClose={() => setEditingSnippet(null)}
          onSave={(data) => handleUpdateSnippet(editingSnippet.id, data)}
          snippet={editingSnippet}
        />
      )}

      {viewingSnippet && (
        <ViewSnippetModal
          isOpen={true}
          onClose={() => setViewingSnippet(null)}
          snippet={viewingSnippet}
          onEdit={() => {
            setViewingSnippet(null);
            setEditingSnippet(viewingSnippet);
          }}
          onCopy={() => copyToClipboard(viewingSnippet.code)}
          favorites={favorites}
          toggleFavorite={handleToggleFavorite}
        />
      )}

      <UserProfileModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        user={user}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        setUser={setUser}
        saveUser={handleSaveSettings}
        clearAllSnippets={handleClearAllSnippets}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
    </div>
  );
};

export default CodeKeep;