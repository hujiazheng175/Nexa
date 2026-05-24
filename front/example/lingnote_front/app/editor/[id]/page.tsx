"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { EditorSidebar } from "@/components/editor-sidebar"
import { NoteEditor } from "@/components/note-editor"
import { AssistantPanel } from "@/components/assistant-panel"

// Mock data - same as homepage for consistency
const mockNotes = [
  {
    id: "1",
    title: "产品设计思考",
    content: "好的产品设计应该是简洁而有力的。用户不需要学习如何使用，而是自然而然地就能上手。这就是所谓的直觉设计。我们在设计 LingNote 时，始终坚持这一原则...\n\n设计的核心是解决问题，而不是炫技。每一个功能、每一个交互都应该有其存在的理由。如果一个元素不能为用户带来价值，那它就不应该出现在界面上。\n\n在这个信息过载的时代，简洁本身就是一种奢侈。能够帮助用户快速找到他们需要的内容，过滤掉噪音，这是好产品的标志。",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    title: "AI 与知识管理的未来",
    content: "人工智能正在改变我们管理知识的方式。从简单的搜索到智能推荐，再到自动摘要和知识图谱，AI 让知识的组织和检索变得前所未有的高效...\n\n未来的知识管理工具将不仅仅是存储信息的容器，而是能够主动帮助我们发现知识之间的联系，提供洞见，甚至预测我们可能需要的信息。\n\n但技术只是工具。真正重要的是如何用好这些工具，让它们服务于我们的思考和创造，而不是取代它们。",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    title: "读书笔记：深度工作",
    content: "Cal Newport 在《深度工作》中提出，在这个充满干扰的时代，能够进行深度工作的能力变得越来越稀缺，也因此越来越有价值...\n\n深度工作需要专注，而专注需要环境的支持。我们需要有意识地创造能够让自己进入心流状态的条件。\n\n这本书让我重新思考了工作方式。与其追求表面上的忙碌，不如花时间在真正有价值的事情上。",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "4",
    title: "项目周报 - 第 12 周",
    content: "本周主要完成了笔记系统的核心功能开发，包括创建、编辑、删除和搜索功能。下周计划开始进行 UI 优化和性能调优...\n\n## 完成事项\n- 笔记 CRUD 功能\n- 搜索功能\n- 分页功能\n\n## 下周计划\n- UI 优化\n- 性能调优\n- 测试覆盖",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "5",
    title: "灵感碎片",
    content: "生活中的小灵感往往是创新的种子。今天在咖啡店看到一位老人专注地阅读报纸，那种沉浸感让我思考：数字时代我们是否失去了某些东西？\n\n也许我们需要的不是更多的功能，而是更少的干扰。一个好的工具应该让你忘记它的存在，而专注于你真正在做的事情。",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "6",
    title: "技术架构设计原则",
    content: "好的架构应该是演进式的。不要试图一开始就设计出完美的架构，而是要为未来的变化留出空间。保持简单，拥抱变化，持续重构...\n\n## 核心原则\n\n1. **简单性** - 简单的系统更容易理解、维护和扩展\n2. **模块化** - 将系统分解为独立的模块，降低耦合\n3. **可测试性** - 设计时就考虑如何测试\n4. **可观察性** - 系统运行状态应该是可见的",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
]

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [notes, setNotes] = useState(mockNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>(undefined)

  // Find current note
  const currentNote = useMemo(() => {
    return notes.find((n) => n.id === noteId)
  }, [notes, noteId])

  // Filter notes by search
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes
    const query = searchQuery.toLowerCase()
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    )
  }, [notes, searchQuery])

  // Calculate word count and character count
  const { wordCount, characterCount } = useMemo(() => {
    if (!currentNote) return { wordCount: 0, characterCount: 0 }
    const text = currentNote.content
    const chars = text.length
    // Simple word count for Chinese text (count characters) and English (count words)
    const words = text.replace(/[\u4e00-\u9fa5]/g, " ").split(/\s+/).filter(Boolean).length +
      (text.match(/[\u4e00-\u9fa5]/g) || []).length
    return { wordCount: words, characterCount: chars }
  }, [currentNote])

  // Auto-save simulation
  const saveNote = useCallback(() => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setLastSavedAt(new Date())
    }, 500)
  }, [])

  // Debounced save on content change
  useEffect(() => {
    if (!currentNote) return
    const timer = setTimeout(() => {
      saveNote()
    }, 1000)
    return () => clearTimeout(timer)
  }, [currentNote?.title, currentNote?.content, saveNote])

  const handleTitleChange = (title: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, title, updatedAt: new Date().toISOString() }
          : n
      )
    )
  }

  const handleContentChange = (content: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, content, updatedAt: new Date().toISOString() }
          : n
      )
    )
  }

  const handleSelectNote = (id: string) => {
    router.push(`/editor/${id}`)
  }

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

  const handleBackToHome = () => {
    router.push("/")
  }

  // If note not found, redirect to home
  useEffect(() => {
    if (!currentNote && notes.length > 0) {
      router.push("/")
    }
  }, [currentNote, notes.length, router])

  if (!currentNote) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <EditorSidebar
        notes={filteredNotes}
        selectedNoteId={noteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onBackToHome={handleBackToHome}
      />

      {/* Editor */}
      <main className="flex-1 overflow-hidden">
        <NoteEditor
          title={currentNote.title}
          content={currentNote.content}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          isSaving={isSaving}
          lastSavedAt={lastSavedAt}
        />
      </main>

      {/* Assistant Panel */}
      <AssistantPanel
        isOpen={isAssistantOpen}
        onToggle={() => setIsAssistantOpen(!isAssistantOpen)}
        wordCount={wordCount}
        characterCount={characterCount}
      />
    </div>
  )
}
