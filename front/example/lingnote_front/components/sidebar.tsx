"use client"

import { useState } from "react"
import { Search, Plus, FileText, Clock, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Note {
  id: string
  title: string
  updatedAt: string
}

interface SidebarProps {
  notes: Note[]
  selectedNoteId?: string
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onSearch: (query: string) => void
  searchQuery: string
}

export function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onSearch,
  searchQuery,
}: SidebarProps) {
  const [isRecentExpanded, setIsRecentExpanded] = useState(true)

  const recentNotes = notes.slice(0, 5)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-semibold text-primary-foreground">L</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">LingNote</span>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="h-9 border-transparent bg-muted pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:border-border focus-visible:ring-1 focus-visible:ring-ring/20"
          />
        </div>
      </div>

      {/* Create Note Button */}
      <div className="px-3 pb-4">
        <Button
          onClick={onCreateNote}
          className="h-9 w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/15"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
          新建笔记
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        {/* Recent Notes */}
        <div className="mb-4">
          <button
            onClick={() => setIsRecentExpanded(!isRecentExpanded)}
            className="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                !isRecentExpanded && "-rotate-90"
              )}
            />
            <Clock className="h-3 w-3" />
            最近编辑
          </button>

          {isRecentExpanded && (
            <div className="mt-1 space-y-0.5">
              {recentNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    selectedNoteId === note.id
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{note.title || "无标题"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Notes */}
        <div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3 w-3" />
            全部笔记
          </div>
          <div className="mt-1 space-y-0.5">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  selectedNoteId === note.id
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:bg-muted"
                )}
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{note.title || "无标题"}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">{notes.length} 篇笔记</p>
      </div>
    </aside>
  )
}
