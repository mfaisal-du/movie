# UI/UX Design Specifications
## MovieCloud — Netflix-Inspired Streaming Platform

---

## 1. Design Philosophy

MovieCloud follows a **dark, cinematic design language** inspired by Netflix, Amazon Prime Video, and Disney+. The design prioritizes content (movie posters and backdrops) over chrome (UI elements), uses generous whitespace within a dark canvas, and employs subtle animations to create a premium, immersive experience. Every interaction should feel smooth, responsive, and intentional.

**Core Principles:**
- **Content First:** Movie visuals dominate; UI stays out of the way
- **Dark Canvas:** Deep blacks and dark grays let poster colors pop
- **Smooth Motion:** Every transition is animated with purpose
- **Mobile Native:** Touch-first design that scales up to desktop
- **Accessible:** WCAG 2.1 AA compliance, keyboard navigable

---

## 2. Design Tokens

### 2.1 Color Palette

```css
/* === Background Colors === */
--color-bg-primary: #141414;          /* Main background (Netflix black) */
--color-bg-secondary: #1a1a1a;        /* Slightly lighter sections */
--color-bg-surface: #1f1f1f;          /* Card / panel background */
--color-bg-surface-hover: #282828;    /* Card hover state */
--color-bg-elevated: #2a2a2a;         /* Modals, dropdowns */
--color-bg-overlay: rgba(0, 0, 0, 0.7); /* Dim overlay for modals */

/* === Brand Colors === */
--color-brand-primary: #E50914;       /* Netflix red — primary CTA */
--color-brand-primary-hover: #B20710; /* Darker red on hover */
--color-brand-primary-light: #F40612; /* Lighter red for glows */

/* === Text Colors === */
--color-text-primary: #FFFFFF;        /* Headlines, primary text */
--color-text-secondary: #B3B3B3;      /* Body text, descriptions */
--color-text-muted: #808080;          /* Captions, timestamps */
--color-text-disabled: #4a4a4a;       /* Disabled state text */

/* === Accent Colors === */
--color-accent-gold: #F5C518;         /* IMDb-style rating badge */
--color-accent-green: #46D369;        /* Success, high rating, online status */
--color-accent-blue: #0071EB;         /* Links, interactive elements */
--color-accent-blue-hover: #005BBB;   /* Link hover */
--color-accent-orange: #F59E0B;       /* Warnings, quality badges */

/* === Gradients === */
--gradient-hero-right: linear-gradient(
  to right,
  rgba(20, 20, 20, 0.95) 0%,
  rgba(20, 20, 20, 0.7) 30%,
  rgba(20, 20, 20, 0.3) 60%,
  rgba(20, 20, 20, 0) 100%
);
--gradient-hero-bottom: linear-gradient(
  to top,
  rgba(20, 20, 20, 1) 0%,
  rgba(20, 20, 20, 0.8) 20%,
  rgba(20, 20, 20, 0) 60%
);
--gradient-hero-combined: linear-gradient(
  to bottom right,
  rgba(20, 20, 20, 0.95) 0%,
  rgba(20, 20, 20, 0.5) 50%,
  rgba(20, 20, 20, 0.3) 100%
);
--gradient-card-shine: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.1) 0%,
  rgba(255, 255, 255, 0) 50%
);
--gradient-skeleton: linear-gradient(
  90deg,
  #1f1f1f 25%,
  #2a2a2a 50%,
  #1f1f1f 75%
);
```

### 2.2 Typography

```css
/* === Font Family === */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* === Font Sizes (rem scale) === */
--text-xs: 0.75rem;      /* 12px — captions, badges */
--text-sm: 0.875rem;     /* 14px — secondary text, labels */
--text-base: 1rem;        /* 16px — body text */
--text-lg: 1.125rem;     /* 18px — emphasized body */
--text-xl: 1.25rem;      /* 20px — section titles */
--text-2xl: 1.5rem;      /* 24px — card titles */
--text-3xl: 1.875rem;    /* 30px — page titles */
--text-4xl: 2.25rem;     /* 36px — hero subtitle */
--text-5xl: 3rem;        /* 48px — hero title (mobile) */
--text-6xl: 3.5rem;      /* 56px — hero title (desktop) */
--text-7xl: 4.5rem;      /* 72px — large display */

/* === Font Weights === */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;

/* === Line Heights === */
--leading-tight: 1.1;
--leading-snug: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* === Letter Spacing === */
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.05em;
--tracking-wider: 0.1em;
```

