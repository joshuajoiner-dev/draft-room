import Link from "next/link";
import { AppFrame } from "@/components/layout/AppFrame";

export default function PublicRoomNotFound() {
  return (
    <AppFrame>
      <section className="card stack">
        <div className="stack-tight">
          <h1>Room not found</h1>
          <p className="body-copy">We couldn&apos;t find that room.</p>
        </div>
        <Link className="button" href="/">
          Back home
        </Link>
      </section>
    </AppFrame>
  );
}
