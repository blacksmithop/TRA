"use client"

import { useState, useEffect } from "react"
import { Calculator } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { fetchReviveChance, fetchReviveStats } from "@/lib/api"
import type { ReviveChance, ReviveStats } from "@/lib/types"
import { SkillTipsTooltip } from "@/components/skill-tips-tooltip"

export function ReviveChanceCalculator() {
  const [open, setOpen] = useState(false)
  const [targetApiKey, setTargetApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReviveChance | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSkill, setCurrentSkill] = useState<number>(0)

  useEffect(() => {
    const loadSkill = async () => {
      try {
        const stats: ReviveStats = await fetchReviveStats()
        const reviveSkillStat = stats.personalstats.find((stat) => stat.name === "reviveskill")
        if (reviveSkillStat) {
          setCurrentSkill(reviveSkillStat.value)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch revive skill:", err)
      }
    }

    loadSkill()
  }, [])

  const handleCalculate = async () => {
    if (!targetApiKey.trim()) {
      setError("Please enter a target API key")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await fetchReviveChance(targetApiKey)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate revive chance")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when closing
      setTargetApiKey("")
      setResult(null)
      setError(null)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {currentSkill > 0 && <SkillTipsTooltip currentSkill={currentSkill} />}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="rounded-lg p-2 transition-all hover:bg-muted" aria-label="Revive Chance Calculator">
            <Calculator className="h-6 w-6 text-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revive Chance Calculator</DialogTitle>
            <DialogDescription>Calculate your chance of successfully reviving a target</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-api-key">Target API Key</Label>
              <Input
                id="target-api-key"
                type="password"
                placeholder="Enter target's API key"
                value={targetApiKey}
                onChange={(e) => setTargetApiKey(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                <a
                  href="https://www.torn.com/preferences.php#tab=api?step=addNewKey&user=revives&title=ReviveChanceCalculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-400"
                >
                  Give this url to target
                </a>{" "}
                to create an API key
              </p>
            </div>

            <Button onClick={handleCalculate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Calculating...
                </>
              ) : (
                "Calculate"
              )}
            </Button>

            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            {result && (
              <div className="space-y-3 rounded-lg border bg-card p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Target Score:</span>
                  <span className="text-lg font-semibold">{result.target_score.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revive Chance:</span>
                  <span className="text-lg font-semibold text-green-500">{result.revive_chance.toFixed(2)}%</span>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Credits:{" "}
              <a
                href="https://www.torn.com/forums.php#/p=threads&f=61&t=16219555&b=0&a=0rh=88&"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-400"
              >
                Pyrit
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
