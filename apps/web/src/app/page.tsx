import { CreateRoomButton } from '@/components/home/CreateRoomButton';
import { JoinRoomForm } from '@/components/home/JoinRoomForm';
import { SITE_URL } from '@/lib/constants';

// Shown on the page and mirrored into FAQPage JSON-LD so search/answer engines can quote it.
const FAQ = [
  {
    q: 'Is EphemeralChat really end-to-end encrypted?',
    a: 'Yes. Each room gets a random 256-bit AES-GCM key that lives only in the link after the #. Browsers never send that part to a server, so the relay only ever sees ciphertext.',
  },
  {
    q: 'Are messages stored anywhere?',
    a: 'No. There is no database. Messages are relayed live and disappear when you close or refresh the tab.',
  },
  {
    q: 'Do I need an account or an app?',
    a: 'No. It runs in any modern browser. Create a room, share the link, and start chatting.',
  },
  {
    q: 'How many people can join a room?',
    a: 'Two. Rooms are strictly 1-to-1, and a third person is turned away.',
  },
  {
    q: 'Does it work on corporate Wi-Fi or mobile data?',
    a: 'Yes. It uses a standard secure WebSocket relay instead of peer-to-peer connections, so it works on any network that can load a website.',
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'EphemeralChat',
    url: SITE_URL,
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Any (web browser)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Free end-to-end encrypted 1-to-1 browser chat with no accounts and no message storage.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full max-w-md space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">EphemeralChat</h1>
          <p className="mt-2 text-sm text-gray-500">
            End-to-end encrypted private chat. No accounts. Nothing stored.
          </p>
        </header>

        <section>
          <CreateRoomButton />
        </section>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">or</span>
          </div>
        </div>

        <section>
          <JoinRoomForm />
        </section>

        <p className="text-center text-xs text-gray-400">
          Messages are never stored. No account needed. End-to-end encrypted.
        </p>

        <section className="space-y-2 pt-4">
          <h2 className="text-sm font-semibold text-gray-700">FAQ</h2>
          {FAQ.map(({ q, a }) => (
            <details key={q} className="rounded border border-gray-200 px-3 py-2 text-sm">
              <summary className="cursor-pointer font-medium text-gray-800">{q}</summary>
              <p className="mt-2 text-gray-600">{a}</p>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}
