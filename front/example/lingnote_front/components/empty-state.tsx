"use client"

import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onCreateNote: () => void
}

export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Text */}
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          开始你的知识之旅
        </h2>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          创建你的第一篇笔记，记录想法、整理知识，让灵感自然流淌。
        </p>

        {/* Action */}
        <Button onClick={onCreateNote} className="gap-2">
          <Plus className="h-4 w-4" />
          新建笔记
        </Button>
      </div>
    </div>
  )
}
