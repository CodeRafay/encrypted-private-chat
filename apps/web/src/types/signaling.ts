import type { Encrypted } from '@/lib/crypto';

export interface PresenceMessage {
  type: 'presence';
  peers: number;
}

export interface RoomFullMessage {
  type: 'room-full';
}

/** Relayed verbatim by the server; only the two peers can decrypt it. */
export interface EncryptedChatMessage extends Encrypted {
  type: 'msg';
}

export type ServerMessage = PresenceMessage | RoomFullMessage | EncryptedChatMessage;

/** Plaintext inside an EncryptedChatMessage. */
export interface ChatPayload {
  id: string;
  text: string;
  timestamp: number;
}
