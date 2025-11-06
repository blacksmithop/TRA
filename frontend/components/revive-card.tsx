"use client"

import { useState } from "react"
import type { Revive } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Activity, Minus, TrendingUp, Shield, Pill, Briefcase } from "lucide-react"

interface ReviveCardProps {
  revive: Revive
  skillGain?: number | null
  isSelected?: boolean
  onClick?: () => void
}

export function ReviveCard({ revive, skillGain, isSelected = false, onClick }: ReviveCardProps) {
  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const getTornProfileUrl = (userId: number) => `https://www.torn.com/profiles.php?XID=${userId}`
  const getTornFactionUrl = (factionId: number) => `https://www.torn.com/factions.php?step=profile&ID=${factionId}`

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "PvP": return <Shield className="h-3 w-3" />
      case "OD": return <Pill className="h-3 w-3" />
      case "Crime": return <Briefcase className="h-3 w-3" />
      default: return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "PvP": return "bg-blue-500/10 text-blue-500 border-blue-500/30"
      case "OD": return "bg-purple-500/10 text-purple-500 border-purple-500/30"
      case "Crime": return "bg-orange-500/10 text-orange-500 border-orange-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "Low": return "bg-red-500/10 text-red-500 border-red-500/30"
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
      case "High": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
      case "Very High": return "bg-green-500/10 text-green-500 border-green-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div
      onClick={onClick}
      className={`grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.2fr_0.8fr_1fr_0.8fr_1.2fr] gap-3 px-2 sm:px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors border-b border-border/50 cursor-pointer ${isSelected ? "bg-accent/50" : ""}`}
    >
      <div className="truncate">
        <a href={getTornProfileUrl(revive.reviver.id)} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline font-medium">
          {revive.reviver.name || revive.reviver.id}
        </a>
      </div>

      <div className="truncate text-muted-foreground">
        {revive.reviver.faction ? (
          <a href={getTornFactionUrl(revive.reviver.faction.id)} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground transition-colors">
            {revive.reviver.faction.name}
          </a>
        ) : (
          "-"
        )}
      </div>

      <div className="text-muted-foreground flex items-center gap-1.5">
        {revive.reviver.skill != null ? (
          <>
            <span>{revive.reviver.skill.toFixed(2)}</span>
            {skillGain != null && skillGain > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-500 font-medium">
                <TrendingUp className="h-3 w-3" />
                +{skillGain.toFixed(2)}
              </span>
            )}
          </>
        ) : (
          "-"
        )}
      </div>

      <div className="truncate">
        <a href={getTornProfileUrl(revive.target.id)} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline font-medium">
          {revive.target.name || revive.target.id}
        </a>
      </div>

      <div className="truncate text-muted-foreground">
        {revive.target.faction ? (
          <a href={getTornFactionUrl(revive.target.faction.id)} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground transition-colors">
            {revive.target.faction.name}
          </a>
        ) : (
          "-"
        )}
      </div>

      <div className="truncate text-muted-foreground">{revive.target.hospital_reason}</div>

      <div className="flex items-center gap-1">
        {revive.Category && (
          <Badge variant="outline" className={`text-xs flex items-center gap-1 ${getCategoryColor(revive.Category)}`}>
            {getCategoryIcon(revive.Category)}
            {revive.Category}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1">
        {revive.Likelihood && (
          <Badge variant="outline" className={`text-xs ${getLikelihoodColor(revive.Likelihood)}`}>
            {revive.Likelihood}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {revive.result === "success" ? (
          <>
            <Activity className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="capitalize text-xs border-green-500/50 text-green-500">Success</Badge>
          </>
        ) : (
          <>
            <Minus className="h-4 w-4 text-red-500" />
            <Badge variant="outline" className="capitalize text-xs border-red-500/50 text-red-500">Failure</Badge>
          </>
        )}
      </div>

      <div className="text-muted-foreground text-xs whitespace-nowrap">{formatDate(revive.timestamp)}</div>
    </div>
  )
}

interface ReviveListProps {
  revives: Revive[]
}

export function ReviveList({ revives }: ReviveListProps) {
  return (
    <div className="space-y-0 border rounded-md">
      {revives.map((revive, index) => (
        <ReviveCard
          key={`${revive.timestamp}-${index}`}
          revive={revive}
        />
      ))}
      {revives.length === 0 && (
        <div className="px-4 py-8 text-center text-muted-foreground">No revives found.</div>
      )}
    </div>
  )
}