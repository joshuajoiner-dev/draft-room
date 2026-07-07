import { PresentationSlot } from "@/components/presentation/PresentationSlot";

const SHOW_DEMO_PRESENTATION = true;

type DemoPresentationPlacement = "leaderboard" | "below_qr" | "footer";

type DemoPresentationProps = {
  placement: DemoPresentationPlacement;
};

const demoCopy: Record<
  DemoPresentationPlacement,
  {
    eyebrow: string;
    headline: string;
    note: string;
  }
> = {
  leaderboard: {
    eyebrow: "Presented by Community Partner",
    headline: "Fuel the game",
    note: "Local recreation support"
  },
  below_qr: {
    eyebrow: "Official Hydration Partner",
    headline: "Thanks to our partners",
    note: "Venue presentation"
  },
  footer: {
    eyebrow: "Tournament Partner",
    headline: "Participation begins here",
    note: "Community sports night"
  }
};

export function DemoPresentation({ placement }: DemoPresentationProps) {
  if (!SHOW_DEMO_PRESENTATION) {
    return <PresentationSlot placement={placement} />;
  }

  const copy = demoCopy[placement];

  return (
    <PresentationSlot active placement={placement}>
      <div className={`presentation-demo presentation-demo-${placement}`}>
        <span>{copy.eyebrow}</span>
        <strong>{copy.headline}</strong>
        <em>{copy.note}</em>
      </div>
    </PresentationSlot>
  );
}
