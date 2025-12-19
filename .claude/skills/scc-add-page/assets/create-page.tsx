"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Contents } from "@/components/layout/Contents"
import { TextInput } from "@reactleaf/input"
import { api } from "@/lib/apis/api"

// TODO: Define your form values type
interface FormValues {
  name: string
  // Add other fields
}

// TODO: Define default values
export const defaultValues: Partial<FormValues> = {
  name: "",
  // Add other defaults
}

export default function FeatureCreate() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({ defaultValues })

  async function onSubmit(values: FormValues) {
    try {
      // TODO: Replace with your actual API call
      // await api.default.createFeature(values)

      // Invalidate queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["@features"] })

      toast.success("Created successfully")
      router.push("/feature") // TODO: Update path
    } catch (error) {
      console.error("Create failed:", error)
      toast.error("Create failed")
    }
  }

  return (
    <Contents.Normal>
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Feature</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            {...form.register("name")}
            label="Name"
            placeholder="Enter name"
          />
          {/* TODO: Add more form fields */}

          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/feature")} // TODO: Update path
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </Contents.Normal>
  )
}
