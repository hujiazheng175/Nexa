"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface NoteEditorProps {
  title: string
  content: string
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  isSaving: boolean
  lastSavedAt?: Date
}

export function NoteEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  isSaving,
  lastSavedAt,
}: NoteEditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize title textarea
  const adjustTitleHeight = useCallback(() => {
    const textarea = titleRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [])

  // Auto-resize content textarea
  const adjustContentHeight = useCallback(() => {
    const textarea = contentRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.max(textarea.scrollHeight, 400)
      textarea.style.height = `${newHeight}px`
    }
  }, [])

  useEffect(() => {
    adjustTitleHeight()
  }, [title, adjustTitleHeight])

  useEffect(() => {
    adjustContentHeight()
  }, [content, adjustContentHeight])

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTitleChange(e.target.value)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      contentRef.current?.focus()
    }
  }

  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 10) return "刚刚保存"
    if (seconds < 60) return `${seconds} 秒前保存`
    if (minutes < 60) return `${minutes} 分钟前保存`
    if (hours < 24) return `${hours} 小时前保存`
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Save Status */}
      <div className="flex h-10 items-center justify-end px-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isSaving ? (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span>保存中...</span>
            </>
          ) : lastSavedAt ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>{formatLastSaved(lastSavedAt)}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[860px] px-8 pb-32 pt-8">
          {/* Title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="无标题"
            rows={1}
            className={cn(
              "w-full resize-none overflow-hidden bg-transparent text-4xl font-bold tracking-tight text-foreground outline-none",
              "placeholder:text-muted-foreground/40",
              "leading-tight"
            )}
          />

          {/* Divider */}
          <div className="my-6 h-px bg-border/50" />

          {/* Content */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={handleContentChange}
            placeholder="开始书写..."
            className={cn(
              "w-full resize-none bg-transparent text-base leading-relaxed text-foreground/90 outline-none",
              "placeholder:text-muted-foreground/40",
              "min-h-[400px]"
            )}
          />
        </div>
      </div>
    </div>
  )
}
