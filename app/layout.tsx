import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PFP Assistant",
  description: "Preferred Freelancer Program rules — ask what to do",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
