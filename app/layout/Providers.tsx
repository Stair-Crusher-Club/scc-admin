"use client"

import { ModalProvider } from "@reactleaf/modal"
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { ToastContainer } from "react-toastify"

import SafeHydration from "@/lib/components/SafeHydration"
import { NetworkError } from "@/lib/http"
import { storage } from "@/lib/storage"

import register from "@/modals/register"

const queryCache = new QueryCache({
  onError: (error) => {
    console.error("Query error:", error)
    if (error instanceof NetworkError) {
      if (error.response.status === 401) {
        storage.remove("token")
        window.location.href = "/account/login"
      }
    }
  },
})

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache,
        defaultOptions: {
          queries: {
            retry(failureCount, error) {
              if (error instanceof NetworkError) {
                if (error.response.status === 401) return false
                if (error.response.status === 404) return false
              }
              if (failureCount < 2) return true
              else return false
            },
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider register={register}>
        <SafeHydration>{children}</SafeHydration>
        <ToastContainer />
      </ModalProvider>
    </QueryClientProvider>
  )
}
