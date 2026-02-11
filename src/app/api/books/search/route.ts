import { NextResponse } from 'next/server'

export interface OpenLibrarySearchResult {
    key: string
    title: string
    author_name?: string[]
    first_publish_year?: number
    edition_count?: number
    cover_i?: number
    isbn?: string[]
}

export interface OpenLibraryEdition {
    key: string
    title: string
    authors?: Array<{ name: string }>
    publishers?: string[]
    publish_date?: string
    isbn_13?: string[]
    isbn_10?: string[]
    covers?: number[]
    number_of_pages?: number
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
        return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    try {
        // Search Open Library API
        const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
        )

        if (!response.ok) {
            throw new Error('Open Library API error')
        }

        const data = await response.json()

        // Format results
        const results: OpenLibrarySearchResult[] = data.docs.map((doc: any) => ({
            key: doc.key,
            title: doc.title,
            author_name: doc.author_name,
            first_publish_year: doc.first_publish_year,
            edition_count: doc.edition_count,
            cover_i: doc.cover_i,
            isbn: doc.isbn,
        }))

        return NextResponse.json({ results })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json(
            { error: 'Failed to search books' },
            { status: 500 }
        )
    }
}
