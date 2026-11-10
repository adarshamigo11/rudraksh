import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About us' };

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="section-title mb-6 text-center">About {s.storeName}</h1>
      <div className="desc space-y-4 text-lg">
        {s.aboutText.split(/\n\s*\n/).map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
      </div>
    </div>
  );
}
