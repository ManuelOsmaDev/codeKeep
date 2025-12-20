import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Shield, Zap } from 'lucide-react';
import SnowEffect from './SnowEffect';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white relative">
            <SnowEffect />
            {/* Navbar */}
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-2">
                    <Code2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-xl font-bold">CodeKeep</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                        Beta
                    </span>
                </div>
                <div className="space-x-4">
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 !text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/50"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 !text-white rounded-lg transition-all shadow-lg hover:shadow-blue-600/50 font-medium"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="container mx-auto px-6 py-16 md:py-24 text-center relative z-10">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">✨ Estamos en Beta Pública</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    Tus Snippets de Código, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Organizados y Accesibles</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                    Guarda, gestiona y comparte tus snippets de código con facilidad. Nunca vuelvas a perder esa función útil.
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        to={isAuthenticated ? "/dashboard" : "/login"}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 !text-white text-lg font-bold rounded-xl transition-all shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1"
                    >
                        {isAuthenticated ? "Ir al Dashboard" : "Empieza a Programar Ahora"}
                    </Link>
                </div>
            </header>

            {/* Quienes Somos / About Section */}
            <section className="bg-white dark:bg-slate-800/50 backdrop-blur-sm py-16 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Quienes Somos</h2>
                        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Somos un equipo apasionado por el desarrollo de software, dedicados a crear herramientas que hacen la vida de los programadores más fácil.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Innovación</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Buscamos constantemente nuevas formas de optimizar tu flujo de trabajo.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Seguridad</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Tu código es importante. Nos tomamos la seguridad de tus datos muy en serio.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Comunidad</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Construimos herramientas pensando en la comunidad de desarrolladores.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Que Hacemos / Features Section */}
            <section className="py-16 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Que Hacemos</h2>
                        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            CodeKeep es tu repositorio personal de snippets en la nube.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">1</div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Almacenamiento Centralizado</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Guarda todos tus fragmentos de código en un solo lugar, organizados y etiquetados para un fácil acceso.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">2</div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Integración con Google Drive</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Sincroniza tus snippets directamente con Google Drive para tener una copia de seguridad siempre disponible.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">3</div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Gestor de Contraseñas Cifradas</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Almacena tus credenciales de forma segura con nuestro gestor de contraseñas cifradas de extremo a extremo.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-700">
                            <pre className="text-sm text-blue-300 overflow-x-auto">
                                <code>{`// Example Snippet
function helloWorld() {
    console.log("Hello, CodeKeep!");
    return "Organized Code";
}

const features = [
    "Google Drive Sync",
    "Encrypted Passwords",
    "Cloud Storage"
];`}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-8 relative z-10">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; {new Date().getFullYear()} CodeKeep. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
