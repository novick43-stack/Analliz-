"use client";

import Link from "next/link";

export default function Login() {
    return (
        <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-8">

            {/* Back Button */}
            <div className="absolute top-8 left-8">
                <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
                    &larr; Volver
                </Link>
            </div>

            <div className="max-w-md w-full bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transition-transform hover:-translate-y-1 duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight">
                        Bienvenido a Analliz
                    </h2>
                    <p className="text-gray-500 font-medium text-sm mt-2">Ingresá o creá tu cuenta para continuar</p>
                </div>

                <div className="space-y-5 flex flex-col">
                    <div className="pt-2">
                        <a
                            href="/auth/login"
                            className="group relative w-full flex justify-center py-3.5 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 active:scale-[0.98]"
                        >
                            Ingresar / Registrarse con Auth0
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
