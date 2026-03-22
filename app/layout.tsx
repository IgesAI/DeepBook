import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DeepBook — AI Audiobooks from Deep Research",
    template: "%s · DeepBook",
  },
  description:
    "Turn any topic into a professional audiobook in minutes. Powered by OpenAI Deep Research and ElevenLabs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="grain min-h-screen antialiased">{children}</body>
    </html>
  );
}
