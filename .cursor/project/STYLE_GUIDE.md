# UNCAP Finance - Style Guide

## Overview

This style guide documents the design system for UNCAP Finance, a Bitcoin-backed borrowing platform. The application uses **Tailwind CSS** with custom configuration and **React/Remix** for component architecture. The design emphasizes clean, professional aesthetics with a warm, accessible color palette centered around beige/cream tones.

### Design Principles
- **Clarity**: Clean, readable interfaces with clear visual hierarchy
- **Consistency**: Standardized spacing, typography, and component patterns
- **Accessibility**: High contrast ratios and semantic HTML
- **Responsiveness**: Mobile-first approach with thoughtful breakpoints

---

## Color Palette

### Primary Background Colors
```css
/* Main app background - warm beige */
bg-[#F5F3EE]           /* Primary background */
bg-white               /* Card backgrounds, inputs */

/* Brand Color - Used for headers and primary text */
text-[#242424]         /* Primary text color, dark charcoal */
```

### Custom Token Colors
Defined in `app/app.css`:
```css
--color-token-bg: #fff4e5;         /* Light peach - token selector backgrounds */
--color-token-orange: #ff9300;     /* Orange - primary accent, active states */
--color-button-border: #f5f3ee;    /* Light beige - borders, dividers */
--color-token-bg-red: #ff4800;     /* Red-orange - debt/borrow indicators */
--color-token-bg-blue: #3b82f6;    /* Blue - primary CTAs */
--color-token-bg-strk: #ec796b;    /* Coral - STRK token related */
--color-token-strk: #ec796b;       /* Coral - STRK rewards */
```

### Semantic Colors

#### Neutral Colors
```css
text-neutral-800       /* Primary text */
text-neutral-600       /* Secondary text */
text-neutral-500       /* Tertiary text, placeholders */
text-[#AAA28E]         /* Muted text, helper text */

bg-neutral-100         /* Light backgrounds */
bg-neutral-200         /* Borders, dividers */
border-neutral-800/10  /* Subtle borders */
```

#### Status Colors

**Success (Green)**
```css
bg-green-500/10        /* Success background */
border-green-500/20    /* Success border */
text-green-700         /* Success text */
bg-green-50            /* Alert icon background */
```

**Warning (Amber/Orange)**
```css
bg-amber-500/10        /* Warning background */
border-amber-500/20    /* Warning border */
text-amber-700         /* Warning text */
bg-[#FFF4E5]           /* Alert icon background */
border-[#FF9300]       /* Primary warning border */
text-amber-500         /* Active/hover states */
```

**Error (Red)**
```css
bg-red-500/10          /* Error background */
border-red-500/20      /* Error border */
text-red-700           /* Error text */
text-red-600           /* Error messages */
bg-red-50              /* Alert icon background */
```

**Info (Blue)**
```css
bg-blue-500/10         /* Info background */
bg-blue-800            /* Zombie trove background */
bg-blue-50             /* Alert icon background */
bg-[#0051bf]           /* Featured card background */
bg-token-bg-blue       /* Primary button (same as #3b82f6) */
hover:bg-blue-600      /* Button hover state */
```

#### Interactive States
```css
hover:bg-[#F5F3EE]     /* Subtle hover - icon buttons */
hover:bg-neutral-50    /* Subtle hover - list items */
hover:bg-button-border/50  /* Button border hover */
hover:opacity-70       /* General hover fade */
hover:opacity-80       /* Logo/link hover */
hover:text-amber-500   /* Link/nav hover */
```

---

## Typography

### Font Family
**Primary Font**: Sora (Variable font, weights 100-800)
- Used for all text throughout the application
- Variable font allows smooth weight transitions

```css
font-sora              /* Applied throughout */
```

### Font Sizes

#### Headings
```css
/* Page Titles */
text-3xl md:text-4xl lg:text-5xl    /* Main page headings (Dashboard, Borrow) */
  /* 3xl = 1.875rem (30px) */
  /* 4xl = 2.25rem (36px) */
  /* 5xl = 3rem (48px) */

/* Section Titles */
text-2xl sm:text-3xl md:text-4xl lg:text-5xl  /* Large inputs (token amounts) */
text-3xl               /* Card content headings */
text-2xl               /* Sub-headings */
text-xl                /* Card footer text, metrics */
text-lg                /* Mobile menu items */
```

