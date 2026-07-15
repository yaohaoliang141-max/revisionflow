import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "RevisionFlow",
  description: "Turn messy feedback into a revision plan.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
