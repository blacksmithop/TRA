"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { setApiKey } from "@/lib/storage"

export default function LoginPage() {
  const [apiKey, setApiKeyInput] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      setApiKey(apiKey.trim())
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="text-5xl">⚕️</div>
            <h1 className="text-4xl font-bold text-foreground">Torn Revive</h1>
          </div>
          <p className="text-muted-foreground">Enter your Torn API key to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
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

          <div className="text-center">
            <a
              href="https://www.torn.com/preferences.php#tab=api?step=addNewKey&title=TornReviveApp&user=basic,revives"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Click here to generate a custom API Key
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
