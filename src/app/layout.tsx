import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Analliz App",
    description: "App landing page and admin panel",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>
                {children}
            </body>
        </html>
    );
}
