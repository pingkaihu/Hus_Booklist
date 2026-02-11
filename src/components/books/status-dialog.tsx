'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Repeat } from 'lucide-react'

interface StatusDialogProps {
    userBook: any
    open: boolean
    onClose: () => void
}

export function StatusDialog({ userBook, open, onClose }: StatusDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleStatusChange = async (newStatus: 'unread' | 'reading' | 'completed') => {
        setLoading(true)

        try {
            const updates: any = { status: newStatus }

            // If marking as completed, set finished_at
            if (newStatus === 'completed' && userBook.status !== 'completed') {
                updates.finished_at = new Date().toISOString()
            }

            // If marking as unread, clear finished_at
            if (newStatus === 'unread') {
                updates.finished_at = null
            }

            const { error } = await supabase
                .from('user_books')
                .update(updates)
                .eq('id', userBook.id)

            if (error) throw error

            router.refresh()
            onClose()
        } catch (error) {
            console.error('Error updating status:', error)
            alert('更新失敗')
        } finally {
            setLoading(false)
        }
    }

    const handleReread = async () => {
        setLoading(true)

        try {
            // Get current re_read_logs
            const currentLogs = userBook.re_read_logs || []

            // Add new re-read entry
            const newLog = {
                start: new Date().toISOString(),
                end: null,
            }

            const { error } = await supabase
                .from('user_books')
                .update({
                    status: 'reading',
                    re_read_logs: [...currentLogs, newLog],
                })
                .eq('id', userBook.id)

            if (error) throw error

            router.refresh()
            onClose()
            alert('已開始重讀！')
        } catch (error) {
            console.error('Error starting re-read:', error)
            alert('操作失敗')
        } finally {
            setLoading(false)
        }
    }

    const completeReread = async () => {
        setLoading(true)

        try {
            const logs = userBook.re_read_logs || []

            // Find the last incomplete re-read
            const lastLogIndex = logs.findIndex((log: any) => !log.end)

            if (lastLogIndex === -1) {
                alert('沒有進行中的重讀')
                return
            }

            // Update the last log with end time
            logs[lastLogIndex].end = new Date().toISOString()

            const { error } = await supabase
                .from('user_books')
                .update({
                    status: 'completed',
                    finished_at: new Date().toISOString(),
                    re_read_logs: logs,
                })
                .eq('id', userBook.id)

            if (error) throw error

            router.refresh()
            onClose()
            alert('重讀完成！')
        } catch (error) {
            console.error('Error completing re-read:', error)
            alert('操作失敗')
        } finally {
            setLoading(false)
        }
    }

    const rereadCount = userBook.re_read_logs?.length || 0
    const hasActiveReread = userBook.re_read_logs?.some((log: any) => !log.end)

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>更新閱讀狀態</DialogTitle>
                    <DialogDescription>
                        {userBook.books?.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Status */}
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">目前狀態</p>
                        <Badge>
                            {userBook.status === 'unread' && '未讀'}
                            {userBook.status === 'reading' && '閱讀中'}
                            {userBook.status === 'completed' && '已完讀'}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Status Actions */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">更改狀態</p>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={userBook.status === 'unread' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange('unread')}
                                disabled={loading}
                            >
                                未讀
                            </Button>
                            <Button
                                variant={userBook.status === 'reading' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange('reading')}
                                disabled={loading}
                            >
                                閱讀中
                            </Button>
                            <Button
                                variant={userBook.status === 'completed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange('completed')}
                                disabled={loading}
                            >
                                已完讀
                            </Button>
                        </div>
                    </div>

                    {/* Re-read Section */}
                    {userBook.status === 'completed' && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <Repeat className="h-4 w-4" />
                                            重讀記錄
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            共重讀 {rereadCount} 次
                                        </p>
                                    </div>
                                </div>

                                {hasActiveReread ? (
                                    <Button
                                        onClick={completeReread}
                                        disabled={loading}
                                        className="w-full"
                                        variant="secondary"
                                    >
                                        完成當前重讀
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleReread}
                                        disabled={loading}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        開始重讀
                                    </Button>
                                )}

                                {/* Re-read History */}
                                {rereadCount > 0 && (
                                    <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                                        {userBook.re_read_logs.map((log: any, index: number) => (
                                            <div key={index} className="flex justify-between py-1 border-b">
                                                <span>第 {index + 1} 次</span>
                                                <span>
                                                    {new Date(log.start).toLocaleDateString()}
                                                    {log.end && ` - ${new Date(log.end).toLocaleDateString()}`}
                                                    {!log.end && ' (進行中)'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
