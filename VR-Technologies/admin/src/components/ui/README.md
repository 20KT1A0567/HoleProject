# VR Technologies Admin Panel - Component Library

## Overview

The admin panel has been enhanced with a comprehensive UI component library using **Material-UI**, **shadcn/ui**, **TailwindCSS v4**, and **Radix UI** primitives. All components follow a consistent dark theme with emerald green accent colors.

## Installation

All dependencies are already installed:
```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @radix-ui/react-dropdown-menu @radix-ui/react-slot @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge
```

## Component Categories

### 1. Data Display Components

#### `Card`
Container with glassmorphism effect and hover animations.
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
</Card>
```

#### `StatCard`
Statistics card with icon, value, and trend indicator.
```tsx
import { StatCard } from '@/components/ui';
import { ShoppingBag } from 'lucide-react';

<StatCard
  title="Total Orders"
  value="1,234"
  icon={ShoppingBag}
  trend={{ value: 12, isPositive: true }}
  variant="emerald"
/>
```

#### `Badge`
Status badges with variants: default, success, warning, destructive, info, secondary.
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Cancelled</Badge>
```

#### `Avatar`
User avatar with fallback initials.
```tsx
<Avatar src={user.avatar} fallback="JD" size="md" />
```

### 2. Data Table Components

#### `DataTable`
Sortable, searchable table with loading states and custom cell renderers.
```tsx
import { DataTable, Column } from '@/components/ui';

const columns: Column<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  {
    key: 'actions',
    header: 'Actions',
    cell: (user) => <Button>Edit</Button>,
  },
];

<DataTable columns={columns} data={users} loading={loading} />
```

#### `Pagination`
Full-featured pagination with first/last buttons and page numbers.
```tsx
<Pagination currentPage={1} totalPages={10} onPageChange={(page) => setPage(page)} />
```

### 3. Form Components

#### `Input`
Styled input with icons, error states, and focus animations.
```tsx
<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text..."
  error={error}
/>
```

#### `Textarea`
Multi-line text input with consistent styling.
```tsx
<Textarea rows={4} placeholder="Describe..." />
```

#### `Select`
Dropdown select with custom styling.
```tsx
<Select
  value={value}
  onChange={(e) => setValue(e.target.value)}
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ]}
/>
```

#### `Checkbox`
Custom checkbox with animated checkmark.
```tsx
<Checkbox checked={checked} onCheckedChange={setChecked} />
```

#### `Switch`
Toggle switch component.
```tsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

#### `Label`
Form label component.
```tsx
<Label htmlFor="email">Email Address</Label>
```

### 4. Feedback Components

#### `Dialog`
Modal dialog with backdrop blur and animations.
```tsx
<Dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
>
  <Button onClick={handleConfirm}>Confirm</Button>
</Dialog>
```

#### `Alert`
Alert banners for info, success, warning, and error states.
```tsx
<Alert variant="success">
  Your changes have been saved successfully!
</Alert>
```

#### `Toast`
Toast notifications using react-hot-toast with custom styling.
```tsx
import toast from 'react-hot-toast';

toast.success('Operation completed!');
toast.error('Something went wrong');
toast.loading('Processing...');
```

### 5. Utility Components

#### `Progress`
Progress bar with variants.
```tsx
<Progress value={65} variant="emerald" showLabel />
```

#### `Skeleton`
Loading skeleton placeholders.
```tsx
<Skeleton className="h-4 w-full" />
<TableRowSkeleton columns={5} />
<CardSkeleton />
```

#### `Tooltip`
Hover tooltips using Radix UI.
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 6. Enhanced Pages

#### Updated Pages
- **DashboardPage** - Stats cards with trends, enhanced charts, modern card layout
- **ProductsPage** - DataTable with filters, stats cards, bulk actions
- **ProductFormPage** - Form sections with validation, live preview sidebar
- **OrdersPage** - Sortable table, status filter, stats dashboard
- **CategoriesPage** - Grid layout with modals, status badges
- **BrandsPage** - Brand cards with logos, edit modals
- **CustomersPage** - Avatar support, contact info display
- **StoresPage** - Store cards with images, stats overview

## Design System

### Colors
```
Primary: emerald-400, emerald-500, emerald-600
Background: slate-950 → slate-900
Surface: slate-900/50, slate-800/30
Border: white/10, white/5
Text: white, slate-200, slate-400
```

### Typography
- Font: Inter system font stack
- Heading: font-black/800 tracking-tight
- Body: font-medium/regular
- Small: text-xs, text-slate-400

### Spacing
- Padding: p-4, p-5, p-6
- Gap: gap-2, gap-3, gap-4, gap-6
- Radius: rounded-xl (12px), rounded-2xl (16px)

### Effects
- Glassmorphism: `bg-slate-900/50 backdrop-blur-xl`
- Gradient: `from-emerald-500/20 to-transparent`
- Glow: `shadow-[0_8px_24px_rgba(16,185,129,0.3)]`
- Hover: `hover:scale-[1.02] hover:border-emerald-500/30`

## CSS Variables

Added CSS custom properties in `index.css` for consistent theming:
```css
--color-slate-50: #f8fafc;
--color-emerald-500: #10b981;
--radius-xl: 0.75rem;
--radius-2xl: 1rem;
```

## Usage Examples

### Creating a New Page
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';

export default function NewPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Page</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Page content here</p>
        <Button>Action</Button>
      </CardContent>
    </Card>
  );
}
```

### Data Table with Server-side Pagination
```tsx
const [page, setPage] = useState(1);
const [data, setData] = useState([]);

useEffect(() => {
  fetchData(page).then(setData);
}, [page]);

<DataTable
  columns={columns}
  data={data}
  footer={
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  }
/>
```

## Migration Notes

- Old `.admin-panel`, `.admin-section`, `.admin-action-primary` classes still work for backward compatibility
- New components use standard Tailwind utilities and CSS variables
- Can gradually migrate old pages to new component system
- All new components support dark mode by default

## Browser Support

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Uses CSS features that require modern browsers (CSS Grid, Flexbox, backdrop-filter)

## Performance

- Components are optimized with `React.memo` where applicable
- DataTable uses `useMemo` for sorting
- Skeleton loaders for perceived performance
- Lazy loading can be added with `React.lazy` for route-based code splitting
