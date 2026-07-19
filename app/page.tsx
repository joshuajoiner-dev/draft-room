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
              Organize teams in under one minute for classes, camps, leagues, and community events.
            </p>
          </div>

          <div>
            <Link className="button" href="/room/new">
              Create Teams
            </Link>
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
