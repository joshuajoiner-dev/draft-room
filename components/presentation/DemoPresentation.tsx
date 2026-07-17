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
    art: "photo" | "illustration" | "gradient";
    headline: string;
    note: string;
  }
> = {
  leaderboard: {
    eyebrow: "Presented by Community Partner",
    art: "photo",
    headline: "Fuel the Game",
    note: "Youth sports support"
  },
  below_qr: {
    eyebrow: "Official Hydration Partner",
    art: "illustration",
    headline: "Community Recreation Partner",
    note: "Summer camp registration"
  },
  footer: {
    eyebrow: "Tournament Sponsor",
    art: "gradient",
    headline: "Healthy Snack Partner",
    note: "Community education partner"
  }
};

export function DemoPresentation({ placement }: DemoPresentationProps) {
  if (!SHOW_DEMO_PRESENTATION) {
    return <PresentationSlot placement={placement} />;
  }

  const copy = demoCopy[placement];

  return (
    <PresentationSlot active placement={placement}>
      <div className={`presentation-demo presentation-demo-${placement}`} data-art={copy.art}>
        <span>{copy.eyebrow}</span>
        <strong>{copy.headline}</strong>
        <em>{copy.note}</em>
      </div>
    </PresentationSlot>
  );
}
