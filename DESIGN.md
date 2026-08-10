# Gizmo AI Study Engine - Design System & UI/UX Hierarchy

## 1. Visual Identity & Theme Palette

Gizmo AI Study uses a modern, high-contrast, rich glassmorphism theme styled around our transparent, animated mascot **Bee** — featuring clean cut-out PNG frames (`/public/bee_frame_1.png` to `/public/bee_frame_4.png` and `/public/bee_spritesheet.png`).

```css
:root {
  /* Brand Colors */
  --primary-sky-blue: #1ea5fc; /* Official BEE App Sky Blue */
  --primary-500: #6366f1; /* Indigo */
  --primary-600: #4f46e5;
  --accent-cyan: #06b6d4;  /* Vibrant Cyan */
  --accent-purple: #8b5cf6;/* Deep Purple */
  --accent-bee-yellow: #ffcf25; /* Bee Mascot Yellow */
  --accent-bee-red: #e53935;  /* Heart / Accent Red */
  --accent-amber: #f59e0b; /* Streak Flame */
  --accent-emerald: #10b981;/* Success / Mastered */
  --accent-rose: #ef4444;   /* Need Review / Wrong */

  /* Division League Tier Colors */
  --tier-bronze: #cd7f32;
  --tier-silver: #c0c0c0;
  --tier-gold: #ffd700;
  --tier-diamond: #00ffff;
  --tier-master: #ff00ff;

  /* Dark Glassmorphism Backgrounds */
  --bg-dark-900: #0b0f19;
  --bg-dark-800: #111827;
  --bg-glass-card: rgba(17, 24, 39, 0.7);
  --bg-glass-border: rgba(255, 255, 255, 0.1);
  --bg-glass-hover: rgba(255, 255, 255, 0.05);

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Shadows & Lighting */
  --glow-bee: 0 0 25px rgba(30, 165, 252, 0.45);
  --glow-heart: 0 0 20px rgba(229, 57, 53, 0.45);
  --glow-primary: 0 0 25px rgba(99, 102, 241, 0.4);
  --shadow-card: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

---

## 2. Transparent Cut-Out Animated Mascot Bee (`BeeAnimatedMascot.jsx`)

- **Transparent Background Extraction**:
  - The blue tile background has been removed via precision floodfill. ONLY the cut-out yellow and black cartoon Bee character (with winks, speed trails, and waving wings) is rendered.
- **4-Frame Animation Cycle**:
  - **Frame 1 (`bee_frame_1.png`)**: Flying upward right with sparkles.
  - **Frame 2 (`bee_frame_2.png`)**: Speed dashing right with flight trail line.
  - **Frame 3 (`bee_frame_3.png`)**: Flying upward left with curved path.
  - **Frame 4 (`bee_frame_4.png`)**: Happy waving hands/wings.
- **Loading Screen & Flight Paths (`@keyframes bee-flight-path`)**:
  - Bee floats, flies across, and bobs around the loading screen in a dynamic sinusoidal path (`@keyframes bee-flight-path`) against neon glowing orbit rings without any blue background box!

---

## 3. Unlimited Hearts & Gamification UI Widgets

- **Unlimited Hearts Widget (`Heart` + `Infinity` badge)**:
  - Positioned in the header navigation bar next to the Streak Flame and XP counter.
  - Features a glowing red heart icon with a small gold/cyan infinity symbol (`∞`).
  - When an answer is incorrect or rated "Again", a gentle heart pulse animation (`@keyframes heart-pulse`) triggers, accompanied by Bee's reassuring words: *"Unlimited Hearts active — keep practicing!"*.

- **Weekly Leaderboard & Division Leagues**:
  - Displays top 10 competitors in the current division (Bronze -> Silver -> Gold -> Diamond -> Master).
  - Highlights top 3 with Gold, Silver, and Bronze trophy crowns (`Trophy`, `Award`, `Crown`).
  - Tracks Weekly XP, global rank positions, and promotion/relegation zones.

---

## 4. Gamified Sound & Audio System (Gizmo-Style SFX)

Gizmo AI Study integrates a zero-latency **Web Audio Synthesizer** (`soundService.js`) providing instant dopamine-driven audio cues:

| Trigger Event | Audio Effect | Synth Note Profile |
|---|---|---|
| **Card Flip** | Subtle Paper/Card Pop | Short 50ms sine pop (`C5` -> `E5`) |
| **Good / Easy Rating** | Uplifting Harmonic Chime | Two-tone major third (`E5` -> `G#5`) |
| **Again / Hard Rating** | Low Soft Pulse + Heart Bounce | Soft sine drop (`G3` -> `Eb3`) |
| **Round Complete** | **Gizmo Victory Fanfare** | Arpeggiated victory chord sequence (`C5-E5-G5-C6`) |
| **Streak Flame Increase** | Fire Swoosh | Filtered noise sweep + pitch rise |
| **League Promotion** | Grand Fanfare + Confetti | Ascending pentatonic chord fanfare |

