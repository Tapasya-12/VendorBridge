# VendorBridge Animation System

This document describes the comprehensive animation system implemented in VendorBridge for providing visual feedback to users during various operations.

## Overview

The animation system provides four main categories of animations:
1. **Success Animations** - For successful operations
2. **Error Animations** - For failed operations
3. **Loading Animations** - For processing/pending states
4. **Status Animations** - For various status indicators

All animations are built using **Framer Motion** and are fully customizable.

---

## Installation & Setup

The animations are already integrated into the project. All animation components are located in:
```
artifacts/vendorbridge/src/components/ui/
├── success-animation.tsx
├── error-animation.tsx
├── loading-spinner.tsx
├── status-animation.tsx
└── animations.tsx (central export file)
```

---

## Components

### 1. Success Animations

#### `<SuccessAnimation />`
Displays animated success feedback with multiple variants.

**Props:**
- `size`: `"sm" | "md" | "lg" | "xl"` - Size of the animation (default: `"md"`)
- `className`: `string` - Additional CSS classes
- `text`: `string` - Optional text to display below the animation
- `variant`: `"checkmark" | "circle" | "bounce"` - Animation style (default: `"circle"`)

**Usage:**
```tsx
import { SuccessAnimation } from "@/components/ui/animations";

// Default circle variant
<SuccessAnimation size="md" text="Operation successful!" />

// Bounce variant (recommended for major actions)
<SuccessAnimation size="lg" text="RFQ Created!" variant="bounce" />

// Checkmark variant
<SuccessAnimation size="md" text="Saved" variant="checkmark" />
```

#### `<SuccessCheckmark />`
SVG-based checkmark animation for custom implementations.

**Usage:**
```tsx
import { SuccessCheckmark } from "@/components/ui/animations";

<SuccessCheckmark />
```

---

### 2. Error Animations

#### `<ErrorAnimation />`
Displays animated error feedback with multiple variants.

**Props:**
- `size`: `"sm" | "md" | "lg" | "xl"` - Size of the animation (default: `"md"`)
- `className`: `string` - Additional CSS classes
- `text`: `string` - Optional error message
- `variant`: `"x" | "circle" | "shake" | "alert"` - Animation style (default: `"circle"`)

**Usage:**
```tsx
import { ErrorAnimation } from "@/components/ui/animations";

// Default circle variant
<ErrorAnimation size="md" text="Operation failed" />

// Shake variant (attention-grabbing)
<ErrorAnimation size="lg" text="Submission Failed" variant="shake" />

// Alert variant
<ErrorAnimation size="md" text="Please try again" variant="alert" />
```

#### `<ErrorX />`
SVG-based X animation for custom implementations.

**Usage:**
```tsx
import { ErrorX } from "@/components/ui/animations";

<ErrorX />
```

---

### 3. Loading Animations

#### `<LoadingSpinner />`
Rotating spinner for loading states.

**Props:**
- `size`: `"sm" | "md" | "lg" | "xl"` - Size of the spinner (default: `"md"`)
- `className`: `string` - Additional CSS classes
- `text`: `string` - Optional loading message

**Usage:**
```tsx
import { LoadingSpinner } from "@/components/ui/animations";

// In buttons
<Button disabled={isLoading}>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      Processing...
    </span>
  ) : (
    "Submit"
  )}
</Button>

// Standalone
<LoadingSpinner size="lg" text="Loading data..." />
```

#### `<LoadingDots />`
Three animated dots for subtle loading indication.

**Usage:**
```tsx
import { LoadingDots } from "@/components/ui/animations";

<LoadingDots />
```

#### `<LoadingPulse />`
Pulsing circle animation.

**Usage:**
```tsx
import { LoadingPulse } from "@/components/ui/animations";

<LoadingPulse />
```

---

### 4. Status Animations

#### `<StatusAnimation />`
Animated status indicators for various states.

**Props:**
- `status`: `"idle" | "loading" | "success" | "error" | "warning" | "pending"` - Current status
- `size`: `"sm" | "md" | "lg"` - Size of the icon (default: `"md"`)
- `className`: `string` - Additional CSS classes
- `text`: `string` - Optional status message
- `showIcon`: `boolean` - Whether to show the icon (default: `true`)

**Usage:**
```tsx
import { StatusAnimation } from "@/components/ui/animations";

<StatusAnimation status="loading" text="Processing..." />
<StatusAnimation status="success" text="Complete" />
<StatusAnimation status="error" text="Failed" />
<StatusAnimation status="warning" text="Check required" />
<StatusAnimation status="pending" text="Awaiting approval" />
```

#### `<StatusBadge />`
Badge-style status indicator with animation.

**Props:**
- `status`: `"idle" | "loading" | "success" | "error" | "warning" | "pending"`
- `text`: `string` - Badge text
- `className`: `string` - Additional CSS classes

**Usage:**
```tsx
import { StatusBadge } from "@/components/ui/animations";

<StatusBadge status="pending" text="Pending Approval" />
<StatusBadge status="success" text="Approved" />
```

#### `<ProgressAnimation />`
Animated progress bar with percentage.