### 2.3 Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 2.4 Border Radius

```css
--radius-none: 0;
--radius-sm: 4px;       /* Small elements, badges */
--radius-md: 8px;       /* Buttons, inputs, cards */
--radius-lg: 12px;      /* Large cards, modals */
--radius-xl: 16px;      /* Hero sections */
--radius-2xl: 24px;     /* Special containers */
--radius-full: 9999px;  /* Pills, avatars */
```

### 2.5 Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
--shadow-glow-red: 0 0 20px rgba(229, 9, 20, 0.3);
--shadow-glow-blue: 0 0 20px rgba(0, 113, 235, 0.3);
--shadow-card: 0 4px 16px rgba(0, 0, 0, 0.3);
--shadow-card-hover: 0 8px 32px rgba(0, 0, 0, 0.5);
```

### 2.6 Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-card-hover: 300;
--z-overlay: 400;
--z-modal: 500;
--z-toast: 600;
--z-tooltip: 700;
--z-max: 9999;
```

---

## 3. Layout System

### 3.1 Grid System

```
Max Content Width: 1400px (centered)
Page Padding: 16px (mobile) → 32px (tablet) → 64px (desktop)
Gutter: 16px

Movie Card Grid:
  Mobile (< 640px):    2 columns, gap 8px
  Tablet (641-768px):  3 columns, gap 12px
  Small Desktop (769-1024px): 4 columns, gap 16px
  Desktop (1025-1280px): 5 columns, gap 16px
  Large Desktop (1281-1536px): 6 columns, gap 16px
  XL Desktop (1537px+): 7 columns, gap 20px
```

### 3.2 Movie Card Dimensions

```
Poster Aspect Ratio: 2:3

Card Width (including gap):
  Mobile:     ~calc(50% - 8px)
  Tablet:     ~calc(33% - 12px)
  Desktop:    ~200px fixed width

Poster Sizes (from TMDB):
  Thumbnail:  w200 (card in row)
  Standard:   w342 (card in grid)
  Large:      w500 (detail page)
  Original:   original (backdrop)
```

---

## 4. Component Specifications

### 4.1 Header / Navigation Bar

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎬 MovieCloud     Home  Genre ▾  My List    [🔍 Search...]  [≡]  │
└─────────────────────────────────────────────────────────────────────┘

States:
  - Default (top of page):   Transparent background, white text
  - Scrolled (> 50px):       Solid #141414 background with subtle blur
  - Mobile:                  Hamburger menu → slide-out drawer from left
  - Search Active:           Search bar expands, results dropdown appears

Behavior:
  - Fixed position, top: 0, z-index: var(--z-sticky)
  - Height: 64px (desktop), 56px (mobile)
  - Logo: Text "MovieCloud" with red accent on "Cloud"
  - Nav Links: Hover underline animation (0.2s ease)
  - Search: 300px wide, expands to 500px on focus (desktop)
  - Backdrop blur: blur(10px) when scrolled
```

**Mobile Header:**
```
┌──────────────────────────────────┐
│  🎬 MovieCloud          [🔍] [≡]│
└──────────────────────────────────┘

Mobile Nav Drawer (slides from left):
┌──────────────────────┐
│  ✕ Close             │
│                      │
│  🏠 Home             │
│  🎬 Movies           │
│  📂 Genre ▾           │
│    ├─ Action          │
│    ├─ Comedy          │
│    ├─ Drama           │
│    └─ ...             │
│  ❤ My List           │
│                      │
│  ─────────────────── │
│  ⚙ Admin (hidden)    │
└──────────────────────┘
```

**Mobile Bottom Navigation:**
```
┌──────────────────────────────────┐
│   🏠          🎬       ❤        │
│  Home      Movies    My List    │
└──────────────────────────────────┘
  - Fixed bottom, 56px height
  - Active tab: icon + text in --color-brand-primary
  - Inactive: --color-text-muted
