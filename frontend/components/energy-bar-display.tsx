"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Zap, Settings, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getReviveCost, setReviveCost } from "@/lib/storage"
import type { Bar } from "@/lib/types"

interface EnergyBarDisplayProps {
  energyBar: Bar
}

const ENERGY_SOURCES = {
  natural: { name: "Natural E with regen", energy: 720, cost: Math.round((720 / 25) * 2_203_257) },
  xanax: { name: "3 Xanax (250 × 3)", energy: 750, cost: 3 * 829_447 }, // 3 xanax at 829,447 each
  refill: { name: "Refill", energy: 150, cost: 30 * 30_000 }, // 30 points at 30,000 per point
  fhc: { name: "FHC", energy: 150, cost: 13_567_036 },
}

const formatNumber = (num: number) => {
  return num.toLocaleString("en-US")
}

export function EnergyBarDisplay({ energyBar }: EnergyBarDisplayProps) {
  const [reviveCost, setReviveCostState] = useState(25)
  const [tempCost, setTempCost] = useState("25")
  const [open, setOpen] = useState(false)
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  useEffect(() => {
    const storedCost = getReviveCost()
    setReviveCostState(storedCost)
    setTempCost(storedCost.toString())
  }, [])

  const possibleRevives = Math.floor(energyBar.current / reviveCost)
  const percentage = (energyBar.current / energyBar.maximum) * 100

  const intervalMinutes = Math.floor(energyBar.interval / 60)

  const handleSaveCost = () => {
    const cost = Number.parseInt(tempCost, 10)
    if (cost >= 25 && cost <= 75) {
      setReviveCost(cost)
      setReviveCostState(cost)
      setOpen(false)
    }
  }

  const calculateRevives = (energy: number) => Math.floor(energy / reviveCost)

  const calculateCostPerRevive = (totalCost: number, revives: number) => {
    if (revives === 0 || totalCost === 0) return 0
    return Math.round(totalCost / revives)
  }

  const totalDailyEnergy = Object.values(ENERGY_SOURCES).reduce((sum, source) => sum + source.energy, 0)
  const totalDailyRevives = calculateRevives(totalDailyEnergy)
  const totalDailyCost = Object.values(ENERGY_SOURCES).reduce((sum, source) => sum + source.cost, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-5 py-4">
        <Zap className="h-7 w-7 text-yellow-500" />

        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className="flex flex-col gap-2 min-w-[140px] cursor-default">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Energy</span>
                  <span className="font-semibold">
                    {energyBar.current}/{energyBar.maximum}
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  style={{ "--progress-color": "oklch(0.70 0.20 145)" } as React.CSSProperties}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="end">
              <p>
                Energy increased by {energyBar.increment} every {intervalMinutes} minute
                {intervalMinutes !== 1 ? "s" : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-2 text-base border-l border-border pl-4">
          <span className="text-muted-foreground">Revives:</span>
          <span className="font-semibold text-green-500">{possibleRevives}</span>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Revive Cost Settings</DialogTitle>
              <DialogDescription>Set the energy cost per revive (25-75)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="revive-cost">Energy per Revive</Label>
                <Input
                  id="revive-cost"
                  type="number"
                  min="25"
                  max="75"
                  value={tempCost}
                  onChange={(e) => setTempCost(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Current setting: {reviveCost} energy per revive</p>
              </div>
              <Button onClick={handleSaveCost} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg px-5 py-4">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Daily Energy Sources (Donator)</h3>
        <div className="space-y-2">
          {Object.entries(ENERGY_SOURCES).map(([key, source]) => {
            const revives = calculateRevives(source.energy)
            const costPerRevive = calculateCostPerRevive(source.cost, revives)
            return (
              <Popover key={key} open={openPopover === key} onOpenChange={(open) => setOpenPopover(open ? key : null)}>
                <PopoverTrigger asChild>
                  <div className="flex items-center justify-between text-sm gap-2 lg:cursor-default cursor-pointer lg:hover:bg-transparent hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors">
                    <span className="text-muted-foreground min-w-0 flex-shrink truncate">{source.name}</span>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <span className="font-medium w-[50px] sm:w-[60px] text-right">{source.energy} E</span>
                      <span className="text-green-500 font-semibold w-[60px] sm:w-[90px] text-right text-xs sm:text-sm">
                        {revives} rev{revives !== 1 ? "s" : ""}
                      </span>
                      <Info className="h-4 w-4 text-muted-foreground lg:hidden" />
                      <span className="text-muted-foreground w-[80px] text-right hidden md:inline">
                        {source.cost === 0 ? "Free" : `$${formatNumber(source.cost)}`}
                      </span>
                      <span className="text-amber-500 font-medium w-[90px] text-right hidden lg:inline">
                        {costPerRevive === 0 ? "Free" : `$${formatNumber(costPerRevive)}/rev`}
                      </span>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64 lg:hidden" side="top">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{source.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-medium">
                          {source.cost === 0 ? "Free" : `$${formatNumber(source.cost)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost per Revive:</span>
                        <span className="font-medium text-amber-500">
                          {costPerRevive === 0 ? "Free" : `$${formatNumber(costPerRevive)}/rev`}
                        </span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )
          })}
          <Popover open={openPopover === "total"} onOpenChange={(open) => setOpenPopover(open ? "total" : null)}>
            <PopoverTrigger asChild>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border mt-2 gap-2 lg:cursor-default cursor-pointer lg:hover:bg-transparent hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors">
                <span className="font-semibold min-w-0 flex-shrink truncate">Total per Day</span>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <span className="font-bold w-[50px] sm:w-[60px] text-right">{totalDailyEnergy} E</span>
                  <span className="text-green-500 font-bold w-[60px] sm:w-[90px] text-right text-xs sm:text-sm">
                    {totalDailyRevives} rev{totalDailyRevives !== 1 ? "s" : ""}
                  </span>
                  <Info className="h-4 w-4 text-muted-foreground lg:hidden" />
                  <span className="text-muted-foreground font-bold w-[80px] text-right hidden md:inline">
                    ${formatNumber(totalDailyCost)}
                  </span>
                  <span className="text-amber-500 font-bold w-[90px] text-right hidden lg:inline">
                    ${formatNumber(calculateCostPerRevive(totalDailyCost, totalDailyRevives))}/rev
                  </span>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 lg:hidden" side="top">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Total Daily Cost</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-bold">${formatNumber(totalDailyCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost per Revive:</span>
                    <span className="font-bold text-amber-500">
                      ${formatNumber(calculateCostPerRevive(totalDailyCost, totalDailyRevives))}/rev
                    </span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
