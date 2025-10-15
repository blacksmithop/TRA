"use client"

import { ProfileCard } from "@/components/profile-card"
import { BarsCard } from "@/components/bars-card"
import { BattleStatsCard } from "@/components/battle-stats-card"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Torn Logbook</h1>
          <p className="text-muted-foreground">Track your Torn City statistics</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <ProfileCard />

          <div className="space-y-6">
            <BarsCard />
            <BattleStatsCard />
          </div>
        </div>
      </div>
    </main>
  )
}