```

### 4.2 Hero Banner

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [Full-width backdrop image with gradient-left-to-right overlay]    │
│                                                                     │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│     ▓▓ MOVIE TITLE (56px bold)                        ▓▓▓▓▓▓▓▓   │
│     ▓▓ ⭐ 8.5  |  2024  |  Action, Thriller  |  2h 15m ▓▓▓   │
│     ▓▓                                              ▓▓▓▓▓▓   │
│     ▓▓ A thrilling action-packed adventure that follows  ▓▓▓▓   │
│     ▓▓ two unlikely allies as they race against time...  ▓▓▓   │
│     ▓▓                                              ▓▓▓▓▓   │
│     ▓▓ [▶ Play Now]   [ℹ More Info]   [+ My List]   ▓▓▓▓   │
│     ▓▓                                              ▓▓▓▓▓   │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                                                     │
│  ● ○ ○ ○ ○   (carousel indicators — bottom left)                   │
└─────────────────────────────────────────────────────────────────────┘

Dimensions:
  - Height: 85vh (desktop), 70vh (tablet), 60vh (mobile)
  - Min height: 400px
  - Max width of text area: 550px
  - Padding left: 64px (desktop), 24px (mobile)

Behavior:
  - Auto-rotates every 8 seconds
  - Pauses on hover (desktop) or touch (mobile)
  - Crossfade transition: 1000ms ease-in-out
  - Carousel dots at bottom-left, clickable
  - Backdrop images preloaded for next 2 slides

"Play Now" Button:
  - Background: --color-brand-primary (#E50914)
  - Text: white, 18px, font-weight 700
  - Padding: 14px 28px
  - Border-radius: var(--radius-sm)
  - Icon: ▶ play triangle, 16px
  - Hover: --color-brand-primary-hover, scale 1.02, shadow-glow-red
  - Transition: all 0.2s ease

"More Info" Button:
  - Background: rgba(109, 109, 110, 0.7)
  - Text: white, 18px, font-weight 600
  - Padding: 14px 28px
  - Border-radius: var(--radius-sm)
  - Icon: ℹ info circle
  - Hover: rgba(109, 109, 110, 0.5)
  - Transition: all 0.2s ease
```

### 4.3 Movie Card (Horizontal Row)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ACTION MOVIES                                            See All >  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│  │        │ │        │ │        │ │        │ │        │ │        ││
│  │ Poster │ │ Poster │ │ Poster │ │ Poster │ │ Poster │ │ Poster ││
│  │ 2:3    │ │ 2:3    │ │ 2:3    │ │ 2:3    │ │ 2:3    │ │ 2:3    ││
│  │ ratio  │ │ ratio  │ │ ratio  │ │ ratio  │ │ ratio  │ │ ratio  ││
│  │        │ │        │ │        │ │        │ │        │ │        ││
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│
│                                                                      │
│  ◀ (left arrow, edge, desktop only)              (right arrow) ▶   │
└──────────────────────────────────────────────────────────────────────┘

Card Dimensions (in row):
  - Width: 200px (desktop), 150px (tablet), 130px (mobile)
  - Aspect Ratio: 2:3
  - Gap: 12px (mobile), 16px (desktop)
  - Border radius: var(--radius-md) (8px)
  - Overflow: hidden

Scroll Behavior:
  - Overflow-x: auto, scrollbar hidden
  - Scroll snap: x mandatory
  - Mouse drag: mousedown + mousemove (desktop)
  - Touch: native scroll with momentum
  - Arrow buttons: scroll by 3 card widths per click
  - Arrow appearance: show on row hover (desktop), always hidden (mobile)
