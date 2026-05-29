# LingNote — Writing Atmosphere Skill

## Core Philosophy

LingNote is not a “note management tool.”
It is a cognitive writing space.

The interface must never compete with thought itself.
All visual systems exist to reduce friction, stabilize attention, and maintain creative flow.

Themes are not “skins.”
They are writing atmospheres.

The purpose of atmosphere design is not visual novelty, but emotional continuity:

* helping users stay focused,
* reducing cognitive fatigue,
* supporting different modes of thinking.

The UI must feel:

* calm,
* breathable,
* restrained,
* emotionally quiet.

Users should gradually forget the interface exists.

---

# Global Design Principles

## 1. Content is always the protagonist

The editor body is the visual center of the product.

Never allow:

* backgrounds,
* gradients,
* decorations,
* cards,
* AI panels,
* shadows,
* colors

to overpower reading and writing.

The interface must visually “step back.”

---

## 2. Low Saturation Only

All themes must use:

* low saturation,
* soft contrast,
* muted colors.

Forbidden:

* neon colors,
* RGB effects,
* high-contrast gaming aesthetics,
* decorative wallpapers,
* strong gradients,
* visual noise.

LingNote is a thinking environment, not a showcase UI.

---

## 3. Atmosphere over Decoration

Every visual decision must answer:

> “Does this improve cognitive comfort?”

not:

> “Does this look impressive?”

Good atmosphere design should create:

* emotional stability,
* reading comfort,
* long-session endurance,
* creative immersion.

---

## 4. Motion Must Be Invisible

Animations should feel natural and nearly unnoticeable.

Recommended:

* 150ms ~ 250ms easing
* opacity transitions
* soft hover fades
* slight blur interpolation

Forbidden:

* bounce animations
* elastic transitions
* exaggerated motion
* flashy interactions

Motion exists to preserve flow, not attract attention.

---

# Theme System

Themes should be called:

* Writing Modes
  or
* Spaces

Never call them:

* “skins”
* “themes”
* “personalization packs”

The goal is psychological positioning, not customization.

---

# Writing Spaces

## 1. Paper Space

### Emotional Goal

Deep thinking and long-form writing.

### Atmosphere

Warm paper under desk light.

### Colors

Background:

```css
#F6F3EE
```

Primary Text:

```css
#222222
```

Secondary Text:

```css
#7A7A7A
```

Borders:

```css
rgba(0,0,0,0.06)
```

### Typography

Body:

* Noto Serif SC

Headings:

* Inter

### Characteristics

* warm
* literary
* slow-paced
* low fatigue

Best for:

* essays
* journals
* thesis writing
* reflective thinking

---

## 2. Mist Space

### Emotional Goal

Modern clarity and technical focus.

### Atmosphere

Morning fog inside a minimal workspace.

### Colors

Background:

```css
#F5F7FA
```

Cards:

```css
rgba(255,255,255,0.72)
backdrop-filter: blur(18px)
```

Primary Text:

```css
#1F2937
```

Secondary Text:

```css
#94A3B8
```

Hover:

```css
rgba(255,255,255,0.92)
```

### Typography

* Inter
* Geist

### Characteristics

* rational
* minimal
* calm
* modern

Best for:

* programming notes
* AI research
* technical writing
* product design

---

## 3. Midnight Space

### Emotional Goal

Late-night immersion.

### Atmosphere

Quiet thinking after midnight.

### Colors

Background:

```css
#111315
```

Editor:

```css
#161A1D
```

Primary Text:

```css
#E6EAF0
```

Secondary Text:

```css
#7D8590
```

Accent:

```css
#A5B4FC
```

Accent color must be used minimally.

### Characteristics

* immersive
* quiet
* focused
* emotionally isolated

Best for:

* long writing sessions
* deep concentration
* late-night drafting

### Motion Rules

Animations should feel slower and softer in this mode.

---

## 4. Forest Space

### Emotional Goal

Reduce cognitive pressure.

### Atmosphere

Rainy library near a forest.

### Colors

Background:

```css
#EEF2EC
```

Cards:

```css
rgba(255,255,255,0.68)
```

Primary Text:

```css
#1F2A22
```

Accent:

```css
#6B8F71
```

Tag Background:

```css
rgba(107,143,113,0.12)
```

### Characteristics

* soft
* breathable
* emotionally calming
* anti-anxiety

Best for:

* brainstorming
* casual note-taking
* creative ideation
* recovery writing

---

# Typography Rules

Typography defines cognitive rhythm.

The text system must maintain:

* stable spacing,
* readable density,
* visual breathing room.

Recommended:

* Body size: 17px ~ 18px
* Line height: 1.8 ~ 1.95
* Max content width: 760px ~ 820px

Headings should feel strong but restrained.

Avoid:

* overly bold typography,
* condensed spacing,
* excessive visual hierarchy.

---

# AI Visual Rules

AI is not the visual protagonist.

AI should feel:

* embedded,
* quiet,
* contextual,
* assistive.

Avoid:

* glowing effects,
* bright AI colors,
* chatbot aesthetics,
* oversized AI panels.

AI should visually behave like:

* metadata,
* writing assistance,
* contextual intelligence.

Never like:

* a separate AI application.

---

# Interaction Rules

## Progressive Disclosure

Most actions should remain hidden until needed.

Use:

* hover reveal,
* subtle floating controls,
* contextual appearance.

The interface should resemble paper most of the time.

---

## Direct Manipulation

Users should directly interact with content:

* drag,
* resize,
* move,
* reorder.

Avoid configuration-heavy workflows.

Content should feel alive, not form-based.

---

# Forbidden Design Patterns

Never introduce:

* wallpaper systems,
* gaming aesthetics,
* RGB palettes,
* anime-style personalization,
* noisy textures,
* oversized glassmorphism,
* heavy gradients,
* excessive shadow layers,
* over-animated UI.

If the interface becomes visually memorable,
it is already too loud.

---

# Final Principle

The highest-quality writing UI is not the one users admire.

It is the one users forget exists while thinking.
