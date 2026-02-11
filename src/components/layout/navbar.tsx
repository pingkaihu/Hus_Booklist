'use client'

import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MagicSearch } from '@/components/search/magic-search'

export function Navbar() {
    return (
        <header className="fixed top-0 z-30 flex h-16 w-full items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full items-center gap-4 px-6 ml-64">
                {/* Magic Search */}
                <MagicSearch />

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
