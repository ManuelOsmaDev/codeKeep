import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { auth as authAPI } from '../../../services/api';

const LoginModal = ({ show, onClose, onSwitchToRegister }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [snowflakes, setSnowflakes] = useState([]);
    const [santaFlights, setSantaFlights] = useState([]);

    // Generar copos de nieve
    useEffect(() => {
        if (show) {
            const flakes = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                animationDuration: 3 + Math.random() * 5,
                animationDelay: Math.random() * 5,
                opacity: 0.3 + Math.random() * 0.7,
                size: 5 + Math.random() * 10,
            }));
            setSnowflakes(flakes);

            // Papa Noel pasa en posiciones aleatorias
            const createSantaFlight = () => {
                const newFlight = {
                    id: Date.now(),
                    top: Math.random() * 60 + 10, // Entre 10% y 70% de la altura
                    duration: 6 + Math.random() * 3, // Entre 6 y 9 segundos
                };
                setSantaFlights(prev => [...prev, newFlight]);
                
                // Remover después de que termine la animación
                setTimeout(() => {
                    setSantaFlights(prev => prev.filter(f => f.id !== newFlight.id));
                }, (newFlight.duration + 1) * 1000);
            };

            // Primera aparición después de 2 segundos
            const firstTimeout = setTimeout(createSantaFlight, 2000);

            // Apariciones aleatorias cada 12-18 segundos
            const santaInterval = setInterval(() => {
                createSantaFlight();
            }, 12000 + Math.random() * 6000);

            return () => {
                clearTimeout(firstTimeout);
                clearInterval(santaInterval);
            };
        }
    }, [show]);

    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        setLoading(false);

        if (result.success) {
            setFormData({ email: '', password: '' });
            onClose();
        }
    };

    const handleGoogleLogin = () => {
        authAPI.googleLogin();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            {/* Efecto de nieve */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {snowflakes.map((flake) => (
                    <div
                        key={flake.id}
                        className="absolute text-white"
                        style={{
                            left: `${flake.left}%`,
                            top: '-10px',
                            opacity: flake.opacity,
                            fontSize: `${flake.size}px`,
                            animation: `fall ${flake.animationDuration}s linear infinite`,
                            animationDelay: `${flake.animationDelay}s`,
                        }}
                    >
                        ❄
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                    }
                }
                @keyframes santaFly {
                    0% {
                        left: 100%;
                        opacity: 0;
                    }
                    5% {
                        opacity: 1;
                    }
                    95% {
                        opacity: 1;
                    }
                    100% {
                        left: -250px;
                        opacity: 0;
                    }
                }
                @keyframes trail {
                    0%, 100% {
                        opacity: 0.6;
                        transform: scaleX(1);
                    }
                    50% {
                        opacity: 0.3;
                        transform: scaleX(1.2);
                    }
                }
            `}</style>

            
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl transition-colors duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-5 h-5" />
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToRegister}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;