---

## 5. Iconography Standards (Lucide Icons)

Only standard, widely-recognized Lucide icons are used across the interface:

| Functional Area | Primary Icon | Secondary / Context Icons |
|---|---|---|
| **Navigation** | `LayoutDashboard` | `BookOpen` (Decks), `Trophy` (Leaderboard), `Sparkles` (AI Studio), `Network` (Graph), `BarChart3` (Stats) |
| **Gamification & Hearts**| `Heart` (Unlimited Hearts) | `Flame` (Streak), `Trophy` (Leagues), `Zap` (XP), `Crown`, `Award`, `Shield` |
| **Mascot & AI Modes** | `Bot` ("Ask Bee!") | `Mic` (Feynman/Voice), `EyeOff` (Image Occlusion), `Lightbulb` (Mnemonic), `TrendingUp` (Exam Predictor) |
| **File Upload & OCR** | `UploadCloud` | `FileText` (PDF), `Image` (Scan), `Camera` (Photo), `FileSpreadsheet` |
| **Study Actions** | `RotateCcw` (Flip) | `CheckCircle2` (Easy/Good), `XCircle` (Again), `HelpCircle` (Hint), `Volume2` (Audio) |

---

## 6. Comprehensive Component & Layout Hierarchy

```
App Shell (Responsive Main Layout)
├── App Boot Splash Loader Overlay (Conditional State)
│   ├── Transparent Flying Cut-Out Bee Mascot (`BeeAnimatedMascot.jsx` + `bee-flight-path`)
│   ├── Rotating Concentric Orbit Rings (`@keyframes pulse-orbit`)
│   └── Shimmer Progress Gauge + Bee Speech Bubble Quotes
│
├── Header & Top Navigation Bar
│   ├── Transparent Animated Bee Mascot Avatar (`BeeAnimatedMascot.jsx`) + "Gizmo AI" Title & Status Badge
│   ├── Global Deck Search Input (`Search`)
│   ├── Unlimited Hearts Widget (`Heart` + `Infinity` badge)
│   ├── Streak Counter Widget (`Flame` + Count + Glow)
│   ├── User XP Gauge (`Zap` + Points)
│   ├── Sound SFX Toggle Button (`Volume2` / `VolumeX`)
│   ├── API Key Setup Quick Button (`Key`)
│   └── User Profile & League Tier Badge (`Trophy` / `Crown`)
│
├── Sidebar Navigation (Collapsible)
│   ├── Dashboard Tab (`LayoutDashboard`)
│   ├── My Library / Decks (`BookOpen`)
│   ├── AI Studio & Document Generator (`Sparkles`)
│   ├── Weekly Leaderboard & Leagues (`Trophy`)
│   ├── Ask Bee! AI Tutor (`Bot`)
│   ├── Feynman Method Arena (`Mic`)
│   ├── Visual Image Occlusion Studio (`EyeOff`)
│   ├── Knowledge Graph Explorer (`Network`)
│   └── Exam Predictor & Analytics (`BarChart3`)
│
└── Main Content Container (Dynamic Route View)
    │
    ├── VIEW 1: Dashboard View
    │   ├── Daily Goal Progress Card (Circular Progress + XP Gauge + Bee Cheer)
    │   ├── Unlimited Hearts Status Banner (`Heart` + `∞`)
    │   ├── Due Today Deck Carousel (Spaced Repetition Review Queue)
    │   ├── Quick Create / Upload Scanner Drag & Drop Dropzone
    │   └── Weekly Division League Standings Mini-Card
    │
    ├── VIEW 2: File Upload & AI Generator Studio
    │   ├── Multimodal Dropzone (PDF, Images, Scans, Lecture Notes)
    │   ├── Holographic Scanning Beam Animation (`laser-scan`)
    │   ├── Extraction Mode Switcher (Flashcards, Quizzes, Image Occlusion)
    │   └── Generated Flashcards & Quiz Preview / Editor Grid
    │
    ├── VIEW 3: Study Arena (Active Recall Mode)
    │   ├── Session Progress Bar & Score Counter
    │   ├── Interactive 3D Card Container (Perspective 1000px)
    │   │   ├── Card Front (Prompt, Image/Scan Context, Occlusion Mask)
    │   │   └── Card Back (Answer, Explanation, Key Takeaways, Dynamic Mnemonic)
    │   ├── Unlimited Hearts Safety Indicator (`Heart` + `∞`)
    │   ├── Voice Response Input & Speech Synthesis Toggle (`Mic` / `Volume2`)
    │   ├── 4-Rating Feedback Buttons (Again: 1d, Hard: 3d, Good: 6d, Easy: 12d)
    │   ├── Round Complete Summary Overlay (Transparent Bee Victory Flying Dance + Fanfare SFX)
    │   └── "Ask Bee!" AI Tutor Drawer (`Bot` - Ask Bee for Step-by-Step Guidance)
    │
    ├── VIEW 4: Weekly Leaderboard & Division Leagues
    │   ├── Current League Tier Header (Bronze / Silver / Gold / Diamond / Master)
    │   ├── Top 3 Podium Winners (`Crown`, Gold/Silver/Bronze Badges)
    │   ├── Live Competitors Ranking Table (Rank, User, Weekly XP, Streak)
    │   └── Promotion / Relegation Zone Visual Indicators
    │
    ├── VIEW 5: Feynman Method Studio ("Explain to Bee")
    │   ├── Card Concept Prompt
    │   ├── Microphone / Audio Waveform Speech Input
    │   ├── Bee's Semantic Evaluation Card (Strengths, Gaps, Misconceptions)
    │   └── XP Mastery Rating Gauge
    │
    ├── VIEW 6: Interactive Knowledge Graph Explorer
    │   ├── 2D Interactive Concept Node Network
    │   └── Topic Connections & Mastery Heatmaps
    │
    └── VIEW 7: Exam Predictor & Memory Analytics
        ├── Predicted Exam Score (e.g. 92% Ready)
        ├── Forgetting Curve Graph & Retention Forecast
        └── Weakest Concepts Diagnostic Table
```

---

## 7. CSS Animations Keyframe Library

```css
/* 4-Frame Transparent Bee Mascot Frame Stepping */
@keyframes bee-frame-loop {
  0% { background-position: 0% 0; }
  25% { background-position: 33.33% 0; }
  50% { background-position: 66.66% 0; }
  75% { background-position: 100% 0; }
  100% { background-position: 0% 0; }
}

/* Flying Motion Path Across Loading Screen */
@keyframes bee-flight-path {
  0% { transform: translate(-30px, 0px) rotate(-5deg); }
  25% { transform: translate(15px, -15px) rotate(3deg); }
  50% { transform: translate(30px, 5px) rotate(-3deg); }
  75% { transform: translate(-10px, 15px) rotate(4deg); }
  100% { transform: translate(-30px, 0px) rotate(-5deg); }
}

/* Floating Bob Animation */
@keyframes bee-float-bob {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(3deg); }
}

/* Heart Pulse Animation */
@keyframes heart-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.25); filter: drop-shadow(0 0 10px rgba(229, 57, 53, 0.8)); }
  100% { transform: scale(1); }
}
```
