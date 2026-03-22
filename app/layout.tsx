import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DeepBook: Audiobooks on Any Topic",
    template: "%s · DeepBook",
  },
  description:
    "Turn any subject into a fully researched, professionally narrated audiobook. Just enter a topic and listen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
