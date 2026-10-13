'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/Button';
import { ConnectionStatus } from './ConnectionStatus';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { RoomHeader } from './RoomHeader';

interface ChatBoxProps {
  code: string;
}

export function ChatBox({ code }: ChatBoxProps) {
  const { messages, connectionState, roomInfo, sendMessage } = useRoom(code);
  const isConnected = connectionState === 'CONNECTED';
  const showOverlay = !isConnected && !isTerminalError(connectionState);

  if (connectionState === 'ROOM_NOT_FOUND') {
    return (
      <ErrorPanel
        title="Room Not Found"
        description="This room doesn't exist or has expired."
        actions={
          <>
            <Link href="/">
              <Button variant="secondary">Go Home</Button>
            </Link>
            <Link href="/">
              <Button variant="primary">Create New Room</Button>
            </Link>
          </>
        }
      />
    );
  }

  if (connectionState === 'ROOM_FULL') {
    return (
      <ErrorPanel
        title="Room Full"
        description="This room already has 2 users."
        actions={
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        }
      />
    );
  }

  if (connectionState === 'MISSING_KEY') {
    return (
      <ErrorPanel
        title="Incomplete Link"
        description="This link is missing its encryption key. Ask for the full room link (the part after # is required)."
        actions={
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        }
      />
    );
  }

  if (connectionState === 'FAILED') {
    return (
      <ErrorPanel
        title="Connection Failed"
        description="This room was opened in another tab. Close one of them and reload."
        actions={
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      <RoomHeader
        code={roomInfo.code}
        connectionState={connectionState}
      />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
      {showOverlay ? (
        <div className="absolute inset-0 top-14 flex items-center justify-center bg-white/80">
          <ConnectionStatus state={connectionState} />
        </div>
      ) : null}
    </div>
  );
}

function isTerminalError(state: string): boolean {
  return state === 'ROOM_NOT_FOUND' || state === 'ROOM_FULL' || state === 'MISSING_KEY' || state === 'FAILED';
}

function ErrorPanel({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="max-w-md text-gray-600">{description}</p>
      <div className="flex flex-wrap justify-center gap-3">{actions}</div>
    </main>
  );
}