**Props:**
- `progress`: `number` - Progress value (0-100)
- `text`: `string` - Optional label
- `className`: `string` - Additional CSS classes

**Usage:**
```tsx
import { ProgressAnimation } from "@/components/ui/animations";

const [progress, setProgress] = useState(0);

<ProgressAnimation progress={progress} text="Upload progress" />
```

---

## Implementation Examples

### Example 1: Form Submission with Success Animation

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner, SuccessAnimation } from "@/components/ui/animations";

function CreateRFQPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createRFQ(data);
      setShowSuccess(true);
      setTimeout(() => navigate("/rfqs"), 1500);
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SuccessAnimation size="xl" text="RFQ Created Successfully!" variant="bounce" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Creating...
          </span>
        ) : (
          "Create RFQ"
        )}
      </Button>
    </form>
  );
}
```

### Example 2: Approval Workflow with Multiple States

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner, SuccessAnimation, ErrorAnimation } from "@/components/ui/animations";

function ApprovalDetailPage() {
  const [isApproving, setIsApproving] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const [showRejected, setShowRejected] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveQuotation(id);
      setShowApproved(true);
    } catch (error) {
      // Handle error
    } finally {
      setIsApproving(false);
    }
  };

  if (showApproved) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SuccessAnimation size="xl" text="Quotation Approved!" variant="bounce" />
      </div>
    );
  }

  if (showRejected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorAnimation size="xl" text="Quotation Rejected" variant="shake" />
      </div>
    );
  }

  return (
    <div>
      <Button onClick={handleApprove} disabled={isApproving}>
        {isApproving ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Approving...
          </span>
        ) : (
          "Approve"
        )}
      </Button>
    </div>
  );
}
```

### Example 3: Status Badge in Table

```tsx
import { StatusBadge } from "@/components/ui/animations";

function RFQTable({ rfqs }) {
  return (
    <table>
      <tbody>
        {rfqs.map(rfq => (
          <tr key={rfq.id}>
            <td>{rfq.title}</td>
            <td>
              <StatusBadge 
                status={rfq.status === "open" ? "pending" : "success"} 
                text={rfq.status} 
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Pages with Animations

The following pages have been updated with animations:

### ✅ Implemented Pages

1. **Login Page** (`/login`)
   - Loading spinner in submit button

2. **RFQ Creation** (`/rfqs/new`)
   - Loading spinner in submit button
   - Success animation on creation
   - Auto-redirect after 1.5s

3. **Vendor Creation** (`/vendors/new`)
   - Loading spinner in submit button
   - Success animation on creation
   - Auto-redirect after 1.5s

4. **Purchase Order Creation** (`/purchase-orders/new`)
   - Loading spinner in submit button
   - Success animation on creation
   - Auto-redirect after 1.5s

5. **Approval Detail** (`/approvals/:id`)
   - Loading spinners in approve/reject buttons
   - Success animation on approval
   - Error animation on rejection

6. **Animation Demo Page** (`/animations-demo`)
   - Comprehensive showcase of all animations
   - Interactive examples and code snippets

---

## Best Practices

### 1. Loading States
Always show loading feedback for async operations:
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      Processing...
    </span>
  ) : (
    "Submit"
  )}
</Button>
```

### 2. Success Feedback
Show success animations for important actions:
```tsx
// After successful submission
setShowSuccess(true);
setTimeout(() => navigate("/list"), 1500);
```

### 3. Error Handling
Use error animations for failures:
```tsx
<ErrorAnimation 
  size="md" 
  text="Failed to save. Please try again." 
  variant="alert" 
/>
```

### 4. Status Indicators
Use status badges for list views:
```tsx
<StatusBadge 
  status={item.status === "pending" ? "pending" : "success"} 
  text={item.status} 
/>
```

### 5. Consistent Sizing
- Use `sm` for inline/button animations
- Use `md` for form feedback
- Use `lg` for page-level success/error states
- Use `xl` for full-screen confirmations

---

## Customization

### Custom Colors
All animations use Tailwind CSS classes and can be customized:
```tsx
<SuccessAnimation 
  className="text-blue-500" // Custom color
  size="lg" 
/>
```

### Custom Animations
Extend the components using Framer Motion:
```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  <SuccessAnimation size="lg" />
</motion.div>
```

---

## Testing

To test all animations, navigate to the **Animation Demo Page**:
```
http://localhost:5173/animations-demo
```

This page provides:
- Visual showcase of all animation variants
- Interactive controls
- Usage examples and code snippets
- Size comparisons

---

## Performance

All animations are:
- GPU-accelerated using CSS transforms
- Optimized with Framer Motion
- Lightweight (<5KB total gzipped)
- Tree-shakeable (import only what you need)

---

## Browser Support

Animations work on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Enhancements

Potential additions:
- Confetti animation for major achievements
- Skeleton loading states
- Toast notifications with animations
- Page transition animations
- Micro-interactions for hover states

---

## Support

For questions or issues with animations:
1. Check the demo page at `/animations-demo`
2. Review this documentation
3. Check component prop types in the source files
4. Refer to Framer Motion documentation: https://www.framer.com/motion/

---

**Happy Animating! 🎉**
