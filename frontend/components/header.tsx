"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { removeApiKey } from "@/lib/storage"
import { getLogoUrl } from "@/lib/api"
import { Heart } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    removeApiKey()
    router.push("/login")
  }

  const isLoginPage = pathname === "/login"

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-1" />

          <Link href="/" className="flex items-center gap-3">
            <Image
              src={getLogoUrl() || "/placeholder.svg"}
              alt="Torn Revive App Logo"
              width={62}
              height={62}
              unoptimized
            />
            <h1 className="text-3xl font-bold text-foreground">Torn Revive App</h1>
          </Link>

          <div className="flex flex-1 items-center justify-end">
            {!isLoginPage && (
              <button
                onClick={handleLogout}
                className="group relative rounded-lg p-2 transition-all hover:bg-muted"
                aria-label="Logout"
              >
                <div className="relative flex items-center justify-center w-16 h-8 overflow-hidden">
                  {/* Heart icon with scale pulse animation */}
                  <Heart
                    className="absolute h-8 w-8 fill-green-500 text-green-500 transition-all group-hover:fill-red-500 group-hover:text-red-500 group-hover:animate-none animate-[heartbeat_1.5s_ease-in-out_infinite]"
                    strokeWidth={2}
                  />

                  <svg
                    className="absolute inset-0 w-16 h-8 transition-opacity group-hover:opacity-0"
                    viewBox="0 0 64 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Repeating ECG waveform pattern */}
                    <path
                      d="M-32 16 L-28 16 L-26 16.5 L-24 15.5 L-22 16 L-20 16 L-18 12 L-16 24 L-14 16 L-12 16 L-8 16 L0 16 L2 16.5 L4 15.5 L6 16 L8 16 L10 12 L12 24 L14 16 L16 16 L20 16 L28 16 L30 16.5 L32 15.5 L34 16 L36 16 L38 12 L40 24 L42 16 L44 16 L48 16 L56 16 L58 16.5 L60 15.5 L62 16 L64 16 L66 12 L68 24 L70 16 L72 16 L76 16 L84 16 L86 16.5 L88 15.5 L90 16 L92 16 L94 12 L96 24"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-[ecgScroll_2s_linear_infinite]"
                    />
                  </svg>

                  {/* ECG flatline overlapping heart - hover state */}
                  <svg
                    className="absolute inset-0 w-16 h-8 opacity-0 transition-opacity group-hover:opacity-100"
                    viewBox="0 0 64 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 16 L64 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes ecgScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-32px);
          }
        }
      `}</style>
    </header>
  )
}
