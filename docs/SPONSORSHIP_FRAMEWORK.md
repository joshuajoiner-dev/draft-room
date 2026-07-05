# Sprint 010: Venue Sponsorship Framework

## Objective

Design a future sponsorship framework for JoinDraftPick that adds sports atmosphere and creates revenue opportunities without becoming an advertising network.

This framework should feel like sponsorship inside a real gym, fieldhouse, tournament table, or community sports venue.

## Sponsorship Philosophy

JoinDraftPick sponsorship should be:

- **Tasteful:** Sponsors should feel like part of the room environment, not a takeover.
- **Optional:** Rooms should work fully without sponsor content.
- **Sports-first:** The draft, teams, players, timer, and organizer workflow remain the main event.
- **Never intrusive:** No popups, interstitials, overlays, or interruptions.
- **Quietly branded:** Sponsor presence should be steady and recognizable, not loud.
- **Venue-like:** Think scoreboard ribbon, tournament program, roster footer, or local gym banner.

Hard rules:

- No popups.
- No autoplay video.
- No flashing animation.
- No generic web ads.
- No ad network placements.
- No sponsor content that blocks room setup, joining, drafting, printing, or unlocking.

## Placement Opportunities

| Placement | Ranking | Recommendation |
| --- | --- | --- |
| Organizer Quick Start panel | Avoid | This panel teaches the organizer what to do next. Sponsor content would compete with setup clarity, especially for first-time users. |
| QR Code section | Good | A small venue sponsor mark can work near the join area because players are already being invited into the room. Keep it secondary to the QR code and join link. |
| Scoreboard ribbon | Excellent | Best fit for the sports venue metaphor. A thin ribbon can feel like an arena scoreboard sponsor without disrupting gameplay. |
| Timer panel | Good | A small "presented by" treatment can work if it does not reduce timer readability. The timer must remain dominant. |
| Printable roster footer | Excellent | Strong placement for local sponsors, tournament sponsors, league fundraising, and schools. It feels like a tournament handout or official roster sheet. |
| Waiting screen | Excellent | Natural sponsor opportunity while players gather. Works best as a tasteful venue banner or "tonight's room sponsor" module. |
| Pause / halftime screen | Good | A future pause screen can support sponsor presence because the room is between active moments. Avoid anything that feels like a commercial break. |
| Tournament mode | Excellent | Tournament brackets, schedules, standings, and finals screens are natural sponsor surfaces. This is the strongest long-term sponsorship fit. |

### Placement Notes

**Excellent placements** should be prioritized because they enhance the sports atmosphere:

- Scoreboard ribbon
- Printable roster footer
- Waiting screen
- Tournament mode

**Good placements** can be used carefully:

- QR Code section
- Timer panel
- Pause / halftime screen

**Avoid placements** should remain focused on organizer clarity:

- Organizer Quick Start panel

## Future Data Model

No database migration should be created yet. A future sponsor object could look like this:

```ts
type SponsorPlacement =
  | "scoreboard_ribbon"
  | "qr_section"
  | "timer_panel"
  | "printable_roster_footer"
  | "waiting_screen"
  | "pause_screen"
  | "tournament_mode";

type Sponsor = {
  id: string;
  name: string;
  logo: {
    alt: string;
    url: string;
  } | null;
  tagline: string | null;
  website: string | null;
  campaign_start: string;
  campaign_end: string;
  placement: SponsorPlacement;
  priority: number;
  active: boolean;
};
```

Recommended future fields:

- `id`: Stable sponsor identifier.
- `name`: Public sponsor name.
- `logo`: Sponsor logo asset with accessible alt text.
- `tagline`: Short sponsor line, such as "Proud supporter of youth sports."
- `website`: Optional outbound sponsor URL.
- `campaign_start`: Start timestamp or date.
- `campaign_end`: End timestamp or date.
- `placement`: Approved sponsor location.
- `priority`: Ordering when multiple sponsors are eligible.
- `active`: Operational on/off switch.

