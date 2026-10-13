export type ConnectionState =
  | 'SIGNALING'
  | 'WAITING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'FAILED'
  | 'ROOM_FULL'
  | 'ROOM_NOT_FOUND'
  | 'MISSING_KEY';

export interface RoomInfo {
  code: string;
}

export interface RoomHookReturn {
  messages: import('./message').Message[];
  connectionState: ConnectionState;
  roomInfo: RoomInfo;
  sendMessage: (text: string) => void;
  shareUrl: string;
}
