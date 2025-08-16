export const metadata = {
  title: "AI Meeting Notes – Day 1",
  description: "Upload transcript, enter prompt, save to localStorage.",
};

import "./globals.css";

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
