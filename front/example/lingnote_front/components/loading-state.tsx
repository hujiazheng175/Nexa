"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState() {
  return (
    <div className="flex h-full">
      {/* Sidebar Skeleton */}
      <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Button */}
        <div className="px-3 pb-4">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Nav Items */}
        <div className="flex-1 px-3">
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-start gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Skeleton className="mb-2 ml-6 h-4 w-full" />
              <Skeleton className="mb-3 ml-6 h-4 w-2/3" />
              <Skeleton className="ml-6 h-3 w-20" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
