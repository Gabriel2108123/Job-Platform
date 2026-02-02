# Frontend Component Guidelines

This document outlines the standards and best practices for creating components in the YokeConnect platform.

## Design Principles

- **Atomic Design**: Use small, reusable components (atoms) to build complex interfaces.
- **Tailwind CSS 4**: Utilize Tailwind's utility-first approach for styling.
- **Glassmorphism & Rich Aesthetics**: Aim for a premium feel with subtle gradients and focus states.

## Component Structure

Components should be located in `frontend/components` and follow this structure:

```tsx
import React from 'react';

interface MyComponentProps {
  // props
}

export const MyComponent: React.FC<MyComponentProps> = ({ ...props }) => {
  return (
    <div className="...">
      {/* component content */}
    </div>
  );
};
```

## State Management

- **Local State**: Use `useState` for UI-only state.
- **Server State**: Use **TanStack Query** (`useQuery`, `useMutation`) for all API-related data.
- **Context API**: Use only for global themes or auth-like state that truly spans the whole app.

## Data Fetching with TanStack Query

Example of fetching jobs:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => getJobs(filters),
});
```

## Form Handling

Use `react-hook-form` (if added) or consistent controlled inputs with standard validation feedback.
