import type { Revive } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Activity, Minus } from "lucide-react"

interface ReviveCardProps {
  revive: Revive
}

export function ReviveCard({ revive }: ReviveCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTornProfileUrl = (userId: number) => {
    return `https://www.torn.com/profiles.php?XID=${userId}`
  }

  const getTornFactionUrl = (factionId: number) => {
    return `https://www.torn.com/factions.php?step=profile&ID=${factionId}`
  }

  return (
    <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.5fr_0.8fr_0.8fr_1.2fr] gap-3 px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors border-b border-border/50">
      {/* Reviver */}
      <div className="truncate">
        <a
          href={getTornProfileUrl(revive.reviver.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline font-medium"
        >
          {revive.reviver.name}
        </a>
      </div>

      {/* Reviver Faction */}
      <div className="truncate text-muted-foreground">
        {revive.reviver.faction ? (
          <a
            href={getTornFactionUrl(revive.reviver.faction.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-foreground transition-colors"
          >
            {revive.reviver.faction.name}
          </a>
        ) : (
          "-"
        )}
      </div>

      {/* Skill */}
      <div className="text-muted-foreground">
        {revive.reviver.skill !== null ? revive.reviver.skill.toFixed(2) : "-"}
      </div>

      {/* Target */}
      <div className="truncate">
        <a
          href={getTornProfileUrl(revive.target.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline font-medium"
        >
          {revive.target.name}
        </a>
      </div>

      {/* Target Faction */}
      <div className="truncate text-muted-foreground">
        {revive.target.faction ? (
          <a
            href={getTornFactionUrl(revive.target.faction.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-foreground transition-colors"
          >
            {revive.target.faction.name}
          </a>
        ) : (
          "-"
        )}
      </div>

      {/* Hospitalized by */}
      <div className="truncate text-muted-foreground">{revive.target.hospital_reason}</div>

      {/* Success Chance */}
      <div className="text-muted-foreground font-medium">{revive.success_chance}%</div>

      {/* Outcome */}
      <div className="flex items-center gap-1.5">
        {revive.result === "success" ? (
          <>
            <Activity className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="capitalize text-xs border-green-500/50 text-green-500">
              Success
            </Badge>
          </>
        ) : (
          <>
            <Minus className="h-4 w-4 text-red-500" />
            <Badge variant="outline" className="capitalize text-xs border-red-500/50 text-red-500">
              Failure
            </Badge>
          </>
        )}
      </div>

      {/* Timestamp */}
      <div className="text-muted-foreground text-xs whitespace-nowrap">{formatDate(revive.timestamp)}</div>
    </div>
  )
}
