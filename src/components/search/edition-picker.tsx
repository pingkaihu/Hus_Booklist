'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import type { OpenLibrarySearchResult } from '@/app/api/books/search/route'
import type { OpenLibraryEdition } from '@/app/api/books/editions/route'
import { Book, Calendar, Building2, Hash } from 'lucide-react'

interface EditionPickerProps {
    work: OpenLibrarySearchResult
    open: boolean
    onClose: () => void
}

export function EditionPicker({ work, open, onClose }: EditionPickerProps) {
    const [editions, setEditions] = useState<OpenLibraryEdition[]>([])
    const [loading, setLoading] = useState(false)
    const [adding, setAdding] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (open && work) {
            fetchEditions()
        }
    }, [open, work])

    const fetchEditions = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/books/editions?work=${encodeURIComponent(work.key)}`)
            const data = await response.json()
            setEditions(data.editions || [])
        } catch (error) {
            console.error('Error fetching editions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddBook = async (edition: OpenLibraryEdition) => {
        setAdding(edition.key)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('請先登入')
                return
            }

            // First, check if book exists in global cache
            const olEditionKey = edition.key.replace('/books/', '')
            let bookId: string

            const { data: existingBook } = await supabase
                .from('books')
                .select('id')
                .eq('ol_edition_key', olEditionKey)
                .single()

            if (existingBook) {
                bookId = existingBook.id
            } else {
                // Add to global books cache
                const { data: newBook, error: bookError } = await supabase
                    .from('books')
                    .insert({
                        ol_edition_key: olEditionKey,
                        title: edition.title,
                        author: edition.authors?.map(a => a.name).join(', ') || 'Unknown',
                        publisher: edition.publishers?.[0] || null,
                        published_year: edition.publish_date ? parseInt(edition.publish_date) : null,
                        isbn_13: edition.isbn_13?.[0] || null,
                        cover_url: edition.covers?.[0]
                            ? `https://covers.openlibrary.org/b/id/${edition.covers[0]}-M.jpg`
                            : null,
                    })
                    .select('id')
                    .single()

                if (bookError) throw bookError
                bookId = newBook.id
            }

            // Add to user's personal shelf
            const { error: userBookError } = await supabase
                .from('user_books')
                .insert({
                    user_id: user.id,
                    book_id: bookId,
                    status: 'unread',
                })

            if (userBookError) {
                // Check if already exists
                if (userBookError.code === '23505') {
                    alert('這本書已經在您的書架上了')
                } else {
                    throw userBookError
                }
            } else {
                alert('成功加入書架！')
                onClose()
            }
        } catch (error) {
            console.error('Error adding book:', error)
            alert('加入失敗，請稍後再試')
        } finally {
            setAdding(null)
        }
    }

    const getCoverUrl = (edition: OpenLibraryEdition) => {
        if (edition.covers && edition.covers.length > 0) {
            return `https://covers.openlibrary.org/b/id/${edition.covers[0]}-M.jpg`
        }
        return null
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>選擇版本</DialogTitle>
                    <DialogDescription>
                        《{work.title}》有多個版本，請選擇您想要的特定版本
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[500px] pr-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-muted-foreground">載入版本中...</div>
                        </div>
                    ) : editions.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-muted-foreground">找不到版本資訊</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {editions.map((edition) => (
                                <div
                                    key={edition.key}
                                    className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        {/* Cover */}
                                        <div className="flex-shrink-0">
                                            {getCoverUrl(edition) ? (
                                                <img
                                                    src={getCoverUrl(edition)!}
                                                    alt={edition.title}
                                                    className="w-20 h-28 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-20 h-28 bg-muted rounded flex items-center justify-center">
                                                    <Book className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 space-y-2">
                                            <h4 className="font-semibold">{edition.title}</h4>

                                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                {edition.publishers && (
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        <span>{edition.publishers[0]}</span>
                                                    </div>
                                                )}
                                                {edition.publish_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{edition.publish_date}</span>
                                                    </div>
                                                )}
                                                {(edition.isbn_13 || edition.isbn_10) && (
                                                    <div className="flex items-center gap-1">
                                                        <Hash className="h-3 w-3" />
                                                        <span>{edition.isbn_13?.[0] || edition.isbn_10?.[0]}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {edition.number_of_pages && (
                                                <Badge variant="secondary">
                                                    {edition.number_of_pages} 頁
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <div className="flex-shrink-0">
                                            <Button
                                                onClick={() => handleAddBook(edition)}
                                                disabled={adding === edition.key}
                                                size="sm"
                                            >
                                                {adding === edition.key ? '加入中...' : '加入書架'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
