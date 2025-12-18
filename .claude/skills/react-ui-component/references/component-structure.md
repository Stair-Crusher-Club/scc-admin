# Component Structure Guidelines

This document describes the standard structure for React components in the project.

## Directory Structure

Components are organized in `app/components/` with two main categories:

1. **UI Components** (`app/components/ui/`): shadcn/ui components
2. **Shared Components** (`app/components/`): Custom reusable components

## Component Organization Patterns

### Pattern 1: Simple Component (Single File)

For simple components that don't need separate styles:

```
app/components/
└── ComponentName.tsx
```

Example:
```tsx
// app/components/ImageUploader.tsx
export function ImageUploader() {
  return <div>...</div>
}
```

### Pattern 2: Component with Panda CSS Styles

For components that use Panda CSS for styling:

```
app/components/
└── ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.style.ts
    └── index.ts
```

Example:
```tsx
// app/components/Checkbox/Checkbox.style.ts
import { css } from '@/styles/css'

export const checkboxStyle = css({
  display: 'flex',
  alignItems: 'center',
})

// app/components/Checkbox/Checkbox.tsx
import { checkboxStyle } from './Checkbox.style'

export function Checkbox() {
  return <div className={checkboxStyle}>...</div>
}

// app/components/Checkbox/index.ts
export { Checkbox } from './Checkbox'
```

### Pattern 3: Complex Component with Sub-components

For complex components with multiple sub-components:

```
app/components/
└── ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.style.ts
    ├── components/
    │   ├── SubComponent1.tsx
    │   ├── SubComponent2.tsx
    │   └── index.ts
    └── index.ts
```

Example:
```tsx
// app/components/Map/components/Circle.tsx
export function Circle() {
  return <div>...</div>
}

// app/components/Map/components/index.ts
export { Circle } from './Circle'
export { Polygon } from './Polygon'

// app/components/Map/Map.tsx
import { Circle, Polygon } from './components'

export function Map() {
  return <div><Circle /><Polygon /></div>
}

// app/components/Map/index.ts
export { Map } from './Map'
```

## Styling Approaches

The project uses both Panda CSS and Tailwind CSS:

### Tailwind CSS (Preferred for new components)

Use Tailwind utility classes directly in JSX:

```tsx
export function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Click me
    </button>
  )
}
```

### Panda CSS (For existing components)

Use Panda CSS for styled components:

```tsx
import { css } from '@/styles/css'

const buttonStyle = css({
  padding: '0.5rem 1rem',
  backgroundColor: 'blue.500',
  color: 'white',
  borderRadius: 'md',
  _hover: {
    backgroundColor: 'blue.600',
  },
})

export function Button() {
  return <button className={buttonStyle}>Click me</button>
}
```

## Client vs Server Components

### Server Components (Default)

By default, components are Server Components:

```tsx
// app/components/Header.tsx
export function Header() {
  return <header>...</header>
}
```

### Client Components

Use `"use client"` directive when component needs:
- React hooks (`useState`, `useEffect`, etc.)
- Event handlers
- Browser APIs

```tsx
"use client"

import { useState } from "react"

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## Import Aliases

The project uses these path aliases:

```tsx
import { Button } from "@/components/ui/button"  // UI components
import { api } from "@/lib/apis/api"              // API utilities
import { css } from "@/styles/css"                // Panda CSS
import { Header } from "@/components/layout/Header" // Layout components
```

## Best Practices

1. **Keep components focused**: Each component should have a single responsibility
2. **Use TypeScript**: Always define prop types
3. **Export from index.ts**: Use barrel exports for cleaner imports
4. **Prefer composition**: Build complex components from simple ones
5. **Follow naming conventions**: Use PascalCase for component names
6. **Use Tailwind for new components**: Unless there's a specific reason to use Panda CSS
7. **Add "use client" only when needed**: Keep components as Server Components by default
