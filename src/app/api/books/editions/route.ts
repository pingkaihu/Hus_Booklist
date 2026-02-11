import { NextResponse } from 'next/server'

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
    const workKey = searchParams.get('work')

    if (!workKey) {
        return NextResponse.json({ error: 'Work key required' }, { status: 400 })
    }

    try {
        // Fetch editions for a specific work
        const response = await fetch(
            `https://openlibrary.org${workKey}/editions.json?limit=20`
        )

        if (!response.ok) {
            throw new Error('Open Library API error')
        }

        const data = await response.json()

        // Format edition results
        const editions: OpenLibraryEdition[] = data.entries.map((edition: any) => ({
            key: edition.key,
            title: edition.title,
            authors: edition.authors?.map((a: any) => ({ name: a.name || 'Unknown' })),
            publishers: edition.publishers,
            publish_date: edition.publish_date,
            isbn_13: edition.isbn_13,
            isbn_10: edition.isbn_10,
            covers: edition.covers,
            number_of_pages: edition.number_of_pages,
        }))

        return NextResponse.json({ editions })
    } catch (error) {
        console.error('Editions fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch editions' },
            { status: 500 }
        )
    }
}
