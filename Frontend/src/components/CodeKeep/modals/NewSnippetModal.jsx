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

    const inputStyle = {
        backgroundColor: '#f4f3f3',
        border: '1px solid #eaebed',
        color: '#2e3549'
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div
                className="rounded-2xl p-6 w-full max-w-2xl shadow-xl"
                style={{ backgroundColor: '#fff', border: '1px solid #eaebed' }}
            >
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#2e3549' }}>New Snippet</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2e3549' }}>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                            style={inputStyle}
                            placeholder="e.g., Date Formatter"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2e3549' }}>Language</label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 capitalize transition-all"
                            style={inputStyle}
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang} className="capitalize" style={{ backgroundColor: '#fff' }}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2e3549' }}>Code</label>
                        <CodeEditor
                            value={formData.code}
                            onChange={(value) => setFormData({ ...formData, code: value })}
                            language={formData.language}
                            height="300px"
                            minimap={false}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2e3549' }}>Tags</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                id="newTag"
                                className="flex-1 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                                style={inputStyle}
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
                                className="px-4 py-2.5 rounded-lg font-semibold transition-colors hover:opacity-90"
                                style={{ backgroundColor: '#ffcd00', color: '#2e3549' }}
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    style={{ backgroundColor: '#f4f3f3', color: '#2e3549', border: '1px solid #eaebed' }}
                                >
                                    #{tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-red-500 transition-colors"
                                        style={{ color: '#808099' }}
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
                        className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm hover:opacity-90"
                        style={{ backgroundColor: '#ffcd00', color: '#2e3549' }}
                    >
                        Create Snippet
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-gray-100"
                        style={{ backgroundColor: '#f4f3f3', color: '#808099' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewSnippetModal;