Future additions may include:

- `organization_id`
- `league_id`
- `tournament_id`
- `room_id`
- `impression_count`
- `click_count`
- `created_at`
- `updated_at`

Those fields should wait until there is a clear product need.

## React Architecture

Recommended future components:

### `VenueSponsor`

Generic resolver component for a sponsor placement.

Responsibilities:

- Accept a placement key.
- Resolve the active sponsor for that placement.
- Render nothing when no sponsor is active.
- Keep sponsor content secondary.

### `SponsorCard`

Compact card-style sponsor treatment.

Best for:

- Waiting screen
- Pause / halftime screen
- Tournament sponsor blocks

### `SponsorRibbon`

Thin horizontal ribbon.

Best for:

- Scoreboard ribbon
- Tournament header
- Waiting screen header/footer

### `SponsorFooter`

Footer treatment for printable or shareable outputs.

Best for:

- Printable roster footer
- Tournament schedule printouts
- Bracket printouts

### `SponsorLogoMark`

Small logo-only or logo-plus-name element.

Best for:

- QR Code section
- Timer panel
- Tight layout spaces

## Revenue Opportunities

### Local Leagues

Youth and recreational leagues can sell sponsor visibility as part of their normal local fundraising. JoinDraftPick can provide digital and printable sponsor surfaces.

### Parks & Recreation

Municipal recreation programs often work with local partners and seasonal events. Venue sponsorship can help rooms feel official while supporting program funding.

### Schools

Schools can use sponsor placements for booster clubs, athletic departments, school partners, or event-specific fundraising.

### Tournament Sponsors

Tournament mode is the strongest sponsor opportunity. Brackets, schedules, waiting screens, finals rooms, and printable materials can carry tasteful sponsor branding.

### Sporting Goods Companies

Local or regional sports shops can sponsor drafts, tournaments, team selection nights, or league events.

### Physical Therapy Clinics

Sports medicine and physical therapy clinics are natural local sports partners, especially for school and adult recreational leagues.

### Local Restaurants

Restaurants can sponsor post-game gatherings, tournament days, or league nights. Placement should feel like a local venue partner, not a coupon ad.

### League Fundraising

JoinDraftPick can support league fundraising by making sponsorship inventory simple, visible, and connected to real sports events.

## UX Guidelines

The room should always feel like a sporting venue.

Sponsors should enhance authenticity:

- "Presented by"
- "Official local sponsor"
- "Proud supporter of youth sports"
- "Tournament sponsor"
- "Community partner"

Sponsors should not distract:

- No animation that draws attention away from picks or teams.
- No sponsor UI that looks clickable unless it is clearly a sponsor link.
- No sponsor content inside critical organizer decision flows.
- No sponsor content that reduces QR code, timer, team, or player readability.
- No generic ad boxes.

Visual direction:

- Use restrained layouts.
- Prefer ribbons, footers, small logo marks, and program-like sponsor blocks.
- Keep contrast accessible.
- Keep sponsor text short.
- Preserve JoinDraftPick's sports-first hierarchy.

## Recommended Rollout Sequence

1. Document approved sponsor placements.
2. Add static mock sponsor examples in a design-only branch.
3. Validate placement quality on desktop, mobile, and print.
4. Add a small sponsor configuration object, still without database changes.
5. Add database-backed sponsor campaigns only after the UX is proven.
6. Add tournament-specific sponsor surfaces when tournament mode exists.

## Non-Goals

- No advertising network integration.
- No behavioral tracking.
- No popups.
- No autoplay video.
- No dynamic bidding.
- No intrusive sponsor placement.
- No database migration in Sprint 010 architecture.
- No UI implementation in this architecture document.

## Final Recommendation

JoinDraftPick should treat sponsorship as part of the sports venue experience, not as web advertising. The strongest future placements are scoreboard ribbon, printable roster footer, waiting screen, and tournament mode. Organizer setup surfaces should remain focused and mostly sponsor-free.