#### Body Text
```css
text-base              /* Standard body text, USD values (16px) */
text-sm                /* Form labels, descriptions, buttons (14px) */
text-xs                /* Helper text, labels, small UI elements (12px) */
text-[10px] sm:text-xs /* Extra small breakpoint-specific */
```

### Font Weights
```css
font-normal            /* 400 - Body text, descriptions */
font-medium            /* 500 - Most UI text, labels, buttons */
font-semibold          /* 600 - Card titles */
```

### Text Styles
```css
/* Uppercase labels */
uppercase tracking-tight    /* Section labels like "DEPOSIT AMOUNT" */

/* Leading (Line Height) */
leading-none           /* Tight line height for numbers, titles */
leading-3              /* 0.75rem - Small labels */
leading-4              /* 1rem - Navigation */
leading-6              /* 1.5rem - Mobile menu */
leading-8 sm:leading-9 md:leading-10  /* Responsive large inputs */
leading-tight          /* 1.25 - Alerts, descriptions */
leading-normal         /* 1.5 - Paragraph text */
leading-snug           /* 1.375 - Compact text */

/* Special Cases */
leading-10             /* Page titles (2.5rem) */
```

### Common Text Combinations

**Page Headings**
```tsx
className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]"
```

**Section Labels**
```tsx
className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight"
```

**Card Titles**
```tsx
className="leading-none font-semibold"
```

**Helper Text**
```tsx
className="text-xs text-neutral-500 font-sora"
```

**Error Messages**
```tsx
className="text-xs text-red-600 font-medium font-sora"
```

---

## Spacing System

### Container Spacing
```css
/* Page containers */
max-w-7xl mx-auto              /* 80rem = 1280px max width */
px-4 sm:px-6 lg:px-8           /* Responsive horizontal padding */
py-8 lg:py-12                  /* Responsive vertical padding */
pb-32                          /* Bottom padding for fixed elements */

/* Component containers */
p-6                            /* Standard card padding */
p-4                            /* Compact padding */
p-2 sm:p-3                     /* Minimal padding */
```

### Gaps & Spacing
```css
/* Common gaps */
gap-1        /* 0.25rem = 4px - Tight elements */
gap-1.5      /* 0.375rem = 6px - Icons and text */
gap-2        /* 0.5rem = 8px - Related elements */
gap-3        /* 0.75rem = 12px - Component sections */
gap-4        /* 1rem = 16px - Standard spacing */
gap-5        /* 1.25rem = 20px - Card grids */
gap-6        /* 1.5rem = 24px - Major sections */
gap-7        /* 1.75rem = 28px - Navigation items */

/* Space utilities */
space-y-1    /* Vertical spacing between children */
space-y-2    /* Common for form elements */
space-y-4    /* Common for sections */
space-y-6    /* Major section separation */

/* Margins */
mb-4 lg:mb-8         /* Responsive bottom margin */
mt-4                 /* Top margin */
-my-6                /* Negative vertical margin */
```

### Section Spacing Patterns
```tsx
/* Page header spacing */
className="pb-6 lg:pb-8"

/* Card content spacing */
className="space-y-6"      /* TokenInput cards */

/* Form element spacing */
className="space-y-1"      /* Labels and inputs */
className="space-y-2"      /* Form sections */
```

---

## Component Styles

### Cards

**Base Card** (`components/ui/card.tsx`)
```tsx
// Card container
className="bg-white rounded-2xl py-6 space-y-6 border border-neutral-100"

// Card without border (common override)
className="rounded-2xl border-0 shadow-none bg-white"

// Card header with bottom border
className="border-b border-[#F5F3EE] pb-6"

// Card content
className="px-6"

// Card footer with top border
className="border-t border-[#F5F3EE] pt-6"
```

**Special Card Variants**
```tsx
// Zombie/Redeemed trove (dark variant)
className="bg-blue-800"
  // With white text
  className="text-white"
  // With semi-transparent borders
  className="border-white/20"

// Hover effect on cards
className="group"  // On container
className="group-hover:opacity-100"  // On child elements
```

### Buttons

**Primary Button** (Call-to-action)
```tsx
className="px-6 py-4 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora rounded-xl transition-all border-0 h-auto"
```

