import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

const title = 'EphemeralChat — Encrypted Private Chat, No Sign-up';
const description =
  'Free end-to-end encrypted 1-to-1 chat in your browser. No accounts, no app, no message storage. Create a room, share the link, chat privately.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: 'EphemeralChat',
  keywords: [
    'encrypted chat',
    'private chat',
    'end-to-end encrypted chat',
    'anonymous chat',
    'no sign-up chat',
    'disposable chat room',
    'secure messaging',
    'temporary chat',
  ],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: '/', siteName: 'EphemeralChat', title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
