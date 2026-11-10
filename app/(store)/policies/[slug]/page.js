import { notFound } from 'next/navigation';
import { getSettings } from '@/lib/settings';
import { getPolicy } from '@/lib/policies';
import { renderDescription } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const p = getPolicy(params.slug, await getSettings());
  return p ? { title: p.title } : {};
}

export default async function PolicyPage({ params }) {
  const s = await getSettings();
  const p = getPolicy(params.slug, s);
  if (!p) notFound();
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="section-title mb-6">{p.title}</h1>
      <div className="desc" dangerouslySetInnerHTML={{ __html: renderDescription(p.body) }} />
    </div>
  );
}