**Button Variants** (`components/ui/button.tsx`)
```tsx
// Default
className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"

// Outline
className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"

// Ghost
className="hover:bg-accent hover:text-accent-foreground"

// Destructive
className="bg-destructive text-white shadow-xs hover:bg-destructive/90"
```

**Button Sizes**
```tsx
size="default"  // h-9 px-4 py-2
size="sm"       // h-8 px-3
size="lg"       // h-10 px-6
size="icon"     // size-9 (square)
```

**Percentage Buttons** (TokenInput)
```tsx
className="py-1 px-2 sm:py-2 sm:px-3 text-[10px] sm:text-xs text-neutral-800 font-medium font-sora rounded-md outline outline-offset-[-1px] outline-button-border bg-transparent hover:bg-button-border/50 transition-colors"
```

**Icon Buttons**
```tsx
// Edit/Close buttons on cards
className="w-8 h-8 rounded-lg border border-neutral-800/10 hover:bg-[#F5F3EE] transition-all flex items-center justify-center cursor-pointer"
```

### Inputs & Forms

**Numeric Input** (react-number-format)
```tsx
// Large token amount input
className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora leading-8 sm:leading-9 md:leading-10 h-auto p-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none shadow-none text-neutral-800 w-full"
```

**Token Selector**
```tsx
// Standard token background (collateral)
className="p-2.5 bg-token-bg rounded-lg inline-flex justify-start items-center gap-2"
  // Token text
  className="text-token-orange text-xs font-medium font-sora"

// Debt token background
className="p-2.5 bg-token-bg-red/10 rounded-lg"
  // Token text
  className="text-token-bg-red text-xs font-medium font-sora"
```

**Select Component**
```tsx
// Trigger
className="p-2.5 bg-token-bg rounded-lg inline-flex justify-start items-center gap-2 h-auto border-0 hover:opacity-80 transition-all"

// Content
className="border border-neutral-200 rounded-lg shadow-md"

// Items
className="text-xs font-medium font-sora"
```

**Form Labels**
```tsx
className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight"
```

### Badges

**Badge Variants** (`components/ui/badge.tsx`)
```tsx
// Default
className="bg-neutral-100 border-neutral-200 text-neutral-600"

// Warning
className="bg-amber-500/10 border-amber-500/20 text-amber-700"

// Success
className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700"

// Destructive
className="bg-red-500/10 border-red-500/20 text-red-700"

// Base style (all variants)
className="inline-flex items-center px-2 py-1 h-6 justify-center rounded-md border text-xs font-normal font-sora transition-colors"
```

**Status Badge Example** (BorrowCard)
```tsx
// Active position badge
className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#F5F3EE] rounded-lg text-xs font-medium font-sora text-neutral-800 leading-tight"
```

### Alerts

**Alert Structure** (`components/ui/alert.tsx`)
```tsx
// Container
className="relative w-full rounded-2xl border bg-white p-6 text-sm flex gap-3 items-start shadow-sm transition-all"

// Icon container
className="w-8 h-8 rounded-lg flex justify-center items-center shrink-0"
  // Warning variant
  className="bg-[#FFF4E5]"

// Title
className="font-medium font-sora text-sm text-[#242424] leading-tight"

// Description
className="flex flex-col gap-1 text-xs font-normal font-sora text-[#AAA28E] leading-normal"
```

**Alert Variants**
```tsx
variant="warning"      // Orange border, amber text
variant="info"         // Blue border, blue text
variant="success"      // Green border, green text
variant="destructive"  // Red border, red text
```

### Navigation

**Nav Link** (Header)
```tsx
// Desktop nav link
className="font-sora font-medium text-sm leading-4 text-gray-800 group-hover:text-amber-500"

// Active state
className="text-amber-500"

// Active underline
className="w-7 h-0.5 bg-amber-500"

// Hover underline
className="w-7 h-0.5 bg-amber-500/30"
```

**Mobile Menu**
```tsx
// Drawer trigger
className="text-gray-500 hover:text-gray-900"

// Menu item
className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-sora font-medium text-sm transition-colors"

// Active mobile nav
className="bg-amber-50 text-amber-500"
```

---

## Shadows & Elevation

