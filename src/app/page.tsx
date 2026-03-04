import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-8">
      <main className="max-w-md w-full bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col items-center text-center gap-8 transition-transform hover:-translate-y-1 duration-300">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight mb-2">
            Analliz
          </h1>
          <p className="text-gray-500 font-medium text-sm px-4">Plataforma central. Por favor, selecciona cómo deseas ingresar a tu cuenta.</p>
        </div>

        <div className="flex flex-col gap-4 w-full mt-2">
          <a
            href="/auth/login"
            className="group relative w-full flex justify-center py-3.5 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
          >
            Login / Registrarse
          </a>

          <Link
            href="/admin/login"
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 flex justify-center items-center group"
          >
            Acceso <span className="text-blue-600 ml-1 group-hover:translate-x-1 transition-transform">Admin &rarr;</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
