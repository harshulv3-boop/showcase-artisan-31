# Showcase Studio Pro

PRD — Showcase Studio

AI Dribbble Thumbnail, Product Showcase and App Screenshot Maker

1. Product Vision

Build an AI-assisted design tool that turns raw website screenshots, app screens, dashboards and product visuals into beautiful, professional presentation graphics inspired by the best work on Dribbble.

The product should create:

Dribbble-style thumbnails and shots

Website and web-app showcase graphics

Mobile-app presentation boards

Product Hunt gallery images

Portfolio and case-study covers

Social-media launch graphics

App Store and Play Store screenshot sets later

Core promise:

Upload your product screens, attach visual references, and generate polished showcase designs that look professionally art-directed.

The tool must not simply place screenshots on a gradient background. It should understand composition, hierarchy, typography, perspective, mockups, lighting, depth, branding and how multiple screens should be presented together.

2. Primary Users

UI/UX designers

SaaS founders

Indie hackers

Design studios

App developers

Product marketers

Agencies

Portfolio creators

Product Hunt makers

3. Main Use Cases

Users should be able to:

Turn a website screenshot into a premium showcase image.

Turn multiple mobile screens into a Dribbble presentation.

Present a dashboard inside a laptop/browser mockup.

Create a multi-screen website collage.

Create a dramatic dark or cinematic product shot.

Create a clean minimal SaaS thumbnail.

Create a bold editorial or typography-led showcase.

Create Product Hunt gallery images from the same project.

Export multiple aspect ratios in one click.

Later create App Store and Play Store screenshot sequences.

4. Reference-Driven Generation

This is a core feature.

Users can upload one or more reference images showing the design style they want.

Examples of references may include:

Dribbble shots

website showcase boards

mobile-device compositions

dashboard presentations

editorial layouts

3D mockups

cinematic dark compositions

colorful collages

clean minimalist product shots

Reference Upload

Allow users to attach:

JPG

PNG

WebP

multiple references in one project

Recommended limit for V1:

1–12 reference images

Reference Roles

Users can optionally specify what each reference should influence:

Overall art direction

Composition

Background

Device mockup

Typography

Color palette

Lighting

Perspective

Screen arrangement

Texture

Decorative elements

Default option:

Auto — understand the complete visual style

Reference Strength

Provide:

Subtle influence

Balanced

Strong influence

AI Reference Analysis

The system should extract a temporary style profile from the references:

composition:
color_palette:
background_treatment:
typography_style:
screen_arrangement:
device_treatment:
perspective:
lighting:
shadow_style:
depth:
texture:
density:
decorative_language:
image_crop_style:
overall_mood:


The generated output should visibly reflect the reference style.

Reference Rules

Take inspiration from composition and visual language.

Do not copy logos, names, branded content or proprietary assets.

Do not reproduce a reference pixel-for-pixel.

Preserve the user’s own product screens and branding.

Generate an original presentation using the reference’s design principles.

Do not average unrelated references into a generic result.

When references conflict, ask the user to select a primary reference or choose one automatically and state the chosen direction.

5. Product Inputs

Users can start from:

App Screens

Upload multiple mobile screenshots.

Reorder screens.

Select hero screen.

Select supporting screens.

Detect iOS or Android dimensions.

Preserve the exact original screenshot content.

Website / Web App

Upload one or more website screenshots.

Upload full-page screenshots.

Upload dashboard screenshots.

Paste a website URL for automatic capture later.

Select desktop, tablet and mobile captures.

Existing Project

Later support:

Unlock project

Figma file

Framer page

GitHub project

published URL

Brand Assets

Allow:

Logo

Product name

Headline

Subheadline

Brand colors

Fonts

Product description

CTA

Optional statistics or feature labels

6. Critical Rendering Rule

The tool must not redraw or regenerate the uploaded UI screenshots with AI.

Uploaded screens should remain exact, high-quality image assets.

AI should decide:

which screens to use

their arrangement

scale

crop

perspective

background

mockup

lighting

typography

decorative composition

The original product UI must remain sharp and accurate.

This prevents:

fake UI text

distorted screens

changed logos

broken charts

hallucinated controls

low-fidelity app screenshots

The showcase should be composed using editable HTML/CSS/SVG/canvas elements rather than one flattened AI-generated image wherever possible.

7. Showcase Types

Dribbble Shot

For:

app designs

websites

dashboards

portfolio projects

Common compositions:

single hero device

three-device mobile composition

dashboard in browser frame

angled laptop mockup

screen collage

website montage

split-screen presentation

dark cinematic presentation

editorial poster

full-page showcase board

Product Hunt Gallery

Generate a sequence such as:

Product overview

