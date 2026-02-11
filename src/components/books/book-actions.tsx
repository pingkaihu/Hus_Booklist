'use client'

import { useState } from 'react'
import { MoreVertical, Trash2, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusDialog } from './status-dialog'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BookActionsProps {
    userBook: any
}

export function BookActions({ userBook }: BookActionsProps) {
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async () => {
        if (!confirm('確定要從書架移除這本書嗎？')) return

        const { error } = await supabase
            .from('user_books')
            .delete()
            .eq('id', userBook.id)

        if (error) {
            alert('刪除失敗')
            console.error(error)
        } else {
            router.refresh()
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>操作</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
                        <BookMarked className="mr-2 h-4 w-4" />
                        更新狀態
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        移除書籍
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <StatusDialog
                userBook={userBook}
                open={statusDialogOpen}
                onClose={() => setStatusDialogOpen(false)}
            />
        </>
    )
}
