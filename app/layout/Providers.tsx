"use client"

import { ModalProvider } from "@reactleaf/modal"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { ToastContainer } from "react-toastify"

import SafeHydration from "@/lib/components/SafeHydration"

import register from "@/modals/register"

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
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
