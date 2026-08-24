---
name: Lumen Studio
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#603e39'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#956d67'
  outline-variant: '#ebbbb4'
  surface-tint: '#c00100'
  primary: '#bc0100'
  on-primary: '#ffffff'
  primary-container: '#eb0000'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a8'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#0059ba'
  on-tertiary: '#ffffff'
  tertiary-container: '#0071e8'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930100'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#d7e2ff'
  tertiary-fixed-dim: '#acc7ff'
  on-tertiary-fixed: '#001a40'
  on-tertiary-fixed-variant: '#004491'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 32px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built for high-output content creators who require a focused, distraction-free environment to manage their digital presence. The brand personality is **Precise, Empowering, and Transparent**. 

The aesthetic follows a **Refined Minimalism** approach. It leverages heavy whitespace to reduce cognitive load, allowing video analytics and content previews to remain the focal point. By stripping away unnecessary ornamentation and utilizing low-contrast structural elements, the interface recedes into the background, ensuring that the creator's content is the most vibrant element on the screen. The emotional response should be one of "calm productivity"—a professional tool that feels as light as a consumer application.

## Colors

The palette is anchored by "YouTube Red" used exclusively for high-intent actions and critical brand touchpoints. 

- **Primary (#FF0000):** Reserved for "Publish," "Upload," and active states of primary navigation.
- **Surface & Background:** The UI utilizes a layered white-on-gray approach. The base background is a very soft gray (#F9F9F9) to reduce eye strain, while primary content containers are pure white (#FFFFFF).
- **Interactive Neutrals:** Secondary actions use a deep charcoal (#282828) for high legibility against white surfaces.
- **Borders:** Low-contrast light grays (#E5E5E5) are used for structural division, ensuring the UI feels "airy" rather than boxed-in.

## Typography

The typography system uses **Inter** for its exceptional legibility and neutral, systematic tone. It provides a "utilitarian-chic" look that stays out of the way of the content.

- **Headlines:** Use tighter letter spacing and semi-bold weights to create a strong visual anchor.
- **Body Text:** Optimized for long-form reading in analytics descriptions and metadata fields with generous line heights.
- **Labels:** Use a small, all-caps style for metadata (e.g., "Views," "Subscribers") to differentiate data points from actionable text.
- **Scale:** On mobile devices, large display type should scale down aggressively to maintain the "airy" feel without causing excessive scrolling.

## Layout & Spacing

This design system employs a **Fluid-Fixed Hybrid** model. 
- **Desktop:** A 12-column grid with a maximum content width of 1440px. The sidebar is fixed at 280px, while the main content area expands.
- **Rhythm:** An 8px linear scale governs all spacing. Use `stack-lg` (48px) to separate major sections, and `stack-md` (24px) for elements within a section.
- **Margins:** Generous page margins (32px+) are mandatory to preserve the minimalistic, "focused" atmosphere. 
- **Mobile:** Transition to a single-column layout with 16px side margins and 16px gutters between cards.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Subtle Shadows** rather than heavy lines or dark fills.

- **Level 0 (Background):** #F9F9F9. The canvas.
- **Level 1 (Cards/Containers):** #FFFFFF. These use a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
- **Level 2 (Modals/Popovers):** #FFFFFF. Elevated with a more pronounced shadow to indicate focus: `0px 12px 32px rgba(0, 0, 0, 0.08)`.
- **Interactive State:** Upon hover, cards should lift slightly by increasing the shadow spread and reducing the Y-offset, creating a tactile "float" effect.

## Shapes

The shape language is **Soft and Approachable**. 

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius. 
- **Large Containers:** Dashboard widgets and main video preview cards use the `rounded-lg` (16px) or `rounded-xl` (24px) scale to soften the overall appearance of the dense data grid.
- **Icons:** Use rounded caps and joins to match the UI's geometry.

## Components

- **Buttons:** 
    - *Primary:* Solid YouTube Red (#FF0000) with white text. 
    - *Secondary:* Ghost style with a light gray border (#E5E5E5) and dark text.
    - *States:* Hovering on primary should darken the red slightly (#D90000); hovering on secondary should apply a faint gray background (#F1F1F1).
- **Input Fields:** Flat styling with a 1px border (#E5E5E5). On focus, the border changes to the primary red with a subtle 2px outer glow.
- **Cards:** White background, 16px rounded corners, and a light shadow. Avoid borders on cards; use the shadow and background contrast to define the edge.
- **Chips:** Used for video tags or status indicators. Highly rounded (pill-shaped) with a light gray background and medium gray text for a low-emphasis look.
- **Video Thumbnails:** Always feature an 8px corner radius. Include a subtle inner stroke (1px white at 10% opacity) to ensure the thumbnail edge is crisp against white backgrounds.
- **Progress Bars:** Use the primary red for the fill and a very light gray for the track. Keep the height slim (4px) to remain elegant.