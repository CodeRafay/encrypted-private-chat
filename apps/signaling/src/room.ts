import type { Env } from './types';

const MAX_PEERS = 2;
const MAX_MESSAGE_BYTES = 16_384;
const CLOSE_REPLACED = 4005;

// Relays end-to-end encrypted messages between at most 2 sockets.
// The hibernation API (ctx.getWebSockets) is the only state, so nothing is lost on eviction.
export class Room implements DurableObject {
  constructor(
    private ctx: DurableObjectState,
    _env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const cid = new URL(request.url).searchParams.get('cid') ?? '';
    if (!/^[\w-]{1,64}$/.test(cid)) {
      return new Response('Missing or invalid cid', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    // Same tab reconnecting (refresh, network blip, StrictMode remount): replace its old socket.
    for (const old of this.ctx.getWebSockets(cid)) {
      old.close(CLOSE_REPLACED, 'Replaced by newer connection');
    }

    if (this.openSockets().length >= MAX_PEERS) {
      // Untagged, so it never counts as a peer. The client closes it on 'room-full';
      // closing it here, before the 101 is returned, resets the connection in production.
      this.ctx.acceptWebSocket(server);
      server.send(JSON.stringify({ type: 'room-full' }));
      return new Response(null, { status: 101, webSocket: client });
    }

    this.ctx.acceptWebSocket(server, [cid]);
    this.broadcastPresence();
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== 'string' || message.length > MAX_MESSAGE_BYTES) {
      return;
    }
    try {
      if ((JSON.parse(message) as { type?: unknown }).type !== 'msg') {
        return;
      }
    } catch {
      return;
    }
    for (const other of this.openSockets()) {
      if (other !== ws) {
        other.send(message);
      }
    }
  }

  webSocketClose(ws: WebSocket, code: number): void {
    try {
      ws.close(code === 1005 ? 1000 : code, 'Closing');
    } catch {
      // already closed
    }
    this.broadcastPresence();
  }

  webSocketError(): void {
    this.broadcastPresence();
  }

  private openSockets(): WebSocket[] {
    return this.ctx
      .getWebSockets()
      .filter((ws) => ws.readyState === WebSocket.READY_STATE_OPEN && this.ctx.getTags(ws).length > 0);
  }

  private broadcastPresence(): void {
    const sockets = this.openSockets();
    const msg = JSON.stringify({ type: 'presence', peers: sockets.length });
    for (const ws of sockets) {
      ws.send(msg);
    }
  }
}
