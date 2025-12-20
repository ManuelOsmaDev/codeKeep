import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({
    value,
    onChange,
    language = 'javascript',
    theme = 'vs-dark',
    readOnly = false,
    height = "300px",
    minimap = false
}) => {

    const handleEditorChange = (value) => {
        onChange(value);
    };

    return (
        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <Editor
                height={height}
                language={language.toLowerCase()}
                value={value}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                onChange={handleEditorChange}
                options={{
                    readOnly: readOnly,
                    minimap: { enabled: minimap },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Consolas', monospace",
                    lineNumbers: 'on',
                    roundedSelection: false,
                    padding: { top: 16, bottom: 16 },
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
