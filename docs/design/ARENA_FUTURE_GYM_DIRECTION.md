# Arena Direction — The Real Future Gym

This document formalizes Arena design direction for exploration and evaluation.

It is not a complete implementation specification. For agent operating rules, see [AGENTS.md](../../AGENTS.md). For sponsorship placement detail, see [SPONSORSHIP_FRAMEWORK.md](../SPONSORSHIP_FRAMEWORK.md).

---

## Status

**Design direction approved for exploration.**

Not yet a complete implementation specification.

The current branch may contain experimental Arena and event-control layout work (e.g., court-grid evaluation). Treat that work as exploratory until separately approved for production.

---

## North Star

JoinDraftPick should feel like entering a real future gym where people are gathering and an event is about to begin.

The environment should feel advanced because it removes friction, presents information clearly, and helps the organizer act confidently.

It should not depend on decorative science-fiction tropes.

Technology quietly supports play. Technology never competes with play.

---

## Product Test

Every Arena element should answer both questions:

1. Would this feel natural in a premium modern athletic venue?
2. Does it help people begin playing faster or understand what happens next?

If the answer to either question is no, reconsider the element.

When the two answers conflict, choose speed. A beautiful treatment that delays team creation is still a delay.

---

## Spatial Hierarchy

Intended conceptual priority — not a prescription for final component arrangement. Inspect the existing implementation in `app/room/[roomId]/admin/page.tsx` and `components/room/` before rearranging.

1. **Event or room identity** — Name, code, live status.
2. **Participant readiness** — Who is in the room, who is missing.
3. **Primary start action** — The one obvious next step for the organizer.
4. **Draft mode selection or active draft controls** — Balanced Random, Quick Random, or Captain Draft.
5. **Generated teams or draft state** — Output the room exists to produce.
6. **Secondary utilities** — Timer, print, view teams, Complete unlock.
7. **Venue-native sponsor inventory** — Presentation slots, always subordinate.

Nothing at levels 6–7 should visually dominate levels 1–4.

During Captain Draft, the draft board elevates within levels 4–5. The hierarchy adapts to the active moment without becoming a different product.

---

## Desktop Opportunity

The desktop Arena should use available space intentionally rather than merely stretching the mobile interface.

It may behave like an event-control environment while remaining simple and task-focused. The current experimental layout uses a three-column `event-control-layout`: context rails and a central action stage.

Avoid turning it into an administrative dashboard:

- No equal-weight panels competing for attention.
- No dense data grids resembling project management software.
- No sidebar content that interrupts the primary workflow.

Desktop spaciousness is breathing room for clarity, not surface area for features.

---

## Mobile Principle

Mobile remains an operational interface, not a reduced advertisement canvas.

Preserve:

- Fast joining (code, link, QR immediately accessible)
- Readable participant state
- Obvious primary actions
- Thumb-accessible controls
- Clear draft progress

Sponsor treatment must become **more restrained** as space decreases. If a placement works on desktop, it is not automatically approved for mobile.

---

## Sponsor ROI Without Product Harm

These principles govern future sponsorship inventory:

- Highest-value sponsorship should be highly visible but operationally passive.
- Venue-native presentation is preferred over interruptive impressions.
- Recurring brand presence may be more valuable than one-time interruptions.
- Sponsor inventory should be intentionally tiered.
- Visibility must not reduce completion speed.
- Primary workflows always retain visual priority.
- Sponsor placement must be testable and measurable.
- The interface must remain credible even when no sponsor is present.

**Evaluation candidates** — not automatically approved components:

| Candidate | Notes |
| --- | --- |
| Arena naming partner | Room-level venue identity; must not replace event name. |
| Scoreboard partner | Thin ribbon; strongest venue metaphor. |
| Restrained header ribbon | Above or below primary event header. |
| Sidewall or courtside ribbon | Peripheral LED-style treatment on wide layouts. |
| Waiting-state presentation | While participants gather; passive only. |
| Draft-completion presentation | After teams are finalized; not during active draft. |
| Printable team-sheet partner | Roster footer on print output. |
| Event recap or results partner | Post-activity; future surface. |

Canonical placement rankings and hard rules: [SPONSORSHIP_FRAMEWORK.md](../SPONSORSHIP_FRAMEWORK.md).

---

## Atmosphere

The Arena should convey:

- Anticipation
- Movement
- Confidence
- Fairness
- Preparedness
- Live-event energy

Avoid:

- Casino energy
- Game-show clutter
- Sports-betting visual language
- Excessive animation
- Blinking advertising
- Broadcast graphics that overwhelm the organizer
- Faux complexity

"Future gym" means the venue feels ready and modern — not decorated like a theme park.

Current atmosphere tokens and treatments live in `app/globals.css` (`--venue-haze`, `--glass-line`, scoreboard colors, restrained radial gradients). Extend these; do not stack competing effects.

---

## Accessibility and Performance

The future-gym concept must not compromise:

- Contrast (WCAG-aware text and interactive elements)
- Keyboard access (focus states on all controls)
- Reduced-motion preferences (respect `prefers-reduced-motion` when adding animation)
- Readable type (Atkinson Hyperlegible; large enough for gym/classroom use)
- Small-screen usability (320px minimum width supported)
- Load performance (no heavy assets on critical join/admin paths)
- Clear system status (room state, draft progress, errors)
- Error recovery (actionable messages, no dead ends)

Accessibility is required at creation, not deferred to a polish pass.

---

## Evaluation Questions

Use this checklist when reviewing Arena changes:

- [ ] Can a first-time organizer identify the next action immediately?
- [ ] Can returning organizers start faster?
- [ ] Does the desktop layout make meaningful use of space?
- [ ] Does the experience feel athletic without becoming decorative?
- [ ] Are teams and participants more prominent than sponsors?
- [ ] Can sponsor inventory be removed without breaking the composition?
- [ ] Does mobile remain fast and legible?
- [ ] Does the interface still feel trustworthy during errors or empty states?

---

## Next Implementation Step

The next design-development session should select **one measurable Arena improvement** and produce either:

- one completed feature, or
- one implementation-ready specification

**Recommended first candidate:** Desktop Arena hierarchy and court-grid evaluation.

Do not implement that redesign in a documentation-only session.

For product philosophy, see [docs/product/PRODUCT_NORTH_STAR.md](../product/PRODUCT_NORTH_STAR.md) and [docs/VISION_2027.md](../VISION_2027.md).
