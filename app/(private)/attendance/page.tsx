"use client"

import { useState } from "react"

import { Contents } from "@/components/layout"

function extractPageId(notionUrl: string): string | null {
  try {
    const cleaned = notionUrl.split("?")[0].split("#")[0]
    const match = cleaned.match(/([a-f0-9]{32})\s*$/)
    if (!match) {
      const uuidMatch = cleaned.match(
        /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\s*$/,
      )
      if (uuidMatch) return uuidMatch[1]
      return null
    }
    const hex = match[1]
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  } catch {
    return null
  }
}

export default function AttendanceAdminPage() {
  const [notionUrl, setNotionUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [fullUrl, setFullUrl] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isShortening, setIsShortening] = useState(false)

  const handleGenerate = async () => {
    setError("")
    setShortUrl("")
    setFullUrl("")
    setCopied(false)

    if (!notionUrl.trim()) {
      setError("Notion URL을 입력해주세요.")
      return
    }

    const pageId = extractPageId(notionUrl.trim())
    if (!pageId) {
      setError("올바른 Notion 페이지 URL이 아닙니다.")
      return
    }

    const origin =
      typeof window !== "undefined" ? window.location.origin : ""
    const originalUrl = `${origin}/attendance/${pageId}`
    setFullUrl(originalUrl)

    // Shorten via NHN Cloud (through scc-server)
    setIsShortening(true)
    try {
      const res = await fetch("/notion/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: originalUrl }),
      })
      if (res.ok) {
        const data = await res.json()
        setShortUrl(data.shortUrl)
      } else {
        // Fallback to full URL if shortening fails
        setShortUrl(originalUrl)
      }
    } catch {
      setShortUrl(originalUrl)
    } finally {
      setIsShortening(false)
    }
  }

  const displayUrl = shortUrl || fullUrl

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = displayUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate()
    }
  }

  return (
    <Contents.Normal>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          출석부 웹사이트 생성
        </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="notion-url"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Notion 페이지 URL
            </label>
            <input
              id="notion-url"
              type="url"
              value={notionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://www.notion.so/workspace/page-title-314c9499b0608080b1e5eff0c9a3796e"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isShortening}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
          >
            {isShortening ? "URL 생성 중..." : "URL 생성"}
          </button>

          {displayUrl && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-medium text-gray-600">
                공개 URL
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayUrl}
                  readOnly
                  className="flex-1 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                />
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>
              <a
                href={fullUrl || displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-blue-600 underline hover:text-blue-800"
              >
                새 탭에서 열기
              </a>
            </div>
          )}
        </div>
      </div>
    </Contents.Normal>
  )
}
