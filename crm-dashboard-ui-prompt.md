# CRM Dashboard UI/UX Implementation Prompt

> **Objective:** Build a professional, pixel-perfect CRM Dashboard inspired by a modern fintech design system. Follow every specification below precisely — layout, spacing, typography, colors, interactions, and data.

---

## 1. Tech Stack

- **Framework:** React + Tailwind CSS (or plain HTML/CSS/JS if React is unavailable)
- **Charts:** Recharts
- **Icons:** Lucide React (or Lucide CDN)
- **Font:** Inter or DM Sans — load from Google Fonts
- **Single file output** — do not split into multiple files unless explicitly asked

---

## 2. Overall Page Layout

The page is a **two-column layout**:

| Column | Width | Background | Notes |
|--------|-------|------------|-------|
| Left sidebar | 240px fixed | `#FFFFFF` | Subtle right border `1px solid #F0F0F0` |
| Main content | Remaining width | `#F6F7F9` | 24px padding on all sides |

The **main content area** stacks three vertical sections:

1. A row of **4 KPI metric cards** (equal width, equal height)
2. A row with a **large chart card** (~65% width) + **action panel card** (~35% width) side by side
3. A **full-width data table card** at the bottom

---

## 3. Left Sidebar

### 3.1 Top Section

- **Logo area:** Brand icon (colored circle with initials or SVG) + company name (`16px`, `font-weight: 600`). A sidebar collapse toggle icon sits on the far right.
- **Search bar:** Input with search icon on left + keyboard shortcut hint (`⌘K`) on right. Style: `bg-gray-100`, `rounded-lg`, `text-sm`, no visible border.

### 3.2 Navigation Groups

Each section has:
- A small **section label**: `11px`, `text-gray-400`, `font-weight: 500`, `letter-spacing: 0.06em`
- Followed by **nav items**: icon (20px Lucide) + label text (`14px`)

**Section 1 — Main Menu**
- Dashboard *(active)*
- Contacts
- Companies
- Deals *(add red notification badge showing `6`)*
- Activities

**Section 2 — Sales**
- Pipeline
- Leads
- Quotes

**Section 3 — General**
- Help Center
- Settings

### 3.3 Nav Item States

| State | Style |
|-------|-------|
| Default | `text-gray-600`, `hover:bg-gray-100`, `rounded-lg`, `px-3 py-2.5` |
| Active | `bg-gray-900`, `text-white`, icon turns white — solid dark pill |
| Badge | Small red circle: `bg-red-500`, `text-white`, `text-xs`, `rounded-full`, `w-5 h-5`, right-aligned |

### 3.4 Bottom of Sidebar

**Upgrade promo card** (above user profile):
- Background: soft gradient from `#EEF2FF` to `#F5F3FF`
- Style: `rounded-2xl`, `p-4`
- Content: bold title *"Upgrade to Pro"*, subtitle *"Get 20% off for first 3 months"*, small white button *"Claim Now"* (`rounded-lg`, `text-sm`, `bg-white`, `shadow-sm`)

**User profile row** (very bottom):
- 36px avatar circle + user name (`14px`, `font-weight: 500`) + email (`12px`, `text-gray-400`) + chevron icon right-aligned
- Top border separator: `1px solid #F0F0F0`

---

## 4. Top Header Bar

Sits at the top of the main content area (not fixed).

| Side | Content |
|------|---------|
| Left | Page title "Dashboard" — `22px`, `font-weight: 600`, `text-gray-900` |
| Right | Mail icon button + Bell icon button + Primary CTA button |

**Icon buttons:** Lucide icons at 20px, `text-gray-500`, `hover:bg-gray-100`, `rounded-lg`, `p-2`

**Primary CTA button:**
- Style: `bg-gray-900`, `text-white`, `rounded-xl`, `px-4 py-2`, `text-sm`, `font-weight: 500`
- Lucide `Share2` icon (16px) on left
- Label: *"Add Contact"* or *"New Deal"*

---

## 5. KPI Metric Cards (Row of 4)

**Card base style:** `bg-white`, `rounded-2xl`, `p-5`, `shadow-sm` (`box-shadow: 0 1px 6px rgba(0,0,0,0.06)`), `border: 1px solid #F2F2F2`

