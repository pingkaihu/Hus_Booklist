import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please login</div>
    }

    // Fetch user's books stats
    const { data: userBooks } = await supabase
        .from('user_books')
        .select(`
      *,
      books (
        id,
        title,
        author,
        cover_url
      )
    `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    const totalBooks = userBooks?.length || 0
    const readingBooks = userBooks?.filter(b => b.status === 'reading').length || 0
    const completedBooks = userBooks?.filter(b => b.status === 'completed').length || 0

    // Get recent books
    const recentBooks = userBooks?.slice(0, 5) || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
                    <p className="text-muted-foreground">歡迎回來！這是您的閱讀概況</p>
                </div>
                <Link href="/dashboard/books">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        前往書架
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">總藏書</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBooks}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalBooks === 0 ? '尚未新增任何書籍' : '您的個人圖書館'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">閱讀中</CardTitle>
                        <Badge variant="secondary">{readingBooks}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{readingBooks} 本</div>
                        <p className="text-xs text-muted-foreground">目前進行中的書籍</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">已完讀</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedBooks} 本</div>
                        <p className="text-xs text-muted-foreground">累計完成書籍</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Books */}
            <Card>
                <CardHeader>
                    <CardTitle>最近更新</CardTitle>
                    <CardDescription>最近操作的書籍</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentBooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">開始您的閱讀旅程</h3>
                            <p className="text-sm text-muted-foreground max-w-md mb-4">
                                使用上方的搜尋框來新增您的第一本書，或點擊「前往書架」按鈕
                            </p>
                            <Link href="/dashboard/books">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    前往書架
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentBooks.map((userBook) => {
                                const book = userBook.books as any
                                return (
                                    <div
                                        key={userBook.id}
                                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                    >
                                        {/* Cover */}
                                        <div className="flex-shrink-0">
                                            {book.cover_url ? (
                                                <img
                                                    src={book.cover_url}
                                                    alt={book.title}
                                                    className="w-12 h-16 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{book.title}</p>
                                            <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                                        </div>

                                        {/* Status Badge */}
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
