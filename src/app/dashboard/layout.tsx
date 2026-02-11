import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Navbar />
                <main className="pt-16 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
