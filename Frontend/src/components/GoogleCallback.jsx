import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Guardar token
            localStorage.setItem('token', token);

            toast.success('Successfully logged in with Google!');

            // Redirigir al dashboard
            navigate('/', { replace: true });
        } else {
            toast.error('Authentication failed');
            navigate('/', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-slate-700 dark:text-slate-300 font-medium">
                    Completing authentication...
                </p>
            </div>
        </div>
    );
};

export default GoogleCallback;
