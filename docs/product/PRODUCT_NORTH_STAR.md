# Product North Star

This document describes why JoinDraftPick exists.

It is founder philosophy — not marketing copy. It should change rarely. When engineering tradeoffs arise, return here.

For sprint-level build plans, see [ROADMAP.md](../../ROADMAP.md). For enduring vision language, see [VISION_2027.md](../VISION_2027.md).

---

## Mission

Help people spend less time organizing and more time participating.

---

## Vision

JoinDraftPick becomes the easiest way in the world to organize people into activities.

Not because it has the most features. Because it removes the most friction.

Participation begins sooner. Communities spend more time together. That is success.

---

## Audience

JoinDraftPick serves people who organize group activities and lose time picking teams:

- **Teachers** dividing classes for projects, labs, or games.
- **Coaches** running practice groups, scrimmages, or tryouts.
- **Recreation leaders** managing camps, leagues, and community programs.
- **Event organizers** sorting participants for tournaments, clubs, and gatherings.

Players are participants, not customers. They join by name. They do not need accounts, licenses, or payment.

Organizers are the customer. One organizer, one device, one minute.

---

## Long-Term Direction

JoinDraftPick will grow through deliberate, measured expansion:

1. **Stronger rooms** — faster setup, clearer flows, better team tools.
2. **Honest measurement** — time-to-participation, format usage, device context.
3. **Tasteful sponsorship** — venue-style revenue that supports participation.
4. **Organization licensing** — district and league tools when real demand exists.
5. **Tournament mode** — brackets, schedules, and standings as a natural venue extension.

Growth follows listening, not speculation. See Sprint 013 (Listen First) in [ROADMAP.md](../../ROADMAP.md).

We will not become a feature marketplace, an ad network, or enterprise software dressed in sports colors.

---

## What Problems We Solve

- **Team selection takes too long.** Manual picking, awkward counting, and improvised methods waste activity time.
- **Organizers need one device, not a system.** A phone or laptop should be enough to run the entire room.
- **Players need zero setup.** Join by name. See teams. Participate.
- **Groups need fairness without complexity.** Balanced teams, random splits, and captain drafts cover most real-world needs.
- **Recovery should be simple.** Complete unlock works through email when a browser is cleared or a device changes.

---

## What Problems We Intentionally Do Not Solve

- **Player identity and authentication.** Players are names in a room, not user accounts.
- **Skill ratings and advanced balancing.** Balanced Teams equalizes team size, not player ability.
- **League management platforms.** We organize teams for an activity — we do not run seasons, standings, or registration.
- **Social networks or community feeds.** The product is a room, not a platform.
- **Advertising networks.** Sponsorship is venue signage, not programmatic ads.
- **Enterprise admin complexity in v1.** Organization portals and seat management are future work, reserved in architecture but not shipped prematurely.

Knowing what we refuse to build is as important as knowing what we build.

---

## Principles Over Features

Features are tools. Principles are constraints.

Every feature proposal should pass these filters before engineering begins:

| Principle | Question |
| --- | --- |
| Participation speed | Does this help people begin playing sooner? |
| Simplicity | Can an organizer use this on first encounter without instructions? |
| One device | Does this work from a single phone or laptop? |
| Calm confidence | Does this feel like a ready venue, not a product demo? |
| Software disappears | Does the activity remain the focus? |

If a feature adds capability but slows participation, it fails — regardless of how impressive it looks.

We ship small. We measure honestly. We improve continuously. Real users teach us what matters.

---

## More Play. Less Waiting.

This is the internal shorthand for everything above.

Organizers come to JoinDraftPick because an activity is about to begin. Students are waiting. Practice time is limited. A tournament bracket needs to start. The clock is always running somewhere.

Our success metric is **not** time spent inside the app.

Our success metric is **how quickly people begin participating**.

Every screen, every default, every engineering decision should reduce the gap between "I need teams" and "teams are ready."

- A homepage visitor should understand what JoinDraftPick does within five seconds.
- A first-time organizer should create teams in under one minute.
- A player should join and see their name in the room without friction.
- A sponsor placement should never delay any of the above.

When two implementations are equally correct, choose the one that gets people playing faster.

---

## Why This Philosophy Matters for Engineering

Engineering decisions compound. A small friction point in room setup affects thousands of organizers. A sponsor popup that saves a millisecond of load time costs minutes of real activity time across every room it interrupts.

This philosophy should influence:

- **Default paths.** Balanced Teams is free and prominent because most organizers need it first.
- **Feature gating.** Complete features unlock capability, not basic participation.
- **UI density.** The Arena shows what matters for the current moment — not everything the product can do.
- **Performance budgets.** Slow loads are organizational delays.
- **Scope discipline.** Unrelated improvements in a PR are organizational delays for reviewers.
- **Sponsor restraint.** Revenue that interrupts play destroys the value that makes sponsorship worth offering.

Build deliberately. Launch simply. Measure honestly. Improve continuously.

Participation begins here.

For agent-level operating rules, see [AGENTS.md](../../AGENTS.md).
For Arena design standards, see [docs/design/ARENA_DESIGN_DIRECTION.md](../design/ARENA_DESIGN_DIRECTION.md).
