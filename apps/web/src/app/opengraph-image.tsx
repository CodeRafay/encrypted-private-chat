import { ImageResponse } from 'next/og';

// Edge: the Node build of next/og crashes on Windows paths in Next 14.
export const runtime = 'edge';
export const alt = 'EphemeralChat — Encrypted Private Chat, No Sign-up';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#ffffff',
          color: '#111827',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2 }}>EphemeralChat</div>
        <div style={{ fontSize: 44, color: '#374151', marginTop: 12 }}>
          End-to-end encrypted private chat
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 48, fontSize: 30 }}>
          {['No sign-up', 'Nothing stored', '1-to-1 rooms'].map((t) => (
            <div
              key={t}
              style={{
                padding: '10px 24px',
                borderRadius: 999,
                border: '2px solid #e5e7eb',
                color: '#4b5563',
              }}
            >
              {t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', fontSize: 28, color: '#9ca3af' }}>
          encrypted-private-chat.vercel.app
        </div>
      </div>
    ),
    size,
  );
}
