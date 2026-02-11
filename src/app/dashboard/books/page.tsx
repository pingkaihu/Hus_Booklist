import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Building2 } from 'lucide-react'
import { BookActions } from '@/components/books/book-actions'

export default async function BooksPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please login</div>
    }

    // Fetch user's books with book details
    const { data: userBooks, error } = await supabase
        .from('user_books')
        .select(`
      *,
      books (
        id,
        title,
        author,
        publisher,
        published_year,
        isbn_13,
        cover_url
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching books:', error)
        return <div>Error loading books</div>
    }

    const statusCounts = {
        unread: userBooks?.filter(b => b.status === 'unread').length || 0,
        reading: userBooks?.filter(b => b.status === 'reading').length || 0,
        completed: userBooks?.filter(b => b.status === 'completed').length || 0,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">我的書架</h1>
                <p className="text-muted-foreground">管理您的個人藏書</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">未讀</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.unread}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">閱讀中</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.reading}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">已完讀</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.completed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Books List */}
            <Card>
                <CardHeader>
                    <CardTitle>書籍列表</CardTitle>
                    <CardDescription>共 {userBooks?.length || 0} 本書</CardDescription>
                </CardHeader>
                <CardContent>
                    {!userBooks || userBooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">還沒有書籍</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                使用上方的搜尋框來新增您的第一本書
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userBooks.map((userBook) => {
                                const book = userBook.books as any
                                return (
                                    <div
                                        key={userBook.id}
                                        className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        {/* Cover */}
                                        <div className="flex-shrink-0">
                                            {book.cover_url ? (
                                                <img
                                                    src={book.cover_url}
                                                    alt={book.title}
                                                    className="w-16 h-24 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                                                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg mb-1 truncate">{book.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{book.author}</p>

                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                                                {book.publisher && (
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        <span>{book.publisher}</span>
                                                    </div>
                                                )}
                                                {book.published_year && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{book.published_year}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        userBook.status === 'completed'
                                                            ? 'default'
                                                            : userBook.status === 'reading'
                                                                ? 'secondary'
                                                                : 'outline'
                                                    }
                                                >
                                                    {userBook.status === 'unread' && '未讀'}
                                                    {userBook.status === 'reading' && '閱讀中'}
                                                    {userBook.status === 'completed' && '已完讀'}
                                                </Badge>

                                                {userBook.tags && userBook.tags.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {userBook.tags.map((tag: string) => (
                                                            <Badge key={tag} variant="outline" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <BookActions userBook={userBook} />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
