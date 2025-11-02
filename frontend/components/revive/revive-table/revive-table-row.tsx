import { ReviveCard } from "@/components/revive-card"
import type { Revive } from "@/lib/types"

interface Props {
  revive: Revive
  showFullMode: boolean
  skillGain: number | null
  isSelected: boolean
  onClick: () => void
}

export function ReviveTableRow({
  revive,
  showFullMode,
  skillGain,
  isSelected,
  onClick,
}: Props) {
  return (
    <ReviveCard
      revive={revive}
      showFullMode={showFullMode}
      skillGain={skillGain}
      isSelected={isSelected}
      onClick={onClick}
    />
  )
}