"use client"

import { IconsReferenceCard } from "@/components/icons-reference-card"

export default function IconsPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Torn Icons Reference</h1>
          <p className="text-muted-foreground">Visual reference for all available Torn City icons</p>
        </div>

        <IconsReferenceCard />
      </div>
    </main>
  )
}
