import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RankHub - Universal Ranking & Leaderboard Platform",
  description:
    "Sistem papan peringkat universal modular untuk lelang antrean bot subsecond, turnamen, dan skor real-time.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#ECE7D5] min-h-screen font-sans text-gray-800 antialiased flex flex-col justify-start">
        {children}
      </body>
    </html>
  );
}