### Shadow Scale
```css
shadow-none            /* No shadow - most cards use this */
shadow-sm              /* Subtle shadow - buttons, alerts */
shadow-md              /* Medium shadow - dropdowns, select menus */
shadow-lg              /* Large shadow - modals, hover states */
```

### Common Usage
```tsx
// Cards - typically no shadow
className="shadow-none"

// Dropdowns/Popovers
className="shadow-md"

// Buttons
className="shadow-xs"  // From button variant

// Hover effects
className="hover:shadow-lg transition-shadow"
```

### Outlines (Alternative to shadows)
```tsx
// Percentage buttons
className="outline outline-offset-[-1px] outline-button-border"

// Focus states
className="focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none"
```

---

## Animations & Transitions

### Transition Utilities
```css
transition-all         /* All properties - buttons, containers */
transition-colors      /* Color changes - links, badges */
transition-opacity     /* Fade effects - hover states */
transition-shadow      /* Shadow changes - cards */
```

### Duration & Easing
```css
/* Default duration: 150ms with ease-in-out */

/* Custom durations */
duration-300           /* Slower transitions */
ease-in-out            /* Smooth easing */
```

### Common Transition Patterns

**Hover Transitions**
```tsx
className="transition-all hover:bg-[#F5F3EE]"
className="transition-colors hover:text-amber-500"
className="transition-opacity hover:opacity-70"
```

**Conditional Visibility**
```tsx
// Percentage buttons on hover
className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
```

**Disabled States**
```tsx
className="transition-all disabled:pointer-events-none disabled:opacity-50"
```

### Loading States

**Skeleton Animation**
```tsx
className="animate-pulse bg-slate-200"
```

**Skeleton Elements**
```tsx
// Text skeleton
className="h-4 w-24 bg-slate-200 rounded animate-pulse"

// Badge skeleton
className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse"

// Value skeleton
className="h-9 w-32 bg-slate-200 rounded animate-pulse"
```

---

## Border Radius

### Radius Scale
```css
rounded-md             /* 0.375rem = 6px - Small elements, badges */
rounded-lg             /* 0.5rem = 8px - Buttons, inputs, icons */
rounded-xl             /* 0.75rem = 12px - Primary buttons, CTAs */
rounded-2xl            /* 1rem = 16px - Cards, major containers */
rounded-full           /* Perfect circle - avatars, dots */
```

### Component Usage
```tsx
// Cards
className="rounded-2xl"

// Primary buttons
className="rounded-xl"

// Secondary buttons, icon buttons
className="rounded-lg"

// Badges, small buttons
className="rounded-md"

// Token icons, avatars
className="rounded-full"  // or specific size like "w-5 h-5"
```

### Custom Radius
Base radius defined in CSS:
```css
--radius: 0.625rem;    /* 10px - base radius */
--radius-sm: 0.375rem; /* --radius - 4px */
--radius-md: 0.5rem;   /* --radius - 2px */
--radius-lg: 0.625rem; /* --radius */
--radius-xl: 0.875rem; /* --radius + 4px */
```

---

## Opacity & Transparency

### Opacity Levels
```css
opacity-0              /* Hidden - conditional reveals */
opacity-50             /* 50% - disabled states, overlays */
opacity-70             /* 70% - hover fade */
opacity-80             /* 80% - subtle hover */
opacity-100            /* Full opacity - active states */
```

### Color Opacity (Tailwind syntax)
```css
/* Background with opacity */
bg-red-500/10          /* 10% opacity red background */
bg-amber-500/20        /* 20% opacity amber border */
bg-white/10            /* 10% white - zombie card token */
bg-white/20            /* 20% white - zombie card borders */

/* Border opacity */
border-neutral-800/10  /* 10% opacity border */
border-white/20        /* 20% white border */

/* Text opacity */
text-white/60          /* 60% white text - muted on dark */
text-white/90          /* 90% white text - description on dark */
```

### Common Opacity Patterns

**Disabled Elements**
```tsx
className="disabled:opacity-50"
```

**Hover Fades**
```tsx
className="hover:opacity-70"  // Links, clickable elements
className="hover:opacity-80"  // Logos, images
```

**Conditional Visibility**
```tsx
className="opacity-0 group-hover:opacity-100"
```

**Dark Overlays/Cards**
```tsx
// Zombie trove - white elements on dark background
className="bg-blue-800"
className="text-white/60"        // Muted text
className="text-white"           // Primary text
className="border-white/20"      // Borders
className="bg-white/10"          // Token backgrounds
```

