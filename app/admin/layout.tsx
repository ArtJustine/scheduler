import type React from "react"
import { AuthProvider } from "../../lib/auth-provider"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    )
}
