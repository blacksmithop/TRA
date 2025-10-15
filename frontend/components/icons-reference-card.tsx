"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TornIcon } from "@/components/torn-icon"
import type { TornIconName } from "@/lib/torn-icons"

export function IconsReferenceCard() {
  const iconGroups = {
    Status: ["Online", "Offline", "Idle"] as TornIconName[],
    Gender: ["Male", "Female", "Enby"] as TornIconName[],
    "Player Status": [
      "New player",
      "Subscriber",
      "Donator",
      "Level 100",
      "Committee",
      "Staff",
      "Marriage",
      "Bounty",
      "Low life",
    ] as TornIconName[],
    Faction: ["Faction member", "Faction recruit", "Faction leader / co-leader"] as TornIconName[],
    Company: ["Company Employee", "Company director", "Company recruit"] as TornIconName[],
    Jobs: ["Army job", "Casino job", "Medical job", "Grocer job", "Lawyer job", "Education job"] as TornIconName[],
    "Location & Activity": [
      "XXX",
      "Hospital",
      "Jail",
      "Federal jail",
      "Travelling",
      "Racing in progress",
      "Racing completed",
      "Hospital eary discharge",
      "Reaing book",
      "XXX_1",
      "XXX_2",
      "XXX_3",
      "XXX_4",
    ] as TornIconName[],
    Education: ["Education in progress", "Education completed"] as TornIconName[],
    Financial: [
      "Cashier's checks",
      "Investment in progress",
      "Investment completed",
      "Cayman islands bank",
      "Property vault",
      "Loan",
      "Item in auction",
      "Items in bazaar",
      "Items in item market",
      "Trade in progrsss",
      "Stocks owned",
      "Points market",
      "Dividend collection ready",
    ] as TornIconName[],
    "Booster Cooldowns": [
      "Booster cooldown (0-6hr)",
      "Booster cooldown (6-12hr)",
      "Booster cooldown (12-18hr)",
      "Booster cooldown (18-24hr)",
      "Booster cooldown (24hr)",
    ] as TornIconName[],
    "Medical Cooldowns": [
      "Medical cooldown (0-90m)",
      "Medical cooldown (90-180m)",
      "Medical cooldown (180-270m)",
      "Medical cooldown (270-360m)",
      "Medical cooldown (360m+)",
    ] as TornIconName[],
    "Drug Cooldowns": [
      "Drug cooldown (0-10m)",
      "Drug cooldown (10-60m)",
      "Drug cooldown (1-2hr)",
      "Drug cooldown (2-5hr)",
      "Drug cooldown (5hr+)",
    ] as TornIconName[],
    "Drug Addiction": [
      "Drug addiction (1-4%)",
      "Drug addiction (5-9%)",
      "Drug addiction (10-19%)",
      "Drug addiction (20-29%)",
      "Drug addiction (30%+)",
    ] as TornIconName[],
    "Radiation Sickness": [
      "Radiation sickness (1-17%)",
      "Radiation sickness (18-34%)",
      "Radiation sickness (35-50%)",
      "Radiation sickness (51-67%+)",
      "Radiation sickness (68%+)",
    ] as TornIconName[],
    "Territory War": ["Territory war (defending)", "Territory war (assaulting)"] as TornIconName[],
    "Organized Crime": ["Organized crime being pllaned", "Organized crime recruiting"] as TornIconName[],
    Upkeep: ["Upkeep due (4-6%)", "Upkeep due (6-8%)", "Upkeep due (8%+)"] as TornIconName[],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Torn Icons Reference</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(iconGroups).map(([category, icons]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">{category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {icons.map((name) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-background rounded">
                    <TornIcon name={name} size={20} />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-medium text-foreground line-clamp-2">{name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
