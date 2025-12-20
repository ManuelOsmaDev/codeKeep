import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './CodeKeep/modals/LoginModal';
import RegisterModal from './CodeKeep/modals/RegisterModal';
import { useState } from 'react';

const AuthPage = () => {
    const { isAuthenticated } = useAuth();
    const [showLogin, setShowLogin] = useState(true);
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleClose = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-50/90 to-slate-50 dark:from-transparent dark:via-slate-900/90 dark:to-slate-900" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">CodeKeep</h1>
                    <p className="text-slate-600 dark:text-slate-400">Your snippets, everywhere.</p>
                </div>

                {showLogin ? (
                    <LoginModal
                        show={true}
                        onClose={handleClose}
                        onSwitchToRegister={() => setShowLogin(false)}
                    />
                ) : (
                    <RegisterModal
                        show={true}
                        onClose={handleClose}
                        onSwitchToLogin={() => setShowLogin(true)}
                    />
                )}
            </div>
        </div>
    );
};

export default AuthPage;
