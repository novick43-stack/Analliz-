import { auth0 } from './src/lib/auth0';

export const runtime = 'edge';

export async function middleware(request: Request) {
    // Delegates handling to Auth0 SDK which will process /auth/* routes
    return auth0.middleware(request);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
