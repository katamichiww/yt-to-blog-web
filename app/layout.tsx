import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YT to Blog — Turn Any YouTube Video into an SEO Blog Post',
  description: 'Paste a YouTube URL, get the transcript, then generate a polished SEO-optimised blog post in one click.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
