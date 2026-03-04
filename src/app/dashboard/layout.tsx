import { auth0 } from "../../lib/auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/app/dashboard/dashboard-shell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        redirect("/");
    }

    return (
        <DashboardShell user={session.user}>
            {children}
        </DashboardShell>
    );
}
