import Image from "next/image";
import {
  ENABLE_LAUNCH_PARTNER_ARTWORK,
  launchPartners,
  type LaunchPartnerPlacementKey
} from "@/components/presentation/launchPartners";
import { getLaunchPartnerForPlacement, type AdminLaunchPartnerContext } from "@/components/presentation/launchPartnerInventory";

type LaunchPartnerPlacementProps = AdminLaunchPartnerContext & {
  placement: LaunchPartnerPlacementKey;
  variant: "square" | "horizontal" | "compact" | "ribbon" | "open";
  visibilityClass?: string;
};

function LaunchPartnerOpenSignage() {
  return (
    <div aria-label="Launch partner sponsorship opportunity" className="launch-partner-open-signage">
      <p className="launch-partner-open-label">Launch Partner</p>
      <strong className="launch-partner-open-title">Your Organization Here</strong>
      <p className="launch-partner-open-tagline">Supporting Teams • Schools • Recreation</p>
    </div>
  );
}

export function LaunchPartnerPlacement({
  placement,
  variant,
  visibilityClass,
  roomId,
  playerCount,
  teamCount
}: LaunchPartnerPlacementProps) {
  if (!ENABLE_LAUNCH_PARTNER_ARTWORK) {
    return null;
  }

  const partnerKey = getLaunchPartnerForPlacement({ roomId, playerCount, teamCount }, placement);

  if (!partnerKey) {
    return null;
  }

  const partner = launchPartners[partnerKey];

  if (!partner?.active) {
    return null;
  }

  const slotClassName = [
    "launch-partner-slot",
    `launch-partner-slot--${variant}`,
    `launch-partner-slot--${placement.replace(/_/g, "-")}`,
    visibilityClass
  ]
    .filter(Boolean)
    .join(" ");

  if (partnerKey === "launch-partner-open") {
    return (
      <aside
        className={slotClassName}
        data-placement-key={placement}
        data-sponsor-key={partner.key}
      >
        <LaunchPartnerOpenSignage />
      </aside>
    );
  }

  if (!partner.imageSrc) {
    return null;
  }

  const image = (
    <Image
      alt={partner.alt}
      className={`launch-partner-art launch-partner-art--${variant}`}
      height={94}
      priority={placement === "admin_below_qr"}
      src={partner.imageSrc}
      unoptimized
      width={1024}
    />
  );

  return (
    <aside
      aria-label={partner.alt}
      className={slotClassName}
      data-placement-key={placement}
      data-sponsor-key={partner.key}
    >
      {partner.href ? (
        <a
          className="launch-partner-link"
          href={partner.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {image}
        </a>
      ) : (
        image
      )}
    </aside>
  );
}