### Card Anatomy (top to bottom)

```
[ Icon circle ]  [ Entity Name  ]         [ ↗ ]
                 [ Ticker/Code  ]

[ 3,482 ]

[ +3.12% vs last month ]

[ ▌▌▌▌▌▌▌░░░░░░░░░░░░ ]   ← mini sparkline bars
```

| Row | Detail |
|-----|--------|
| Row 1 | 32px colored icon circle + entity name + code/label in gray + arrow-up-right icon top-right |
| Row 2 | Large value: `28px`, `font-weight: 700`, `text-gray-900` |
| Row 3 | Delta: `+3.12% vs last month` — percent in `text-green-600` (positive) or `text-red-500` (negative), rest in `text-gray-500 text-13px` |
| Row 4 | Mini sparkline bar chart: ~20 thin vertical bars, first half muted (`#D1D5DB`), second half in card accent color. Use inline SVG or tiny Recharts `BarChart` with no axes. |

### The 4 Cards

| # | Metric | Value | Delta | Accent Color |
|---|--------|-------|-------|--------------|
| 1 | Total Contacts | 3,482 | +3.12% | Blue |
| 2 | Revenue | $182.4K | +5.86% | Purple |
| 3 | Deals Won | 112 | +1.68% | Orange |
| 4 | Conversion Rate | 96.4% | +1.54% | Teal |

---

## 6. Main Analytics Chart Card (~65% width)

**Card style:** `bg-white`, `rounded-2xl`, `p-6`, `shadow-sm`, `border: 1px solid #F2F2F2`

### Header (two rows)

**Row 1:**
- Left: colored icon circle + bold name *"Revenue Overview"* (`18px`, `font-weight: 600`)
- Right: bar-chart icon button + line-chart icon button (view toggle)

**Row 2:**
- Large number: `32px`, `font-weight: 700`, `text-gray-900`
- Green badge pill: `bg-green-50`, `text-green-700`, `rounded-full`, `px-2.5 py-0.5`, `text-sm` → shows `+12.80%`
- Secondary text: *"+$7,650 this year"* in `text-gray-500 text-sm`

### Time Period Toggle

Options: `1D` `7D` `1M` `1Y`

| State | Style |
|-------|-------|
| Selected | `bg-gray-900`, `text-white`, `rounded-lg`, `px-3 py-1.5`, `text-sm` |
| Unselected | `text-gray-500`, `px-3 py-1.5`, `text-sm`, `hover:text-gray-900` |

### Recharts Line Chart

```
LineChart configuration:
  - type="monotone"
  - stroke="#2563EB"
  - strokeWidth={2}
  - dot={false}
  - height: 280px

Axes:
  - Y-axis: left only, tick values in text-gray-400 text-xs
  - X-axis: month abbreviations Jan–Dec, text-gray-400 text-xs
  - axisLine={false}, tickLine={false} on both axes

Grid:
  - CartesianGrid: horizontal lines only (vertical={false})
  - stroke="#F3F4F6"

Custom Tooltip:
  - Container: bg-gray-900, text-white, rounded-xl, p-3, shadow-lg
  - Shows: date label (bold, 12px) + value (bold, 18px, white) + two colored dot indicators with percentages

Reference line:
  - Vertical dashed line at hovered point
  - stroke="#2563EB", strokeDasharray="4 4"
```

---

## 7. Action Panel Card (~35% width)

**Card style:** `bg-white`, `rounded-2xl`, `p-6`, `shadow-sm`, `border: 1px solid #F2F2F2`

### Header

Small icon + title *"Quick Actions"* — `18px`, `font-weight: 600`

### Tabs (segmented control)

Options: `New Lead` | `New Deal` | `New Task`

| State | Style |
|-------|-------|
| Tab bar | `bg-gray-100`, `rounded-xl`, `p-1` |
| Active tab | `bg-white`, `rounded-lg`, `shadow-sm`, `text-gray-900`, `font-weight: 500` |
| Inactive tab | `text-gray-500` |

### Form Fields

Each field structure:
```
Label (text-gray-500, 13px, font-weight: 500, mb-1.5)
[ Input value               ] [ Type pill ▾ ]
```

