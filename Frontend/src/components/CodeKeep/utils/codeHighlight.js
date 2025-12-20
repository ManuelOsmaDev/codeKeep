export const highlightCode = (code, language) => {
    // Simple syntax highlighting with bold keywords
    const keywords = {
        javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'export', 'import', 'from', 'async', 'await', 'new', 'this'],
        typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'export', 'import', 'from', 'async', 'await', 'interface', 'type', 'public', 'private', 'new', 'this'],
        python: ['def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'as', 'try', 'except', 'with', 'lambda'],
        java: ['public', 'private', 'class', 'void', 'return', 'if', 'else', 'for', 'while', 'new', 'static', 'final', 'this'],
        csharp: ['public', 'private', 'class', 'void', 'return', 'if', 'else', 'for', 'while', 'new', 'static', 'using', 'this'],
    };

    const langKeywords = keywords[language] || keywords.javascript;

    let highlighted = code;

    // Highlight strings (more vibrant green)
    highlighted = highlighted.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-emerald-400 font-semibold">$1</span>');

    // Highlight numbers (bright orange)
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-orange-400 font-semibold">$1</span>');

    // Highlight keywords (bold purple)
    langKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
        highlighted = highlighted.replace(regex, '<span class="text-purple-400 font-bold">$1</span>');
    });

    // Highlight function calls (bold yellow)
    highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="text-yellow-300 font-bold">$1</span>(');

    // Highlight comments (italic gray)
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>');

    return highlighted;
};
