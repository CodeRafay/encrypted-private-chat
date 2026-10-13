import type { Metadata } from 'next';
import { ChatBox } from '@/components/room/ChatBox';

// Room links are private; keep them out of search indexes.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RoomPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  return (
    <main className="flex h-screen flex-col">
      <ChatBox code={code} />
    </main>
  );
}
