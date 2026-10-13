'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TIMEOUTS } from '@/lib/constants';
import type { ConnectionState } from '@/types/room';
import { ConnectionStatus } from './ConnectionStatus';

interface RoomHeaderProps {
  code: string;
  connectionState: ConnectionState;
}

export function RoomHeader({ code, connectionState }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK_MS);
  };

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
      <Link href="/" className="text-sm text-gray-600 hover:text-gray-900" aria-label="Back to home">
        ← Home
      </Link>
      <span className="font-mono text-sm font-semibold text-gray-900">Room: {code}</span>
      <Button variant="secondary" size="sm" onClick={handleCopy}>
        {copied ? '✓ Copied!' : '📋 Copy Link'}
      </Button>
      <div className="ml-auto">
        <ConnectionStatus state={connectionState} />
      </div>
    </header>
  );
}

