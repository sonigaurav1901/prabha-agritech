import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRABHA Agritech — Rising Sun of Agriculture",
  description: "Expert consulting in mushroom farming, hydroponics, honey farming, agri-technology and farmer training.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
