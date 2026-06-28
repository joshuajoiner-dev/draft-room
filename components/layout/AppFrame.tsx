import Link from "next/link";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <main className="app-main">
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
