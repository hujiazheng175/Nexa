"use client"

import { useState } from "react"
import { Search, Plus, FileText, ChevronLeft, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Note {
  id: string
  title: string
  updatedAt: string
}

interface EditorSidebarProps {
  notes: Note[]
  selectedNoteId?: string
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onSearch: (query: string) => void
  searchQuery: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  onBackToHome: () => void
}

export function EditorSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onSearch,
  searchQuery,
  isCollapsed,
  onToggleCollapse,
  onBackToHome,
}: EditorSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <aside className="flex h-full w-14 flex-col border-r border-border bg-sidebar">
          {/* Collapsed Header */}
          <div className="flex flex-col items-center gap-2 py-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onBackToHome}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <span className="text-sm font-semibold">L</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">返回首页</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggleCollapse}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">展开侧边栏</TooltipContent>
            </Tooltip>
          </div>

          {/* Collapsed Actions */}
          <div className="flex flex-col items-center gap-1 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onCreateNote}
                  className="text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">新建笔记</TooltipContent>
            </Tooltip>
          </div>

          {/* Collapsed Notes */}
          <ScrollArea className="flex-1 py-2">
            <div className="flex flex-col items-center gap-0.5 px-2">
              {notes.slice(0, 10).map((note) => (
                <Tooltip key={note.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectNote(note.id)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                        selectedNoteId === note.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {note.title || "无标题"}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>
        </aside>
      </TooltipProvider>
    )
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">返回</span>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="h-8 border-transparent bg-muted pl-8 text-sm placeholder:text-muted-foreground/60 focus-visible:border-border focus-visible:ring-1 focus-visible:ring-ring/20"
          />
        </div>
      </div>

      {/* Create Note */}
      <div className="px-3 pb-3">
        <Button
          onClick={onCreateNote}
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/15"
        >
          <Plus className="h-3.5 w-3.5" />
          新建笔记
        </Button>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 px-3">
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center gap-1.5 px-1.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                !isExpanded && "-rotate-90"
              )}
            />
            笔记列表
          </button>

          {isExpanded && (
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
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-left">
                    {note.title || "无标题"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5">
        <p className="text-xs text-muted-foreground">{notes.length} 篇笔记</p>
      </div>
    </aside>
  )
}
