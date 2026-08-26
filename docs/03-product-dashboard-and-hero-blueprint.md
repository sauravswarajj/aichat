# 03 — Product Dashboard & Hero Animation Blueprint

## 1. Vision

Build a polished personal multi-AI developer workspace for coding, prompt engineering, image/video prompts, research, and other tasks.

Core experience:

```text
Login
  ↓
Dashboard
  ↓
New Chat
  ↓
Choose task + AI models/roles
  ↓
Multiple AI agents collaborate
  ↓
Live conversation
  ↓
Final result
  ↓
Conversation automatically saved as a thread
```

This is initially a personal project and an interview/portfolio showcase.

---

## 2. Product Structure

### Public

- Landing page
- Login
- Signup
- Forgot password

### Authenticated app

- Dashboard
- New Chat
- Thread/history sidebar
- Active conversation
- AI model/agent configuration
- Live AI collaboration
- Final result
- Search threads
- Settings
- Profile
- Logout

---

## 3. Dashboard

Suggested structure:

```text
┌───────────────────────────────────────────────────────┐
│ Logo / AI Workspace       Search     Profile / Menu   │
├───────────────┬───────────────────────────────────────┤
│ + New Chat    │                                       │
│               │          Main Workspace               │
│ Threads       │                                       │
│               │       Welcome / Active Chat           │
│ Today         │                                       │
│ Yesterday     │                                       │
│ Previous 7d   │                                       │
│               │                                       │
│ Settings      │                                       │
└───────────────┴───────────────────────────────────────┘
```

The final visual system should be designed in Google Stitch.

---

## 4. Thread System

Every new conversation creates a separate thread.

Example:

```text
Thread A
 ├── User message
 ├── AI response
 ├── User message
 └── AI response

New Chat
 ↓

Thread B
 ├── User message
 └── AI response
```

Thread A remains saved and can be reopened later.

A new thread must not accidentally inherit unrelated context from another thread.

### Sidebar

```text
THREADS

Today
────────────────
Fix authentication API
Improve Holi banner prompt
Design database schema

Yesterday
────────────────
AWS deployment issue
React performance review

Previous 7 days
────────────────
AI workspace architecture
Video prompt improvement
```

Thread titles should be generated from the first meaningful user request, with an option for the user to rename them.

---

## 5. Conversation Memory

Messages belong to their thread.

Suggested relationship:

```text
User
 └── Threads
       └── Messages
             └── Agent Runs
                   └── Agent Messages
```

Reopening a thread loads its previous conversation and gives the AI workflow the appropriate thread context.

Unrelated threads must remain isolated.

---

## 6. AI Collaboration

The UI should show the models working as distinct roles:

```text
USER
Create a professional Diwali banner prompt.

        ↓

GEMINI — Creator
Creates initial concept.

        ↓

QWEN — Reviewer
Finds weaknesses.

        ↓

NVIDIA — Critic
Checks missing details and feasibility.

        ↓

GEMINI — Optimizer
Improves the result.

        ↓

FINALIZER
Returns the final result.
```

Roles are configurable and are not permanently tied to a provider.

Example:

```text
Creator
Provider: Gemini
Model: [selected model]

Reviewer
Provider: Qwen
Model: [selected model]

Critic
Provider: NVIDIA
Model: [selected model]

Finalizer
Provider: OpenRouter
Model: [selected model]
```

---

## 7. Task Types

The UI should support:

- Coding
- Prompt Engineering
- Image Prompt
- Video Prompt
- Study / Research
- General

The task can recommend models, but the user can override them.

---

# 8. Hero Section

The hero should be the visual signature of the portfolio.

It should communicate the product's core idea:

```text
One task
   ↓
Multiple AI models
   ↓
Collaborate
   ↓
Review
   ↓
Improve
   ↓
Better final result
```

Do not make it a random decorative animation.

---

# 9. Hero Animation Technique

Use the technique from the supplied reference PDF, but adapt it to this project.

```text
START IMAGE
     +
END IMAGE
     ↓
Google Flow
     ↓
~8 second video
     ↓
Extract JPG frames
     ↓
Put frames in project
     ↓
Scroll controls frame index
```

The reference requires the beginning and ending images to preserve camera position, focal length, perspective, composition, object placement, background geometry and lighting direction. That continuity principle should be retained.

The supplied PDF is only a technical reference; its real-estate/cosmetics content must not be copied into this project.

---

# 10. Recommended Hero Concept

## "AI Collaboration Comes Alive"

### Start state

A dark premium AI developer workspace.

- Near-black charcoal background
- Subtle graphite surfaces
- Restrained blue/violet/cool-white accents
- Very subtle AI network
- Dashboard barely visible
- Headline barely visible
- Large negative space

