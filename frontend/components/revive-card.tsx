import type { Revive } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { TornIcon } from "@/components/torn-icon"
import { Badge } from "@/components/ui/badge"

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

  const getStatusIcon = (status: string) => {
    if (status === "Online") return "Online"
    if (status === "Idle") return "Idle"
    return "Offline"
  }

  const getTornProfileUrl = (userId: number) => {
    return `https://www.torn.com/profiles.php?XID=${userId}`
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Reviver Section */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reviver</div>
            <div className="space-y-1">
              <div className="font-medium text-foreground">
                <a
                  href={getTornProfileUrl(revive.reviver.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  {revive.reviver.name}
                </a>{" "}
                <span className="text-muted-foreground">[{revive.reviver.id}]</span>
              </div>
              {revive.reviver.faction && (
                <div className="text-sm text-muted-foreground">{revive.reviver.faction.name}</div>
              )}
              {revive.reviver.skill !== null && (
                <div className="text-sm text-muted-foreground">Skill: {revive.reviver.skill.toFixed(2)}</div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-border" />

          {/* Target Section */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Target</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TornIcon name={getStatusIcon(revive.target.online_status)} size={16} />
                <span className="font-medium text-foreground">
                  <a
                    href={getTornProfileUrl(revive.target.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline"
                  >
                    {revive.target.name}
                  </a>{" "}
                  <span className="text-muted-foreground">[{revive.target.id}]</span>
                </span>
              </div>
              {revive.target.faction && (
                <div className="text-sm text-muted-foreground">{revive.target.faction.name}</div>
              )}
              <div className="text-sm text-muted-foreground">{revive.target.hospital_reason}</div>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
          <Badge variant={revive.result === "success" ? "default" : "destructive"} className="capitalize">
            {revive.result}
          </Badge>
          <span className="text-sm text-muted-foreground">{revive.success_chance.toFixed(2)}% chance</span>
          <span className="ml-auto text-xs text-muted-foreground">{formatDate(revive.timestamp)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