---

## Common Tailwind CSS Patterns

### Responsive Design

**Breakpoints**
```css
sm:   /* 640px */
md:   /* 768px */
lg:   /* 1024px */
xl:   /* 1280px */
2xl:  /* 1536px */
```

**Common Responsive Patterns**
```tsx
// Text sizing
className="text-3xl md:text-4xl lg:text-5xl"

// Spacing
className="px-4 sm:px-6 lg:px-8"
className="py-8 lg:py-12"

// Layout
className="flex flex-col lg:flex-row"
className="grid grid-cols-1 md:grid-cols-2"

// Width
className="w-full lg:w-auto lg:flex-1"

// Display
className="hidden md:flex"
className="md:hidden"

// Gap
className="gap-4 lg:gap-8"
```

### Flexbox Patterns
```tsx
// Horizontal layout with space between
className="flex justify-between items-center"

// Centered content
className="flex items-center justify-center"

// Vertical stack
className="flex flex-col gap-4"

// Wrapping flex
className="flex flex-wrap gap-2"

// Flex grow/shrink
className="flex-1"           // Grow to fill
className="flex-shrink-0"    // Don't shrink
```

### Grid Patterns
```tsx
// Two column grid
className="grid grid-cols-2 gap-4"

// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 gap-5"

// Auto-fit grid
className="grid auto-rows-min gap-1.5"

// Grid positioning
className="col-start-2 row-span-2"
```

### Positioning
```tsx
// Sticky header
className="sticky top-0 z-50"

// Absolute positioning
className="absolute top-0 right-0"
className="absolute inset-0"    // All sides
className="absolute -bottom-3.5 left-0 right-0"  // Centered underline

// Relative for absolute children
className="relative"

// Centering with absolute
className="absolute left-1/2 -translate-x-1/2"
```

### State Variants
```tsx
// Hover
className="hover:bg-gray-50"
className="hover:text-amber-500"

// Focus
className="focus:outline-none"
className="focus-visible:ring-4"

// Active
className="active:scale-95"

// Disabled
className="disabled:opacity-50 disabled:pointer-events-none"

// Group hover (parent affects child)
className="group"  // Parent
className="group-hover:opacity-100"  // Child

// Data attributes
className="data-[state=open]:text-amber-500"
```

### Typography Utilities
```tsx
// Text alignment
className="text-left text-center text-right"

// Text transform
className="uppercase lowercase capitalize"

// Text decoration
className="underline no-underline"
className="underline-offset-4"

// Whitespace
className="whitespace-nowrap"
className="truncate"          // Single line ellipsis
className="line-clamp-2"      // Multi-line ellipsis

// Word break
className="break-words"
```

### Visibility Utilities
```tsx
// Hide scrollbar
className="overflow-hidden"

// Scroll
className="overflow-auto"
className="overflow-y-scroll"

// Screen reader only
className="sr-only"

// Pointer events
className="pointer-events-none"
```

---

## Layout Patterns

### Page Container
```tsx
<div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pb-32">
  {/* Page content */}
</div>
```

### Two-Column Layout (Borrow, Dashboard)
```tsx
<div className="flex flex-col lg:flex-row gap-5">
  {/* Left Panel - Main content */}
  <div className="flex-1 lg:flex-[2]">
    {/* Content */}
  </div>

  {/* Right Panel - Sidebar */}
  <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px] space-y-4">
    {/* Sidebar content */}
  </div>
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  {/* Cards */}
</div>
```

### Header Pattern
```tsx
<div className="flex justify-between pb-6 lg:pb-8 items-baseline">
  <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
    {title}
  </h1>
  {/* Actions */}
</div>
```

---

## Component Reference Examples

### TokenInput Component

