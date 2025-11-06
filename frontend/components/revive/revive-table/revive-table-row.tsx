import { ReviveCard } from "@/components/revive-card"
import type { Revive } from "@/lib/types"

interface Props {
  revive: Revive
  skillGain: number | null
  isSelected: boolean
  onClick: () => void
}

export function ReviveTableRow({
  revive,
  skillGain,
  isSelected,
  onClick,
}: Props) {
  return (
    <ReviveCard
      revive={revive}
      skillGain={skillGain}
      isSelected={isSelected}
      onClick={onClick}
    />
  )
}