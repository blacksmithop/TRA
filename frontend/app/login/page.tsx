"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { setApiKey, hasApiKey } from "@/lib/storage"
import { getLogoUrl } from "@/lib/api"

export default function LoginPage() {
  const [apiKey, setApiKeyInput] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (hasApiKey()) {
      router.replace("/")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      setApiKey(apiKey.trim())
      router.replace("/")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Image
              src={getLogoUrl() || "/placeholder.svg"}
              alt="Torn Revive"
              width={64}
              height={64}
              unoptimized
              className="object-contain"
            />
            <h1 className="text-4xl font-bold text-foreground">Torn Revive</h1>
          </div>
          <p className="text-muted-foreground">Enter your Torn API key to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your Torn API key"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="text-center text-lg py-6"
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full py-6 text-lg" disabled={!apiKey.trim()}>
            Continue
          </Button>

          <div className="text-center space-y-3">
            <a
              href="https://www.torn.com/preferences.php#tab=api?step=addNewKey&user=basic,personalstats,bars,revives,revivesfull&title=TornReviveApp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline block"
            >
              Click here to generate a custom API Key
            </a>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Scope:</span>
              <Badge variant="secondary" className="rounded-full">
                basic
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                personalstats
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                revives
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                revivesfull
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                bars
              </Badge>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
