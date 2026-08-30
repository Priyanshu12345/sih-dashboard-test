import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Nodify - AI Email Intelligence Dashboard',
  description: 'AI Email Intelligence Dashboard to organize, prioritize, and summarize emails with real-time sync.',
  openGraph: {
    title: 'Nodify - AI Email Intelligence Dashboard',
    description: 'AI Email Intelligence Dashboard to organize, prioritize, and summarize emails with real-time sync.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nodify - AI Email Intelligence Dashboard',
    description: 'AI Email Intelligence Dashboard to organize, prioritize, and summarize emails with real-time sync.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
