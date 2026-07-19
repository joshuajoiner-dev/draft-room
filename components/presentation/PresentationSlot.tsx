import type { ReactNode } from "react";

type PresentationPlacement =
  | "leaderboard"
  | "sidebar"
  | "below_join_link"
  | "below_qr"
  | "footer";

type PresentationSlotProps = {
  active?: boolean;
  children?: ReactNode;
  className?: string;
  placement: PresentationPlacement;
};

function classNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PresentationSlot({
  active = false,
  children,
  className,
  placement,
}: PresentationSlotProps) {
  const slotClassName = classNames(
    "presentation-slot",
    `presentation-slot-${placement}`,
    active ? "presentation-slot-active" : undefined,
    className,
  );

  if (!active || !children) {
    return null;
  }

  return (
    <section aria-label="Venue partner" className={slotClassName} data-placement={placement}>
      {children}
    </section>
  );
}
