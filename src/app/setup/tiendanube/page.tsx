'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TiendaNubeSetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If we're already connected, go to dashboard
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await fetch('/api/tiendanube/status');
                const data = await res.json();
                if (data.connected) {
                    router.push('/dashboard');
                }
            } catch (e) {
                console.error("Error checking connection", e);
            }
        };
        checkConnection();
    }, [router]);

    // Check if there's a state parameter from callback
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (params?.get('connected') === 'true') {
        router.push('/dashboard');
        return null;
    }

    const handleConnectTiendaNube = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Generate a random state for CSRF protection
            const state = Math.random().toString(36).substring(7);

            // Store state in session storage for validation
            sessionStorage.setItem('tiendanube_state', state);

            // Get the authorization URL from the backend
            const response = await fetch(`/api/tiendanube/auth?state=${state}`);

            if (!response.ok) {
                throw new Error('Failed to get authorization URL');
            }

            const data = await response.json();

            // Redirect to Tienda Nube OAuth
            window.location.href = data.authUrl;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Conecta tu tienda
                        </h1>
                        <p className="text-gray-600">
                            Para continuar, necesitamos conectar tu tienda Nube
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Tienda Nube Info */}
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-blue-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    Usaremos tu tienda Nube para obtener información de tus productos y pedidos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Connect Button */}
                    <button
                        onClick={handleConnectTiendaNube}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Conectando...
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10.5 1.5H3a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5V11m-10 0l3.293-3.293a1 1 0 011.414 0l2.293 2.293m0-5V3" />
                                </svg>
                                Conectar con Tienda Nube
                            </>
                        )}
                    </button>

                    {/* Skip Option */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm mb-2">
                            ¿Prefieres hacerlo más tarde?
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                        >
                            Ir al dashboard →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
