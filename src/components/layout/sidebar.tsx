'use client'

import { BookOpen, Home, Tag, FileDown, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
    { icon: Home, label: '儀表板', href: '/dashboard' },
    { icon: BookOpen, label: '我的書架', href: '/books' },
    { icon: Tag, label: '標籤管理', href: '/tags' },
    { icon: FileDown, label: '匯出資料', href: '/export' },
    { icon: BarChart3, label: '閱讀統計', href: '/stats' },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
            <div className="flex h-full flex-col gap-2">
                {/* Logo */}
                <div className="flex h-16 items-center border-b px-6">
                    <BookOpen className="mr-2 h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">Hus BookList</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Section */}
                <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">U</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">使用者</p>
                            <p className="text-xs text-muted-foreground truncate">user@example.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
