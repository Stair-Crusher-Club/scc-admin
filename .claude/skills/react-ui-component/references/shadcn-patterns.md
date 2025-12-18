# shadcn/ui Component Patterns

Common patterns for using shadcn/ui components in React applications.

## Form Components

### Basic Form with Input and Label

```tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function BasicForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
      <Button type="submit">Submit</Button>
    </div>
  )
}
```

### Form with Select

```tsx
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SelectForm() {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

### Form with Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function CheckboxForm() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  )
}
```

### Form with Textarea

```tsx
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function TextareaForm() {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" placeholder="Enter description" />
    </div>
  )
}
```

## Dialog/Modal Components

### Basic Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description goes here</DialogDescription>
        </DialogHeader>
        <div>
          {/* Dialog content */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Dialog with Form

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FormDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Item name" />
          </div>
          <Button type="submit">Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Controlled Dialog (with state)

```tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ControlledDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogHeader>
          <div>Content here</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

## Data Display Components

### Basic Table

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function BasicTable({ data }: { data: Array<{ id: string; name: string; email: string }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Card Component

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BasicCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  )
}
```

### Badge Component

```tsx
import { Badge } from "@/components/ui/badge"

export function BadgeExample() {
  return (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}
```

## Interactive Components

### Dropdown Menu

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function BasicDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
        <DropdownMenuItem>Item 2</DropdownMenuItem>
        <DropdownMenuItem>Item 3</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BasicTabs() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Tab 1 content</TabsContent>
      <TabsContent value="tab2">Tab 2 content</TabsContent>
    </Tabs>
  )
}
```

### Tooltip

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

export function BasicTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip content</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

## Common Patterns

### Loading State

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
```

### Toast Notifications

```tsx
"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function ToastExample() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Success",
          description: "Operation completed successfully",
        })
      }}
    >
      Show Toast
    </Button>
  )
}
```

### Scroll Area

```tsx
import { ScrollArea } from "@/components/ui/scroll-area"

export function ScrollAreaExample() {
  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      <div>Scrollable content here</div>
    </ScrollArea>
  )
}
```