Headline:

```text
Think. Build. Review. Refine.
```

Supporting text:

```text
A personal multi-AI workspace where models collaborate to create better results.
```

### End state

The exact same composition becomes fully active.

- AI nodes illuminate
- Connections become visible
- Dashboard becomes clearer
- Hero text becomes fully visible
- Lighting becomes slightly brighter
- Existing elements gain clarity

The camera and composition should remain essentially identical.

---

# 11. START FRAME — Image Generation Prompt

```text
Create an ultra-premium cinematic hero image for a futuristic personal AI developer workspace, designed specifically as the OPENING FRAME of a scroll-driven website animation.

Aspect ratio: 16:9, 1920×1080.

Create a sophisticated dark developer environment with a near-black charcoal background, subtle graphite surfaces, soft atmospheric haze, extremely restrained blue-violet and cool-white light accents, and premium cinematic lighting.

The scene represents a multi-AI collaboration workspace, but the interface must be mostly hidden at this opening state.

Place a central abstract AI orchestration network in the middle-right area: several small elegant glowing nodes connected by extremely subtle thin lines, representing multiple AI agents communicating. The nodes should be dim and only partially visible.

On the left side, reserve substantial negative space for hero typography.

Include a very subtle futuristic developer dashboard structure in the background, almost disappearing into darkness. Do not show readable UI details yet.

The main visual object should feel like a premium AI command center rather than a generic sci-fi scene.

The camera must be stable and front-facing with slight cinematic depth perspective. Use the exact same camera position, lens perspective, object positions, background geometry and lighting direction that can be maintained for the ending frame.

The hero headline should exist in its FINAL position but be only 5–8% visible, almost blending into the background.

Use the exact text:

Think. Build. Review. Refine.

Supporting text:

A personal multi-AI workspace where models collaborate to create better results.

The typography must remain perfectly aligned in its final location but almost invisible.

No CTA button.
No navigation.
No browser frame.
No random icons.
No stock imagery.
No people.
No hands.
No laptop mockup.
No unrelated objects.

The composition must contain large negative space and must be designed specifically to transition into a brighter, fully activated ending frame.

Extremely photorealistic premium technology campaign.
High-end product design aesthetic.
Cinematic studio lighting.
Subtle volumetric atmosphere.
Soft reflections.
Controlled highlights.
Ultra-clean materials.
Realistic depth.
Premium developer-tool branding.
No excessive neon.
No cyberpunk clutter.
No visual noise.

This is the FIRST FRAME of a continuous cinematic website animation.
Prioritize composition continuity over dramatic variation.
```

---

# 12. END FRAME — Image Generation Prompt

```text
Create the ENDING FRAME of the exact same premium cinematic hero scene for a futuristic personal AI developer workspace.

Aspect ratio: 16:9, 1920×1080.

CRITICAL CONTINUITY REQUIREMENT:

Use the exact same camera position, camera height, lens perspective, focal length, perspective, background geometry, AI-node positions, typography positions, surface positions, and overall composition as the opening frame.

Do not redesign the scene.
Do not move the camera.
Do not change the layout.
Do not introduce new major objects.

The scene should now represent the fully activated state of the same AI workspace.

The central multi-AI orchestration network should now be clearly visible and elegantly illuminated. The AI nodes should glow softly and the connecting lines should become visible, creating a sophisticated network showing multiple AI agents collaborating.

The subtle dashboard structure in the background should now become visible enough to communicate that this is a real developer AI workspace.

Reveal the hero typography completely.

Use the exact text:

Think. Build. Review. Refine.

Supporting text:

A personal multi-AI workspace where models collaborate to create better results.

Typography should now be fully visible, crisp, elegant, modern and highly readable.

The background should become slightly brighter and more dimensional than the opening frame while preserving the same overall color palette.

Increase only the intensity of existing lighting, existing AI nodes, existing connection lines and existing atmospheric light.

Do NOT change the camera.
Do NOT change perspective.
Do NOT change object positions.
Do NOT change the AI network geometry.
Do NOT add navigation.
Do NOT add CTA buttons.
Do NOT add browser UI.
Do NOT add people.
Do NOT add random objects.

The ending frame must look like the fully activated state of the exact same scene immediately after a smooth cinematic transition from the opening frame.

Premium AI developer-tool campaign.
Extremely polished.
Minimal.
Sophisticated.
Cinematic.
Photorealistic.
High-end product design.
Controlled lighting.
Subtle volumetric rays.
Soft depth of field.
No excessive neon.
No cyberpunk clutter.
No visual noise.
```

---

# 13. Google Flow Animation Prompt

Use the START and END images as the beginning and ending frames.