**Full Example from `app/components/token-input.tsx`**
```tsx
<div className="bg-white rounded-2xl p-6 space-y-6 group">
  {/* Label and percentage buttons */}
  <div className="flex justify-between items-start">
    <Label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
      Deposit Amount
    </Label>

    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center gap-1.5">
      {[25, 50, 75, 100].map((pct) => (
        <button
          key={pct}
          className="py-1 px-2 sm:py-2 sm:px-3 text-[10px] sm:text-xs text-neutral-800 font-medium font-sora rounded-md outline outline-offset-[-1px] outline-button-border bg-transparent hover:bg-button-border/50 transition-colors"
        >
          {pct === 100 ? "MAX" : `${pct}%`}
        </button>
      ))}
    </div>
  </div>

  {/* Main input area */}
  <div className="flex items-center gap-6">
    {/* Token selector */}
    <div className="p-2.5 bg-token-bg rounded-lg inline-flex justify-start items-center gap-2">
      <img src={token.icon} alt={token.symbol} className="w-5 h-5 object-contain" />
      <span className="text-token-orange text-xs font-medium font-sora">
        {token.symbol}
      </span>
    </div>

    {/* Numeric input */}
    <NumericFormat
      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora leading-8 sm:leading-9 md:leading-10 h-auto p-0 border-none bg-transparent focus-visible:ring-0 text-neutral-800 w-full"
      thousandSeparator=","
      decimalScale={6}
      placeholder="0"
    />
  </div>

  {/* Bottom row: USD value and balance */}
  <div className="flex justify-between items-end">
    <NumericFormat
      className="text-neutral-800 text-sm font-medium font-sora leading-none"
      displayType="text"
      prefix="= $"
      thousandSeparator=","
      decimalScale={3}
      fixedDecimalScale
    />

    <button className="flex items-end gap-1 cursor-pointer hover:opacity-70 transition-opacity">
      <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
        Balance:
      </span>
      <NumericFormat
        className="text-neutral-800 text-base font-medium font-sora leading-none"
        displayType="text"
        thousandSeparator=","
        decimalScale={6}
      />
      <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
        BTC
      </span>
    </button>
  </div>
</div>
```

### BorrowCard Component

**Full Example from `app/components/dashboard/borrow-card.tsx`**
```tsx
<Card className="rounded-2xl border-0 shadow-none bg-white">
  {/* Header */}
  <CardHeader className="border-b border-[#F5F3EE]" style={{ paddingBottom: "0.75rem" }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Status badge */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#F5F3EE] rounded-lg text-xs font-medium font-sora text-neutral-800 leading-tight">
          <BorrowIcon />
          Borrow
        </div>

        {/* Position ID */}
        <span className="text-sm font-medium font-sora leading-none text-neutral-800">
          #{troveId}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 rounded-lg border border-neutral-800/10 hover:bg-[#F5F3EE] transition-all flex items-center justify-center cursor-pointer">
          <X className="h-4 w-4 text-neutral-800" />
        </button>
        <button className="w-8 h-8 rounded-lg border border-neutral-800/10 hover:bg-[#F5F3EE] transition-all flex items-center justify-center cursor-pointer">
          <Edit3 className="h-4 w-4 text-neutral-800" />
        </button>
      </div>
    </div>
  </CardHeader>

  {/* Content */}
  <CardContent className="flex flex-col flex-1">
    <div className="flex justify-between items-center mb-4 lg:mb-8">
      <div className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800">
        Collateral Value
      </div>

      <div className="flex items-center gap-2 px-2 py-2 rounded-md border border-[#F5F3EE]">
        <span className="text-xs font-medium font-sora text-neutral-800">Rate</span>
        <div className="h-3 w-px bg-[#F5F3EE]" />
        <span className="text-xs font-medium font-sora leading-3 text-neutral-800">
          2.50%
        </span>
      </div>
    </div>

    <div className="flex-1 flex flex-col justify-center">
      <div className="flex items-center gap-3">
        <div className="text-3xl font-medium font-sora text-neutral-800">
          0.12345
        </div>

        <div className="p-2.5 bg-token-bg rounded-lg inline-flex justify-start items-center gap-2">
          <img src="/btc.svg" className="w-5 h-5 object-contain" />
          <span className="text-sm font-medium font-sora leading-tight text-token-orange">
            BTC
          </span>
        </div>
      </div>

      <div className="text-base font-normal font-sora mt-1 text-[#AAA28E]">
        $12,345.67
      </div>
    </div>
  </CardContent>

  {/* Footer */}
  <CardFooter className="border-t border-[#F5F3EE]">
    <div className="w-full grid grid-cols-2 relative -my-6">
      {/* Divider */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[#F5F3EE]" />

      {/* Debt */}
      <div className="pr-4 py-6">
        <div className="text-xs font-medium font-sora uppercase tracking-tight mb-2 text-neutral-800">
          Debt (USDU)
        </div>
        <div className="text-xl font-medium font-sora text-neutral-800">
          5,000.00
        </div>
      </div>

      {/* Liquidation Price */}
      <div className="pl-6 py-6">
        <div className="text-xs font-medium font-sora uppercase tracking-tight mb-2 text-neutral-800">
          Liquidation Price
        </div>
        <div className="text-xl font-medium font-sora text-neutral-800">
          $45,000.00
        </div>
      </div>
    </div>
  </CardFooter>
</Card>
```