Main workflow

Key feature

Secondary feature

Use case

Results or benefit

Social Launch Graphic

Presets for:

LinkedIn

X

Instagram

Pinterest

Facebook

YouTube thumbnail

Portfolio / Case Study Cover

Generate:

project cover

Behance-style board

portfolio thumbnail

case-study hero

project grid preview

Website Showcase

Generate:

full-page website mockup

responsive desktop/mobile composition

section collage

device and browser presentation

multi-page website board

App Showcase

Generate:

multiple phone screens

angled device composition

close-up UI crop

feature-by-feature presentation

device-free clean screen layout

8. Style Presets

Provide curated starting directions:

Minimal SaaS

Soft Gradient

Dark Cinematic

Bold Editorial

3D Device Mockup

Clean Product UI

Futuristic Technical

Playful Consumer

Premium Luxury

Brutalist Poster

Dashboard Montage

Full Website Collage

Mobile Screen Stack

Bright Studio

Glass / Glossy

Monochrome

Brand Color Focus

Presets should alter:

layout

background

typography

depth

device treatment

lighting

spacing

decorative elements

They should not only change colors.

9. AI Generation Flow

Step 1 — Upload Product Screens

User uploads:

app screens

website screenshots

dashboard screenshots

product assets

Step 2 — Add References

User uploads one or more inspiration images.

Step 3 — Product Details

Optional:

Product name

Headline

Supporting copy

Logo

Category

Brand colors

Step 4 — Choose Output

Examples:

Dribbble shot

Product Hunt image

Portfolio cover

Website showcase

App showcase

Social graphic

Step 5 — Choose Style

Auto from references

Select preset

Combine preset with references

Step 6 — Generate

Generate:

4–6 clearly different showcase concepts

Variants should differ in:

composition

screen placement

crop

perspective

background

typography

visual focal point

They must not be simple color swaps.

Step 7 — Edit

User chooses a result and edits it.

Step 8 — Export

Export one size or a complete asset bundle.

10. Smart Screen Selection

If the user uploads many screens, AI should identify:

strongest visual screen

most important product workflow

most visually varied screens

screens that communicate the product quickly

screens suitable for close-ups

screens suitable for supporting positions

The system should suggest:

Hero screen
Supporting screen 1
Supporting screen 2
Optional detail crop

Users can override every selection.

11. Composition Engine

Support the following layout patterns:

Single centered screen

Single angled device

Hero screen with supporting screens

Three-device fan

Floating screen stack

Desktop + mobile responsive pair

Browser window presentation

Laptop mockup

Phone in hand

Tablet composition

Screen grid

Editorial collage

Full-page website montage

Vertical case-study board

Split background

Oversized typography with product screen

Product screen with 3D decorative objects

Dashboard close-up

Screen crop with feature callouts

Perspective screen wall

Multi-page website overview

Every composition should preserve:

safe spacing

clear hierarchy

readable UI

balanced negative space

focal-point control

12. Mockups and Presentation Elements

Allow users to add:

iPhone mockups

Android mockups

browser windows

laptops

tablets

desktop monitors

floating panels

hands holding devices

device-free screen frames

Controls:

Device model

Frame color

Bezel visibility

Perspective

Rotation

Scale

Shadow

Reflection

Screen brightness

Corner radius

Device depth

13. Background System

Support:

Solid color

Brand gradient

Mesh gradient

Radial glow

Dark cinematic

Studio backdrop

Abstract shapes

Grain/noise

Grid

Soft clouds

3D objects

Editorial paper

Minimal neutral

Uploaded custom background

Controls:

Color

Gradient points

Blur

Noise

Brightness

Saturation

Vignette

Texture

Glow

Background image position

14. Typography and Copy

AI may generate:

Headline

Subheadline

Feature label

Statistic

Small annotation

CTA

Examples:

“Ship better campaigns”

“One workspace. Every channel.”

“Turn ideas into live products.”

“Built for teams that move fast.”

Users can:

edit all copy

regenerate headline

shorten copy

change tone

hide copy completely

select font

adjust size, weight and alignment

The tool should not invent unsupported product claims or statistics.

15. Visual Editing

The selected showcase should remain editable.

Users should be able to:

Select element

Move

Resize

Rotate

Reorder

Replace screenshot

Change crop

Change perspective

Change background

Edit text

Edit colors

Change device

Adjust shadows

Adjust blur

Adjust opacity

Duplicate

Delete

Lock

Group

Undo

Redo

Layers

Include a simple Layers panel:

Background

Decorative assets

Screens

Device frames

Text

Logo

Callouts

Regenerate Selected Area

Allow:

Regenerate background

Try another composition

Change device treatment

Rewrite headline