- **Input:** `border: 1px solid #E5E7EB`, `rounded-xl`, `px-4 py-3`, `text-gray-900`, `font-size: 15px`
- **Type pill:** `bg-gray-100`, `rounded-lg`, `px-3 py-2`, `text-sm`, colored icon + text + chevron-down

**Field 1:** Label *"Contact Name"* — text input + contact type pill on right

**Field 2:** Label *"Deal Value"* — number input + USD currency pill on right

### Assign To Section

```
"Assign to" label (text-gray-500, 13px)
┌─────────────────────────────────────┐
│ [Avatar]  Sales Team / Workspace 1  │  Change →  │
└─────────────────────────────────────┘
```

Style: `bg-gray-50`, `rounded-xl`, `px-4 py-3`

### CTA Button

```css
width: 100%;
background: #2563EB;
color: white;
border-radius: 12px;
padding: 14px;
font-size: 15px;
font-weight: 600;
transition: all 0.15s ease;
hover: background: #1D4ED8;
```

Label: *"Save Deal"*

---

## 8. Data Table Card (Full Width)

**Card style:** `bg-white`, `rounded-2xl`, `px-6 py-5`, `shadow-sm`, `border: 1px solid #F2F2F2`

### Card Header Row

| Side | Content |
|------|---------|
| Left | Colored icon + bold title *"Recent Deals"* (`18px`, `font-weight: 600`) + subtitle *"Keep track of all activity here"* (`13px`, `text-gray-400`) below |
| Right | Search input + time filter pills (`1D` `7D` `1M` `1Y`) + dropdown (`24H ▾`) |

**Search input:** `bg-gray-100`, `rounded-xl`, `pl-9`, search icon inside, `text-sm`

### Table Columns

| # | Column | Style |
|---|--------|-------|
| 1 | Checkbox | Styled, `rounded`, `border-gray-300` |
| 2 | Contact/Deal | 32px avatar circle (colored initials) + bold name `14px` + subtext `12px text-gray-400` |
| 3 | Value/Price | `14px`, `text-gray-900` |
| 4 | 24h Change | Green or red pill badge (see below) |
| 5 | 7d Change | Same pill badge style |
| 6 | Trend | Tiny Recharts `LineChart` 80×32px, no axes, no tooltip, `strokeWidth={1.5}`, green or red line |
| 7 | Volume | `text-gray-600`, `13px` |
| 8 | Stage/Status | `text-gray-600`, `13px` |

**Column headers:** `text-gray-400`, `12px`, `font-weight: 500`, `text-transform: uppercase`, `letter-spacing: 0.05em`, `pb-3`, `border-bottom: 1px solid #F3F4F6`

**Change badge styles:**

```css
/* Positive */
background: #F0FDF4;
color: #16A34A;
border-radius: 9999px;
padding: 4px 10px;
font-size: 12px;
font-weight: 500;
/* prefix: ▲ */

/* Negative */
background: #FEF2F2;
color: #DC2626;
/* prefix: ▼ */
```

**Row style:** `py-3.5`, `border-bottom: 0.5px solid #F9FAFB`, `hover:bg-gray-50`, selected: `bg-blue-50`

---

## 9. Design Tokens

```css
/* Backgrounds */
--page-bg:        #F6F7F9;
--card-bg:        #FFFFFF;
--input-bg:       #F3F4F6;
--hover-bg:       #F9FAFB;

/* Borders */
--card-border:    1px solid #F2F2F2;
--input-border:   1px solid #E5E7EB;
--divider:        1px solid #F0F0F0;

/* Shadows */
--card-shadow:    0 1px 6px rgba(0, 0, 0, 0.06);

/* Radius */
--radius-sm:      8px;
--radius-md:      12px;
--radius-lg:      16px;   /* cards */
--radius-pill:    9999px; /* badges */

/* Primary */
--blue-600:       #2563EB;
--blue-700:       #1D4ED8;

/* Text */
--text-primary:   #111827;
--text-secondary: #6B7280;
--text-muted:     #9CA3AF;

/* Active nav */
--nav-active-bg:  #111827;

/* Semantic */
--success:        #16A34A;
--success-bg:     #F0FDF4;
--danger:         #DC2626;
--danger-bg:      #FEF2F2;
--warning:        #D97706;
--warning-bg:     #FFFBEB;

/* Typography */
--font:           'Inter', -apple-system, sans-serif;
--font-base:      14px;
--font-kpi:       28px–32px;
--font-kpi-weight: 700;
--font-title:     18px;
--font-title-weight: 600;
--font-header:    22px;
--font-header-weight: 600;
```

