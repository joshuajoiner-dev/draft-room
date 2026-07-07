import Link from "next/link";

type AppFrameProps = {
  children: React.ReactNode;
  variant?: "default" | "wide";
};

export function AppFrame({ children, variant = "default" }: AppFrameProps) {
  const mainClassName = variant === "wide" ? "app-main app-main-wide" : "app-main";

  return (
    <div className="app-shell">
      <main className={mainClassName}>
        <header className="top-bar">
          <Link className="brand" href="/">
            Draft Room
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
