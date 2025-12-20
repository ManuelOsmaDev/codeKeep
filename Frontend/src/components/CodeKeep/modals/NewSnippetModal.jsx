import React, { useState } from 'react';
import { languages } from '../constants/languages';
import CodeEditor from '../ui/CodeEditor';

const NewSnippetModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        language: 'javascript',
        code: '',
        tags: []
    });

    if (!isOpen) return null;

    const addTag = (tag) => {
        if (tag && !formData.tags.includes(tag)) {
            setFormData({ ...formData, tags: [...formData.tags, tag] });
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tagToRemove)
        });
    };

    const handleCreate = () => {
        onSave(formData);
        // Reset form
        setFormData({
            title: '',
            language: 'javascript',
            code: '',
            tags: []
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-xl transition-colors duration-300">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">New Snippet</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                            placeholder="e.g., Date Formatter"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Language</label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 capitalize text-slate-900 dark:text-white transition-colors"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang} className="capitalize">{lang}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Code</label>
                        <CodeEditor
                            value={formData.code}
                            onChange={(value) => setFormData({ ...formData, code: value })}
                            language={formData.language}
                            height="300px"
                            minimap={false}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Tags</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                id="newTag"
                                className="flex-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                                placeholder="Add tag..."
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addTag(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    const input = document.getElementById('newTag');
                                    addTag(input.value);
                                    input.value = '';
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm flex items-center gap-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent"
                                >
                                    #{tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleCreate}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                        Create Snippet
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewSnippetModal;
