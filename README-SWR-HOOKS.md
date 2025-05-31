# SWR-Based Hooks for Data Fetching

This document explains the new SWR-based hooks that have been implemented to improve data fetching,
caching, and state management in the application.

## Overview

We've implemented several SWR-based hooks to reduce API calls, improve performance, and provide a
better user experience. These hooks use the [SWR](https://swr.vercel.app/) library for data
fetching, which provides features like:

- Automatic caching
- Deduplication of requests
- Revalidation on focus
- Error handling
- Optimistic UI updates

## Implemented Hooks

### 1. `useBuyerActivitiesWithSWR`

This hook fetches and manages buyer activities with efficient caching and pagination.

```tsx
const {
  activities,
  loading,
  error,
  pagination,
  refetch,
  loadMore,
  getActivity,
  updateActivity,
  deleteActivity,
  createActivity,
} = useBuyerActivitiesWithSWR(initialFilters);
```

**Features:**

- Caches activity data to reduce API calls
- Supports pagination with `loadMore` function
- Provides CRUD operations for activities
- Handles loading and error states

### 2. `useBuyerDetailsWithSWR`

This hook fetches and manages buyer profile details with caching.

```tsx
const { buyer, loading, error, updateBuyerDetails, refreshBuyerDetails } = useBuyerDetailsWithSWR();
```

**Features:**

- Caches buyer profile data to reduce API calls
- Provides update functionality for buyer details
- Handles loading and error states
- Integrates with authentication context

### 3. `useSellerThemeWithSWR`

This hook fetches and manages seller theme data with caching.

```tsx
const { theme, loading, error, updateTheme, refreshTheme } = useSellerThemeWithSWR();
```

**Features:**

- Caches theme data to reduce API calls
- Provides update functionality for theme customization
- Handles loading and error states
- Falls back to default theme when needed

## Implementation Details

### Data Flow

1. The hooks fetch data from the API endpoints
2. Data is cached in memory using SWR
3. Components subscribe to the cached data
4. When data changes (via mutations), the cache is updated
5. Components re-render with the updated data

### Optimistic Updates

For better UX, the hooks implement optimistic updates:

1. When a mutation is performed (create, update, delete), the local state is updated immediately
2. The API request is sent in the background
3. If the request succeeds, the cache is validated
4. If the request fails, the optimistic update is rolled back

## Usage Guidelines

### When to Use These Hooks

- Use these hooks in components that need to display or modify data
- Prefer these hooks over direct API calls or context-only solutions
- Use the provided mutation functions instead of making direct API calls

### Best Practices

1. **Avoid Prop Drilling**: Components should fetch their own data using these hooks rather than
   receiving it through deep prop chains
2. **Local State Management**: Use the `localBuyer` pattern to combine SWR data with local state
3. **Refresh on Important Events**: Call the refresh functions after important user actions
4. **Error Handling**: Always check the error state and display appropriate messages

## Example: Profile Update Flow

```tsx
// In a component
const { buyer, updateBuyerDetails } = useBuyerDetailsWithSWR();

const handleProfileUpdate = async (formData) => {
  try {
    const success = await updateBuyerDetails(formData);
    if (success) {
      // Show success message
    } else {
      // Show error message
    }
  } catch (error) {
    // Handle error
  }
};
```

## Benefits

- **Reduced API Calls**: Duplicate requests are eliminated
- **Improved Performance**: Data is cached and reused
- **Better UX**: Optimistic updates make the UI feel faster
- **Consistent State**: Single source of truth for data
- **Simplified Components**: Components don't need to manage complex data fetching logic
