# Arena Design Direction

This document formalizes the Arena experience — the live room where organizers create teams and players join.

The Arena is not a dashboard. It is a venue.

For product philosophy, see [docs/product/PRODUCT_NORTH_STAR.md](../product/PRODUCT_NORTH_STAR.md). For sponsorship placement rules, see [SPONSORSHIP_FRAMEWORK.md](../SPONSORSHIP_FRAMEWORK.md).

---

## Emotional Objective

The interface should feel like entering a real future gym where an event is about to begin.

Not science fiction. Not enterprise SaaS. Not a spreadsheet. Not an administrative dashboard.

A modern athletic venue.

The Arena should communicate:

| Quality | Meaning |
| --- | --- |
| **Movement** | Something is happening. The room is alive. |
| **Anticipation** | Teams are forming. The activity is close. |
| **Confidence** | The organizer is in control without fighting the software. |
| **Fairness** | Team creation is visible and understandable to everyone present. |
| **Energy** | Restrained athletic atmosphere — not muted utility software. |
| **Organization** | Players, teams, status, and next steps are clear. |
| **Readiness** | The room looks prepared for what comes next. |

Technology quietly supports play. Technology never competes with play.

---

## Desktop Philosophy

On desktop and large screens, the Arena uses a three-column event control layout:

- **Left rail** — Room identity, event details, and status. Context, not action.
- **Center stage** — Primary organizer workflow: live event panel, quick start guide, QR join, player list, import, and Balanced Teams.
- **Right rail** — Complete tools, timer, and reserved presentation slots.

This layout mirrors a venue command position: context on the sides, action in the center, supporting tools within reach but not in the way.

Desktop should feel spacious without feeling empty. White space is breathing room, not unused product surface.

Avoid:

- Dense admin grids that resemble project management software.
- Multi-panel dashboards with equal visual weight on everything.
- Sidebars that compete with the primary workflow for attention.

---

## Mobile Philosophy

Organizers frequently run rooms from a phone or tablet. Mobile is not a degraded desktop view — it is a first-class venue interface.

Mobile priorities:

1. Room code, join link, and QR remain immediately accessible.
2. Player list and import stay usable without horizontal scrolling.
3. Team creation actions remain one tap away.
4. Typography stays large enough to read at arm's length in a gym or classroom.
5. Timer and draft state remain visible during active moments.

The single-column stack on mobile should preserve workflow order: status → join → players → teams → complete tools.

Avoid cramming desktop density into a narrow viewport. Reduce columns, not clarity.

---

## Information Hierarchy

The Arena communicates information in strict priority order:

1. **Live event state** — What is happening right now (status, format, player count).
2. **Next organizer action** — What to do next (quick start guide, primary form).
3. **Join mechanics** — Code, link, QR for player entry.
4. **Player pool** — Who is in the room.
5. **Team creation** — Format selection and generation.
6. **Generated output** — Teams, draft board, print action.
7. **Complete tools** — Gated modes and unlock.
8. **Presentation slots** — Sponsor and venue content, always secondary.

Nothing in levels 7–8 should visually dominate levels 1–4.

During Captain Draft, the draft board elevates to level 1–2 priority. The hierarchy adapts to the active moment without restructuring the entire layout.

---

## Visual Restraint

The Arena aesthetic draws from athletic venues, not consumer apps or SaaS dashboards.

Design tokens in `app/globals.css` define the palette:

- Dark venue background with subtle radial haze
- Scoreboard green for live state
- Arena accent colors used sparingly for emphasis
- Glass-line borders and soft surface layers
- Atkinson Hyperlegible for readability under varied lighting

Restraint rules:

- **One accent per focal area.** Do not rainbow the interface.
- **Motion with purpose.** Transitions clarify state changes; they do not decorate.
- **No gratuitous gradients or glow.** Venue haze is atmospheric, not ornamental.
- **Cards serve grouping, not decoration.** Every card boundary should organize real content.
- **Icons and emoji are functional.** Used in mode labels and status, not as visual filler.

Large typography. Fast loading. Minimal decisions. One obvious next action.

---

## Sponsor Integration

Sponsors belong to the venue — not the workflow.

Presentation slots in `components/presentation/` provide reserved, inactive-by-default surfaces for future sponsor content. When active, sponsor treatments must comply with [SPONSORSHIP_FRAMEWORK.md](../SPONSORSHIP_FRAMEWORK.md).

Approved sponsor forms in the Arena:

- Thin scoreboard ribbons
- Small logo marks near join areas
- Timer "presented by" treatments (timer remains dominant)
- Footer and printable roster sponsor lines
- Waiting screen venue banners

Prohibited in the Arena:

- Sponsor content in the Quick Start guide or primary team-creation forms
- Popups, overlays, interstitials, autoplay, or flashing animation
- Generic ad boxes or ad-network placements
- Any sponsor treatment that reduces QR, timer, player, or team readability

Sponsor copy should sound like a venue, not an ad:

- "Presented by"
- "Official local sponsor"
- "Proud supporter of youth sports"
- "Community partner"

---

## Accessibility

The Arena is used in classrooms, gyms, and outdoor settings with varied lighting and devices.

Requirements:

- Sufficient color contrast on all text, buttons, and live state indicators.
- Readable font sizes at default zoom on mobile and desktop.
- Semantic HTML and ARIA labels on interactive regions (room rails, draft board, presentation slots).
- Screen-reader-only text where visual icons carry meaning.
- Focus states on all interactive elements.
- Sponsor logos require accessible alt text when implemented.
- No information conveyed by color alone.

Accessibility is not a retrofit. New Arena surfaces must meet these standards at creation.

---

## Performance

Organizers do not wait for software while people stand around.

Performance standards:

- Critical room paths must load fast on mobile networks.
- No heavy client-side libraries on join or admin first paint.
- Real-time player list updates must feel immediate.
- Print and team display must render without layout shift.
- Sponsor assets (when added) must be optimized and lazy-loaded outside critical paths.

A slow Arena is a waiting room. That violates the product north star.

---

## Future Evolution

The Arena will grow, but the venue metaphor must hold:

| Future surface | Design constraint |
| --- | --- |
| **Tournament mode** | Brackets and schedules feel like tournament signage, not bracket software. |
| **Projection display** | Large-format read-only view for gym screens; no admin controls. |
| **Waiting screen** | Tasteful venue banner while players gather; not a loading spinner with ads. |
| **Pause / halftime** | Between-moment sponsor surface; not a commercial break. |
| **Organization portal** | Separate from the Arena. Admin complexity does not leak into the room. |

Every future surface passes the Arena design test before shipping.

---

## The Arena Design Test

Before adding or modifying any Arena element, ask:

1. **Would this belong in a premium athletic venue?**
2. **Does it help people begin playing faster?**

If either answer is no, it probably does not belong.

When the two answers conflict — venue authenticity versus speed — choose speed. A beautiful scoreboard that delays team creation is still a delay.

For agent-level design rules, see [AGENTS.md](../../AGENTS.md).
