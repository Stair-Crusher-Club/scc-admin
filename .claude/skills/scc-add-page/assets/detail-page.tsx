"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Contents } from "@/components/layout/Contents"
import { TextInput } from "@reactleaf/input"
import { api } from "@/lib/apis/api"
// TODO: Import your query hook
// import { useFeature } from "./query"

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

export default function FeatureDetail() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  // TODO: Replace with your actual query hook
  // const { data, isLoading } = useFeature({ id })
  const data = null

  const form = useForm<FormValues>({ defaultValues })
  const [editMode, setEditMode] = useState(false)

  // Sync form with fetched data
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
      })
    }
  }, [data])

  async function onSubmit(values: FormValues) {
    try {
      // TODO: Replace with your actual API call
      // await api.default.updateFeature(id, values)

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ["@features"] })
      await queryClient.invalidateQueries({ queryKey: ["@feature", id] })

      toast.success("Updated successfully")
      setEditMode(false)
    } catch (error) {
      console.error("Update failed:", error)
      toast.error("Update failed")
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      // TODO: Replace with your actual API call
      // await api.default.deleteFeature(id)

      await queryClient.invalidateQueries({ queryKey: ["@features"] })

      toast.success("Deleted successfully")
      router.push("/feature") // TODO: Update path
    } catch (error) {
      console.error("Delete failed:", error)
      toast.error("Delete failed")
    }
  }

  // TODO: Add loading state
  // if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  return (
    <Contents.Normal>
      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            {...form.register("name")}
            label="Name"
            disabled={!editMode}
          />
          {/* TODO: Add more form fields */}

          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button type="submit">Save</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false)
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button type="button" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </form>
      </Card>
    </Contents.Normal>
  )
}
