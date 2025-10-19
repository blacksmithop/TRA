"use client"

import { HelpCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SkillTipsTooltipProps {
  currentSkill: number
}

export function SkillTipsTooltip({ currentSkill }: SkillTipsTooltipProps) {
  const getTipForSkillLevel = (skill: number): { title: string; description: string } => {
    if (skill >= 1 && skill < 20) {
      return {
        title: "Beginner (1-20)",
        description:
          "You should revive as many as you can, skill gains come fast at lower levels. Focus on reviving those with longer hospitalization times (Xanax OD, Crime injury) to maximise gain.",
      }
    } else if (skill >= 20 && skill < 50) {
      return {
        title: "Intermediate (20-50)",
        description:
          "Skill progression will slow down now. Focus on reviving non PVP related injuries with Xanax OD as first priority.",
      }
    } else if (skill >= 50 && skill < 90) {
      return {
        title: "Advanced (50-90)",
        description:
          "Longer hospitalization gives better skill gain but not guaranteed because of inherent randomness.",
      }
    } else {
      return {
        title: "Expert (90-100)",
        description: "Final stretch now, your gains will be 0.01 to 0.02 regardless, pump those numbers up.",
      }
    }
  }

  const tip = getTipForSkillLevel(currentSkill)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="rounded-full p-1 transition-all hover:bg-muted" aria-label="Revive skill tips">
          <HelpCircle className="h-6 w-6 text-white hover:text-foreground animate-pulse" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{tip.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Your current skill: <span className="font-semibold text-foreground">{currentSkill.toFixed(2)}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
