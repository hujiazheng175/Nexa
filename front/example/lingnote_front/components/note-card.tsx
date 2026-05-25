import Link from "next/link"
import { FileText, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

interface NoteCardProps {
  note: Note
  isSelected?: boolean
  onClick?: () => void
}

export function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes <= 1 ? "刚刚" : `${minutes} 分钟前`
      }
      return `${hours} 小时前`
    }
    if (days === 1) return "昨天"
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
  }

  // Extract preview text (first 100 chars, strip markdown)
  const previewText = note.content
    .replace(/[#*`>\-\[\]()]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 120)

  return (
    <Link
      href={`/editor/${note.id}`}
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition-all duration-200",
        isSelected
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "border-transparent hover:border-border hover:bg-card hover:shadow-sm"
      )}
    >
      {/* Title */}
      <div className="flex w-full items-start gap-2">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <h3 className="flex-1 text-base font-medium leading-snug text-foreground">
          {note.title || "无标题"}
        </h3>
      </div>

      {/* Preview */}
      {previewText && (
        <p className="line-clamp-2 pl-6 text-sm leading-relaxed text-muted-foreground">
          {previewText}
          {note.content.length > 120 && "..."}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-1.5 pl-6 text-xs text-muted-foreground/70">
        <Clock className="h-3 w-3" />
        <span>{formatDate(note.updatedAt)}</span>
      </div>
    </Link>
  )
}