```

### 4.4 Movie Card (Hover / Expanded State)

```
┌──────────────────────────────┐
│  ┌────────────────────────┐  │
│  │                        │  │
│  │    [Movie Poster]      │  │
│  │    (2:3 ratio)         │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  Movie Title                 │  ← white, 14px, font-weight 600
│  ⭐ 8.5  Action  2h 15m     │  ← muted text, 12px
│                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ ▶ Play│ │ ℹ Info│ │ +List │ │  ← icon buttons, 36x36px
│  └──────┘ └──────┘ └──────┘ │
└──────────────────────────────┘

Hover Animation:
  - Transform: scale(1.08) translateY(-8px)
  - Box-shadow: var(--shadow-card-hover)
  - Border-radius: 8px → 12px
  - Z-index: var(--z-card-hover)
  - Transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)
  - Info panel fades in below poster: opacity 0→1, 0.2s delay

Mobile (Touch) — Bottom Sheet Alternative:
  - Tap card → full-screen bottom sheet slides up
  - Sheet height: 50vh
  - Draggable handle at top
  - Shows poster (left), title, rating, buttons (right)
  - Swipe down to dismiss
```

### 4.5 Movie Card (Skeleton Loading)

```
┌──────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Animated gradient shimmer
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │     (1.5s infinite, left to right)
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└──────────────────────┘
  - Background: var(--gradient-skeleton)
  - Animation: background-position 0% to 200%, 1.5s infinite linear
  - Border-radius: same as card
  - Aspect ratio: 2:3
```

### 4.6 Movie Detail Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]                                              [Share] [♥] │  ← Sticky top bar
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           [Full-Width Backdrop Image]                       │   │
│  │           Height: 50vh, with gradient-bottom overlay        │   │
│  │                                                             │   │
│  │     ┌──────────┐                                             │   │
│  │     │  Poster  │   MOVIE TITLE (36px bold)                   │   │
│  │     │  (small) │   ⭐ 8.5  |  2024  |  2h 15m  |  1080p     │   │
│  │     └──────────┘   Action, Thriller                          │   │
│  │                                                             │   │
│  │     [▶ Play Now — Large Button]   [+ My List]               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────┬────────────────────────────────┐   │
│  │  Synopsis                   │  Movie Information            │   │
│  │                             │                                │   │
│  │  A thrilling action-packed   │  Director: John Doe           │   │
│  │  adventure that follows     │  Cast: Actor 1, Actor 2      │   │
│  │  two unlikely allies...     │  Language: English, Hindi     │   │
│  │                             │  Audio: Dual Audio 5.1        │   │
│  │                             │  Quality: 1080p WEB-DL        │   │
│  │                             │  File Size: 2.0 GB            │   │
│  │                             │  Subtitles: Yes (English)     │   │
│  └────────────────────────────┴────────────────────────────────┘   │
│                                                                     │
│  ─── Similar Movies ──────────────────────────────────────────      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │
│  │     │ │     │ │     │ │     │ │     │ │     │                  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Layout Details:
  - Backdrop: width 100%, height 50vh, object-fit cover
  - Gradient overlay: bottom fade to #141414
  - Poster on detail: 180x270px (desktop), 120x180px (mobile), overlaps backdrop
  - Info grid: 2 columns (desktop), 1 column (mobile)
  - Play button: full width on mobile, auto width on desktop
  - Sticky top bar appears on scroll (glass effect)
```

### 4.7 Video Player

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                                                                     │
│                      [VIDEO PLAYBACK AREA]                          │
│                      (16:9 aspect ratio)                            │
│                      Full viewport on mobile                        │
│                                                                     │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Movie Title                              ⚙ Settings   ⛶ FS │ │  ← Controls bar
│  │  ▶ ━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  1:23:45/2:15│ │
│  │  🔊 ━━━━━━●━━━━━━━━━        1x  ▾        CC   PiP        │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

