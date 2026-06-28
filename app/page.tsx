import Link from "next/link";
import { AppFrame } from "@/components/layout/AppFrame";

export default function HomePage() {
  return (
    <AppFrame>
      <section className="hero">
        <div className="stack">
          <div className="stack-tight">
            <h1 className="title">Teams, fast.</h1>
            <p className="body-copy">
              Create a live room, let players join, and keep everyone in one simple pool.
            </p>
          </div>

          <div>
            <Link className="button" href="/room/new">
              Create Room
            </Link>
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
