# SCC Admin Page Patterns Reference

This document provides detailed patterns and conventions for pages in the SCC Admin project.

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Route Groups](#route-groups)
3. [Page Types](#page-types)
4. [Data Fetching Patterns](#data-fetching-patterns)
5. [Form Patterns](#form-patterns)
6. [Styling Conventions](#styling-conventions)
7. [Navigation Integration](#navigation-integration)

## Directory Structure

Pages follow Next.js 14 App Router conventions:

```
app/
├── (private)/              # Authenticated routes
│   ├── layout.tsx         # Layout with auth check & sidebar
│   ├── [feature]/         # Feature directory
│   │   ├── page.tsx      # List or main page
│   │   ├── query.ts      # React Query hooks
│   │   ├── [id]/         # Dynamic detail page
│   │   │   └── page.tsx
│   │   └── create/       # Create page
│   │       └── page.tsx
└── (public)/              # Public routes (login, guides)
    └── layout.tsx         # Minimal layout
```

## Route Groups

### Private Routes: `app/(private)/[feature]/`

**Characteristics:**
- Requires authentication (checked in layout.tsx)
- Includes sidebar navigation
- Uses `Contents.Normal` or `Contents.Columns` wrapper
- Token stored in localStorage

**Layout Reference:** `/Users/sanggggg/Project/scc-admin/app/(private)/layout.tsx`

### Public Routes: `app/(public)/[feature]/`

**Characteristics:**
- No authentication required
- Minimal layout without sidebar
- Used for login, public guides, etc.

**Layout Reference:** `/Users/sanggggg/Project/scc-admin/app/(public)/layout.tsx`

## Page Types

### 1. List Page with Pagination

**Example:** `app/(private)/accessibility/page.tsx`

**Structure:**
```typescript
"use client"

export default function FeatureList() {
  // Form for filters
  const form = useForm<SearchPayload>()
  const [formInput, setFormInput] = useState<SearchPayload>()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Infinite query for pagination
  const { data, fetchNextPage, hasNextPage } = useFeatureList(formInput)

  return (
    <Contents.Normal>
      {/* Filter Card */}
      <Card>
        <form onSubmit={form.handleSubmit(setFormInput)}>
          {/* Filter inputs */}
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {/* Data Table Card */}
      <Card>
        <DataTable
          columns={columns}
          data={data?.pages.flatMap(p => p.items) ?? []}
          onLoadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          renderExpandedRow={(row) => <DetailComponent data={row} />}
        />
      </Card>
    </Contents.Normal>
  )
}
```

**Key Components:**
- `useForm` from react-hook-form for filters
- `useInfiniteQuery` from React Query for pagination
- `DataTable` with column filtering
- Optional `renderExpandedRow` for inline details

### 2. Detail Page with Edit Mode

**Example:** `app/(private)/challenge/[id]/page.tsx`

**Structure:**
```typescript
"use client"

export default function FeatureDetail() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  // Fetch data
  const { data } = useFeature({ id })

  // Form state
  const form = useForm<FormValues>({ defaultValues })
  const [editMode, setEditMode] = useState(false)

  // Sync form with data
  useEffect(() => {
    if (data) {
      form.reset({ ...data })
    }
  }, [data])

  // Update handler
  async function onSubmit(values: FormValues) {
    try {
      await api.updateFeature(id, values)
      await queryClient.invalidateQueries({ queryKey: ["@features"] })
      toast.success("Updated successfully")
      setEditMode(false)
    } catch (error) {
      toast.error("Update failed")
    }
  }

  // Delete handler
  async function handleDelete() {
    if (!window.confirm("Are you sure?")) return

    try {
      await api.deleteFeature(id)
      await queryClient.invalidateQueries({ queryKey: ["@features"] })
      toast.success("Deleted successfully")
      router.push("/feature")
    } catch (error) {
      toast.error("Delete failed")
    }
  }

  return (
    <Contents.Normal>
      <Card>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Form fields */}
          <div>
            {editMode ? (
              <>
                <Button type="submit">Save</Button>
                <Button onClick={() => setEditMode(false)}>Cancel</Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditMode(true)}>Edit</Button>
                <Button onClick={handleDelete}>Delete</Button>
              </>
            )}
          </div>
        </form>
      </Card>
    </Contents.Normal>
  )
}
```

**Key Patterns:**
- `useParams` to get route parameters
- `useEffect` to sync form with fetched data
- Toggle between view/edit modes
- Confirmation dialog for destructive actions
- Query invalidation after mutations

### 3. Create Page

**Example:** `app/(private)/challenge/create/page.tsx`

**Structure:**
```typescript
"use client"

export default function FeatureCreate() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({ defaultValues })

  async function onSubmit(values: FormValues) {
    try {
      await api.createFeature(values)
      await queryClient.invalidateQueries({ queryKey: ["@features"] })
      toast.success("Created successfully")
      router.push("/feature")
    } catch (error) {
      toast.error("Create failed")
    }
  }

  return (
    <Contents.Normal>
      <Card>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Form fields */}
          <Button type="submit">Create</Button>
          <Button onClick={() => router.push("/feature")}>Cancel</Button>
        </form>
      </Card>
    </Contents.Normal>
  )
}
```

**Key Patterns:**
- Default values for new entries
- Navigate to list page after creation
- Query invalidation to refresh list

## Data Fetching Patterns

### Query Hooks File: `query.ts`

Located in each feature directory (e.g., `app/(private)/quest/query.ts`)

**Pattern for List with Infinite Scroll:**
```typescript
export function useFeatureList(params?: SearchParams) {
  return useInfiniteQuery({
    queryKey: ["@features", params],
    queryFn: ({ pageParam }) =>
      api.default.getFeatures(pageParam ?? undefined, "100", params)
        .then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: !!params, // Optional: only fetch when params provided
  })
}
```

**Pattern for Single Item:**
```typescript
export function useFeature({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@feature", id],
    queryFn: () => api.default.getFeature(id).then((res) => res.data),
  })
}
```

**Query Key Naming Convention:**
- Use `@` prefix: `["@features"]`, `["@feature", id]`
- Include parameters that affect the query: `["@features", searchParams]`

## Form Patterns

### Form with React Hook Form

**Type Definition:**
```typescript
interface FormValues {
  name: string
  startDate: Date
  status: "active" | "inactive"
  tags: string[]
}

export const defaultValues: Partial<FormValues> = {
  name: "",
  startDate: new Date(),
  status: "active",
  tags: [],
}
```

**Form Implementation:**
```typescript
const form = useForm<FormValues>({ defaultValues })

<FormProvider {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <TextInput name="name" label="Name" />
    <DateInput name="startDate" label="Start Date" />
    <SelectInput name="status" label="Status" options={statusOptions} />
    <Button type="submit">Submit</Button>
  </form>
</FormProvider>
```

**Custom Input Components:**
- From `@reactleaf/input` package
- Integrate with React Hook Form
- Located in `app/components/` directory

## Styling Conventions

### Layout Wrappers

**Contents.Normal:**
```typescript
<Contents.Normal>
  {/* Page content with padding */}
</Contents.Normal>
```
- Default padding: p-8
- Max width constraints
- Vertical spacing between cards

**Contents.Columns:**
```typescript
<Contents.Columns>
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</Contents.Columns>
```
- Two-column flex layout
- Used for side-by-side content

### Card Component

```typescript
<Card>
  {/* Card content */}
</Card>
```
- Standard container for sections
- Built-in padding and borders
- Responsive spacing

### Panda CSS Styling

**Inline Styles:**
```typescript
import { css } from "@/styles/css"

<div className={css({ p: "4", bg: "white" })} />
```

**Style Files:**
```typescript
// feature.style.ts
import { styled } from "@/styles/jsx"

export const Container = styled("div", {
  base: {
    padding: "1rem",
    borderRadius: "0.5rem",
  },
})
```

## Navigation Integration

### Adding to Menu

**File:** `app/constants/menu.ts`

```typescript
import { Icon } from "lucide-react"

export const menuItems: MenuItem[] = [
  // ... existing items
  {
    title: "Feature Name",
    url: "/feature",
    icon: Icon,
  },
]
```

**Common Icons:**
- `MapPin`, `ClipboardList`, `Users`, `Settings`
- From `lucide-react` package

### Link Components

**Internal Navigation:**
```typescript
import Link from "next/link"

<Link href="/feature/123">View Details</Link>
```

**Programmatic Navigation:**
```typescript
import { useRouter } from "next/navigation"

const router = useRouter()
router.push("/feature")
router.back()
```

## API Integration

### Using Generated API Client

**Import:**
```typescript
import { api } from "@/lib/apis/api"
```

**Common Patterns:**
```typescript
// GET request
const data = await api.default.getFeatures().then(res => res.data)

// POST request
await api.default.createFeature({ name: "Example" })

// PUT request
await api.default.updateFeature(id, { name: "Updated" })

// DELETE request
await api.default.deleteFeature(id)
```

### Error Handling

**Global Handler:** Configured in `app/components/layout/Providers.tsx`
- 401 errors: Auto-redirect to login
- Other errors: Toast notification

**Local Handler:**
```typescript
try {
  await api.default.someOperation()
  toast.success("Success message")
} catch (error) {
  toast.error("Error message")
  console.error(error)
}
```

## Common Utilities

### Toast Notifications

```typescript
import { toast } from "react-toastify"

toast.success("Operation successful")
toast.error("Operation failed")
toast.info("Information message")
```

### Confirmation Dialogs

```typescript
if (!window.confirm("Are you sure you want to delete this?")) {
  return
}
// Proceed with deletion
```

### Query Invalidation

```typescript
import { useQueryClient } from "@tanstack/react-query"

const queryClient = useQueryClient()

// Invalidate specific query
await queryClient.invalidateQueries({ queryKey: ["@features"] })

// Invalidate all queries with prefix
await queryClient.invalidateQueries({ queryKey: ["@features"] })
```