Restyle text

More like this

Create variation

Do not regenerate the whole design when only one part is selected.

16. Brand Kit

Allow reusable brand profiles with:

Logo

Primary color

Secondary color

Accent color

Typography

Brand tone

Product description

Applying a Brand Kit should influence:

background

typography

labels

decorative accents

CTA

device treatment

It should not recolor the actual uploaded product screenshots unless explicitly requested.

17. Export

Support:

PNG

JPEG

WebP

PDF later

Quality options:

1×

2×

3×

4×

Allow:

Transparent background

Custom dimensions

Crop to content

File compression

Export selected frame

Export all variants

Export full campaign bundle

18. Export Presets

Add one-click presets for:

Dribbble shot

Dribbble thumbnail

Product Hunt gallery

LinkedIn landscape

X landscape

Instagram square

Instagram portrait

Pinterest portrait

YouTube thumbnail

Portfolio cover

Website hero

Custom size

The design should adapt intelligently to each ratio rather than simply being cropped.

19. Projects and History

Support:

New project

Rename

Duplicate

Delete

Save

Recent projects

Auto-save

Version history

Restore version

Favorite result

Save as reusable template

Each generated variant should remain available until deleted.

20. Quality Critic

Before showing a generated result, run an automated visual QA check.

Evaluate:

Screenshot sharpness

Text readability

Composition

Alignment

Empty-space balance

Brand consistency

Reference adherence

Screen crop quality

Device perspective

Visual hierarchy

Export safety

Reject or automatically repair outputs where:

screenshots are stretched

important content is cropped

screens overlap badly

copy is unreadable

devices intersect incorrectly

layout feels cluttered

reference style is ignored

output appears like a generic template

21. User Interface

Sidebar

Home

New Showcase

Projects

Templates

Brand Kits

Exports

Settings

Creation Workspace

Left Panel

Product screens

References

Brand assets

Output type

Style

Text

Center Canvas

Editable showcase

Zoom

Pan

Select

Move

Resize

Right Panel

Layout

Background

Device

Typography

Appearance

Export

Results View

Show generated concepts in a large grid.

Each result:

Use this

Edit

More like this

Regenerate

Save

Export

22. App Store / Play Store Mode — Phase 2

Add a separate mode later:

Store Screenshots

Do not mix this with the Dribbble showcase flow.

Inputs

App screens

Product description

Key features

Brand Kit

Platform

Device sizes

Language

Outputs

Generate a complete ordered screenshot story:

Core value proposition

Main feature

Secondary workflow

Personalization

Trust or results

Final CTA

Controls

App Store

Google Play

iPhone sizes

Android sizes

Tablet sizes

Screenshot count

Localization

Device mockups

Headline length

Safe areas

Later Features

Bulk language localization

Automatic text resizing

Store-compliant dimensions

Multi-device export

Screenshot ordering suggestions

A/B variants

Metadata and app-description generation

23. Future Features

URL → automatic screenshots

Unlock project import

Figma import

Animated Dribbble shots

Video mockups

GIF export

Product demo recording

Team collaboration

Comments

Template marketplace

AI-generated 3D assets

Custom device models

Bulk campaign generation

Public share links

Store screenshot localization

Analytics for creative variants

24. MVP Scope

Build V1 with:

Upload website/app screenshots

Upload visual references

Reference-style analysis

Product details and Brand Kit

Dribbble/app/website showcase modes

Generate 4–6 layout variants

Auto-select best screens

Editable screenshots, text and background

Device mockups

Perspective/shadow controls

Style presets

Undo/redo

Project saving

PNG/JPEG/WebP export

Common aspect-ratio presets

Visual quality validation

Do not build App Store publishing APIs, team collaboration or animation in V1.

25. Acceptance Criteria

The product is ready when:

Users can upload at least 10 product screens.

Users can attach multiple reference images.

Generated designs visibly follow the references.

The uploaded product UI remains unchanged and sharp.

At least four genuinely different compositions are generated.

Users can replace/reorder screens.

All text is editable.

Background, device, layout and appearance are editable.

Important screenshot content is not accidentally cropped.

Exports are high-resolution and production-ready.

Projects save and reopen correctly.

Undo/redo works.

Individual variants can be regenerated independently.

The app creates results comparable in presentation quality to the attached Dribbble references.

The result does not look like a generic screenshot placed over a random gradient.

26. Core Product Rule

Use the uploaded product screens as exact source assets, use the attached references as art-direction intelligence, and create an original, editable showcase composition that feels professionally designed—not AI-generated. Also use mobbins or dribble as further reference if needed, I've attached images as well.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ab430405-9a11-48bd-97d2-a423d6176893).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