### Alert Component

**Full Example from `app/components/ui/alert.tsx`**
```tsx
<Alert variant="warning" className="mb-6">
  <AlertIcon variant="warning">
    <svg className="w-4 h-3" viewBox="0 0 16 11" fill="none">
      <path d="M6.20549..." fill="#FF9300" />
    </svg>
  </AlertIcon>

  <AlertContent>
    <AlertDescription>
      <strong>Some positions couldn't be loaded</strong>
      <p>
        3 troves failed to load due to network issues.
        The data shown below may be incomplete.
      </p>

      <div className="mt-4">
        <button className="inline-flex items-center gap-2 border-b border-[#FF9300] pb-2 text-[#FF9300] text-xs font-medium font-sora leading-tight hover:opacity-80 transition-opacity">
          Retry
          <ArrowIcon />
        </button>
      </div>
    </AlertDescription>
  </AlertContent>
</Alert>
```

### Primary CTA Button

**Example from borrow page**
```tsx
<Button
  type="submit"
  className="w-full h-12 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap"
>
  Borrow
</Button>
```

### Navigation Link

**Example from header**
```tsx
<div className="relative group">
  <Link
    to="/borrow"
    className="font-sora font-medium text-sm leading-4 text-gray-800 group-hover:text-amber-500"
  >
    <BorrowIcon />
    Borrow
  </Link>

  {/* Active underline */}
  {isActive && (
    <div className="absolute -bottom-3.5 left-0 right-0 flex justify-center pointer-events-none">
      <div className="w-7 h-0.5 bg-amber-500"></div>
    </div>
  )}

  {/* Hover underline */}
  {!isActive && (
    <div className="absolute -bottom-3.5 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      <div className="w-7 h-0.5 bg-amber-500/30"></div>
    </div>
  )}
</div>
```

---

## Best Practices

### 1. **Consistency Over Convention**
- Use the established patterns from existing components
- Stick to the defined color palette
- Follow the spacing system

### 2. **Responsive First**
- Start with mobile layout
- Add responsive breakpoints progressively
- Test all breakpoints

### 3. **Accessibility**
- Use semantic HTML elements
- Maintain color contrast ratios (WCAG AA minimum)
- Include focus states for keyboard navigation
- Use `sr-only` for screen reader text when needed

### 4. **Performance**
- Use `transition-all` sparingly (prefer specific properties)
- Implement loading skeletons for async data
- Use `memo` for expensive components

### 5. **Component Composition**
- Build reusable UI components
- Use compound component patterns (Card, Alert)
- Leverage class-variance-authority for variants

### 6. **State Management**
- Visual feedback for all interactive elements
- Clear disabled states
- Loading states for async operations

---

## Quick Reference

### Most Common Class Combinations

**Card Container**
```tsx
className="bg-white rounded-2xl p-6 space-y-6"
```

**Section Label**
```tsx
className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight"
```

**Page Title**
```tsx
className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]"
```

**Primary Button**
```tsx
className="px-6 py-4 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora rounded-xl transition-all"
```

**Icon Button**
```tsx
className="w-8 h-8 rounded-lg border border-neutral-800/10 hover:bg-[#F5F3EE] transition-all flex items-center justify-center"
```

**Divider**
```tsx
className="w-px bg-[#F5F3EE]"  // Vertical
className="border-b border-[#F5F3EE]"  // Horizontal
```

---

## Resources

- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Radix UI Components**: https://www.radix-ui.com/
- **React Number Format**: https://github.com/s-yadav/react-number-format
- **Class Variance Authority**: https://cva.style/docs

---

**Last Updated**: 2025-01-18
**Version**: 1.0
