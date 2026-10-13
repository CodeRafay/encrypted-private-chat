'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LIMITS, TIMEOUTS, WS_CLOSE_CODES } from '@/lib/constants';
import { decrypt, encrypt, importKey } from '@/lib/crypto';
import { isValidRoomCode } from '@/lib/roomId';
import type { Message } from '@/types/message';
import type { ConnectionState, RoomHookReturn } from '@/types/room';
import type { ChatPayload, ServerMessage } from '@/types/signaling';

function isChatPayload(value: unknown): value is ChatPayload {
  const v = value as ChatPayload | null;
  return (
    typeof v?.id === 'string' &&
    typeof v.text === 'string' &&
    v.text.length <= LIMITS.MAX_MESSAGE_LENGTH &&
    typeof v.timestamp === 'number'
  );
}

/** Per-tab id that survives refresh, so the server replaces our old socket instead of counting it. */
function tabId(): string {
  try {
    let id = sessionStorage.getItem('cid');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('cid', id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function roomSocketUrl(code: string): string {
  const base = (process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'ws://localhost:8787').replace(/\/$/, '').replace(/^http/, 'ws');
  return `${base}/ws/${code}?cid=${tabId()}`;
}

export function useRoom(code: string): RoomHookReturn {
  const normalizedCode = code.toUpperCase();
  const invalidCode = !isValidRoomCode(normalizedCode);

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    invalidCode ? 'ROOM_NOT_FOUND' : 'SIGNALING',
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  useEffect(() => {
    if (invalidCode) {
      return;
    }

    let stopped = false;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      const ws = new WebSocket(roomSocketUrl(normalizedCode));
      wsRef.current = ws;

      ws.onmessage = async (event: MessageEvent) => {
        let msg: ServerMessage;
        try {
          msg = JSON.parse(event.data as string) as ServerMessage;
        } catch {
          return;
        }
        if (msg.type === 'presence') {
          retry = 0;
          setConnectionState(msg.peers >= LIMITS.MAX_ROOM_PEERS ? 'CONNECTED' : 'WAITING');
        } else if (msg.type === 'room-full') {
          setConnectionState('ROOM_FULL');
        } else if (msg.type === 'msg' && keyRef.current) {
          const payload = await decrypt(keyRef.current, msg);
          if (isChatPayload(payload)) {
            appendMessage({ ...payload, sender: 'peer' });
          }
        }
      };

      ws.onclose = (event: CloseEvent) => {
        if (stopped) {
          return;
        }
        if (event.code === WS_CLOSE_CODES.ROOM_FULL) {
          setConnectionState('ROOM_FULL');
          return;
        }
        if (event.code === WS_CLOSE_CODES.REPLACED) {
          // This room was opened again in a duplicate of this tab.
          setConnectionState('FAILED');
          return;
        }
        setConnectionState('RECONNECTING');
        const delays = TIMEOUTS.WS_RECONNECT_DELAYS_MS;
        timer = setTimeout(connect, delays[Math.min(retry++, delays.length - 1)]);
      };
    };

    importKey(window.location.hash.slice(1))
      .then((key) => {
        if (stopped) {
          return;
        }
        keyRef.current = key;
        connect();
      })
      .catch(() => setConnectionState('MISSING_KEY'));

    return () => {
      stopped = true;
      clearTimeout(timer);
      wsRef.current?.close(1000, 'Client leaving');
      wsRef.current = null;
    };
  }, [normalizedCode, invalidCode, appendMessage]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const ws = wsRef.current;
      const key = keyRef.current;
      if (!trimmed || trimmed.length > LIMITS.MAX_MESSAGE_LENGTH || !key || ws?.readyState !== WebSocket.OPEN) {
        return;
      }
      const payload: ChatPayload = { id: crypto.randomUUID(), text: trimmed, timestamp: Date.now() };
      ws.send(JSON.stringify({ type: 'msg', ...(await encrypt(key, payload)) }));
      appendMessage({ ...payload, sender: 'self' });
    },
    [appendMessage],
  );

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return {
    messages,
    connectionState,
    roomInfo: { code: normalizedCode },
    sendMessage,
    shareUrl,
  };
}
