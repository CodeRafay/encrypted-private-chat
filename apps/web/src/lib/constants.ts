export const TIMEOUTS = {
  WS_RECONNECT_DELAYS_MS: [1_000, 2_000, 4_000, 8_000] as const,
  COPY_FEEDBACK_MS: 2_000,
} as const;

export const LIMITS = {
  MAX_MESSAGE_LENGTH: 1_000,
  CHAR_COUNTER_THRESHOLD: 900,
  MAX_ROOM_PEERS: 2,
  ROOM_CODE_LENGTH: 8,
} as const;

export const ROOM_CODE_REGEX = /^[A-Z0-9]{6,10}$/;

export const WS_CLOSE_CODES = {
  REPLACED: 4005,
} as const;