Controls Behavior:
  - Auto-hide after 3 seconds of inactivity
  - Show on mouse move (desktop) or tap (mobile)
  - Controls background: gradient from transparent to rgba(0,0,0,0.8)
  - Progress bar: 4px height, expands to 8px on hover
  - Progress color: --color-brand-primary (#E50914)
  - Buffered indicator: lighter shade behind progress
  - Volume: vertical slider on hover (desktop)
  - Settings menu: quality, speed, subtitles dropdown
  - Fullscreen: native API with fallback

Player Error State:
┌─────────────────────────────────────────┐
│                                         │
│           ⚠ Stream Error                │
│                                         │
│   Unable to play this movie right now.  │
│   The server might be temporarily       │
│   unavailable.                          │
│                                         │
│   [🔄 Try Again]   [← Back to Movie]    │
│                                         │
└─────────────────────────────────────────┘
```

### 4.8 Search

**Search Bar (Header):**
```
Default State:
┌──────────────────────────────────┐
│  🔍 Search movies...             │
└──────────────────────────────────┘
  - Width: 280px (desktop)
  - Border: 1px solid transparent
  - Background: rgba(255,255,255,0.1)

Focused / Active State:
┌──────────────────────────────────┐
│  🔍 Action movies              ✕│
├──────────────────────────────────┤
│  ┌────┐ 2 Guns                   │
│  │ 🎬 │ Action • 2013 • ⭐ 7.3  │
│  └────┘                          │
│  ┌────┐ Mission: Impossible...   │
│  │ 🎬 │ Action • 2023 • ⭐ 8.1  │
│  └────┘                          │
│  ┌────┐ John Wick                │
│  │ 🎬 │ Action • 2014 • ⭐ 7.4  │
│  └────┘                          │
│  ─────────────────────────────── │
│  See all results for "Action" →  │
└──────────────────────────────────┘
  - Width: expands to 400px
  - Border: 1px solid var(--color-brand-primary)
  - Dropdown: max-height 400px, scrollable
  - Results: 6 items max in dropdown
  - Keyboard: Arrow up/down to navigate, Enter to select, Esc to close
  - Debounce: 300ms after last keystroke
```

**Search Results Page (/search?q=action):**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Search results for "action"                            23 found   │
├─────────────────────────────────────────────────────────────────────┤
│  Sort by: [Relevance ▾]   Filter: [All Genres ▾]  [All Years ▾]   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │      │ │      │ │      │ │      │ │      │                    │
│  │ 🎬   │ │ 🎬   │ │ 🎬   │ │ 🎬   │ │ 🎬   │                    │
│  │      │ │      │ │      │ │      │ │      │                    │
│  │Title │ │Title │ │Title │ │Title │ │Title │                    │
│  │⭐ 8.5│ │⭐ 7.3│ │⭐ 6.9│ │⭐ 8.1│ │⭐ 7.4│                    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                    │
│                                                                     │
│  [Load More...]                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.9 Genre Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back        ACTION MOVIES                             23 movies │
├─────────────────────────────────────────────────────────────────────┤
│  Sort: [Recently Added ▾]                        [Grid ▾] [☰ List] │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │      │ │      │ │      │ │      │ │      │ │      │           │
│  │ 🎬   │ │ 🎬   │ │ 🎬   │ │ 🎬   │ │ 🎬   │ │ 🎬   │           │
│  │      │ │      │ │      │ │      │ │      │ │      │           │
│  │Title │ │Title │ │Title │ │Title │ │Title │ │Title │           │
│  │Year  │ │Year  │ │Year  │ │Year  │ │Year  │ │Year  │           │
│  │⭐ 8.5│ │⭐ 7.3│ │⭐ 6.9│ │⭐ 8.1│ │⭐ 7.4│ │⭐ 6.5│           │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │      │ │      │ │      │ │      │ │      │ │      │           │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                                     │
│  [Loading more...]  (infinite scroll)                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.10 My List Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back        MY LIST                                  5 movies   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │      │ │      │ │      │ │      │ │      │                    │
│  │ 🎬♥  │ │ 🎬♥  │ │ 🎬♥  │ │ 🎬♥  │ │ 🎬♥  │  ← heart icon     │
│  │      │ │      │ │      │ │      │ │      │    on saved items  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                    │
│                                                                     │
│  ─── OR Empty State ─────────────────────────────────────           │
│                                                                     │
│                    🎬                                               │
│                                                                     │
│            Your list is empty                                       │
│            Start adding movies you want to watch later              │
│                                                                     │
│            [Browse Movies]                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.11 Continue Watching Row

```
Appears as a row on the homepage when there are in-progress movies.

┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  CONTINUE WATCHING                                         See All > │
│  ┌────────┐ ┌────────┐ ┌────────┐                                    │
│  │Poster  │ │Poster  │ │Poster  │                                    │
│  │        │ │        │ │        │                                    │
│  │ ▶ Play │ │ ▶ Play │ │ ▶ Play │                                    │
│  ├────────┤ ├────────┤ ├────────┤                                    │
│  │ 35%    │ │ 72%    │ │ 10%    │  ← Progress bar at bottom          │
│  └────────┘ └────────┘ └────────┘                                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Progress Bar:
  - Height: 3px
  - Position: absolute bottom of card
  - Color: --color-brand-primary
  - Background: rgba(255,255,255,0.2)
  - Shows percentage on hover tooltip
```

### 4.12 Loading & Empty States

**Page Loading:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Full page skeleton
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│                                                                     │
│  ACTION MOVIES  ▓▓▓▓▓▓▓▓                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│                        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│                        │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

**No Search Results:**
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         🔍                                          │
│                                                                     │
│              No movies found for "xyz123"                           │
│                                                                     │
│         Try checking your spelling or browse by genre              │
│                                                                     │
│              [Browse Genres]   [Clear Search]                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**404 Page:**
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                          404                                        │
│                                                                     │
│              This movie doesn't exist                               │
│              or may have been removed.                              │
│                                                                     │
│              [← Back to Home]                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Animations & Motion Design

### 5.1 Animation Inventory

| Element | Property | Duration | Easing | Trigger |
|---------|----------|----------|--------|---------|
| Page enter | opacity + translateY | 300ms | ease-out | Route change |
| Page exit | opacity | 200ms | ease-in | Route change |
| Card hover | scale + translateY + shadow | 250ms | cubic-bezier(0.4,0,0.2,1) | mouseenter |
| Card hover exit | scale + translateY + shadow | 200ms | ease-in | mouseleave |
| Hero crossfade | opacity | 1000ms | ease-in-out | Auto timer |
| Hero text slide | translateY + opacity | 500ms | ease-out | Hero change |
| Modal open | scale(0.95→1) + opacity | 300ms | ease-out | Click |
| Modal close | opacity + scale(1→0.95) | 200ms | ease-in | Click/Escape |
| Search dropdown | scaleY(0.95→1) + opacity | 200ms | ease-out | Focus |
| Search results | stagger opacity + translateY | 150ms each | ease-out | Typing |
| Row scroll | smooth scroll-behavior | 500ms | cubic-bezier | Arrow click / drag |
| Button hover | background-color + scale | 150ms | ease | mouseenter |
| Button press | scale(0.97) | 100ms | ease | mousedown |
| Skeleton shimmer | background-position | 1.5s | linear | Always (infinite) |
| Toast appear | translateY(100%→0) + opacity | 300ms | ease-out | Event |
| Toast disappear | translateY(0→-20px) + opacity | 200ms | ease-in | Auto/Click |
| Nav menu slide | translateX(-100%→0) | 300ms | ease-out | Hamburger click |
| Bottom sheet | translateY(100%→0) | 300ms | ease-out | Card tap |
| Progress bar | width transition | 300ms | linear | Playback update |
| Loading spinner | rotate | 1s | linear | Always (infinite) |

### 5.2 Framer Motion Variants (Reference)

```javascript
// Page transition
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

// Movie card
const cardVariants = {
  rest: { scale: 1, y: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
  hover: {
    scale: 1.08,
    y: -8,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
  },
};

// Hero banner
const heroVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 1, ease: 'easeInOut' } },
  exit: { opacity: 0, transition: { duration: 1, ease: 'easeInOut' } },
};

