import { LaunchPartnerPlacement } from "@/components/presentation/LaunchPartnerPlacement";
import type { AdminLaunchPartnerContext } from "@/components/presentation/launchPartnerInventory";

type LaunchPartnerPresentedByProps = AdminLaunchPartnerContext;

export function LaunchPartnerPresentedBy(context: LaunchPartnerPresentedByProps) {
  return (
    <div className="launch-partner-presented-block">
      <p className="launch-partner-presented-label">Presented by</p>
      <LaunchPartnerPlacement
        {...context}
        placement="admin_below_qr"
        variant="horizontal"
        visibilityClass="launch-partner-visibility--primary-mobile"
      />
    </div>
  );
}
