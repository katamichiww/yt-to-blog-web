import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Inkspell — Turn Any YouTube Video into a Blog Post That Sounds Like You',
  description: "Paste a YouTube URL, describe your voice, and let Aira's magic pen transform the transcript into an SEO blog post in your own words.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
