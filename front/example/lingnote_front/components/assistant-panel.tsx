"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Sparkles, Tag, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AssistantPanelProps {
  isOpen: boolean
  onToggle: () => void
  summary?: string
  tags?: string[]
  wordCount: number
  characterCount: number
}

export function AssistantPanel({
  isOpen,
  onToggle,
  summary,
  tags = [],
  wordCount,
  characterCount,
}: AssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "tags" | "info">("info")

  if (!isOpen) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full w-10 flex-col items-center border-l border-border bg-sidebar py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggle}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">展开助手面板</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <aside className="flex h-full w-64 flex-col border-l border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">助手</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("info")}
          className={cn(
            "flex-1 px-3 py-2 text-xs font-medium transition-colors",
            activeTab === "info"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          信息
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={cn(
            "flex-1 px-3 py-2 text-xs font-medium transition-colors",
            activeTab === "summary"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          摘要
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={cn(
            "flex-1 px-3 py-2 text-xs font-medium transition-colors",
            activeTab === "tags"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          标签
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "info" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                统计信息
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">字符数</span>
                  <span className="font-medium text-foreground">{characterCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">字数</span>
                  <span className="font-medium text-foreground">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">预计阅读</span>
                  <span className="font-medium text-foreground">
                    {Math.max(1, Math.ceil(characterCount / 500))} 分钟
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-3">
            {summary ? (
              <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <Sparkles className="mx-auto h-5 w-5 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  AI 摘要功能即将上线
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  自动为你的笔记生成摘要
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "tags" && (
          <div className="space-y-3">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <Tag className="mx-auto h-5 w-5 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  标签功能即将上线
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  智能标签帮你整理知识
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
