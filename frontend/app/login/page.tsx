"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden">
      <div className="w-full max-w-md space-y-8 px-4 py-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Login</h1>
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

          <div className="text-center space-y-4">
            <a
              href="https://www.torn.com/preferences.php#tab=api?step=addNewKey&user=basic,personalstats,bars,revives,revivesfull&title=TornReviveApp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline block"
            >
              Get your Custom API Key
            </a>
            
            <div className="space-y-3">
              <span className="text-sm font-medium text-foreground">API Scope:</span>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge className="rounded-full px-3 py-1.5 bg-gray-100 text-gray-800 border-2 border-gray-400 hover:bg-gray-600 hover:text-white hover:scale-105 transition-all duration-200">
                  Basic
                </Badge>
                <Badge className="rounded-full px-3 py-1.5 bg-green-100 text-green-800 border-2 border-green-400 hover:bg-green-600 hover:text-white hover:scale-105 transition-all duration-200">
                  Personal Stats
                </Badge>
                <Badge className="rounded-full px-3 py-1.5 bg-pink-100 text-pink-800 border-2 border-pink-400 hover:bg-pink-600 hover:text-white hover:scale-105 transition-all duration-200">
                  Revives (full)
                </Badge>
                <Badge className="rounded-full px-3 py-1.5 bg-blue-100 text-blue-800 border-2 border-blue-300 hover:bg-blue-600 hover:text-white hover:scale-105 transition-all duration-200">
                  Bars
                </Badge>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}