```text
Create one continuous cinematic transition between the supplied opening and ending frames.

Maintain identical camera position, camera height, focal length, perspective, background geometry, typography position, AI-node positions, connection geometry and overall composition.

Do not move the camera.
Do not zoom.
Do not pan.
Do not rotate the scene.
Do not change the positions of any objects.

Animate only the visual activation of the existing scene.

The transition should begin with the AI workspace almost hidden in darkness.

Gradually increase the visibility and illumination of the existing AI nodes.

Gradually reveal the existing connection lines between the AI agents.

Gradually increase the visibility of the existing dashboard structure.

Gradually increase the ambient lighting and atmospheric depth.

Gradually reveal the existing hero typography from approximately 5–8% visibility to 100% visibility.

The transition must feel like an AI workspace waking up and becoming fully active.

The final state must match the supplied ending frame.

Use smooth cinematic motion and subtle atmospheric movement only.

No new objects.
No object morphing.
No camera movement.
No perspective changes.
No text deformation.
No typography replacement.
No random particles dominating the scene.

The two supplied images must appear to be the beginning and ending states of the same continuous cinematic shot.

Target approximately 8 seconds.
Premium technology advertising aesthetic.
Extremely smooth.
Minimal.
Elegant.
Sophisticated.
```

---

# 14. Frame Extraction

After the video is generated:

```text
Google Flow
    ↓
Download MP4
    ↓
Extract frames
    ↓
frames/
 ├── frame-0001.jpg
 ├── frame-0002.jpg
 ├── frame-0003.jpg
 └── ...
```

For the first implementation, a GUI tool such as EZGIF can be used.

For the developer/production workflow, FFmpeg can later automate video-to-frame extraction.

---

# 15. Antigravity Hero Requirement

When the frames are placed in the project, tell Antigravity explicitly:

```text
These JPG files are sequential frames of one cinematic hero animation.

Do not replace them with a CSS animation.
Do not recreate the visual using gradients.
Do not convert the sequence into a normal autoplay video.

Use the supplied JPG sequence as the actual animation source.

Map scroll progress to frame index.

Scrolling down:
frame 1 → frame N

Scrolling up:
frame N → frame 1

Keep the hero section pinned/sticky while the frame sequence plays.

Use requestAnimationFrame or an equivalent high-performance rendering approach.

Preload frames intelligently.
Avoid flickering.
Avoid layout shifts.
Preserve aspect ratio.
Do not crop or stretch the frames.

The animation must be synchronized to scroll position rather than time.

The user should feel as if they are controlling a cinematic video with their scroll.
```

---

# 16. Suggested Asset Structure

```text
public/
└── hero/
    └── frames/
        ├── frame-0001.jpg
        ├── frame-0002.jpg
        ├── frame-0003.jpg
        └── ...
```

Component structure:

```text
components/
└── hero/
    ├── HeroSection
    └── HeroFrameSequence
```

---

# 17. Stitch UI Design Prompt

```text
Design a premium, modern personal AI developer workspace web application.

This is not a generic chatbot.

The product is a multi-AI collaboration platform where multiple AI models can work sequentially as Creator, Reviewer, Critic, Optimizer and Finalizer.

The design must look strong enough for a professional developer portfolio and technical interview showcase.

Create a complete responsive web application design system.

Required screens:

1. Public landing page
2. Login
3. Signup
4. Main dashboard
5. New AI conversation
6. Active AI collaboration conversation
7. Thread/history sidebar
8. Settings
9. Profile
10. Empty state
11. Loading state
12. Error state

Main dashboard:

- Persistent left sidebar for conversations
- New Chat button
- Search threads
- Thread groups such as Today, Yesterday and Previous 7 Days
- Main conversation workspace
- User profile/menu
- Settings
- Responsive mobile navigation

The application must support persistent conversation threads similar to modern AI desktop applications.

Every new conversation creates a new thread.

Previous threads remain reopenable.

The design must clearly distinguish:

- User messages
- AI agent messages
- Provider
- Model
- Agent role
- Agent status
- Final result

Create an elegant collaboration timeline:

Creator → Reviewer → Critic → Optimizer → Finalizer

Include provider/model selectors.

Example:

Creator
[ Gemini ▼ ]
[ Model ▼ ]

Reviewer
[ Qwen ▼ ]
[ Model ▼ ]

Critic
[ NVIDIA ▼ ]
[ Model ▼ ]

Finalizer
[ OpenRouter ▼ ]
[ Model ▼ ]

Support:

Coding
Prompt Engineering
Image Prompt
Video Prompt
Study / Research
General

Visual direction:

- Premium
- Dark-first
- Minimal
- Sophisticated
- Developer-focused
- High contrast
- Excellent typography
- Subtle glass/blur where appropriate
- Restrained gradients
- Subtle AI network motifs
- No excessive neon
- No generic cyberpunk aesthetic
- No unnecessary cards everywhere
- Strong spacing and hierarchy

The landing-page hero must be prepared for a scroll-driven image-sequence animation.

Do NOT design it as a normal static illustration.

The hero visual area will later use a supplied JPG frame sequence.

Hero messaging:

Think. Build. Review. Refine.

Supporting text:

A personal multi-AI workspace where models collaborate to create better results.

Create reusable components and consistent states.

Design desktop, tablet and mobile behavior.

Prioritize usability over decoration.

The final result should look like a real product that a developer could confidently demonstrate during an interview.
```

