'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isValidRoomCode, normalizeRoomCode } from '@/lib/roomId';

/** Accepts a full room link or "CODE#KEY"; returns the room path or null. */
export function parseRoomLink(input: string): string | null {
  const match = /(?:\/room\/)?([A-Za-z0-9]{6,10})\/?#([A-Za-z0-9_-]+)\s*$/.exec(input.trim());
  if (!match?.[1] || !match[2]) {
    return null;
  }
  const code = normalizeRoomCode(match[1]);
  return isValidRoomCode(code) ? `/room/${code}#${match[2]}` : null;
}

export function JoinRoomForm() {
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const path = parseRoomLink(link);
    if (!path) {
      setError('Paste the full room link you were sent (it includes a # key).');
      return;
    }
    window.location.assign(path);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex-1">
        <Input
          label="Room link"
          placeholder="https://…/room/X7K9P2AB#…"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setError('');
          }}
          error={error}
          autoComplete="off"
        />
      </div>
      <Button type="submit" variant="secondary" size="lg" className="md:shrink-0">
        Join Room
      </Button>
    </form>
  );
}
