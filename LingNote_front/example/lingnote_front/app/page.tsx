"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Grid3X3, List, SortAsc } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { NoteCard } from "@/components/note-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Mock data for demonstration
const mockNotes = [
  {
    id: "1",
    title: "产品设计思考",
    content: "好的产品设计应该是简洁而有力的。用户不需要学习如何使用，而是自然而然地就能上手。这就是所谓的直觉设计。我们在设计 LingNote 时，始终坚持这一原则...",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    title: "AI 与知识管理的未来",
    content: "人工智能正在改变我们管理知识的方式。从简单的搜索到智能推荐，再到自动摘要和知识图谱，AI 让知识的组织和检索变得前所未有的高效...",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    title: "读书笔记：深度工作",
    content: "Cal Newport 在《深度工作》中提出，在这个充满干扰的时代，能够进行深度工作的能力变得越来越稀缺，也因此越来越有价值...",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "4",
    title: "项目周报 - 第 12 周",
    content: "本周主要完成了笔记系统的核心功能开发，包括创建、编辑、删除和搜索功能。下周计划开始进行 UI 优化和性能调优...",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "5",
    title: "灵感碎片",
    content: "生活中的小灵感往往是创新的种子。今天在咖啡店看到一位老人专注地阅读报纸，那种沉浸感让我思考：数字时代我们是否失去了某些东西？",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "6",
    title: "技术架构设计原则",
    content: "好的架构应该是演进式的。不要试图一开始就设计出完美的架构，而是要为未来的变化留出空间。保持简单，拥抱变化，持续重构...",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
]

type ViewMode = "grid" | "list"
type SortBy = "updatedAt" | "title"

export default function HomePage() {
  const router = useRouter()
  const [notes, setNotes] = useState(mockNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortBy>("updatedAt")

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = notes

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "updatedAt") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      return a.title.localeCompare(b.title, "zh-CN")
    })

    return result
  }, [notes, searchQuery, sortBy])

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "",
      content: "",
      updatedAt: new Date().toISOString(),
    }
    setNotes([newNote, ...notes])
    router.push(`/editor/${newNote.id}`)
  }

  const handleSelectNote = (id: string) => {
    router.push(`/editor/${id}`)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        notes={filteredNotes}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {notes.length === 0 ? (
          <EmptyState onCreateNote={handleCreateNote} />
        ) : (
          <div className="mx-auto max-w-5xl px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {searchQuery ? "搜索结果" : "全部笔记"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredNotes.length} 篇笔记
                  {searchQuery && ` · 包含 "${searchQuery}"`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                      <SortAsc className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {sortBy === "updatedAt" ? "最近编辑" : "按标题"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("updatedAt")}>
                      最近编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("title")}>
                      按标题排序
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode */}
                <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "rounded-md p-1.5 transition-colors",
                      viewMode === "grid"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "rounded-md p-1.5 transition-colors",
                      viewMode === "list"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Create Note */}
                <Button onClick={handleCreateNote} size="sm" className="h-8 gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">新建</span>
                </Button>
              </div>
            </div>

            {/* Notes Grid/List */}
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground">没有找到匹配的笔记</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  尝试使用不同的关键词搜索
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  "gap-4",
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col"
                )}
              >
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => handleSelectNote(note.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
