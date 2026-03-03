import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
    signInReturnToPath: "/setup/tiendanube", // Redirige a setup de Tienda Nube después del login
});
