import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draft Room",
  description: "Create a live team room fast."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8XR815YK3M"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-8XR815YK3M');
`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
