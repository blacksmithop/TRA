"use client"

import { useState, useEffect } from "react"
import type { Revive } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, Pill, Briefcase, DollarSign, Activity, Minus } from "lucide-react"

interface ReviveCardProps {
  revive: Revive
  skillGain?: number | null
  isSelected?: boolean
  onClick?: () => void
}

export function ReviveCard({ revive, skillGain, isSelected = false, onClick }: ReviveCardProps) {
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
      case "Low": return "bg-red-500/15 text-red-500"
      case "Medium": return "bg-yellow-500/15 text-yellow-500"
      case "High": return "bg-emerald-500/15 text-emerald-500"
      case "Very High": return "bg-green-500/15 text-green-500"
      default: return "bg-muted text-muted-foreground"
    }
  }

  // Payment state
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | null>(null)

  useEffect(() => {
    const key = `revive-payment-${revive.timestamp}`
    const saved = localStorage.getItem(key)
    if (saved === "paid" || saved === "unpaid") {
      setPaymentStatus(saved)
    }
  }, [revive.timestamp])

  const togglePayment = () => {
    const key = `revive-payment-${revive.timestamp}`
    const next = paymentStatus === "paid" ? "unpaid" : paymentStatus === "unpaid" ? null : "paid"
    setPaymentStatus(next)
    if (next) {
      localStorage.setItem(key, next)
    } else {
      localStorage.removeItem(key)
    }
  }

  const pct = revive.Chance != null ? `${Math.round(revive.Chance)}%` : "—"

  // Format timestamp: Today → 08:26 AM, Older → 11-11-2025 08:25 AM
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) + " " + date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  return (
    <div
      onClick={onClick}
      className={`grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.2fr_0.8fr_1fr_0.8fr_1.2fr_0.6fr] gap-3 px-2 sm:px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors border-b border-border/50 cursor-pointer ${isSelected ? "bg-accent/50" : ""}`}
    >
      {/* Reviver */}
      <div className="truncate">
        <a href={getTornProfileUrl(revive.reviver.id)} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline font-medium">
          {revive.reviver.name || revive.reviver.id}
        </a>
      </div>

      {/* Reviver Faction */}
      <div className="truncate text-muted-foreground">
        {revive.reviver.faction ? (
          <a href={getTornFactionUrl(revive.reviver.faction.id)} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground transition-colors">
            {revive.reviver.faction.name}
          </a>
        ) : (
          "-"
        )}
      </div>

      {/* Skill + Gain */}
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

      {/* Target */}
      <div className="truncate">
        <a href={getTornProfileUrl(revive.target.id)} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline font-medium">
          {revive.target.name || revive.target.id}
        </a>
      </div>

      {/* Target Faction */}
      <div className="truncate text-muted-foreground">
        {revive.target.faction ? (
          <a href={getTornFactionUrl(revive.target.faction.id)} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground transition-colors">
            {revive.target.faction.name}
          </a>
        ) : (
          "-"
        )}
      </div>

      {/* Hospitalized By */}
      <div className="truncate text-muted-foreground">{revive.target.hospital_reason}</div>

      {/* Category */}
      <div className="flex items-center gap-1">
        {revive.Category && (
          <Badge variant="outline" className={`text-xs flex items-center gap-1 ${getCategoryColor(revive.Category)}`}>
            {getCategoryIcon(revive.Category)}
            {revive.Category}
          </Badge>
        )}
      </div>

      {/* SUCCESS % */}
      <div className="flex justify-center">
        <div
          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLikelihoodColor(revive.Likelihood || "Low")}`}
        >
          {pct}
        </div>
      </div>

      {/* OUTCOME ICON – RESTORED */}
      <div className="flex justify-center items-center">
        {revive.result === "success" ? (
          <Activity className="h-4 w-4 text-green-500" />
        ) : (
          <Minus className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Timestamp – Condensed */}
      <div className="text-muted-foreground text-xs whitespace-nowrap">
        {formatTimestamp(revive.timestamp)}
      </div>

      {/* PAYMENT ICON – At End */}
      <div className="flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePayment()
          }}
          className="group"
          title={paymentStatus === "paid" ? "Paid" : paymentStatus === "unpaid" ? "Unpaid" : "Mark as paid/unpaid"}
        >
          <DollarSign
            className={`
              h-4 w-4 transition-all duration-200
              ${paymentStatus === "paid" ? "text-green-500 scale-110" : ""}
              ${paymentStatus === "unpaid" ? "text-red-500" : ""}
              ${paymentStatus === null ? "text-muted-foreground group-hover:text-foreground" : ""}
            `}
          />
        </button>
      </div>
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