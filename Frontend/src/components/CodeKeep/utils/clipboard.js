export const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // Show a temporary notification
    const notification = document.createElement('div');
    notification.textContent = '✓ Code copied!';
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2000);
};
