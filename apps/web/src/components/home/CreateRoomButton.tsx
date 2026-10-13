'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { newKey } from '@/lib/crypto';
import { generateRoomCode } from '@/lib/roomId';

export function CreateRoomButton() {
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    // Full navigation so the room page mounts with the #key already in location.hash.
    window.location.assign(`/room/${generateRoomCode()}#${newKey()}`);
  };

  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full"
      onClick={handleCreate}
      disabled={loading}
    >
      {loading ? 'Creating…' : 'Create New Room'}
    </Button>
  );
}
