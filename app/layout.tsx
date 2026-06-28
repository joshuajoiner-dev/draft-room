import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draft Room",
  description: "Create a live team room fast."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