---

# 18. Antigravity Master Prompt

When the Stitch design is ready:

```text
You are implementing my personal multi-AI developer workspace.

Before changing code, inspect the repository and understand the existing structure.

Do not immediately start coding.

First create an implementation plan covering:

1. Project architecture
2. Frontend structure
3. Backend structure
4. Authentication
5. Thread persistence
6. Message persistence
7. AI provider abstraction
8. Agent orchestration
9. Real-time streaming
10. Hero frame-sequence animation
11. Responsive behavior
12. Error handling
13. Security
14. Performance
15. Deployment

The supplied Stitch design is the visual source of truth.

The supplied hero frame folder is the visual source of truth for the hero animation.

Do not replace the designed UI with a generic AI-generated dashboard.

Do not replace the supplied hero frames with a different visual.

Implement modularly.

The application must support persistent conversation threads.

When the user starts a new chat:

- create a new thread
- preserve the previous thread
- automatically save messages
- show the previous thread in the sidebar
- allow reopening the thread
- restore its conversation context

Do not mix unrelated thread contexts.

Use the relationship:

User → Thread → Messages → Agent Runs → Agent Messages

Support configurable roles:

Creator
Reviewer
Critic
Optimizer
Finalizer

Providers must use a common abstraction so models can be changed without rewriting orchestration.

API keys must never be exposed to the browser.

Implement streaming so the frontend can show agent progress in real time.

For the hero:

The provided JPG frames are sequential frames of a generated cinematic video.

Implement a scroll-controlled frame sequence.

Scrolling down advances frames.
Scrolling up reverses frames.

Keep the hero pinned while the sequence is controlled by scroll.

Use requestAnimationFrame or an equivalent performant mechanism.

Preload intelligently.

Do not crop, stretch or distort frames.

Preserve aspect ratio.

Optimize memory usage.

Support responsive behavior.

Before implementation, explain the proposed architecture and identify assumptions.

Then implement incrementally.

After each major stage, verify the implementation and report what changed.
```

---

# 19. Development Order

Do not build everything in one shot.

```text
PHASE 1
Stitch UI design
        ↓
PHASE 2
Project skeleton
        ↓
PHASE 3
Landing page
        ↓
PHASE 4
Login / authentication
        ↓
PHASE 5
Dashboard shell
        ↓
PHASE 6
Thread system
        ↓
PHASE 7
Chat interface
        ↓
PHASE 8
One AI provider
        ↓
PHASE 9
Multiple providers
        ↓
PHASE 10
Agent orchestration
        ↓
PHASE 11
Real-time streaming
        ↓
PHASE 12
Hero frame animation
        ↓
PHASE 13
Performance optimization
        ↓
PHASE 14
Deployment
```

---

# 20. Important Recommendation

Do not let the coding agent build the entire application blindly in one prompt.

Use:

```text
Stitch
    ↓
UI/UX
    ↓
Markdown specifications
    ↓
Antigravity
    ↓
Implementation
    ↓
Testing
    ↓
Review
    ↓
Iteration
```

Google's current Antigravity platform is designed for agentic development and supports multi-agent workflows, asynchronous workflows, terminal/browser work and artifacts for verification. Google has also moved its community-focused Gemini CLI direction into Antigravity CLI. citeturn0search0turn0search2

Google's current Conductor work also supports persistent Markdown-based specs and plans with Antigravity, which fits this documentation-first project approach. citeturn0search1

---

# 21. Final Hero Direction

Recommended story:

```text
START
Almost-dark AI workspace
        ↓
AI network barely visible
        ↓
Text almost invisible
        ↓
AI system gradually activates
        ↓
Connections appear
        ↓
Dashboard becomes visible
        ↓
Typography becomes clear
        ↓
END
Fully activated AI workspace
```

The animation itself communicates:

**One task → multiple AI minds → collaboration → better result.**

---

## Status

**Document:** `03-product-dashboard-and-hero-blueprint.md`

**Status:** COMPLETE
