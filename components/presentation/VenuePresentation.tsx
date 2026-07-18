import { PresentationSlot } from "@/components/presentation/PresentationSlot";
import { ENABLE_VENUE_SPONSORS, venueSponsors, type VenueSponsorPlacement } from "@/components/presentation/venueSponsors";
import { isVenueSponsorVisible, type VenueArenaContext } from "@/components/presentation/venueSponsorVisibility";

type VenuePresentationProps = {
  placement: VenueSponsorPlacement;
  variant?: "ribbon" | "mark" | "footer";
  context?: VenueArenaContext;
};

function VenueSponsorRibbon({ label, name, tagline }: { label: string; name: string; tagline?: string }) {
  return (
    <div className="venue-sponsor venue-sponsor-ribbon">
      <span className="venue-sponsor-label">{label}</span>
      <strong className="venue-sponsor-name">{name}</strong>
      {tagline ? <span className="venue-sponsor-tagline">{tagline}</span> : null}
    </div>
  );
}

function VenueSponsorMark({ label, name }: { label: string; name: string }) {
  return (
    <div className="venue-sponsor venue-sponsor-mark">
      <span className="venue-sponsor-label">{label}</span>
      <strong className="venue-sponsor-name">{name}</strong>
    </div>
  );
}

function VenueSponsorFooter({ label, name, tagline }: { label: string; name: string; tagline?: string }) {
  return (
    <div className="venue-sponsor venue-sponsor-footer">
      <span className="venue-sponsor-label">{label}</span>
      <strong className="venue-sponsor-name">{name}</strong>
      {tagline ? <span className="venue-sponsor-tagline">{tagline}</span> : null}
    </div>
  );
}

export function VenuePresentation({ placement, variant, context }: VenuePresentationProps) {
  if (!ENABLE_VENUE_SPONSORS) {
    return null;
  }

  const sponsor = venueSponsors[placement];

  if (!sponsor) {
    return null;
  }

  if (context && !isVenueSponsorVisible(placement, context)) {
    return null;
  }

  const resolvedVariant =
    variant ??
    (placement === "below_qr" || placement === "timer_panel" ? "mark" : placement === "footer" || placement === "printable_roster_footer" ? "footer" : "ribbon");

  const content =
    resolvedVariant === "mark" ? (
      <VenueSponsorMark label={sponsor.label} name={sponsor.name} />
    ) : resolvedVariant === "footer" ? (
      <VenueSponsorFooter label={sponsor.label} name={sponsor.name} tagline={sponsor.tagline} />
    ) : (
      <VenueSponsorRibbon label={sponsor.label} name={sponsor.name} tagline={sponsor.tagline} />
    );

  if (placement === "printable_roster_footer" || placement === "waiting_screen" || placement === "timer_panel") {
    return content;
  }

  const slotPlacement =
    placement === "leaderboard" ? "leaderboard" : placement === "below_qr" ? "below_qr" : "footer";

  return (
    <PresentationSlot active placement={slotPlacement}>
      {content}
    </PresentationSlot>
  );
}
