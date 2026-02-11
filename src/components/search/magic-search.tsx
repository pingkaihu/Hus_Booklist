'use client'

import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { debounce } from '@/lib/utils'
import type { OpenLibrarySearchResult } from '@/app/api/books/search/route'
import { EditionPicker } from './edition-picker'

export function MagicSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<OpenLibrarySearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedWork, setSelectedWork] = useState<OpenLibrarySearchResult | null>(null)

    // Debounced search function
    const searchBooks = useCallback(
        debounce(async (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`)
                const data = await response.json()
                setResults(data.results || [])
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 500),
        []
    )

    const handleInputChange = (value: string) => {
        setQuery(value)
        searchBooks(value)
    }

    const handleSelectWork = (work: OpenLibrarySearchResult) => {
        setSelectedWork(work)
    }

    return (
        <>
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="搜尋書籍、作者、ISBN..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => setOpen(true)}
                />

                {open && (
                    <div className="absolute top-full mt-2 w-full z-50">
                        <Command className="rounded-lg border shadow-md bg-popover">
                            <CommandList>
                                {loading && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        搜尋中...
                                    </div>
                                )}
                                {!loading && query && results.length === 0 && (
                                    <CommandEmpty>找不到相關書籍</CommandEmpty>
                                )}
                                {!loading && results.length > 0 && (
                                    <CommandGroup>
                                        {results.map((result) => (
                                            <CommandItem
                                                key={result.key}
                                                onSelect={() => {
                                                    handleSelectWork(result)
                                                    setOpen(false)
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <div className="font-medium">{result.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {result.author_name?.join(', ') || '未知作者'}
                                                        {result.first_publish_year && ` · ${result.first_publish_year}`}
                                                        {result.edition_count && ` · ${result.edition_count} 個版本`}
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </CommandList>
                        </Command>
                    </div>
                )}
            </div>

            {/* Edition Picker Dialog */}
            {selectedWork && (
                <EditionPicker
                    work={selectedWork}
                    open={!!selectedWork}
                    onClose={() => setSelectedWork(null)}
                />
            )}
        </>
    )
}
