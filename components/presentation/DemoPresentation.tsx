import { PresentationSlot } from "@/components/presentation/PresentationSlot";

const SHOW_DEMO_PRESENTATION = false;

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
    tone: "field" | "clinic" | "school";
  }
> = {
  leaderboard: {
    eyebrow: "Community Recreation",
    art: "photo",
    headline: "Fuel the Game",
    note: "Live Event Partner",
    tone: "field"
  },
  below_qr: {
    eyebrow: "Sports Medicine",
    art: "illustration",
    headline: "Hydration Partner",
    note: "Hydration Partner",
    tone: "clinic"
  },
  footer: {
    eyebrow: "After School Programs",
    art: "gradient",
    headline: "Healthy Snacks",
    note: "Fitness Center",
    tone: "school"
  }
};

export function DemoPresentation({ placement }: DemoPresentationProps) {
  if (!SHOW_DEMO_PRESENTATION) {
    return <PresentationSlot placement={placement} />;
  }

  const copy = demoCopy[placement];

  return (
    <PresentationSlot active placement={placement}>
      <div className={`presentation-demo presentation-demo-${placement}`} data-art={copy.art} data-tone={copy.tone}>
        <span>{copy.eyebrow}</span>
        <strong>{copy.headline}</strong>
        <em>{copy.note}</em>
      </div>
    </PresentationSlot>
  );
}
