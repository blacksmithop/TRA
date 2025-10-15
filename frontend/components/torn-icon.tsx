import { getTornIcon, type TornIconName } from "../lib/torn-icons"
import TornSprite from "./torn-sprite"

interface TornIconProps {
  name: TornIconName
  className?: string
  size?: number
}

export function TornIcon({ name, className = "", size = 16 }: TornIconProps) {
  const icon = getTornIcon(name)

  console.log(`[v0] TornIcon rendering: ${name}, x: ${icon.x}, id: ${icon.id}`)

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
      }}
      title={icon.title}
      aria-label={icon.title}
    >
      <TornSprite
        style={{
          width: 1618 * (size / 16),
          height: size,
          marginLeft: -icon.x * (size / 16),
        }}
      />
    </div>
  )
}