// Stagger children (movie rows)
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
```

---

## 6. Responsive Design Breakpoints

### 6.1 Breakpoint Definitions

```css
/* Mobile Small: 320px - 374px (iPhone SE, small Android) */
--bp-xs: 374px;

/* Mobile: 375px - 639px (iPhone, standard Android) */
--bp-sm: 640px;

/* Tablet: 640px - 1023px (iPad, Android tablets) */
--bp-md: 1024px;

/* Desktop: 1024px - 1439px (laptops, standard monitors) */
--bp-lg: 1440px;

/* Large Desktop: 1440px+ (large monitors, TVs) */
--bp-xl: 1440px;

/* Ultra Wide: 1920px+ */
--bp-2xl: 1920px;
```

### 6.2 Responsive Behavior Matrix

| Component | Mobile (<640px) | Tablet (640-1024px) | Desktop (1024-1440px) | Large (1440px+) |
|-----------|-----------------|---------------------|-----------------------|-----------------|
| **Header** | 56px, hamburger | 56px, simplified nav | 64px, full nav | 64px, full nav |
| **Hero** | 60vh, stacked | 70vh, stacked | 85vh, side-by-side | 85vh, larger text |
| **Card (row)** | 130px wide, 2px gap | 150px wide, 12px gap | 200px wide, 16px gap | 200px wide, 20px gap |
| **Card (grid)** | 2 columns | 3 columns | 5-6 columns | 7-8 columns |
| **Card hover** | Tap → bottom sheet | Tap → bottom sheet | Hover → expand | Hover → expand |
| **Detail page** | Single column | Single column | 2-column info | 2-column, wider |
| **Video player** | Full viewport | Full viewport | 16:9 container | 16:9 container |
| **Search** | Full-width bar, full-page results | Expanded bar | 280px expanding | 280px expanding |
| **Nav** | Bottom tab bar + hamburger | Hamburger | Top nav links | Top nav links |
| **Arrows (rows)** | Hidden (touch scroll) | Hidden (touch scroll) | On hover | Always visible |
| **Sort/Filter** | Bottom sheet | Dropdown | Inline bar | Inline bar |

---

## 7. Iconography

Use **Lucide React** icons throughout the application. Key icons:

| Usage | Icon Name | Size |
|-------|-----------|------|
| Play | `play` | 20px (buttons), 48px (hero) |
| Pause | `pause` | 20px |
| Search | `search` | 20px |
| Heart (my list) | `heart` | 20px |
| Info | `info` | 20px |
| Share | `share-2` | 20px |
| Back | `arrow-left` | 20px |
| Close | `x` | 20px |
| Menu | `menu` | 24px |
| Settings | `settings` | 20px |
| Fullscreen | `maximize` | 20px |
| Volume | `volume-2` | 20px |
| Subtitles | `subtitles` | 20px |
| Star (rating) | `star` | 16px |
| Clock (duration) | `clock` | 16px |
| Calendar (year) | `calendar` | 16px |
| Film | `film` | 16px |
| Home | `home` | 20px |
| Grid view | `layout-grid` | 20px |
| List view | `list` | 20px |
| Sort | `arrow-up-down` | 16px |
| Filter | `sliders-horizontal` | 16px |
| Right arrow | `chevron-right` | 16px |
| Left arrow | `chevron-left` | 16px |

---

## 8. Accessibility

- All interactive elements must be keyboard accessible (tab, enter, space, escape)
- Focus visible indicators: 2px solid outline, --color-accent-blue
- Color contrast ratio: minimum 4.5:1 for text, 3:1 for large text
- Alt text on all images (movie title as alt)
- ARIA labels on buttons, links, and interactive regions
- Skip to main content link
- Reduced motion media query: `prefers-reduced-motion: reduce` → disable animations
- Screen reader announcements for dynamic content (search results, toast messages)
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`

---

## 9. Favicon & Branding

- **Favicon:** Movie clapboard or play button icon, red (#E50914) on dark background
- **Open Graph Image:** Generated per movie (poster + title overlay)
- **Page Title Format:** `Movie Title | MovieCloud` (detail), `MovieCloud` (home)
- **Meta Description:** "Stream movies from our collection. Browse, search, and watch instantly."