---

## 10. Interactions & Behavior

| Interaction | Behavior |
|-------------|----------|
| Chart time toggle | Clicking `1D` / `7D` / `1M` / `1Y` updates chart data (use hardcoded sample arrays per period) |
| Chart hover | Custom tooltip appears + vertical reference line moves with cursor |
| Action panel tabs | Clicking a tab switches form fields (no animation needed, just conditional render) |
| Table search | Filters rows by contact/deal name in real-time |
| Table sort | Clicking column headers toggles asc/desc sort + shows sort indicator arrow |
| Table checkboxes | Selecting rows highlights them with `bg-blue-50` |
| Nav items | Clicking switches active state (dark fill + white text) |
| Sidebar collapse | Toggle button collapses sidebar to 72px icon-only mode *(optional)* |

---

## 11. Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `< 1024px` | Sidebar collapses into hamburger menu overlay |
| `< 768px` | KPI cards become 2×2 grid; chart and action panel stack vertically; table hides last 2 columns |

---

## 12. Sample Data

### KPI Cards

```js
const kpiData = [
  { label: "Total Contacts", value: "3,482", delta: "+3.12%", positive: true, color: "blue" },
  { label: "Revenue",        value: "$182.4K", delta: "+5.86%", positive: true, color: "purple" },
  { label: "Deals Won",      value: "112",    delta: "+1.68%", positive: true, color: "orange" },
  { label: "Conversion Rate",value: "96.4%",  delta: "+1.54%", positive: true, color: "teal" },
];
```

### Chart Data (1Y — monthly revenue in $K)

```js
const chartData1Y = [
  { month: "Jan", value: 210 },
  { month: "Feb", value: 195 },
  { month: "Mar", value: 180 },
  { month: "Apr", value: 155 },
  { month: "May", value: 165 },
  { month: "Jun", value: 205 },
  { month: "Jul", value: 190 },
  { month: "Aug", value: 220 },
  { month: "Sep", value: 210 },
  { month: "Oct", value: 185 },
  { month: "Nov", value: 175 },
  { month: "Dec", value: 160 },
];
```

### Table Rows

```js
const tableData = [
  {
    name: "Acme Corp",
    ticker: "ENT",
    price: "$64,280",
    change24h: "+3.1%", positive24h: true,
    change7d:  "+10.2%", positive7d: true,
    volume: "$18.7B",
    stage: "Enterprise",
  },
  {
    name: "TechFlow Inc",
    ticker: "MID",
    price: "$4,320",
    change24h: "-3.2%", positive24h: false,
    change7d:  "-2.4%", positive7d: false,
    volume: "$32.5B",
    stage: "Mid-market",
  },
  {
    name: "Brightwave",
    ticker: "STR",
    price: "$520",
    change24h: "+1.8%", positive24h: true,
    change7d:  "+7.5%", positive7d: true,
    volume: "$4.3B",
    stage: "Startup",
  },
  {
    name: "NordEx Ltd",
    ticker: "ENT",
    price: "$520",
    change24h: "+3.2%", positive24h: true,
    change7d:  "+3.2%", positive7d: true,
    volume: "$4.3B",
    stage: "Enterprise",
  },
];
```

---

## 13. Final Checklist Before Submitting

- [ ] Sidebar has all 3 nav sections with correct active states and notification badge
- [ ] Header has page title + icon buttons + primary CTA
- [ ] All 4 KPI cards render with correct sparkline bars
- [ ] Chart renders with time toggle, custom tooltip, and reference line
- [ ] Action panel has 3 tabs + 2 form fields + assign section + CTA button
- [ ] Table has all 8 columns, badge styles, sparkline cells, sorting, and search
- [ ] Promo card and user profile are at the bottom of the sidebar
- [ ] All design tokens match the specifications in Section 9
- [ ] All interactions from Section 10 are implemented
- [ ] Responsive behavior from Section 11 is applied

---

*Build the full component in a single file. Do not skip any section. Match the visual design as closely as possible to the specifications above.*
